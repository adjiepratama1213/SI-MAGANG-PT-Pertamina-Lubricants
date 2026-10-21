import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useTheme, alpha } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';

// routes
import { paths } from 'src/pages/paths';
import { RouterLink } from 'src/components/router-link';
import { HEADER } from 'src/layouts/config-layout';

// components
import Iconify from 'src/components/iconify';
import { varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const HERO_SLIDES = [
  {
    src: '/assets/images/ptpl/hero-carousel/slide-1.jpg',
    title: 'Aktivitas Profesional & Fasilitas PT Pertamina Lubricants',
    subtitle: 'Membimbing generasi masa depan industri pelumas Indonesia',
  },
  {
    src: '/assets/images/ptpl/hero-carousel/slide-2.jpg',
    title: 'Standar Kualitas & Produksi Pelumas Berstandar Dunia',
    subtitle: 'Teknologi modern dan kepatuhan standar internasional',
  },
  {
    src: '/assets/images/ptpl/hero-carousel/slide-3.jpg',
    title: 'Pertamina Enduro VR46 Racing Team di Kancah Global',
    subtitle: 'Kemitraan bergengsi pada ajang kejuaraan dunia MotoGP',
  },
  {
    src: '/assets/images/ptpl/hero-carousel/slide-4.jpg',
    title: 'Inovasi Produk Pelumas Otomotif & Industri Terlengkap',
    subtitle: 'Fastron, Enduro, dan Meditran untuk ketahanan prima',
  },
];

const PORTAL_FEATURES = [
  {
    icon: 'solar:user-id-bold-duotone',
    title: 'Registrasi & Pengajuan Terpadu',
    description:
      'Calon peserta dapat melakukan registrasi akun, melengkapi profil biodata, memilih jalur pemagangan (PKL Mahasiswa atau Internship Fresh Graduate), serta mengunggah dokumen persyaratan resmi secara online.',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Validasi Berkas & Kepatuhan Durasi',
    description:
      'Sistem secara terprogram memvalidasi kelengkapan berkas serta memastikan kepatuhan batas durasi pelaksanaan magang maksimal 6 bulan (180 hari) sesuai regulasi resmi PT Pertamina Lubricants.',
  },
  {
    icon: 'solar:calendar-date-bold-duotone',
    title: 'Presensi Real-time & Logbook Digital',
    description:
      'Peserta aktif mencatatkan kehadiran harian secara real-time dan menyusun laporan aktivitas kerja (logbook) berkala yang terintegrasi dan dapat dipantau langsung oleh mentor.',
  },
  {
    icon: 'solar:chart-2-bold-duotone',
    title: 'Supervisi Mentor & Evaluasi Akhir',
    description:
      'Mentor industri dapat memantau penugasan proyek operasional dan korporat, memberikan penilaian capaian kinerja secara transparan, serta memfasilitasi penerbitan sertifikat magang resmi.',
  },
];

const TIMELINE_STEPS = [
  {
    step: 1,
    title: 'Launching Pendaftaran',
    titleColor: '#ED1C24',
    description:
      'Pembukaan pendaftaran resmi program magang (PKL & Internship Fresh Graduate) melalui portal online PT Pertamina Lubricants.',
    side: 'left' as const,
  },
  {
    step: 2,
    title: 'Pendaftaran Peserta & Unggah Berkas',
    titleColor: '#004F9F',
    description:
      'Calon peserta membuat akun di portal, melengkapi biodata diri dan pendidikan, memilih jalur magang, serta mengunggah seluruh berkas persyaratan resmi.',
    side: 'right' as const,
  },
  {
    step: 3,
    title: 'Screening & Validasi Berkas',
    titleColor: '#ED1C24',
    description:
      'Tim Human Capital memverifikasi keabsahan dokumen persyaratan, kualifikasi latar belakang akademik, serta kelengkapan administrasi peserta.',
    side: 'left' as const,
  },
  {
    step: 4,
    title: 'Tes & Wawancara Unit Kerja',
    titleColor: '#004F9F',
    description:
      'Pelaksanaan konfirmasi kompetensi serta sesi wawancara mendalam bersama user atau calon mentor dari unit kerja penempatan terkait.',
    side: 'right' as const,
  },
  {
    step: 5,
    title: 'Hasil Seleksi & Onboarding',
    titleColor: '#ED1C24',
    description:
      'Pengumuman hasil akhir penerimaan, penerbitan surat konfirmasi resmi, pengenalan lingkungan kerja (safety induction), dan penempatan unit kerja.',
    side: 'left' as const,
  },
  {
    step: 6,
    title: 'Pelaksanaan Magang & Evaluasi',
    titleColor: '#004F9F',
    description:
      'Peserta aktif melaksanakan penugasan proyek riil, pencatatan absensi & logbook harian, evaluasi capaian kinerja, serta penerbitan sertifikat industri resmi PTPL.',
    side: 'right' as const,
  },
];

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Siapa saja yang dapat mendaftar program magang di PT Pertamina Lubricants?',
    answer:
      'Program terbuka untuk mahasiswa aktif jenjang Diploma Tiga (D3), Diploma Empat (D4), dan Strata Satu (S1) dari perguruan tinggi terakreditasi untuk jalur Praktik Kerja Lapangan (PKL), serta lulusan baru (Fresh Graduate) maksimal 1–2 tahun setelah kelulusan untuk jalur Internship PTPL. Terbuka bagi berbagai jurusan seperti Teknik Kimia, Teknik Mesin, Teknik Industri, Teknik Informatika/Sistem Informasi, Manajemen, Bisnis, Akuntansi, Komunikasi, dan jurusan relevan lainnya.',
  },
  {
    id: 'faq-2',
    question: 'Berapa batas durasi pelaksanaan magang yang diizinkan?',
    answer:
      'Sesuai ketentuan tata kelola pemagangan di PT Pertamina Lubricants, batas durasi pelaksanaan magang adalah maksimal 6 bulan (180 hari) terhitung sejak tanggal mulai magang. Sistem pendaftaran kami secara otomatis memvalidasi durasi yang diajukan oleh calon peserta agar tidak melebihi batas 6 bulan tersebut demi kepatuhan regulasi.',
  },
  {
    id: 'faq-3',
    question: 'Dokumen apa saja yang wajib disiapkan saat proses pendaftaran?',
    answer:
      'Calon peserta wajib menyiapkan dokumen digital dalam format PDF atau gambar yang jelas: (1) Curriculum Vitae (CV) terbaru, (2) Kartu Tanda Mahasiswa (KTM) atau KTP, (3) Transkrip Nilai semester terakhir, dan (4) Surat Pengantar atau Rekomendasi resmi dari universitas/fakultas yang menyatakan izin pelaksanaan magang kurikuler.',
  },
  {
    id: 'faq-4',
    question: 'Apakah peserta magang mendapatkan uang saku (allowance) dan sertifikat resmi?',
    answer:
      'Untuk peserta jalur Internship PTPL (Fresh Graduate), perusahaan memberikan uang saku bulanan terstruktur serta perlindungan sesuai ketentuan internal yang berlaku. Selain itu, seluruh peserta (baik PKL maupun Internship) yang telah menyelesaikan masa magang dan evaluasi capaian kerja dengan predikat baik akan menerima Sertifikat Resmi kelulusan magang yang diterbitkan oleh PT Pertamina Lubricants.',
  },
  {
    id: 'faq-5',
    question: 'Di mana lokasi pelaksanaan kegiatan magang akan ditempatkan?',
    answer:
      'Seluruh kegiatan pelaksanaan program magang (PKL & Internship) dipusatkan dan dilaksanakan di Kantor Pusat PT Pertamina Lubricants, bertempat di Grha Pertamina (Pertamax Tower Lantai 15–17, Jl. Medan Merdeka Timur No. 10, Gambir, Jakarta Pusat). Penempatan unit kerja disesuaikan dengan fungsi penugasan yang dituju saat seleksi.',
  },
  {
    id: 'faq-6',
    question: 'Bagaimana cara mengetahui status penerimaan atau kelulusan seleksi berkas saya?',
    answer:
      'Peserta dapat memantau perkembangan status seleksi secara real-time melalui dashboard akun di portal ini. Selain itu, calon peserta yang dinyatakan lolos tahap verifikasi berkas dan wawancara akan menerima email pemberitahuan resmi serta kelengkapan administrasi dari tim recruitment PT Pertamina Lubricants.',
  },
  {
    id: 'faq-7',
    question: 'Apa yang harus dilakukan jika lupa kata sandi atau mengalami kendala pendaftaran?',
    answer:
      'Anda dapat memanfaatkan fitur "Lupa Kata Sandi" yang ada pada halaman Masuk dengan memasukkan email terdaftar untuk menerima tautan pembaruan kata sandi. Apabila kendala teknis berlanjut, Anda dapat menghubungi tim support recruitment kami melalui kontak bantuan resmi di portal ini.',
  },
];

// ----------------------------------------------------------------------

export default function WelcomePage() {
  const theme = useTheme();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | false>('faq-1');

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          if (hash === 'beranda') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 150);
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ width: 1, overflow: 'hidden', position: 'relative' }}>
      {/* ===================== HERO SECTION ===================== */}
      <Box
        id="beranda"
        sx={{
          scrollMarginTop: { xs: '64px', md: '80px' },
          position: 'relative',
          bgcolor: '#04162e',
          color: '#ffffff',
          minHeight: {
            xs: 'auto',
            md: `calc(100vh - ${HEADER.H_DESKTOP}px)`,
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pt: { xs: 8, md: 6 },
          pb: { xs: 8, md: 6 },
          overflow: 'hidden',
          background: `
            radial-gradient(circle at 75% 40%, rgba(14, 116, 222, 0.28) 0%, transparent 60%),
            radial-gradient(circle at 15% 75%, rgba(0, 45, 98, 0.45) 0%, transparent 50%),
            linear-gradient(145deg, #031226 0%, #061e3e 50%, #092c5a 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2.5, md: 4, lg: 5 }, position: 'relative', zIndex: 1, width: 1 }}>
          <Grid container spacing={{ xs: 6, md: 6 }} alignItems="center">
            {/* HERO LEFT COLUMN */}
            <Grid xs={12} md={6} lg={6.2}>
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Big Title */}
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.8rem', md: '3.6rem', lg: '4.2rem' },
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    mb: 2.5,
                    wordBreak: 'break-word',
                  }}
                >
                  Portal <br />
                  <Box component="span" sx={{ color: '#38bdf8' }}>
                    Magang
                  </Box>{' '}
                  <br />
                  Pertamina Lubricants
                </Typography>

                {/* Subtitle / Description */}
                <Typography
                  sx={{
                    fontSize: { xs: '0.98rem', md: '1.1rem' },
                    color: '#cbd5e1',
                    lineHeight: 1.75,
                    maxWidth: 540,
                    mb: { xs: 4, md: 4.5 },
                  }}
                >
                  Portal resmi pendaftaran dan manajemen program magang PT Pertamina Lubricants. Daftarkan diri Anda sekarang dan raih pengalaman berharga bersama praktisi industri pelumas kelas dunia.
                </Typography>

                {/* CTA Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: 1 }}>
                  <Button
                    component={RouterLink}
                    href={paths.auth.register}
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: 50,
                      bgcolor: '#ffffff',
                      color: '#002D62',
                      fontWeight: 800,
                      fontSize: { xs: '0.96rem', sm: '1rem' },
                      px: { xs: 3.5, md: 4.2 },
                      py: { xs: 1.5, sm: 1.6 },
                      width: { xs: '100%', sm: 'auto' },
                      textTransform: 'none',
                      boxShadow: '0 8px 24px rgba(255, 255, 255, 0.16)',
                      '&:hover': {
                        bgcolor: '#f1f5f9',
                        boxShadow: '0 12px 32px rgba(255, 255, 255, 0.26)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Daftar Magang Sekarang
                  </Button>

                  <Button
                    component={RouterLink}
                    href={paths.auth.login}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderRadius: 50,
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.26)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: { xs: '0.92rem', sm: '0.98rem' },
                      px: { xs: 3, md: 3.8 },
                      py: { xs: 1.5, sm: 1.6 },
                      width: { xs: '100%', sm: 'auto' },
                      textTransform: 'none',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.14)',
                        borderColor: 'rgba(255, 255, 255, 0.45)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.25s ease',
                    }}
                  >
                    Masuk ke Akun
                  </Button>
                </Stack>
              </m.div>
            </Grid>

            {/* HERO RIGHT COLUMN (Interactive Photo Carousel) */}
            <Grid xs={12} md={6} lg={5.8}>
              <m.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: { xs: 3, md: 4 },
                    overflow: 'hidden',
                    bgcolor: '#031226',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
                    height: { xs: 260, sm: 340, md: 440, lg: 480 },
                  }}
                >
                  {/* Images Layer with Solid Background & Smooth Crossfade */}
                  {HERO_SLIDES.map((slide, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <Box
                        key={slide.src}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: '#031226',
                          opacity: isActive ? 1 : 0,
                          zIndex: isActive ? 1 : 0,
                          transform: isActive ? 'scale(1)' : 'scale(1.04)',
                          transition: 'opacity 0.8s ease-in-out, transform 4s ease-out',
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                      >
                        <Box
                          component="img"
                          src={slide.src}
                          alt={slide.title}
                          sx={{
                            width: 1,
                            height: 1,
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      </Box>
                    );
                  })}

                  {/* Dark Gradient Overlay for Caption readability */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `
                        linear-gradient(to top, rgba(3, 18, 38, 0.92) 0%, rgba(3, 18, 38, 0.4) 40%, transparent 75%)
                      `,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Caption & Controls Area at the bottom */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      p: { xs: 2.5, sm: 3.5 },
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    {/* Current Slide Info */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: { xs: '0.92rem', sm: '1.05rem' },
                          lineHeight: 1.35,
                          textShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                          mb: 0.3,
                        }}
                      >
                        {HERO_SLIDES[currentSlide].title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#93c5fd',
                          fontSize: { xs: '0.78rem', sm: '0.84rem' },
                          display: 'block',
                          textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                        }}
                      >
                        {HERO_SLIDES[currentSlide].subtitle}
                      </Typography>
                    </Box>

                    {/* Navigation Arrows & Indicator Dots */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 0.5,
                      }}
                    >
                      {/* Dots Indicator */}
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        {HERO_SLIDES.map((_, dotIndex) => {
                          const isDotActive = dotIndex === currentSlide;
                          return (
                            <Box
                              key={dotIndex}
                              onClick={() => setCurrentSlide(dotIndex)}
                              sx={{
                                height: 6,
                                width: isDotActive ? 26 : 8,
                                borderRadius: 4,
                                bgcolor: isDotActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.35)',
                                cursor: 'pointer',
                                transition: 'all 0.35s ease',
                                '&:hover': {
                                  bgcolor: isDotActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)',
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>

                      {/* Arrow Navigation Buttons */}
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={prevSlide}
                          sx={{
                            color: '#ffffff',
                            bgcolor: 'rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.25)',
                            },
                          }}
                        >
                          <Iconify icon="solar:alt-arrow-left-linear" width={16} />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={nextSlide}
                          sx={{
                            color: '#ffffff',
                            bgcolor: 'rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.25)',
                            },
                          }}
                        >
                          <Iconify icon="solar:alt-arrow-right-linear" width={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </m.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== TENTANG SISTEM MAGANG SECTION ===================== */}
      <Box
        id="tentang"
        sx={{
          scrollMarginTop: { xs: '64px', md: '80px' },
          bgcolor: '#ffffff',
          py: { xs: 8, md: 11 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
          {/* Section Heading */}
          <m.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.65rem' },
                  fontWeight: 800,
                  color: '#004F9F',
                  display: 'inline-block',
                  position: 'relative',
                  letterSpacing: '-0.02em',
                  pb: 1.6,
                }}
              >
                Tentang Program Magang
                {/* Accent red underline bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#ED1C24',
                  }}
                />
              </Typography>

              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: { xs: '0.92rem', md: '1rem' },
                  maxWidth: 720,
                  mx: 'auto',
                  mt: 2,
                  lineHeight: 1.65,
                }}
              >
                Portal Sistem Informasi Manajemen Magang (SI-Magang) PT Pertamina Lubricants dirancang khusus untuk memfasilitasi seluruh tahapan pemagangan secara digital, tertib, dan transparan — mulai dari registrasi online, validasi berkas dan kepatuhan durasi, presensi dan logbook harian, hingga penilaian akhir bersama mentor industri.
              </Typography>
            </Box>
          </m.div>

          {/* Fitur & Layanan Permagangan yang Dibuat (Simple, Clean, Corporate) */}
          <Grid container spacing={3}>
            {PORTAL_FEATURES.map((item, idx) => (
              <Grid xs={12} sm={6} key={item.title}>
                <m.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%' }}
                >
                  <Card
                    sx={{
                      p: { xs: 3, sm: 3.5 },
                      height: 1,
                      borderRadius: 2.5,
                      bgcolor: '#ffffff',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px rgba(0, 56, 130, 0.08)',
                        borderColor: '#004F9F',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 79, 159, 0.08)',
                        color: '#004F9F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Iconify icon={item.icon} width={24} />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#0F172A',
                        fontSize: { xs: '1.05rem', sm: '1.12rem' },
                        lineHeight: 1.35,
                        mb: 1.2,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        fontSize: '0.88rem',
                        lineHeight: 1.65,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== TIMELINE PROGRAM (TAHAPAN MAGANG) SECTION ===================== */}
      <Box
        id="tahapan"
        sx={{
          scrollMarginTop: { xs: '64px', md: '80px' },
          bgcolor: '#F8FAFC',
          py: { xs: 8, md: 10 },
          borderTop: '1px solid #EEF2F6',
          borderBottom: '1px solid #EEF2F6',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
          {/* Section Heading - Sesuai gambar referensi: Title dengan accent underline bar */}
          <m.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.65rem' },
                  fontWeight: 800,
                  color: '#004F9F',
                  display: 'inline-block',
                  position: 'relative',
                  letterSpacing: '-0.02em',
                  pb: 1.6,
                }}
              >
                Tahapan Program
                {/* Accent red underline bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#ED1C24',
                  }}
                />
              </Typography>

              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: { xs: '0.92rem', md: '1rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  mt: 2,
                  lineHeight: 1.6,
                }}
              >
                Alur dan tahapan pelaksanaan program magang resmi di PT Pertamina Lubricants.
              </Typography>
            </Box>
          </m.div>

          {/* Timeline Container matching user image layout */}
          <Box sx={{ position: 'relative', maxWidth: 1040, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            {/* Center Vertical Line (Desktop md+) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 24,
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 4,
                bgcolor: '#94A3B8',
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            {/* Left Vertical Line (Mobile xs to sm) */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                position: 'absolute',
                top: 20,
                bottom: 20,
                left: { xs: 16, sm: 18 },
                width: 3.5,
                bgcolor: '#94A3B8',
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            <Stack spacing={{ xs: 3.5, md: 4 }}>
              {TIMELINE_STEPS.map((item, index) => {
                const isLeft = item.side === 'left';

                return (
                  <Box
                    key={item.title}
                    component={m.div}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    sx={{
                      position: 'relative',
                      width: 1,
                      zIndex: 1,
                    }}
                  >
                    {/* Desktop Alternating Row (md+) */}
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        width: 1,
                      }}
                    >
                      {/* Left Column */}
                      <Box
                        sx={{
                          width: 'calc(50% - 24px)',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        {isLeft && (
                          <Card
                            sx={{
                              p: 3,
                              borderRadius: 2.5,
                              bgcolor: '#ffffff',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                              width: 1,
                              maxWidth: 460,
                              position: 'relative',
                              transition: 'all 0.25s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                                borderColor: '#CBD5E1',
                              },
                              // Triangular arrow pointer pointing right towards center node
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                right: -8,
                                transform: 'translateY(-50%)',
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderLeft: '8px solid #ffffff',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                right: -10,
                                transform: 'translateY(-50%)',
                                borderTop: '9px solid transparent',
                                borderBottom: '9px solid transparent',
                                borderLeft: '9px solid #CBD5E1',
                                zIndex: -1,
                              },
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                fontSize: '1.08rem',
                                color: item.titleColor,
                                mb: 0.8,
                                lineHeight: 1.35,
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#475569',
                                fontSize: '0.88rem',
                                lineHeight: 1.65,
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Card>
                        )}
                      </Box>

                      {/* Center Node Container */}
                      <Box
                        sx={{
                          width: 48,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {/* Node Circle matching image: slate grey border, Pertamina blue center */}
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: '#004F9F',
                            border: '4px solid #94A3B8',
                            boxShadow: '0 0 0 2px #ffffff',
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      {/* Right Column */}
                      <Box
                        sx={{
                          width: 'calc(50% - 24px)',
                          display: 'flex',
                          justifyContent: 'flex-start',
                        }}
                      >
                        {!isLeft && (
                          <Card
                            sx={{
                              p: 3,
                              borderRadius: 2.5,
                              bgcolor: '#ffffff',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                              width: 1,
                              maxWidth: 460,
                              position: 'relative',
                              transition: 'all 0.25s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                                borderColor: '#CBD5E1',
                              },
                              // Triangular arrow pointer pointing left towards center node
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: -8,
                                transform: 'translateY(-50%)',
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderRight: '8px solid #ffffff',
                              },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: -10,
                                transform: 'translateY(-50%)',
                                borderTop: '9px solid transparent',
                                borderBottom: '9px solid transparent',
                                borderRight: '9px solid #CBD5E1',
                                zIndex: -1,
                              },
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                fontSize: '1.08rem',
                                color: item.titleColor,
                                mb: 0.8,
                                lineHeight: 1.35,
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#475569',
                                fontSize: '0.88rem',
                                lineHeight: 1.65,
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Card>
                        )}
                      </Box>
                    </Box>

                    {/* Mobile Layout (xs to sm) */}
                    <Box
                      sx={{
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center',
                        position: 'relative',
                        pl: { xs: 5, sm: 5.5 },
                      }}
                    >
                      {/* Mobile Node Circle on the left line */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: { xs: 5, sm: 7 },
                          top: 24,
                          transform: 'translateY(-50%)',
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: '#004F9F',
                          border: '3.5px solid #94A3B8',
                          boxShadow: '0 0 0 2px #ffffff',
                          zIndex: 2,
                        }}
                      />

                      <Card
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          bgcolor: '#ffffff',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                          width: 1,
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 24,
                            left: -7,
                            transform: 'translateY(-50%)',
                            borderTop: '7px solid transparent',
                            borderBottom: '7px solid transparent',
                            borderRight: '7px solid #ffffff',
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: item.titleColor,
                            mb: 0.5,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#475569',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Card>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ===================== PENDAFTARAN PROGRAM MAGANG (PENDAFTARAN TERBUKA) SECTION ===================== */}
      <Box
        id="program"
        sx={{
          scrollMarginTop: { xs: '64px', md: '80px' },
          bgcolor: '#ffffff',
          py: { xs: 8, md: 10 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
          {/* Section Heading */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.65rem' },
                  fontWeight: 800,
                  color: '#004F9F',
                  display: 'inline-block',
                  position: 'relative',
                  letterSpacing: '-0.02em',
                  pb: 1.6,
                }}
              >
                Program Magang Terbuka
                {/* Accent red underline bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#ED1C24',
                  }}
                />
              </Typography>

              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: { xs: '0.92rem', md: '1rem' },
                  maxWidth: 640,
                  mx: 'auto',
                  mt: 2,
                  lineHeight: 1.6,
                }}
              >
                PT Pertamina Lubricants membuka kesempatan magang bagi mahasiswa dan lulusan baru melalui program pemagangan yang disesuaikan dengan jenjang dan minat Anda.
              </Typography>
            </Box>
          </m.div>

          {/* 2 Program Cards - PKL & Internship PTPL */}
          <Grid container spacing={3.5}>
            {/* Card 1: PKL */}
            <Grid xs={12} md={6}>
              <Card
                sx={{
                  p: { xs: 3.5, md: 4.5 },
                  height: 1,
                  borderRadius: 3,
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 36px rgba(0, 79, 159, 0.12)',
                    borderColor: '#004F9F',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#004F9F',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:diploma-bold-duotone" width={28} />
                  </Box>
                  <Box
                    sx={{
                      px: 1.8,
                      py: 0.5,
                      borderRadius: 1.2,
                      bgcolor: '#EFF6FF',
                      color: '#004F9F',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    D3 / D4 / S1
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 800, mb: 1.5 }}>
                  Praktik Kerja Lapangan (PKL)
                </Typography>

                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.92rem', mb: 3.5, flexGrow: 1 }}>
                  Program pemagangan kurikuler untuk mahasiswa aktif (D3, D4, dan S1) guna memenuhi persyaratan akademis dengan pengalaman praktis langsung di unit kerja operasional maupun administrasi.
                </Typography>

                <Stack spacing={1.6} sx={{ pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Penempatan di unit kerja operasional & kantor
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Bimbingan mentor industri berpengalaman
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Sertifikat resmi selesai magang
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>

            {/* Card 2: Internship PTPL */}
            <Grid xs={12} md={6}>
              <Card
                sx={{
                  p: { xs: 3.5, md: 4.5 },
                  height: 1,
                  borderRadius: 3,
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 36px rgba(0, 79, 159, 0.12)',
                    borderColor: '#004F9F',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#004F9F',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon="solar:buildings-3-bold-duotone" width={28} />
                  </Box>
                  <Box
                    sx={{
                      px: 1.8,
                      py: 0.5,
                      borderRadius: 1.2,
                      bgcolor: '#EFF6FF',
                      color: '#004F9F',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    Fresh Graduate
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ color: '#002D62', fontWeight: 800, mb: 1.5 }}>
                  Internship PTPL
                </Typography>

                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.92rem', mb: 3.5, flexGrow: 1 }}>
                  Program magang intensif internal PT Pertamina Lubricants bagi lulusan baru (Fresh Graduate) dengan penugasan proyek riil, evaluasi berkala oleh mentor industri, serta benefit sesuai ketentuan perusahaan.
                </Typography>

                <Stack spacing={1.6} sx={{ pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Keterlibatan langsung dalam proyek korporat
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Pemberian uang saku bulanan terstruktur
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#004F9F', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                      Sertifikat berpredikat resmi PTPL
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>


        </Container>
      </Box>


      {/* ===================== FAQ SECTION (PALING BAWAH) ===================== */}
      <Box
        id="faq"
        sx={{
          scrollMarginTop: { xs: '64px', md: '80px' },
          bgcolor: '#F8FAFC',
          py: { xs: 8, md: 10 },
          borderTop: '1px solid #EEF2F6',
          borderBottom: '1px solid #EEF2F6',
          position: 'relative',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
          {/* Section Heading */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.65rem' },
                  fontWeight: 800,
                  color: '#004F9F',
                  display: 'inline-block',
                  position: 'relative',
                  letterSpacing: '-0.02em',
                  pb: 1.6,
                }}
              >
                FAQ
                {/* Accent red underline bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#ED1C24',
                  }}
                />
              </Typography>

              <Typography
                sx={{
                  color: '#64748B',
                  fontSize: { xs: '0.92rem', md: '1rem' },
                  maxWidth: 680,
                  mx: 'auto',
                  mt: 2,
                  lineHeight: 1.6,
                }}
              >
                Temukan jawaban lengkap seputar kriteria pendaftaran, berkas seleksi, fasilitas, serta mekanisme evaluasi magang di PT Pertamina Lubricants.
              </Typography>
            </Box>
          </m.div>

          {/* Accordion FAQ List */}
          <Stack spacing={2} sx={{ maxWidth: 880, mx: 'auto', mb: { xs: 5, md: 6 } }}>
            {FAQ_ITEMS.map((faq, index) => {
              const isExpanded = expandedFaq === faq.id;
              const itemNumber = (index + 1).toString().padStart(2, '0');

              return (
                <m.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Accordion
                    expanded={isExpanded}
                    onChange={handleFaqChange(faq.id)}
                    disableGutters
                    elevation={0}
                    sx={{
                      borderRadius: '16px !important',
                      border: '1.5px solid',
                      borderColor: isExpanded ? '#003882' : '#E2E8F0',
                      bgcolor: '#ffffff',
                      boxShadow: isExpanded ? '0 8px 24px rgba(0, 56, 130, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.25s ease',
                      overflow: 'hidden',
                      '&::before': {
                        display: 'none',
                      },
                      '&:hover': {
                        borderColor: isExpanded ? '#003882' : '#CBD5E1',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: isExpanded ? 'rgba(0, 56, 130, 0.1)' : '#F1F5F9',
                            color: isExpanded ? '#003882' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Iconify
                            icon="solar:alt-arrow-down-linear"
                            width={18}
                            sx={{
                              transform: isExpanded ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.25s ease',
                            }}
                          />
                        </Box>
                      }
                      sx={{
                        px: { xs: 2.5, md: 3.5 },
                        py: { xs: 1.5, md: 2 },
                        minHeight: { xs: 68, md: 74 },
                        '& .MuiAccordionSummary-content': {
                          my: 1,
                          alignItems: 'center',
                          gap: { xs: 1.5, md: 2 },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          bgcolor: isExpanded ? '#003882' : '#F1F5F9',
                          color: isExpanded ? '#ffffff' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {itemNumber}
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: isExpanded ? '#002D62' : '#0F172A',
                          fontSize: { xs: '0.94rem', md: '1.02rem' },
                          lineHeight: 1.45,
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        px: { xs: 2.5, md: 3.5 },
                        pb: 3,
                        pt: 0,
                        pl: { xs: 2.5, md: '78px' },
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#475569',
                          fontSize: { xs: '0.88rem', md: '0.94rem' },
                          lineHeight: 1.8,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </m.div>
              );
            })}
          </Stack>

          {/* Registration CTA Card - Ditaruh di paling bawah bersamaan dengan FAQ */}
          <m.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box
              sx={{
                maxWidth: 960,
                mx: 'auto',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)',
                p: { xs: 2.8, sm: 3.5, md: 4 },
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0, 45, 98, 0.18)',
              }}
            >
              {/* Radial glow background accents */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 79, 159, 0.3) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <Grid container spacing={{ xs: 2.5, md: 3.5 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid xs={12} md={7.5} lg={8}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: '#38BDF8',
                      fontWeight: 800,
                      letterSpacing: 1.2,
                      fontSize: { xs: '0.72rem', md: '0.78rem' },
                      display: 'block',
                      mb: 0.8,
                    }}
                  >
                    PENDAFTARAN DIBUKA SEPANJANG TAHUN
                  </Typography>

                  <Typography
                    component="h3"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.65rem' },
                      fontWeight: 800,
                      lineHeight: 1.3,
                      mb: 1,
                      color: '#ffffff',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Siap Memulai Langkah Karir Profesional Anda?
                  </Typography>

                  <Typography
                    sx={{
                      color: '#E2E8F0',
                      fontSize: { xs: '0.84rem', md: '0.88rem' },
                      lineHeight: 1.6,
                      maxWidth: 600,
                    }}
                  >
                    Daftarkan diri Anda sekarang melalui portal resmi magang PT Pertamina Lubricants. Lengkapi biodata serta dokumen pendukung dan raih kesempatan belajar langsung dari ahli industri pelumas terdepan.
                  </Typography>
                </Grid>

                <Grid xs={12} md={4.5} lg={4}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row', md: 'column' }}
                    spacing={1.4}
                    sx={{
                      alignItems: { xs: 'stretch', md: 'flex-end' },
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      component={RouterLink}
                      href={paths.auth.register}
                      variant="contained"
                      size="medium"
                      sx={{
                        bgcolor: '#ffffff',
                        color: '#002D62',
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        px: 3,
                        py: 1.1,
                        borderRadius: 50,
                        width: { xs: '100%', sm: 'auto', md: '230px' },
                        boxShadow: '0 6px 18px rgba(255, 255, 255, 0.2)',
                        textTransform: 'none',
                        textAlign: 'center',
                        '&:hover': {
                          bgcolor: '#F8FAFC',
                          boxShadow: '0 10px 24px rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Daftar Magang Sekarang
                    </Button>

                    <Button
                      component={RouterLink}
                      href={paths.auth.login}
                      variant="outlined"
                      size="medium"
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        borderWidth: 1.5,
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        px: 3,
                        py: 1.05,
                        borderRadius: 50,
                        width: { xs: '100%', sm: 'auto', md: '230px' },
                        textTransform: 'none',
                        textAlign: 'center',
                        '&:hover': {
                          borderColor: '#ffffff',
                          borderWidth: 1.5,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Sudah Punya Akun? Masuk
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </m.div>
        </Container>
      </Box>

      {/* ===================== FLOATING SCROLL TO TOP BUTTON ===================== */}
      <AnimatePresence>
        {showScrollTop && (
          <Box
            component={m.div}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ duration: 0.25 }}
            sx={{
              position: 'fixed',
              bottom: { xs: 24, md: 36 },
              right: { xs: 24, md: 36 },
              zIndex: 99,
            }}
          >
            <IconButton
              onClick={scrollToTop}
              title="Kembali ke atas"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#003882',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(0, 56, 130, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: '#002860',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(0, 56, 130, 0.55)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Iconify icon="solar:alt-arrow-up-linear" width={22} />
            </IconButton>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
