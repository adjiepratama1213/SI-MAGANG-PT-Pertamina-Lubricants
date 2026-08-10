import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import ViewSettings from './view';

export default function PageSettings() {
  return (
    <>
      <Helmet>
        <title> User: WebAuth </title>
      </Helmet>

      <Box>
        <ViewSettings />
      </Box>
    </>
  );
}
