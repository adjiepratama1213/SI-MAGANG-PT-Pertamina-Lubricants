import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Divider, MenuItem, Select, FormControl, InputLabel, Tooltip,
  Avatar, CircularProgress
} from '@mui/material';
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/pages/paths';
import { HOST_API } from 'src/config-global';
import { RouterLink } from 'src/components/router-link';

// ----------------------------------------------------------------------

const formatDateIndo = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getFileDownloadUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${HOST_API}${url.replace(/^\//, '')}`;
};

const getInitials = (name?: string) => {
  if (!name) return 'P';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ASPEK_LABELS: { key: string; label: string; desc: string }[] = [
  { key: 'integritas', label: 'Integritas (Etika, moral, dan kesungguhan)', desc: 'Kejujuran dan kepatuhan terhadap kode etik' },
  { key: 'ketepatanWaktu', label: 'Ketepatan waktu dalam bekerja', desc: 'Kehadiran dan ketepatan menyelesaikan tugas' },
  { key: 'keahlian', label: 'Keahlian berdasarkan bidang ilmu', desc: 'Kemampuan teknis menyelesaikan pekerjaan unit' },
  { key: 'kerjasama', label: 'Kerjasama dalam tim', desc: 'Kemampuan berkoordinasi dan sinergi bersama tim' },
  { key: 'komunikasi', label: 'Komunikasi', desc: 'Penyampaian gagasan dan penyesuaian lingkungan kerja' },
  { key: 'penggunaanTI', label: 'Penggunaan teknologi informasi', desc: 'Kecakapan menggunakan sistem & software kerja' },
  { key: 'pengembanganDiri', label: 'Pengembangan diri', desc: 'Kemauan belajar hal baru dan inisiatif mandiri' },
];

export default function MentorRekapPage() {
  const { user } = useAuthContext();
  const { userSearchData, refetchSearch, searchLoading: loadingUsers } = useSearchUsers('');
  const [laporans, setLaporans] = useState<any[]>([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Detail Dialog State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Fetch Laporans dari server
  const fetchLaporans = useCallback(async () => {
    try {
      setLoadingLaporan(true);
      const res = await axiosInstance.get('/laporan/all');
      setLaporans(res.data || []);
    } catch (err) {
      console.error('Failed to load laporans for rekap:', err);
    } finally {
      setLoadingLaporan(false);
    }
  }, []);

  // Muat data Laporan & refetch Users saat halaman dibuka agar selalu mendapatkan data terbaru
  useEffect(() => {
    fetchLaporans();
    refetchSearch();
  }, [fetchLaporans, refetchSearch]);

  // Listener window focus agar bila peserta mengunggah baru / mentor mengupdate di tab lain, data selalu terupdate
  useEffect(() => {
    const handleFocus = () => {
      fetchLaporans();
      refetchSearch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchLaporans, refetchSearch]);

  // Peserta bimbingan mentor yang login
  const myMentees = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData.filter(
      (u: any) => u?.role === 'PESERTA' && u?.internProfile?.mentor?.userId === user.id
    );
  }, [userSearchData, user]);

  // Korelasi data: Menggabungkan Laporan Akhir TERBARU & Penilaian Akhir TERBARU per peserta bimbingan
  const correlatedData = useMemo(() => {
    return myMentees.map((intern: any) => {
      const profile = intern.internProfile || {};
      const evaluation = profile.evaluation || null;

      // 1. Ambil seluruh laporan milik peserta ini dan urutkan descending (terbaru di index 0)
      const menteeLaporans = laporans
        .filter(
          (l: any) =>
            l.intern?.userId === intern.id ||
            l.internId === profile.id ||
            l.intern?.id === profile.id
        )
        .sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });

      // 2. Filter Laporan Akhir (ambil HANYA yang paling baru, laporan lama tergantikan sepenuhnya)
      const laporanAkhirList = menteeLaporans.filter((l: any) =>
        String(l.keterangan || '').toLowerCase().includes('laporan akhir')
      );
      const laporanAkhir = laporanAkhirList.length > 0 ? laporanAkhirList[0] : null;

      const hasLaporanAkhir = Boolean(laporanAkhir);
      const isLaporanTerkumpul = Boolean(
        laporanAkhir &&
        (laporanAkhir.statusFeedback || '').toLowerCase().includes('telah dievaluasi')
      );
      const hasPenilaian = Boolean(evaluation);

      // Status kelengkapan: Lengkap jika Laporan Akhir sudah 'Terkumpul' (dievaluasi) & Penilaian Akhir sudah ada
      const statusRekap = isLaporanTerkumpul && hasPenilaian ? 'Lengkap' : 'Tidak Lengkap';

      // Teks status laporan untuk kolom tabel: jika baru diupload & masih menunggu evaluasi -> 'Belum Terkumpul'
      let laporanStatusText = 'Belum Mengunggah';
      if (hasLaporanAkhir) {
        laporanStatusText = isLaporanTerkumpul ? 'Terkumpul' : 'Belum Terkumpul';
      }

      // HANYA ambil berkas dari laporan akhir yang TERBARU (laporan lama tergantikan sepenuhnya)
      const filesLaporan: string[] = Array.isArray(laporanAkhir?.files) ? laporanAkhir.files : [];
      const latestLaporanFiles: {
        url: string;
        fileName: string;
        date: string | Date;
        statusFeedback: string;
      }[] = filesLaporan.map((f: string) => {
        const rawName = f.split('/').pop() || '';
        const displayName = /^\d{13}-/.test(rawName)
          ? rawName.substring(14)
          : rawName.replace(/^\d+-/, '') || 'Berkas Laporan Akhir';
        return {
          url: f,
          fileName: displayName,
          date: laporanAkhir?.createdAt,
          statusFeedback: laporanAkhir?.statusFeedback || 'Menunggu Evaluasi',
        };
      });

      const fileLaporan = filesLaporan[0] || null;
      const fileName = latestLaporanFiles[0]?.fileName || 'Berkas Laporan Akhir';

      return {
        id: intern.id,
        internProfileId: profile.id,
        name: intern.name || '-',
        nim: profile.internId || '-',
        university: profile.university || '-',
        major: profile.major || '-',
        program: profile.program || '-',
        startDate: profile.startDate,
        endDate: profile.endDate,
        // Laporan Akhir Data
        hasLaporanAkhir,
        isLaporanTerkumpul,
        laporanStatusText,
        laporanAkhir,
        filesLaporan,
        latestLaporanFiles,
        allLaporanAkhirFiles: latestLaporanFiles,
        fileLaporan,
        fileName,
        laporanTanggal: laporanAkhir?.createdAt,
        laporanStatusFeedback: laporanAkhir?.statusFeedback || (hasLaporanAkhir ? 'Menunggu Evaluasi' : 'Belum Unggah'),
        laporanKomentar: laporanAkhir?.komentar || '',
        laporanKeterangan: laporanAkhir?.keterangan || '',
        totalSemuaLaporan: menteeLaporans.length,
        // Penilaian Akhir Data
        hasPenilaian,
        evaluation,
        nilaiRataRata: evaluation?.nilaiRataRata !== undefined ? Number(evaluation.nilaiRataRata).toFixed(2) : null,
        kategori: evaluation?.kategori || '-',
        statusApproval: evaluation?.statusApproval || (hasPenilaian ? 'PENDING' : 'Belum Dinilai'),
        catatanPenilaian: evaluation?.catatan || '',
        // Status Rekap Gabungan
        statusRekap,
      };
    });
  }, [myMentees, laporans]);

  // Ekstrak daftar program untuk filter
  const programOptions = useMemo(() => {
    const set = new Set<string>();
    correlatedData.forEach((item) => {
      if (item.program && item.program !== '-') set.add(item.program);
    });
    return Array.from(set);
  }, [correlatedData]);

  // Filter & Search data
  const filteredData = useMemo(() => {
    return correlatedData.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.nim.toLowerCase().includes(q) ||
        item.university.toLowerCase().includes(q);

      const matchProgram = filterProgram === 'all' || item.program.toLowerCase().includes(filterProgram.toLowerCase());

      let matchStatus = true;
      if (filterStatus === 'lengkap') {
        matchStatus = item.statusRekap === 'Lengkap';
      } else if (filterStatus === 'tidak lengkap') {
        matchStatus = item.statusRekap === 'Tidak Lengkap';
      }

      return matchSearch && matchProgram && matchStatus;
    });
  }, [correlatedData, searchQuery, filterProgram, filterStatus]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Statistik Ringkasan
  const totalMentees = correlatedData.length;
  const totalLengkap = correlatedData.filter((d) => d.statusRekap === 'Lengkap').length;
  const totalTidakLengkap = correlatedData.filter((d) => d.statusRekap !== 'Lengkap').length;

  const handleOpenDetail = (item: any) => {
    setSelectedItem(item);
    setOpenDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedItem(null);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterProgram('all');
    setFilterStatus('all');
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isLoading = loadingUsers || loadingLaporan;

  return (
    <>
      <Helmet>
        <title>Rekap Akhir | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Rekap Akhir */}
        <DashboardBreadcrumbs current="Rekap Akhir" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Rekap Akhir
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Rekapitulasi berkas Laporan Akhir dan hasil Penilaian Akhir kompetensi peserta bimbingan Anda di PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* 3 SUMMARY METRIC CARDS (Style konsisten dengan mentor-penilaian) */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Total Peserta */}
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
                borderBottom: '3.5px solid #004F9F',
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
                  Total Peserta
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#EDF5FE',
                    color: '#004F9F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {totalMentees}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Lengkap */}
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
                  Lengkap
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
                  {totalLengkap}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Tidak Lengkap */}
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
                  Tidak Lengkap
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
                  {totalTidakLengkap}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER (Style konsisten dengan mentor-penilaian) */}
        <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Cari peserta (Nama/ID)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
              size="small"
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
              <InputLabel>Program</InputLabel>
              <Select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setPage(0);
                }}
                label="Program"
              >
                <MenuItem value="all">Semua Program</MenuItem>
                {programOptions.length > 0 ? (
                  programOptions.map((prog) => (
                    <MenuItem key={prog} value={prog}>
                      {prog}
                    </MenuItem>
                  ))
                ) : (
                  [
                    <MenuItem key="pkl" value="pkl">PKL</MenuItem>,
                    <MenuItem key="ptpl" value="internship ptpl">Internship PTPL</MenuItem>,
                    <MenuItem key="kemnaker" value="internship kemnaker">Internship Kemnaker</MenuItem>
                  ]
                )}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
              <InputLabel>Status Kelengkapan</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                label="Status Kelengkapan"
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="lengkap">Lengkap</MenuItem>
                <MenuItem value="tidak lengkap">Tidak Lengkap</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleResetFilter}
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

        {/* TABLE (Style konsisten dengan mentor-penilaian) */}
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Nama</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ID Peserta</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Asal Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Program</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Laporan Akhir</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Penilaian Akhir</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" width="10%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={36} sx={{ color: '#004F9F', mb: 1.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Memuat data rekap peserta...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:clipboard-list-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada data rekap peserta</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                      {/* Nama */}
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>

                      {/* ID Peserta */}
                      <TableCell>{row.nim}</TableCell>

                      {/* Asal Instansi */}
                      <TableCell>{row.university}</TableCell>

                      {/* Program */}
                      <TableCell>
                        <Chip
                          label={row.program}
                          size="small"
                          variant="soft"
                          color={
                            String(row.program || '').toLowerCase().includes('pkl')
                              ? 'warning'
                              : String(row.program || '').toLowerCase().includes('kemnaker')
                              ? 'success'
                              : 'info'
                          }
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>

                      {/* Laporan Akhir: teks polos tanpa border atau chip */}
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: row.isLaporanTerkumpul ? '#0F172A' : '#64748B',
                            fontSize: '0.85rem',
                          }}
                        >
                          {row.laporanStatusText}
                        </Typography>
                      </TableCell>

                      {/* Penilaian Akhir: hanya angka (kategori di modal rincian) */}
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: row.hasPenilaian ? '#0F172A' : '#64748B',
                            fontSize: '0.85rem',
                          }}
                        >
                          {row.hasPenilaian
                            ? row.nilaiRataRata || '-'
                            : 'Belum Dinilai'}
                        </Typography>
                      </TableCell>

                      {/* Status Kelengkapan */}
                      <TableCell align="center">
                        <Chip
                          label={row.statusRekap}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 90,
                            bgcolor: '#FFFFFF',
                            borderColor: row.statusRekap === 'Lengkap' ? '#16A34A' : '#F59E0B',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            color: row.statusRekap === 'Lengkap' ? '#16A34A' : '#F59E0B',
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

                      {/* Aksi: "Lihat" sesuai style mentor-penilaian */}
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenDetail(row)}
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

      {/* DIALOG RINCIAN REKAPITULASI AKHIR (Konsisten dengan mentor-penilaian dan mentor-laporan) */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:clipboard-check-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">
              Rincian Rekapitulasi Akhir
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetail} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Card Profil Peserta */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#004F9F',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                    }}
                  >
                    {getInitials(selectedItem.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', lineHeight: 1.25 }}>
                      {selectedItem.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>
                      NIM: {selectedItem.nim} &bull; {selectedItem.university} ({selectedItem.major})
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={selectedItem.program}
                    size="small"
                    variant="soft"
                    color={
                      String(selectedItem.program || '').toLowerCase().includes('pkl')
                        ? 'warning'
                        : String(selectedItem.program || '').toLowerCase().includes('kemnaker')
                        ? 'success'
                        : 'info'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip
                    label={selectedItem.statusRekap}
                    size="small"
                    variant="outlined"
                    sx={{
                      minWidth: 90,
                      bgcolor: '#FFFFFF',
                      borderColor: selectedItem.statusRekap === 'Lengkap' ? '#16A34A' : '#F59E0B',
                      borderWidth: 1.5,
                      borderStyle: 'solid',
                      color: selectedItem.statusRekap === 'Lengkap' ? '#16A34A' : '#F59E0B',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: 1,
                      height: 28,
                      letterSpacing: '0.3px',
                      '& .MuiChip-label': { px: 1, fontWeight: 700 },
                    }}
                  />
                </Box>
              </Box>

              {/* Card 1: Status Berkas Laporan Akhir */}
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: '#004F9F' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Status Berkas Laporan Akhir
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.mentorLaporan}
                    size="small"
                    endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                    sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, color: '#004F9F' }}
                  >
                    Buka Menu Laporan
                  </Button>
                </Box>

                {selectedItem.hasLaporanAkhir && selectedItem.latestLaporanFiles?.length > 0 ? (
                  <Stack spacing={1.5}>
                    {selectedItem.latestLaporanFiles.map((item: any, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 2,
                          borderRadius: 1.5,
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.25,
                              bgcolor: '#EDF5FE',
                              color: '#004F9F',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon="solar:document-bold-duotone" width={22} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#0F172A', fontSize: '0.85rem' }} noWrap>
                              {item.fileName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.74rem' }}>
                              Diupload: {formatDateIndo(item.date)} &bull; Status: {item.statusFeedback}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={getFileDownloadUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          startIcon={<Iconify icon="solar:file-download-bold-duotone" width={16} />}
                          sx={{
                            minWidth: 90,
                            bgcolor: 'white',
                            borderWidth: 1.5,
                            borderColor: '#CBD5E1',
                            color: '#004F9F',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            textTransform: 'none',
                            '&:hover': { borderWidth: 1.5, borderColor: '#004F9F', bgcolor: '#F8FAFC' },
                          }}
                        >
                          Unduh Dokumen
                        </Button>
                      </Box>
                    ))}

                    {selectedItem.laporanKomentar && (
                      <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Catatan / Feedback Pembimbing:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          &ldquo;{selectedItem.laporanKomentar}&rdquo;
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Iconify icon="solar:clock-circle-bold-duotone" width={36} sx={{ color: '#F59E0B', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Peserta belum mengunggah berkas Laporan Akhir.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Card 2: Hasil Penilaian Akhir */}
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Iconify icon="solar:diploma-verified-bold-duotone" width={24} sx={{ color: '#004F9F' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Hasil Penilaian Akhir
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    href={paths.dashboard.mentorPenilaian}
                    size="small"
                    endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                    sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, color: '#004F9F' }}
                  >
                    Buka Menu Penilaian
                  </Button>
                </Box>

                {selectedItem.hasPenilaian && selectedItem.evaluation ? (
                  <Stack spacing={2.5}>
                    {/* Ringkasan Nilai & Kategori */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                          Nilai Rata-Rata Akhir
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {selectedItem.nilaiRataRata}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`Kategori: ${selectedItem.kategori}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: '#FFFFFF',
                            borderColor: '#004F9F',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            color: '#004F9F',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                          }}
                        />
                        <Chip
                          label={`Approval VP: ${selectedItem.statusApproval === 'APPROVED' ? 'Disetujui' : 'Menunggu'}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: '#FFFFFF',
                            borderColor: selectedItem.statusApproval === 'APPROVED' ? '#16A34A' : '#F59E0B',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            color: selectedItem.statusApproval === 'APPROVED' ? '#16A34A' : '#F59E0B',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* 7 Aspek Penilaian (Style konsisten dengan dialog mentor-penilaian) */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}>
                        Rincian Nilai 7 Aspek Kompetensi:
                      </Typography>
                      {ASPEK_LABELS.map((item, idx) => {
                        const val = selectedItem.evaluation[item.key];
                        const score = val !== undefined ? Number(val) : 0;
                        return (
                          <Box
                            key={item.key}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1.75,
                              mb: 1.25,
                              borderRadius: 2,
                              bgcolor: 'white',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0px 2px 4px rgba(0,0,0,0.02)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: 'rgba(0, 79, 159, 0.1)',
                                  color: '#004F9F',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: 14,
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {item.label}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                                  {item.desc}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography sx={{ fontWeight: 800, color: '#004F9F', fontSize: '1rem', pl: 2 }}>
                              {score}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>

                    {selectedItem.catatanPenilaian && (
                      <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Catatan Evaluasi Pembimbing:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontStyle: 'italic', fontSize: '0.85rem' }}>
                          &ldquo;{selectedItem.catatanPenilaian}&rdquo;
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Iconify icon="solar:clock-circle-bold-duotone" width={36} sx={{ color: '#F59E0B', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 600, mb: 1.5 }}>
                      Nilai akhir belum diinput oleh pembimbing.
                    </Typography>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.mentorPenilaian}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ borderWidth: 1.5, '&:hover': { borderWidth: 1.5 }, textTransform: 'none', fontWeight: 600 }}
                    >
                      Beri Penilaian Sekarang
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDetail}
            sx={{
              bgcolor: '#004F9F',
              '&:hover': { bgcolor: '#003366', boxShadow: 'none' },
              boxShadow: 'none',
              height: 38,
              px: 3.5,
              textTransform: 'none',
              borderRadius: 1.5,
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
