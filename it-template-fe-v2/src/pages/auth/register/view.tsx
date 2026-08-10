import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// components
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { toast } from 'react-toastify';
import { endpoints } from 'src/utils/endpoints';
import axiosInstance from 'src/utils/axios';
import { Button, Chip } from '@mui/material';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const [errorMsg, setErrorMsg] = useState('');

  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [positionIdSearchData, setPositionIdSearchData] = useState<
    { name: string; Position: { id: string; name: string; teamId: string } }[]
  >([
    {
      name: '',
      Position: {
        id: '',
        name: '',
        teamId: '',
      },
    },
  ]);

  const password = useBoolean();
  const rePassword = useBoolean();

  const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name required'),
    phone: Yup.string().required('Last name required'),
    email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address')
      .test(
        'is-pertamina-email',
        'Should use @pertamina.com / @mitrakerja.pertamina.com',
        (value) => value?.endsWith('pertamina.com') ?? false
      ),
    emailManager: Yup.string()
      .required('Manager Email is required')
      .email('Manager Email must be a valid email address'),
    positionId: Yup.string().required('Position is required'),
    jobTitle: Yup.string().required('Position Name is required'),
    teamId: Yup.string().required('Team ID is required'),
    password: Yup.string().required('Password is required'),
    rePassword: Yup.string()
      .required('Re-Type Password is required')
      .oneOf([Yup.ref('password')], 'Passwords & Re-Type Password must match'),
  });

  const defaultValues = {
    fullName: '',
    phone: '',
    email: '',
    emailManager: '',
    positionId: '',
    jobTitle: '',
    teamId: '',
    password: '',
    rePassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const { emailManager } = values;

  useEffect(() => {
    const position = positionIdSearchData?.find((pos) => pos.Position.id === values.positionId);

    setValue('jobTitle', position?.Position.name || '');
    setValue('teamId', position?.Position.teamId || '');
  }, [positionIdSearchData, values.positionId, setValue]);

  useEffect(() => {
    const fetchManagerData = async (email: string) => {
      try {
        const response = await axiosInstance.get(endpoints.user.managerCheck(email));
        if (response.data) {
          // Contoh: jika response memiliki nama manager
          setPositionIdSearchData(response.data);
        }
      } catch (error) {
        console.error('Error fetching manager data:', error);
      }
    };

    if (emailManager && emailManager.endsWith('@pertamina.com')) {
      fetchManagerData(emailManager);
    }
  }, [emailManager]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const mappingData = {
        name: data?.fullName || '',
        password: data?.password || '',
        // role: data?.role || '',
        email: data?.email || '',
        phone: data?.phone || '',
        jobTitle: data?.jobTitle || '',
        // status: data?.status && data?.status !== '' ? data?.status : 'active',
        positionId: data?.positionId || '',
        teamId: data?.teamId || '',
        // company: data?.company || '',
        // avatarUrl: data?.avatarUrl || null,
        // phone: data?.phone || data?.phone || '',
        // isVerified: data?.isVerified || true,
      };
      await axiosInstance.post(`${endpoints.auth.register}`, mappingData, {});

      toast.success(
        `Create Account Success! You're manager need to approve your account! Stay Tuned!'`
      );
      setIsSubmitSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mt: { lg: 0 }, mb: 5, position: 'relative' }}>
      <Typography variant="h4">Get started your account!</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.login} component={RouterLink} variant="subtitle2">
          Sign in
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
      {'By signing up, I agree to '}
      <Link
        component={RouterLink}
        href={paths.privacyPolicy.root}
        underline="always"
        color="text.primary"
      >
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderAfter = (
    <Stack spacing={2.5}>
      <Alert severity="info">
        You&apos;re account already created! <br />
        Please wait 2x24hours or ask IT PTPL team to approve your access.
      </Alert>

      <Button
        variant="soft"
        color="info"
        href={paths.waSystem}
        target="_blank"
        rel="noopener"
        size="small"
      >
        Contact Us!
      </Button>

      <Link component={RouterLink} href={paths.auth.login} variant="subtitle2">
        Back To Login
      </Link>
    </Stack>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <RHFTextField name="fullName" label="Full name" />
        <RHFTextField name="phone" label="Phone Number" />
        <RHFTextField name="email" label="Email address" />
        <RHFTextField
          name="emailManager"
          label="Manager Email address"
          helperText="Your manager email should be valid!"
        />
        <RHFAutocomplete
          name="positionId"
          label="SPV Position ID"
          placeholder="Your SPV Position"
          options={positionIdSearchData} // Ensure full object structure
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option; // Handle case when option is a string
            if (Array.isArray(option)) return ''; // Prevents array errors
            return `${option.name} (${option.Position.id})`;
          }}
          renderOption={(props, option) => {
            if (typeof option === 'string' || Array.isArray(option)) return null; // Prevent errors
            return (
              <li {...props} key={option.Position.id}>
                {option.name} ({option.Position.id})
              </li>
            );
          }}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => {
              if (typeof option === 'string' || Array.isArray(option)) return null; // Prevent errors
              return (
                <Chip
                  {...getTagProps({ index })}
                  key={option.Position.id}
                  label={`${option.name} (${option.Position.id})`}
                  size="small"
                  color="info"
                  variant="soft"
                />
              );
            })
          }
          isOptionEqualToValue={(option, value) => {
            if (typeof option === 'string' || typeof value === 'string') return false;
            if (Array.isArray(option) || Array.isArray(value)) return false; // Ensure no array comparisons
            return option.Position.id === value.Position.id;
          }}
          onChange={(event, newValue) => {
            if (!newValue || typeof newValue === 'string' || Array.isArray(newValue)) return;
            setValue('positionId', newValue.Position.id); // Store only positionId
          }}
        />
        <RHFTextField name="jobTitle" label="Job Title" disabled />
        <RHFTextField name="teamId" label="Team ID" disabled />
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
        />
        <RHFTextField
          name="rePassword"
          label="Re-Type Password"
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
          Create account
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
