import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// components
import FormProvider, { RHFTextField, RHFSelect, RHFAutocomplete, RHFUpload } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import { endpoints } from 'src/utils/endpoints';
import axiosInstance from 'src/utils/axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const password = useBoolean();
  const rePassword = useBoolean();

  const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Nama lengkap wajib diisi'),
    phone: Yup.string().required('Nomor telepon wajib diisi'),
    email: Yup.string()
      .required('Email wajib diisi')
      .email('Format email tidak valid'),
    password: Yup.string().required('Password wajib diisi').min(6, 'Password minimal 6 karakter'),
    rePassword: Yup.string()
      .required('Ulangi password wajib diisi')
      .oneOf([Yup.ref('password')], 'Password tidak cocok'),
    // Data Akademis
    internId: Yup.string().required('NIM / ID Peserta wajib diisi'),
    university: Yup.string().required('Asal instansi wajib diisi'),
    gender: Yup.string().required('Jenis kelamin wajib dipilih'),
    dateOfBirth: Yup.mixed().nullable(),
    major: Yup.string().required('Jurusan wajib diisi'),
    startDate: Yup.mixed().nullable(),
    endDate: Yup.mixed().nullable(),
    program: Yup.string().required('Program wajib dipilih'),
    documentUrls: Yup.array(),
  });

  const defaultValues = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    rePassword: '',
    internId: '',
    university: '',
    gender: '',
    dateOfBirth: null,
    major: '',
    startDate: null,
    endDate: null,
    program: '',
    documentUrls: [] as string[],
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema) as any,
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const handleDropMultiFile = (acceptedFiles: File[]) => {
    const files = watch('documentUrls') || [];
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setValue('documentUrls', [...files, ...newFiles], { shouldValidate: true });
  };

  const handleRemoveFile = (inputFile: File | string) => {
    const filtered = (watch('documentUrls') || []).filter((file: File | string) => file !== inputFile);
    setValue('documentUrls', filtered);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Upload multiple files first
      const uploadedUrls: string[] = [];
      const currentFiles = data.documentUrls || [];
      
      for (const file of currentFiles) {
        if (file instanceof File) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'documents');
          
          const uploadRes = await axiosInstance.post('/gcp-item/upload-public', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          uploadedUrls.push(uploadRes.data.url);
        } else if (typeof file === 'string') {
          uploadedUrls.push(file);
        }
      }

      const mappingData = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        // Hardcoded values
        positionId: '30305042',
        jobTitle: 'Production Unit Jakarta',
        role: 'PESERTA',
        status: 'pending',
        // Data Akademis
        internId: data.internId,
        university: data.university,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
        major: data.major,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        program: data.program,
        documentUrls: uploadedUrls,
      };

      await axiosInstance.post(`${endpoints.auth.register}`, mappingData, {});

      toast.success('Pendaftaran berhasil! Silakan tunggu persetujuan admin.');
      setIsSubmitSuccess(true);
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || 'Terjadi kesalahan saat mendaftar';
      setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mt: { lg: 0 }, mb: 5, position: 'relative' }}>
      <Typography variant="h4">Pendaftaran Peserta Magang</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Sudah punya akun?</Typography>

        <Link href={paths.auth.login} component={RouterLink} variant="subtitle2">
          Masuk di sini
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        mb: 5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {'Dengan mendaftar, saya menyetujui '}
      <Link
        component={RouterLink}
        href={paths.privacyPolicy.root}
        underline="always"
        color="text.primary"
      >
        Kebijakan Privasi
      </Link>
      .
    </Typography>
  );

  const renderAfter = (
    <Stack spacing={2.5}>
      <Alert severity="info">
        Pendaftaran Anda berhasil dikirim! <br />
        Silakan tunggu persetujuan dari Admin. Anda akan menerima email notifikasi saat akun Anda disetujui.
      </Alert>

      <Button
        variant="soft"
        color="info"
        href={paths.waSystem}
        target="_blank"
        rel="noopener"
        size="small"
      >
        Hubungi Kami
      </Button>

      <Link component={RouterLink} href={paths.auth.login} variant="subtitle2">
        Kembali ke Halaman Login
      </Link>
    </Stack>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {/* --- DATA DIRI --- */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Data Diri
        </Typography>

        <Box
          rowGap={2.5}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <RHFTextField name="fullName" label="Nama Lengkap" />
          <RHFTextField name="email" label="Alamat Email" />
          <RHFTextField name="phone" label="Nomor Telepon" />
          <RHFSelect name="gender" label="Jenis Kelamin">
            <MenuItem value="PRIA">Pria</MenuItem>
            <MenuItem value="WANITA">Wanita</MenuItem>
          </RHFSelect>
        </Box>

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              label="Tanggal Lahir"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
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

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* --- DATA AKADEMIS --- */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:case-round-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Data Akademis
        </Typography>

        <Box
          rowGap={2.5}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <RHFTextField name="internId" label="NIM / ID Peserta" />
          <RHFTextField name="university" label="Asal Instansi / Universitas" />
          <RHFTextField name="major" label="Jurusan" />
          <RHFSelect name="program" label="Program">
            <MenuItem value="PKL">PKL</MenuItem>
            <MenuItem value="Internship PTPL">Internship PTPL</MenuItem>
            <MenuItem value="Internship Kemnaker">Internship Kemnaker</MenuItem>
          </RHFSelect>
        </Box>

        <Box
          rowGap={2.5}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Controller
            name="startDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DatePicker
                label="Tanggal Mulai"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
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
                onChange={(newValue) => field.onChange(newValue)}
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
        </Box>

        <RHFUpload
          multiple
          name="documentUrls"
          maxSize={3145728}
          accept={{
            'application/pdf': [],
            'application/msword': [],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
            'application/zip': [],
            'application/x-rar-compressed': [],
            'image/*': [],
          }}
          onDrop={handleDropMultiFile}
          onRemove={handleRemoveFile}
          onRemoveAll={() => setValue('documentUrls', [])}
          helperText={
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.disabled' }}>
              Boleh mengunggah CV, Surat Pengantar, Proposal, dsb. (Opsional). Max ukuran 3MB/file.
            </Typography>
          }
        />

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* --- PASSWORD --- */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          <Iconify icon="solar:lock-keyhole-bold-duotone" sx={{ mr: 1, verticalAlign: 'middle' }} />
          Keamanan Akun
        </Typography>

        <RHFTextField
          name="password"
          label="Password"
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
          helperText="Minimal 8 karakter, maksimal 32 karakter, harus mengandung huruf dan angka."
        />
        <RHFTextField
          name="rePassword"
          label="Ulangi Password"
          type={rePassword.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={rePassword.onToggle} edge="end">
                  <Iconify icon={rePassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Daftar Sekarang
        </LoadingButton>
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {isSubmitSuccess ? renderAfter : renderForm}
      {!isSubmitSuccess && renderTerms}
    </>
  );
}
