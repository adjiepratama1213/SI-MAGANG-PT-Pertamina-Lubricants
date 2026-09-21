import { useCallback, useState, useEffect } from 'react';
// @mui
import { Tab, Tabs, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
// components
import Iconify from 'src/components/iconify';
//
import { useGetUserDetail } from '../query';
import UserNewEditForm from './user-new-edit-form';
import UserNewEditFormAdmin from './user-new-edit-form-admin';
import UserNewEditFormVp from './user-new-edit-form-vp';
import UserNewEditFormMentor from './user-new-edit-form-mentor';
import UserNewEditFormPeserta from './user-new-edit-form-peserta';
import AccountChangePassword from './account-change-password';
import AccountChangeMfa from './account-change-mfa';

// ----------------------------------------------------------------------

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

type Props = {
  userId: string;
  open: boolean;
  onClose: VoidFunction;
  isViewOnly?: boolean;
};

export default function UserEditDialog({ userId, open, onClose, isViewOnly: initialViewOnly }: Props) {
  const { user: currentUser } = useGetUserDetail({ id: userId });

  const isIdaman = !!currentUser?.idamanId;
  const visibleTabs = isIdaman ? TABS.filter((tab) => tab.value !== 'security') : TABS;

  const [currentTab, setCurrentTab] = useState('general');
  const [editMode, setEditMode] = useState(!initialViewOnly);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEditMode(!initialViewOnly);
      setCurrentTab('general');
    }
  }, [open, initialViewOnly]);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { minHeight: 480 },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', boxShadow: 3 }}>
        <span style={{ fontWeight: 700 }}>{!editMode ? 'View User' : 'Edit User'} {currentUser?.name ? `- ${currentUser.name}` : ''}</span>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2, pb: 4, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 5 } }}>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
          >
            {visibleTabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
            ))}
          </Tabs>

          {!editMode && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditMode(true)}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit Data
            </Button>
          )}
        </Box>

        {currentTab === 'general' && currentUser?.name !== undefined && (
          <>
            {currentUser.role === 'SUPERSAIYAN' && <UserNewEditFormAdmin currentUser={currentUser} isViewOnly={!editMode} onClose={onClose} />}
            {currentUser.role === 'EMPLOYEE' && <UserNewEditFormVp currentUser={currentUser} isViewOnly={!editMode} onClose={onClose} />}
            {currentUser.role === 'EMPLOYEESTAFF' && <UserNewEditFormMentor currentUser={currentUser} isViewOnly={!editMode} onClose={onClose} />}
            {currentUser.role === 'PESERTA' && <UserNewEditFormPeserta currentUser={currentUser} isViewOnly={!editMode} onClose={onClose} />}
            {!['SUPERSAIYAN', 'EMPLOYEE', 'EMPLOYEESTAFF', 'PESERTA'].includes(currentUser.role) && <UserNewEditForm currentUser={currentUser} isViewOnly={!editMode} onClose={onClose} />}
          </>
        )}
        {currentTab === 'security' && currentUser?.name !== undefined && (
          <AccountChangePassword userId={userId} />
        )}
        {currentTab === 'mfa' && currentUser?.name !== undefined && (
          <AccountChangeMfa currentUser={currentUser} />
        )}
      </DialogContent>
    </Dialog>
  );
}
