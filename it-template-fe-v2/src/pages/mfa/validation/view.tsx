import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// auth & hooks
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import { paths } from 'src/pages/paths';
import { PATH_AFTER_LOGIN } from 'src/config-global';
// components
import { toast } from 'react-toastify';
import FormProvider, { RHFCode } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/components/router-link';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import packageInfo from '../../../../package.json';

// ----------------------------------------------------------------------

const MFA_VALIDATION_STORAGE_KEY = 'mfa_validation';
const MFA_VALIDATION_OTP_COOLDOWN_END_KEY = 'mfa_validation_otp_cooldown_end';
const OTP_COOLDOWN_SECONDS = 120;

function getStoredOtpState(): { otpSent: boolean; resendCooldown: number } {
  try {
    const endStr = sessionStorage.getItem(MFA_VALIDATION_OTP_COOLDOWN_END_KEY);
    if (!endStr) return { otpSent: false, resendCooldown: 0 };
    const cooldownEndsAt = Number(endStr);
    const now = Date.now();
    if (cooldownEndsAt <= now) return { otpSent: false, resendCooldown: 0 };
    const remaining = Math.ceil((cooldownEndsAt - now) / 1000);
    return { otpSent: true, resendCooldown: Math.max(0, remaining) };
  } catch {
    return { otpSent: false, resendCooldown: 0 };
  }
}

const otpInputStyle = {
  width: 1,
  gap: { xs: 0.75, sm: 1.25 },
  justifyContent: 'center',
  my: 1,
  '& .MuiOutlinedInput-root': {
    width: { xs: '100% !important', sm: 'auto' },
    maxWidth: { xs: 46, sm: 54 },
    minWidth: { xs: 36, sm: 44 },
    height: { xs: 48, sm: 56 },
    bgcolor: '#FFFFFF',
    borderRadius: { xs: '10px', sm: '12px' },
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: '#CBD5E1',
      borderWidth: '1.5px',
    },
    '&:hover': {
      bgcolor: '#FAFCFF',
    },
    '&:hover fieldset': {
      borderColor: '#94A3B8',
    },
    '&.Mui-focused': {
      bgcolor: '#FFFFFF',
      boxShadow: '0 0 0 4px rgba(0, 56, 130, 0.12)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#003882',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputBase-input': {
    p: { xs: '10px 0', sm: '14px 6px' },
    textAlign: 'center',
    fontSize: { xs: '18px', sm: '22px' },
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#0F172A',
  },
};

const ValidationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Kode verifikasi (OTP) wajib diisi')
    .length(6, 'Kode verifikasi harus 6 digit angka')
    .matches(/^[0-9]+$/, 'Kode verifikasi hanya boleh angka'),
});

export default function ViewMFAValidation() {
  const { user, mfaValidate } = useAuthContext();
  const [email, setEmail] = useState(user?.email);
  const [mfaType, setMfaType] = useState<'authenticator' | 'email' | null>(() => {
    try {
      const s = sessionStorage.getItem(MFA_VALIDATION_STORAGE_KEY);
      if (s === 'email' || s === 'authenticator') return s;
    } catch {
      // ignore
    }
    return null;
  });
  const [otpSent, setOtpSent] = useState(() => getStoredOtpState().otpSent);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(() => getStoredOtpState().resendCooldown);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAutoSentRef = useRef(false);
  const isCheckingMfaTypeRef = useRef(false);
  const isSendingOTPRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const methods = useForm({
    resolver: yupResolver(ValidationSchema),
    defaultValues: { code: '' },
    mode: 'onChange',
  });

  const { handleSubmit } = methods;

  const setStoredMfaType = useCallback((type: 'authenticator' | 'email') => {
    try {
      sessionStorage.setItem(MFA_VALIDATION_STORAGE_KEY, type);
    } catch {
      // ignore
    }
  }, []);

  const handleSendOTP = useCallback(
    async (isAutoSend = false) => {
      if (isSendingOTPRef.current) return;

      if (!isAutoSend && resendCooldown > 0) {
        setError(`Tunggu ${resendCooldown} detik sebelum meminta ulang kode OTP.`);
        toast.warning(`Tunggu ${resendCooldown} detik sebelum meminta ulang kode OTP.`);
        return;
      }

      isSendingOTPRef.current = true;
      setIsSendingOtp(true);
      setError('');

      try {
        await axiosInstance.post(endpoints.mfa.sendOtpEmail, { id: email });
        setOtpSent(true);
        setResendCooldown(OTP_COOLDOWN_SECONDS);
        try {
          sessionStorage.setItem(
            MFA_VALIDATION_OTP_COOLDOWN_END_KEY,
            String(Date.now() + OTP_COOLDOWN_SECONDS * 1000)
          );
        } catch {
          // ignore
        }
        if (!isAutoSend) {
          toast.success('Kode OTP telah dikirimkan ke email Anda');
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Gagal mengirim OTP. Silakan coba lagi.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        isSendingOTPRef.current = false;
        setIsSendingOtp(false);
      }
    },
    [email, resendCooldown]
  );

  const checkMfaType = useCallback(async () => {
    if (isCheckingMfaTypeRef.current) return;

    isCheckingMfaTypeRef.current = true;
    try {
      const response = await axiosInstance.post(endpoints.mfa.generate, { id: user?.email });
      if (response.data?.type === 'email') {
        setMfaType('email');
        setStoredMfaType('email');
        if (!hasAutoSentRef.current) {
          hasAutoSentRef.current = true;
          await handleSendOTP(true);
        }
      } else {
        setMfaType('authenticator');
        setStoredMfaType('authenticator');
      }
    } catch (err) {
      console.error('Failed to check MFA type:', err);
    } finally {
      isCheckingMfaTypeRef.current = false;
    }
  }, [user?.email, handleSendOTP, setStoredMfaType]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email && !isCheckingMfaTypeRef.current && !mfaType) {
      checkMfaType();
    }
  }, [user?.email, mfaType, checkMfaType]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [resendCooldown]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!email) {
        toast.error('Email tidak terdeteksi. Silakan muat ulang halaman.');
        return;
      }

      await mfaValidate(email, data.code.trim());

      try {
        sessionStorage.removeItem(MFA_VALIDATION_STORAGE_KEY);
        sessionStorage.removeItem(MFA_VALIDATION_OTP_COOLDOWN_END_KEY);
      } catch {
        // ignore
      }

      toast.success('Verifikasi keamanan berhasil!');
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (err: any) {
      const msg = err?.message || 'Kode verifikasi yang Anda masukkan salah atau sudah kedaluwarsa.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 3 }}>
      {/* Icon Badge */}
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '16px',
          bgcolor: 'rgba(0, 56, 130, 0.08)',
          border: '1.5px solid rgba(0, 56, 130, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <Iconify icon="solar:shield-check-bold" width={28} sx={{ color: '#003882' }} />
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#0F172A',
          fontSize: { xs: '24px', md: '28px' },
        }}
      >
        Verifikasi Akun (MFA)
      </Typography>

      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px', lineHeight: 1.5 }}>
        {mfaType === 'email'
          ? 'Masukkan 6 digit kode OTP yang telah dikirimkan ke email terdaftar Anda.'
          : mfaType === 'authenticator'
          ? 'Masukkan 6 digit kode keamanan dari aplikasi authenticator di perangkat Anda.'
          : 'Lengkapi verifikasi keamanan dua langkah untuk mengakses portal magang.'}
      </Typography>
    </Stack>
  );

  const renderEmailCard = mfaType === 'email' && (
    <Box
      sx={{
        p: 2,
        borderRadius: '12px',
        bgcolor: '#F0F9FF',
        border: '1px solid #BAE6FD',
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#E0F2FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:letter-bold-duotone" width={22} sx={{ color: '#0284c7' }} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '11px', color: '#0369A1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Kode OTP Dikirim Ke
          </Typography>
          <Typography
            noWrap
            sx={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}
          >
            {email || 'Email Akun Anda'}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={0.5}
        sx={{ mt: 1.5, pt: 1.25, borderTop: '1px dashed #BAE6FD' }}
      >
        <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
          Tidak menerima kode?
        </Typography>

        {resendCooldown > 0 ? (
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#003882' }}>
            Kirim ulang ({Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, '0')})
          </Typography>
        ) : (
          <Button
            size="small"
            onClick={() => handleSendOTP(false)}
            disabled={isSendingOtp}
            sx={{
              p: 0,
              minWidth: 'auto',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#0284c7',
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            {isSendingOtp ? 'Mengirim...' : 'Kirim Ulang OTP'}
          </Button>
        )}
      </Stack>
    </Box>
  );

  const renderAuthenticatorHint = mfaType === 'authenticator' && (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '12px',
        bgcolor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Iconify icon="solar:smartphone-2-linear" width={24} sx={{ color: '#003882', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
          Buka aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> di ponsel Anda untuk melihat kode 6 digit.
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Box>
      {renderHead}

      {renderEmailCard}

      {renderAuthenticatorHint}

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          {/* 6 Digit OTP Input */}
          <Box>
            <RHFCode name="code" sx={otpInputStyle} />
          </Box>

          {/* Submit Button */}
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            sx={{
              height: 48,
              borderRadius: '12px',
              bgcolor: '#003882',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
              '&:hover': {
                bgcolor: '#002860',
                boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
              },
            }}
          >
            Verifikasi & Masuk
          </LoadingButton>

          {/* Authenticator Reset Link */}
          {mfaType === 'authenticator' && (
            <Stack direction="row" justifyContent="center" sx={{ pt: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '12.5px', color: '#64748B' }}>
                Kehilangan akses kode?{' '}
                <Link
                  component={RouterLink}
                  href={paths.mfa.reset}
                  sx={{
                    color: '#0284c7',
                    fontWeight: 700,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Atur Ulang MFA
                </Link>
              </Typography>
            </Stack>
          )}

          {/* Back to Login Link */}
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ pt: 1 }}>
            <Link
              component={RouterLink}
              href={paths.auth.login}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                color: '#64748B',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none',
                '&:hover': { color: '#003882', textDecoration: 'underline' },
              }}
            >
              <Iconify icon="solar:arrow-left-linear" width={16} />
              Kembali ke Halaman Masuk
            </Link>
          </Stack>
        </Stack>
      </FormProvider>

      {/* Footer */}
      <Typography
        sx={{
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: '12px',
          mt: 5,
        }}
      >
        v{packageInfo.version} Portal Magang PT Pertamina Lubricants
      </Typography>
    </Box>
  );
}
