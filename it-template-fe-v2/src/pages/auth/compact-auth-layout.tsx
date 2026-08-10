// @mui
import Stack from '@mui/material/Stack';
// components
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthCompactLayout({ children }: Props) {
  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 },
      }}
    />
  );

  const renderContent = (
    <Stack
      sx={{
        width: '80%',
        mx: 'auto',
        px: { xs: 2, md: 8 },
        pt: { xs: 15, md: 20 },
        pb: { xs: 15, md: 0 },
      }}
    >
      {children}
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        minHeight: '100vh',
      }}
    >
      {renderLogo}

      {renderContent}
    </Stack>
  );
}
