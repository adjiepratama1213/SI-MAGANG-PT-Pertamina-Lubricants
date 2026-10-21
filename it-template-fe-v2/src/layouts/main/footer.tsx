// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// components
import Iconify from 'src/components/iconify';
import { PTPLLogo } from 'src/components/ptpl';

// ----------------------------------------------------------------------

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    icon: 'eva:facebook-fill',
    href: 'https://www.facebook.com/PertaminaLubricants/',
  },
  {
    name: 'X (Twitter)',
    icon: 'ri:twitter-x-fill',
    href: 'https://twitter.com/PertaminaLub',
  },
  {
    name: 'Instagram',
    icon: 'ri:instagram-line',
    href: 'https://www.instagram.com/pertaminalub/',
  },
  {
    name: 'LinkedIn',
    icon: 'ri:linkedin-fill',
    href: 'https://www.linkedin.com/company/pt-pertamina-lubricants/',
  },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      id="kontak"
      sx={{
        scrollMarginTop: { xs: '64px', md: '80px' },
        position: 'relative',
        bgcolor: '#191B1F',
        color: '#FFFFFF',
      }}
    >
      {/* Top tri-color Pertamina accent stripe (Merah, Hijau, Biru) */}
      <Box
        sx={{
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #ED1C24 0%, #ED1C24 33.33%, #58B947 33.33%, #58B947 66.66%, #004F9F 66.66%, #004F9F 100%)',
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 6, md: 8 },
          pb: { xs: 4, md: 5 },
          px: { xs: 2.5, md: 4, lg: 5 },
        }}
      >
        <Grid container spacing={{ xs: 5, md: 6 }} justifyContent="space-between">
          {/* COLUMN 1: BRAND & ABOUT */}
          <Grid xs={12} md={7} lg={6.8}>
            <Box component={RouterLink} href="/" sx={{ display: 'inline-block', mb: 3 }}>
              <PTPLLogo orientation="horizontal" fillStyle="white" width={230} height={50} />
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: '#D1D5DB',
                lineHeight: 1.7,
                fontSize: '0.88rem',
                mb: 2,
                maxWidth: 620,
              }}
            >
              PT Pertamina Lubricants merupakan bagian dari PT Pertamina Patra Niaga Subholding Downstream Pertamina yang berfokus pada produksi dan pemasaran produk pelumas serta specialty chemical berkelas dunia.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                lineHeight: 1.7,
                fontSize: '0.84rem',
                mb: 3.5,
                maxWidth: 620,
              }}
            >
              Portal Sistem Informasi Manajemen Magang (SI-Magang) memfasilitasi proses pendaftaran, seleksi, pendataan, dan monitoring terpadu seluruh peserta magang di lingkungan PT Pertamina Lubricants.
            </Typography>

            {/* Social Icons */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {SOCIAL_LINKS.map((item) => (
                <IconButton
                  key={item.name}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#FFFFFF',
                    color: '#191B1F',
                    '&:hover': {
                      bgcolor: '#E2E8F0',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Iconify icon={item.icon} width={18} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* COLUMN 2: TERHUBUNG DENGAN KAMI */}
          <Grid xs={12} md={5} lg={4.5}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                fontSize: '1rem',
                letterSpacing: 0.2,
                mb: 2.5,
              }}
            >
              Terhubung dengan kami
            </Typography>

            {/* Email Contact (Diatas Alamat) */}
            <Typography
              variant="body2"
              sx={{
                color: '#D1D5DB',
                mb: 2,
                fontSize: '0.88rem',
              }}
            >
              Email :{' '}
              <Link
                href="mailto:hr.lubricants@pertamina.com"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#38BDF8',
                    textDecoration: 'underline',
                  },
                }}
              >
                hr.lubricants@pertamina.com
              </Link>
            </Typography>

            {/* Address with Red Vertical Line Accent */}
            <Box
              component="a"
              href="https://maps.app.goo.gl/H9XMqiKaLu5gf58G8"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderLeft: '3px solid #ED1C24',
                pl: 2,
                display: 'block',
                textDecoration: 'none',
                color: '#D1D5DB',
                lineHeight: 1.65,
                fontSize: '0.88rem',
                '&:hover': {
                  color: '#FFFFFF',
                },
                transition: 'color 0.2s',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#F3F4F6', mb: 0.3 }}>
                Grha Pertamina Building
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1D5DB' }}>
                Pertamax Tower 15-17th Floor
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1D5DB' }}>
                Jl. Medan Merdeka Timur No. 10
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1D5DB' }}>
                Jakarta Pusat 10110 - Indonesia
              </Typography>
            </Box>

            {/* Embedded Google Maps - Grha Pertamina */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1.2,
                  color: '#9CA3AF',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <Iconify icon="solar:map-point-wave-bold" width={16} sx={{ color: '#ED1C24' }} />
                Lokasi Kantor Pusat (Grha Pertamina)
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 180, sm: 200 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Box
                  component="iframe"
                  title="Lokasi Kantor Pusat PT Pertamina Lubricants - Grha Pertamina"
                  src="https://maps.google.com/maps?q=Grha+Pertamina,+Jl.+Medan+Merdeka+Timur+No.11-13,+Gambir,+Jakarta+Pusat&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block',
                  }}
                  loading="lazy"
                  allowFullScreen
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* BOTTOM DIVIDER & COPYRIGHT */}
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 6, mb: 3 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            © 2026 PT Pertamina Lubricants. Seluruh hak cipta dilindungi undang-undang.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link
              component={RouterLink}
              href={paths.privacyPolicy.root}
              variant="caption"
              sx={{
                color: '#9CA3AF',
                textDecoration: 'none',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Kebijakan Privasi
            </Link>
            <Link
              component={RouterLink}
              href={paths.aboutUs.root}
              variant="caption"
              sx={{
                color: '#9CA3AF',
                textDecoration: 'none',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              Tentang Kami
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
