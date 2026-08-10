import { useRef, useEffect, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import { CHROMESTORE_GOOGLE } from 'src/config-global';

// ----------------------------------------------------------------------

const EXTENSION_STEPS = [
  {
    label: 'Akses Chrome Web Store',
    description: 'Buka Chrome Web Store dan cari "POST IT" atau klik link yang tersedia.',
    icon: 'solar:shop-bold-duotone',
  },
  {
    label: 'Install Extension',
    description: 'Klik tombol "Add to Chrome" untuk menginstal extension POST IT ke browser Anda.',
    icon: 'solar:download-bold-duotone',
  },
  {
    label: 'Aktifkan Extension',
    description:
      'Setelah terinstal, extension akan otomatis aktif. Buka tab baru untuk melihat POST IT.',
    icon: 'solar:check-circle-bold-duotone',
  },
  {
    label: 'Login & Mulai Gunakan',
    description:
      'Login menggunakan akun Pertamina Anda dan mulai gunakan POST IT di new tab browser.',
    icon: 'solar:login-2-bold-duotone',
  },
];

const POST_STEPS = [
  {
    label: 'Akses Halaman Post',
    description: 'Klik menu "Post" di sidebar atau kunjungi /post untuk melihat daftar post.',
    icon: 'solar:document-bold-duotone',
  },
  {
    label: 'Buat Post Baru',
    description: 'Klik tombol "New Post" di bagian atas halaman untuk membuat post baru.',
    icon: 'mingcute:add-line',
  },
  {
    label: 'Isi Form Post',
    description: 'Isi judul, deskripsi, link, tags, dan upload thumbnail (opsional).',
    icon: 'solar:pen-bold-duotone',
  },
  {
    label: 'Publish atau Save as Draft',
    description:
      'Pilih "Publish" untuk langsung mempublish atau "Save as Draft" untuk menyimpan draft.',
    icon: 'solar:file-check-bold-duotone',
  },
];

const BLOG_STEPS = [
  {
    label: 'Akses Blog Management',
    description: 'Klik menu "Blog Management" di sidebar atau kunjungi /blog-management.',
    icon: 'solar:book-bold-duotone',
  },
  {
    label: 'Buat Blog Baru',
    description: 'Klik tombol "New Blog" untuk membuat artikel blog baru.',
    icon: 'mingcute:add-line',
  },
  {
    label: 'Tulis Konten Blog',
    description:
      'Gunakan editor rich text untuk menulis konten blog. Anda bisa menambahkan gambar, link, dan format teks.',
    icon: 'solar:text-bold-duotone',
  },
  {
    label: 'Publish Blog',
    description:
      'Setelah selesai, klik "Publish" untuk mempublish blog Anda. Blog akan muncul di halaman blog management.',
    icon: 'solar:upload-bold-duotone',
  },
];

const DASHBOARD_FEATURES = [
  {
    icon: 'solar:chart-2-bold-duotone',
    title: 'Analytics Dashboard',
    description:
      'Pantau statistik posting, klik, dan aktivitas pengguna dalam bentuk visualisasi yang mudah dipahami.',
    color: '#3C6DB2',
  },
  {
    icon: 'solar:graph-up-bold-duotone',
    title: 'Performance Metrics',
    description:
      'Lihat tren posting, engagement rate, dan performa konten Anda dari waktu ke waktu.',
    color: '#00A76F',
  },
  {
    icon: 'solar:medal-ribbon-bold-duotone',
    title: 'Achievement Badges',
    description: 'Dapatkan badge berdasarkan aktivitas posting Anda (Bronze, Silver, Gold).',
    color: '#FFAB00',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Team Collaboration',
    description: 'Lihat statistik posting tim Anda dan kolaborasi dengan anggota tim lainnya.',
    color: '#7635dc',
  },
];

type StepCardProps = {
  step: {
    label: string;
    description: string;
    icon: string;
  };
  index: number;
};

function StepCard({ step, index }: StepCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: 'common.white',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}, 0 1px 3px ${alpha(theme.palette.common.black, 0.12)}`,
        border: `1px solid ${alpha((theme.palette as any).pertamina?.main || '#3C6DB2', 0.12)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.12)}, 0 4px 8px ${alpha(theme.palette.common.black, 0.16)}`,
          borderColor: alpha((theme.palette as any).pertamina?.main || '#3C6DB2', 0.24),
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha((theme.palette as any).pertamina?.main || '#3C6DB2', 0.12),
              color: (theme.palette as any).pertamina?.main || '#3C6DB2',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            {index + 1}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha((theme.palette as any).pertamina?.light || '#B9313A', 0.12),
              color: (theme.palette as any).pertamina?.light || '#B9313A',
            }}
          >
            <Iconify icon={step.icon} width={24} height={24} />
          </Box>
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {step.label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.grey[700],
            lineHeight: 1.8,
            fontWeight: 400,
          }}
        >
          {step.description}
        </Typography>
      </Stack>
    </Card>
  );
}

const SECTIONS = [
  {
    id: 'download-extension',
    title: 'Cara Download Extension',
    icon: 'eva:cloud-download-fill',
    color: '#3C6DB2',
  },
  {
    id: 'create-post',
    title: 'Cara Membuat Post / Bookmark List',
    icon: 'solar:document-bold-duotone',
    color: '#00A76F',
  },
  {
    id: 'create-blog',
    title: 'Cara Membuat Blog',
    icon: 'solar:book-bold-duotone',
    color: '#00B8D4',
  },
  {
    id: 'dashboard',
    title: 'Apa Itu Dashboard?',
    icon: 'solar:chart-2-bold-duotone',
    color: '#FFAB00',
  },
];

type TableOfContentsProps = {
  sections: typeof SECTIONS;
  activeSection: string | null;
  onSectionClick: (id: string) => void;
};

function TableOfContents({ sections, activeSection, onSectionClick }: TableOfContentsProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: 'common.white',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}, 0 1px 3px ${alpha(theme.palette.common.black, 0.12)}`,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        mb: { xs: 4, md: 0 },
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify
            icon="solar:bookmark-bold-duotone"
            width={24}
            sx={{ color: theme.palette.primary.main }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Daftar Isi
          </Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={1}>
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            return (
              <Box
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? alpha(section.color as any, 0.12) : 'transparent',
                  border: `1px solid ${isActive ? alpha(section.color as any, 0.24) : 'transparent'}`,
                  '&:hover': {
                    backgroundColor: alpha(section.color as any, 0.08),
                    borderColor: alpha(section.color as any, 0.16),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(section.color as any, isActive ? 0.2 : 0.1),
                    color: section.color,
                    flexShrink: 0,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      lineHeight: 1.4,
                    }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                {isActive && (
                  <Iconify
                    icon="solar:alt-arrow-right-bold"
                    width={16}
                    sx={{ color: section.color, flexShrink: 0 }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}

export default function UserManualView() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(SECTIONS[0].id);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (id: string) => {
    const element = sectionRefs.current[id];
    if (element) {
      const offset = 100; // Offset untuk header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset untuk menentukan active section

      for (let i = SECTIONS.length - 1; i >= 0; i -= 1) {
        const section = SECTIONS[i];
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.neutral', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 6 },
            alignItems: 'flex-start',
          }}
        >
          {/* Table of Contents - Desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 300,
              flexShrink: 0,
              position: 'sticky',
              top: 100,
              alignSelf: 'flex-start',
              height: 'fit-content',
              zIndex: 10,
            }}
          >
            <TableOfContents
              sections={SECTIONS}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </Box>

          {/* Content */}
          <Box>
            {/* Table of Contents - Mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
              <TableOfContents
                sections={SECTIONS}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </Box>

            {/* Section 1: Download Extension */}
            <Box
              ref={(el) => {
                sectionRefs.current['download-extension'] = el as HTMLElement | null;
              }}
              sx={{ mb: { xs: 6, md: 8 } }}
            >
              <Stack spacing={3} alignItems="flex-start" sx={{ mb: 5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${(theme.palette as any).pertamina?.main || '#3C6DB2'} 0%, ${(theme.palette as any).pertamina?.light || '#B9313A'} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    1. Cara Download Extension
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(
                        (theme.palette as any).pertamina?.main || '#3C6DB2',
                        0.12
                      ),
                      color: (theme.palette as any).pertamina?.main || '#3C6DB2',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="eva:cloud-download-fill" width={24} />
                  </Box>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.grey[700], maxWidth: 720, fontWeight: 400 }}
                >
                  Install extension POST IT agar bisa mengakses aplikasi langsung dari new tab
                  browser.
                </Typography>
              </Stack>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {EXTENSION_STEPS.map((step, index) => (
                  <StepCard key={step.label} step={step} index={index} />
                ))}
              </Stack>

              <Box sx={{ textAlign: 'left' }}>
                <Button
                  variant="contained"
                  size="large"
                  href={CHROMESTORE_GOOGLE}
                  target="_blank"
                  startIcon={<Iconify icon="solar:shop-bold-duotone" />}
                  sx={{
                    backgroundColor: (theme.palette as any).pertamina?.main || '#3C6DB2',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z8,
                    '&:hover': {
                      backgroundColor: (theme.palette as any).pertamina?.dark || '#003768',
                      boxShadow: theme.customShadows.z16,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Download Extension
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: { xs: 5, md: 6 } }} />

            {/* Section 2: Membuat Post */}
            <Box
              ref={(el) => {
                sectionRefs.current['create-post'] = el as HTMLElement | null;
              }}
              sx={{ mb: { xs: 6, md: 8 } }}
            >
              <Stack spacing={3} alignItems="flex-start" sx={{ mb: 5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    2. Cara Membuat Post / Bookmark List
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.success.main, 0.12),
                      color: theme.palette.success.main,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:document-bold-duotone" width={24} />
                  </Box>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.grey[700], maxWidth: 720, fontWeight: 400 }}
                >
                  Buat post atau bookmark list untuk menyimpan dan membagikan link aplikasi penting.
                </Typography>
              </Stack>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {POST_STEPS.map((step, index) => (
                  <StepCard key={step.label} step={step} index={index} />
                ))}
              </Stack>

              <Box sx={{ textAlign: 'left' }}>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:document-bold-duotone" />}
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z8,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                      boxShadow: theme.customShadows.z16,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Buka Halaman Post
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: { xs: 5, md: 6 } }} />

            {/* Section 3: Membuat Blog */}
            <Box
              ref={(el) => {
                sectionRefs.current['create-blog'] = el as HTMLElement | null;
              }}
              sx={{ mb: { xs: 6, md: 8 } }}
            >
              <Stack spacing={3} alignItems="flex-start" sx={{ mb: 5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    3. Cara Membuat Blog
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.info.main, 0.12),
                      color: theme.palette.info.main,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:book-bold-duotone" width={24} />
                  </Box>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.grey[700], maxWidth: 720, fontWeight: 400 }}
                >
                  Buat artikel blog untuk berbagi informasi, dokumentasi, atau panduan dengan tim
                  Anda.
                </Typography>
              </Stack>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {BLOG_STEPS.map((step, index) => (
                  <StepCard key={step.label} step={step} index={index} />
                ))}
              </Stack>

              <Box sx={{ textAlign: 'left' }}>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:book-bold-duotone" />}
                  sx={{
                    backgroundColor: theme.palette.info.main,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z8,
                    '&:hover': {
                      backgroundColor: theme.palette.info.dark,
                      boxShadow: theme.customShadows.z16,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Buka Blog Management
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: { xs: 5, md: 6 } }} />

            {/* Section 4: Penjelasan Dashboard */}
            <Box
              ref={(el) => {
                sectionRefs.current.dashboard = el as HTMLElement | null;
              }}
              sx={{ mb: { xs: 4, md: 6 } }}
            >
              <Stack spacing={3} alignItems="flex-start" sx={{ mb: 5 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    4. Apa Itu Dashboard?
                  </Typography>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(theme.palette.warning.main, 0.12),
                      color: theme.palette.warning.main,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon="solar:chart-2-bold-duotone" width={24} />
                  </Box>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.grey[700], maxWidth: 720, fontWeight: 400 }}
                >
                  Dashboard adalah pusat kontrol untuk memantau aktivitas, statistik, dan performa
                  konten Anda.
                </Typography>
              </Stack>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {DASHBOARD_FEATURES.map((feature) => (
                  <Card
                    key={feature.title}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: 'common.white',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}, 0 1px 3px ${alpha(theme.palette.common.black, 0.12)}`,
                      border: `1px solid ${alpha(feature.color, 0.12)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.12)}, 0 4px 8px ${alpha(theme.palette.common.black, 0.16)}`,
                        borderColor: alpha(feature.color, 0.24),
                      },
                    }}
                  >
                    <Stack direction="row" spacing={3}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: alpha(feature.color, 0.12),
                          color: feature.color,
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon={feature.icon} width={32} height={32} />
                      </Box>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.grey[700],
                            lineHeight: 1.8,
                            fontWeight: 400,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Box sx={{ textAlign: 'left' }}>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.root}
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:chart-2-bold-duotone" />}
                  sx={{
                    backgroundColor: theme.palette.warning.main,
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: theme.customShadows.z8,
                    '&:hover': {
                      backgroundColor: theme.palette.warning.dark,
                      boxShadow: theme.customShadows.z16,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Buka Dashboard
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
