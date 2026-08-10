// @mui
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';
// routes
import { RouterLink } from 'src/components/router-link';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
};

export default function LoginButton({ sx }: Props) {
  return (
    <Button component={RouterLink} href={PATH_AFTER_LOGIN} variant="outlined" sx={{ mr: 1, ...sx }}>
      Login
    </Button>
  );
}
