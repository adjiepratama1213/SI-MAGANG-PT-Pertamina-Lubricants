import { Helmet } from 'react-helmet-async';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import { bgGradient } from 'src/theme/css';
import Iconify from 'src/components/iconify';
import { CHROMESTORE_GOOGLE } from 'src/config-global';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:lock-password-bold-duotone',
    title: 'Secure Access',
    description: 'Akses aman access MFA dan Login idAman untuk security account Anda',
    color: '#3C6DB2',
  },
  {
    icon: 'solar:rocket-2-bold-duotone',
    title: 'Quick Access',
    description: 'Akses cepat ke POST IT langsung dari new tab browser Anda',
    color: '#00A76F',
  },
  {
    icon: 'solar:document-bold-duotone',
    title: 'Private Documents',
    description: 'Kelola dan akses dokumen pribadi Anda dengan mudah dan aman',
    color: '#7635dc',
  },
  {
    icon: 'solar:settings-bold-duotone',
    title: 'Easy Access',
    description: 'Instalasi dan akses mudah dengan satu klik new tab atau button Ctrl + T',
    color: '#FFAB00',
  },
];

const STEPS = [
  {
    step: 1,
    title: 'Klik Tombol Install',
    description: 'Klik tombol "Add to Chrome" di Chrome Web Store',
    icon: 'solar:download-bold-duotone',
  },
  {
    step: 2,
    title: 'Konfirmasi Instalasi',
    description: 'Konfirmasi instalasi extension di popup yang muncul',
    icon: 'solar:check-circle-bold-duotone',
  },
  {
    step: 3,
    title: 'Buka New Tab',
    description: 'Buka tab baru di browser untuk melihat POST IT',
    icon: 'solar:window-frame-bold-duotone',
  },
  {
    step: 4,
    title: 'Login & Mulai',
    description: 'Ketuk Login Button untuk masuk ke POST IT',
    icon: 'solar:login-2-bold-duotone',
  },
];

export default function ExtensionPage() {
  const theme = useTheme();

  const handleOpenStore = () => {
    window.open(CHROMESTORE_GOOGLE, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Extension - POST IT</title>
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: (theme.palette as any).pertamina?.main || '#3C6DB2',
            endColor: (theme.palette as any).pertamina?.dark || '#003768',
          }),
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, ${alpha(theme.palette.common.white, 0.08)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container>
          <Stack
            spacing={4}
            alignItems="center"
            sx={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                mb: 2,
              }}
            >
              <Iconify
                icon="solar:widget-5-bold-duotone"
                width={64}
                sx={{ color: 'common.white' }}
              />
            </Box>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'common.white',
                lineHeight: 1.2,
              }}
            >
              POST IT Browser Extension
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: alpha(theme.palette.common.white, 0.9),
                maxWidth: 720,
                lineHeight: 1.8,
              }}
            >
              Akses POST IT langsung dari new tab browser Anda dengan mudah dan aman. Install
              extension sekarang untuk pengalaman yang lebih cepat dan praktis.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleOpenStore}
              startIcon={<Iconify icon="solar:shop-bold-duotone" />}
              sx={{
                backgroundColor: 'common.white',
                color: (theme.palette as any).pertamina?.main || '#3C6DB2',
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 2,
                boxShadow: theme.customShadows.z24,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.95),
                  transform: 'translateY(-2px)',
                  boxShadow: theme.customShadows.z24,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Install dari Chrome Web Store
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.neutral', py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack spacing={5} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Fitur Extension
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              Nikmati berbagai fitur yang memudahkan akses dan penggunaan POST IT
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {FEATURES.map((feature) => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 3,
                    backgroundColor: 'common.white',
                    boxShadow: theme.customShadows.card,
                    border: `1px solid ${alpha(feature.color, 0.12)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.customShadows.z24,
                      borderColor: alpha(feature.color, 0.24),
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(feature.color, 0.12),
                      color: feature.color,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Iconify icon={feature.icon} width={40} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Installation Steps */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container>
          <Stack spacing={5} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Cara Instalasi
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600 }}>
              Ikuti langkah-langkah sederhana berikut untuk menginstal extension
            </Typography>
          </Stack>

          <Grid container spacing={4}>
            {STEPS.map((step) => (
              <Grid item xs={12} sm={6} md={3} key={step.step}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: 'common.white',
                    boxShadow: theme.customShadows.card,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.customShadows.z16,
                    },
                  }}
                >
                  <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        mb: 1,
                      }}
                    >
                      {step.step}
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    >
                      <Iconify icon={step.icon} width={24} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      {step.description}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenStore}
              startIcon={<Iconify icon="solar:shop-bold-duotone" />}
              sx={{
                backgroundColor: (theme.palette as any).pertamina?.main || '#3C6DB2',
                color: 'white',
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: 2,
                boxShadow: theme.customShadows.z16,
                '&:hover': {
                  backgroundColor: (theme.palette as any).pertamina?.dark || '#003768',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.customShadows.z24,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Buka Chrome Web Store
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
