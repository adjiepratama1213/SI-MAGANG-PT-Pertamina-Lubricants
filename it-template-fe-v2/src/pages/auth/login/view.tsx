import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import { HOST, PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { getCurrentSubdomainOrDomain, getEnvSubdomainOrDomain } from 'src/utils/url-domain';
// components
import FormProvider, { RHFCheckbox, RHFTextField } from 'src/components/hook-form';
import PrivacyPolicySeamlessDialog from 'src/components/privacy-policy/seamless-dialog';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import packageInfo from '../../../../package.json';
import IdamanLoginView from './idaman';

// ----------------------------------------------------------------------

const inputStyle = {
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

export default function JwtLoginView() {
  const { login, loginWithToken } = useAuthContext();
  const [openQR, setOpenQR] = useState(false);
  const [scanError, setScanError] = useState('');

  const router = useRouter();

  const current = getCurrentSubdomainOrDomain();
  const env = getEnvSubdomainOrDomain(HOST);

  const isSameSubDomain = current === env;

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email wajib diisi').email('Format email tidak valid'),
    password: Yup.string().required('Kata sandi wajib diisi'),
    termCondition: Yup.boolean().oneOf([true], 'Anda wajib menyetujui Kebijakan Privasi'),
  });

  const defaultValues = {
    email: '',
    password: '',
    termCondition: false,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);

      const check = await axiosInstance.post(`${endpoints.mfa.ready}`, { id: data.email });
      const { encryptedSecret, mfaType } = check.data;
      // Untuk MFA email tidak ada setup, langsung ke validation (1x OTP lalu login)
      if (!encryptedSecret && mfaType === 'email') {
        router.push(paths.mfa.validation);
      } else if (!encryptedSecret) {
        router.push(paths.mfa.setup);
      } else {
        router.push(paths.mfa.validation);
      }
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const authorizationCode = searchParams.get('code');

  const handleOnScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;

    // ambil QR pertama
    const token = detectedCodes[0].rawValue;
    console.log(`check token`, token);
    if (!token) return;

    try {
      if (!token) throw new Error('Invalid QR');

      await loginWithToken(token);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (err: any) {
      setScanError(err.message || 'QR login failed');
    }
  };

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
        Masuk ke Akun
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
          Belum punya akun?
        </Typography>

        <Link
          component={RouterLink}
          href={paths.auth.register}
          sx={{
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '13.5px',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Daftar Magang
        </Link>
      </Stack>
    </Stack>
  );

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

  const renderForm = (
    <Stack spacing={2.25}>
      {!!errorMsg && (
        <Alert
          severity="error"
          sx={{
            borderRadius: '12px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            border: '1.5px solid #FCA5A5',
            bgcolor: '#FEF2F2',
            color: '#991B1B',
            p: 2,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
            '& .MuiAlert-icon': {
              color: '#DC2626',
              alignSelf: 'flex-start',
              mt: 0.35,
            },
          }}
        >
          {errorMsg.toLowerCase().includes('expired') || errorMsg.includes('hr.lubricants@pertamina.com') ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B', mb: 0.75, fontSize: '14px', letterSpacing: '0.2px' }}>
                Pemberitahuan: Akun Telah Expired
              </Typography>
              <Typography variant="body2" sx={{ color: '#7F1D1D', fontSize: '13px', lineHeight: 1.6, mb: 1.5 }}>
                {errorMsg.includes('hr.lubricants@pertamina.com')
                  ? errorMsg.split('hr.lubricants@pertamina.com')[0].trim()
                  : errorMsg}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.75,
                  py: 1,
                  bgcolor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1.5px solid #F87171',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <Iconify icon="solar:letter-bold" width={18} sx={{ color: '#003882' }} />
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>
                  Kontak Human Capital:
                </Typography>
                <Link
                  href="mailto:hr.lubricants@pertamina.com"
                  sx={{
                    color: '#003882',
                    fontWeight: 800,
                    fontSize: '13px',
                    textDecoration: 'underline',
                    '&:hover': { color: '#002855' },
                  }}
                >
                  hr.lubricants@pertamina.com
                </Link>
              </Box>
            </Box>
          ) : (
            errorMsg
          )}
        </Alert>
      )}

      {!authorizationCode && (
        <>
          {/* Email Field */}
          <Box>
            {renderLabel('Alamat Email', true)}
            <RHFTextField
              name="email"
              placeholder="nama@pertamina.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:letter-linear" width={18} sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
              }}
              sx={inputStyle}
            />
          </Box>

          {/* Password Field */}
          <Box>
            {renderLabel('Kata Sandi', true)}
            <RHFTextField
              name="password"
              placeholder="Masukkan kata sandi"
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
              sx={inputStyle}
            />
          </Box>

          {/* Agreement & Forgot Password */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ pt: 0.5 }}
          >
            <RHFCheckbox
              name="termCondition"
              label={
                <Box component="span" sx={{ color: '#64748B', fontSize: '12px' }}>
                  <PrivacyPolicySeamlessDialog variant="caption" />
                </Box>
              }
              sx={{
                mr: 0,
                '& .MuiCheckbox-root': { p: 0.5, mr: 0.5, color: '#94A3B8', '&.Mui-checked': { color: '#003882' } },
              }}
            />

            <Link
              component={RouterLink}
              href={paths.auth.forgotPassword}
              sx={{
                color: '#0284c7',
                fontWeight: 600,
                fontSize: '12.5px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                alignSelf: { xs: 'flex-start', sm: 'center' },
                pl: { xs: 3.5, sm: 0 },
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Lupa kata sandi?
            </Link>
          </Stack>
        </>
      )}

      {/* Action Buttons */}
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          height: 46,
          borderRadius: '12px',
          bgcolor: '#003882',
          color: '#ffffff',
          fontSize: '14.5px',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
          mt: 1,
          '&:hover': {
            bgcolor: '#002860',
            boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
          },
          ...(authorizationCode && {
            backgroundColor: 'grey.400',
            color: 'grey.700',
            opacity: 0.7,
          }),
        }}
      >
        Masuk
      </LoadingButton>

      <Button
        fullWidth
        size="large"
        type="button"
        onClick={() => setOpenQR(true)}
        variant="outlined"
        sx={{
          height: 46,
          borderRadius: '12px',
          borderColor: '#003882',
          color: '#003882',
          fontSize: '14px',
          fontWeight: 600,
          '&:hover': {
            borderColor: '#002860',
            bgcolor: 'rgba(0, 56, 130, 0.04)',
          },
        }}
      >
        Masuk via QR
      </Button>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {!isSameSubDomain ? (
        <Alert severity="error" sx={{ mt: 15 }}>
          We have moved to a new address. Please visit:{' '}
          <Link href={`${HOST}auth/login`} rel="noopener" underline="none">
            {HOST}
          </Link>
        </Alert>
      ) : (
        <>
          {renderHead}

          <IdamanLoginView />

          <Divider
            sx={{
              my: 2.75,
              color: '#94A3B8',
              fontSize: '12px',
              '&::before, &::after': { borderColor: '#E2E8F0' },
            }}
          >
            atau masuk dengan email
          </Divider>

          {authorizationCode && (
            <Stack sx={{ mb: 2 }}>
              <Typography variant="caption">
                Sedang memproses... Membutuhkan waktu lebih lama dari biasanya?
              </Typography>
              <Link component={RouterLink} href={paths.auth.login} variant="caption" color="info">
                Klik Di Sini untuk Mengulang
              </Link>
            </Stack>
          )}

          {renderForm}
        </>
      )}

      <Dialog
        open={openQR}
        onClose={() => {
          setScanError('');
          setOpenQR(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <Scanner onScan={(result) => handleOnScan(result)} />
          {scanError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {scanError}
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      <Typography
        variant="caption"
        sx={{
          color: '#94A3B8',
          display: 'block',
          textAlign: 'center',
          mt: 4,
          fontSize: '12px',
        }}
      >
        v{packageInfo.version} Portal Magang PT Pertamina Lubricants
      </Typography>
    </FormProvider>
  );
}

