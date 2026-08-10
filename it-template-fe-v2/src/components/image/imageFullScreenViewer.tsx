import { useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImageFullScreenViewerProps {
  url: string;
  alt?: string;
  maxWidth?: number;
}

export default function ImageFullScreenViewer({
  url,
  alt = 'image',
  maxWidth = 200,
}: ImageFullScreenViewerProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        component="img"
        src={url}
        alt={alt}
        sx={{
          maxWidth,
          borderRadius: 0.5,
          mt: 0,
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          transform: 'scale(1.1)',
          '&:hover': { transform: 'scale(1.3)' },
        }}
        onClick={handleOpen}
      />

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            component="img"
            src={url}
            alt={alt}
            sx={{
              minWidth: '90%',
              borderRadius: 1,
              padding: 0,
            }}
          />
        </Box>
      </Modal>
    </>
  );
}
