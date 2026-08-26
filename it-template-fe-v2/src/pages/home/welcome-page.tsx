import { Suspense, lazy, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';

import Image from 'src/components/image';
import { Skeleton } from '@mui/material';
import Iconify from 'src/components/iconify';
import { MotionViewport, varFade } from 'src/components/animate';
import { m } from 'framer-motion';

const HomeAdvertisement = lazy(() => import('./home-advertisement'));

const WELCOME_CATEGORIES = [
  {
    label: 'Konten & Aktifitas',
    icon: './assets/images/ptpl/konten.jpeg',
    href: 'https://www.pertaminalubricants.com/campaign',
  },
  {
    label: 'Media & Informasi',
    icon: './assets/images/ptpl/maxresdefault.jpg',
    href: 'https://www.pertaminalubricants.com/news/category/3',
  },
  {
    label: 'Bengkel Terdekat',
    icon: './assets/images/ptpl/img-olimart.jpg',
    href: 'https://www.pertaminalubricants.com/bengkel',
  },
  {
    label: 'Produk Otomotif',
    icon: './assets/images/ptpl/otomotif.jpg',
    href: 'https://www.pertaminalubricants.com/automotive/produk_automotive',
  },
  {
    label: 'Produk Industri',
    icon: './assets/images/ptpl/industri.jpg',
    href: 'https://www.pertaminalubricants.com/industry',
  },
  {
    label: 'Produk Mancanegara',
    icon: './assets/images/ptpl/internasional.jpg',
    href: 'https://www.pertaminalubricants.com/overseas',
  },
];

const FEATURES = [
  {
    title: 'Bank Data',
    description:
      'Kelola semua data, posting, blog, dan dokumentasi dengan mudah. Sistem yang terintegrasi untuk menyimpan dan mengorganisir konten tim Anda.',
    icon: 'eva:file-text-fill',
    color: '#00A76F',
  },
  {
    title: 'Kolaborasi Tim',
    description:
      'Bekerja sama dengan tim melalui squad dan workspace terorganisir. Bagikan konten dan berkolaborasi dalam real-time.',
    icon: 'eva:people-fill',
    color: '#2065D1',
  },
  {
    title: 'AI-Powered',
    description:
      'Gunakan Generative AI untuk membantu membuat konten dan deskripsi yang menarik secara otomatis.',
    icon: 'eva:flash-fill',
    color: '#7635dc',
  },
  {
    title: 'Pencarian Canggih',
    description:
      'Temukan konten dengan cepat menggunakan sistem pencarian yang powerful dengan filter berdasarkan tag, tim, dan kategori.',
    icon: 'eva:search-fill',
    color: '#fda92d',
  },
  {
    title: 'Custom Forms',
    description:
      'Buat formulir kustom sesuai kebutuhan tim. Kumpulkan data dan kelola pengajuan dengan sistem form yang fleksibel.',
    icon: 'eva:edit-2-fill',
    color: '#FF5630',
  },
  {
    title: 'Dashboard Analytics',
    description:
      'Pantau aktivitas dan statistik dengan dashboard interaktif. Visualisasi data yang membantu pengambilan keputusan.',
    icon: 'eva:bar-chart-2-fill',
    color: '#00B8D9',
  },
];

export default function WelcomePage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(to bottom, ${alpha((theme.palette as any).pertamina.main, 0.03)}, ${alpha(theme.palette.primary.main, 0.02)})`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 30%, ${alpha((theme.palette as any).pertamina.main, 0.08)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container component={MotionViewport} maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Header Section */}
        <Box
          component={m.div}
          variants={varFade().inDown}
          sx={{
            textAlign: 'center',
            pt: 14,
            pb: 2,
            position: 'relative',
            display: { xs: 'none', md: 'block' },
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: -50, md: -100 },
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 300, md: 600 },
              height: { xs: 300, md: 600 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha((theme.palette as any).pertamina.main, 0.1)} 0%, transparent 70%)`,
              filter: 'blur(60px)',
              zIndex: 0,
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{
                fontSize: { xs: '0.75rem', md: '1rem' },
                fontWeight: 600,
                color: (theme.palette as any).pertamina.main,
                letterSpacing: 2,
                mb: 2,
                display: 'block',
              }}
            >
              PERTAMINA ON SINGLE TAB
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                color: 'text.primary',
                mb: 2,
                lineHeight: 1.1,
                background: `linear-gradient(135deg, ${(theme.palette as any).pertamina.main} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
              }}
            >
              POST IT
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1rem' },
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 800,
                mx: 'auto',
                mb: 4,
              }}
            >
              Platform Terintegrasi untuk Manajemen Dokumentasi & Kolaborasi Tim
            </Typography>
          </Box>
        </Box>

        {/* Advertisement Section */}
        <Box
          component={m.div}
          variants={varFade().inUp}
          sx={{ pt: { xs: 12, md: 0 }, mb: { xs: 6, md: 10 } }}
        >
          <Suspense
            fallback={<Skeleton variant="rectangular" sx={{ height: 280, borderRadius: 2 }} />}
          >
            <HomeAdvertisement />
          </Suspense>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Box component={m.div} variants={varFade().inDown} sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Fitur Unggulan
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Platform lengkap dengan berbagai fitur canggih untuk meningkatkan produktivitas dan
              kolaborasi tim Anda
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {FEATURES.map((feature, index) => (
              <Grid xs={12} sm={6} md={4} key={feature.title}>
                <FeatureCard feature={feature} index={index} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Categories Section */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Box component={m.div} variants={varFade().inDown} sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
              }}
            >
              Eksplorasi Layanan Kami
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Akses berbagai layanan dan informasi penting dari Pertamina Lubricants
            </Typography>
          </Box>

          <Box
            gap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(6, 1fr)',
            }}
          >
            {WELCOME_CATEGORIES.map((category) => (
              <CategoryCard key={category.label} category={category} />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

type FeatureCardProps = {
  feature: {
    title: string;
    description: string;
    icon: string;
    color: string;
  };
  index: number;
};

function FeatureCard({ feature, index }: FeatureCardProps) {
  const theme = useTheme();
  const { title, description, icon, color } = feature;
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      component={m.div}
      variants={varFade().inUp}
      custom={index}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: 3,
        height: '100%',
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        bgcolor: 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 16px 32px ${alpha(color, 0.2)}, 0 0 0 1px ${alpha(color, 0.1)}`
          : `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0)',
        }}
      >
        <Iconify icon={icon} width={32} sx={{ color }} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 1.5,
          transition: 'color 0.3s ease',
          ...(hovered && {
            color,
          }),
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
    </Card>
  );
}

// ----------------------------------------------------------------------

type CardMobileProps = {
  category: {
    label: string;
    icon: string;
    href: string;
  };
};

function CategoryCard({ category }: CardMobileProps) {
  const theme = useTheme();
  const { label, icon, href } = category;
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        textDecoration: 'none',
        overflow: 'hidden',
        borderRadius: 2,
        cursor: 'pointer',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        bgcolor: 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        '&:hover': {
          borderColor: alpha((theme.palette as any).pertamina.main, 0.3),
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4/3',
        }}
      >
        <Image
          alt={label}
          src={icon}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(to bottom, transparent 0%, ${alpha(theme.palette.common.black, hovered ? 0.4 : 0.2)} 100%)`,
            transition: 'all 0.3s ease',
          }}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            transition: 'color 0.3s ease',
            ...(hovered && {
              color: (theme.palette as any).pertamina.main,
            }),
          }}
        >
          {label}
        </Typography>
      </Box>
    </Card>
  );
}
