import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, penerima: 'Semua Mahasiswa', pesan: 'Jangan lupa mengisi logbook harian!', tipe: 'Harian', jadwal: '16:00 WIB', status: 'Aktif' },
  { id: 2, penerima: 'Mentor', pesan: 'Mohon evaluasi mahasiswa bulan ini.', tipe: 'Bulanan', jadwal: 'Tgl 28 Setiap Bulan', status: 'Aktif' },
];

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Reminder | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon="solar:bell-bing-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h5">Sistem Reminder Otomatis</Typography>
              <Typography variant="body2">Konfigurasi pengingat email/notifikasi untuk mahasiswa dan mentor</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <Iconify icon="mingcute:add-line" sx={{ mr: 1 }} /> Buat Reminder Baru
          </Button>
        </Box>

        <Card sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={12}>
              <TextField fullWidth size="small" placeholder="Cari reminder..." />
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Target Penerima</TableCell>
                  <TableCell>Isi Pesan</TableCell>
                  <TableCell>Tipe</TableCell>
                  <TableCell>Jadwal Kirim</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.penerima}</TableCell>
                    <TableCell>{row.pesan}</TableCell>
                    <TableCell>{row.tipe}</TableCell>
                    <TableCell>{row.jadwal}</TableCell>
                    <TableCell>
                       <Chip label={row.status} size="small" color={row.status === 'Aktif' ? 'success' : 'default'} variant="soft" />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" color="error">Nonaktifkan</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </>
  );
}
