// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/hooks/use-router';
import { 
  Typography, Card, CardHeader, Box, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Button, Stack
} from '@mui/material';
// components
import AppWelcome from '../app-welcome';
import AppWidgetSummary from '../app-widget-summary';
import AppAreaInstalled from '../app-area-installed';
import AppCurrentDownload from '../app-current-download';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box sx={{ position: 'relative', pb: 5 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          
          {/* Welcome Banner */}
          <Grid xs={12} md={12} sx={{ mb: 3 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0px 12px 24px -4px rgba(0, 79, 159, 0.2)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: -50, right: -20, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <Box sx={{ position: 'absolute', bottom: -50, right: 150, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              
              <Box sx={{ zIndex: 1, flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>Halo, Selamat Datang kembali!</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 500, mb: 3, lineHeight: 1.6 }}>
                  Pantau dan kelola seluruh aktivitas peserta magang, presensi, laporan, serta performa dengan mudah di ruang kendali ini.
                </Typography>
                <Button variant="contained" sx={{ bgcolor: 'white', color: '#004F9F', px: 3, py: 1, '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold', borderRadius: 2 }}>
                  Mulai Kelola
                </Button>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 1, pr: 4, alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 100, height: 100, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                  <Iconify icon="solar:laptop-minimalistic-bold-duotone" width={60} sx={{ color: 'white' }} />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* KPI Cards */}
          <Grid xs={12} md={3}>
            <AppWidgetSummary
              title="Total Peserta Magang"
              percent={12.5}
              total={245}
              chart={{
                colors: [theme.palette.primary.main],
                series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
              }}
              sx={{ 
                bgcolor: 'white',
                boxShadow: '0px 8px 16px -4px rgba(0, 79, 159, 0.15)', 
                borderRadius: 3, 
                border: '1px solid rgba(0, 0, 0, 0.05)', 
                borderBottom: '4px solid #004F9F',
                p: 2.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 12px 24px -4px rgba(0, 79, 159, 0.25)',
                }
              }}
            />
          </Grid>
          
          <Grid xs={12} md={3}>
            <AppWidgetSummary
              title="Total Mentor"
              percent={3.2}
              total={42}
              chart={{
                colors: ['#EC2028'],
                series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
              sx={{ 
                bgcolor: 'white',
                boxShadow: '0px 8px 16px -4px rgba(236, 32, 40, 0.15)', 
                borderRadius: 3, 
                border: '1px solid rgba(0, 0, 0, 0.05)', 
                borderBottom: '4px solid #EC2028',
                p: 2.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 12px 24px -4px rgba(236, 32, 40, 0.25)',
                }
              }}
            />
          </Grid>

          <Grid xs={12} md={3}>
            <AppWidgetSummary
              title="Hadir Hari Ini"
              percent={5.2}
              total={198}
              chart={{
                colors: [theme.palette.success.main],
                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
              }}
              sx={{ 
                bgcolor: 'white',
                boxShadow: '0px 8px 16px -4px rgba(0, 167, 111, 0.15)', 
                borderRadius: 3, 
                border: '1px solid rgba(0, 0, 0, 0.05)', 
                borderBottom: '4px solid #8CC63F',
                p: 2.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 12px 24px -4px rgba(0, 167, 111, 0.25)',
                }
              }}
            />
          </Grid>

          <Grid xs={12} md={3}>
            <AppWidgetSummary
              title="Tingkat Kehadiran (%)"
              percent={1.1}
              total={89.2}
              chart={{
                colors: [theme.palette.warning.main],
                series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
              sx={{ 
                bgcolor: 'white',
                boxShadow: '0px 8px 16px -4px rgba(255, 171, 0, 0.15)', 
                borderRadius: 3, 
                border: '1px solid rgba(0, 0, 0, 0.05)', 
                borderBottom: '4px solid #FFAB00',
                p: 2.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 12px 24px -4px rgba(255, 171, 0, 0.25)',
                }
              }}
            />
          </Grid>
          
          {/* Charts Area */}
          <Grid xs={12} md={8}>
              <AppAreaInstalled
                title="Statistik Kehadiran Peserta"
                subheader="(+43%) dari bulan lalu"
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                  colors: [
                    [theme.palette.primary.light, theme.palette.primary.main],
                    [theme.palette.warning.light, theme.palette.warning.main],
                    [theme.palette.error.light, theme.palette.error.main],
                  ],
                  series: [
                    {
                      year: '2026',
                      data: [
                        { name: 'Hadir', data: [150, 180, 200, 220, 240, 250, 260, 270, 280, 290, 300, 310] },
                        { name: 'Izin', data: [15, 20, 25, 30, 25, 20, 15, 10, 5, 10, 15, 20] },
                        { name: 'Alpha', data: [2, 5, 3, 8, 4, 2, 5, 3, 2, 1, 0, 0] },
                      ],
                    },
                    {
                      year: '2025',
                      data: [
                        { name: 'Hadir', data: [120, 140, 150, 180, 190, 210, 220, 230, 240, 245, 250, 255] },
                        { name: 'Izin', data: [20, 30, 40, 35, 45, 50, 40, 35, 30, 25, 20, 15] },
                        { name: 'Alpha', data: [5, 10, 8, 15, 10, 5, 10, 8, 5, 2, 1, 0] },
                      ],
                    }
                  ],
                }}
                sx={{ boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white', height: '100%' }}
              />
          </Grid>

          <Grid xs={12} md={4}>
              <AppCurrentDownload
                title="Program Peserta Magang"
                subheader="Distribusi peserta berdasarkan program"
                chart={{
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.info.main,
                    theme.palette.warning.main,
                    theme.palette.success.main,
                  ],
                  series: [
                    { label: 'PKL', value: 122 },
                    { label: 'Internship', value: 53 },
                    { label: 'Magang Hub', value: 44 },
                    { label: 'Kerja Praktik', value: 26 },
                  ],
                }}
                sx={{ boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white', height: '100%' }}
              />
          </Grid>

          {/* Aktifitas Terbaru & Aksi Cepat */}
          <Grid xs={12} md={8}>
              <Card sx={{ height: '100%', boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white' }}>
                  <CardHeader title="Aktivitas Terbaru" subheader="Kegiatan peserta dalam 24 jam terakhir" sx={{ pb: 1 }} />
                  <List sx={{ p: 2, pt: 0 }}>
                    <ListItem sx={{ mb: 1, bgcolor: '#f8fafc', borderRadius: 2, py: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F' }}><Iconify icon="solar:document-bold" width={18} /></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Alyssa Afadila R mengunggah Laporan Akhir" secondary="2 jam yang lalu" primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.8rem' }} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                      <Button size="small" variant="outlined" color="primary" onClick={() => router.push('/dashboard/laporan')} sx={{ py: 0, minWidth: 60 }}>Lihat</Button>
                    </ListItem>
                    <ListItem sx={{ mb: 1, bgcolor: '#f8fafc', borderRadius: 2, py: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F' }}><Iconify icon="solar:login-2-bold" width={18} /></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Gaston Alfonsa melakukan Check-In" secondary="4 jam yang lalu" primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.8rem' }} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                    </ListItem>
                    <ListItem sx={{ bgcolor: '#f8fafc', borderRadius: 2, py: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00' }}><Iconify icon="solar:user-id-bold" width={18} /></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Pendaftaran peserta baru: Budi Santoso" secondary="1 hari yang lalu" primaryTypographyProps={{ fontWeight: 'bold', fontSize: '0.8rem' }} secondaryTypographyProps={{ fontSize: '0.7rem' }} />
                      <Button size="small" variant="outlined" color="primary" onClick={() => router.push('/dashboard/peserta')} sx={{ py: 0, minWidth: 60 }}>Review</Button>
                    </ListItem>
                  </List>
              </Card>
          </Grid>

          <Grid xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white' }}>
                  <CardHeader title="Aksi Cepat" subheader="Navigasi ke menu utama" sx={{ pb: 1 }} />
                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="primary" size="small" onClick={() => router.push('/dashboard/peserta')} startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 79, 159, 0.05)' }}>
                          Peserta
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="secondary" size="small" onClick={() => router.push('/dashboard/mentor')} startIcon={<Iconify icon="solar:user-speak-rounded-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                          Mentor
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="info" size="small" onClick={() => router.push('/dashboard/presensi')} startIcon={<Iconify icon="solar:calendar-date-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 184, 217, 0.05)' }}>
                          Presensi
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="success" size="small" onClick={() => router.push('/dashboard/laporan')} startIcon={<Iconify icon="solar:document-text-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 167, 111, 0.05)' }}>
                          Laporan
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="error" size="small" onClick={() => router.push('/dashboard/penilaian')} startIcon={<Iconify icon="solar:clipboard-check-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(255, 86, 48, 0.05)' }}>
                          Penilaian
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="warning" size="small" onClick={() => router.push('/dashboard/reminder')} startIcon={<Iconify icon="solar:bell-bing-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(255, 171, 0, 0.05)' }}>
                          Reminder
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
              </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}