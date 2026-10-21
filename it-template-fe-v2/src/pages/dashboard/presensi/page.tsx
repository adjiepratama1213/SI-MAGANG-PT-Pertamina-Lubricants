import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, LinearProgress,
  Tooltip, CircularProgress, InputAdornment
} from '@mui/material';
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import { HOST_API } from 'src/config-global';
import { exportPresensiPdf } from 'src/utils/export-pdf';

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
    bulan: '2026-08',
    totalHadir: 15,
    totalIzin: 2,
    totalAlpha: 1,
    presensiDetail: [
      { tanggal: '01/08/2026', masuk: '07:30', keluar: '16:45', status: 'Hadir', keterangan: '-' },
      { tanggal: '02/08/2026', masuk: '-', keluar: '-', status: 'Alpha', keterangan: 'Tanpa Keterangan' },
      { tanggal: '03/08/2026', masuk: '-', keluar: '-', status: 'Izin', keterangan: 'Sakit' },
    ]
  },
  {
    id: 2,
    name: 'Gaston Alfonsa',
    nim: '123456789',
    kampus: 'Universitas Gadjah Mada',
    program: 'Internship PTPL',
    direktorat: 'Direktorat Utama & Pengawasan',
    fungsi: 'Internal Audit',
    subFungsi: 'Audit TI',
    mentor: 'Budi Santoso',
    bulan: '2026-08',
    totalHadir: 20,
    totalIzin: 0,
    totalAlpha: 0,
    presensiDetail: [
       { tanggal: '01/08/2026', masuk: '07:35', keluar: '16:50', status: 'Hadir', keterangan: '-' },
       { tanggal: '02/08/2026', masuk: '07:40', keluar: '17:00', status: 'Hadir', keterangan: '-' },
    ]
  },
];

export default function Page() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPresensi, setSelectedPresensi] = useState<any>(null);
  
  // New states for real data
  const [adminPresensiData, setAdminPresensiData] = useState<any[]>([]);
  const [filterBulan, setFilterBulan] = useState('all'); // 'all' for akumulasi total, or 'YYYY-MM'
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterDirektorat, setFilterDirektorat] = useState('all');
  const [filterFungsi, setFilterFungsi] = useState('all');
  const [filterSubFungsi, setFilterSubFungsi] = useState('all');
  const [filterMentor, setFilterMentor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination Main Table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Pagination Detail Table
  const [detailPage, setDetailPage] = useState(0);
  const detailRowsPerPage = 5;

  const handleDetailChangePage = (event: unknown, newPage: number) => {
    setDetailPage(newPage);
  };

  const fetchMonthlyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/presensi/admin/monthly', {
        params: { month: filterBulan }
      });
      if (res.data) {
        setAdminPresensiData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin presensi data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterBulan]);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const fetchOrgs = async () => {
    try {
      const res = await axiosInstance.get(endpoints.employeeProfile.organizationsHierarchy);
      setOrganizations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMonthlyData();

    const interval = setInterval(() => {
      fetchMonthlyData();
    }, 10000);

    const handleFocus = () => fetchMonthlyData();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchMonthlyData]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const { userSearchData } = useSearchUsers('');

  const activePresensiData = useMemo(() => {
    return (adminPresensiData || []).filter((item) => item?.mentor && item.mentor !== '-');
  }, [adminPresensiData]);

  // Derived stats
  const totalPeserta = activePresensiData.length;
  const totalHadir = activePresensiData.reduce((acc, curr) => acc + (curr.totalHadir || 0), 0);
  const totalIzin = activePresensiData.reduce((acc, curr) => acc + (curr.totalIzin || 0), 0);
  const totalAlpha = activePresensiData.reduce((acc, curr) => acc + (curr.totalAlpha || 0), 0);

  const handleOpenDialog = (data: any) => {
    setSelectedPresensi(data);
    setDetailPage(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPresensi(null);
  };

  const uniqueDirs = Array.from(new Set((organizations || []).map(o => o?.name).filter(Boolean)));
  const uniqueFungsi = Array.from(new Set((organizations || []).flatMap(o => (o?.fungsi || []).map((f: any) => f?.name)).filter(Boolean)));
  const uniqueSubFungsi = Array.from(new Set((organizations || []).flatMap(o => (o?.fungsi || []).flatMap((f: any) => (f?.subFungsi || []).map((sf: any) => sf?.name))).filter(Boolean)));

  const uniqueMentors = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData)) return [];
    return Array.from(new Set(userSearchData
      .filter((u: any) => u?.role === 'EMPLOYEESTAFF' && u?.status === 'active')
      .map((u: any) => u?.name || 'Unknown')));
  }, [userSearchData]);

  const programs = Array.from(new Set(['PKL', 'Internship PTPL', 'Internship Kemnaker', ...(activePresensiData || []).map((item) => item?.program).filter(Boolean)]));
  const direktorats = Array.from(new Set([...uniqueDirs, ...(activePresensiData || []).map((item) => item?.direktorat).filter(Boolean)]));
  const fungsis = Array.from(new Set([...uniqueFungsi, ...(activePresensiData || []).map((item) => item?.fungsi).filter(Boolean)]));
  const subFungsis = Array.from(new Set([...uniqueSubFungsi, ...(activePresensiData || []).map((item) => item?.subFungsi).filter(Boolean)]));
  const mentors = Array.from(new Set([...uniqueMentors, ...(activePresensiData || []).map((item) => item?.mentor).filter(Boolean)]));

  const filteredData = (activePresensiData || []).filter((row) => {
    const matchProgram = filterProgram === 'all' || row?.program === filterProgram;
    const matchDirektorat = filterDirektorat === 'all' || row?.direktorat === filterDirektorat;
    const matchFungsi = filterFungsi === 'all' || row?.fungsi === filterFungsi;
    const matchSubFungsi = filterSubFungsi === 'all' || row?.subFungsi === filterSubFungsi;
    const matchMentor = filterMentor === 'all' || row?.mentor === filterMentor;
    const matchSearch =
      searchQuery === '' ||
      (row?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row?.nim || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row?.kampus || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchProgram && matchDirektorat && matchFungsi && matchSubFungsi && matchMentor && matchSearch;
  });

  const handleResetFilters = () => {
    setFilterBulan('all');
    setFilterProgram('all');
    setFilterDirektorat('all');
    setFilterFungsi('all');
    setFilterSubFungsi('all');
    setFilterMentor('all');
    setSearchQuery('');
    setPage(0);
  };

  return (
    <>
      <Helmet>
        <title> Presensi | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <DashboardBreadcrumbs current="Presensi" />

        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2.5, background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Presensi Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Kelola dan pantau seluruh aktivitas kehadiran peserta</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => exportPresensiPdf(filteredData, filterBulan)}
              sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}
            >
              <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Rekap Presensi
            </Button>
          </Stack>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Peserta */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #004F9F', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Peserta</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalPeserta}</Typography>
            </Card>
          </Grid>

          {/* Hadir Bulan Ini / Akumulasi */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #16A34A', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>
                  {filterBulan === 'all' ? 'Hadir (Akumulasi)' : 'Hadir Bulan Ini'}
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#16A34A', fontWeight: 'bold' }}>{totalHadir}</Typography>
            </Card>
          </Grid>

          {/* Izin Bulan Ini / Akumulasi */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #F59E0B', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:info-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>
                  {filterBulan === 'all' ? 'Izin (Akumulasi)' : 'Izin Bulan Ini'}
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>{totalIzin}</Typography>
            </Card>
          </Grid>

          {/* Alpha Bulan Ini / Akumulasi */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #EE2E24', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(238, 46, 36, 0.1)', color: '#EE2E24', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>
                  {filterBulan === 'all' ? 'Alpha (Akumulasi)' : 'Alpha Bulan Ini'}
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#EE2E24', fontWeight: 'bold' }}>{totalAlpha}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Periode Presensi</InputLabel>
                <Select
                  label="Periode Presensi"
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                >
                  <MenuItem value="all">Semua Periode (Akumulasi Total)</MenuItem>
                  <MenuItem value="2026-10">Oktober 2026 (Bulan Ini)</MenuItem>
                  <MenuItem value="2026-09">September 2026</MenuItem>
                  <MenuItem value="2026-08">Agustus 2026</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Program</InputLabel>
                <Select label="Program" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                  <MenuItem value="all">Semua Program</MenuItem>
                  {programs.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Direktorat</InputLabel>
                <Select label="Direktorat" value={filterDirektorat} onChange={(e) => setFilterDirektorat(e.target.value)}>
                  <MenuItem value="all">Semua Direktorat</MenuItem>
                  {direktorats.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Fungsi</InputLabel>
                <Select label="Fungsi" value={filterFungsi} onChange={(e) => setFilterFungsi(e.target.value)}>
                  <MenuItem value="all">Semua Fungsi</MenuItem>
                  {fungsis.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sub Fungsi</InputLabel>
                <Select label="Sub Fungsi" value={filterSubFungsi} onChange={(e) => setFilterSubFungsi(e.target.value)}>
                  <MenuItem value="all">Semua Sub Fungsi</MenuItem>
                  {subFungsis.map(sf => <MenuItem key={sf} value={sf}>{sf}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Mentor</InputLabel>
                <Select label="Mentor" value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)}>
                  <MenuItem value="all">Semua Mentor</MenuItem>
                  {mentors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari nama, ID, atau instansi peserta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="solar:restart-bold" />}
                sx={{
                  height: 40,
                  px: 2,
                  flexShrink: 0,
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
            </Grid>
          </Grid>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Peserta</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Program & Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Penempatan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Hadir</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Izin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Alpha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:clipboard-remove-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Tidak ada data presensi ditemukan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.nim}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{row.program}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.kampus}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{row.direktorat}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.fungsi} • {row.subFungsi}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.mentor}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.totalHadir}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 48,
                            bgcolor: '#FFFFFF',
                            color: '#16A34A',
                            borderColor: '#16A34A',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                            letterSpacing: '0.3px',
                            '& .MuiChip-label': { px: 1, fontWeight: 700 },
                            '&:hover': { bgcolor: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.totalIzin}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 48,
                            bgcolor: '#FFFFFF',
                            color: '#F59E0B',
                            borderColor: '#F59E0B',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                            letterSpacing: '0.3px',
                            '& .MuiChip-label': { px: 1, fontWeight: 700 },
                            '&:hover': { bgcolor: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.totalAlpha}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 48,
                            bgcolor: '#FFFFFF',
                            color: '#EC2028',
                            borderColor: '#EC2028',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                            letterSpacing: '0.3px',
                            '& .MuiChip-label': { px: 1, fontWeight: 700 },
                            '&:hover': { bgcolor: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }} onClick={() => handleOpenDialog(row)} title="Detail / Edit">
                          <Iconify icon="solar:eye-bold-duotone" width={18} />
                        </IconButton>
                        <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedPresensi && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Detail Presensi</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedPresensi.name} • {selectedPresensi.nim}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: '40px !important', bgcolor: '#f8fafc' }}>

              {/* Informasi Peserta */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                  Data Peserta
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
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                  Riwayat Presensi ({filterBulan === 'all' ? 'Seluruh Periode' : 'Bulan ' + filterBulan})
                </Typography>

                <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                      <TableRow>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Check-In</TableCell>
                        <TableCell>Check-Out</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Keterangan</TableCell>
                        <TableCell align="center">Lampiran & Lokasi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPresensi.presensiDetail?.slice(detailPage * detailRowsPerPage, detailPage * detailRowsPerPage + detailRowsPerPage).map((detail: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{detail.tanggal}</TableCell>
                          <TableCell>{detail.masuk}</TableCell>
                          <TableCell>{detail.keluar}</TableCell>
                          <TableCell>
                            {renderPresensiStatusChip(detail.status)}
                          </TableCell>
                          <TableCell>{detail.keterangan}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              {detail.fileBukti && (
                                <Tooltip title="Lihat Dokumen / Bukti">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    component="a"
                                    href={`${HOST_API}${detail.fileBukti.replace(/^\//, '')}`}
                                    target="_blank"
                                  >
                                    <Iconify icon="solar:document-bold-duotone" width={18} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {detail.lat && detail.lng && (
                                <Tooltip title={`Lokasi Check-in: ${detail.lat}, ${detail.lng}`}>
                                  <IconButton
                                    size="small"
                                    color="info"
                                    component="a"
                                    href={`https://maps.google.com/maps?q=${detail.lat},${detail.lng}`}
                                    target="_blank"
                                  >
                                    <Iconify icon="solar:map-point-bold-duotone" width={18} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {!detail.fileBukti && (!detail.lat || !detail.lng) && (
                                <Typography variant="caption" color="text.disabled">-</Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!selectedPresensi.presensiDetail || selectedPresensi.presensiDetail.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            Belum ada riwayat presensi di bulan ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {selectedPresensi.presensiDetail && selectedPresensi.presensiDetail.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={selectedPresensi.presensiDetail.length}
                    rowsPerPage={detailRowsPerPage}
                    page={detailPage}
                    onPageChange={handleDetailChangePage}
                  />
                )}
              </Box>

            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="contained" 
                sx={{ 
                  bgcolor: '#004F9F', 
                  '&:hover': { bgcolor: '#003366' }, 
                  px: 3, 
                  py: 0.85, 
                  borderRadius: 1.5, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  boxShadow: 'none'
                }}
              >
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
