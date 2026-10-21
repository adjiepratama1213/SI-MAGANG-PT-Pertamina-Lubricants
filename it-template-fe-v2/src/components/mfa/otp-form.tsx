import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Link, Stack, Typography, Box } from '@mui/material';
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
  code: Yup.string()
    .min(6, 'Kode verifikasi harus 6 digit angka')
    .required('Kode verifikasi wajib diisi'),
});

const defaultValues = {
  code: '',
};

const otpInputStyle = {
  gap: { xs: 1, sm: 1.25 },
  justifyContent: 'center',
  my: 1,
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
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
    p: { xs: '12px 2px', sm: '14px 6px' },
    textAlign: 'center',
    fontSize: { xs: '18px', sm: '22px' },
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#0F172A',
  },
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Periksa Aplikasi Authenticator Anda
          </Typography>

          {isSetup &&
            (mdUp ? (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                  Jika belum memiliki aplikasi authenticator, pindai QR di bawah untuk mengunduh:
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2, mt: 1 }}
                >
                  <Image
                    alt="authenticator apps"
                    src="/assets/images/ptpl/qrcode_authenticator_app.png"
                    sx={{
                      height: 100,
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                </Stack>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '13px' }}>
                Jika belum memiliki aplikasi, unduh aplikasi authenticator Anda:{' '}
                <Link
                  key="https://linktr.ee/coroowicaksono"
                  href="https://linktr.ee/coroowicaksono"
                  variant="body2"
                  target="_blank"
                  rel="noopener"
                  sx={{ color: '#0284c7', fontWeight: 700 }}
                >
                  di sini
                </Link>
              </Typography>
            ))}
        </>
      )}

      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
        {mfaType === 'email'
          ? 'Masukkan kode OTP yang telah dikirim ke email Anda.'
          : 'Masukkan 6 digit kode dari aplikasi authenticator untuk verifikasi identitas Anda.'}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <Box>
        <RHFCode name="code" sx={otpInputStyle} />
      </Box>

      {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={isSubmitting}
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
      </Button>

      <Stack direction="row" justifyContent="center">
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
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
