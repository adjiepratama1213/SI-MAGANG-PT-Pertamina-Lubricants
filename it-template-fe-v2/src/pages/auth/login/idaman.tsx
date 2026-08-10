import { useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { Alert, Box, Button } from '@mui/material';
import { IDAMAN, PATH_AFTER_LOGIN } from 'src/config-global';
import { useRouter } from 'src/hooks/use-router';
import { useSearchParams } from 'src/hooks/use-search-params';
// import { LogoBlueWhite } from 'src/components/logo/logo-dynamic';
import Oidc from 'oidc-client';
import { isValidToken, jwtDecode } from 'src/auth/context/jwt/utils';
import { LoadingScreen } from 'src/components/loading-screen';
import { paths } from 'src/pages/paths';

// ----------------------------------------------------------------------

export default function IdamanLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const config = {
    authority: IDAMAN.viteIdamanAuthority,
    client_id: IDAMAN.viteIdamanClientId,
    client_secret: IDAMAN.viteIdamanClientSecret,
    redirect_uri: IDAMAN.viteIdamanRedirectUri,
    response_type: 'code',
    scope: 'openid profile api.auth user.read user.readAll',
    post_logout_redirect_uri: IDAMAN.viteIdamanPostLogoutRedirectUrl,
  };

  const mgr = new Oidc.UserManager(config);

  const authorizationCode = searchParams.get('code');

  const handleIdamanLogin = async (data: { email: string; idp: string }) => {
    try {
      await login?.(data.email, data.idp);

      console.info('Connect idaman success, redirecting ...');

      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (err) {
      console.error(`Idaman Login Error`, err);
      // reset();
      setErrorMsg(typeof err === 'string' ? err : err.message);
    }
  };

  useEffect(() => {
    if (authorizationCode) {
      mgr
        .signinRedirectCallback()
        .then((user) => {
          if (user && user.access_token) {
            if (isValidToken(user.access_token)) {
              console.info('Obtain idaman access token');
              handleIdamanLogin(jwtDecode(user.access_token));
            } else {
              console.error('Failed to obtain access token due invalid token');
            }
          } else {
            console.error('Failed to obtain access token due no access token');
          }
        })
        .catch((error) => {
          console.error('token:', authorizationCode);
          console.error('Error exchanging code for token:', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorizationCode, handleIdamanLogin]);

  const idamanLogin = () => {
    setIsConnecting(true);
    setButtonDisabled(true);
    mgr.signinRedirect();
  };
  let content;

  if (authorizationCode) {
    content = <LoadingScreen />;
  } else if (isConnecting) {
    content = (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
        <LoadingScreen sx={{ height: 56 }} />
        <Box textAlign="center">
          <Box component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: '100px' }}>
            Connecting to IdAMan authentication server...
          </Box>
        </Box>
      </Stack>
    );
  } else {
    content = (
      <Button
        size="large"
        color="info"
        variant="outlined"
        disabled={isButtonDisabled}
        startIcon={
          <Box
            component="img"
            alt="idaman"
            src="/assets/illustrations/ic-ptmn-idaman.svg"
            sx={{
              width: 32,
              height: 32,
            }}
          />
        }
        onClick={idamanLogin}
        sx={{ backgroundColor: '#0156B8', borderColor: '#0056b8', color: '#FFF' }}
      >
        Login with IdAMan
      </Button>
    );
  }

  return (
    <Stack spacing={2.5}>
      {!!errorMsg && (
        <>
          <Alert severity="error">{errorMsg}</Alert>
          <Button
            variant="soft"
            color="info"
            href={paths.waSystem}
            target="_blank"
            rel="noopener"
            size="small"
          >
            Contact IT!
          </Button>
        </>
      )}
      {content}
    </Stack>
  );
}
