import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
// forms
import UserNewEditFormAdmin from './user-new-edit-form-admin';
import UserNewEditFormVp from './user-new-edit-form-vp';
import UserNewEditFormMentor from './user-new-edit-form-mentor';
import UserNewEditFormPeserta from './user-new-edit-form-peserta';
import UserNewEditForm from './user-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  defaultRole?: string;
};

export default function UserCreateDialog({ open, onClose, defaultRole }: Props) {
  const renderForm = () => {
    switch (defaultRole) {
      case 'SUPERSAIYAN':
        return <UserNewEditFormAdmin onClose={onClose} />;
      case 'EMPLOYEE':
        return <UserNewEditFormVp onClose={onClose} />;
      case 'EMPLOYEESTAFF':
        return <UserNewEditFormMentor onClose={onClose} />;
      case 'PESERTA':
        return <UserNewEditFormPeserta onClose={onClose} />;
      default:
        // Fallback to the generic one or just admin
        return <UserNewEditFormAdmin onClose={onClose} />;
    }
  };

  const getRoleName = () => {
    switch (defaultRole) {
      case 'SUPERSAIYAN':
        return 'Admin';
      case 'EMPLOYEE':
        return 'VP';
      case 'EMPLOYEESTAFF':
        return 'Mentor';
      case 'PESERTA':
        return 'Peserta Magang';
      default:
        return 'Pengguna';
    }
  };

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
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Buat {getRoleName()} Baru</span>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1, pb: 4, px: 3 }}>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
}
