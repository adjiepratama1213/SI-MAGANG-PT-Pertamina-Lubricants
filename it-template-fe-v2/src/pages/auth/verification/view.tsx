import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { toast } from 'react-toastify';
import { endpoints } from 'src/utils/endpoints';
import axiosInstance from 'src/utils/axios';
import { Button } from '@mui/material';
import { useSearchParams } from 'src/hooks/use-search-params';

// ----------------------------------------------------------------------

export default function JwtVerificationView() {
  const [errorMsg, setErrorMsg] = useState('');

  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const RegisterSchema = Yup.object().shape({
    id: Yup.string().required('ID required'),
    email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address')
      .test(
        'is-pertamina-email',
        'Should use @pertamina.com / @mitrakerja.pertamina.com',
        (value) => value?.endsWith('pertamina.com') ?? false
      ),
  });

  const defaultValues = {
    id: '',
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (token) {
      setValue('id', token);
    }
  }, [token, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const mappingData = {
        id: data?.id || '',
        email: data?.email || '',
      };
      await axiosInstance.patch(`${endpoints.auth.verifyEmail}/${data?.id}`, mappingData, {});

      toast.success(`Update Account Success! You're able to login, please sign in to continue!'`);
      setIsSubmitSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mt: { lg: 0 }, mb: 5, position: 'relative' }}>
      <Typography variant="h4">Get started your account!</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        mb: 5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {'By signing up, I agree to '}
      <Link
        component={RouterLink}
        href={paths.privacyPolicy.root}
        underline="always"
        color="text.primary"
      >
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderAfter = (
    <Stack spacing={2.5}>
      <Alert severity="info">
        You&apos;re account already activated! <br />
        Please sign in to continue.
      </Alert>

      <Button variant="soft" color="success" href={paths.auth.login} rel="noopener" size="small">
        Sign In
      </Button>

      <Link component={RouterLink} href={paths.auth.login} variant="subtitle2">
        Back To Login
      </Link>
    </Stack>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <RHFTextField name="email" label="Email address" />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Verification
        </LoadingButton>
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {isSubmitSuccess ? renderAfter : renderForm}
      {!isSubmitSuccess && renderTerms}
    </>
  );
}
