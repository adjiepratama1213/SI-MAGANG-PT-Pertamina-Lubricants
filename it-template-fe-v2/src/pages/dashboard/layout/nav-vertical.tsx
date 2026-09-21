import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { Logo } from 'src/components/logo';
import { NavSectionVertical } from 'src/components/nav-section';
import Scrollbar from 'src/components/scrollbar';
import { usePathname } from 'src/hooks/use-pathname';
//
import { useAuthContext } from 'src/auth/hooks';
import { NavToggleButton, NavUpgrade } from 'src/layouts/_common';
import { NAV } from 'src/layouts/config-layout';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useAuthContext();

  const pathname = usePathname();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ ml: 3, mt: 2, mb: 1 }} />

      <NavSectionVertical
        data={navData}
        config={{
          currentRole: user?.role || 'GUEST',
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <NavUpgrade />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            bgcolor: 'background.paper',
            borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
            boxShadow: '4px 0 24px 0 rgba(0,0,0,0.02)',
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              bgcolor: 'background.paper',
              borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
              boxShadow: '4px 0 24px 0 rgba(0,0,0,0.04)',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
