import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { Alert, Button, Dialog, DialogContent, DialogTitle, CardHeader, CardContent } from '@mui/material';
// utils
import { fData } from 'src/utils/format-number';
// components
import { toast } from 'react-toastify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import QRCode from 'react-qr-code';
import axiosInstance from 'src/utils/axios';
import { PERTAMINA_TOKENS } from 'src/theme/palette';
import { useGetUserDetail } from 'src/pages/user-mgmt/query';
import { useGetQr } from '../query';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;
const BRAND_NAVY_HOVER = PERTAMINA_TOKENS.navyHover;

export default function AccountGeneral() {
  const { user: authUser, initialize } = useAuthContext();
  const { user: detailedUser } = useGetUserDetail({ id: authUser?.id || '' });

  const currentUser = (detailedUser && detailedUser.id) ? detailedUser : authUser;
  const internProfile = currentUser?.internProfile || authUser?.internProfile;
  const internId = internProfile?.internId || (currentUser as any)?.internId || '';
  const university = internProfile?.university || (currentUser as any)?.university || '';
  const program = internProfile?.program || (currentUser as any)?.program || '';
  const division = internProfile?.division || currentUser?.Position?.Team?.name || 'Production Unit Jakarta';

  const [openQr, setOpenQr] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { results } = useGetQr();

  const handleCloseQr = () => setOpenQr(false);

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().required('Email wajib diisi').email('Format email tidak valid'),
    photoUrl: Yup.mixed<any>().nullable().required('Foto profil wajib diunggah'),
    phoneNumber: Yup.string(),
    internId: Yup.string(),
    university: Yup.string(),
    position: Yup.string(),
    team: Yup.string(),
    idamanId: Yup.string(),
    webAuthnId: Yup.string(),
    isPublic: Yup.boolean(),
  });

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      photoUrl: currentUser?.photoUrl || null,
      phoneNumber: currentUser?.phoneNumber || currentUser?.phone || '',
      internId: internId || '',
      university: university || '',
      idamanId: currentUser?.idamanId || '',
      position: currentUser?.Position?.name || program || 'Peserta Magang',
      team: division || 'Production Unit Jakarta',
      webAuthnId: currentUser?.webAuthnId || '',
      isPublic: currentUser?.isPublic || false,
    },
  });

  const {
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentUser?.id) {
      reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        photoUrl: currentUser.photoUrl || null,
        phoneNumber: currentUser.phone || currentUser.phoneNumber || '',
        internId: internId || '',
        university: university || '',
        idamanId: currentUser.idamanId || '',
        position: currentUser.Position?.name || program || 'Peserta Magang',
        team: division || 'Production Unit Jakarta',
        webAuthnId: currentUser.webAuthnId || '',
        isPublic: currentUser.isPublic || false,
      });
    }
  }, [currentUser, internId, university, division, program, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('Memproses perubahan profil...');
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

      await axiosInstance.patch(`/user/${authUser?.id}`, {
        name: data.name,
        email: data.email,
        photoUrl: finalPhotoUrl,
        phone: data.phoneNumber,
      });

      if (initialize) {
        await initialize();
      }

      setIsEditing(false);

      toast.update(toastId, {
        render: 'Profil berhasil diperbarui!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Gagal memperbarui profil!',
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

  const isIdaman = !!currentUser?.idamanId;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* KARTU KIRI: FOTO PROFIL & IDENTITAS RINGKAS */}
        <Grid xs={12} md={4}>
          <Card
            sx={{
              p: 3.5,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <RHFUploadAvatar
              name="photoUrl"
              maxSize={3145728}
              onDrop={handleDrop}
              disabled={!isEditing}
            />

            <Typography variant="h6" sx={{ mt: 2.5, mb: 0.5, fontWeight: 700, color: '#0F172A' }}>
              {currentUser?.name || 'Peserta Magang'}
            </Typography>

            {/* BADGE ID PESERTA */}
            {internId ? (
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                <Chip
                  icon={<Iconify icon="solar:user-id-bold-duotone" width={16} sx={{ color: `${BRAND_NAVY} !important` }} />}
                  label={`ID: ${internId}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 79, 159, 0.08)',
                    color: BRAND_NAVY,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderRadius: 1,
                    height: 26,
                  }}
                />
              </Box>
            ) : null}

            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, mb: 0.5 }}>
              {division || currentUser?.Position?.Team?.name || 'Production Unit Jakarta'}
            </Typography>

            {university ? (
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2, fontWeight: 500 }}>
                {university}
              </Typography>
            ) : (
              <Box sx={{ mb: 2 }} />
            )}

            {isEditing && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                    mb: 2,
                    fontSize: '0.74rem',
                    lineHeight: 1.5,
                  }}
                >
                  Format *.jpeg, *.jpg, *.png
                  <br /> Ukuran maksimal {fData(3145728)}
                </Typography>

                <Button
                  variant="outlined"
                  color="inherit"
                  component="label"
                  startIcon={<Iconify icon="solar:camera-add-bold-duotone" width={18} />}
                  sx={{
                    borderRadius: 1.5,
                    borderColor: '#CBD5E1',
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#334155',
                    px: 2.5,
                    py: 0.8,
                    '&:hover': { borderColor: BRAND_NAVY, color: BRAND_NAVY, bgcolor: '#F0F9FF' },
                  }}
                >
                  Pilih Foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDrop([e.target.files[0]]);
                      }
                    }}
                  />
                </Button>
              </>
            )}
          </Card>
        </Grid>

        {/* KARTU KANAN: FORM INFORMASI AKUN & ID PESERTA */}
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
                    <Iconify icon="solar:user-id-bold-duotone" width={20} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A' }}>
                    Informasi Akun & Data Peserta
                  </Typography>
                </Box>
              }
              subheader={
                isEditing
                  ? 'Perbarui data profil Anda di bawah ini, lalu klik Simpan Perubahan'
                  : 'Informasi identitas, ID peserta, dan data kontak akun magang Anda'
              }
              sx={{ p: 3, pb: 1 }}
            />
            <Divider sx={{ mx: 3, my: 1 }} />
            <CardContent sx={{ p: 3, pt: 2 }}>
              <Box
                rowGap={2.5}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="name" label="Nama Lengkap" disabled={!isEditing || isIdaman} />

                {/* KOLOM ID PESERTA */}
                <RHFTextField
                  name="internId"
                  label="ID Peserta / NIM"
                  disabled
                />

                <RHFTextField name="email" label="Alamat Email" disabled={!isEditing || isIdaman} />

                <RHFTextField name="phoneNumber" label="Nomor Telepon / WhatsApp" disabled={!isEditing || isIdaman} />

                <RHFTextField name="university" label="Asal Universitas / Institusi" disabled />

                <RHFTextField name="team" label="Unit Penugasan / Tim" disabled />
              </Box>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3.5 }}>
                {!isIdaman && (
                  !isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<Iconify icon="solar:pen-new-square-bold" width={18} />}
                      onClick={() => setIsEditing(true)}
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
                      Edit Profil
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<Iconify icon="solar:close-circle-bold" width={18} />}
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                        sx={{
                          borderRadius: 1.5,
                          borderColor: '#CBD5E1',
                          textTransform: 'none',
                          fontWeight: 600,
                          color: '#64748B',
                          px: 2.5,
                          py: 1,
                          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                        }}
                      >
                        Batal
                      </Button>

                      <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                        startIcon={<Iconify icon="solar:diskette-bold" width={18} />}
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
                    </>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openQr} onClose={handleCloseQr} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">Scan this QR to Login</DialogTitle>
        <DialogContent sx={{ justifyContent: 'center', p: 3 }}>
          <Alert severity="warning">
            By scanning this QR code, you authorize your other browser to access POST using your
            Account.
          </Alert>
          <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
            <QRCode
              value={results.token} // your QR content
              size={180}
              style={{ height: 'auto', maxWidth: '80%', width: '100%' }}
            />
          </Stack>
          <Alert severity="info">
            This QR code must be scanned within 5 minutes to login. If you are unable to login,
            please try refreshing this page
          </Alert>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
