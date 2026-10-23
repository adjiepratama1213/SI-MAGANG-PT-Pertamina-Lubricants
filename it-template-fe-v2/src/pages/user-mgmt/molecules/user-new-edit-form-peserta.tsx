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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  RHFUpload,
} from 'src/components/hook-form';
import { userRoles } from 'src/assets/ptpl/roles';
import { useSearchPosition } from 'src/pages/position/query';
import { useBoolean } from 'src/hooks/use-boolean';
import { IconButton, InputAdornment, MenuItem, TextField, Autocomplete } from '@mui/material';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { USER_STATUS_OPTIONS } from 'src/_mock';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  isViewOnly?: boolean;
  onClose?: VoidFunction;
};

export default function UserNewEditFormPeserta({ currentUser, isViewOnly, onClose }: Props) {
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

    // Intern Profile Fields
    internId: Yup.string().required('NIM / ID Peserta is required'),
    university: Yup.string().required('University is required'),
    gender: Yup.string().required('Gender is required'),
    dateOfBirth: Yup.date().required('Date of Birth is required'),
    major: Yup.string().required('Major is required'),
    startDate: Yup.date().required('Start Date is required'),
    endDate: Yup.date().required('End Date is required'),
    program: Yup.string().required('Program is required'),
    documentUrls: Yup.array().test(
      'fileSize',
      'Ukuran berkas tidak boleh melebihi 5MB',
      (files) => {
        if (!files || files.length === 0) return true;
        return files.every((f: any) => {
          if (f instanceof File) {
            return f.size <= 5 * 1024 * 1024;
          }
          return true;
        });
      }
    ).nullable(),
    mentorProfileId: Yup.string().nullable(),
    bankName: Yup.string().nullable(),
    bankAccount: Yup.string().nullable(),
    direktorat: Yup.string().nullable(),
    fungsi: Yup.string().nullable(),
    subFungsi: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      password: currentUser?.password || '',
      role: currentUser?.role || 'PESERTA',
      email: currentUser?.email || '',
      jobTitle: currentUser?.jobTitle || '',
      status: currentUser?.status && currentUser?.status !== '' ? currentUser?.status : 'active',
      positionId: currentUser?.positionId || '',
      teamId: currentUser?.teamId || '',
      photoUrl: currentUser?.photoUrl || null,
      phone: currentUser?.phoneNumber || currentUser?.phone || '',
      isVerified: currentUser?.isVerified || true,

      // Intern Profile Fields
      internId: currentUser?.internProfile?.internId || '',
      university: currentUser?.internProfile?.university || '',
      gender: currentUser?.internProfile?.gender || '',
      dateOfBirth: currentUser?.internProfile?.dateOfBirth ? new Date(currentUser.internProfile.dateOfBirth) : null,
      major: currentUser?.internProfile?.major || '',
      startDate: currentUser?.internProfile?.startDate ? new Date(currentUser.internProfile.startDate) : null,
      endDate: currentUser?.internProfile?.endDate ? new Date(currentUser.internProfile.endDate) : null,
      program: currentUser?.internProfile?.program || '',
      documentUrls: currentUser?.internProfile?.documentUrls || [],
      mentorProfileId: currentUser?.internProfile?.mentorProfileId || '',
      bankName: (currentUser?.internProfile as any)?.bankName || '',
      bankAccount: (currentUser?.internProfile as any)?.bankAccount || '',
      direktorat: (currentUser?.internProfile?.mentor as any)?.direktorat || '',
      fungsi: (currentUser?.internProfile?.mentor as any)?.fungsi || '',
      subFungsi: (currentUser?.internProfile?.mentor as any)?.subFungsi || '',
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
    if (currentUser) {
      reset(defaultValues);
    }
  }, [currentUser, defaultValues, reset]);

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

  // Fetch Mentors (Role: EMPLOYEESTAFF)
  const { data: mentorsData } = useQuery({
    queryKey: ['getMentors'],
    queryFn: async () => {
      const res = await axiosInstance.post(endpoints.user.search, {
        take: 100,
        where: { role: 'EMPLOYEESTAFF' },
      });
      return res.data?.results || [];
    },
  });

  const mentorsList = useMemo(() => {
    if (!Array.isArray(mentorsData)) return [];
    return mentorsData.filter(
      (u: any) => u?.role === 'EMPLOYEESTAFF' && !!u?.employeeProfile
    );
  }, [mentorsData]);

  // Sinkronisasi data mentor ke direktorat, fungsi, subFungsi
  useEffect(() => {
    if (mentorsList && values.mentorProfileId) {
      const found = mentorsList.find((m: any) => m.employeeProfile?.id === values.mentorProfileId);
      if (found?.employeeProfile) {
        if (!values.direktorat) setValue('direktorat', found.employeeProfile.direktorat || '');
        if (!values.fungsi) setValue('fungsi', found.employeeProfile.fungsi || '');
        if (!values.subFungsi) setValue('subFungsi', found.employeeProfile.subFungsi || '');
      }
    }
  }, [mentorsList, values.mentorProfileId, values.direktorat, values.fungsi, values.subFungsi, setValue]);

  const isKemnaker =
    (values.program || '').toLowerCase().includes('kemnaker') ||
    (values.program || '').toLowerCase().includes('kemenaker');
  const isPtpl = (values.program || '').toLowerCase().includes('ptpl');
  const showBankInfo = isKemnaker || isPtpl;

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('Your request have been processing, please wait...');
    try {
      // Separate User data and Profile data
      const {
        password: _,
        isVerified: __,
        internId,
        university,
        gender,
        dateOfBirth,
        major,
        startDate,
        endDate,
        program,
        documentUrls,
        mentorProfileId,
        bankName,
        bankAccount,
        direktorat,
        fungsi,
        subFungsi,
        ...dataWithoutPassword
      } = data;

      let finalDocumentUrls = [...(documentUrls || [])];

      if (documentUrls && documentUrls.length > 0) {
        for (const doc of documentUrls) {
          if (doc instanceof File && doc.size > 5 * 1024 * 1024) {
            toast.error(`Berkas "${doc.name}" melebihi batas maksimal 5MB!`);
            toast.dismiss(toastId);
            return;
          }
        }

        finalDocumentUrls = (
          await Promise.all(
            documentUrls.map(async (doc: any) => {
              if (doc instanceof File || (typeof doc === 'object' && doc !== null && 'name' in doc && 'size' in doc)) {
                const formData = new FormData();
                formData.append('file', doc);
                formData.append('folder', 'documents');

                const uploadRes = await axiosInstance.post('/gcp-item/upload', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
                return uploadRes.data.url;
              }
              if (typeof doc === 'string' && doc.trim() && doc !== '[object File]' && !doc.includes('[object')) {
                return doc;
              }
              return null;
            })
          )
        ).filter(Boolean);
      }

      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        status: data.status,
        positionId: data.positionId,
        jobTitle: data.jobTitle,
        teamId: data.teamId,
        role: data.role || 'PESERTA',
        photoUrl: data.photoUrl,
        internId: internId || null,
        university: university || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        major: major || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        program: program || null,
        documentUrls: finalDocumentUrls || [],
        mentorProfileId: mentorProfileId || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
      };

      const res =
        data.id === ''
          ? await axiosInstance.post(`${endpoints.auth.register}`, registerData)
          : await axiosInstance.patch(`${endpoints.user.edit(data.id || '')}`, dataWithoutPassword);

      const userId = res.data?.id || currentUser?.id;

      // Handle Intern Profile
      const profileData: any = {
        userId,
        internId: internId || null,
        university: university || null,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        major: major || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        program: program || null,
        documentUrls: finalDocumentUrls || [],
        mentorProfileId: mentorProfileId || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
      };

      if (currentUser?.internProfile?.id) {
        // Edit existing profile
        await axiosInstance.patch(
          `${endpoints.internProfile.details(currentUser.internProfile.id)}`,
          profileData
        );
      } else {
        // Create new or update profile
        try {
          const existingProfile = await axiosInstance.get(endpoints.internProfile.byUser(userId));
          if (existingProfile.data?.id) {
            await axiosInstance.patch(
              `${endpoints.internProfile.details(existingProfile.data.id)}`,
              profileData
            );
          } else {
            await axiosInstance.post(`${endpoints.internProfile.list}`, profileData);
          }
        } catch {
          await axiosInstance.post(`${endpoints.internProfile.list}`, profileData);
        }
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
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message;
      const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg || 'Gagal menyimpan data pengguna!';
      toast.update(toastId, {
        render: errorMsg,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
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

  const handleDropDocuments = useCallback(
    (acceptedFiles: File[]) => {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const files = values.documentUrls || [];
      const validFiles: File[] = [];

      acceptedFiles.forEach((file) => {
        if (file.size > MAX_SIZE) {
          toast.error(`Berkas "${file.name}" melebihi batas maksimal 5MB!`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        const newFiles = validFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        setValue('documentUrls', [...files, ...newFiles], { shouldValidate: true });
      }
    },
    [setValue, values.documentUrls]
  );

  const handleRemoveDocument = useCallback(
    (inputFile: File | string) => {
      const filtered =
        values.documentUrls &&
        values.documentUrls?.filter((file: File | string) => file !== inputFile);
      setValue('documentUrls', filtered, { shouldValidate: true });
    },
    [setValue, values.documentUrls]
  );

  const handleRemoveAllDocuments = useCallback(() => {
    setValue('documentUrls', [], { shouldValidate: true });
  }, [setValue]);

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

              {currentUser && values.status === 'pending' && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 1.5,
                    bgcolor: 'warning.lighter',
                    border: '1px solid',
                    borderColor: 'warning.light',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:clock-circle-bold" sx={{ color: 'warning.dark' }} />
                    <Typography variant="subtitle2" sx={{ color: 'warning.darker' }}>
                      Status Akun: Menunggu Persetujuan (Pending)
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'warning.dark', fontSize: '13px' }}>
                    Peserta baru mendaftar dan membutuhkan persetujuan Administrator.
                  </Typography>
                  {!isViewOnly && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Iconify icon="solar:check-circle-bold" />}
                      onClick={() => {
                        setValue('status', 'active', { shouldValidate: true, shouldDirty: true });
                        toast.info('Status diubah ke Aktif. Klik "Simpan Perubahan" untuk menyimpan.');
                      }}
                      sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                    >
                      Terima & ACC Peserta (Jadikan Aktif)
                    </Button>
                  )}
                </Box>
              )}

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
                          checked={field.value === 'banned'}
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
                        Nonaktifkan akun pengguna
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
            <Box sx={{ p: 3 }}>
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
                    helperText="Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka."
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

                {/* DATA MAGANG */}
                <Grid xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Data Akademis
                  </Typography>
                </Grid>

                <RHFTextField name="internId" label="NIM / ID Peserta" disabled={isViewOnly} />
                <RHFTextField name="university" label="Asal Instansi / Universitas" disabled={isViewOnly} />

                <RHFSelect name="gender" label="Jenis Kelamin" disabled={isViewOnly}>
                  <MenuItem value="PRIA">Pria</MenuItem>
                  <MenuItem value="WANITA">Wanita</MenuItem>
                </RHFSelect>

                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Tanggal Lahir"
                      value={field.value}
                      disabled={isViewOnly}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />

                <RHFTextField name="major" label="Jurusan" disabled={isViewOnly} />
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Tanggal Mulai"
                      value={field.value}
                      disabled={isViewOnly}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Tanggal Selesai"
                      value={field.value}
                      disabled={isViewOnly}
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />

                <RHFSelect name="program" label="Program" disabled={isViewOnly}>
                  <MenuItem value="PKL">PKL</MenuItem>
                  <MenuItem value="Internship PTPL">Internship PTPL</MenuItem>
                  <MenuItem value="Internship Kemnaker">Internship Kemnaker</MenuItem>
                </RHFSelect>

                {isKemnaker && (
                  <>
                    <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                      <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                        <Typography variant="subtitle2" sx={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                          <Iconify icon="solar:info-circle-bold" />
                          Pendataan Khusus Program Internship Kemnaker
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#15803d', mt: 0.5, display: 'block' }}>
                          Peserta program Internship Kemnaker menggunakan portal mandiri Kemnaker. Formulir ini khusus untuk pendataan internal termasuk penugasan mentor, penempatan struktur organisasi, dan nomor rekening peserta.
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                        Penugasan Mentor
                      </Typography>
                      <Autocomplete
                        options={mentorsList}
                        getOptionLabel={(option: any) => `${option?.name || 'Unknown'}`}
                        value={mentorsList.find((m: any) => m.employeeProfile?.id === values.mentorProfileId) || null}
                        onChange={(_, newValue: any) => {
                          if (newValue) {
                            setValue('mentorProfileId', newValue.employeeProfile?.id || '', { shouldValidate: true });
                            setValue('direktorat', newValue.employeeProfile?.direktorat || '', { shouldValidate: true });
                            setValue('fungsi', newValue.employeeProfile?.fungsi || '', { shouldValidate: true });
                            setValue('subFungsi', newValue.employeeProfile?.subFungsi || '', { shouldValidate: true });
                          } else {
                            setValue('mentorProfileId', '', { shouldValidate: true });
                            setValue('direktorat', '', { shouldValidate: true });
                            setValue('fungsi', '', { shouldValidate: true });
                            setValue('subFungsi', '', { shouldValidate: true });
                          }
                        }}
                        disabled={isViewOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Pilih Mentor..."
                            placeholder="Ketik nama mentor"
                            helperText="Hanya menampilkan akun mentor. Data Direktorat, Fungsi, dan Sub Fungsi otomatis terisi"
                          />
                        )}
                        renderOption={(props, option: any) => (
                          <li {...props} key={option.id}>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.employeeProfile?.jabatan || 'Staff'} • {option.employeeProfile?.direktorat || '-'} • {option.employeeProfile?.fungsi || '-'}
                              </Typography>
                            </Box>
                          </li>
                        )}
                      />
                    </Box>

                    <RHFTextField
                      name="direktorat"
                      label="Direktorat"
                      disabled={isViewOnly}
                      InputProps={{
                        readOnly: true,
                        sx: { bgcolor: '#f8fafc' },
                      }}
                      helperText="Otomatis ditarik dari database mentor"
                    />

                    <RHFTextField
                      name="fungsi"
                      label="Fungsi"
                      disabled={isViewOnly}
                      InputProps={{
                        readOnly: true,
                        sx: { bgcolor: '#f8fafc' },
                      }}
                      helperText="Otomatis ditarik dari database mentor"
                    />

                    <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                      <RHFTextField
                        name="subFungsi"
                        label="Sub Fungsi"
                        disabled={isViewOnly}
                        InputProps={{
                          readOnly: true,
                          sx: { bgcolor: '#f8fafc' },
                        }}
                        helperText="Otomatis ditarik dari database mentor"
                      />
                    </Box>
                  </>
                )}

                {showBankInfo && (
                  <>
                    <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Informasi Pembayaran / Rekening {isPtpl ? '(Internship PTPL)' : '(Internship Kemnaker)'}
                      </Typography>
                    </Box>

                    <RHFTextField
                      name="bankName"
                      label="Nama Bank"
                      placeholder="Contoh: Mandiri, BNI, BRI, BCA"
                      disabled={isViewOnly}
                    />

                    <RHFTextField
                      name="bankAccount"
                      label="Nomor Rekening"
                      placeholder="Contoh: 1234567890"
                      disabled={isViewOnly}
                    />
                  </>
                )}

                <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Dokumen Pendukung
                  </Typography>
                  <RHFUpload
                    multiple
                    thumbnail={false}
                    name="documentUrls"
                    maxSize={5242880}
                    onDrop={handleDropDocuments}
                    onRemove={handleRemoveDocument}
                    onRemoveAll={handleRemoveAllDocuments}
                    disabled={isViewOnly}
                    placeholder={
                      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            color: '#004F9F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon="solar:document-add-bold-duotone" width={28} />
                        </Box>

                        <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Unggah Dokumen Pendukung
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Tarik dan letakkan berkas di sini, atau{' '}
                            <Box
                              component="span"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                            >
                              telusuri berkas
                            </Box>{' '}
                            dari komputer Anda
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem', mt: 0.5 }}>
                            Format: PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB per berkas)
                          </Typography>
                        </Stack>
                      </Stack>
                    }
                    helperText={
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          display: 'block',
                          color: 'text.disabled',
                        }}
                      >
                        * Berkas yang diunggah dapat berupa CV, Surat Pengantar, Proposal, Transkrip Nilai, dll.
                      </Typography>
                    }
                  />
                </Box>

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
            </Box>
          </Grid>
        </Grid>
      </fieldset>
    </FormProvider>
  );
}
