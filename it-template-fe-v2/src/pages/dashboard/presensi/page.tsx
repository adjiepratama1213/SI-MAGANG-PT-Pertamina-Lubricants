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
    name: 'Alyssa Afadila R',
    nim: '433221088',
    kampus: 'Universitas Airlangga',
    program: 'PKL',
    direktorat: 'Direktorat Finance & Business Support',
    fungsi: 'Sumber Daya Manusia',
    subFungsi: 'Pengembangan SDM',
    mentor: 'Kareem Graham',
    tanggal: '06/08/2026',
    masuk: '-',
    keluar: '-',
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
    program: 'Internship',
    direktorat: 'Direktorat Utama & Pengawasan',
    fungsi: 'Internal Audit',
    subFungsi: 'Audit TI',
    mentor: 'Budi Santoso',
    tanggal: '06/08/2026',
    masuk: '07:30',
    keluar: '16:45',
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
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Presensi Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Kelola dan pantau seluruh aktivitas kehadiran peserta magang</Typography>
            </Box>
          </Box>
          <Button variant="contained" sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Rekap Presensi
          </Button>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Peserta */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Peserta</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>22</Typography>
            </Card>
          </Grid>
          
          {/* Hadir Hari Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Hadir Hari Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>1</Typography>
            </Card>
          </Grid>
          
          {/* Izin Hari Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:info-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Izin Hari Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>0</Typography>
            </Card>
          </Grid>
          
          {/* Alpha Hari Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Alpha Hari Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>1</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" type="date" label="Tanggal" InputLabelProps={{ shrink: true }} defaultValue="2026-08-06" sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua Fungsi</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" defaultValue="all"><MenuItem value="all">Semua Sub Fungsi</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Mentor</InputLabel><Select label="Mentor" defaultValue="all"><MenuItem value="all">Semua Mentor</MenuItem></Select></FormControl>
              </Grid>
              
              <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Cari nama, ID, atau instansi peserta..." sx={{ bgcolor: 'white' }} />
                <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                  <Iconify icon="eva:search-fill" />
                </Button>
                <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* TABLE */}
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:list-bold-duotone" sx={{ mr: 1 }} /> Daftar Rekap Presensi
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Sub Fungsi</TableCell>
                  <TableCell>Mentor</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.kampus}</TableCell>
                    <TableCell>{row.program}</TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.subFungsi}</TableCell>
                    <TableCell>{row.mentor}</TableCell>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell>
                      <Chip label={row.presensiStatus} size="small" color={row.presensiStatus === 'Hadir' ? 'success' : row.presensiStatus === 'Izin' ? 'warning' : 'error'} variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="small" color="primary" sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
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
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:user-id-bold" width={28} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Detail Presensi</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedPresensi.name} • {selectedPresensi.nim}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: '40px !important', bgcolor: '#f8fafc' }}>

              {/* Informasi Peserta */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Data Peserta
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nama Lengkap</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1.5 }}>{selectedPresensi.name}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Asal Instansi</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedPresensi.kampus}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedPresensi.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPresensi.fungsi}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">ID Peserta</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1.5 }}>{selectedPresensi.nim}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Program</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1.5 }}>{selectedPresensi.program}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedPresensi.subFungsi}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* Data Waktu Presensi */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" sx={{ mr: 1 }} /> Rekaman Waktu
                </Typography>

                <Grid container spacing={3}>
                  {/* Check-In */}
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: '#eff6ff', p: 3, borderRadius: 2, height: '100%', border: '1px solid #bfdbfe' }}>
                      <Typography variant="subtitle2" sx={{ color: '#2563eb', display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Iconify icon="solar:login-2-bold-duotone" sx={{ mr: 1 }} /> Check-In
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase' }}>Jam</Typography>
                        <Typography variant="h5" sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>{selectedPresensi.masuk}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase' }}>Lokasi</Typography>
                        <Typography variant="body2" sx={{ color: '#1e3a8a', fontWeight: 'medium' }}>{selectedPresensi.checkInLocation}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Check-Out */}
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: '#fef2f2', p: 3, borderRadius: 2, height: '100%', border: '1px solid #fecaca' }}>
                      <Typography variant="subtitle2" sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Iconify icon="solar:logout-2-bold-duotone" sx={{ mr: 1 }} /> Check-Out
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 'bold', textTransform: 'uppercase' }}>Jam</Typography>
                        <Typography variant="h5" sx={{ color: '#7f1d1d', fontWeight: 'bold' }}>{selectedPresensi.keluar}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 'bold', textTransform: 'uppercase' }}>Lokasi</Typography>
                        <Typography variant="body2" sx={{ color: '#7f1d1d', fontWeight: 'medium' }}>{selectedPresensi.checkOutLocation}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

              {/* Status & Keterangan */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:clipboard-text-bold-duotone" sx={{ mr: 1 }} /> Status & Keterangan
                </Typography>

                <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" sx={{ width: 120 }}>Status Presensi</Typography>
                    <Chip label={selectedPresensi.presensiStatus} size="small" color={selectedPresensi.presensiStatus === 'Hadir' ? 'success' : 'error'} variant="soft" sx={{ fontWeight: 'bold' }} />
                  </Box>

                  <Box sx={{ display: 'flex' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" sx={{ width: 120 }}>Keterangan</Typography>
                    <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', flex: 1 }}>
                      "{selectedPresensi.keterangan}"
                    </Typography>
                  </Box>
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
