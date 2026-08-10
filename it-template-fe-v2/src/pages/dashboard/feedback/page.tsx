import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, dari: 'Alyssa Afadila R', nim: '433221088', untuk: 'Gaston Alfonsa (Mentor)', pesan: 'Bimbingan sangat membantu, terima kasih pak!', tanggal: '06/08/2026', rating: 5 },
];

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Feedback | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h5">Feedback & Evaluasi</Typography>
              <Typography variant="body2">Kumpulan masukan dari peserta untuk program dan mentor</Typography>
            </Box>
          </Box>
        </Box>

        <Card sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={12}>
              <TextField fullWidth size="small" placeholder="Cari isi pesan atau nama..." />
            </Grid>
          </Grid>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Dari</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Untuk</TableCell>
                  <TableCell>Pesan</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.dari}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.untuk}</TableCell>
                    <TableCell>{row.pesan}</TableCell>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>⭐ {row.rating}</TableCell>
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
