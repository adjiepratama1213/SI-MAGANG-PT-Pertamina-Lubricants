import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  LinearProgress, Stack, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Paper
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
import { toast } from 'react-toastify';
import { fDate } from 'src/utils/format-time';

const getFileUrl = (file: string) => {
  if (!file) return '';
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return file;
  }
  let cleanFile = file.startsWith('/') ? file.slice(1) : file;
  if (!cleanFile.startsWith('uploads/')) {
    if (cleanFile.startsWith('certificate-')) {
      cleanFile = `uploads/certificates/${cleanFile}`;
    } else {
      cleanFile = `uploads/${cleanFile}`;
    }
  }
  const baseUrl = HOST_API ? (HOST_API.endsWith('/') ? HOST_API : `${HOST_API}/`) : 'http://localhost:8080/';
  return `${baseUrl}${cleanFile}`;
};

const getCleanFileName = (path: string) => {
  if (!path) return 'Dokumen';
  const name = path.split('/').pop() || path;
  return /^\d{13}-/.test(name) ? name.substring(14) : name;
};

const getLatestLaporanAkhir = (laporanList?: any[]) => {
  if (!Array.isArray(laporanList) || laporanList.length === 0) return null;
  const withFiles = laporanList.filter((l: any) => Array.isArray(l.files) && l.files.length > 0);
  if (withFiles.length === 0) return null;
  const akhirList = withFiles.filter((l: any) => l.keterangan?.toLowerCase().includes('akhir'));
  const targetList = akhirList.length > 0 ? akhirList : withFiles;
  return [...targetList].sort(
    (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )[0];
};

export default function VpApprovalPage() {
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State untuk alur Approval VP (disimpan di localStorage agar tersinkronisasi)
  const [vpApprovals, setVpApprovals] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('evaluasi_peserta_vp_approvals');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const updateVpApproval = (internProfileId: string, status: string) => {
    setVpApprovals((prev) => {
      const updated = { ...prev, [internProfileId]: status };
      try {
        localStorage.setItem('evaluasi_peserta_vp_approvals', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const getVpStatus = (row: any) => {
    if (row?.evaluation?.certificateUrl) return 'APPROVED';
    return vpApprovals[row?.id] || 'NONE'; // 'NONE' | 'PENDING' | 'APPROVED'
  };

  const handleApproveByVp = (internProfileId: string, internName?: string) => {
    updateVpApproval(internProfileId, 'APPROVED');
    toast.success(`Evaluasi ${internName || 'peserta'} berhasil disetujui! Status telah diteruskan ke Admin untuk penerbitan sertifikat.`);
  };

  const handleRejectByVp = (internProfileId: string, internName?: string) => {
    updateVpApproval(internProfileId, 'REJECTED');
    toast.warning(`Evaluasi ${internName || 'peserta'} telah ditolak / diminta perbaikan.`);
  };

  // Dialog Detail
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);

  const handleOpenDetail = (intern: any) => {
    setSelectedIntern(intern);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedIntern(null);
  };

  const fetchInterns = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/intern-profile');
      setInterns(res.data.results || []);
    } catch (error) {
      console.error('Failed to fetch interns for VP approval:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();

    const interval = setInterval(() => {
      fetchInterns();
    }, 12000);

    const handleFocus = () => fetchInterns();
    window.addEventListener('focus', handleFocus);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'evaluasi_peserta_vp_approvals') {
        try {
          setVpApprovals(e.newValue ? JSON.parse(e.newValue) : {});
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter khusus untuk VP: Hanya menampilkan peserta yang sudah berstatus Selesai dan dilaporkan ke VP (atau sudah diapprove)
  const reportedInterns = useMemo(() => {
    return interns.filter(intern => {
      const hasEvaluation = !!intern.evaluation;
      const laporanAkhir = getLatestLaporanAkhir(intern.Laporan);
      const isLaporanEvaluated = !!laporanAkhir && laporanAkhir.statusFeedback === 'Telah Dievaluasi';
      const isSelesai = hasEvaluation && isLaporanEvaluated;
      const vpStatus = getVpStatus(intern);

      // Hanya peserta yang dilaporkan ke VP (PENDING) atau sudah APPROVED atau berstatus Selesai
      const isRelevantForVp = isSelesai && (vpStatus === 'PENDING' || vpStatus === 'APPROVED' || vpStatus === 'REJECTED');
      if (!isRelevantForVp) return false;

      const matchQuery = intern.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         intern.internId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intern.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         intern.university?.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterStatus === 'All') return matchQuery;
      if (filterStatus === 'Menunggu Approval') return matchQuery && vpStatus === 'PENDING';
      if (filterStatus === 'Disetujui') return matchQuery && vpStatus === 'APPROVED';
      if (filterStatus === 'Ditolak') return matchQuery && vpStatus === 'REJECTED';

      return matchQuery;
    });
  }, [interns, searchQuery, filterStatus, vpApprovals]);

  // Statistik untuk VP
  const pendingCount = interns.filter(i => getVpStatus(i) === 'PENDING').length;
  const approvedCount = interns.filter(i => getVpStatus(i) === 'APPROVED').length;
  const totalReported = pendingCount + approvedCount;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Helmet>
        <title>Approval Evaluasi Peserta (VP) | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #00264d 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:shield-check-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Approval Evaluasi Peserta (VP)</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Persetujuan hasil akhir evaluasi peserta magang sebelum penerbitan sertifikat resmi oleh Admin
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* METRIK STATISTIK */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #F5A623' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(245, 166, 35, 0.1)', color: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Menunggu Approval</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#F5A623', fontWeight: 'bold' }}>{pendingCount}</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Telah Disetujui</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>{approvedCount}</Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:documents-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Total Evaluasi Masuk</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalReported}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* TABEL APPROVAL */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
            <TextField
              size="small"
              placeholder="Cari nama, NIM, atau program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status Approval</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Approval"
              >
                <MenuItem value="All">Semua</MenuItem>
                <MenuItem value="Menunggu Approval">Menunggu Approval</MenuItem>
                <MenuItem value="Disetujui">Disetujui</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell>Peserta</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Instansi</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Mentor Pembimbing</TableCell>
                  <TableCell align="center">Laporan Akhir</TableCell>
                  <TableCell align="center">Nilai Rata-rata</TableCell>
                  <TableCell align="center">Kategori</TableCell>
                  <TableCell>Status Approval</TableCell>
                  <TableCell align="center">Aksi Persetujuan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : reportedInterns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:shield-check-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">
                        Belum ada laporan evaluasi peserta yang menunggu persetujuan VP.
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Evaluasi yang dilaporkan oleh Admin dari halaman Evaluasi Peserta akan muncul di sini.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reportedInterns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const vpStatus = getVpStatus(row);
                    const isApproved = vpStatus === 'APPROVED';

                    const laporanAkhir = getLatestLaporanAkhir(row.Laporan);
                    const hasLaporan = !!laporanAkhir && Array.isArray(laporanAkhir.files) && laporanAkhir.files.length > 0;

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.user?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {row.internId || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.university || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.program || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.mentor?.user?.name || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          {hasLaporan ? (
                            <Chip 
                              label={laporanAkhir?.statusFeedback || 'Menunggu Evaluasi'} 
                              size="small" 
                              color={laporanAkhir?.statusFeedback === 'Telah Dievaluasi' ? 'success' : 'warning'} 
                              variant="outlined" 
                              sx={{ fontWeight: 'bold' }} 
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#004F9F' }}>
                            {row.evaluation?.nilaiRataRata?.toFixed(2) || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.evaluation?.kategori || '-'} 
                            size="small" 
                            color="success" 
                            variant="outlined" 
                            sx={{ fontWeight: 600 }} 
                          />
                        </TableCell>
                        <TableCell>
                          {isApproved ? (
                            <Chip label="Disetujui VP" color="success" size="small" variant="filled" sx={{ fontWeight: 700 }} />
                          ) : (
                            <Chip label="Menunggu Approval VP" color="warning" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenDetail(row)}
                              startIcon={<Iconify icon="solar:eye-bold-duotone" width={16} />}
                              sx={{ fontSize: '0.72rem', py: 0.35, px: 1.2, textTransform: 'none', borderRadius: 1 }}
                            >
                              Rincian
                            </Button>

                            {!isApproved ? (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
                                onClick={() => handleApproveByVp(row.id, row.user?.name)}
                                sx={{ fontSize: '0.72rem', py: 0.35, px: 1.4, textTransform: 'none', borderRadius: 1, fontWeight: 600 }}
                              >
                                Setujui
                              </Button>
                            ) : (
                              <Chip label="Selesai Disetujui" size="small" color="default" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reportedInterns.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* DIALOG DETAIL UNTUK VP */}
        <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
          {selectedIntern && (
            <>
              <DialogTitle sx={{ py: 2.5, px: 3.5, bgcolor: '#004F9F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Iconify icon="solar:shield-check-bold-duotone" sx={{ color: 'white' }} width={26} />
                  <Typography variant="h6" fontWeight={700} color="white">
                    Verifikasi Evaluasi Peserta: {selectedIntern.user?.name}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDetail} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                  <Iconify icon="eva:close-fill" width={22} />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ p: { xs: 2.5, md: 3.5 }, pt: { xs: '32px !important', md: '36px !important' }, bgcolor: '#f8fafc' }}>
                <Grid container spacing={3}>
                  {/* INFORMASI DASAR */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#004F9F" sx={{ mb: 2 }}>
                        Informasi Peserta
                      </Typography>
                      <Stack spacing={1.2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">NIM / ID:</Typography>
                          <Typography variant="body2" fontWeight={600}>{selectedIntern.internId || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Instansi Asal:</Typography>
                          <Typography variant="body2" fontWeight={600}>{selectedIntern.university || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Program Magang:</Typography>
                          <Typography variant="body2" fontWeight={600}>{selectedIntern.program || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Mentor Pembimbing:</Typography>
                          <Typography variant="body2" fontWeight={600}>{selectedIntern.mentor?.user?.name || '-'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Fungsi / Sub Fungsi:</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedIntern.mentor?.fungsi || '-'} / {selectedIntern.mentor?.subFungsi || '-'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* SUMMARY NILAI */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight={600}>
                        Nilai Akhir Rata-rata
                      </Typography>
                      <Typography variant="h2" sx={{ color: '#004F9F', fontWeight: 800, my: 1 }}>
                        {selectedIntern.evaluation?.nilaiRataRata?.toFixed(2) || '-'}
                      </Typography>
                      <Chip label={`Kategori: ${selectedIntern.evaluation?.kategori || '-'}`} color="success" sx={{ fontWeight: 700, px: 1.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
                        Status Approval: <strong>{getVpStatus(selectedIntern) === 'APPROVED' ? 'Disetujui VP' : 'Menunggu Persetujuan'}</strong>
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* STATISTIK PRESENSI PESERTA */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#004F9F" sx={{ mb: 2 }}>
                        Riwayat & Statistik Presensi Peserta
                      </Typography>
                      {(() => {
                        const pList = (selectedIntern.presensi || []).filter((p: any) => {
                          const d = new Date(p.tanggalInput).getDay();
                          return d !== 0 && d !== 6;
                        });
                        const now = new Date();
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        const pHadir = pList.filter((p: any) => p.presensiStatus === 'HADIR' || p.presensiStatus === 'HADIR_TERLAMBAT').length;
                        const pIzinSakit = pList.filter((p: any) => p.presensiStatus === 'IZIN' || p.presensiStatus === 'SAKIT').length;
                        const pAlpha = pList.filter((p: any) => {
                          if (p.presensiStatus !== 'ALPHA') return false;
                          const pDate = new Date(p.tanggalInput);
                          const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
                          if (pStr === todayStr && !p.masuk) return false;
                          return true;
                        }).length;
                        const totalRecorded = pHadir + pIzinSakit + pAlpha;
                        const presenceRate = totalRecorded > 0 ? Math.round((pHadir / totalRecorded) * 100) : 0;

                        return (
                          <Grid container spacing={3} alignItems="center">
                            {/* 3 Kotak Metrik */}
                            <Grid item xs={12} md={5}>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 1.5, bgcolor: 'rgba(34, 197, 94, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>HADIR</Typography>
                                    <Typography variant="h5" sx={{ color: '#16a34a', fontWeight: 800 }}>{pHadir}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 1.5, bgcolor: 'rgba(245, 166, 35, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(245, 166, 35, 0.25)' }}>
                                    <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 700 }}>IZIN/SAKIT</Typography>
                                    <Typography variant="h5" sx={{ color: '#d97706', fontWeight: 800 }}>{pIzinSakit}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                                    <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 700 }}>ALPHA</Typography>
                                    <Typography variant="h5" sx={{ color: '#dc2626', fontWeight: 800 }}>{pAlpha}</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Tingkat Kehadiran & Status Disiplin */}
                            <Grid item xs={12} md={7}>
                              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Tingkat Kehadiran</Typography>
                                    {totalRecorded === 0 ? (
                                      <Chip label="Belum Ada Catatan" size="small" variant="outlined" />
                                    ) : pAlpha === 0 && presenceRate >= 85 ? (
                                      <Chip label="Sangat Disiplin" color="success" size="small" sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }} />
                                    ) : pAlpha === 0 ? (
                                      <Chip label="Cukup Disiplin" color="info" size="small" sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }} />
                                    ) : (
                                      <Chip label="Perlu Perhatian" color="error" size="small" sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }} />
                                    )}
                                  </Box>
                                  <Typography variant="h6" fontWeight={800} sx={{ color: presenceRate >= 80 ? '#16a34a' : presenceRate >= 60 ? '#f59e0b' : '#ef4444' }}>
                                    {presenceRate}%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={presenceRate} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4, 
                                    bgcolor: '#e2e8f0', 
                                    mb: 1,
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: presenceRate >= 80 ? '#16a34a' : presenceRate >= 60 ? '#f59e0b' : '#ef4444',
                                      borderRadius: 4
                                    } 
                                  }} 
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Total Presensi: <strong>{totalRecorded} hari kerja tercatat</strong> ({pHadir} Hadir, {pIzinSakit} Izin/Sakit, {pAlpha} Alpha)
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        );
                      })()}
                    </Paper>
                  </Grid>

                  {/* DETAIL 7 ASPEK PENILAIAN */}
                  {selectedIntern.evaluation && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle1" fontWeight={700} color="#004F9F" sx={{ mb: 2 }}>
                          Rincian 7 Aspek Penilaian Mentor
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { label: 'Integritas & Etika', value: selectedIntern.evaluation.integritas },
                            { label: 'Ketepatan Waktu', value: selectedIntern.evaluation.ketepatanWaktu },
                            { label: 'Keahlian Bidang', value: selectedIntern.evaluation.keahlian },
                            { label: 'Kerjasama Tim', value: selectedIntern.evaluation.kerjasama },
                            { label: 'Komunikasi', value: selectedIntern.evaluation.komunikasi },
                            { label: 'Penggunaan Teknologi', value: selectedIntern.evaluation.penggunaanTI },
                            { label: 'Pengembangan Diri', value: selectedIntern.evaluation.pengembanganDiri },
                          ].map((item, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx}>
                              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                <Typography variant="h6" fontWeight={700} color="#004F9F">{item.value}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {selectedIntern.evaluation.catatan && (
                          <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, borderLeft: '4px solid #004F9F' }}>
                            <Typography variant="caption" fontWeight={700} color="#004F9F" textTransform="uppercase">
                              Catatan Rekomendasi Mentor:
                            </Typography>
                            <Typography variant="body2" fontStyle="italic" color="text.primary" sx={{ mt: 0.5 }}>
                              "{selectedIntern.evaluation.catatan}"
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  {/* RIWAYAT LAPORAN AKHIR */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#004F9F" sx={{ mb: 2 }}>
                        Dokumen Laporan Akhir Peserta
                      </Typography>
                      {(() => {
                        const latestLaporan = getLatestLaporanAkhir(selectedIntern.Laporan);
                        const files = Array.isArray(latestLaporan?.files) ? latestLaporan.files : [];

                        if (!latestLaporan || files.length === 0) {
                          return <Typography variant="body2" color="text.secondary">Tidak ada laporan akhir yang diunggah.</Typography>;
                        }

                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Dokumen laporan akhir versi terbaru yang diajukan untuk verifikasi kelulusan
                              </Typography>
                              <Chip 
                                icon={<Iconify icon="solar:folder-with-files-bold-duotone" width={16} />}
                                label={`${files.length} File Terlampir`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700, bgcolor: '#004F9F' }}
                              />
                            </Box>

                            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600, width: 130 }}>Tanggal Unggah</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: 200 }}>Keterangan</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: 140 }}>Status Review</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Daftar File Laporan Terbaru ({files.length} File)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow hover sx={{ verticalAlign: 'top' }}>
                                    <TableCell sx={{ py: 1.5, color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                      {latestLaporan.createdAt ? fDate(latestLaporan.createdAt) : '-'}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Typography variant="body2" fontWeight={600} color="text.primary">
                                        {latestLaporan.keterangan || 'Laporan Akhir'}
                                      </Typography>
                                      {latestLaporan.komentar && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                          Catatan Mentor: "{latestLaporan.komentar}"
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Chip 
                                        label={latestLaporan.statusFeedback || 'Menunggu Evaluasi'} 
                                        size="small" 
                                        color={latestLaporan.statusFeedback === 'Telah Dievaluasi' ? 'success' : 'warning'} 
                                        variant={latestLaporan.statusFeedback === 'Telah Dievaluasi' ? 'filled' : 'outlined'}
                                        sx={{ fontWeight: 600 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                      <Stack spacing={1}>
                                        {files.map((file: string, fIdx: number) => {
                                          const fileName = getCleanFileName(file);
                                          return (
                                            <Box
                                              key={fIdx}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 1.5,
                                                p: 1,
                                                bgcolor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 1.5,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                  bgcolor: 'rgba(0, 79, 159, 0.04)',
                                                  borderColor: '#004F9F',
                                                }
                                              }}
                                            >
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                                                <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: 'rgba(0, 79, 159, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                  <Iconify icon="solar:file-text-bold-duotone" width={15} sx={{ color: '#004F9F' }} />
                                                </Box>
                                                <Typography
                                                  variant="body2"
                                                  fontWeight={600}
                                                  sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    color: 'text.primary',
                                                    fontSize: '0.8rem'
                                                  }}
                                                  title={fileName}
                                                >
                                                  {fileName}
                                                </Typography>
                                              </Box>
                                              <Button
                                                size="small"
                                                variant="contained"
                                                component="a"
                                                href={getFileUrl(file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                startIcon={<Iconify icon="solar:eye-bold" width={13} />}
                                                sx={{
                                                  bgcolor: '#004F9F',
                                                  '&:hover': { bgcolor: '#003366' },
                                                  fontSize: '0.72rem',
                                                  py: 0.35,
                                                  px: 1.2,
                                                  textTransform: 'none',
                                                  borderRadius: 1,
                                                  boxShadow: 'none',
                                                  whiteSpace: 'nowrap',
                                                  flexShrink: 0
                                                }}
                                              >
                                                Buka
                                              </Button>
                                            </Box>
                                          );
                                        })}
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </>
                        );
                      })()}
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ py: 2, px: 3.5, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Button onClick={handleCloseDetail} variant="outlined" color="inherit">
                  Tutup
                </Button>
                {getVpStatus(selectedIntern) !== 'APPROVED' ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Iconify icon="solar:check-circle-bold" />}
                    onClick={() => {
                      handleApproveByVp(selectedIntern.id, selectedIntern.user?.name);
                      handleCloseDetail();
                    }}
                    sx={{ px: 3, fontWeight: 700 }}
                  >
                    Setujui Evaluasi Ini
                  </Button>
                ) : (
                  <Chip label="Telah Disetujui oleh VP" color="success" sx={{ fontWeight: 700 }} />
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
}
