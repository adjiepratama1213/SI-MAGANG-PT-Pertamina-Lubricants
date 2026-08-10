// @mui
import AppBar from '@mui/material/AppBar';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
// theme
import { bgBlur } from 'src/theme/css';
// components
import { Logo } from 'src/components/logo';
//
import { HEADER } from '../config-layout';
import { navConfig } from './config-navigation';
import NavDesktop from './nav/desktop';
//
import { HeaderShadow, SettingsButton } from '../_common';
import NavMobile from './nav/mobile';

// ----------------------------------------------------------------------

export default function FullHeader() {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar>
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP,
          },
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default,
            }),
            height: {
              md: HEADER.H_DESKTOP_OFFSET,
            },
          }),
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

          <SettingsButton />

          {/* <Stack alignItems="center" direction={{ xs: 'row', md: 'row-reverse' }}>
            {mdUp && <LoginButton />}

            <SettingsButton
              sx={{
                ml: { xs: 1, md: 0 },
                mr: { md: 2 },
              }}
            />

            {!mdUp && <NavMobile offsetTop={offsetTop} data={navConfig} />}
          </Stack> */}
        </Stack>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
}
