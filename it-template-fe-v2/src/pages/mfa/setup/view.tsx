import {
  Alert,
  Button,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useResponsive } from 'src/hooks/use-responsive';
import { useTheme } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import BackupCode from '../../../components/mfa/backup-code';
import OTPForm from '../../../components/mfa/otp-form';
import QRCode from '../../../components/mfa/qr-code';
import { useGenerateMFAQRCode } from '../query';

export function ViewMFASetup() {
  const { user, mfaValidate } = useAuthContext();
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');
  const [email, setEmail] = useState(user?.email || '');

  const [error, setError] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [mfaType, setMfaType] = useState<'authenticator' | 'email' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const isSendingOTPRef = useRef(false);

  const { results } = useGenerateMFAQRCode({ id: email || '' });

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  useEffect(() => {
    // Check MFA type from generate response
    if (results?.type === 'email') {
      setMfaType('email');
    } else if (results?.qrcode && results?.secret) {
      setMfaType('authenticator');
    }
  }, [results]);

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

  const handleSendOTP = async () => {
    // Prevent multiple simultaneous calls
    if (isSendingOTPRef.current) {
      return;
    }

    // Check cooldown
    if (resendCooldown > 0) {
      setError(`Tunggu ${resendCooldown} detik sebelum mengirim ulang OTP.`);
      return;
    }

    isSendingOTPRef.current = true;
    setError('');
    try {
      await axiosInstance.post(endpoints.mfa.sendOtpEmail, { id: email });
      setOtpSent(true);
      setResendCooldown(120); // 2 minutes = 120 seconds
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Gagal mengirim OTP. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      isSendingOTPRef.current = false;
    }
  };

  const handleSubmit = async (scanCode: string) => {
    setError('');
    try {
      const URL = `${endpoints.mfa.verify}`;

      const requestBody: any = {
        id: email,
        code: scanCode,
      };

      // Only include secret for authenticator MFA
      if (mfaType === 'authenticator' && results.secret) {
        requestBody.secret = results.secret;
      } else if (mfaType === 'email') {
        // For email MFA, we don't need secret, but include a marker
        requestBody.secret = 'EMAIL_MFA';
      }

      const response = await axiosInstance.post(URL, requestBody);

      if (response?.data) {
        const { code } = response.data;
        setBackupCode(code);

        // Setelah MFA setup berhasil, authenticate user dengan memanggil validate
        // menggunakan code yang sama untuk verify (karena baru saja di-setup)
        try {
          await mfaValidate(email, scanCode);
        } catch (validateErr) {
          // Jika validate gagal, tidak apa-apa, user tetap bisa menggunakan backup code nanti
          console.warn('Auto-authentication after setup failed:', validateErr);
        }
      } else {
        setError('Something went wrong');
      }
    } catch (err) {
      setError(`Error submitting code`);
    }
  };

  const renderHead = (
    <Stack
      spacing={2}
      sx={{
        mb: 3,
        pt: { xs: 3, md: 4 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h4">Multi-Factor Authentication: Setup</Typography>
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
      {!backupCode && (
        <TextField
          name="email"
          label="Email"
          value={email}
          // onChange={(e) => setEmail(e.target.value)}
          disabled
        />
      )}

      {!email && (
        <Stack direction="row" spacing={0.5}>
          <Typography variant="body2"> Change email? </Typography>

          <Link href={paths.auth.login} component={RouterLink} variant="subtitle2">
            Back to s ign in
          </Link>
        </Stack>
      )}
    </Stack>
  );

  const renderAuthenticatorOTP = !backupCode &&
    mfaType === 'authenticator' &&
    results?.qrcode &&
    results?.secret && (
      <Stack
        component="main"
        direction={mdUp ? 'row' : 'column'}
        spacing={mdUp ? 10 : 1}
        sx={{
          minHeight: '100vh',
        }}
      >
        <Stack spacing={1}>
          <Alert severity="info">Scan this QR Code with your Authenticator Apps</Alert>
          <QRCode qr={results?.qrcode} secret={results?.secret} />
        </Stack>
        <OTPForm submitHandler={handleSubmit} error={error} isSetup mfaType="authenticator" />
      </Stack>
    );

  const renderEmailOTP = !backupCode && mfaType === 'email' && (
    <Stack
      component="main"
      spacing={3}
      sx={{
        minHeight: '100vh',
        maxWidth: 500,
        mx: 'auto',
        pt: 4,
      }}
    >
      {!otpSent ? (
        <>
          <Alert severity="info">
            Kode OTP akan dikirim ke email Anda. Klik tombol di bawah untuk mengirim OTP.
          </Alert>
          <Button variant="contained" onClick={handleSendOTP} size="large">
            Kirim OTP ke Email
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </>
      ) : (
        <>
          <Alert
            severity="success"
            icon={
              <Iconify
                icon="solar:shield-user-bold-duotone"
                color={(theme.palette as any).pertamina?.main}
                width={24}
              />
            }
          >
            Kode OTP telah dikirim ke email Anda. Silakan cek inbox email Anda dan masukkan kode OTP
            di bawah.
          </Alert>
          <OTPForm submitHandler={handleSubmit} error={error} isSetup mfaType="email" />
          <Button
            variant="outlined"
            onClick={handleSendOTP}
            size="small"
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Kirim Ulang OTP (${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, '0')})`
              : 'Kirim Ulang OTP'}
          </Button>
        </>
      )}
    </Stack>
  );

  return (
    <>
      {renderHead}

      {renderAuthenticatorOTP}
      {renderEmailOTP}

      {backupCode && <BackupCode code={backupCode} next={() => {}} />}
    </>
  );
}
