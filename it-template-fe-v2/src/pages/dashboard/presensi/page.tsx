import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useSearchUsers } from 'src/pages/user-mgmt/query';

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
  const [filterBulan, setFilterBulan] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
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
  }, [fetchMonthlyData]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const { userSearchData } = useSearchUsers('');

  // Derived stats
  const totalPeserta = adminPresensiData?.length || 0;
  const totalHadir = (adminPresensiData || []).reduce((acc, curr) => acc + (curr.totalHadir || 0), 0);
  const totalIzin = (adminPresensiData || []).reduce((acc, curr) => acc + (curr.totalIzin || 0), 0);
  const totalAlpha = (adminPresensiData || []).reduce((acc, curr) => acc + (curr.totalAlpha || 0), 0);

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
      .filter((u: any) => u?.role === 'EMPLOYEESTAFF')
      .map((u: any) => u?.name || 'Unknown')));
  }, [userSearchData]);

  const programs = [...new Set(['PKL', 'Internship PTPL', 'Internship Kemnaker', ...(adminPresensiData || []).map((item) => item?.program).filter(Boolean)])];
  const direktorats = [...new Set([...uniqueDirs, ...(adminPresensiData || []).map((item) => item?.direktorat).filter(Boolean)])];
  const fungsis = [...new Set([...uniqueFungsi, ...(adminPresensiData || []).map((item) => item?.fungsi).filter(Boolean)])];
  const subFungsis = [...new Set([...uniqueSubFungsi, ...(adminPresensiData || []).map((item) => item?.subFungsi).filter(Boolean)])];
  const mentors = [...new Set([...uniqueMentors, ...(adminPresensiData || []).map((item) => item?.mentor).filter(Boolean)])];

  const filteredData = (adminPresensiData || []).filter((row) => {
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
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Presensi Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Kelola dan pantau seluruh aktivitas kehadiran peserta</Typography>
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
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalPeserta}</Typography>
            </Card>
          </Grid>

          {/* Hadir Bulan Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Hadir Bulan Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>{totalHadir}</Typography>
            </Card>
          </Grid>

          {/* Izin Bulan Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:info-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Izin Bulan Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>{totalIzin}</Typography>
            </Card>
          </Grid>

          {/* Alpha Bulan Ini */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Alpha Bulan Ini</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>{totalAlpha}</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" type="month" label="Bulan" InputLabelProps={{ shrink: true }} value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} sx={{ bgcolor: 'white' }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Program</InputLabel>
                  <Select label="Program" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                    <MenuItem value="all">Semua Program</MenuItem>
                    {programs.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Direktorat</InputLabel>
                  <Select label="Direktorat" value={filterDirektorat} onChange={(e) => setFilterDirektorat(e.target.value)}>
                    <MenuItem value="all">Semua Direktorat</MenuItem>
                    {direktorats.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Fungsi</InputLabel>
                  <Select label="Fungsi" value={filterFungsi} onChange={(e) => setFilterFungsi(e.target.value)}>
                    <MenuItem value="all">Semua Fungsi</MenuItem>
                    {fungsis.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Sub Fungsi</InputLabel>
                  <Select label="Sub Fungsi" value={filterSubFungsi} onChange={(e) => setFilterSubFungsi(e.target.value)}>
                    <MenuItem value="all">Semua Sub Fungsi</MenuItem>
                    {subFungsis.map(sf => <MenuItem key={sf} value={sf}>{sf}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Mentor</InputLabel>
                  <Select label="Mentor" value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)}>
                    <MenuItem value="all">Semua Mentor</MenuItem>
                    {mentors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Cari nama, ID, atau instansi peserta..." sx={{ bgcolor: 'white' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                  <Iconify icon="eva:search-fill" />
                </Button>
                <Button variant="outlined" onClick={handleResetFilters} sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* TABLE */}
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
                  <TableCell>Hadir</TableCell>
                  <TableCell>Izin</TableCell>
                  <TableCell>Alpha</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 3 }}>
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.kampus}</TableCell>
                    <TableCell>{row.program}</TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.subFungsi}</TableCell>
                    <TableCell>{row.mentor}</TableCell>
                    <TableCell>
                      <Chip label={row.totalHadir} size="small" color="success" variant="soft" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.totalIzin} size="small" color="warning" variant="soft" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.totalAlpha} size="small" color="error" variant="soft" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleOpenDialog(row)} title="Detail / Edit">
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
                  <Iconify icon="solar:calendar-bold-duotone" sx={{ mr: 1 }} /> Riwayat Presensi Bulan Ini
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPresensi.presensiDetail?.slice(detailPage * detailRowsPerPage, detailPage * detailRowsPerPage + detailRowsPerPage).map((detail: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{detail.tanggal}</TableCell>
                          <TableCell>{detail.masuk}</TableCell>
                          <TableCell>{detail.keluar}</TableCell>
                          <TableCell>
                            <Chip label={detail.status} size="small" color={detail.status?.toLowerCase().includes('hadir') ? 'success' : detail.status?.toLowerCase() === 'izin' || detail.status?.toLowerCase() === 'sakit' ? 'warning' : 'error'} variant="soft" />
                          </TableCell>
                          <TableCell>{detail.keterangan}</TableCell>
                        </TableRow>
                      ))}
                      {(!selectedPresensi.presensiDetail || selectedPresensi.presensiDetail.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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
