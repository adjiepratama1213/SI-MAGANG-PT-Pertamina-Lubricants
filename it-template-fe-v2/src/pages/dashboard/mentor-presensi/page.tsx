import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Divider, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function MentorPresensiPage() {
  const { user } = useAuthContext();
  const [selectedPresensi, setSelectedPresensi] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [mentorPresensiData, setMentorPresensiData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchMentorPresensi = async () => {
    try {
      const res = await axiosInstance.get('/presensi/mentor');
      if (res.data) {
        const formatted = res.data.map((item: any) => ({
          id: item.id,
          name: item.internProfile?.user?.name || '-',
          nim: item.internProfile?.internId || '-',
          kampus: item.internProfile?.university || '-',
          program: item.internProfile?.program || '-',
          tanggal: new Date(item.tanggalInput).toLocaleDateString('id-ID'),
          tanggalInput: item.tanggalInput.split('T')[0],
          masuk: item.masuk ? new Date(item.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          keluar: item.keluar ? new Date(item.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          presensiStatus: item.presensiStatus,
          keterangan: item.keterangan || '-',
          tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID') : null,
          fileBukti: item.fileBukti || null,
          lat: item.lat || null,
          lng: item.lng || null,
        }));
        setMentorPresensiData(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchMentorPresensi();
  }, []);

  const handleOpenDialog = (presensi: any) => {
    setSelectedPresensi(presensi);
    setIsEditing(false);
    setEditStatus(presensi.presensiStatus);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPresensi(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPresensi?.id || !editStatus) return;
    try {
      setIsApproving(true);
      await axiosInstance.patch(`/presensi/${selectedPresensi.id}/status`, { status: editStatus });
      toast.success('Status berhasil diubah');
      fetchMentorPresensi();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setIsApproving(false);
    }
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterDate(new Date().toISOString().split('T')[0]);
    setFilterStatus('all');
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const filteredData = useMemo(() => mentorPresensiData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nim.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || p.presensiStatus.toLowerCase() === filterStatus.toLowerCase();
      const matchDate = !filterDate || p.tanggalInput === filterDate;
      return matchSearch && matchStatus && matchDate;
    }), [mentorPresensiData, searchQuery, filterStatus, filterDate]);

  const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

  const summaryData = useMemo(() => mentorPresensiData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nim.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = !filterDate || p.tanggalInput === filterDate;
      return matchSearch && matchDate;
    }), [mentorPresensiData, searchQuery, filterDate]);

  return (
    <>
      <Helmet>
        <title>Presensi Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Presensi Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pantau kehadiran peserta bimbingan Anda
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Hadir</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                {summaryData.filter(p => p.presensiStatus?.toLowerCase().includes('hadir')).length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Izin / Sakit</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>
                {summaryData.filter(p => p.presensiStatus?.toLowerCase() === 'izin' || p.presensiStatus?.toLowerCase() === 'sakit').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Alpha</Typography>
                </Box>
              </Box>
              <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                {summaryData.filter(p => p.presensiStatus?.toLowerCase().includes('alpha')).length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH + FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Cari peserta (Nama/ID Peserta)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
              size="small"
            />
            <TextField
              type="date"
              size="small"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status Presensi</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status Presensi">
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="hadir">Hadir</MenuItem>
                <MenuItem value="izin">Izin</MenuItem>
                <MenuItem value="alpha">Alpha</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="error"
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          </Stack>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Masuk</TableCell>
                  <TableCell>Keluar</TableCell>
                  <TableCell align="center" width="15%">Status</TableCell>
                  <TableCell align="center" width="10%">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:calendar-date-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada data presensi</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{row.name}</TableCell>
                      <TableCell>{row.nim}</TableCell>
                      <TableCell>{row.kampus}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.program}
                          size="small"
                          variant="soft"
                          color={row.program?.toLowerCase().includes('pkl') ? 'warning' : row.program?.toLowerCase().includes('kemnaker') ? 'success' : 'info'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{row.tanggal}</TableCell>
                      <TableCell>{row.masuk}</TableCell>
                      <TableCell>{row.keluar}</TableCell>
                      <TableCell align="center">
                        {row.presensiStatus === '-' ? (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        ) : (
                          <Chip
                            label={row.presensiStatus}
                            size="small"
                            color={
                              row.presensiStatus?.toLowerCase().includes('hadir') ? 'success' :
                                (row.presensiStatus?.toLowerCase() === 'izin' || row.presensiStatus?.toLowerCase() === 'sakit') ? 'warning' :
                                  row.presensiStatus?.toLowerCase() === 'alpha' ? 'error' : 'default'
                            }
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenDialog(row)}
                          sx={{ minWidth: 90, bgcolor: 'white', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                        >
                          Lihat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Baris per halaman:"
          />
        </Card>
      </Container>

      {/* DIALOG DETAIL PRESENSI */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">
              Detail Presensi: {selectedPresensi?.name}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3, pb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                  <TableRow>
                    <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary', width: '40%' }}>Keterangan</TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Informasi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell sx={{ py: 1.5 }}>Status Kehadiran</TableCell>
                    <TableCell>
                      <Chip
                        label={selectedPresensi?.presensiStatus || '-'}
                        size="small"
                        color={
                          selectedPresensi?.presensiStatus?.toLowerCase().includes('hadir') ? 'success' :
                            (selectedPresensi?.presensiStatus?.toLowerCase() === 'izin' || selectedPresensi?.presensiStatus?.toLowerCase() === 'sakit') ? 'warning' :
                              selectedPresensi?.presensiStatus?.toLowerCase() === 'alpha' ? 'error' : 'default'
                        }
                        variant="soft"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow hover>
                    <TableCell sx={{ py: 1.5 }}>Tanggal Mulai</TableCell>
                    <TableCell><Typography fontWeight="bold" color="text.primary">{selectedPresensi?.tanggal || '-'}</Typography></TableCell>
                  </TableRow>

                  {(selectedPresensi?.presensiStatus === 'Izin' || selectedPresensi?.presensiStatus === 'Sakit') && selectedPresensi?.tanggalSelesai && (
                    <TableRow hover>
                      <TableCell sx={{ py: 1.5 }}>Tanggal Selesai</TableCell>
                      <TableCell><Typography fontWeight="bold" color="text.primary">{selectedPresensi?.tanggalSelesai || '-'}</Typography></TableCell>
                    </TableRow>
                  )}

                  {(!selectedPresensi?.presensiStatus?.includes('Izin') && !selectedPresensi?.presensiStatus?.includes('Sakit')) && (
                    <>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>Jam Masuk</TableCell>
                        <TableCell><Typography fontWeight="bold" color="text.primary">{selectedPresensi?.masuk || '-'}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>Jam Keluar</TableCell>
                        <TableCell><Typography fontWeight="bold" color="text.primary">{selectedPresensi?.keluar || '-'}</Typography></TableCell>
                      </TableRow>

                      {selectedPresensi?.lat && selectedPresensi?.lng && (
                        <TableRow hover>
                          <TableCell sx={{ py: 1.5 }}>Lokasi Absen (Koordinat)</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                              {selectedPresensi.lat}, {selectedPresensi.lng}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Keterangan */}
            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                Keterangan / Alasan
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                "{selectedPresensi?.keterangan || 'Tidak ada keterangan tambahan.'}"
              </Typography>
            </Box>

            {/* Bukti Pendukung */}
            {selectedPresensi?.fileBukti && (
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={2}>
                  Bukti Pendukung
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {selectedPresensi?.fileBukti.toLowerCase().endsWith('.pdf') ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Iconify icon="solar:document-bold-duotone" width={32} sx={{ color: 'error.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="bold">Dokumen Lampiran</Typography>
                        <Typography variant="caption" color="text.secondary">Format PDF</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        href={`${HOST_API}${selectedPresensi.fileBukti.replace(/^\//, '')}`}
                        target="_blank"
                      >
                        Lihat
                      </Button>
                    </Box>
                  ) : selectedPresensi?.fileBukti ? (
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <a href={`${HOST_API}${selectedPresensi.fileBukti.replace(/^\//, '')}`} target="_blank" rel="noreferrer">
                        <img
                          src={`${HOST_API}${selectedPresensi.fileBukti.replace(/^\//, '')}`}
                          alt="Bukti Izin"
                          style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                          onError={(e) => {
                            (e.target as any).style.display = 'none';
                          }}
                        />
                      </a>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Bukti tidak tersedia</Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* Aksi Mentor */}
            <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Ubah Status</InputLabel>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  label="Ubah Status"
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="HADIR">Hadir</MenuItem>
                  <MenuItem value="IZIN">Izin</MenuItem>
                  <MenuItem value="ALPHA">Alpha</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ color: 'text.secondary', borderColor: 'text.disabled', '&:hover': { borderColor: 'text.primary', bgcolor: '#f1f5f9' } }}>
            Tutup
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, color: 'white' }}
            onClick={handleUpdateStatus}
            disabled={isApproving || editStatus === selectedPresensi?.presensiStatus}
          >
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
