import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
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

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const password = useBoolean();
  const { user } = useAuthContext();
  const currentRole = user?.role; // admin;

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must not exceed 32 characters')
      .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .test(
        'no-match',
        'New password must be different than old password',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
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
      toast('Update Password Success!');
      console.info('DATA', data);
    } catch (error) {
      toast(error);
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          {/* Empty left column to match Account General layout */}
        </Grid>
        <Grid xs={12} md={9}>
          <Card sx={{ pt: 1, pb: 2 }}>
            <CardHeader title="Keamanan Akun" subheader="Ganti kata sandi Anda secara berkala untuk menjaga keamanan akun" sx={{ mb: 2 }} />
            <CardContent>
              <Stack spacing={3}>
                <RHFTextField
                  name="oldPassword"
                  type={password.value ? 'text' : 'password'}
                  label="Old Password"
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
                  label="New Password"
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
                  label="Confirm New Password"
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

                <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} sx={{ ml: 'auto' }}>
                  Simpan Perubahan
                </LoadingButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
