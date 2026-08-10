import { Link, Stack, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import AccountResetMFA from 'src/pages/user/account/account-reset-mfa';

export default function ViewMFAReset() {
  const renderHead = (
    <Stack
      spacing={2}
      sx={{
        mb: 3,
        pt: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h4">MFA: Reset</Typography>
    </Stack>
  );

  const renderContent = (
    <Stack spacing={2}>
      <AccountResetMFA />

      <Link
        component={RouterLink}
        href={paths.auth.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {renderContent}
    </>
  );
}
