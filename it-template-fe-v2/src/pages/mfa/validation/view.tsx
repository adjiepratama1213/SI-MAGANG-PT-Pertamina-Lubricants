import { Alert, Button, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/components/router-link';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import { useResponsive } from 'src/hooks/use-responsive';
import { paths } from 'src/pages/paths';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import OTPForm from '../../../components/mfa/otp-form';

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

export default function ViewMFAValidation() {
  const { user, mfaValidate } = useAuthContext();
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');
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

  const hasAutoSentRef = useRef(false);
  const isCheckingMfaTypeRef = useRef(false);
  const isSendingOTPRef = useRef(false);
  const router = useRouter();

  const searchParams = useSearchParams();

  const setStoredMfaType = useCallback((type: 'authenticator' | 'email') => {
    try {
      sessionStorage.setItem(MFA_VALIDATION_STORAGE_KEY, type);
    } catch {
      // ignore
    }
  }, []);

  const handleSendOTP = useCallback(
    async (isAutoSend = false) => {
      // Prevent multiple simultaneous calls
      if (isSendingOTPRef.current) {
        return;
      }

      // Check cooldown (skip for auto-send on first load)
      if (!isAutoSend && resendCooldown > 0) {
        setError(`Tunggu ${resendCooldown} detik sebelum mengirim ulang OTP.`);
        toast.warning(`Tunggu ${resendCooldown} detik sebelum mengirim ulang OTP.`);
        return;
      }

      isSendingOTPRef.current = true;
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
          toast.success('OTP telah dikirim ke email Anda');
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Gagal mengirim OTP. Silakan coba lagi.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        isSendingOTPRef.current = false;
      }
    },
    [email, resendCooldown]
  );

  const checkMfaType = useCallback(async () => {
    if (isCheckingMfaTypeRef.current) {
      return;
    }

    isCheckingMfaTypeRef.current = true;
    try {
      const response = await axiosInstance.post(endpoints.mfa.generate, { id: user?.email });
      if (response.data?.type === 'email') {
        setMfaType('email');
        setStoredMfaType('email');
        // Auto-send OTP for email MFA only once
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

  // Sync email from user when available (e.g. after refresh)
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // When we don't have mfaType yet, fetch from API (also sends OTP for email MFA)
  useEffect(() => {
    if (user?.email && !isCheckingMfaTypeRef.current && !mfaType) {
      checkMfaType();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, mfaType]);

  // Cooldown timer for resend
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

  const returnTo = searchParams.get('returnTo');

  const handleSubmit = async (code: string) => {
    try {
      if (!email) {
        toast.error('Email tidak tersedia. Silakan refresh dan coba lagi.');
        return;
      }
      await mfaValidate(email, code);
      try {
        sessionStorage.removeItem(MFA_VALIDATION_STORAGE_KEY);
        sessionStorage.removeItem(MFA_VALIDATION_OTP_COOLDOWN_END_KEY);
      } catch {
        // ignore
      }
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (err: any) {
      toast.error(err?.message);
    }
  };

  const renderSection = mdUp && (
    <Stack flexGrow={1} spacing={5} alignItems="center" justifyContent="center">
      <Iconify
        icon="solar:shield-user-bold-duotone"
        color={(theme.palette as any).pertamina?.main}
        width={240}
      />
    </Stack>
  );

  const renderContent = (
    <Stack
      sx={{
        width: 1,
        mx: 'auto',
        maxWidth: 700,
        px: { xs: 2, md: 8 },
        pt: { xs: 10, md: 15 },
        pb: { xs: 15, md: 0 },
      }}
    >
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">Multi-Factor Authentication: Validation</Typography>
          <Tooltip
            title="Multi-Factor Authentication (MFA) adalah metode keamanan yang memerlukan lebih dari satu bentuk verifikasi identitas untuk mengakses akun Anda. Ini membantu melindungi akun Anda dari akses tidak sah dengan menambahkan lapisan keamanan tambahan selain password."
            arrow
            placement="top"
          >
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Iconify icon="solar:info-circle-bold-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
        {mfaType !== 'email' && (
          <Stack direction="row" spacing={0.5}>
            <Typography variant="body2">
              {`Lost your code? `}
              <Link
                variant="subtitle2"
                sx={{
                  cursor: 'pointer',
                }}
                component={RouterLink}
                href={paths.mfa.reset}
              >
                Reset code
              </Link>
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack spacing={3}>
        {mfaType === 'email' && (
          <>
            <Alert severity={otpSent ? 'success' : 'info'}>
              {otpSent
                ? 'Kode OTP untuk Multi-Factor Authentication telah dikirim ke email Anda. Silakan cek inbox email Anda dan masukkan kode OTP di bawah.'
                : 'Kode OTP akan dikirim ke email Anda. Klik tombol di bawah untuk mengirim OTP, lalu masukkan kode di bawah.'}
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
            <OTPForm submitHandler={handleSubmit} isSetup={false} mfaType="email" />
            <Button
              variant="outlined"
              onClick={() => handleSendOTP(false)}
              size="small"
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Kirim Ulang OTP (${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')})`
                : 'Kirim OTP'}
            </Button>
          </>
        )}
        {mfaType === 'authenticator' && (
          <OTPForm submitHandler={handleSubmit} isSetup={false} mfaType="authenticator" />
        )}
        {!mfaType && <OTPForm submitHandler={handleSubmit} isSetup={false} />}
      </Stack>
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '70vh',
      }}
    >
      {renderSection}

      {renderContent}
    </Stack>
  );
}
