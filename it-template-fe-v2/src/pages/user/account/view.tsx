import { useCallback, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import { useAuthContext } from 'src/auth/hooks';
import { PERTAMINA_TOKENS } from 'src/theme/palette';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import AccountGeneral from './account-general';
import AccountChangePassword from './account-change-password';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;

const TABS = [
  {
    value: 'general',
    label: 'Informasi Umum',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
  },
  {
    value: 'security',
    label: 'Kata Sandi',
    icon: <Iconify icon="ic:round-vpn-key" width={20} />,
  },
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const isIdaman = !!user?.idamanId;
  const visibleTabs = isIdaman ? TABS.filter((tab) => tab.value !== 'security') : TABS;

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ pb: 8, pt: 0 }}>
      {/* BREADCRUMB: Dashboard > Profil (DIATAS JUDUL PROFIL) */}
      <DashboardBreadcrumbs current="Profil" sx={{ mb: 1.5 }} />

      {/* JUDUL DAN CAPTION */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#0F172A',
            mb: 0.5,
            letterSpacing: -0.3,
          }}
        >
          Profil Saya
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '0.9rem',
          }}
        >
          Kelola informasi identitas diri, data peserta magang, dan preferensi akun Anda secara terpadu di PT Pertamina Lubricants.
        </Typography>
      </Box>

      {/* TABS */}
      <Box sx={{ mb: 3.5, borderBottom: 1, borderColor: '#E2E8F0' }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.92rem',
              textTransform: 'none',
              minWidth: 'auto',
              minHeight: 44,
              px: 2.5,
              py: 1,
              color: '#64748B',
              '&.Mui-selected': { color: BRAND_NAVY },
            },
            '& .MuiTabs-indicator': {
              bgcolor: BRAND_NAVY,
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {visibleTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  );
}
