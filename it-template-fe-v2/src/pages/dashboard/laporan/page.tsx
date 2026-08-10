import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip, CardHeader,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { 
    id: 1, 
    name: 'Alyssa Afadila R', 
    nim: '433221088', 
    instansi: 'Universitas Airlangga', 
    hadir: 3, izin: 0, alpha: 1, nilai: '84.43', 
    status: 'Detail',
    mentor: 'Kareem Graham',
    jurusan: 'Manajemen Perkantoran Digital',
    program: 'PKL',
    direktorat: 'Dir. Finance & Business Support',
    fungsi: 'Human Capital',
    fileLaporan: 'Laporan_Akhir_Alyssa_2025.pdf',
    filePresentasi: 'Presentasi_Alyssa_2025.pdf',
    statusApproval: 'Menunggu Persetujuan'
  },
  { 
    id: 2, 
    name: 'Gaston Alfonsa', 
    nim: '123456789', 
    instansi: 'Universitas Gadjah Mada', 
    hadir: 0, izin: 0, alpha: 0, nilai: '-', 
    status: 'Detail',
    mentor: 'Budi Santoso',
    jurusan: 'Teknik Mesin',
    program: 'Internship',
    direktorat: 'Dir. Operasi',
    fungsi: 'Unit Produksi',
    fileLaporan: 'Laporan_Akhir_Gaston_2025.pdf',
    filePresentasi: '-',
    statusApproval: 'Belum Submit'
  },
];

export default function Page() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);

  const handleOpenDialog = (data: any) => {
    setSelectedLaporan(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLaporan(null);
  };

  return (
    <>
      <Helmet>
        <title> Laporan | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:document-text-bold-duotone" width={32} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h5">Laporan Magang</Typography>
              <Typography variant="body2">Rekap laporan data peserta, presensi, dan penilaian</Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={40} sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Peserta</Typography>
                <Typography variant="h4">23</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:document-add-bold-duotone" width={40} sx={{ color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Laporan Terkirim</Typography>
                <Typography variant="h4">3</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:clock-circle-bold-duotone" width={40} sx={{ color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Menunggu Approval</Typography>
                <Typography variant="h4">0</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:check-circle-bold-duotone" width={40} sx={{ color: 'success.dark', mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Disetujui</Typography>
                <Typography variant="h4">0</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" type="date" label="Filter Periode" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small"><InputLabel>Status Laporan</InputLabel><Select label="Status Laporan" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" placeholder="Cari nama atau ID peserta..." />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" sx={{ mr: 1 }}>Filter</Button>
              <Button variant="outlined">Reset</Button>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Tabel Rekap Laporan</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell align="center">Hadir</TableCell>
                  <TableCell align="center">Izin</TableCell>
                  <TableCell align="center">Alpha</TableCell>
                  <TableCell align="center">Nilai</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.instansi}</TableCell>
                    <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>{row.hadir}</TableCell>
                    <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>{row.izin}</TableCell>
                    <TableCell align="center" sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.alpha}</TableCell>
                    <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.nilai}</TableCell>
                    <TableCell align="center">
                      {row.statusApproval === 'Belum Submit' || row.statusApproval === '-' ? (
                        '-'
                      ) : (
                        <Chip label={row.statusApproval} size="small" color={row.statusApproval === 'Menunggu Persetujuan' ? 'warning' : row.statusApproval === 'Disetujui' ? 'success' : 'default'} sx={{ fontSize: '0.7rem' }} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" color="primary" sx={{ borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
                        {row.status}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* DETAIL LAPORAN DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedLaporan && (
          <>
            {/* Header Dialog dengan background ungu */}
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#8b5cf6', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:document-bold" width={24} />
                </Box>
                <Box>
                  <Typography variant="h6">Detail Laporan Peserta</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Informasi lengkap laporan magang
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4 }}>
              
              {/* Informasi Peserta */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Informasi Peserta
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Nama:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>ID Peserta:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.nim}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Asal Instansi:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.instansi}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Jurusan:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.jurusan}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Program:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.program}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Direktorat:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.direktorat}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Fungsi:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.fungsi}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Mentor:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.mentor}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* File Laporan */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  File Laporan
                </Typography>
                <Stack spacing={2}>
                  
                  {/* File 1: Laporan Akhir */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="vscode-icons:file-type-pdf2" width={32} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2">Laporan Akhir</Typography>
                        <Typography variant="caption" color="text.secondary">{selectedLaporan.fileLaporan}</Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" color="primary" sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
                      <Iconify icon="eva:download-fill" sx={{ mr: 1 }} /> Download
                    </Button>
                  </Box>

                  {/* File 2: Presentasi */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="vscode-icons:file-type-pdf2" width={32} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2">Presentasi</Typography>
                        <Typography variant="caption" color="text.secondary">{selectedLaporan.filePresentasi}</Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" color="primary" disabled={selectedLaporan.filePresentasi === '-'} sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
                      <Iconify icon="eva:download-fill" sx={{ mr: 1 }} /> Download
                    </Button>
                  </Box>

                </Stack>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* Status dan Nilai */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Status dan Nilai
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 60 }}>Status:</Typography>
                      <Chip label={selectedLaporan.statusApproval} size="small" color="warning" sx={{ bgcolor: '#fef08a', color: '#854d0e', fontWeight: 'bold' }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 60 }}>Nilai:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">{selectedLaporan.nilai}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
