import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, judul: 'Logbook Harian', deskripsi: 'Jangan lupa mengisi logbook harian!', tanggal: '2026-08-11', status: 'Aktif' },
  { id: 2, judul: 'Evaluasi Bulanan', deskripsi: 'Mohon evaluasi mahasiswa bulan ini.', tanggal: '2026-08-28', status: 'Mendatang' },
  { id: 3, judul: 'Laporan Akhir', deskripsi: 'Batas akhir pengumpulan laporan akhir magang!', tanggal: '2026-08-10', status: 'Tidak Aktif' },
];

const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Page() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);

  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleOpenEditDialog = (reminder: any) => {
    setSelectedReminder(reminder);
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedReminder(null);
  };

  return (
    <>
      <Helmet>
        <title> Reminder | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Sistem Reminder Otomatis</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Konfigurasi pengingat email/notifikasi untuk mahasiswa dan mentor</Typography>
            </Box>
          </Box>
          <Button variant="contained" onClick={handleOpenAddDialog} sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="mingcute:add-line" sx={{ mr: 1, fontSize: 18 }} /> Buat Reminder Baru
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Reminder</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>3</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Reminder Aktif</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>1</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Mendatang</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>1</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status</InputLabel><Select label="Status" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="aktif">Aktif</MenuItem><MenuItem value="mendatang">Mendatang</MenuItem><MenuItem value="tidak_aktif">Tidak Aktif</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" type="date" label="Tanggal Kirim" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Cari judul atau deskripsi..." sx={{ bgcolor: 'white' }} />
                <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                  <Iconify icon="eva:search-fill" />
                </Button>
                <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Table */}
          <TableContainer sx={{ minHeight: 400 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Judul</TableCell>
                  <TableCell>Deskripsi</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{row.judul}</TableCell>
                    <TableCell>{row.deskripsi}</TableCell>
                    <TableCell>{formatDateIndo(row.tanggal)}</TableCell>
                    <TableCell>
                      <Chip label={row.status} size="small" color={row.status === 'Aktif' ? 'success' : row.status === 'Mendatang' ? 'warning' : 'default'} variant="soft" />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleOpenEditDialog(row)} title="Detail / Edit">
                        <Iconify icon="solar:eye-bold-duotone" width={20} />
                      </IconButton>
                      <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }}>
                        <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Add Reminder Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:bell-bing-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Tambah Reminder Baru</Typography>
          </Box>
          <IconButton onClick={handleCloseAddDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Judul Reminder</Typography>
              <TextField fullWidth placeholder="Contoh: Pengingat Logbook Harian" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Deskripsi Pesan</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Tuliskan isi pesan dari reminder ini secara detail..." />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Tanggal Kirim</Typography>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseAddDialog} color="inherit" sx={{ fontWeight: 'bold', px: 3 }}>Batal</Button>
          <Button variant="contained" color="primary" onClick={handleCloseAddDialog} sx={{ px: 4, boxShadow: 'none' }}>
            Simpan Reminder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Detail Reminder Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:pen-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Detail & Edit Reminder</Typography>
          </Box>
          <IconButton onClick={handleCloseEditDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Judul Reminder</Typography>
              <TextField fullWidth defaultValue={selectedReminder?.judul} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Deskripsi Pesan</Typography>
              <TextField fullWidth multiline rows={4} defaultValue={selectedReminder?.deskripsi} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Tanggal Kirim</Typography>
              <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} defaultValue={selectedReminder?.tanggal} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseEditDialog} color="inherit" sx={{ fontWeight: 'bold', px: 3 }}>Tutup</Button>
          <Button variant="contained" color="primary" onClick={handleCloseEditDialog} sx={{ px: 4, boxShadow: 'none' }}>
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}