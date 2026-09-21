import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import {
  Container, Typography, Card, Box, Grid, Stack, Chip, CardHeader,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import { useAuthContext } from 'src/auth/hooks';
import { useGetUserDetail } from 'src/pages/user-mgmt/query';

// ----------------------------------------------------------------------

export default function PesertaDashboardPage() {
  const { user: authUser } = useAuthContext();
  const { user } = useGetUserDetail({ id: authUser?.id || '' });
  const theme = useTheme();

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const summaryCards = [
    {
      title: 'Total Kehadiran',
      value: 0,
      icon: 'solar:calendar-date-bold-duotone',
      color: '#004F9F',
      bg: 'rgba(0, 79, 159, 0.1)',
    },
    {
      title: 'Nilai Akhir',
      value: user?.internProfile?.evaluation?.nilaiRataRata ? user.internProfile.evaluation.nilaiRataRata.toFixed(1) : '-',
      icon: 'solar:star-bold-duotone',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)',
    },
    {
      title: 'Program Magang',
      value: user?.internProfile?.program || '-',
      icon: 'solar:shield-check-bold-duotone',
      color: '#004F9F',
      bg: 'rgba(0, 79, 159, 0.1)',
    }
  ];

  // --- Chart 1: Rekap Kehadiran Bulan Ini ---
  const kehadiranSeries = [0, 0, 0];
  const kehadiranOptions = useChart({
    colors: ['#22c55e', '#FFAB00', '#ef4444'],
    labels: ['Hadir', 'Izin', 'Alfa'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: false, horizontalAlign: 'center', position: 'bottom' },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (value: number) => `${value} Hari` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            value: { formatter: (val) => `${val}` },
            total: {
              show: true,
              showAlways: true,
              label: 'HADIR',
              fontSize: '12px',
              color: theme.palette.text.secondary,
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                if (total === 0) return '0%';
                return `${Math.round((w.globals.seriesTotals[0] / total) * 100)}%`;
              }
            }
          }
        }
      }
    },
  });

  // --- Chart 2: Nilai per Aspek ---
  const nilaiSeries = [{ name: 'Nilai', data: [0, 0, 0, 0, 0, 0, 0] }];
  const nilaiOptions = useChart({
    colors: ['#004F9F'],
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
    xaxis: { categories: ['Integritas', 'Waktu', 'Keahlian', 'Kerjasama', 'Komunikasi', 'Teknologi', 'Diri'] },
    yaxis: { min: 0, max: 100 },
    tooltip: { y: { formatter: (value: number) => `${value} Poin` } },
  });

  return (
    <>
      <Helmet>
        <title>Dashboard Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:home-2-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Selamat Datang, {user?.name || 'Peserta'}!</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Dashboard Peserta — Pantau progres magang Anda
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: `4px solid ${card.color}`, '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                    <Iconify icon={card.icon} width={24} />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>{card.title}</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: card.color, fontWeight: 'bold', fontSize: '4rem' }}>{card.value}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* INFORMASI MAGANG */}
        <Card sx={{ p: 3, mb: 4, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6">Informasi Magang Anda</Typography>
              <Typography variant="body2" color="text.secondary">Detail program magang yang sedang Anda jalani</Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Fungsi</Typography>
                  <Typography variant="body1" fontWeight="bold">{user?.internProfile?.mentor?.user?.employeeProfile?.fungsi || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Sub Fungsi</Typography>
                  <Typography variant="body1" fontWeight="bold">{user?.internProfile?.mentor?.user?.employeeProfile?.subFungsi || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Mentor Pembimbing</Typography>
                  <Typography variant="body1" fontWeight="bold">{user?.internProfile?.mentor?.user?.name || user?.internProfile?.mentor?.name || '-'}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Periode Magang</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(user?.internProfile?.startDate)} — {formatDate(user?.internProfile?.endDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Program Magang</Typography>
                  <Typography variant="body1" fontWeight="bold">{user?.internProfile?.program || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status Keaktifan</Typography>
                  <Chip 
                    label={user?.status === 'active' ? 'Aktif' : 'Pending'} 
                    color={user?.status === 'active' ? 'success' : 'warning'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* CHARTS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 420, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="solar:pie-chart-2-bold-duotone" width={24} sx={{ color: '#4F46E5', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Rekap Kehadiran Bulan Ini</Typography>
                  </Box>
                }
              />
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }} dir="ltr">
                <Chart type="donut" series={kehadiranSeries} options={kehadiranOptions} height={280} />
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: 420, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="solar:chart-square-bold-duotone" width={24} sx={{ color: '#22c55e', mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Nilai per Aspek</Typography>
                  </Box>
                }
              />
              <Box sx={{ p: 3, height: 320 }} dir="ltr">
                <Chart type="bar" series={nilaiSeries} options={nilaiOptions} height={280} />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* AKTIVITAS TERAKHIR */}
        <Card sx={{ p: 0, mb: 4, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <CardHeader
            title={
              <Typography variant="subtitle1" fontWeight="bold">Aktivitas Terakhir</Typography>
            }
            sx={{ borderBottom: '1px solid #e2e8f0', pb: 2 }}
          />
          <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Iconify icon="solar:box-minimalistic-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2, opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary">Belum ada aktivitas</Typography>
          </Box>
        </Card>
      </Container>
    </>
  );
}
