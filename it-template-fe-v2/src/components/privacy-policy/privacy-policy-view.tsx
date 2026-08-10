import { Box, Button, Card, Dialog, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import Iconify from 'src/components/iconify';
import TermsAndConditionsView from './privacy-view';

export function ExtendSnk() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Typography variant="caption">
        Saya telah membaca dan menyetujui
      </Typography>
      <Tooltip title="Buka Kebijakan Privasi">
        <IconButton onClick={handleOpen} sx={{ color: 'black', ml: 0 }}>
          <Typography variant="caption" sx={{ color: 'blue' }}>
            Kebijakan Privasi
          </Typography>
        </IconButton>
      </Tooltip>
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
              Close Privacy Policy
            </Button>
          </Box>
        </Card>
      </Dialog>
    </>
  );
}
