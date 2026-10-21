// @mui
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
// theme
import { bgBlur } from 'src/theme/css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
// hooks
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';
import { usePathname } from 'src/hooks/use-pathname';
// components
import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';
import SvgColor from 'src/components/svg-color';
//
import { AccountPopover, Searchbar, SettingsButton, NotificationsPopover } from 'src/layouts/_common';
import { HEADER, NAV } from 'src/layouts/config-layout';
import { paths } from 'src/pages/paths';
import { useNavData } from './config-navigation';

// ----------------------------------------------------------------------

// Peta rute ke judul navigasi untuk memastikan judul selalu presisi & sesuai
const ROUTE_TITLE_MAP: Record<string, string> = {
  // Peserta
  [paths.dashboard.pesertaDashboard]: 'Dashboard',
  [paths.dashboard.pesertaPresensi]: 'Presensi',
  [paths.dashboard.pesertaLaporan]: 'Laporan',
  [paths.dashboard.pesertaPenilaian]: 'Penilaian',
  [paths.dashboard.pesertaFeedback]: 'Feedback',

  // Mentor
  [paths.dashboard.mentorDashboard]: 'Dashboard',
  [paths.dashboard.dataBimbingan]: 'Data Bimbingan',
  [paths.dashboard.mentorPresensi]: 'Presensi',
  [paths.dashboard.mentorLaporan]: 'Laporan',
  [paths.dashboard.mentorPenilaian]: 'Penilaian',
  [paths.dashboard.mentorReminder]: 'Reminder',
  [paths.dashboard.mentorRekap]: 'Rekap Akhir',

  // Admin & Umum
  [paths.dashboard.root]: 'Dashboard',
  [paths.dashboard.peserta]: 'Peserta',
  [paths.dashboard.mentor]: 'Mentor',
  [paths.dashboard.presensi]: 'Presensi',
  [paths.dashboard.evaluasiPeserta]: 'Evaluasi Peserta',
  [paths.dashboard.vpApproval]: 'Approval Evaluasi',
  [paths.dashboard.reminder]: 'Reminder',
  [paths.dashboard.feedback]: 'Feedback',

  // User Management
  [paths.userManagement.admin]: 'User Management - Admin',
  [paths.userManagement.vp]: 'User Management - VP',
  [paths.userManagement.mentor]: 'User Management - Mentor',
  [paths.userManagement.peserta]: 'User Management - Peserta',
  [paths.userManagement.root]: 'User Management',

  // User & Settings
  [paths.user.settings]: 'Pengaturan Akun',
};

function useCurrentNavTitle(): string {
  const pathname = usePathname();
  const navData = useNavData();

  return useMemo(() => {
    // Di halaman profil /user, jangan tampilkan tulisan "User" di navbar header
    if (pathname === '/user' || pathname === paths.user.root || pathname.startsWith('/user/')) {
      return '';
    }

    // 1. Cek langsung dari mapping rute
    if (ROUTE_TITLE_MAP[pathname]) {
      return ROUTE_TITLE_MAP[pathname];
    }

    // 2. Cek langsung dari item navigasi sidebar
    for (const group of navData) {
      for (const item of group.items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.path === pathname) {
              return child.title;
            }
          }
        }
        if (item.path === pathname) {
          return item.title;
        }
      }
    }

    // 3. Cek prefix match untuk sub-halaman di item navigasi
    for (const group of navData) {
      for (const item of group.items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.path && child.path !== '#' && pathname.startsWith(child.path)) {
              return child.title;
            }
          }
        }
        if (
          item.path &&
          item.path !== '/' &&
          item.path !== paths.dashboard.root &&
          pathname.startsWith(item.path)
        ) {
          return item.title;
        }
      }
    }

    // 4. Cek prefix match di ROUTE_TITLE_MAP
    for (const [routePath, title] of Object.entries(ROUTE_TITLE_MAP)) {
      if (routePath !== paths.dashboard.root && pathname.startsWith(routePath)) {
        return title;
      }
    }

    // 5. Fallback dinamis dari segment URL
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      let last = segments[segments.length - 1];
      last = last.replace(/^(peserta-|mentor-)/, '');
      const formatted = last
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return formatted || 'Dashboard';
    }

    return 'Dashboard';
  }, [pathname, navData]);
}

type Props = {
  onOpenNav?: VoidFunction;
};

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const isNavHorizontal = settings.themeLayout === 'horizontal';

  const isNavMini = settings.themeLayout === 'mini';

  const lgUp = useResponsive('up', 'lg');

  const offset = useOffSetTop(HEADER.H_DESKTOP);

  const offsetTop = offset && !isNavHorizontal;

  const pageTitle = useCurrentNavTitle();

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5, mt: 2, ml: 1 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}

      {/* Bagian kiri: Search bar dipindah ke pojok kiri & dipanjangin */}
      <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0.5, md: 0 } }}>
        <Searchbar />
      </Box>

      {/* Spacer di tengah */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Bagian kanan: Icon aksi */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.75, sm: 1.25 }}
      >
        <NotificationsPopover />

        <SettingsButton />

        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}
