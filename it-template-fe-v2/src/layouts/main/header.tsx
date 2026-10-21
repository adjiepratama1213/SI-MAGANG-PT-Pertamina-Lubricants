// @mui
import AppBar from '@mui/material/AppBar';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
// routes
import { paths } from 'src/pages/paths';
import { RouterLink } from 'src/components/router-link';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { Logo } from 'src/components/logo';
//
import { HEADER } from '../config-layout';
import { navConfig } from './config-navigation';
import NavDesktop from './nav/desktop';
import NavMobile from './nav/mobile';
//
import { HeaderShadow } from '../_common';

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar
      sx={{
        bgcolor: '#ffffff',
        color: 'text.primary',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: offsetTop ? '0 4px 16px rgba(0, 0, 0, 0.04)' : 'none',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP,
          },
        }}
      >
        <Stack
          sx={{
            height: 1,
            width: '100%',
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'center',
            px: { xs: 3, md: 6 },
            verticalAlign: 'middle',
          }}
        >
          <Badge
            sx={{
              [`& .${badgeClasses.badge}`]: {
                top: 8,
                right: -16,
              },
            }}
          >
            <Logo sx={{ mr: 2.5, mt: 2, mb: 2, ml: 1 }} />
          </Badge>

          <Box sx={{ flexGrow: 1 }} />

          {mdUp ? (
            <NavDesktop offsetTop={offsetTop} data={navConfig} />
          ) : (
            <NavMobile offsetTop={offsetTop} data={navConfig} />
          )}

          <Button
            component={RouterLink}
            href={paths.auth.login}
            variant="contained"
            sx={{
              borderRadius: 50,
              bgcolor: '#002D62',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2.6,
              py: 0.6,
              height: 38,
              textTransform: 'none',
              boxShadow: 'none',
              ml: { xs: 1, md: 1 },
              '&:hover': {
                bgcolor: '#001E44',
                boxShadow: '0 4px 12px rgba(0, 45, 98, 0.25)',
              },
            }}
          >
            Masuk
          </Button>
        </Stack>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
}
