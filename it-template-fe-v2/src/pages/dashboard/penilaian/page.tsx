import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip, CardHeader,
  Dialog, DialogTitle, DialogContent, IconButton, LinearProgress, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { 
    id: 1, 
    name: 'Alyssa Afadila R', 
    nim: '433221088', 
    instansi: 'Universitas Airlangga', 
    jurusan: 'Manajemen Perkantoran Digital', 
    program: 'PKL', 
    direktorat: 'Direktorat Finance & Business Support', 
    fungsi: 'Human Capital', 
    mentor: 'Mentor', 
    nilai: '84.43', 
    kategori: 'Memuaskan', 
    status: 'Sudah Dinilai',
    detailNilai: {
      integritas: 80,
      ketepatanWaktu: 88,
      keahlian: 86,
      kerjasama: 76,
      komunikasi: 90,
      penggunaanTI: 82,
      pengembanganDiri: 89
    },
    rekomendasi: 'Direkomendasikan',
    catatan: 'tes'
  },
  { 
    id: 2, 
    name: 'Gaston Alfonsa', 
    nim: '123456789', 
    instansi: '-', 
    jurusan: '-', 
    program: 'PKL', 
    direktorat: 'Direktorat Utama & Pengawasan', 
    fungsi: 'HSSE', 
    mentor: '-', 
    nilai: '-', 
    kategori: '-', 
    status: 'Belum Dinilai',
    detailNilai: null,
    rekomendasi: '-',
    catatan: '-'
  },
];

export default function Page() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPenilaian, setSelectedPenilaian] = useState<any>(null);

  const handleOpenDialog = (data: any) => {
    setSelectedPenilaian(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPenilaian(null);
  };

  const renderProgressBar = (value: number) => {
    // Warna progress bar (hijau jika >= 85, kuning jika < 85)
    const color = value >= 85 ? '#22c55e' : '#eab308';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 2, bgcolor: '#f1f5f9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <Box sx={{ width: `${value}%`, bgcolor: color, height: '100%', borderRadius: 4 }} />
        </Box>
        <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ minWidth: 25 }}>
          {value}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Helmet>
        <title> Penilaian | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Iconify icon="solar:star-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box textAlign="left">
              <Typography variant="h5">Data Penilaian Peserta</Typography>
              <Typography variant="body2">Kelola dan analisis hasil penilaian magang seluruh peserta.</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '100%', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Rekap Penilaian
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={40} sx={{ color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Total Peserta Dinilai</Typography>
              <Typography variant="h3" color="primary.main">3</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:chart-line-bold-duotone" width={40} sx={{ color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Rata-rata Nilai Keseluruhan</Typography>
              <Typography variant="h3" color="success.main">88.5</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:user-id-bold-duotone" width={40} sx={{ color: 'secondary.main', mb: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Mentor Aktif</Typography>
              <Typography variant="h3" color="secondary.main">2</Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Rata-rata Nilai Peserta per Mentor" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Chart Area Placeholder</Typography>
                </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 300 }}>
                <CardHeader title="Status Penilaian Keseluruhan" />
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body2" color="text.secondary">Chart Area Placeholder</Typography>
                </Box>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small"><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small"><InputLabel>Mentor</InputLabel><Select label="Mentor" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Status Penilaian</InputLabel><Select label="Status Penilaian" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" placeholder="Cari nama peserta..." />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama Peserta</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Jurusan</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Mentor</TableCell>
                  <TableCell>Nilai Akhir</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.instansi}</TableCell>
                    <TableCell>{row.jurusan}</TableCell>
                    <TableCell>{row.program}</TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.mentor}</TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.nilai}</TableCell>
                    <TableCell>
                      {row.kategori !== '-' && <Chip label={row.kategori} size="small" color="info" variant="soft" />}
                    </TableCell>
                    <TableCell>
                       <Chip label={row.status} size="small" color={row.status === 'Sudah Dinilai' ? 'success' : 'warning'} variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" color="primary" sx={{ mr: 1, mb: 1 }} onClick={() => handleOpenDialog(row)} disabled={row.status === 'Belum Dinilai'}>Lihat</Button>
                      <Button variant="contained" size="small" color="error" sx={{ mb: 1 }}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* DETAIL PENILAIAN DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedPenilaian && selectedPenilaian.detailNilai && (
          <>
            {/* Header dengan Gradient Ungu-Pink */}
            <DialogTitle sx={{ 
              m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', 
              color: 'white' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:clipboard-text-bold" width={28} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">Detail Penilaian</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Informasi lengkap hasil penilaian peserta
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
              
              {/* Data Peserta */}
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#334155' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1, color: '#6366f1' }} /> Data Peserta
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>Nama:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="text.primary">{selectedPenilaian.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>Asal Instansi:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPenilaian.instansi}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>Mentor:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPenilaian.mentor}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>ID Peserta:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPenilaian.nim}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>Jurusan:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPenilaian.jurusan}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>Direktorat:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPenilaian.direktorat}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Detail Penilaian (Progress Bars) */}
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 3, color: '#334155' }}>
                  <Iconify icon="solar:checklist-bold-duotone" sx={{ mr: 1, color: '#6366f1' }} /> Detail Penilaian
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>1. Integritas (Etika, moral, dan kesungguhan)</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.integritas)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>2. Ketepatan waktu dalam bekerja</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.ketepatanWaktu)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>3. Keahlian berdasarkan bidang ilmu</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.keahlian)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>4. Kerjasama dalam tim</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.kerjasama)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>5. Komunikasi</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.komunikasi)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>6. Penggunaan teknologi informasi</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.penggunaanTI)}</Box>
                  </Grid>
                  <Grid item xs={12} display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ width: '40%' }}>7. Pengembangan diri</Typography>
                    <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.pengembanganDiri)}</Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Nilai Akhir & Keterangan Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color: 'white' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Nilai Akhir</Typography>
                    <Typography variant="h3" fontWeight="bold">{selectedPenilaian.nilai}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', color: 'white' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>Keterangan</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{selectedPenilaian.kategori}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Penilaian Keseluruhan & Catatan */}
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 3, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#334155' }}>
                  <Iconify icon="solar:like-bold-duotone" sx={{ mr: 1, color: '#3b82f6' }} /> Penilaian Keseluruhan
                </Typography>
                <Typography variant="body2" sx={{ ml: 3 }}>{selectedPenilaian.rekomendasi}</Typography>
              </Box>

              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#334155' }}>
                  <Iconify icon="solar:chat-line-bold-duotone" sx={{ mr: 1, color: '#8b5cf6' }} /> Catatan / Feedback
                </Typography>
                <Typography variant="body2" sx={{ ml: 3 }}>{selectedPenilaian.catatan}</Typography>
              </Box>

            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
