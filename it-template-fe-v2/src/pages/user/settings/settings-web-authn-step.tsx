// @mui
import { Link } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { CHROMESTORE_GOOGLE } from 'src/config-global';

// ----------------------------------------------------------------------

const SUMMARY = [
  {
    title: 'Install New Tab Extension',
    description: 'Install the New Tab extension at: ',
    link: CHROMESTORE_GOOGLE,
    linkName: 'This Link',
    icon: 'solar:download-linear',
  },
  {
    title: 'Copy The WebAuthn Code',
    description: 'Retrieve and copy the WebAuthn code for secure authentication.',
    icon: 'solar:copy-linear',
  },
  {
    title: 'Open New Tab & Paste The Code',
    description: 'Open a new browser tab and paste the WebAuthn code to proceed.',
    icon: 'solar:clipboard-check-broken',
  },
];

export default function SettingWebAuthnStep() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <Box
        gap={5}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        sx={{ my: 10 }}
      >
        {SUMMARY.map((item) => (
          <Box key={item.title} sx={{ textAlign: 'center', px: 2 }}>
            <Iconify icon={item.icon} width={32} sx={{ color: 'primary.main' }} />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
            {item.link && (<Link
              key={item.link}
              href={item.link}
              variant="body2"
              target="_blank"
              rel="noopener"
              // sx={{ display: 'table' }}
            >
              {item.linkName || item.link}
            </Link>)}
          </Box>
        ))}
      </Box>
    </Container>
  );
}
