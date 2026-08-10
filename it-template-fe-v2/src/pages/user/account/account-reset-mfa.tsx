import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import { Card, CardContent, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuthContext } from 'src/auth/hooks';
import { RHFTextField } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/pages/paths';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import * as z from 'zod';

const schema = z.object({
  code: z.string(),
  id: z.string().email(),
});

const defaultValues = {
  code: '',
  id: '',
};

export default function AccountResetMFA() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (user) {
      reset({ ...defaultValues, id: user?.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = handleSubmit(async (data) => {
    const URL = `${endpoints.mfa.reset}`;
    try {
      await axiosInstance.post(URL, { code: data.code, id: data.id });
      await logout();
      toast.success(`MFA Reset success: ${user?.email}`);
      router.push(paths.auth.login);
    } catch (err) {
      console.error(err);
      toast.error(`Reset failed!`);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card raised>
        <CardContent>
          <Stack spacing={2}>
            <RHFTextField name="id" label="Email" disabled={!!user} />
            <RHFTextField name="code" label="Your Back Up Code" />
            <LoadingButton variant="contained" type="submit" loading={isSubmitting}>
              Reset
            </LoadingButton>
          </Stack>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
