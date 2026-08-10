import { useCallback, useState } from 'react';
// @mui
import { Tab, Tabs } from '@mui/material';
import Container from '@mui/material/Container';
// routes
import { useParams } from 'src/hooks/use-params';
import { paths } from 'src/pages/paths';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetUserDetail } from '../query';
import UserNewEditForm from '../molecules/user-new-edit-form';
import AccountChangePassword from '../molecules/account-change-password';
import AccountChangeMfa from '../molecules/account-change-mfa';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
  {
    value: 'mfa',
    label: 'MFA',
    icon: <Iconify icon="uis:padlock" width={24} />,
  },
];

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext();

  const params = useParams();
  const reqId = params.id ?? '';
  const { user: currentUser } = useGetUserDetail({ id: reqId });

  const isIdaman = !!currentUser?.idamanId;
  const visibleTabs = isIdaman ? TABS.filter((tab) => tab.value !== 'security') : TABS;

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'User',
            href: paths.userManagement.root,
          },
          { name: currentUser?.name },
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

      {currentTab === 'general' && currentUser?.name !== undefined && (
        <UserNewEditForm currentUser={currentUser} />
      )}
      {currentTab === 'security' && currentUser?.name !== undefined && <AccountChangePassword />}
      {currentTab === 'mfa' && currentUser?.name !== undefined && (
        <AccountChangeMfa currentUser={currentUser} />
      )}
    </Container>
  );
}
