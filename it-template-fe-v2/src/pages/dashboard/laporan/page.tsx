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
    subFungsi: 'Pengembangan SDM',
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
    program: 'Internship PTPL',
    direktorat: 'Dir. Operasi',
    fungsi: 'Unit Produksi',
    subFungsi: 'K3',
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

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:document-text-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Laporan Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Rekap laporan data peserta, presensi, dan penilaian</Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Peserta</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>23</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:document-add-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Laporan Terkirim</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>3</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Menunggu Approval</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>0</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Disetujui</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>0</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" type="date" label="Filter Periode" InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status Laporan</InputLabel><Select label="Status Laporan" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Cari nama atau ID peserta..." sx={{ bgcolor: 'white' }} />
                <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                  <Iconify icon="eva:search-fill" />
                </Button>
                <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          <TableContainer sx={{ minHeight: 400 }}>
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
                      <Button variant="outlined" size="small" color="primary" sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
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
            {/* Header Dialog dengan background biru pertamina */}
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:document-bold" width={28} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Detail Laporan Peserta</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Informasi lengkap laporan magang
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4 }}>

              {/* Informasi Peserta */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Informasi Peserta
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nama Lengkap</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1.5 }}>{selectedLaporan.name}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">ID Peserta / NIM</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.nim}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Asal Instansi</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.instansi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jurusan</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.jurusan}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Program</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.program}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.fungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedLaporan.subFungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Mentor</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedLaporan.mentor}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* Rekap Kehadiran */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:calendar-date-bold-duotone" sx={{ mr: 1 }} /> Rekap Kehadiran
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'success.lighter', px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold" textTransform="uppercase" sx={{ mr: 1 }}>Hadir:</Typography>
                    <Typography variant="subtitle2" color="success.darker">{selectedLaporan.hadir} Hari</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'warning.lighter', px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: 'warning.light' }}>
                    <Typography variant="caption" color="warning.main" fontWeight="bold" textTransform="uppercase" sx={{ mr: 1 }}>Izin:</Typography>
                    <Typography variant="subtitle2" color="warning.darker">{selectedLaporan.izin} Hari</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'error.lighter', px: 2, py: 1, borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold" textTransform="uppercase" sx={{ mr: 1 }}>Alpha:</Typography>
                    <Typography variant="subtitle2" color="error.darker">{selectedLaporan.alpha} Hari</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* File Laporan */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:folder-with-files-bold-duotone" sx={{ mr: 1 }} /> File Dokumen
                </Typography>
                <Grid container spacing={2}>
                  {/* File 1: Laporan Akhir */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, '&:hover': { borderColor: '#004F9F', bgcolor: '#f8fafc' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="vscode-icons:file-type-pdf2" width={32} sx={{ mr: 1.5 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Laporan Akhir</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLaporan.fileLaporan}</Typography>
                        </Box>
                      </Box>
                      <Button variant="contained" size="small" sx={{ bgcolor: '#004F9F', boxShadow: 'none', px: 2, '&:hover': { bgcolor: '#003366' } }}>
                        Unduh
                      </Button>
                    </Box>
                  </Grid>

                  {/* File 2: Presentasi */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, '&:hover': { borderColor: '#004F9F', bgcolor: '#f8fafc' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="vscode-icons:file-type-pdf2" width={32} sx={{ mr: 1.5 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Presentasi</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLaporan.filePresentasi}</Typography>
                        </Box>
                      </Box>
                      <Button variant="contained" size="small" disabled={selectedLaporan.filePresentasi === '-'} sx={{ bgcolor: '#004F9F', boxShadow: 'none', px: 2, '&:hover': { bgcolor: '#003366' } }}>
                        Unduh
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* Status dan Nilai */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:verified-check-bold-duotone" sx={{ mr: 1 }} /> Evaluasi Laporan
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" sx={{ display: 'block', mb: 1 }}>Status Persetujuan</Typography>
                    <Chip
                      label={selectedLaporan.statusApproval}
                      color={selectedLaporan.statusApproval === 'Menunggu Persetujuan' ? 'warning' : selectedLaporan.statusApproval === 'Disetujui' ? 'success' : 'default'}
                      variant="soft"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Box sx={{ height: 40, width: '1px', bgcolor: 'divider' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" sx={{ display: 'block', mb: 0.5 }}>Nilai Akhir</Typography>
                    <Typography variant="h4" fontWeight="bold" color={selectedLaporan.nilai !== '-' ? "primary.main" : "text.disabled"}>{selectedLaporan.nilai}</Typography>
                  </Box>
                </Box>
              </Box>

            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}