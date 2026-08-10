import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { RHFCode } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/components/router-link';
import * as Yup from 'yup';
import { useResponsive } from 'src/hooks/use-responsive';
import { paths } from '../../pages/paths';
import Image from '../image';

const VerifySchema = Yup.object().shape({
  code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required'),
});

const defaultValues = {
  code: '',
};

interface IOTPForm {
  submitHandler: (code: string) => Promise<void>;
  error?: string;
  isSetup?: boolean;
  mfaType?: 'authenticator' | 'email' | null;
}

export default function OTPForm({ submitHandler, error, isSetup, mfaType }: IOTPForm) {
  const mdUp = useResponsive('up', 'md');

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    submitHandler(data.code);
  });

  const renderHead = (
    <Stack spacing={1} sx={{ my: 0 }}>
      {mfaType !== 'email' && (
        <>
          <Typography variant="h4">Please check your authenticator apps!</Typography>

          {isSetup &&
            (mdUp ? (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  If you don&apos;t have one, scan here to download your authenticator app:
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 3 }}
                >
                  <Image
                    alt="authenticator apps"
                    src="/assets/images/ptpl/qrcode_authenticator_app.png"
                    sx={{
                      height: 100,
                    }}
                  />
                </Stack>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                If you don&apos;t have one, download your authenticator app:{' '}
                <Link
                  key="https://linktr.ee/coroowicaksono"
                  href="https://linktr.ee/coroowicaksono"
                  variant="body2"
                  target="_blank"
                  rel="noopener"
                >
                  here
                </Link>
              </Typography>
            ))}
        </>
      )}

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {mfaType === 'email'
          ? 'Masukkan kode OTP yang telah dikirim ke email Anda.'
          : 'Please enter the code in below box to verify your identity.'}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <RHFCode name="code" />

      {error && <Alert severity="error">{error}</Alert>}

      <Button fullWidth size="large" type="submit" variant="contained" disabled={isSubmitting}>
        Verify
      </Button>

      <Link
        component={RouterLink}
        href={paths.auth.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
