import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';

import { toast } from 'react-toastify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useAuthContext } from 'src/auth/hooks';
import { PERTAMINA_TOKENS } from 'src/theme/palette';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;
const BRAND_NAVY_HOVER = PERTAMINA_TOKENS.navyHover;

export default function AccountChangePassword() {
  const password = useBoolean();
  const { user } = useAuthContext();
  const currentRole = user?.role;

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Kata sandi lama wajib diisi'),
    newPassword: Yup.string()
      .required('Kata sandi baru wajib diisi')
      .min(8, 'Kata sandi minimal 8 karakter')
      .max(32, 'Kata sandi maksimal 32 karakter')
      .matches(/[a-zA-Z]/, 'Kata sandi harus mengandung minimal 1 huruf')
      .matches(/[0-9]/, 'Kata sandi harus mengandung minimal 1 angka')
      .test(
        'no-match',
        'Kata sandi baru harus berbeda dengan kata sandi lama',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Konfirmasi kata sandi tidak cocok'),
  });

  const defaultValues = {
    userId: currentRole === 'PTPL_IT' || currentRole === 'SUPERSAIYAN' ? user?.id : '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.patch(`${endpoints.auth.updatePassword}`, data);
      reset();
      toast.success('Kata sandi berhasil diperbarui!');
    } catch (error) {
      toast.error('Gagal memperbarui kata sandi. Pastikan kata sandi lama Anda benar.');
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* KARTU PANDUAN KEAMANAN (KIRI) */}
        <Grid xs={12} md={4}>
          <Card
            sx={{
              p: 3.5,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: 'rgba(0, 79, 159, 0.08)',
                color: BRAND_NAVY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Iconify icon="solar:shield-keyhole-bold-duotone" width={26} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', mb: 0.75 }}>
              Keamanan Akun
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 2.5, fontSize: '0.85rem' }}>
              Jaga kerahasiaan kata sandi Anda untuk melindungi data pribadi dan aktivitas magang di portal SI-Magang PT Pertamina Lubricants.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#10B981', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
                  Minimal 8 karakter dengan kombinasi huruf dan angka.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#10B981', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
                  Hindari kombinasi kata sandi yang mudah ditebak.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#10B981', mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.4 }}>
                  Jangan bagikan kata sandi Anda kepada orang lain.
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* FORM KATA SANDI (KANAN) */}
        <Grid xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.25,
                      bgcolor: 'rgba(0, 79, 159, 0.08)',
                      color: BRAND_NAVY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:lock-password-bold-duotone" width={20} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A' }}>
                    Ganti Kata Sandi
                  </Typography>
                </Box>
              }
              subheader="Masukkan kata sandi lama Anda dan tentukan kata sandi baru yang aman"
              sx={{ p: 3, pb: 1 }}
            />
            <Divider sx={{ mx: 3, my: 1 }} />
            <CardContent sx={{ p: 3, pt: 2 }}>
              <Stack spacing={2.5}>
                <RHFTextField
                  name="oldPassword"
                  type={password.value ? 'text' : 'password'}
                  label="Kata Sandi Saat Ini"
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

                <RHFTextField
                  name="newPassword"
                  label="Kata Sandi Baru"
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
                  helperText={
                    <Stack component="span" direction="row" alignItems="center">
                      <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} />
                      Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.
                    </Stack>
                  }
                />

                <RHFTextField
                  name="confirmNewPassword"
                  type={password.value ? 'text' : 'password'}
                  label="Konfirmasi Kata Sandi Baru"
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

                <Stack spacing={2} alignItems="flex-end" sx={{ mt: 2 }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                    startIcon={<Iconify icon="solar:diskette-bold" />}
                    sx={{
                      bgcolor: BRAND_NAVY,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 3.5,
                      py: 1,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                    }}
                  >
                    Simpan Perubahan
                  </LoadingButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
