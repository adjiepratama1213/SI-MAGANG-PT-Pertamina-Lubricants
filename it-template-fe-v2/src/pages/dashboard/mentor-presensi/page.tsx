import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Divider, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

// Helper untuk format tanggal lokal YYYY-MM-DD
const getLocalDateKey = (dateInput: string | Date = new Date()): string => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper render status presensi konsisten (Desain outlined seperti kolom aksi pada data-bimbingan, pertahankan warna status)
const renderPresensiStatusChip = (status: string | null | undefined) => {
  if (!status || status === '-') {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }

  const raw = String(status).trim();
  const upper = raw.toUpperCase();

  let label = upper;
  // Pertamina Red: #EC2028 | Hijau: #16A34A | Yellow/Amber: #F59E0B | Default / Belum: #64748B
  let color = '#64748B';

  if (upper.includes('BELUM') || upper === 'BELUM CHECK IN') {
    label = 'BELUM CHECK IN';
    color = '#64748B';
  } else if (upper === 'HADIR_TERLAMBAT' || upper.includes('TERLAMBAT')) {
    label = 'HADIR (TERLAMBAT)';
    color = '#16A34A';
  } else if (upper.includes('HADIR')) {
    label = 'HADIR';
    color = '#16A34A';
  } else if (upper === 'IZIN' || upper.includes('IZIN')) {
    label = 'IZIN';
    color = '#F59E0B'; // Kuning sama seperti di peserta-dashboard
  } else if (upper === 'SAKIT' || upper.includes('SAKIT')) {
    label = 'SAKIT';
    color = '#F59E0B'; // Kuning sama seperti di peserta-dashboard
  } else if (upper.includes('ALPHA') || upper.includes('ALFA') || upper.includes('TIDAK HADIR') || upper.includes('TOLAK')) {
    label = upper.includes('TOLAK') ? 'DITOLAK' : 'ALPHA';
    color = '#EC2028'; // Merah logo Pertamina
  }

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 90,
        bgcolor: '#FFFFFF',
        color,
        borderColor: color,
        borderWidth: 1.5,
        borderStyle: 'solid',
        fontWeight: 700,
        fontSize: '0.75rem',
        borderRadius: 1,
        height: 28,
        letterSpacing: '0.3px',
        '& .MuiChip-label': {
          px: 1,
          fontWeight: 700,
        },
        '&:hover': {
          bgcolor: '#FFFFFF',
        },
      }}
    />
  );
};

export default function MentorPresensiPage() {
  const { user } = useAuthContext();
  const [selectedPresensi, setSelectedPresensi] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [mentorPresensiData, setMentorPresensiData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFetching, setIsFetching] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchMentorPresensi = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsFetching(true);
      const res = await axiosInstance.get('/presensi/mentor');
      if (res.data) {
        const formatted = res.data.map((item: any) => {
          const tglObj = new Date(item.tanggalInput);
          return {
            id: item.id,
            rawTanggal: item.tanggalInput,
            name: item.internProfile?.user?.name || '-',
            nim: item.internProfile?.internId || '-',
            kampus: item.internProfile?.university || '-',
            program: item.internProfile?.program || '-',
            tanggal: Number.isNaN(tglObj.getTime()) ? '-' : tglObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            tanggalInput: getLocalDateKey(item.tanggalInput),
            masuk: item.masuk ? new Date(item.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            keluar: item.keluar ? new Date(item.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            presensiStatus: (getLocalDateKey(item.tanggalInput) === getLocalDateKey(new Date()) && (!item.masuk || item.masuk === '-') && item.presensiStatus === 'ALPHA')
              ? 'BELUM CHECK IN'
              : item.presensiStatus,
            keterangan: item.keterangan || '-',
            tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null,
            fileBukti: item.fileBukti || null,
            lat: item.lat || null,
            lng: item.lng || null,
          };
        });
        setMentorPresensiData(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsFetching(false);
    }
  }, []);

  // Polling interval setiap 8 detik agar data selalu ter-update secara real-time
  useEffect(() => {
    fetchMentorPresensi();

    const interval = setInterval(() => {
      fetchMentorPresensi(true);
    }, 8000);

    const handleFocus = () => fetchMentorPresensi(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchMentorPresensi]);

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
      await fetchMentorPresensi();
      handleCloseDialog();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setIsApproving(false);
    }
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterDate('');
    setFilterStatus('all');
    setPage(0);
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const filteredData = useMemo(() => mentorPresensiData
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nim.toLowerCase().includes(searchQuery.toLowerCase());
      let matchStatus = true;
      if (filterStatus !== 'all') {
        const s = (p.presensiStatus || '').toLowerCase();
        if (filterStatus === 'hadir') matchStatus = s.includes('hadir');
        else if (filterStatus === 'izin') matchStatus = s === 'izin' || s === 'sakit';
        else if (filterStatus === 'alpha') matchStatus = s.includes('alpha');
        else matchStatus = s.includes(filterStatus.toLowerCase());
      }
      const matchDate = !filterDate || p.tanggalInput === filterDate;
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => new Date(b.rawTanggal || b.tanggalInput).getTime() - new Date(a.rawTanggal || a.tanggalInput).getTime()),
    [mentorPresensiData, searchQuery, filterStatus, filterDate]);

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

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Presensi */}
        <DashboardBreadcrumbs current="Presensi" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Presensi Peserta Bimbingan
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Pantau dan verifikasi kehadiran harian, pengajuan izin/sakit, serta status check-in peserta bimbingan Anda di PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* SUMMARY */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #16A34A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Hadir
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {summaryData.filter(p => p.presensiStatus?.toLowerCase().includes('hadir')).length}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #F59E0B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Izin / Sakit
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#FEF3C7',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {summaryData.filter(p => p.presensiStatus?.toLowerCase() === 'izin' || p.presensiStatus?.toLowerCase() === 'sakit').length}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 3,
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #EE2E24',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Alpha
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#FEE2E2',
                    color: '#EE2E24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:close-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {summaryData.filter(p => p.presensiStatus?.toLowerCase().includes('alpha')).length}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH + FILTER */}
        <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' }, flexGrow: 1 }}>
              <TextField
                fullWidth
                placeholder="Cari peserta (Nama / ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
                }}
                size="small"
                sx={{ maxWidth: { md: 260 } }}
              />
              <TextField
                type="date"
                size="small"
                label="Filter Tanggal"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status Presensi</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status Presensi">
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="hadir">Hadir / Terlambat</MenuItem>
                  <MenuItem value="izin">Izin / Sakit</MenuItem>
                  <MenuItem value="alpha">Alpha</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilter}
                startIcon={<Iconify icon="solar:restart-bold" />}
                sx={{
                  textTransform: 'none',
                  borderColor: '#CBD5E1',
                  borderRadius: 1.5,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                }}
              >
                Reset Filter
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Nama</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ID Peserta</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Asal Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Program</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Tanggal</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Masuk</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Keluar</TableCell>
                  <TableCell align="center" width="15%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" width="10%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Aksi</TableCell>
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
                    <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
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
                        {renderPresensiStatusChip(row.presensiStatus)}
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
                    <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary', width: '32%' }}>Keterangan</TableCell>
                    <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Informasi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ py: 1.5 }}>Status Kehadiran</TableCell>
                      <TableCell>
                        {renderPresensiStatusChip(selectedPresensi?.presensiStatus)}
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
                          <TableCell sx={{ py: 1.5, verticalAlign: 'top', fontWeight: 500 }}>Lokasi Absen</TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.25,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 0.75,
                                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                                    color: 'error.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Iconify icon="solar:map-point-bold-duotone" width={18} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Koordinat GPS
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#1e293b',
                                      fontFamily: 'monospace',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      wordBreak: 'break-all',
                                    }}
                                  >
                                    {selectedPresensi.lat}, {selectedPresensi.lng}
                                  </Typography>
                                </Box>
                              </Box>

                              <Button
                                size="small"
                                variant="contained"
                                component="a"
                                href={`https://maps.google.com/maps?q=${selectedPresensi.lat},${selectedPresensi.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<Iconify icon="solar:map-bold-duotone" width={16} />}
                                endIcon={<Iconify icon="eva:external-link-fill" width={14} />}
                                sx={{
                                  bgcolor: '#004F9F',
                                  '&:hover': { bgcolor: '#003366' },
                                  color: '#fff',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  py: 0.6,
                                  px: 1.5,
                                  borderRadius: 1,
                                  alignSelf: 'flex-start',
                                  whiteSpace: 'nowrap',
                                  boxShadow: 'none',
                                }}
                              >
                                Buka di Google Maps
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedPresensi?.lat && selectedPresensi?.lng && (
              <Box sx={{ mt: 1, height: 180, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${selectedPresensi.lat},${selectedPresensi.lng}&hl=id&z=16&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Peta Lokasi Peserta"
                />
              </Box>
            )}

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
