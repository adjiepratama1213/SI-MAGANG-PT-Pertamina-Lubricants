import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';

import { toast } from 'react-toastify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useAuthContext } from 'src/auth/hooks';
import { useParams } from 'src/hooks/use-params';

// ----------------------------------------------------------------------

type Props = {
  userId: string;
};

export default function AccountChangePassword({ userId }: Props) {
  const password = useBoolean();
  const { user } = useAuthContext();
  const currentRole = user?.role; // admin;

  const ChangePassWordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(12, 'Password must be at least 12 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[@$!%*?&]/, 'Password must contain at least one special character'),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    userId: currentRole === 'PTPL_IT' || currentRole === 'SUPERSAIYAN' ? userId : '',
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
      await axiosInstance.patch(`${endpoints.user.updatePassword}`, data);
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
      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <RHFTextField name="userId" label="User ID" type="text" disabled />

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
                Password must be at least 12 characters, including uppercase, lowercase, number, and
                special character.
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
            Change Password
          </LoadingButton>
        </Stack>
      </Box>
    </FormProvider>
  );
}
