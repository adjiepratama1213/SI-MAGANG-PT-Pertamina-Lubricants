// @mui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/pages/paths';
// locales
// components

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            SI-MAGANG
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            PT Pertamina Lubricants
          </Typography>
        </Stack>

        <Button variant="soft" href={paths.waSystem} target="_blank" rel="noopener" size="small">
          Contact Us!
        </Button>
      </Stack>
    </Stack>
  );
}
