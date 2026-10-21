import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/hooks/use-router';
// components
import { toast } from 'react-toastify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/components/router-link';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { paths } from 'src/pages/paths';
import packageInfo from '../../../../package.json';

// ----------------------------------------------------------------------

const modernInputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: '#E2E8F0',
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
    py: '12px',
    px: '14px',
    color: '#0F172A',
    fontWeight: 500,
    '&::placeholder': {
      color: '#94A3B8',
      opacity: 1,
      fontSize: '13.5px',
      fontWeight: 400,
    },
  },
};

export default function ForgotPasswordView() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const password = useBoolean();
  const passwordConfirmation = useBoolean();

  // Timer countdown effect for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  // Schema for Step 1 (Send OTP)
  const Step1Schema = Yup.object().shape({
    email: Yup.string()
      .required('Alamat email wajib diisi')
      .email('Format email tidak valid'),
  });

  // Schema for Step 2 (Reset Password with OTP)
  const Step2Schema = Yup.object().shape({
    otp: Yup.string()
      .required('Kode verifikasi (OTP) wajib diisi')
      .length(6, 'Kode verifikasi harus 6 digit')
      .matches(/^[0-9]+$/, 'Kode verifikasi hanya boleh angka'),
    password: Yup.string()
      .required('Kata sandi baru wajib diisi')
      .min(8, 'Kata sandi minimal 8 karakter')
      .max(32, 'Kata sandi maksimal 32 karakter')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        'Kata sandi harus mengandung kombinasi huruf dan angka'
      ),
    passwordConfirmation: Yup.string()
      .required('Konfirmasi kata sandi wajib diisi')
      .oneOf([Yup.ref('password')], 'Konfirmasi kata sandi tidak cocok'),
  });

  const step1Methods = useForm({
    resolver: yupResolver(Step1Schema),
    defaultValues: { email: '' },
  });

  const step2Methods = useForm({
    resolver: yupResolver(Step2Schema),
    defaultValues: {
      otp: '',
      password: '',
      passwordConfirmation: '',
    },
  });

  const currentPassword = step2Methods.watch('password') || '';
  const hasMinLength = currentPassword.length >= 8 && currentPassword.length <= 32;
  const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)/.test(currentPassword);

  // Send OTP handler (Step 1)
  const onSendOtp = step1Methods.handleSubmit(async (data) => {
    try {
      setIsSendingOtp(true);
      setErrorMsg('');
      setSuccessMsg('');

      const cleanEmail = data.email.trim().toLowerCase();
      await axiosInstance.post(endpoints.auth.sendResetOtp, { email: cleanEmail });

      setSentEmail(cleanEmail);
      setStep(2);
      setCountdown(60);
      toast.success('Kode verifikasi berhasil dikirim ke email Anda!');
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || 'Gagal mengirim kode verifikasi. Pastikan email Anda terdaftar.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSendingOtp(false);
    }
  });

  // Resend OTP handler (Step 2)
  const handleResendOtp = async () => {
    if (countdown > 0 || isSendingOtp || !sentEmail) return;

    try {
      setIsSendingOtp(true);
      setErrorMsg('');

      await axiosInstance.post(endpoints.auth.sendResetOtp, { email: sentEmail });

      setCountdown(60);
      toast.success('Kode verifikasi baru berhasil dikirim!');
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || 'Gagal mengirim ulang kode verifikasi.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Submit Reset Password with OTP (Step 2)
  const onResetPassword = step2Methods.handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');

      await axiosInstance.post(endpoints.auth.resetPassword, {
        email: sentEmail,
        otp: data.otp.trim(),
        newPassword: data.password,
      });

      setSuccessMsg('Kata sandi berhasil diperbarui! Mengalihkan ke halaman masuk...');
      toast.success('Kata sandi berhasil diperbarui!');

      setTimeout(() => {
        router.push(paths.auth.login);
      }, 1500);
    } catch (error: any) {
      console.error(error);
      const msg =
        error?.message ||
        'Gagal mengatur ulang kata sandi. Pastikan kode verifikasi yang dimasukkan benar.';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  });

  const renderLabel = (label: string, required?: boolean) => (
    <Typography
      sx={{
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#334155',
        mb: 0.75,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {label}
      {required && <Box component="span" sx={{ color: '#EF4444' }}>*</Box>}
    </Typography>
  );

  const renderHead = (
    <Stack spacing={0.75} sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#0F172A',
          fontSize: { xs: '24px', md: '28px' },
        }}
      >
        {step === 1 ? 'Lupa Kata Sandi?' : 'Verifikasi & Atur Sandi'}
      </Typography>

      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px', lineHeight: 1.5 }}>
        {step === 1
          ? 'Masukkan alamat email terdaftar akun Anda. Kami akan mengirimkan kode verifikasi 6 digit untuk verifikasi keamanan.'
          : 'Masukkan kode verifikasi 6 digit yang dikirimkan ke email Anda dan tentukan kata sandi baru.'}
      </Typography>
    </Stack>
  );

  const renderStep1Form = (
    <FormProvider methods={step1Methods} onSubmit={onSendOtp}>
      <Stack spacing={2.25}>
        {!!errorMsg && (
          <Alert severity="error" sx={{ borderRadius: '10px' }}>
            {errorMsg}
          </Alert>
        )}

        {/* Email Address */}
        <Box>
          {renderLabel('Alamat Email Terdaftar', true)}
          <RHFTextField
            name="email"
            placeholder="contoh@pertamina.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:letter-linear" width={18} sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
            }}
            sx={modernInputStyle}
          />
        </Box>

        {/* Security Note */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          }}
        >
          <Iconify
            icon="solar:shield-check-bold"
            width={20}
            sx={{ color: '#0284c7', flexShrink: 0, mt: 0.25 }}
          />
          <Typography sx={{ fontSize: '12px', color: '#0369A1', lineHeight: 1.5 }}>
            Demi keamanan akun Anda, kata sandi hanya dapat diubah setelah memverifikasi kode OTP yang dikirimkan ke email terdaftar.
          </Typography>
        </Box>

        {/* Submit Step 1 Button */}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSendingOtp}
          sx={{
            height: 46,
            borderRadius: '12px',
            bgcolor: '#003882',
            color: '#ffffff',
            fontSize: '14.5px',
            fontWeight: 700,
            mt: 1,
            boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
            '&:hover': {
              bgcolor: '#002860',
              boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
            },
          }}
        >
          Kirim Kode Verifikasi
        </LoadingButton>

        {/* Back to Login Link */}
        <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center" sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            Sudah ingat kata sandi Anda?
          </Typography>
          <Link
            component={RouterLink}
            href={paths.auth.login}
            sx={{
              color: '#0284c7',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Masuk di sini
          </Link>
        </Stack>
      </Stack>
    </FormProvider>
  );

  const renderStep2Form = (
    <FormProvider methods={step2Methods} onSubmit={onResetPassword}>
      <Stack spacing={2.25}>
        {!!errorMsg && (
          <Alert severity="error" sx={{ borderRadius: '10px' }}>
            {errorMsg}
          </Alert>
        )}

        {!!successMsg && (
          <Alert severity="success" sx={{ borderRadius: '10px' }}>
            {successMsg}
          </Alert>
        )}

        {/* Destination Email Info Card */}
        <Box
          sx={{
            p: 1.5,
            px: 2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Stack spacing={0.25} sx={{ overflow: 'hidden', minWidth: 0, flexGrow: 1 }}>
            <Typography sx={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
              Kode OTP telah dikirim ke:
            </Typography>
            <Typography
              noWrap
              sx={{ fontSize: '13.5px', color: '#0F172A', fontWeight: 700, minWidth: 0 }}
            >
              {sentEmail}
            </Typography>
          </Stack>

          <Button
            size="small"
            variant="text"
            onClick={() => {
              setErrorMsg('');
              setStep(1);
            }}
            sx={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0284c7',
              p: 0.5,
              minWidth: 'auto',
              flexShrink: 0,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Ubah Email
          </Button>
        </Box>

        {/* 6-Digit OTP Field */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
            {renderLabel('Kode Verifikasi (OTP)', true)}
            <Typography sx={{ fontSize: '11.5px', color: '#64748B' }}>
              6 Digit Angka
            </Typography>
          </Stack>
          <RHFTextField
            name="otp"
            placeholder="cth: 123456"
            inputProps={{
              maxLength: 6,
              style: {
                letterSpacing: '6px',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'monospace',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:shield-keyhole-bold" width={20} sx={{ color: '#003882' }} />
                </InputAdornment>
              ),
            }}
            sx={modernInputStyle}
          />

          {/* Resend OTP Bar */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={0.5}
            sx={{ mt: 1, px: 0.5 }}
          >
            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
              Tidak menerima kode?
            </Typography>
            {countdown > 0 ? (
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#003882' }}>
                Kirim ulang ({countdown}s)
              </Typography>
            ) : (
              <Button
                size="small"
                onClick={handleResendOtp}
                disabled={isSendingOtp}
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0284c7',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                {isSendingOtp ? 'Mengirim...' : 'Kirim Ulang Kode'}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Kata Sandi Baru */}
        <Box>
          {renderLabel('Kata Sandi Baru', true)}
          <RHFTextField
            name="password"
            placeholder="Minimal 8 karakter kombinasi huruf & angka"
            type={password.value ? 'text' : 'password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:key-linear" width={18} sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end" size="small">
                    <Iconify
                      icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      width={18}
                      sx={{ color: '#64748B' }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={modernInputStyle}
          />

          {/* Password Guidance Box */}
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', mb: 0.75 }}>
              Ketentuan Kata Sandi:
            </Typography>
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify
                  icon={hasMinLength ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                  width={14}
                  sx={{ color: hasMinLength ? '#10B981' : '#94A3B8' }}
                />
                <Typography
                  sx={{
                    fontSize: '11.5px',
                    color: hasMinLength ? '#065F46' : '#64748B',
                    fontWeight: hasMinLength ? 600 : 400,
                  }}
                >
                  8 - 32 karakter
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify
                  icon={hasLetterAndNumber ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                  width={14}
                  sx={{ color: hasLetterAndNumber ? '#10B981' : '#94A3B8' }}
                />
                <Typography
                  sx={{
                    fontSize: '11.5px',
                    color: hasLetterAndNumber ? '#065F46' : '#64748B',
                    fontWeight: hasLetterAndNumber ? 600 : 400,
                  }}
                >
                  Mengandung kombinasi huruf dan angka
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Konfirmasi Kata Sandi Baru */}
        <Box>
          {renderLabel('Konfirmasi Kata Sandi Baru', true)}
          <RHFTextField
            name="passwordConfirmation"
            placeholder="Ulangi kata sandi baru"
            type={passwordConfirmation.value ? 'text' : 'password'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:lock-password-linear" width={18} sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={passwordConfirmation.onToggle} edge="end" size="small">
                    <Iconify
                      icon={passwordConfirmation.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      width={18}
                      sx={{ color: '#64748B' }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={modernInputStyle}
          />
        </Box>

        {/* Submit Step 2 Button */}
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={step2Methods.formState.isSubmitting}
          sx={{
            height: 46,
            borderRadius: '12px',
            bgcolor: '#003882',
            color: '#ffffff',
            fontSize: '14.5px',
            fontWeight: 700,
            mt: 1,
            boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
            '&:hover': {
              bgcolor: '#002860',
              boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
            },
          }}
        >
          Atur Ulang Kata Sandi
        </LoadingButton>

        {/* Back to Login Link */}
        <Stack direction="row" spacing={0.75} justifyContent="center" alignItems="center" sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13px' }}>
            Sudah ingat kata sandi Anda?
          </Typography>
          <Link
            component={RouterLink}
            href={paths.auth.login}
            sx={{
              color: '#0284c7',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Masuk di sini
          </Link>
        </Stack>
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {step === 1 ? renderStep1Form : renderStep2Form}

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
    </>
  );
}
