// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
// routes
import { RouterLink } from 'src/components/router-link';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { usePathname } from 'src/hooks/use-pathname';
// components
import { Logo } from 'src/components/logo';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children }: Props) {
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');
  const pathname = usePathname();

  const isRegister = pathname.includes('/auth/register');
  const isForgotPassword = pathname.includes('/auth/forgot-password');
  const isMfa = pathname.includes('/mfa');

  const authTheme = createTheme(theme, {
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'Inter, Poppins, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            backgroundColor: '#003882',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(0, 56, 130, 0.15)',
            '&:hover': {
              backgroundColor: '#002860',
              boxShadow: '0 4px 12px rgba(0, 56, 130, 0.25)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1.5px',
            },
            '&:hover': {
              backgroundColor: '#FAFCFF',
            },
            '&:hover fieldset': {
              borderColor: '#94A3B8',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 4px rgba(0, 56, 130, 0.12)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#003882',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  });

  const renderLeftPanel = (
    <Stack
      sx={{
        width: { md: '42%', lg: '44%' },
        minWidth: { md: 360, lg: 440 },
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(3, 45, 98, 0.88) 0%, rgba(0, 25, 60, 0.95) 100%)',
        p: { md: 4, lg: 6 },
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/assets/images/ptpl/hero-carousel/slide-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
          mixBlendMode: 'luminosity',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Top Logo */}
      <Box sx={{ zIndex: 1 }}>
        <Logo fillStyle="white" />
      </Box>

      {/* Middle Content */}
      <Box sx={{ zIndex: 1, my: 'auto', py: 4 }}>
        {isRegister ? (
          <>
            {/* Heading */}
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { md: '30px', lg: '36px' },
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Bergabunglah
              <br />
              dalam Program
              <br />
              Magang Kami
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14.5px',
                lineHeight: 1.65,
                maxWidth: 440,
              }}
            >
              Kembangkan potensimu bersama para profesional di PT Pertamina Lubricants dan dapatkan pengalaman industri yang berharga.
            </Typography>
          </>
        ) : isForgotPassword ? (
          <>
            {/* Subtitle / badge */}
            <Typography
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              PORTAL MAGANG
            </Typography>

            {/* Heading */}
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { md: '32px', lg: '38px' },
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Atur Ulang
              <br />
              Kata Sandi Anda
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14.5px',
                lineHeight: 1.65,
                maxWidth: 440,
              }}
            >
              Masukkan email Anda dan tentukan kata sandi baru untuk kembali mengakses portal magang PT Pertamina Lubricants.
            </Typography>
          </>
        ) : isMfa ? (
          <>
            {/* Subtitle / badge */}
            <Typography
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              KEAMANAN AKUN
            </Typography>

            {/* Heading */}
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { md: '32px', lg: '38px' },
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Verifikasi
              <br />
              Multi-Faktor (MFA)
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14.5px',
                lineHeight: 1.65,
                maxWidth: 440,
              }}
            >
              Lapisan keamanan verifikasi ekstra untuk melindungi akun dan kerahasiaan data magang Anda di PT Pertamina Lubricants.
            </Typography>
          </>
        ) : (
          <>
            {/* Subtitle / badge */}
            <Typography
              sx={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              PORTAL MAGANG
            </Typography>

            {/* Heading */}
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: { md: '32px', lg: '38px' },
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              Selamat Datang
              <br />
              di Portal Magang{' '}
              <Box component="span" sx={{ color: '#38bdf8' }}>
                Pertamina
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14.5px',
                lineHeight: 1.65,
                maxWidth: 440,
              }}
            >
              Masuk untuk mengakses dashboard magang Anda, kelola dokumen, dan pantau kegiatan magang Anda di PT Pertamina Lubricants.
            </Typography>
          </>
        )}
      </Box>

      {/* Bottom Footer */}
      <Box sx={{ zIndex: 1 }}>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px' }}>
          © 2026 PT Pertamina Lubricants
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <ThemeProvider theme={authTheme}>
      <Stack
        component="main"
        direction="row"
        sx={{
          minHeight: '100vh',
          bgcolor: '#ffffff',
        }}
      >
        {mdUp && renderLeftPanel}

        {/* Right Form Content */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'flex-start', sm: 'center' },
            minHeight: '100vh',
            overflowY: 'auto',
            py: { xs: 3.5, sm: 5, md: 6 },
            px: { xs: 2, sm: 3.5, md: 5, lg: 7 },
            bgcolor: '#ffffff',
          }}
        >
          {/* Mobile Logo */}
          {!mdUp && (
            <Box sx={{ mb: { xs: 3, sm: 4 }, mt: { xs: 1, sm: 0 }, display: 'flex', justifyContent: 'center' }}>
              <Logo />
            </Box>
          )}

          <Box
            sx={{
              width: 1,
              maxWidth: isRegister ? 580 : 480,
              mx: 'auto',
            }}
          >
            {/* Back to Home Button */}
            <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
              <Button
                component={RouterLink}
                href="/"
                startIcon={
                  <Iconify
                    icon="solar:arrow-left-linear"
                    width={16}
                    sx={{
                      transition: 'transform 0.2s ease',
                    }}
                  />
                }
                sx={{
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 0.6,
                  px: 1.5,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#003882',
                    bgcolor: '#EFF6FF',
                    borderColor: '#BFDBFE',
                    boxShadow: '0 2px 6px 0 rgba(0, 56, 130, 0.08)',
                    '& .iconify': {
                      transform: 'translateX(-3px)',
                    },
                  },
                }}
              >
                Kembali ke Beranda
              </Button>
            </Box>

            {children}
          </Box>
        </Box>
      </Stack>
    </ThemeProvider>
  );
}

