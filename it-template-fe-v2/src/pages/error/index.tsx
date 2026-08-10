import { Button, Typography } from '@mui/material';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router';
import { MotionContainer, varBounce } from 'src/components/animate';
import { RouterLink } from 'src/components/router-link';
import View403 from './403';
import View404 from './404';
import View500 from './500';

function UnknownError() {
  return (
    <>
      <Helmet>
        <title> Error! </title>
      </Helmet>

      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Something went wrong!
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            Please refer to your system administrator
          </Typography>
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to Home
        </Button>
      </MotionContainer>
    </>
  );
}

function RouteError({ status, statusText, data }: ErrorResponse) {
  return (
    <>
      <Helmet>
        <title>{`${status} ${statusText}`}</title>
      </Helmet>

      <MotionContainer>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {statusText}
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>{JSON.stringify(data, null, 2)}</Typography>
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to Home
        </Button>
      </MotionContainer>
    </>
  );
}

export function RootBoundary() {
  const error = useRouteError();

  console.error('[Error]: ', error);

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return <View404 />;

      case 403:
        return <View403 />;

      case 500:
        return <View500 />;

      default:
        return <RouteError status={error.status} statusText={error.statusText} data={error.data} />;
    }
  }

  return <UnknownError />;
}
