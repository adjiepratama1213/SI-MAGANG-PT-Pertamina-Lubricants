import { Helmet } from 'react-helmet-async';
import { Container, Typography, Card, Box } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function MentorRekapPage() {
  return (
    <>
      <Helmet>
        <title>Rekap Akhir | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Iconify icon="solar:clipboard-list-bold-duotone" width={28} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">Rekapitulasi</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Rekapan final dari data peserta (Penilaian, Presensi, dan Laporan Akhir)
            </Typography>
          </Box>
        </Box>

        <Card sx={{ p: 5, textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Iconify icon="solar:clipboard-list-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Fitur Rekap Segera Hadir</Typography>
          <Typography variant="body2" color="text.disabled">Rekapitulasi akhir akan ditampilkan di sini.</Typography>
        </Card>
      </Container>
    </>
  );
}
