// @mui
import { Stack } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

type LoadingScreenProps = BoxProps & {
  message?: React.ReactNode;
};

export default function LoadingScreen({ message, sx, ...other }: LoadingScreenProps) {
  return (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      <Stack spacing={2} alignItems="center" sx={{ width: 1, maxWidth: 360 }}>
        <LinearProgress color="inherit" sx={{ width: '100%' }} />
        {message}
      </Stack>
    </Box>
  );
}
