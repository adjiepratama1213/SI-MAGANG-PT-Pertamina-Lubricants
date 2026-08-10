import { Link, Stack, Typography } from '@mui/material';
import { HttpStatusCode } from 'axios';
import { useEffect, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/components/router-link';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
import { paths } from 'src/pages/paths';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import OTPForm from '../../../components/mfa/otp-form';

export default function ViewMFAVerify() {
  const { user } = useAuthContext();
  const [email, setEmail] = useState(user?.email);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const handleSubmit = async (code: string) => {
    setError('');
    try {
      const URL = `${endpoints.mfa.verify}`;
      const response = await axiosInstance.post(URL, { id: email, code });
      if (response?.status === HttpStatusCode.Ok) {
        router.push(returnTo || PATH_AFTER_LOGIN);
      } else {
        throw new Error('Something went wrong');
      }
    } catch (err) {
      setError('Error submitting code');
    }
  };

  const renderHead = (
    <Stack
      spacing={2}
      sx={{
        mb: 3,
        pt: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h4">MFA: Verify</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">
          {`Don’t have a code? `}
          <Link
            variant="subtitle2"
            sx={{
              cursor: 'pointer',
            }}
            component={RouterLink}
            href={paths.mfa.setup}
          >
            Setup code
          </Link>
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Stack>
    </Stack>
  );

  const renderContent = <OTPForm submitHandler={handleSubmit} />;

  return (
    <>
      {renderHead}

      {renderContent}
    </>
  );
}
