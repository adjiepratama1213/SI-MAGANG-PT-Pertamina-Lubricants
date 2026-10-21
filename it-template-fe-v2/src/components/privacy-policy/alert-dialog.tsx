// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Typography } from '@mui/material';
import { useState } from 'react';
import TermsAndConditionsView from './privacy-view';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

export default function PrivacyPolicyAlertDialog() {
  const [open, setOpen] = useState(false);
  const dialog = useBoolean(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog
        open={dialog.value}
        onClose={dialog.onFalse}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)', // Adjust transparency for darker background
          },
        }}
      >
        <DialogTitle>Persetujuan Kebijakan Privasi PT Pertamina Lubricants</DialogTitle>
        <DialogContent
          sx={{
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column', // Ensure text stacks properly
            gap: 1, // Spacing for readability
          }}
        >
          <Typography variant="body2">
            Saya telah membaca dengan saksama, memahami, dan menyetujui untuk mematuhi syarat dan ketentuan yang tercantum dalam{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: '#003882', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleOpen}
            >
              Kebijakan Privasi
            </Typography>{' '}
            PT Pertamina Lubricants.
          </Typography>
          <Typography variant="body2">
            Dengan mengeklik &apos;Setuju&apos;, saya mengakui dan menyetujui bahwa data pribadi saya akan dikumpulkan,
            digunakan, dan diproses sebagaimana tercantum dalam kebijakan privasi.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={dialog.onFalse} autoFocus>
            Setuju
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <Card
          sx={{
            border: '2px solid #12376A',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Box sx={{ position: 'relative', width: '100%' }}>
            <TermsAndConditionsView />
            <Button
              fullWidth
              onClick={handleClose}
              variant="contained"
              sx={{ height: 80, borderRadius: 0 }}
              startIcon={<Iconify icon="solar:close-square-bold" />}
            >
              Tutup Kebijakan Privasi
            </Button>
          </Box>
        </Card>
      </Dialog>
    </>
  );
}
