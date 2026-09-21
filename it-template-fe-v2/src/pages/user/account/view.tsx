import { useCallback, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
// routes
// _mock
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
//
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/pages/paths';
import AccountGeneral from './account-general';
import AccountChangePassword from './account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Password',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
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
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Profil"
        links={[]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}

      {/* {currentTab === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )} */}

      {/* {currentTab === 'notifications' && <AccountNotifications />} */}

      {/* {currentTab === 'social' && <AccountSocialLinks socialLinks={_userAbout.socialLinks} />} */}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  );
}
