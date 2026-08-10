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
import SettingWebAuthn from './settings-web-authn'

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'web-authn',
    label: 'WebAuthn',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  // {
  //   value: 'security',
  //   label: 'Security',
  //   icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  // },
];

// ----------------------------------------------------------------------

export default function ViewSettings() {
  const settings = useSettingsContext();

  const { user } = useAuthContext();

  const isIdaman = !!user?.idamanId;
  const visibleTabs = isIdaman ? TABS.filter(tab => tab.value !== 'security') : TABS;

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const userSharableIds = [
    { id: user?.webAuthnId || '' },
    // { id: '1942194871928' },
    // { id: '7821391092319' },
    // { id: '6121820912798' },
  ];  

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="WebAuthn"
        links={[
          { name: 'User', href: paths.user.root },
          { name: 'WebAuthn' },
        ]}
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

      {currentTab === 'general' && <SettingWebAuthn sharableIds={userSharableIds} />}

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

      {/* {currentTab === 'security' && <AccountChangePassword />} */}
    </Container>
  );
}
