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
        <DialogTitle>Agreement to Privacy Policy of PT Pertamina Lubricants</DialogTitle>
        <DialogContent
          sx={{
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column', // Ensure text stacks properly
            gap: 1, // Spacing for readability
          }}
        >
          <Typography variant="body2">
            I have carefully read, understood, and agree to abide by the terms and conditions
            outlined in the{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleOpen}
            >
              Privacy Policy
            </Typography>{' '}
            of PT Pertamina Lubricants.
          </Typography>
          <Typography variant="body2">
            By clicking &apos;Agree,&apos; I acknowledge and accept how my personal data will be collected,
            used, and processed as stated in the policy.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={dialog.onFalse} autoFocus>
            Agree
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
