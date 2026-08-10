// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { 
  Typography, Card, CardHeader, Box, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Button, Stack
} from '@mui/material';
// components
import AppWelcome from '../app-welcome';
import AppWidgetSummary from '../app-widget-summary';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useAuthContext();
  const theme = useTheme();

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title="Dashboard Admin"
            description="Selamat datang di Sistem Informasi Magang"
            img={<Iconify icon="solar:diploma-verified-bold-duotone" width={120} sx={{ color: 'primary.main', opacity: 0.8 }} />}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total Peserta"
            percent={2.6}
            total={22}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Hadir Hari Ini"
            percent={0.2}
            total={0}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Tingkat Kehadiran"
            percent={-0.1}
            total={0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Laporan Pending"
            percent={-0.1}
            total={1}
            chart={{
              colors: [theme.palette.error.light, theme.palette.error.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>
        
        {/* Chart Placeholders */}
        <Grid xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Statistik Absensi Peserta" subheader="Agustus 2026" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Chart Area (Hadir, Izin, Alpha)</Typography>
                </Box>
            </Card>
        </Grid>

        <Grid xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Program Peserta Magang" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Donut Chart (PKL, Internship, KP, Magang BUMN)</Typography>
                </Box>
            </Card>
        </Grid>

        {/* New Sections: Aktifitas Terbaru & Aksi Cepat */}
        <Grid xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
                <CardHeader title="Aktifitas Terbaru" />
                <List sx={{ p: 2 }}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}><Iconify icon="solar:document-bold" color="white" /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Alyssa Afadila R mengunggah Laporan Akhir" secondary="2 jam yang lalu" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}><Iconify icon="solar:login-2-bold" color="white" /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Gaston Alfonsa melakukan Check-In" secondary="4 jam yang lalu" />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}><Iconify icon="solar:user-id-bold" color="white" /></Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Pendaftaran peserta baru: Budi Santoso" secondary="1 hari yang lalu" />
                  </ListItem>
                </List>
            </Card>
        </Grid>

        <Grid xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
                <CardHeader title="Aksi Cepat" />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Button variant="outlined" color="primary" size="large" startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />} sx={{ justifyContent: 'flex-start', px: 3 }}>
                    Kelola Peserta
                  </Button>
                  <Button variant="outlined" color="info" size="large" startIcon={<Iconify icon="solar:calendar-date-bold-duotone" />} sx={{ justifyContent: 'flex-start', px: 3 }}>
                    Kelola Presensi
                  </Button>
                  <Button variant="outlined" color="success" size="large" startIcon={<Iconify icon="solar:document-text-bold-duotone" />} sx={{ justifyContent: 'flex-start', px: 3 }}>
                    Kelola Laporan
                  </Button>
                </Stack>
            </Card>
        </Grid>

        <Grid xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Penilaian Rata-rata" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Bar Chart Area</Typography>
                </Box>
            </Card>
        </Grid>

        <Grid xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Status Permohonan Perpanjangan" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Horizontal Bar Chart</Typography>
                </Box>
            </Card>
        </Grid>

      </Grid>
    </Container>
  );
}
