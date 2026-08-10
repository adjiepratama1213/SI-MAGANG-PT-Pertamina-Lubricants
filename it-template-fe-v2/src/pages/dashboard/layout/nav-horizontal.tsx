import { memo } from 'react';
// @mui
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
// theme
import { bgBlur } from 'src/theme/css';
// hooks
// components
import { NavSectionHorizontal } from 'src/components/nav-section';
//

import { useAuthContext } from 'src/auth/hooks';
import { HeaderShadow } from 'src/layouts/_common';
import { HEADER } from 'src/layouts/config-layout';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme();

  const { user } = useAuthContext();

  const navData = useNavData();

  return (
    <AppBar
      component="nav"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET,
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default,
          }),
        }}
      >
        <NavSectionHorizontal
          data={navData}
          config={{
            currentRole: user?.role || 'GUEST',
          }}
        />
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  );
}

export default memo(NavHorizontal);
