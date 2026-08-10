import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/pages/paths';
import { useRouter } from 'src/hooks/use-router';
// types
import { IUserItem } from 'src/types/user';
// components
import Label from 'src/components/label';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import { userRoles } from 'src/assets/ptpl/roles';
import { useSearchPosition } from 'src/pages/position/query';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, InputAdornment, MenuItem } from '@mui/material';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import { USER_STATUS_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
};

export default function UserNewEditForm({ currentUser }: Props) {
  const router = useRouter();
  const password = useBoolean();
  const queryClient = useQueryClient();
  const isIdaman = !!currentUser?.idamanId;

  const { searchPositionResults } = useSearchPosition({ where: { teamId: { not: null } } });

  const NewUserSchema = Yup.object().shape({
    id: Yup.string(),
    name: Yup.string().required('Name is required'),
    password: Yup.string().when('id', (id, schema) =>
      id ? schema.nullable() : schema.required('Password is required')
    ),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phone: Yup.string().required('Phone Number is required'),
    positionId: Yup.string().required('Position is required'),
    jobTitle: Yup.string().required('Position Name is required'),
    teamId: Yup.string().required('Team ID is required'),
    role: Yup.string().required('Role is required'),
    photoUrl: Yup.mixed<any>().nullable(),
    status: Yup.string(),
    isVerified: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      password: currentUser?.password || '',
      role: currentUser?.role || '',
      email: currentUser?.email || '',
      jobTitle: currentUser?.jobTitle || '',
      status: currentUser?.status && currentUser?.status !== '' ? currentUser?.status : 'active',
      positionId: currentUser?.positionId || '',
      teamId: currentUser?.teamId || '',
      photoUrl: currentUser?.photoUrl || null,
      phone: currentUser?.phoneNumber || currentUser?.phone || '',
      isVerified: currentUser?.isVerified || true,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    const position = searchPositionResults?.find((pos) => pos.id === values.positionId);

    setValue('jobTitle', position?.name || '');
    setValue('teamId', position?.teamId || '');
  }, [currentUser?.positionId, searchPositionResults, values.positionId, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('Your request have been processing, please wait...');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, isVerified: __, ...dataWithoutPassword } = data;
      const res =
        data.id === ''
          ? await axiosInstance.post(`${endpoints.auth.register}`, data)
          : await axiosInstance.patch(`${endpoints.user.edit(data.id || '')}`, dataWithoutPassword);

      toast.update(toastId, {
        render: 'Data successfully submitted!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      reset();

      await queryClient.invalidateQueries({
        queryKey: ['getUserRequestByTeam', res.data],
      });

      router.push(paths.userManagement.root);
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Data error!',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const [verificationLoading, setVerificationLoading] = useState(false);
  const sentVerification = async () => {
    try {
      setVerificationLoading(true);
      const mappingData = {
        email: currentUser?.email || '',
        id: currentUser?.id || '',
      };
      await axiosInstance.post(`${endpoints.mail.sentVerification}`, mappingData, {});

      setVerificationLoading(false);
      toast.success(`Verification Sent Successfully!`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="photoUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Banned
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Apply disable account
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />

            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  Delete User
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="name" label="Full Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phone" label="Phone Number" />

              <RHFSelect name="status" label="Status">
                {USER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              {values.id === '' && (
                <RHFTextField
                  name="password"
                  type={password.value ? 'text' : 'password'}
                  label="Password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={password.onToggle} edge="end">
                          <Iconify
                            icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <RHFAutocomplete
                name="positionId"
                label="Position ID"
                options={searchPositionResults.map((position) => position.id)}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                renderOption={(props, option) => {
                  const { name, id } = searchPositionResults.filter(
                    (position) => position.id === option
                  )[0];

                  if (!id) {
                    return null;
                  }

                  return (
                    <li {...props} key={id}>
                      {id} - {name}
                    </li>
                  );
                }}
              />

              <RHFTextField name="jobTitle" label="Job Title" disabled />
              <RHFTextField name="teamId" label="Team ID" disabled />

              <RHFAutocomplete
                name="role"
                label="Role For Application"
                options={userRoles.map((role) => role.code)}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                renderOption={(props, option) => {
                  const { code, label } = userRoles.filter((role) => role.code === option)[0];

                  if (!code) {
                    return null;
                  }

                  return (
                    <li {...props} key={code}>
                      {label} ({code})
                    </li>
                  );
                }}
              />
            </Box>

            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 3 }}>
              {isIdaman ? (
                <Stack />
              ) : (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={sentVerification}
                  disabled={verificationLoading || currentUser?.status !== 'pending'}
                >
                  {verificationLoading ? (
                    <>Loading...</> // You can replace this with a spinner if you want
                  ) : (
                    <>
                      <Iconify icon="eva:email-outline" sx={{ mr: 1 }} />
                      Send Verification Email
                    </>
                  )}
                </Button>
              )}
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Create User' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
