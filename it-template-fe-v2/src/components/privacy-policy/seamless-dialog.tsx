// @mui
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Box, Card, Typography, TypographyProps } from '@mui/material';
import TermsAndConditionsView from './privacy-view';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

type PrivacyProps = {
  variant?: TypographyProps['variant']; // Ensures valid MUI typography variants
};

export default function PrivacyPolicySeamlessDialog({ variant = 'body2' }: PrivacyProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Typography variant={variant}>
        Saya telah membaca dengan saksama, memahami, dan menyetujui untuk mematuhi syarat dan ketentuan yang tercantum dalam{' '}
        <Typography
          component="span"
          variant={variant}
          sx={{ color: '#003882', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
          onClick={handleOpen}
        >
          Kebijakan Privasi
        </Typography>{' '}
        PT Pertamina Lubricants.
      </Typography>

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
