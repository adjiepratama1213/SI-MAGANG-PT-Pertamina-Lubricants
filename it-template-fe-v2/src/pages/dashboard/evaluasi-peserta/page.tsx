import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  LinearProgress, Stack, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Paper, InputAdornment
} from '@mui/material';
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import axiosInstance from 'src/utils/axios';
import { HOST_API } from 'src/config-global';
import { toast } from 'react-toastify';
import { fDate } from 'src/utils/format-time';
import { exportEvaluasiPesertaPdf } from 'src/utils/export-pdf';

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

export default function EvaluasiPesertaPage() {
  const [interns, setInterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterStatusPeserta, setFilterStatusPeserta] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Helper cek keaktifan peserta magang
  const isInternActive = (intern: any) => {
    if (!intern) return false;
    const userStatus = (intern.user?.status || '').toLowerCase();
    if (userStatus && userStatus !== 'active') return false;
    if (intern.endDate) {
      const end = new Date(intern.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date() > end) return false;
    }
    return true;
  };

  // State untuk alur Approval VP (disimpan di localStorage agar tetap persisten)
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

  const handleReportToVp = (internProfileId: string, internName?: string) => {
    updateVpApproval(internProfileId, 'PENDING');
    toast.info(`Evaluasi ${internName || 'peserta'} telah dilaporkan ke VP untuk approval.`);
    if (selectedIntern && selectedIntern.id === internProfileId) {
      setSelectedIntern((prev: any) => ({ ...prev }));
    }
  };

  // State dialog upload sertifikat
  const [openUploadCert, setOpenUploadCert] = useState(false);
  const [targetInternCert, setTargetInternCert] = useState<any>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  const handleOpenUploadCert = (intern: any) => {
    setTargetInternCert(intern);
    setCertFile(null);
    setOpenUploadCert(true);
  };

  const handleCloseUploadCert = () => {
    setOpenUploadCert(false);
    setCertFile(null);
    setTargetInternCert(null);
  };

  const handleUploadCertificate = async () => {
    if (!certFile || !targetInternCert) {
      toast.warning('Silakan pilih file sertifikat terlebih dahulu!');
      return;
    }
    try {
      setUploadingCert(true);
      const formData = new FormData();
      formData.append('file', certFile);
      await axiosInstance.post(`/intern-profile/${targetInternCert.id}/certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Sertifikat berhasil diunggah untuk ${targetInternCert.user?.name || 'peserta'}!`);
      updateVpApproval(targetInternCert.id, 'APPROVED');
      handleCloseUploadCert();
      const updatedList = await fetchInterns();

      if (selectedIntern && selectedIntern.id === targetInternCert.id) {
        const updated = updatedList.find((i: any) => i.id === targetInternCert.id);
        if (updated) setSelectedIntern(updated);
      }
    } catch (error: any) {
      console.error('Failed to upload certificate:', error);
      toast.error(error?.response?.data?.message || 'Gagal mengunggah sertifikat');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
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
      const list = res.data.results || [];
      setInterns(list);
      return list;
    } catch (error) {
      console.error('Failed to fetch interns:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();

    const interval = setInterval(() => {
      fetchInterns();
    }, 10000);

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

  // Seluruh peserta yang memiliki mentor (termasuk yang masa durasi magangnya telah selesai)
  const allMentoredInterns = useMemo(() => {
    return interns.filter(intern => !!intern.mentorProfileId);
  }, [interns]);

  const filteredInterns = useMemo(() => {
    return allMentoredInterns.filter(intern => {
      const isAktif = isInternActive(intern);
      if (filterStatusPeserta === 'active' && !isAktif) return false;
      if (filterStatusPeserta === 'inactive' && isAktif) return false;

      const matchQuery = 
        (intern.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (intern.internId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (intern.program || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (intern.university || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const hasEvaluation = !!intern.evaluation;
      const laporanAkhir = getLatestLaporanAkhir(intern.Laporan);
      const isLaporanEvaluated = !!laporanAkhir && laporanAkhir.statusFeedback === 'Telah Dievaluasi';
      const isSelesai = hasEvaluation && isLaporanEvaluated;
      
      if (filterStatus === 'All') return matchQuery;
      if (filterStatus === 'Selesai' || filterStatus === 'Sudah Dinilai') return matchQuery && isSelesai;
      if (filterStatus === 'Belum Selesai' || filterStatus === 'Belum Dinilai') return matchQuery && !isSelesai;
      
      return matchQuery;
    }).sort((a, b) => {
      const aActive = isInternActive(a) ? 1 : 0;
      const bActive = isInternActive(b) ? 1 : 0;
      return bActive - aActive;
    });
  }, [allMentoredInterns, searchQuery, filterStatus, filterStatusPeserta]);

  // Statistik
  const totalPeserta = allMentoredInterns.length;
  const selesaiCount = allMentoredInterns.filter(intern => {
    const hasEval = !!intern.evaluation;
    const lap = getLatestLaporanAkhir(intern.Laporan);
    return hasEval && lap?.statusFeedback === 'Telah Dievaluasi';
  }).length;
  const belumSelesaiCount = totalPeserta - selesaiCount;

  return (
    <>
      <Helmet>
        <title> Evaluasi Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <DashboardBreadcrumbs current="Evaluasi Peserta" />

        <Box sx={{ p: 4, mb: 3, borderRadius: 2.5, background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:clipboard-list-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Evaluasi Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Rekap laporan akhir dan penilaian seluruh peserta magang</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => exportEvaluasiPesertaPdf(filteredInterns)}
              sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}
            >
              <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Data Evaluasi Peserta
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #004F9F', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Total Peserta</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalPeserta}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #16A34A', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Selesai</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#16A34A', fontWeight: 'bold' }}>{selesaiCount}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #EE2E24', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(238, 46, 36, 0.1)', color: '#EE2E24', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Belum Selesai</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#EE2E24', fontWeight: 'bold' }}>{belumSelesaiCount}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Cari peserta (Nama/ID Peserta/Program/Instansi)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status Peserta</InputLabel>
              <Select
                value={filterStatusPeserta}
                onChange={(e) => { setFilterStatusPeserta(e.target.value as any); setPage(0); }}
                label="Status Peserta"
              >
                <MenuItem value="all">Semua Status Peserta</MenuItem>
                <MenuItem value="active">Peserta Aktif</MenuItem>
                <MenuItem value="inactive">Peserta Tidak Aktif (Selesai)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status Evaluasi</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                label="Status Evaluasi"
              >
                <MenuItem value="All">Semua Evaluasi</MenuItem>
                <MenuItem value="Selesai">Selesai</MenuItem>
                <MenuItem value="Belum Selesai">Belum Selesai</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setFilterStatusPeserta('all');
                setFilterStatus('All');
                setSearchQuery('');
                setPage(0);
              }}
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
          </Stack>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Peserta</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Program & Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Hadir</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Izin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Alpha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Laporan Akhir</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Nilai</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Kategori</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Approval VP</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredInterns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:clipboard-remove-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Tidak ada data evaluasi peserta ditemukan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const hasEvaluation = !!row.evaluation;
                    
                    // Hitung Presensi (Hari Kerja Senin - Jumat, tanpa Alfa prematur hari ini)
                    const presensi = (row.presensi || []).filter((p: any) => {
                      const d = new Date(p.tanggalInput).getDay();
                      return d !== 0 && d !== 6;
                    });
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    const hadir = presensi.filter((p: any) => p.presensiStatus === 'HADIR' || p.presensiStatus === 'HADIR_TERLAMBAT').length;
                    const izin = presensi.filter((p: any) => p.presensiStatus === 'IZIN').length;
                    const sakit = presensi.filter((p: any) => p.presensiStatus === 'SAKIT').length;
                    const alpha = presensi.filter((p: any) => {
                      if (p.presensiStatus !== 'ALPHA') return false;
                      const pDate = new Date(p.tanggalInput);
                      const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
                      if (pStr === todayStr && !p.masuk && now.getHours() < 17) return false;
                      return true;
                    }).length;
                    
                    // Mengambil laporan akhir versi paling baru (revisi terbaru)
                    const laporanAkhir = getLatestLaporanAkhir(row.Laporan);
                    const hasLaporan = !!laporanAkhir && Array.isArray(laporanAkhir.files) && laporanAkhir.files.length > 0;
                    const isLaporanEvaluated = hasLaporan && laporanAkhir.statusFeedback === 'Telah Dievaluasi';
                    const isSelesai = hasEvaluation && isLaporanEvaluated;
                    const vpStatus = getVpStatus(row);
                    const hasCertificate = !!row.evaluation?.certificateUrl;
                    
                    const isRowActive = isInternActive(row);

                    return (
                      <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                        <TableCell>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold">{row.user?.name || '-'}</Typography>
                              <Chip
                                label={isRowActive ? 'Aktif' : 'Tidak Aktif'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  bgcolor: isRowActive ? '#DCFCE7' : '#FEE2E2',
                                  color: isRowActive ? '#16A34A' : '#DC2626',
                                }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">{row.internId || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">{row.program || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{row.university || '-'}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={hadir}
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 44,
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
                            label={izin + sakit}
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 44,
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
                            label={alpha}
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 44,
                              bgcolor: '#FFFFFF',
                              color: '#EE2E24',
                              borderColor: '#EE2E24',
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
                          {hasLaporan ? (
                            <Chip
                              size="small"
                              label={laporanAkhir?.statusFeedback || 'Menunggu Evaluasi'}
                              variant="outlined"
                              sx={{
                                minWidth: 90,
                                bgcolor: '#FFFFFF',
                                borderColor: laporanAkhir?.statusFeedback === 'Telah Dievaluasi' ? '#16A34A' : '#F59E0B',
                                color: laporanAkhir?.statusFeedback === 'Telah Dievaluasi' ? '#16A34A' : '#F59E0B',
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
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {hasEvaluation ? row.evaluation.nilaiRataRata?.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {hasEvaluation ? (row.evaluation.kategori || '-') : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={isSelesai ? 'Selesai' : 'Belum Selesai'} 
                            size="small" 
                            variant="outlined" 
                            sx={{
                              minWidth: 90,
                              bgcolor: '#FFFFFF',
                              borderColor: isSelesai ? '#16A34A' : '#EC2028',
                              color: isSelesai ? '#16A34A' : '#EC2028',
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
                          {!isSelesai ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : vpStatus === 'APPROVED' || hasCertificate ? (
                            <Chip
                              label="Disetujui VP"
                              size="small"
                              variant="outlined"
                              sx={{
                                minWidth: 90,
                                bgcolor: '#FFFFFF',
                                borderColor: '#16A34A',
                                color: '#16A34A',
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
                          ) : vpStatus === 'PENDING' ? (
                            <Chip
                              label="Menunggu Approval"
                              size="small"
                              variant="outlined"
                              sx={{
                                minWidth: 90,
                                bgcolor: '#FFFFFF',
                                borderColor: '#F59E0B',
                                color: '#F59E0B',
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
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => handleReportToVp(row.id, row.user?.name)}
                              startIcon={<Iconify icon="solar:letter-bold" width={14} />}
                              sx={{ fontSize: '0.75rem', py: 0.3, px: 1.2, textTransform: 'none', borderRadius: 1, fontWeight: 'bold' }}
                            >
                              Ajukan ke VP
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }}
                            onClick={() => handleOpenDetail(row)}
                            title="Detail Evaluasi & Sertifikat"
                          >
                            <Iconify icon="solar:eye-bold-duotone" width={18} />
                          </IconButton>
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
            count={filteredInterns.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* DIALOG DETAIL PESERTA */}
        <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="lg" fullWidth>
          {selectedIntern && (
            <>
              <DialogTitle sx={{ py: 2.5, px: 3.5, bgcolor: '#004F9F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ color: 'white' }} width={26} />
                  <Typography variant="h6" fontWeight={700} color="white">
                    Detail Evaluasi Peserta: {selectedIntern.user?.name}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDetail} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                  <Iconify icon="eva:close-fill" width={22} />
                </IconButton>
              </DialogTitle>
              
              <DialogContent sx={{ p: { xs: 2.5, md: 3.5 }, pt: { xs: '32px !important', md: '36px !important' }, bgcolor: '#f8fafc' }}>
                <Grid container spacing={3}>
                  {/* Bagian 1: Informasi Dasar (Layout Ke Samping) */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3.5, borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      <Typography variant="h6" sx={{ mb: 2.5, color: '#004F9F', fontWeight: 700, letterSpacing: -0.2 }}>
                        Informasi Dasar
                      </Typography>
                      
                      <Grid container spacing={3.5}>
                        {/* Kolom 1: Data Diri & Akademis */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ pb: 1, borderBottom: '2px solid rgba(0, 79, 159, 0.12)', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#004F9F', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              Data Diri & Akademis
                            </Typography>
                          </Box>

                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Nama Lengkap</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.user?.name || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>NIM / ID</Typography>
                              <Typography variant="body2" fontWeight={600}>{selectedIntern.internId || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Jenis Kelamin</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">
                                {selectedIntern.gender === 'PRIA' || selectedIntern.gender === 'Laki-laki' || selectedIntern.gender === 'Pria'
                                  ? 'Laki-laki'
                                  : selectedIntern.gender === 'WANITA' || selectedIntern.gender === 'Perempuan' || selectedIntern.gender === 'Wanita'
                                  ? 'Perempuan'
                                  : (selectedIntern.gender || '-')}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Tanggal Lahir</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.dateOfBirth ? fDate(selectedIntern.dateOfBirth) : '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>No. Telepon</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.user?.phone || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Email</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.user?.email || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Instansi</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.university || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Jurusan</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.major || '-'}</Typography>
                            </Box>
                          </Stack>
                        </Grid>

                        {/* Kolom 2: Penempatan Magang & Rekening */}
                        <Grid item xs={12} md={6}>
                          <Box sx={{ pb: 1, borderBottom: '2px solid rgba(0, 79, 159, 0.12)', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#004F9F', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                              Penempatan & Magang
                            </Typography>
                          </Box>

                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Program</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.program || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Periode Magang</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">
                                {selectedIntern.startDate && selectedIntern.endDate
                                  ? `${fDate(selectedIntern.startDate)} - ${fDate(selectedIntern.endDate)}`
                                  : (selectedIntern.startDate ? fDate(selectedIntern.startDate) : '-')}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Status Peserta</Typography>
                              <Chip 
                                label={isInternActive(selectedIntern) ? 'Aktif' : 'Tidak Aktif'} 
                                size="small" 
                                variant="outlined"
                                sx={{
                                  minWidth: 80,
                                  bgcolor: '#FFFFFF',
                                  borderColor: isInternActive(selectedIntern) ? '#16A34A' : '#EC2028',
                                  color: isInternActive(selectedIntern) ? '#16A34A' : '#EC2028',
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
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Mentor</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.mentor?.user?.name || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Direktorat</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.mentor?.direktorat || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Fungsi</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.mentor?.fungsi || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Sub Fungsi</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.mentor?.subFungsi || '-'}</Typography>
                            </Box>

                            {/* Sub-Header: Informasi Rekening */}
                            <Box sx={{ pt: 1, pb: 0.5, borderBottom: '2px solid rgba(0, 79, 159, 0.12)', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#004F9F', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Informasi Rekening
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Bank</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.bankName || '-'}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.65 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight={500}>Nomor Rekening</Typography>
                              <Typography variant="body2" fontWeight={600} textAlign="right">{selectedIntern.bankAccount || '-'}</Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Bagian 2: Statistik Presensi (Di Bawah Informasi Dasar - Layout Ke Samping) */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3.5, borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      <Typography variant="h6" sx={{ mb: 2.5, color: '#004F9F', fontWeight: 700, letterSpacing: -0.2 }}>
                        Riwayat Presensi
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
                          if (pStr === todayStr && !p.masuk && now.getHours() < 17) return false;
                          return true;
                        }).length;
                        const totalRecorded = pHadir + pIzinSakit + pAlpha;
                        const presenceRate = totalRecorded > 0 ? Math.round((pHadir / totalRecorded) * 100) : 0;
                        
                        return (
                          <Grid container spacing={3} alignItems="center">
                            {/* 3 Kotak Metrik (Kiri) */}
                            <Grid item xs={12} md={5}>
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'rgba(140, 198, 63, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(140, 198, 63, 0.25)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Iconify icon="solar:check-circle-bold-duotone" sx={{ color: '#8CC63F' }} width={18} />
                                      <Typography variant="caption" sx={{ color: '#558B2F', fontWeight: 700, letterSpacing: 0.5 }}>HADIR</Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ color: '#689F38', fontWeight: 800 }}>{pHadir}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'rgba(245, 166, 35, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(245, 166, 35, 0.25)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Iconify icon="solar:clock-circle-bold-duotone" sx={{ color: '#F5A623' }} width={18} />
                                      <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, letterSpacing: 0.5 }}>IZIN / SAKIT</Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ color: '#D97706', fontWeight: 800 }}>{pIzinSakit}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ p: 2, bgcolor: 'rgba(255, 59, 48, 0.08)', borderRadius: 2, textAlign: 'center', border: '1px solid rgba(255, 59, 48, 0.25)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Iconify icon="solar:close-circle-bold-duotone" sx={{ color: '#FF3B30' }} width={18} />
                                      <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, letterSpacing: 0.5 }}>ALPHA</Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ color: '#DC2626', fontWeight: 800 }}>{pAlpha}</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Grid>

                            {/* Tingkat Kehadiran & Status Disiplin (Kanan) */}
                            <Grid item xs={12} md={7}>
                              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
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
                                  <Typography variant="h6" fontWeight={800} sx={{ color: presenceRate >= 80 ? '#8CC63F' : presenceRate >= 60 ? '#F5A623' : '#FF3B30' }}>
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
                                    mb: 1.5,
                                    '& .MuiLinearProgress-bar': { 
                                      bgcolor: presenceRate >= 80 ? '#8CC63F' : presenceRate >= 60 ? '#F5A623' : '#FF3B30',
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

                  {/* Bagian 3: Detail Penilaian */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3.5, borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      <Typography variant="h6" sx={{ mb: 2.5, color: '#004F9F', fontWeight: 700, letterSpacing: -0.2 }}>
                        Detail Penilaian Mentor
                      </Typography>
                      
                      {selectedIntern.evaluation ? (
                        <Grid container spacing={4} alignItems="center">
                          <Grid item xs={12} md={7}>
                            <Stack spacing={1.5}>
                              {[
                                { label: 'Integritas', value: selectedIntern.evaluation.integritas },
                                { label: 'Ketepatan Waktu', value: selectedIntern.evaluation.ketepatanWaktu },
                                { label: 'Keahlian', value: selectedIntern.evaluation.keahlian },
                                { label: 'Kerjasama', value: selectedIntern.evaluation.kerjasama },
                                { label: 'Komunikasi', value: selectedIntern.evaluation.komunikasi },
                                { label: 'Penggunaan TI', value: selectedIntern.evaluation.penggunaanTI },
                                { label: 'Pengembangan Diri', value: selectedIntern.evaluation.pengembanganDiri },
                              ].map((item, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', py: 0.75 }}>
                                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={Math.min(100, item.value || 0)} 
                                      sx={{ 
                                        width: { xs: 80, sm: 120 }, 
                                        height: 6, 
                                        borderRadius: 3, 
                                        bgcolor: '#f1f5f9', 
                                        '& .MuiLinearProgress-bar': { bgcolor: '#004F9F', borderRadius: 3 } 
                                      }} 
                                    />
                                    <Typography variant="subtitle2" fontWeight={700} color="#004F9F" sx={{ minWidth: 32, textAlign: 'right' }}>
                                      {item.value}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>

                            {selectedIntern.evaluation.catatan && (
                              <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2, borderLeft: '4px solid #004F9F' }}>
                                <Typography variant="caption" fontWeight={700} color="#004F9F" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                  Catatan Mentor:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  "{selectedIntern.evaluation.catatan}"
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <Box sx={{ p: 4, bgcolor: 'rgba(0, 79, 159, 0.04)', borderRadius: 3, textAlign: 'center', border: '1px solid rgba(0, 79, 159, 0.12)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                Nilai Rata-rata
                              </Typography>
                              <Typography variant="h2" sx={{ color: '#004F9F', mb: 1.5, fontWeight: 800 }}>
                                {selectedIntern.evaluation.nilaiRataRata?.toFixed(2)}
                              </Typography>
                              <Box>
                                <Chip label={selectedIntern.evaluation.kategori || 'Selesai'} color="success" size="medium" sx={{ fontWeight: 700, px: 2, py: 2.2, fontSize: '0.95rem' }} />
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                          <Iconify icon="solar:clipboard-remove-bold-duotone" sx={{ color: 'text.disabled', mb: 1 }} width={44} />
                          <Typography variant="body2" color="text.secondary">
                            Mentor belum memberikan penilaian untuk peserta ini.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Bagian 4: Laporan Akhir */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3.5, borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      {(() => {
                        const latestLaporan = getLatestLaporanAkhir(selectedIntern.Laporan);
                        const files = Array.isArray(latestLaporan?.files) ? latestLaporan.files : [];

                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                              <Box>
                                <Typography variant="h6" sx={{ color: '#004F9F', fontWeight: 700, letterSpacing: -0.2 }}>
                                  Dokumen Laporan Akhir (Terbaru)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Berkas laporan akhir versi terbaru yang diajukan oleh peserta
                                </Typography>
                              </Box>
                              {latestLaporan && files.length > 0 && (
                                <Chip 
                                  icon={<Iconify icon="solar:folder-with-files-bold-duotone" width={16} />}
                                  label={`${files.length} File Terlampir`} 
                                  size="small" 
                                  color="primary"
                                  sx={{ fontWeight: 700, bgcolor: '#004F9F' }} 
                                />
                              )}
                            </Box>

                            {latestLaporan && files.length > 0 ? (
                              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                <Table size="medium">
                                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5, width: 140 }}>Tanggal Unggah</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5, width: 220 }}>Keterangan</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5, width: 160 }}>Status Review</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Berkas Laporan Terbaru ({files.length} File)</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow hover sx={{ verticalAlign: 'top' }}>
                                      <TableCell sx={{ py: 2, color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                        {latestLaporan.createdAt ? fDate(latestLaporan.createdAt) : '-'}
                                      </TableCell>
                                      <TableCell sx={{ py: 2 }}>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                          {latestLaporan.keterangan || 'Laporan Akhir'}
                                        </Typography>
                                        {latestLaporan.komentar && (
                                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                            Catatan Mentor: "{latestLaporan.komentar}"
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell sx={{ py: 2 }}>
                                        <Chip 
                                          label={latestLaporan.statusFeedback || 'Menunggu Evaluasi'} 
                                          size="small" 
                                          variant="outlined"
                                          sx={{
                                            minWidth: 90,
                                            bgcolor: '#FFFFFF',
                                            borderColor: latestLaporan.statusFeedback === 'Telah Dievaluasi' ? '#16A34A' : '#F59E0B',
                                            color: latestLaporan.statusFeedback === 'Telah Dievaluasi' ? '#16A34A' : '#F59E0B',
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
                                      <TableCell sx={{ py: 2 }}>
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
                                                  p: 1.2,
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
                                                  <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'rgba(0, 79, 159, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Iconify icon="solar:file-text-bold-duotone" width={16} sx={{ color: '#004F9F' }} />
                                                  </Box>
                                                  <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                      color: 'text.primary',
                                                      fontSize: '0.82rem'
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
                                                  startIcon={<Iconify icon="solar:eye-bold" width={14} />}
                                                  sx={{
                                                    bgcolor: '#004F9F',
                                                    '&:hover': { bgcolor: '#003366' },
                                                    fontSize: '0.72rem',
                                                    py: 0.4,
                                                    px: 1.5,
                                                    textTransform: 'none',
                                                    borderRadius: 1,
                                                    boxShadow: 'none',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                  }}
                                                >
                                                  Buka File
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
                            ) : (
                              <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                                <Iconify icon="solar:document-text-bold-duotone" sx={{ color: 'text.disabled', mb: 1 }} width={44} />
                                <Typography variant="body2" color="text.secondary">
                                  Peserta belum mengunggah Laporan Akhir.
                                </Typography>
                              </Box>
                            )}
                          </>
                        );
                      })()}
                    </Paper>
                  </Grid>

                  {/* Bagian 5: Persetujuan VP & Sertifikat Magang */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3.5, borderRadius: 2.5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#004F9F', fontWeight: 700, letterSpacing: -0.2 }}>
                            Persetujuan VP & Sertifikat Magang
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pengajuan approval kelulusan ke VP dan penerbitan sertifikat resmi
                          </Typography>
                        </Box>
                      </Box>

                      {(() => {
                        const selHasEval = !!selectedIntern.evaluation;
                        const selLap = getLatestLaporanAkhir(selectedIntern.Laporan);
                        const selIsLapEvaluated = !!selLap && selLap.statusFeedback === 'Telah Dievaluasi';
                        const selIsSelesai = selHasEval && selIsLapEvaluated;
                        const selVpStatus = getVpStatus(selectedIntern);
                        const selHasCert = !!selectedIntern.evaluation?.certificateUrl;

                        // Case 1: Sertifikat sudah diterbitkan
                        if (selHasCert) {
                          return (
                            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#15803d' }}>
                                        Sertifikat Magang Resmi Telah Diterbitkan
                                      </Typography>
                                      <Chip label="Aktif" color="success" size="small" sx={{ fontWeight: 700, height: 20 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Dokumen sertifikat telah diunggah dan terhubung ke profil peserta magang. Peserta dapat melihat sertifikat ini dari dashboard mereka.
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                                    <Button
                                      variant="contained"
                                      color="success"
                                      component="a"
                                      href={getFileUrl(selectedIntern.evaluation?.certificateUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
                                    >
                                      Lihat Sertifikat
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      onClick={() => handleOpenUploadCert(selectedIntern)}
                                      sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5 }}
                                    >
                                      Ganti File
                                    </Button>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          );
                        }

                        // Case 2: Sudah disetujui VP, siap upload sertifikat
                        if (selVpStatus === 'APPROVED') {
                          return (
                            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0, 79, 159, 0.05)', border: '1px solid rgba(0, 79, 159, 0.25)' }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004F9F' }}>
                                        Disetujui oleh Vice President (VP)
                                      </Typography>
                                      <Chip label="Disetujui" color="info" size="small" sx={{ fontWeight: 700, height: 20 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Hasil evaluasi peserta telah disetujui oleh VP. Silakan unggah dokumen sertifikat resmi untuk peserta ini.
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                    <Button
                                      variant="contained"
                                      onClick={() => handleOpenUploadCert(selectedIntern)}
                                      sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, fontWeight: 700, textTransform: 'none', borderRadius: 1.5, py: 1, px: 2.5, boxShadow: 'none' }}
                                    >
                                      Upload Sertifikat Magang
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          );
                        }

                        // Case 3: Menunggu Approval VP
                        if (selVpStatus === 'PENDING') {
                          return (
                            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(245, 166, 35, 0.08)', border: '1px solid rgba(245, 166, 35, 0.3)' }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#b45309' }}>
                                    Menunggu Persetujuan Vice President (VP)
                                  </Typography>
                                  <Chip label="Pending Approval" color="warning" size="small" variant="filled" sx={{ fontWeight: 700, height: 20 }} />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  Permohonan penerbitan sertifikat telah diajukan ke VP. Menu upload sertifikat akan terbuka otomatis begitu VP menyetujui evaluasi ini.
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }

                        // Case 4: Status Selesai, Belum Diajukan ke VP (Solusi Poin 5)
                        if (selIsSelesai) {
                          return (
                            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0, 79, 159, 0.04)', border: '1px solid rgba(0, 79, 159, 0.2)' }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#004F9F' }}>
                                        Evaluasi Selesai — Siap Diajukan ke VP
                                      </Typography>
                                      <Chip label="Siap Diajukan" color="success" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Seluruh kriteria penilaian mentor dan laporan akhir peserta telah selesai. Silakan ajukan ke Vice President untuk mendapatkan approval penerbitan sertifikat.
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={() => handleReportToVp(selectedIntern.id, selectedIntern.user?.name)}
                                      sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, fontWeight: 700, textTransform: 'none', borderRadius: 1.5, py: 1, px: 2.5, boxShadow: 'none' }}
                                    >
                                      Ajukan Approval ke VP
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          );
                        }

                        // Case 5: Belum Selesai
                        return (
                          <Box sx={{ p: 3, borderRadius: 2, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                                Evaluasi Belum Lengkap
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Penerbitan sertifikat dan permohonan ke VP hanya dapat diajukan setelah kedua syarat di bawah terpenuhi:
                              </Typography>
                              <Stack spacing={0.75}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Iconify
                                    icon={selHasEval ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                                    sx={{ color: selHasEval ? 'success.main' : 'text.disabled' }}
                                    width={18}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: selHasEval ? 600 : 400, color: selHasEval ? 'text.primary' : 'text.secondary' }}>
                                    Penilaian Mentor: {selHasEval ? 'Sudah dinilai (Selesai)' : 'Belum diisi mentor'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Iconify
                                    icon={selIsLapEvaluated ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                                    sx={{ color: selIsLapEvaluated ? 'success.main' : 'text.disabled' }}
                                    width={18}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: selIsLapEvaluated ? 600 : 400, color: selIsLapEvaluated ? 'text.primary' : 'text.secondary' }}>
                                    Laporan Akhir: {selIsLapEvaluated ? 'Telah Dievaluasi (Selesai)' : selLap ? `Status: ${selLap.statusFeedback || 'Menunggu Evaluasi'}` : 'Belum diunggah'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Box>
                        );
                      })()}
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ py: 2, px: 3.5, borderTop: '1px solid #e2e8f0', bgcolor: 'white', display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  {(() => {
                    const selHasEval = !!selectedIntern.evaluation;
                    let selLap = selectedIntern.Laporan?.find((l: any) => l.files?.length > 0 && l.keterangan?.toLowerCase().includes('akhir'));
                    if (!selLap && selectedIntern.Laporan?.length > 0) {
                      selLap = selectedIntern.Laporan.filter((l: any) => l.files?.length > 0).pop();
                    }
                    const selIsLapEvaluated = !!selLap && selLap.statusFeedback === 'Telah Dievaluasi';
                    const selIsSelesai = selHasEval && selIsLapEvaluated;
                    const selVpStatus = getVpStatus(selectedIntern);

                    if (selIsSelesai && selVpStatus === 'NONE') {
                      return (
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleReportToVp(selectedIntern.id, selectedIntern.user?.name)}
                          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                        >
                          Ajukan Approval ke VP
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Button 
                  onClick={handleCloseDetail} 
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

        {/* DIALOG UPLOAD SERTIFIKAT */}
        <Dialog open={openUploadCert} onClose={handleCloseUploadCert} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ py: 2.5, px: 3.5, bgcolor: '#004F9F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Iconify icon="solar:diploma-bold" sx={{ color: 'white' }} width={24} />
              <Typography variant="h6" fontWeight={700} color="white">
                {targetInternCert?.evaluation?.certificateUrl ? 'Ganti Sertifikat Magang' : 'Upload Sertifikat Magang'}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseUploadCert} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
              <Iconify icon="eva:close-fill" width={22} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3.5, pt: '28px !important' }}>
            {targetInternCert && (
              <Stack spacing={2.5}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" fontWeight={700}>{targetInternCert.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">ID: {targetInternCert.internId} | Program: {targetInternCert.program || '-'}</Typography>
                </Box>

                {targetInternCert?.evaluation?.certificateUrl && (
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(0, 79, 159, 0.06)', borderRadius: 1.5, border: '1px solid rgba(0, 79, 159, 0.15)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:info-circle-bold" sx={{ color: '#004F9F', flexShrink: 0 }} width={18} />
                    <Typography variant="caption" sx={{ color: '#004F9F', fontWeight: 600 }}>
                      Peserta telah memiliki sertifikat. File baru yang Anda unggah akan otomatis menggantikan sertifikat lama.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: '#fdfdfd' }}>
                  <Iconify icon="solar:cloud-upload-bold-duotone" width={48} sx={{ color: '#004F9F', mb: 1 }} />
                  <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
                    Pilih file sertifikat baru (Format: PDF, PNG, atau JPG)
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    id="cert-file-input"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCertFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="cert-file-input">
                    <Button variant="outlined" component="span" startIcon={<Iconify icon="solar:file-bold" />}>
                      {certFile ? certFile.name : 'Pilih File'}
                    </Button>
                  </label>
                  {certFile && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'success.main', fontWeight: 600 }}>
                      File siap diunggah: {certFile.name} ({(certFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ py: 2, px: 3.5, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={handleCloseUploadCert} variant="outlined" color="inherit">
              Batal
            </Button>
            <Button
              onClick={handleUploadCertificate}
              variant="contained"
              disabled={!certFile || uploadingCert}
              sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, px: 3 }}
            >
              {uploadingCert ? 'Mengunggah...' : targetInternCert?.evaluation?.certificateUrl ? 'Ganti Sertifikat' : 'Unggah Sertifikat'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
