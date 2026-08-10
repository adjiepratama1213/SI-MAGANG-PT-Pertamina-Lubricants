import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { 
    id: 1, 
    name: 'Kareem Graham', 
    direktorat: 'Direktorat Utama & Pengawasan', 
    fungsi: 'Internal Audit', 
    bimbingan: 1, 
    status: 'Aktif',
    jabatan: 'Audit Executive',
    email: 'kareem@pertamina.com',
    pesertaList: [
      { nama: 'Alyssa Afadila R', instansi: 'Universitas Airlangga', periode: '1 Juli 2025 - 1 Desember 2025', program: 'PKL' }
    ]
  },
  { 
    id: 2, 
    name: 'Mercedes Mclean', 
    direktorat: 'Direktorat Operasi', 
    fungsi: 'Supply Chain dan Logistik', 
    bimbingan: 0, 
    status: 'Tidak Aktif',
    jabatan: 'Manager Logistik',
    email: 'mercedes@pertamina.com',
    pesertaList: []
  },
  { 
    id: 3, 
    name: 'Dawn Dillon', 
    direktorat: 'Direktorat Sales & Marketing', 
    fungsi: 'Sales Region', 
    bimbingan: 0, 
    status: 'Tidak Aktif',
    jabatan: 'Sales Manager',
    email: 'dawn@pertamina.com',
    pesertaList: []
  },
  { 
    id: 4, 
    name: 'Mentor', 
    direktorat: 'Direktorat Finance & Business Support', 
    fungsi: 'Keuangan & Akuntansi', 
    bimbingan: 2, 
    status: 'Aktif',
    jabatan: 'Finance Manager',
    email: 'mentor@pertamina.com',
    pesertaList: [
      { nama: 'Budi Santoso', instansi: 'Universitas Indonesia', periode: '1 Juli 2025 - 1 Desember 2025', program: 'Internship' },
      { nama: 'Siti Aminah', instansi: 'Institut Teknologi Bandung', periode: '1 Juli 2025 - 1 Desember 2025', program: 'KP' }
    ]
  },
  { 
    id: 5, 
    name: 'Henry Adams', 
    direktorat: 'Direktorat Utama & Pengawasan', 
    fungsi: 'Sekretariat Perusahaan & Legal', 
    bimbingan: 0, 
    status: 'Aktif',
    jabatan: 'Legal Counsel',
    email: 'henry@pertamina.com',
    pesertaList: []
  },
];

export default function Page() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);

  const handleOpenDialog = (data: any) => {
    setSelectedMentor(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMentor(null);
  };

  return (
    <>
      <Helmet>
        <title> Mentor | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon="solar:user-id-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h5">Data Mentor Magang</Typography>
              <Typography variant="body2">Total: 5 | Aktif: 3</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: '100%', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="mingcute:add-line" sx={{ mr: 1 }} /> Tambah Mentor
          </Button>
        </Box>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select label="Status" defaultValue="all"><MenuItem value="all">Semua</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField fullWidth size="small" placeholder="Cari nama mentor..." />
            </Grid>
          </Grid>

          {/* TABLE */}
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:list-bold-duotone" sx={{ mr: 1 }} /> Daftar Mentor
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama Mentor</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Jumlah Peserta</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{row.name.substring(0, 2).toUpperCase()}</Box>
                      {row.name}
                    </TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.bimbingan} Peserta</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: row.status === 'Aktif' ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}>
                        {row.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="contained" size="small" color="primary" sx={{ borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
                        Lihat Detail
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedMentor && (
          <>
            <DialogContent sx={{ p: 4, position: 'relative' }}>
              <IconButton onClick={handleCloseDialog} sx={{ position: 'absolute', top: 16, right: 16 }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
              
              {/* Profile Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.main', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, boxShadow: 2 }}>
                  {selectedMentor.name.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">{selectedMentor.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMentor.jabatan} • {selectedMentor.fungsi}
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {selectedMentor.email}
                  </Typography>
                </Box>
              </Box>

              {/* Informasi Mentor */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'bold' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Informasi Mentor
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ width: 100 }}>Direktorat:</Typography>
                      <Typography variant="body2">{selectedMentor.direktorat}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ width: 100 }}>Jabatan:</Typography>
                      <Typography variant="body2">{selectedMentor.jabatan}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ width: 100 }}>Fungsi:</Typography>
                      <Typography variant="body2">{selectedMentor.fungsi}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ width: 100 }}>Status:</Typography>
                      <Typography variant="body2" sx={{ color: selectedMentor.status === 'Aktif' ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}>
                        {selectedMentor.status}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Mahasiswa / Peserta Bimbingan */}
              <Box>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2, fontWeight: 'bold' }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" sx={{ mr: 1 }} /> Peserta Bimbingan ({selectedMentor.pesertaList.length} Peserta)
                </Typography>
                
                {selectedMentor.pesertaList.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                        <TableRow>
                          <TableCell>Nama</TableCell>
                          <TableCell>Asal Instansi</TableCell>
                          <TableCell>Periode</TableCell>
                          <TableCell>Program</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedMentor.pesertaList.map((peserta: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{peserta.nama}</TableCell>
                            <TableCell>{peserta.instansi}</TableCell>
                            <TableCell>{peserta.periode}</TableCell>
                            <TableCell>
                              <Chip label={peserta.program} size="small" color={peserta.program === 'PKL' ? 'warning' : peserta.program === 'Internship' ? 'info' : 'primary'} sx={{ fontSize: '0.7rem' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 2, bgcolor: '#f4f6f8', borderRadius: 1 }}>
                    Belum ada peserta bimbingan.
                  </Typography>
                )}
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={handleCloseDialog} color="inherit" variant="outlined" sx={{ bgcolor: '#f4f6f8' }}>
                Tutup
              </Button>
              <Button variant="contained" color="error" sx={{ '&:hover': { bgcolor: '#b91c1c' } }}>
                <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} /> Hapus
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
