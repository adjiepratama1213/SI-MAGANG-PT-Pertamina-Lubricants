// src/components/DevModeBanner.tsx
import { Box } from '@mui/material';

export function DevModeBanner({ devMode }: { devMode: string }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 110,
        left: -30,
        bgcolor: '#ba313b',
        width: 200,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        transform: 'rotate(-45deg)',
        transformOrigin: 'top left',
        textTransform: 'uppercase',
        zIndex: 9999,
      }}
    >
      {devMode}
    </Box>
  );
}
