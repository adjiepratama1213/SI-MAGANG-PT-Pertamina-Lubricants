import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';

import { toast } from 'react-toastify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useAuthContext } from 'src/auth/hooks';
import { useParams } from 'src/hooks/use-params';
import { useCheckMfaDetail } from 'src/pages/mfa/query';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function AccountChangeMfa({ currentUser }: { currentUser: any }) {
  const params = useParams();
  const userId = params.id ?? '';
  const { user } = useAuthContext();
  const currentRole = user?.role; // admin;

  const ChangeMfaSchema = Yup.object().shape({
    userId: Yup.string(),
    email: Yup.string(),
  });

  const { results: userMfaDetail } = useCheckMfaDetail({ id: currentUser.email });

  const defaultValues = {
    userId: currentRole === 'PTPL_IT' || currentRole === 'SUPERSAIYAN' ? userId : '',
    email: currentUser.email ?? '',
    encryptedSecret: userMfaDetail.encryptedSecret,
  };

  const methods = useForm({
    resolver: yupResolver(ChangeMfaSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset({
      ...defaultValues,
      encryptedSecret: userMfaDetail.encryptedSecret ?? '-',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMfaDetail]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await axiosInstance.delete(`${endpoints.mfa.remove}`, {
        data: {
          id: data.email,
        },
      });

      reset();
      toast('Delete MFA Success!');
      console.info('DATA', data);
    } catch (error) {
      toast(error);
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="userId" label="User ID" type="text" disabled />
        <RHFTextField name="email" label="Email" type="text" disabled />

        <RHFTextField
          name="encryptedSecret"
          label="User Encrypted Secret"
          type="text"
          multiline
          rows={3}
          disabled
          helperText={
            <Stack
              component="span"
              direction="row"
              alignItems="center"
              sx={{ color: userMfaDetail.encryptedSecret ? 'gray' : 'red' }}
            >
              <Iconify icon="eva:info-fill" width={16} sx={{ mr: 0.5 }} />
              {userMfaDetail.encryptedSecret
                ? 'Encrypted Secret is a secret key for MFA'
                : 'This user doesnt have any MFA configured yet'}
            </Stack>
          }
        />

        <LoadingButton
          type="submit"
          variant="contained"
          color="error"
          loading={isSubmitting}
          sx={{ ml: 'auto' }}
          disabled={!userMfaDetail.encryptedSecret}
        >
          Remove MFA
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
