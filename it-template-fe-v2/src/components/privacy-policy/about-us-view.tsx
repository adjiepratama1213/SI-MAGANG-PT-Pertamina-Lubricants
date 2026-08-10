import ReactPlayer from 'react-player';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import Iconify from 'src/components/iconify';
import AboutUsHero from './about-us-hero';

// ----------------------------------------------------------------------

const HIGHLIGHTS = [
  {
    icon: 'eva:flash-fill',
    title: 'Inovasi Digital',
    description:
      'Aplikasi POST IT sebagai solusi terintegrasi untuk pengelolaan aplikasi di Pertamina.',
    color: '#00A76F',
  },
  {
    icon: 'eva:heart-fill',
    title: 'Nilai Akhlak',
    description:
      'Implementasi nilai akhlak sebagai core values dalam mencapai kinerja bisnis yang tinggi.',
    color: '#FF5630',
  },
  {
    icon: 'eva:trending-up-fill',
    title: 'Efisiensi Operasional',
    description:
      'POST IT dirancang untuk meningkatkan efisiensi dengan penyederhanaan proses pengaksesan berbagai aplikasi oleh karyawan.',
    color: '#2065D1',
  },
  {
    icon: 'eva:globe-2-fill',
    title: 'Kemudahan Akses',
    description: 'Aplikasi diharapkan mempercepat akses informasi dan dokumen untuk para pekerja.',
    color: '#7635dc',
  },
  {
    icon: 'eva:person-fill',
    title: 'Pengelolaan Berbasis Posisi',
    description: 'Aplikasi ini dapat mengelompokkan aplikasi berdasarkan posisi pekerja.',
    color: '#fda92d',
  },
  {
    icon: 'eva:people-fill',
    title: 'Kolaborasi Tim',
    description:
      'Dengan pengelolaan aplikasi yang terpusat, tim IT dapat memastikan bahwa semua link dan dokumentasi diperbarui dan dapat diakses dengan mudah.',
    color: '#00B8D9',
  },
];

const KEY_INSIGHTS = [
  {
    icon: 'eva:grid-fill',
    title: 'Integrasi Aplikasi',
    description: 'Menyatukan berbagai platform dalam satu akses yang mudah.',
    color: '#22C55E',
  },
  {
    icon: 'eva:activity-fill',
    title: 'Peningkatan Kinerja',
    description:
      'Mempermudah akses aplikasi sehingga karyawan bisa lebih fokus pada pekerjaan inti.',
    color: '#FFAB00',
  },
  {
    icon: 'eva:bulb-fill',
    title: 'Pembelajaran dari Masalah',
    description:
      'Masalah yang sering dihadapi, seperti kesulitan menemukan link aplikasi, menjadi dasar untuk pengembangan aplikasi POST IT.',
    color: '#8E33FF',
  },
];

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  color: string;
  index: number;
};

function FeatureCard({ icon, title, description, color, index }: FeatureCardProps) {
  const theme = useTheme();

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, opacity',
        '&:hover': {
          boxShadow: `0 12px 40px ${alpha(color, 0.25)}`,
          borderColor: alpha(color, 0.4),
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(color, 0.2)}`,
            }}
          >
            <Iconify icon={icon} width={28} sx={{ color }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', md: '1.125rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.8,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AboutUsView() {
  const theme = useTheme();

  return (
    <>
      <AboutUsHero />

      <Box
        sx={{
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: `linear-gradient(to bottom, ${alpha((theme.palette as any).pertamina.main, 0.06)}, transparent)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container sx={{ position: 'relative', py: { xs: 5, md: 10 } }}>
          {/* Introduction Section */}
          <Box
            sx={{
              mb: { xs: 5, md: 8 },
              textAlign: 'center',
            }}
          >
            <Chip
              icon={<Iconify icon="eva:info-fill" width={18} />}
              label="TENTANG APLIKASI"
              sx={{
                bgcolor: alpha((theme.palette as any).pertamina.main, 0.1),
                color: (theme.palette as any).pertamina.main,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 32,
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.75rem' },
                fontWeight: 800,
                mb: 3,
                background: `linear-gradient(135deg, ${(theme.palette as any).pertamina.main} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              POST IT (PERTAMINA ON SINGLE TAB)
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1.0625rem' },
                color: 'text.secondary',
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.9,
                mb: 2,
              }}
            >
              Sistem ini dirancang untuk mengatasi masalah umum yang dihadapi Perwira Pertamina,
              seperti kesulitan menemukan link aplikasi atau dokumentasi yang tepat. Dengan POST IT,
              semua pengguna dapat dengan mudah mengakses aplikasi yang berkaitan dengan posisi
              mereka.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1.0625rem' },
                color: 'text.secondary',
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.9,
              }}
            >
              Tiga fitur utama dari POST IT meliputi akses yang mudah, pengelompokan aplikasi secara
              efisien, dan manajemen berdasarkan tim dan ID posisi. Ini memberikan cara yang
              terorganisasi untuk mengakses aplikasi penting tanpa kesulitan.
            </Typography>
          </Box>

          {/* Highlights Section */}
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                mb: 4,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Sorotan Utama
            </Typography>
            <Grid container spacing={3}>
              {HIGHLIGHTS.map((highlight, index) => (
                <Grid key={highlight.title} xs={12} sm={6} md={4}>
                  <FeatureCard {...highlight} index={index} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Key Insights Section */}
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                fontWeight: 700,
                mb: 4,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              Wawasan Kunci
            </Typography>
            <Grid container spacing={3}>
              {KEY_INSIGHTS.map((insight, index) => (
                <Grid key={insight.title} xs={12} md={4}>
                  <FeatureCard {...insight} index={index} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Video Section */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.08)}`,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={<Iconify icon="eva:play-circle-fill" width={18} />}
                    label="VIDEO SOSIALISASI"
                    sx={{
                      bgcolor: alpha((theme.palette as any).pertamina.main, 0.1),
                      color: (theme.palette as any).pertamina.main,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 32,
                      mb: 2,
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 1,
                    }}
                  >
                    Simak Video Sosialisasi
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      maxWidth: 600,
                      mx: 'auto',
                    }}
                  >
                    Pelajari lebih lanjut tentang POST IT melalui video sosialisasi berikut
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 900,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                  }}
                >
                  <ReactPlayer
                    url="https://youtu.be/7ssHrT0WvQk"
                    controls
                    width="100%"
                    height={500}
                    style={{ borderRadius: 8 }}
                  />
                </Box>
              </Stack>
            </CardContent>
            <CardContent sx={{ px: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha((theme.palette as any).pertamina.main, 0.04),
                  border: `1px solid ${alpha((theme.palette as any).pertamina.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    textAlign: 'justify',
                    lineHeight: 1.9,
                    color: 'text.primary',
                  }}
                >
                  Sosialisasi aplikasi Pertamina On Single Tab (POST IT) diselenggarakan sebagai
                  upaya Fungsi Information & Communication Technology (ICT) dalam meningkatkan{' '}
                  <b>
                    kemudahan akses, efektivitas, dan efisiensi pemanfaatan aplikasi serta
                    dokumentasi digital di lingkungan PT Pertamina Lubricants
                  </b>
                  . Kegiatan diawali dengan penguatan nilai AKHLAK dan pemaparan aspek keselamatan
                  kerja, kemudian dilanjutkan dengan sambutan Manajemen yang menekankan tantangan
                  meningkatnya jumlah aplikasi akibat digitalisasi, yang berdampak pada kesulitan
                  akses informasi dan tingginya tiket layanan IT. Melalui pemaparan teknis,
                  dijelaskan bahwa POST IT merupakan solusi berbasis single access yang
                  mengonsolidasikan seluruh link aplikasi dan dokumentasi dalam satu tab, dikelola
                  berdasarkan fungsi dan position ID, sehingga mendukung mobilitas organisasi,
                  mengurangi ketergantungan individu, serta meningkatkan produktivitas kerja.
                  Diharapkan implementasi POST IT dapat menjadi enabler transformasi digital yang
                  lebih terstruktur, terintegrasi, dan berkelanjutan di PT Pertamina Lubricants.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
}
