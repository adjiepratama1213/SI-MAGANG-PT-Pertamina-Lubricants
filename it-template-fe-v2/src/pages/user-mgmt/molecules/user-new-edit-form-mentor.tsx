import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/pages/paths';
import { useRouter } from 'src/hooks/use-router';
// types
import { IUserItem } from 'src/types/user';
// components
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
  isViewOnly?: boolean;
  onClose?: VoidFunction;
};

export default function UserNewEditFormMentor({ currentUser, isViewOnly, onClose }: Props) {
  const router = useRouter();
  const password = useBoolean();
  const queryClient = useQueryClient();
  const isIdaman = !!currentUser?.idamanId;

  const { searchPositionResults } = useSearchPosition({ where: { teamId: { not: null } } });

  const NewUserSchema = Yup.object().shape({
    id: Yup.string(),
    name: Yup.string().required('Name is required'),
    password: Yup.string().when('id', ([id], schema) =>
      id ? schema.nullable() : schema
        .required('Password is required')
        .min(8, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
        .max(32, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
        .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka.')
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
    
    // Pertamina Global Profile Fields
    employeeId: Yup.string().nullable(),
    jabatan: Yup.string().nullable(),
    direktorat: Yup.string().nullable(),
    fungsi: Yup.string().nullable(),
    subFungsi: Yup.string().nullable(),
    gender: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      password: currentUser?.password || '',
      role: currentUser?.role || 'EMPLOYEESTAFF',
      email: currentUser?.email || '',
      jobTitle: currentUser?.jobTitle || '',
      status: currentUser?.status && currentUser?.status !== '' ? currentUser?.status : 'active',
      positionId: currentUser?.positionId || '',
      teamId: currentUser?.teamId || '',
      photoUrl: currentUser?.photoUrl || null,
      phone: currentUser?.phoneNumber || currentUser?.phone || '',
      isVerified: currentUser?.isVerified || true,

      // Profile Fields
      employeeId: currentUser?.employeeProfile?.employeeId || '',
      jabatan: currentUser?.employeeProfile?.jabatan || '',
      direktorat: currentUser?.employeeProfile?.direktorat || '',
      fungsi: currentUser?.employeeProfile?.fungsi || '',
      subFungsi: currentUser?.employeeProfile?.subFungsi || '',
      gender: currentUser?.employeeProfile?.gender || '',
    }),
    [currentUser]
  );

  const methods = useForm<any>({
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

  useEffect(() => {
    if (!currentUser && !values.positionId && searchPositionResults && searchPositionResults.length > 0) {
      setValue('positionId', searchPositionResults[0].id);
    }
  }, [currentUser, searchPositionResults, values.positionId, setValue]);

  const [organizations, setOrganizations] = useState<any[]>([]);
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axiosInstance.get(endpoints.employeeProfile.organizationsHierarchy);
        setOrganizations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrgs();
  }, []);

  const dirOptions = useMemo(() => organizations.map(o => o.name), [organizations]);
  const selectedOrg = useMemo(() => organizations.find(o => o.name === values.direktorat), [organizations, values.direktorat]);
  const fungsiOptions = useMemo(() => selectedOrg ? selectedOrg.fungsi.map((f: any) => f.name) : [], [selectedOrg]);
  const selectedFungsi = useMemo(() => selectedOrg?.fungsi.find((f: any) => f.name === values.fungsi), [selectedOrg, values.fungsi]);
  const subFungsiOptions = useMemo(() => selectedFungsi ? selectedFungsi.subFungsi.map((sf: any) => sf.name) : [], [selectedFungsi]);

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('Your request have been processing, please wait...');
    try {
      let finalPhotoUrl = data.photoUrl;
      if (data.photoUrl && data.photoUrl instanceof File) {
        const formData = new FormData();
        formData.append('file', data.photoUrl);
        formData.append('folder', 'users');

        const uploadRes = await axiosInstance.post('/gcp-item/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalPhotoUrl = uploadRes.data.url;
      }
      data.photoUrl = finalPhotoUrl;

      // Separate User data and Profile data
      const {
        password: _,
        isVerified: __,
        employeeId,
        jabatan,
        direktorat,
        fungsi,
        subFungsi,
        gender,
        ...dataWithoutPassword
      } = data;
      dataWithoutPassword.photoUrl = finalPhotoUrl;
      
      const res =
        data.id === ''
          ? await axiosInstance.post(`${endpoints.auth.register}`, data)
          : await axiosInstance.patch(`${endpoints.user.edit(data.id || '')}`, dataWithoutPassword);

      const userId = res.data?.id || currentUser?.id;

      // Handle Employee Profile
      const profileData = {
        userId,
        employeeId: employeeId || undefined,
        jabatan: jabatan || undefined,
        direktorat: direktorat || undefined,
        fungsi: fungsi || undefined,
        subFungsi: subFungsi || undefined,
        gender: gender || undefined,
      };

      if (currentUser?.employeeProfile?.id) {
        // Edit existing profile
        await axiosInstance.patch(
          `${endpoints.employeeProfile.details(currentUser.employeeProfile.id)}`,
          profileData
        );
      } else {
        // Create new profile
        await axiosInstance.post(`${endpoints.employeeProfile.list}`, profileData);
      }

      toast.update(toastId, {
        render: 'Data successfully submitted!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      reset();

      await queryClient.invalidateQueries({
        queryKey: ['getUserRequestByTeam'],
      });

      if (onClose) {
        onClose();
      } else {
        router.push(paths.userManagement.root);
      }
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
      <fieldset disabled={isViewOnly} style={{ border: 'none', margin: 0, padding: 0 }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Box sx={{ pt: 5, pb: 5, px: 3 }}>

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="photoUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                disabled={isViewOnly}
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
                        disabled={isViewOnly}
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
              disabled={isViewOnly}
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

            {currentUser && !isViewOnly && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  Delete User
                </Button>
              </Stack>
            )}
          </Box>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ pt: 1, pb: 2 }}>
            <CardHeader title="Informasi Mentor" subheader="Masukkan data profil mentor di bawah ini" sx={{ mb: 2 }} />
            <CardContent>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="name" label="Full Name" disabled={isViewOnly} />
                <RHFTextField name="email" label="Email Address" disabled={isViewOnly} />
                <RHFTextField name="phone" label="Phone Number" disabled={isViewOnly} />

                <RHFSelect name="status" label="Status" disabled={isViewOnly}>
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
                    helperText="Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka."
                  />
                )}

                <RHFAutocomplete
                  name="positionId"
                  label="Position ID"
                  disabled={isViewOnly}
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
                  disabled
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

                {/* PERTAMINA GLOBAL FIELDS */}
                <Grid xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Pertamina Profile Information
                  </Typography>
                </Grid>

                <RHFTextField name="employeeId" label="NIP / Employee ID" disabled={isViewOnly} />
                <RHFTextField name="jabatan" label="Jabatan (Global)" disabled={isViewOnly} />
                <RHFAutocomplete
                  name="direktorat"
                  label="Direktorat"
                  disabled={isViewOnly}
                  options={dirOptions}
                  freeSolo
                  onInputChange={(event, newInputValue) => {
                    setValue('direktorat', newInputValue || '');
                    setValue('fungsi', '');
                    setValue('subFungsi', '');
                  }}
                  onChange={(event, newValue) => {
                    setValue('direktorat', newValue || '');
                    setValue('fungsi', '');
                    setValue('subFungsi', '');
                  }}
                />
                <RHFAutocomplete
                  name="fungsi"
                  label="Fungsi"
                  options={fungsiOptions}
                  freeSolo
                  disabled={isViewOnly || !values.direktorat}
                  onInputChange={(event, newInputValue) => {
                    setValue('fungsi', newInputValue || '');
                    setValue('subFungsi', '');
                  }}
                  onChange={(event, newValue) => {
                    setValue('fungsi', newValue || '');
                    setValue('subFungsi', '');
                  }}
                />
                <RHFAutocomplete
                  name="subFungsi"
                  label="Sub-Fungsi"
                  options={subFungsiOptions}
                  freeSolo
                  disabled={isViewOnly || !values.fungsi}
                  onInputChange={(event, newInputValue) => {
                    setValue('subFungsi', newInputValue || '');
                  }}
                  onChange={(event, newValue) => {
                    setValue('subFungsi', newValue || '');
                  }}
                />
                <RHFSelect name="gender" label="Jenis Kelamin" disabled={isViewOnly}>
                  <MenuItem value="PRIA">Pria</MenuItem>
                  <MenuItem value="WANITA">Wanita</MenuItem>
                </RHFSelect>
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
                      <>Loading...</>
                    ) : (
                      <>
                        <Iconify icon="eva:email-outline" sx={{ mr: 1 }} />
                        Send Verification Email
                      </>
                    )}
                  </Button>
                )}
                {!isViewOnly && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={onClose}>
                      Batal
                    </Button>
                    <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                      {!currentUser ? 'Create User' : 'Simpan'}
                    </LoadingButton>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </fieldset>
    </FormProvider>
  );
}
