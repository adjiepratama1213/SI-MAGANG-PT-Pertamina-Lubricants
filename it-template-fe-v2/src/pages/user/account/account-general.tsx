import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// utils
import { fData } from 'src/utils/format-number';
// assets
// components
import { toast } from 'react-toastify';
import { useAuthContext } from 'src/auth/hooks';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { Alert, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import Iconify from 'src/components/iconify';
import QRCode from 'react-qr-code';
import { useGetQr } from '../query';

// ----------------------------------------------------------------------

export default function AccountGeneral() {
  const { user } = useAuthContext();
  const [openQr, setOpenQr] = useState(false);

  const { results } = useGetQr();
  console.log(`results`, results);

  const handleOpenQr = () => setOpenQr(true);
  const handleCloseQr = () => setOpenQr(false);

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoUrl: Yup.mixed<any>().nullable().required('Avatar is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    idamanId: Yup.string(),
    webAuthnId: Yup.string(),
    position: Yup.string().required('Position is required'),
    team: Yup.string().required('Team is required'),
    // country: Yup.string().required('Country is required'),
    // address: Yup.string().required('Address is required'),
    // state: Yup.string().required('State is required'),
    // city: Yup.string().required('City is required'),
    // zipCode: Yup.string().required('Zip code is required'),
    about: Yup.string().required('About is required'),
    // not required
    isPublic: Yup.boolean(),
  });

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      photoUrl: user?.photoUrl || null,
      phoneNumber: user?.phoneNumber || '',
      idamanId: user?.idamanId || '',
      position: user?.Position?.name || '',
      team: user?.Position?.Team?.name || '',
      webAuthnId: user?.webAuthnId || '',
      about: user?.about || '',
      isPublic: user?.isPublic || false,
    },
  });

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
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

  const isIdaman = user?.idamanId !== '';

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
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

            {/* <RHFSwitch
              name="isPublic"
              labelPlacement="start"
              label="Public Profile"
              sx={{ mt: 5 }}
            /> */}
          </Card>

          <Button
            fullWidth
            onClick={handleOpenQr}
            variant="contained"
            sx={{ height: 80, borderRadius: 0, mt: 1 }}
            startIcon={<Iconify icon="solar:qr-code-bold" />}
          >
            Login With QR
          </Button>
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
              <RHFTextField name="name" label="Name" disabled={isIdaman} />
              <RHFTextField name="email" label="Email Address" disabled={isIdaman} />
              <RHFTextField name="phoneNumber" label="Phone Number" disabled={isIdaman} />

              {/* <RHFAutocomplete
                name="country"
                label="Country"
                options={countries.map((country) => country.label)}
                getOptionLabel={(option) => option}
                renderOption={(props, option) => {
                  const { code, label, phone } = countries.filter(
                    (country) => country.label === option
                  )[0];

                  if (!label) {
                    return null;
                  }

                  return (
                    <li {...props} key={label}>
                      <Iconify
                        key={label}
                        icon={`circle-flags:${code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {label} ({code}) +{phone}
                    </li>
                  );
                }}
              /> */}

              {/* <RHFTextField name="state" label="State/Region" /> */}
              {/* <RHFTextField name="city" label="City" /> */}
              {/* <RHFTextField name="zipCode" label="Zip/Code" /> */}
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="position" label="Position" disabled />
              <RHFTextField name="team" label="Team" disabled />
            </Stack>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <RHFTextField name="about" multiline rows={4} label="About" />

              {!isIdaman && (
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save Changes
                </LoadingButton>
              )}
            </Stack>
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
