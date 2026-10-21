import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// components
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import { endpoints } from 'src/utils/endpoints';
import axiosInstance from 'src/utils/axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fData } from 'src/utils/format-number';
import packageInfo from '../../../../package.json';

// ----------------------------------------------------------------------

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: '#E2E8F0',
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
    py: '12px',
    px: '14px',
    color: '#0F172A',
    fontWeight: 500,
    '&::placeholder': {
      color: '#94A3B8',
      opacity: 1,
      fontSize: '13.5px',
      fontWeight: 400,
    },
  },
};

export default function JwtRegisterView() {
  const [step, setStep] = useState<number>(1);
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
    password: Yup.string()
      .required('Kata sandi wajib diisi')
      .min(8, 'Kata sandi minimal 8 karakter')
      .max(32, 'Kata sandi maksimal 32 karakter')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        'Kata sandi harus mengandung kombinasi huruf dan angka'
      ),
    rePassword: Yup.string()
      .required('Ulangi kata sandi wajib diisi')
      .oneOf([Yup.ref('password')], 'Kata sandi tidak cocok'),
    // Data Akademis
    internId: Yup.string().required('NIM / ID Peserta wajib diisi'),
    university: Yup.string().required('Asal instansi wajib diisi'),
    gender: Yup.string().required('Jenis kelamin wajib dipilih'),
    dateOfBirth: Yup.mixed()
      .required('Tanggal lahir wajib diisi')
      .nullable()
      .test('valid-date', 'Tanggal lahir wajib diisi', (val) => Boolean(val)),
    major: Yup.string().required('Jurusan wajib diisi'),
    startDate: Yup.mixed()
      .required('Tanggal mulai magang wajib diisi')
      .nullable()
      .test('valid-date', 'Tanggal mulai magang wajib diisi', (val) => Boolean(val)),
    endDate: Yup.mixed()
      .required('Tanggal selesai magang wajib diisi')
      .nullable()
      .test('valid-date', 'Tanggal selesai magang wajib diisi', (val) => Boolean(val))
      .test('after-start', 'Tanggal selesai harus setelah tanggal mulai', (val, { parent }) => {
        const { startDate } = parent;
        if (!startDate || !val) return true;
        return new Date(val as any) >= new Date(startDate as any);
      })
      .test(
        'max-duration-6-months',
        'Durasi magang tidak boleh lebih dari 6 bulan dari tanggal mulai',
        (val, { parent }) => {
          const { startDate } = parent;
          if (!startDate || !val) return true;
          const maxEnd = new Date(startDate as any);
          maxEnd.setMonth(maxEnd.getMonth() + 6);
          return new Date(val as any) <= maxEnd;
        }
      ),
    program: Yup.string().required('Program wajib dipilih'),
    bankName: Yup.string().when('program', {
      is: 'Internship PTPL',
      then: (schema) => schema.required('Nama bank wajib diisi untuk Internship PTPL'),
      otherwise: (schema) => schema.notRequired(),
    }),
    bankAccount: Yup.string().when('program', {
      is: 'Internship PTPL',
      then: (schema) => schema.required('Nomor rekening wajib diisi untuk Internship PTPL'),
      otherwise: (schema) => schema.notRequired(),
    }),
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
    ),
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
    bankName: '',
    bankAccount: '',
    documentUrls: [] as (File | string)[],
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
    trigger,
    formState: { isSubmitting },
  } = methods;

  const selectedProgram = watch('program');
  const documentFiles = watch('documentUrls') || [];
  const currentPassword = watch('password') || '';
  const currentRePassword = watch('rePassword') || '';

  const hasMinLength = currentPassword.length >= 8 && currentPassword.length <= 32;
  const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)/.test(currentPassword);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB

      if (fileRejections && fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const isTooLarge = rejection.errors?.some((e: any) => e.code === 'file-too-large');
          if (isTooLarge) {
            toast.error(`Berkas "${rejection.file.name}" melebihi batas maksimal 5MB!`);
          } else {
            toast.error(`Berkas "${rejection.file.name}" tidak dapat diproses: format tidak didukung.`);
          }
        });
      }

      const validFiles: File[] = [];
      acceptedFiles.forEach((file) => {
        if (file.size > MAX_SIZE) {
          toast.error(`Berkas "${file.name}" melebihi batas maksimal 5MB!`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        const current = watch('documentUrls') || [];
        setValue('documentUrls', [...current, ...validFiles], { shouldValidate: true });
      }
    },
    [setValue, watch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/zip': [],
      'application/x-rar-compressed': [],
      'image/*': [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleRemoveFile = (fileToRemove: File | string) => {
    const updated = documentFiles.filter((f) => f !== fileToRemove);
    setValue('documentUrls', updated, { shouldValidate: true });
  };

  const handleNextStep = async () => {
    setErrorMsg('');
    const isValid = await trigger([
      'fullName',
      'email',
      'phone',
      'gender',
      'dateOfBirth',
      'password',
      'rePassword',
    ]);
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg('Mohon periksa kembali formulir. Pastikan semua kolom wajib telah terisi dan kata sandi memenuhi ketentuan.');
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const currentFiles = data.documentUrls || [];

      // Validasi ketat ukuran berkas sebelum upload
      for (const file of currentFiles) {
        if (file instanceof File && file.size > 5 * 1024 * 1024) {
          toast.error(`Berkas "${file.name}" melebihi batas maksimal 5MB!`);
          return;
        }
      }

      // Upload multiple files first
      const uploadedUrls: string[] = [];

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
        bankName: data.program === 'Internship PTPL' ? data.bankName : null,
        bankAccount: data.program === 'Internship PTPL' ? data.bankAccount : null,
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

  const renderLabel = (label: string, required?: boolean) => (
    <Typography
      sx={{
        fontSize: '12.5px',
        fontWeight: 600,
        color: '#334155',
        mb: 0.75,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {label}
      {required && <Box component="span" sx={{ color: '#EF4444' }}>*</Box>}
    </Typography>
  );

  const renderHead = (
    <Stack spacing={0.75} sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: '#0F172A',
          fontSize: { xs: '24px', md: '28px' },
        }}
      >
        Pendaftaran Peserta Magang
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '13.5px' }}>
          Sudah punya akun?
        </Typography>

        <Link
          component={RouterLink}
          href={paths.auth.login}
          sx={{
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '13.5px',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Masuk di sini
        </Link>
      </Stack>
    </Stack>
  );

  const renderStepper = (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3.5 }}>
      {/* Step 1 */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer' }} onClick={() => setStep(1)}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: '#003882',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          {step > 1 ? '✓' : '1'}
        </Box>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: step === 1 ? 700 : 500,
            color: step === 1 ? '#0F172A' : '#64748B',
          }}
        >
          Data Diri
        </Typography>
      </Stack>

      {/* Divider */}
      <Box
        sx={{
          flexGrow: 1,
          maxWidth: { xs: 50, sm: 90 },
          minWidth: 16,
          height: '2px',
          bgcolor: step > 1 ? '#003882' : '#E2E8F0',
          transition: 'background-color 0.25s',
        }}
      />

      {/* Step 2 */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: step === 2 ? '#003882' : '#E2E8F0',
            color: step === 2 ? '#ffffff' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            transition: 'all 0.25s',
          }}
        >
          2
        </Box>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: step === 2 ? 700 : 500,
            color: step === 2 ? '#0F172A' : '#94A3B8',
          }}
        >
          Data Akademis
        </Typography>
      </Stack>
    </Stack>
  );

  const renderAfter = (
    <Stack spacing={2.5}>
      <Alert severity="success" sx={{ borderRadius: '10px' }}>
        Pendaftaran Anda berhasil dikirim! <br />
        Silakan tunggu persetujuan dari Admin. Anda akan menerima notifikasi saat akun Anda disetujui.
      </Alert>

      <Button
        variant="soft"
        color="info"
        href={paths.waSystem}
        target="_blank"
        rel="noopener"
        size="large"
        sx={{ borderRadius: '10px' }}
      >
        Hubungi Tim HR
      </Button>

      <Button
        component={RouterLink}
        href={paths.auth.login}
        variant="contained"
        sx={{ bgcolor: '#003882', borderRadius: '10px', height: 46 }}
      >
        Kembali ke Halaman Login
      </Button>
    </Stack>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {/* ================= STEP 1: DATA DIRI ================= */}
        {step === 1 && (
          <Stack spacing={2.25}>
            {/* Section Title */}
            <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#1E293B', pb: 0.5 }}>
              Data Diri
            </Typography>

            {/* Nama Lengkap */}
            <Box>
              {renderLabel('Nama Lengkap', true)}
              <RHFTextField
                name="fullName"
                placeholder="Masukkan nama lengkap"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:user-linear" width={18} sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </Box>

            {/* Email & Phone */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2}
            >
              <Box>
                {renderLabel('Alamat Email', true)}
                <RHFTextField
                  name="email"
                  placeholder="email@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:letter-linear" width={18} sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Box>

              <Box>
                {renderLabel('Nomor Telepon', true)}
                <RHFTextField
                  name="phone"
                  placeholder="+62 8xx xxxx xxxx"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:phone-linear" width={18} sx={{ color: '#64748B' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Gender & Tanggal Lahir */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2}
            >
              <Box>
                {renderLabel('Jenis Kelamin', true)}
                <RHFSelect
                  name="gender"
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (val: any) =>
                      !val ? (
                        <Box component="span" sx={{ color: '#94A3B8' }}>
                          Pilih Jenis Kelamin
                        </Box>
                      ) : val === 'PRIA' ? (
                        'Pria'
                      ) : (
                        'Wanita'
                      ),
                  }}
                  sx={inputStyle}
                >
                  <MenuItem value="PRIA">Pria</MenuItem>
                  <MenuItem value="WANITA">Wanita</MenuItem>
                </RHFSelect>
              </Box>

              <Box>
                {renderLabel('Tanggal Lahir', true)}
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: 'dd/mm/yyyy',
                          sx: inputStyle,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Kata Sandi */}
            <Box>
              {renderLabel('Kata Sandi', true)}
              <RHFTextField
                name="password"
                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:key-linear" width={18} sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={password.onToggle} edge="end" size="small">
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          width={18}
                          sx={{ color: '#64748B' }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />

              {/* Real-time Password Rules & Warnings Box */}
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', mb: 0.75 }}>
                  Ketentuan Kata Sandi:
                </Typography>
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Iconify
                      icon={hasMinLength ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      width={14}
                      sx={{ color: hasMinLength ? '#10B981' : '#94A3B8' }}
                    />
                    <Typography
                      sx={{
                        fontSize: '11.5px',
                        color: hasMinLength ? '#065F46' : '#64748B',
                        fontWeight: hasMinLength ? 600 : 400,
                      }}
                    >
                      8 - 32 karakter
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Iconify
                      icon={hasLetterAndNumber ? 'solar:check-circle-bold' : 'solar:close-circle-linear'}
                      width={14}
                      sx={{ color: hasLetterAndNumber ? '#10B981' : '#94A3B8' }}
                    />
                    <Typography
                      sx={{
                        fontSize: '11.5px',
                        color: hasLetterAndNumber ? '#065F46' : '#64748B',
                        fontWeight: hasLetterAndNumber ? 600 : 400,
                      }}
                    >
                      Mengandung kombinasi huruf dan angka
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            {/* Konfirmasi Kata Sandi */}
            <Box>
              {renderLabel('Konfirmasi Kata Sandi', true)}
              <RHFTextField
                name="rePassword"
                placeholder="Ulangi kata sandi"
                type={rePassword.value ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:lock-password-linear" width={18} sx={{ color: '#64748B' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={rePassword.onToggle} edge="end" size="small">
                        <Iconify
                          icon={rePassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          width={18}
                          sx={{ color: '#64748B' }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </Box>

            {/* Lanjutkan Button - NO ICON */}
            <Button
              fullWidth
              size="large"
              type="button"
              variant="contained"
              onClick={handleNextStep}
              sx={{
                height: 46,
                borderRadius: '12px',
                bgcolor: '#003882',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 700,
                mt: 1,
                boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
                '&:hover': {
                  bgcolor: '#002860',
                  boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
                },
              }}
            >
              Lanjutkan
            </Button>
          </Stack>
        )}

        {/* ================= STEP 2: DATA AKADEMIS ================= */}
        {step === 2 && (
          <Stack spacing={2.25}>
            {/* Section Title */}
            <Typography sx={{ fontSize: '14.5px', fontWeight: 700, color: '#1E293B', pb: 0.5 }}>
              Data Akademis & Program
            </Typography>

            {/* NIM & Instansi */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2}
            >
              <Box>
                {renderLabel('NIM / ID Peserta', true)}
                <RHFTextField
                  name="internId"
                  placeholder="Nomor induk mahasiswa"
                  sx={inputStyle}
                />
              </Box>

              <Box>
                {renderLabel('Asal Instansi', true)}
                <RHFTextField
                  name="university"
                  placeholder="Universitas / Politeknik"
                  sx={inputStyle}
                />
              </Box>
            </Box>

            {/* Jurusan & Program */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2}
            >
              <Box>
                {renderLabel('Jurusan', true)}
                <RHFTextField
                  name="major"
                  placeholder="Teknik Kimia, dll."
                  sx={inputStyle}
                />
              </Box>

              <Box>
                {renderLabel('Program', true)}
                <RHFSelect
                  name="program"
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (val: any) =>
                      !val ? (
                        <Box component="span" sx={{ color: '#94A3B8' }}>
                          Pilih Program
                        </Box>
                      ) : (
                        val
                      ),
                  }}
                  sx={inputStyle}
                >
                  <MenuItem value="PKL">PKL</MenuItem>
                  <MenuItem value="Internship PTPL">Internship PTPL</MenuItem>
                </RHFSelect>
              </Box>
            </Box>

            {/* Bank Info for Internship PTPL */}
            {selectedProgram === 'Internship PTPL' && (
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                gap={2}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                }}
              >
                <Box>
                  {renderLabel('Nama Bank', true)}
                  <RHFTextField
                    name="bankName"
                    placeholder="cth: Bank Mandiri / BNI / BRI / BCA"
                    sx={inputStyle}
                  />
                </Box>

                <Box>
                  {renderLabel('Nomor Rekening', true)}
                  <RHFTextField
                    name="bankAccount"
                    placeholder="Nomor rekening aktif"
                    sx={inputStyle}
                  />
                </Box>
              </Box>
            )}

            {/* Tanggal Mulai & Tanggal Selesai */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={2}
            >
              <Box>
                {renderLabel('Tanggal Mulai', true)}
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: 'dd/mm/yyyy',
                          sx: inputStyle,
                        },
                      }}
                    />
                  )}
                />
              </Box>

              <Box>
                {renderLabel('Tanggal Selesai', true)}
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      minDate={watch('startDate') ? new Date(watch('startDate') as any) : undefined}
                      maxDate={
                        watch('startDate')
                          ? (() => {
                              const d = new Date(watch('startDate') as any);
                              d.setMonth(d.getMonth() + 6);
                              return d;
                            })()
                          : undefined
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                          placeholder: 'dd/mm/yyyy',
                          sx: inputStyle,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Dokumen Pendukung File Upload */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                  Dokumen pendukung
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                  (Opsional)
                </Typography>
              </Stack>
              <Box
                {...getRootProps()}
                sx={{
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  py: 3.5,
                  px: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#0284c7',
                    bgcolor: alpha('#0284c7', 0.02),
                  },
                  ...(isDragActive && {
                    borderColor: '#003882',
                    bgcolor: alpha('#003882', 0.05),
                  }),
                }}
              >
                <input {...getInputProps()} />
                <Iconify
                  icon="solar:paperclip-linear"
                  width={28}
                  sx={{ color: '#64748B', mb: 1, display: 'block', mx: 'auto' }}
                />
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Klik untuk upload Dokumen pendukung atau drag & drop
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.5 }}>
                  PDF, DOC, DOCX, ZIP, JPG, PNG (Maksimal 5MB per berkas)
                </Typography>
              </Box>

              {/* Uploaded File List */}
              {documentFiles.length > 0 && (
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {documentFiles.map((file, idx) => {
                    const fileName = file instanceof File ? file.name : String(file).split('/').pop() || 'Dokumen';
                    const fileSize = file instanceof File ? fData(file.size) : '';

                    return (
                      <Paper
                        key={idx}
                        variant="outlined"
                        sx={{
                          p: 1,
                          px: 1.5,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: '#F8FAFC',
                          borderColor: '#E2E8F0',
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
                          <Iconify icon="solar:document-text-bold" width={20} sx={{ color: '#0284c7', flexShrink: 0 }} />
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ fontSize: '12.5px', fontWeight: 500, color: '#1E293B', maxWidth: { xs: 150, sm: 260 } }}
                          >
                            {fileName}
                          </Typography>
                          {fileSize && (
                            <Typography variant="caption" sx={{ color: '#94A3B8', flexShrink: 0, fontSize: '11px' }}>
                              ({fileSize})
                            </Typography>
                          )}
                        </Stack>

                        <IconButton size="small" onClick={() => handleRemoveFile(file)} sx={{ color: '#94A3B8' }}>
                          <Iconify icon="mingcute:close-line" width={16} />
                        </IconButton>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Back & Submit Buttons - NO ICONS */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handlePrevStep}
                sx={{
                  height: 46,
                  borderRadius: '12px',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '14px',
                  px: { xs: 2, sm: 3 },
                  minWidth: { xs: 90, sm: 105 },
                  '&:hover': {
                    borderColor: '#94A3B8',
                    bgcolor: '#F1F5F9',
                  },
                }}
              >
                Kembali
              </Button>

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{
                  height: 46,
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
                Kirim Pendaftaran
              </LoadingButton>
            </Stack>
          </Stack>
        )}
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {!isSubmitSuccess && renderStepper}

      {isSubmitSuccess ? renderAfter : renderForm}

      <Typography
        variant="caption"
        sx={{
          color: '#94A3B8',
          display: 'block',
          textAlign: 'center',
          mt: 4,
          fontSize: '12px',
        }}
      >
        v{packageInfo.version} Portal Magang PT Pertamina Lubricants
      </Typography>
    </>
  );
}
