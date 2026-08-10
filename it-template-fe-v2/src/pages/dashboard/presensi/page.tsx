import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { 
    id: 1, 
    name: 'Alyssa Afadila R', 
    nim: '433221088', 
    kampus: 'Universitas Airlangga', 
    jurusan: 'Manajemen Perkantoran Digital', 
    program: 'PKL', 
    direktorat: 'Direktorat Finance & Business Support', 
    fungsi: 'Sumber Daya Manusia', 
    mentor: 'Kareem Graham', 
    tanggal: '06/08/2026', 
    masuk: '-', 
    keluar: '-', 
    hadir: 3, izin: 0, alpha: 1, 
    presensiStatus: 'Alpha',
    checkInLocation: '-',
    checkOutLocation: '-',
    keterangan: 'Tidak melakukan presensi'
  },
  { 
    id: 2, 
    name: 'Gaston Alfonsa', 
    nim: '123456789', 
    kampus: 'Universitas Gadjah Mada', 
    jurusan: 'Teknik Mesin', 
    program: 'Internship', 
    direktorat: 'Direktorat Utama & Pengawasan', 
    fungsi: 'Internal Audit', 
    mentor: 'Budi Santoso', 
    tanggal: '06/08/2026', 
    masuk: '07:30', 
    keluar: '16:45', 
    hadir: 1, izin: 0, alpha: 0, 
    presensiStatus: 'Hadir',
    checkInLocation: 'LTC Pertamina',
    checkOutLocation: 'LTC Pertamina',
    keterangan: '-'
  },
];

export default function Page() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPresensi, setSelectedPresensi] = useState<any>(null);

  const handleOpenDialog = (data: any) => {
    setSelectedPresensi(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPresensi(null);
  };

  return (
    <>
      <Helmet>
        <title> Presensi | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon="solar:calendar-date-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h5">Presensi Peserta</Typography>
              <Typography variant="body2">Kelola dan pantau seluruh aktivitas kehadiran peserta magang</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '100%', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Rekap Presensi
          </Button>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'primary.lighter' }}>
              <Typography variant="subtitle2" color="primary.main">Total Peserta</Typography>
              <Typography variant="h3" color="primary.darker">22</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'success.lighter' }}>
              <Typography variant="subtitle2" color="success.main">Hadir Hari Ini</Typography>
              <Typography variant="h3" color="success.darker">1</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'warning.lighter' }}>
              <Typography variant="subtitle2" color="warning.main">Izin Hari Ini</Typography>
              <Typography variant="h3" color="warning.darker">0</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'error.lighter' }}>
              <Typography variant="subtitle2" color="error.main">Alpha Hari Ini</Typography>
              <Typography variant="h3" color="error.darker">1</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:filter-bold-duotone" sx={{ mr: 1 }} /> Rekap Presensi Peserta
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" type="date" label="Tanggal" InputLabelProps={{ shrink: true }} defaultValue="2026-08-06" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Periode</InputLabel><Select label="Periode" defaultValue="all"><MenuItem value="all">-- Pilih Bulan --</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small"><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small"><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small"><InputLabel>Mentor</InputLabel><Select label="Mentor" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" placeholder="Nama, ID, atau Instansi..." />
            </Grid>
            <Grid item xs={12} md={12}>
              <Button variant="contained" sx={{ mr: 1 }}>Filter</Button>
              <Button variant="outlined">Reset</Button>
            </Grid>
          </Grid>

          {/* TABLE */}
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Jurusan</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Mentor</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Jam Masuk</TableCell>
                  <TableCell>Jam Keluar</TableCell>
                  <TableCell>Hadir</TableCell>
                  <TableCell>Izin</TableCell>
                  <TableCell>Alpha</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.kampus}</TableCell>
                    <TableCell>{row.jurusan}</TableCell>
                    <TableCell>{row.program}</TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.mentor}</TableCell>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell>{row.masuk}</TableCell>
                    <TableCell>{row.keluar}</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{row.hadir}</TableCell>
                    <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}>{row.izin}</TableCell>
                    <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.alpha}</TableCell>
                    <TableCell>
                       <Chip label={row.presensiStatus} size="small" color={row.presensiStatus === 'Hadir' ? 'success' : 'error'} variant="soft" />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="contained" size="small" color="primary" sx={{ borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedPresensi && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#6941c6' }}>
                <Iconify icon="solar:user-id-bold-duotone" width={24} sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Detail Presensi Peserta</Typography>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ px: 3, pb: 2 }}>
              
              {/* Informasi Peserta */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Nama</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedPresensi.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Asal Instansi</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedPresensi.kampus}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">ID Peserta</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedPresensi.nim}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Program</Typography>
                    <Typography variant="body2" fontWeight="bold">{selectedPresensi.program}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Check-In */}
              <Box sx={{ bgcolor: '#eff6ff', p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#2563eb', display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Iconify icon="solar:login-2-bold-duotone" sx={{ mr: 1 }} /> Check-In
                </Typography>
                <Box sx={{ ml: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#60a5fa' }}>Jam</Typography>
                    <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>{selectedPresensi.masuk}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#60a5fa' }}>Lokasi</Typography>
                    <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>{selectedPresensi.checkInLocation}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Check-Out */}
              <Box sx={{ bgcolor: '#fef2f2', p: 2, borderRadius: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Iconify icon="solar:logout-2-bold-duotone" sx={{ mr: 1 }} /> Check-Out
                </Typography>
                <Box sx={{ ml: 3 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#f87171' }}>Jam</Typography>
                    <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 'bold' }}>{selectedPresensi.keluar}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#f87171' }}>Lokasi</Typography>
                    <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 'bold' }}>{selectedPresensi.checkOutLocation}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status & Keterangan */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Status Presensi</Typography>
                <Chip label={selectedPresensi.presensiStatus} size="small" color={selectedPresensi.presensiStatus === 'Hadir' ? 'success' : 'error'} variant="soft" sx={{ mb: 2, fontWeight: 'bold' }} />
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Keterangan</Typography>
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPresensi.keterangan}
                  </Typography>
                </Box>
              </Box>

            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' } }}>
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
