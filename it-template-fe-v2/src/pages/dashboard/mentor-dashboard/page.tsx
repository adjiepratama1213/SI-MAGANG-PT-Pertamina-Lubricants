import { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import {
  Container, Typography, Card, Box, Grid, Stack, Chip, Button, TextField, InputAdornment, LinearProgress, Avatar,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
import axiosInstance from 'src/utils/axios';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function MentorDashboardPage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { userSearchData } = useSearchUsers('');
  const [menteeSearch, setMenteeSearch] = useState('');
  const [presensiList, setPresensiList] = useState<any[]>([]);

  useEffect(() => {
    const fetchPresensi = async () => {
      try {
        const res = await axiosInstance.get('/presensi/mentor');
        if (res.data && Array.isArray(res.data)) {
          setPresensiList(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch mentor presensi', err);
      }
    };
    fetchPresensi();

    const interval = setInterval(fetchPresensi, 10000);
    const handleFocus = () => fetchPresensi();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const validPresensiList = useMemo(() => {
    return presensiList.filter((p: any) => {
      const d = new Date(p.tanggalInput).getDay();
      return d !== 0 && d !== 6;
    });
  }, [presensiList]);

  const totalHadir = useMemo(() =>
    validPresensiList.filter((p: any) => {
      const s = (p.presensiStatus || '').toLowerCase();
      return s.includes('hadir');
    }).length,
  [validPresensiList]);

  const totalIzinSakit = useMemo(() =>
    validPresensiList.filter((p: any) => {
      const s = (p.presensiStatus || '').toLowerCase();
      return s === 'izin' || s === 'sakit';
    }).length,
  [validPresensiList]);

  const totalAlpha = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return validPresensiList.filter((p: any) => {
      const s = (p.presensiStatus || '').toLowerCase();
      if (!s.includes('alpha') && !s.includes('alfa')) return false;
      const pDate = new Date(p.tanggalInput);
      const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
      if (pStr === todayStr && !p.masuk) return false;
      return true;
    }).length;
  }, [validPresensiList]);

  const totalPresensiRecorded = totalHadir + totalIzinSakit + totalAlpha;
  const hadirRate = totalPresensiRecorded > 0 ? Math.round((totalHadir / totalPresensiRecorded) * 100) : 0;

  const isAllZeroPresensi = totalHadir === 0 && totalIzinSakit === 0 && totalAlpha === 0;

  const presensiSeries = useMemo(() => {
    if (isAllZeroPresensi) return [1];
    return [totalHadir, totalIzinSakit, totalAlpha];
  }, [isAllZeroPresensi, totalHadir, totalIzinSakit, totalAlpha]);

  const presensiChartOptions = useChart({
    colors: isAllZeroPresensi ? ['#E2E8F0'] : ['#16A34A', '#F59E0B', '#EE2E24'],
    chart: { sparkline: { enabled: false } },
    labels: isAllZeroPresensi ? ['Belum Ada'] : ['Hadir', 'Izin / Sakit', 'Alpha'],
    stroke: { colors: [theme.palette.background.paper], width: 2 },
    legend: { show: false },
    tooltip: {
      enabled: !isAllZeroPresensi,
      fillSeriesColor: false,
      y: { formatter: (value: number) => `${value} Catatan` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '74%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              offsetY: -4,
              formatter: () => 'KEHADIRAN',
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 800,
              color: '#0F172A',
              offsetY: 4,
              formatter: () => (isAllZeroPresensi ? '0%' : `${hadirRate}%`),
            },
            total: {
              show: true,
              showAlways: true,
              label: 'KEHADIRAN',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              formatter: () => (isAllZeroPresensi ? '0%' : `${hadirRate}%`),
            },
          },
        },
      },
    },
  });

  const myInterns = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData.filter((u: any) =>
      u?.role === 'PESERTA' &&
      u?.internProfile?.mentor?.userId === user.id
    );
  }, [userSearchData, user]);

  const activeInterns = useMemo(() => myInterns.filter((u: any) => u.status === 'active'), [myInterns]);

  const countPKL = useMemo(() =>
    myInterns.filter((u: any) => (u.internProfile?.program || '').toLowerCase().includes('pkl')).length
    , [myInterns]);

  const countPTPL = useMemo(() =>
    myInterns.filter((u: any) => (u.internProfile?.program || '').toLowerCase().includes('ptpl')).length
    , [myInterns]);

  const countKemnaker = useMemo(() =>
    myInterns.filter((u: any) => (u.internProfile?.program || '').toLowerCase().includes('kemnaker')).length
    , [myInterns]);

  const filteredMentees = useMemo(() => {
    if (!menteeSearch.trim()) return myInterns;
    const q = menteeSearch.toLowerCase();
    return myInterns.filter((m: any) =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.internProfile?.internId || '').toLowerCase().includes(q) ||
      (m.internProfile?.university || '').toLowerCase().includes(q) ||
      (m.internProfile?.program || '').toLowerCase().includes(q)
    );
  }, [myInterns, menteeSearch]);

  const displayedMentees = useMemo(() => filteredMentees.slice(0, 4), [filteredMentees]);

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  // 3 Summary Cards (Card Menunggu Aktivasi telah dihapus sesuai permintaan)
  const summaryCards = [
    {
      title: 'TOTAL PESERTA BIMBINGAN',
      value: myInterns.length,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      suffix: 'Orang',
      caption: 'Peserta terdaftar',
    },
    {
      title: 'PESERTA AKTIF',
      value: activeInterns.length,
      icon: 'solar:check-circle-bold-duotone',
      color: '#16A34A',
      bg: '#DCFCE7',
      suffix: 'Orang',
      caption: 'Sedang aktif',
    },
    {
      title: 'PROGRAM TERDAFTAR',
      value: new Set(myInterns.map((u: any) => u.internProfile?.program).filter(Boolean)).size,
      icon: 'solar:shield-check-bold-duotone',
      color: '#EE2E24',
      bg: '#FEE2E2',
      suffix: 'Program',
      caption: 'Program aktif',
    },
  ];

  // Quick Action Shortcuts
  const quickActions = [
    {
      title: 'Data Bimbingan',
      description: 'Kelola data identitas & profil peserta',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      path: paths.dashboard.dataBimbingan,
    },
    {
      title: 'Presensi Peserta',
      description: 'Pantau check-in & izin/sakit harian',
      icon: 'solar:calendar-date-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      path: paths.dashboard.mentorPresensi,
    },
    {
      title: 'Evaluasi Laporan',
      description: 'Review laporan berkala & beri feedback',
      icon: 'solar:document-text-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      path: paths.dashboard.mentorLaporan,
    },
    {
      title: 'Penilaian Magang',
      description: 'Input penilaian 7 aspek kompetensi',
      icon: 'solar:diploma-verified-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      path: paths.dashboard.mentorPenilaian,
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Mentor | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Dashboard */}
        <DashboardBreadcrumbs current="Dashboard" />

        {/* HEADER BANNER */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 2.5,
            background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)',
            color: 'white',
            minHeight: { md: 104 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, letterSpacing: -0.2 }}>
              Selamat Datang, {user?.name || 'Mas kuncoro'}!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.82)', fontWeight: 400, maxWidth: 860, lineHeight: 1.5 }}>
              Dashboard Mentor — Kelola peserta bimbingan, pantau presensi harian, evaluasi capaian laporan, dan bimbing proses magang secara terpadu di PT Pertamina Lubricants.
            </Typography>
          </Box>
        </Box>

        {/* 3 TOP SUMMARY CARDS */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  borderBottom: `3.5px solid ${card.color}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8 }}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      bgcolor: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon={card.icon} width={22} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                    {card.suffix}
                  </Typography>
                </Box>

                <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, fontWeight: 500 }}>
                  {card.caption}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* PINTASAN AKSI CEPAT PEMBIMBING */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: '0.78rem' }}>
            Pintasan Menu Pembimbing
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  component={RouterLink}
                  href={action.path}
                  sx={{
                    p: 2.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    textDecoration: 'none',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 2,
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: action.color,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: action.bg,
                      color: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={action.icon} width={24} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {action.description}
                    </Typography>
                  </Box>
                  <Iconify icon="solar:arrow-right-linear" width={18} sx={{ color: '#94A3B8', flexShrink: 0 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* MAIN TWO-COLUMN SECTION */}
        <Grid container spacing={3}>
          {/* KOLOM KIRI (8 COLS): DAFTAR PESERTA & PANDUAN */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* CARD: DAFTAR PESERTA BIMBINGAN */}
              <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        Peserta Bimbingan Anda
                      </Typography>
                      <Chip label={`${myInterns.length} Peserta`} size="small" sx={{ bgcolor: '#EDF5FE', color: '#004F9F', fontWeight: 700, fontSize: '0.75rem' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.2 }}>
                      Daftar peserta yang ditugaskan di unit kerja Anda
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                    {myInterns.length > 0 && (
                      <TextField
                        size="small"
                        placeholder="Cari nama peserta..."
                        value={menteeSearch}
                        onChange={(e) => setMenteeSearch(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 18 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: { xs: '100%', sm: 190 } }}
                      />
                    )}
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.dataBimbingan}
                      size="small"
                      endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#004F9F',
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#EDF5FE' },
                      }}
                    >
                      Lihat Semua
                    </Button>
                  </Box>
                </Box>

                {myInterns.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        bgcolor: '#F1F5F9',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={32} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
                      Belum Ada Peserta Bimbingan
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
                      Peserta magang yang ditugaskan kepada Anda oleh admin akan otomatis tampil di sini.
                    </Typography>
                  </Box>
                ) : filteredMentees.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tidak ditemukan peserta dengan kata kunci &ldquo;{menteeSearch}&rdquo;
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      maxHeight: { xs: 520, md: 500 },
                      overflowY: 'auto',
                      pr: 0.5,
                      '&::-webkit-scrollbar': { width: 5 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 3 },
                    }}
                  >
                    <Grid container spacing={2}>
                      {displayedMentees.map((intern: any) => {
                        const profile = intern.internProfile || {};
                        const isPKL = profile.program?.toLowerCase().includes('pkl');
                        const isKemnaker = profile.program?.toLowerCase().includes('kemnaker');
                        const isInternActive = intern.status === 'active' || intern.status === 'ACTIVE';

                        return (
                          <Grid item xs={12} sm={6} key={intern.id}>
                            <Card
                              sx={{
                                p: 2.5,
                                borderRadius: 2,
                                border: '1px solid #E2E8F0',
                                bgcolor: '#FFFFFF',
                                boxShadow: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: 1,
                              }}
                            >
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: '#004F9F',
                                      color: '#FFFFFF',
                                      fontWeight: 700,
                                      fontSize: '0.85rem',
                                      width: 40,
                                      height: 40,
                                    }}
                                  >
                                    {getInitials(intern.name)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {intern.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                      ID: {profile.internId || intern.id?.substring(0, 8) || '-'}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={isInternActive ? 'Aktif' : 'Tidak Aktif'}
                                    size="small"
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: '0.72rem',
                                      height: 22,
                                      bgcolor: isInternActive ? '#DCFCE7' : '#FEE2E2',
                                      color: isInternActive ? '#16A34A' : '#DC2626',
                                    }}
                                  />
                                </Box>

                                <Stack spacing={0.8} sx={{ my: 1.5, bgcolor: '#F8FAFC', p: 1.5, borderRadius: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="solar:buildings-bold-duotone" width={16} sx={{ color: '#64748B', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {profile.university || '-'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="solar:notebook-bold-duotone" width={16} sx={{ color: '#64748B', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {profile.major || '-'}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="solar:calendar-date-bold-duotone" width={16} sx={{ color: '#64748B', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                      {formatDate(profile.startDate)} — {formatDate(profile.endDate)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px dashed #E2E8F0' }}>
                                <Chip
                                  label={profile.program || 'Internship PTPL'}
                                  size="small"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    height: 22,
                                    bgcolor: isPKL ? '#FEF3C7' : isKemnaker ? '#DCFCE7' : '#EDF5FE',
                                    color: isPKL ? '#D97706' : isKemnaker ? '#16A34A' : '#004F9F',
                                  }}
                                />
                                <Button
                                  component={RouterLink}
                                  href={paths.dashboard.dataBimbingan}
                                  size="small"
                                  endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#004F9F',
                                    p: 0,
                                    minWidth: 'auto',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                                  }}
                                >
                                  Detail
                                </Button>
                              </Box>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {filteredMentees.length > 4 && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 1.5,
                          borderTop: '1px solid #F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          Menampilkan 4 dari {filteredMentees.length} peserta bimbingan
                        </Typography>
                        <Button
                          component={RouterLink}
                          href={paths.dashboard.dataBimbingan}
                          size="small"
                          endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                          sx={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#004F9F',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#EDF5FE' },
                          }}
                        >
                          Lihat Semua Peserta ({filteredMentees.length})
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Card>

              {/* CARD: PANDUAN & ALUR PEMBIMBINGAN */}
              <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: '#EDF5FE', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Iconify icon="solar:checklist-minimalistic-bold-duotone" width={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Alur Rutinitas Pembimbing Magang
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Panduan monitoring harian dan evaluasi berkala peserta magang PTPL
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {[
                    {
                      step: '01',
                      title: 'Monitoring Presensi Harian',
                      desc: 'Tinjau kehadiran harian di menu Presensi dan verifikasi surat pengajuan izin/sakit peserta.',
                      color: '#004F9F',
                    },
                    {
                      step: '02',
                      title: 'Evaluasi Progres Laporan',
                      desc: 'Periksa laporan berkala mingguan/bulanan yang diunggah dan berikan catatan evaluasi jika diperlukan.',
                      color: '#004F9F',
                    },
                    {
                      step: '03',
                      title: 'Bimbingan & Mentoring Rutin',
                      desc: 'Berikan arahan teknis dan mentoring berkala terkait tugas dan proyek penugasan unit kerja.',
                      color: '#004F9F',
                    },
                    {
                      step: '04',
                      title: 'Penilaian Akhir Magang',
                      desc: 'Isi formulir penilaian 7 aspek kompetensi sebelum berakhirnya masa penugasan magang peserta.',
                      color: '#004F9F',
                    },
                  ].map((guide, gIdx) => (
                    <Grid item xs={12} sm={6} key={gIdx}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: guide.color }}>
                            {guide.step}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {guide.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.5, display: 'block' }}>
                          {guide.desc}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Stack>
          </Grid>

          {/* KOLOM KANAN (4 COLS): JAM KERJA, DISTRIBUSI PROGRAM, INFO HR */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* CARD: JAM OPERASIONAL & ATURAN KEHADIRAN */}
              <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                  Jam Operasional & Presensi
                </Typography>

                <Stack spacing={2.5}>
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Hari Kerja</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>Senin — Jumat</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Jam Masuk</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#004F9F' }}>07:00 — 08:00 WIB</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Jam Pulang</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>16:00 WIB</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Lokasi Penugasan</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>Kantor Pusat / Unit PTPL</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* CHART RINGKASAN PRESENSI */}
                  <Box sx={{ pt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                      Ringkasan Kehadiran Peserta
                    </Typography>

                    <Box sx={{ position: 'relative', my: 1 }}>
                      <Chart
                        dir="ltr"
                        type="donut"
                        series={presensiSeries}
                        options={presensiChartOptions}
                        width="100%"
                        height={200}
                      />
                    </Box>

                    {/* METRIC PILLS */}
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#DCFCE7', borderRadius: 1.5, border: '1px solid #BBF7D0' }}>
                          <Typography variant="caption" sx={{ display: 'block', color: '#16A34A', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {totalHadir}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600, fontSize: '0.68rem' }}>
                            Hadir
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#FEF3C7', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                          <Typography variant="caption" sx={{ display: 'block', color: '#D97706', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {totalIzinSakit}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600, fontSize: '0.68rem' }}>
                            Izin / Sakit
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#FEE2E2', borderRadius: 1.5, border: '1px solid #FECACA' }}>
                          <Typography variant="caption" sx={{ display: 'block', color: '#EE2E24', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>
                            {totalAlpha}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.68rem' }}>
                            Alpha
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    component={RouterLink}
                    href={paths.dashboard.mentorPresensi}
                    variant="outlined"
                    fullWidth
                    startIcon={<Iconify icon="solar:calendar-date-bold-duotone" />}
                    sx={{
                      borderRadius: 1.5,
                      borderColor: '#004F9F',
                      color: '#004F9F',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#EDF5FE', borderColor: '#004F9F' },
                    }}
                  >
                    Buka Presensi Peserta
                  </Button>
                </Stack>
              </Card>

              {/* CARD: DISTRIBUSI PROGRAM MAGANG */}
              <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                  Distribusi Program Magang
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>PKL (Praktik Kerja Lapangan)</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#D97706' }}>{countPKL} Peserta</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={myInterns.length > 0 ? (countPKL / myInterns.length) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' } }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Internship PTPL</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#004F9F' }}>{countPTPL} Peserta</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={myInterns.length > 0 ? (countPTPL / myInterns.length) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#004F9F' } }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>Internship Kemnaker</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>{countKemnaker} Peserta</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={myInterns.length > 0 ? (countKemnaker / myInterns.length) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#16A34A' } }}
                    />
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
