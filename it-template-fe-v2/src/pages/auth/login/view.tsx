import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import { HOST, PATH_AFTER_LOGIN } from 'src/config-global';
// config
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
import { Dialog, DialogContent, Divider } from '@mui/material';
import { getCurrentSubdomainOrDomain, getEnvSubdomainOrDomain } from 'src/utils/url-domain';
// components
import FormProvider, { RHFCheckbox, RHFTextField } from 'src/components/hook-form';
import PrivacyPolicySeamlessDialog from 'src/components/privacy-policy/seamless-dialog';
import Iconify from 'src/components/iconify';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import packageInfo from '../../../../package.json'; // Path to package.json
import IdamanLoginView from './idaman';

// ----------------------------------------------------------------------

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
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    termCondition: Yup.boolean().oneOf([true], 'Privacy Policy Agreement is required'),
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
    <Stack spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h4">Masuk</Typography>

      <IdamanLoginView />

      <Divider sx={{ my: { xs: 2, md: 4 } }}>atau</Divider>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Belum punya akun?</Typography>

        <Link component={RouterLink} href={paths.auth.register} variant="subtitle2">
          Daftar Magang
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {/* <Alert severity="info" sx={{ mb: 3 }}>
        Example : <strong>email@domain.id</strong> / password :<strong> yourPassw0rd</strong>
      </Alert> */}

      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {!authorizationCode && (
        <>
          <RHFTextField name="email" label="Alamat Email" />

          <RHFTextField
            name="password"
            label="Kata Sandi"
            type={password.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <RHFCheckbox
            name="termCondition"
            label={
              <span>
                <PrivacyPolicySeamlessDialog variant="caption" />
                {/* <a
                      href="https://clicknwin.pertaminalubricants.com/syarat-ketentuan"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      syarat dan ketentuan
                    </a> */}
                .
              </span>
            }
          />
        </>
      )}

      <Link
        component={RouterLink}
        href={paths.auth.forgotPassword}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        Lupa kata sandi?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{
          ...(authorizationCode && {
            backgroundColor: 'grey.400',
            color: 'grey.700',
            opacity: 0.7,
          }),
        }}
      >
        Masuk
      </LoadingButton>

      <LoadingButton
        fullWidth
        color="error"
        size="large"
        type="button"
        onClick={() => setOpenQR(true)}
        variant="outlined"
      >
        Masuk via QR
      </LoadingButton>
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

          {authorizationCode && (
            <Stack>
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

      <Stack alignItems="flex-end" sx={{ my: 3 }}>
        <Typography variant="caption" gutterBottom>
          v{packageInfo.version}
        </Typography>
      </Stack>
    </FormProvider>
  );
}
