import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  Tabs, Tab, RadioGroup, FormControlLabel, Radio, FormControl,
  Select, MenuItem, InputLabel, InputAdornment
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';

import { PERTAMINA_TOKENS } from 'src/theme/palette';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;
const BRAND_NAVY_HOVER = PERTAMINA_TOKENS.navyHover;

export default function PesertaLaporanPage() {
  const { user } = useAuthContext();
  const [laporans, setLaporans] = useState<any[]>([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [kategori, setKategori] = useState('Laporan Progres');
  const [keterangan, setKeterangan] = useState('');
  const [fileLaporans, setFileLaporans] = useState<File[]>([]);
  const [currentTab, setCurrentTab] = useState('Laporan Progres');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States untuk fitur pencarian & filter laporan
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterDate('');
    setFilterStatus('all');
  };

  // State untuk dialog konfirmasi hapus
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [laporanToDelete, setLaporanToDelete] = useState<string | null>(null);

  const fetchLaporan = async () => {
    try {
      const res = await axiosInstance.get('/laporan/me');
      setLaporans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleSubmit = async () => {
    if (fileLaporans.length === 0) {
      toast.warning('Silakan pilih minimal 1 file laporan!');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('keterangan', `[${kategori}] ${keterangan}`);
    fileLaporans.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axiosInstance.post('/laporan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${kategori} berhasil diunggah!`);
      await fetchLaporan();
      setOpenUpload(false);
      setKeterangan('');
      setFileLaporans([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setLaporanToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteDialog(false);
    setLaporanToDelete(null);
  };

  const executeDelete = async () => {
    if (!laporanToDelete) return;
    try {
      await axiosInstance.delete(`/laporan/${laporanToDelete}`);
      toast.success('Laporan berhasil dihapus');
      fetchLaporan();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus laporan');
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  // Statistik ringkasan laporan untuk KPI cards
  const stats = useMemo(() => {
    const total = laporans.length;
    const progresCount = laporans.filter(l => !l.keterangan?.includes('[Laporan Akhir]')).length;
    const akhirCount = laporans.filter(l => l.keterangan?.includes('[Laporan Akhir]')).length;
    const evaluatedCount = laporans.filter(l => (l.statusFeedback || '').toLowerCase().includes('telah dievaluasi')).length;
    const pendingCount = total - evaluatedCount;

    return {
      total,
      progresCount,
      akhirCount,
      evaluatedCount,
      pendingCount,
    };
  }, [laporans]);

  // Filter laporan berdasarkan tab aktif, status, tanggal, dan kata kunci pencarian
  const filteredLaporans = useMemo(() => laporans.filter(row => {
    // 1. Filter Tab
    const isAkhir = row.keterangan?.includes('[Laporan Akhir]');
    if (currentTab === 'Laporan Akhir' && !isAkhir) return false;
    if (currentTab === 'Laporan Progres' && isAkhir) return false;

    // 2. Filter Status
    if (filterStatus !== 'all') {
      const s = (row.statusFeedback || '').toLowerCase();
      if (filterStatus === 'evaluated' && !s.includes('telah dievaluasi')) return false;
      if (filterStatus === 'pending' && s.includes('telah dievaluasi')) return false;
    }

    // 3. Filter Tanggal (YYYY-MM-DD)
    if (filterDate) {
      const d = new Date(row.createdAt);
      if (Number.isNaN(d.getTime())) return false;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const rowDateStr = `${year}-${month}-${day}`;
      if (rowDateStr !== filterDate) return false;
    }

    // 4. Filter Pencarian Keyword (Keterangan / Nama File)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ket = (row.keterangan || '').toLowerCase();
      const filesStr = Array.isArray(row.files) ? row.files.join(' ').toLowerCase() : '';
      if (!ket.includes(q) && !filesStr.includes(q)) return false;
    }

    return true;
  }), [laporans, currentTab, filterStatus, filterDate, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Laporan Magang | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Laporan */}
        <DashboardBreadcrumbs current="Laporan" />

        {/* PAGE HEADER */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
              Laporan Magang
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Unggah dan kelola progres mingguan serta laporan akhir magang Anda secara terpadu di PT Pertamina Lubricants.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
            onClick={() => setOpenUpload(true)}
            sx={{
              flexShrink: 0,
              bgcolor: BRAND_NAVY,
              color: '#FFFFFF',
              '&:hover': { bgcolor: BRAND_NAVY_HOVER },
              fontWeight: 700,
              borderRadius: 1.5,
              boxShadow: 'none',
              textTransform: 'none',
              px: 2.5,
              py: 1,
              whiteSpace: 'nowrap',
            }}
          >
            Unggah Laporan
          </Button>
        </Box>

        {/* SUMMARY STATS CARDS */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {/* Card 1: Total Dokumen */}
          <Grid item xs={12} sm={4} md={4}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #004F9F',
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Total Laporan
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.08)', color: BRAND_NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:document-text-bold-duotone" width={22} />
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                {stats.progresCount} Progres · {stats.akhirCount} Akhir
              </Typography>
            </Card>
          </Grid>

          {/* Card 2: Telah Dievaluasi */}
          <Grid item xs={12} sm={4} md={4}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #16A34A',
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Telah Dievaluasi
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mb: 0.5 }}>
                {stats.evaluatedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Telah ditinjau oleh mentor
              </Typography>
            </Card>
          </Grid>

          {/* Card 3: Menunggu Evaluasi */}
          <Grid item xs={12} sm={4} md={4}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #E2E8F0',
                borderBottom: '3.5px solid #F59E0B',
                bgcolor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Menunggu Evaluasi
                </Typography>
                <Box sx={{ width: 38, height: 38, borderRadius: 1.5, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#D97706', mb: 0.5 }}>
                {stats.pendingCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Menunggu tanggapan mentor
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* TABS */}
        <Box sx={{ mb: 3.5, borderBottom: 1, borderColor: '#E2E8F0' }}>
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': { 
                fontWeight: 700, 
                fontSize: '0.92rem', 
                textTransform: 'none', 
                minWidth: 'auto',
                minHeight: 44,
                px: 2,
                py: 1,
                color: '#64748B',
                '&.Mui-selected': { color: BRAND_NAVY },
              },
              '& .MuiTabs-indicator': {
                bgcolor: BRAND_NAVY,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Laporan Progres</span>
                  <Chip
                    size="small"
                    label={stats.progresCount}
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: currentTab === 'Laporan Progres' ? 'rgba(0, 79, 159, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                      color: currentTab === 'Laporan Progres' ? BRAND_NAVY : '#64748B',
                    }}
                  />
                </Stack>
              }
              value="Laporan Progres"
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Laporan Akhir</span>
                  <Chip
                    size="small"
                    label={stats.akhirCount}
                    sx={{
                      height: 20,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      bgcolor: currentTab === 'Laporan Akhir' ? 'rgba(0, 79, 159, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                      color: currentTab === 'Laporan Akhir' ? BRAND_NAVY : '#64748B',
                    }}
                  />
                </Stack>
              }
              value="Laporan Akhir"
            />
          </Tabs>
        </Box>

        {/* SEARCH & FILTER BAR */}
        <Card sx={{ p: 2, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' }, flex: 1 }}>
              <TextField
                size="small"
                placeholder="Cari judul atau file laporan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-linear" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: '100%', sm: 240 } }}
              />

              <TextField
                type="date"
                size="small"
                label="Filter Tanggal"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: '100%', sm: 170 } }}
              />

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
                <InputLabel>Status Laporan</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status Laporan"
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="evaluated">Telah Dievaluasi</MenuItem>
                  <MenuItem value="pending">Menunggu Evaluasi</MenuItem>
                </Select>
              </FormControl>
            </Stack>

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
        </Card>

        {/* CARDS GRID */}
        {filteredLaporans.length === 0 ? (
          <Box sx={{ py: 8, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', borderRadius: 2, border: '2px dashed #CBD5E1', textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(0, 79, 159, 0.08)', color: BRAND_NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Iconify icon="solar:document-add-bold-duotone" width={34} />
            </Box>
            <Typography variant="h6" color="#0F172A" fontWeight="bold">
              {searchQuery || filterDate || filterStatus !== 'all'
                ? 'Tidak ada laporan yang sesuai dengan filter'
                : `Belum ada ${currentTab.toLowerCase()} yang diunggah`}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 1, maxWidth: 480 }}>
              {searchQuery || filterDate || filterStatus !== 'all'
                ? 'Silakan sesuaikan kembali kata kunci pencarian, tanggal, atau filter status laporan Anda.'
                : `Unggah dokumen ${currentTab.toLowerCase()} Anda untuk mendapatkan evaluasi dan arahan berkala dari mentor bimbingan.`}
            </Typography>
            {searchQuery || filterDate || filterStatus !== 'all' ? (
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilter}
                sx={{ mt: 2.5, textTransform: 'none', borderRadius: 1.5, borderColor: '#CBD5E1', fontWeight: 600 }}
              >
                Reset Filter
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setOpenUpload(true)}
                startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}
                sx={{
                  mt: 2.5,
                  bgcolor: BRAND_NAVY,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                  fontWeight: 700,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                }}
              >
                Unggah {currentTab} Sekarang
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredLaporans.map((row) => {
              const isEvaluated = row.statusFeedback === 'Telah Dievaluasi';
              return (
                <Grid item xs={12} sm={6} md={4} key={row.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0, 79, 159, 0.08)', borderColor: '#CBD5E1' } }}>
                    {/* Status Banner */}
                    <Box sx={{
                      px: 2.5,
                      py: 1.5,
                      bgcolor: isEvaluated ? 'rgba(22, 163, 74, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: isEvaluated ? 'rgba(22, 163, 74, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                    }}>
                      <Chip
                        label={isEvaluated ? 'TELAH DIEVALUASI' : (row.statusFeedback ? row.statusFeedback.toUpperCase() : 'MENUNGGU EVALUASI')}
                        size="small"
                        icon={
                          <Iconify
                            icon={isEvaluated ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
                            sx={{ color: '#FFFFFF !important', width: 16, height: 16 }}
                          />
                        }
                        sx={{
                          bgcolor: isEvaluated ? '#16A34A' : '#F59E0B',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          borderRadius: '6px',
                          height: 26,
                          px: 0.5,
                          boxShadow: 'none',
                          '& .MuiChip-label': {
                            px: 1,
                            fontWeight: 800,
                          },
                          '& .MuiChip-icon': {
                            ml: 0.75,
                          },
                        }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748B' }}>
                          {new Date(row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Typography>
                        {/* Tombol Delete jika belum dinilai */}
                        {(row.statusFeedback === 'Menunggu Evaluasi' || row.statusFeedback === 'Belum Dinilai' || row.statusFeedback === 'Menunggu Ditinjau') && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirm(row.id)}
                            title="Batalkan / Hapus Laporan"
                            sx={{ p: 0.5, bgcolor: 'rgba(239, 68, 68, 0.08)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.16)' } }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', mb: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                        {row.keterangan ? row.keterangan.replace(/\[.*?\]\s*/, '') : `Dokumen ${currentTab}`}
                      </Typography>

                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          File Terlampir:
                        </Typography>
                        {row.files && row.files.map((file: string, idx: number) => {
                          const fileName = file.split('/').pop() || '';
                          const displayFileName = /^\d{13}-/.test(fileName) ? fileName.substring(14) : fileName;
                          return (
                            <Box
                              key={idx}
                              component="a"
                              href={`${HOST_API}${file.startsWith('/') ? file.slice(1) : file}`}
                              target="_blank"
                              rel="noreferrer"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1.25,
                                mb: 1,
                                borderRadius: 1.5,
                                bgcolor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                color: BRAND_NAVY,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#F0F9FF', borderColor: BRAND_NAVY }
                              }}
                            >
                              <Box sx={{ width: 34, height: 34, borderRadius: 1.25, bgcolor: 'rgba(0, 79, 159, 0.08)', color: BRAND_NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, flexShrink: 0 }}>
                                <Iconify icon="solar:file-download-bold-duotone" width={18} />
                              </Box>
                              <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                {displayFileName}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Mentor Comment Section */}
                    {isEvaluated && row.komentar && (
                      <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px dashed #CBD5E1' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                          <Iconify icon="solar:chat-line-bold-duotone" width={16} sx={{ color: BRAND_NAVY, mr: 0.75 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: BRAND_NAVY }}>Catatan Mentor:</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#475569', pl: 3, fontSize: '0.82rem', lineHeight: 1.5 }}>
                          "{row.komentar}"
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* MODAL UPLOAD */}
        <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', p: 2.5, pb: 2 }}>
            <Iconify icon="solar:upload-square-bold-duotone" width={26} sx={{ color: BRAND_NAVY, mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A' }}>Unggah Dokumen Laporan</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>Kategori Laporan</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant={kategori === 'Laporan Progres' ? 'contained' : 'outlined'}
                    onClick={() => setKategori('Laporan Progres')}
                    sx={{
                      flex: 1,
                      boxShadow: 'none',
                      borderRadius: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      ...(kategori === 'Laporan Progres' ? {
                        bgcolor: BRAND_NAVY,
                        '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                      } : {
                        borderColor: '#CBD5E1',
                        color: '#475569',
                        '&:hover': { borderColor: BRAND_NAVY, bgcolor: '#F0F9FF' },
                      })
                    }}
                  >
                    Laporan Progres
                  </Button>
                  <Button
                    variant={kategori === 'Laporan Akhir' ? 'contained' : 'outlined'}
                    onClick={() => setKategori('Laporan Akhir')}
                    sx={{
                      flex: 1,
                      boxShadow: 'none',
                      borderRadius: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      ...(kategori === 'Laporan Akhir' ? {
                        bgcolor: BRAND_NAVY,
                        '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                      } : {
                        borderColor: '#CBD5E1',
                        color: '#475569',
                        '&:hover': { borderColor: BRAND_NAVY, bgcolor: '#F0F9FF' },
                      })
                    }}
                  >
                    Laporan Akhir
                  </Button>
                </Stack>
              </Box>

              <TextField
                label="Keterangan Tambahan (Opsional)"
                multiline
                rows={3}
                fullWidth
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Misal: Revisi laporan akhir minggu ke-4..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>File Laporan (PDF)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                    borderColor: '#CBD5E1',
                    borderRadius: 2,
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: '#F8FAFC',
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: BRAND_NAVY },
                    p: 2
                  }}
                >
                  <Iconify icon="solar:upload-minimalistic-bold-duotone" width={32} sx={{ mb: 1, color: BRAND_NAVY }} />
                  {fileLaporans.length > 0
                    ? <Stack spacing={0.5} alignItems="center" sx={{ width: '100%', px: 1 }}>
                      <Typography variant="subtitle2" sx={{ color: BRAND_NAVY, fontWeight: 700 }}>{fileLaporans.length} File Terpilih</Typography>
                      {fileLaporans.map((f, i) => (
                        <Typography key={i} variant="caption" noWrap sx={{ maxWidth: 320, color: '#64748B' }}>
                          {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                        </Typography>
                      ))}
                    </Stack>
                    : 'Klik untuk Mengunggah File Laporan'
                  }
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const filesArray = Array.from(e.target.files);
                        const MAX_SIZE = 15 * 1024 * 1024; // 15MB
                        const validFiles = filesArray.filter(file => file.size <= MAX_SIZE);
                        if (validFiles.length < filesArray.length) {
                          toast.warning('Beberapa file diabaikan karena melebihi batas maksimal 15MB per file!');
                        }
                        setFileLaporans(prev => [...prev, ...validFiles]);
                        e.target.value = '';
                      }
                    }}
                  />
                </Button>
                {fileLaporans.length > 0 && (
                  <Button size="small" color="error" onClick={() => setFileLaporans([])} sx={{ mt: 1, display: 'block', mx: 'auto', textTransform: 'none', fontWeight: 600 }}>
                    Reset Pilihan File
                  </Button>
                )}
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: BRAND_NAVY, textAlign: 'center', fontWeight: 600 }}>
                  * Anda bisa memilih lebih dari 1 file (Maksimal 15MB/file, format PDF)
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <Divider />
          <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 2 }}>
            <Button disabled={isSubmitting} onClick={() => setOpenUpload(false)} variant="outlined" color="inherit" fullWidth sx={{ py: 1.25, fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}>
              Batal
            </Button>
            <Button
              disabled={isSubmitting || fileLaporans.length === 0}
              onClick={handleSubmit}
              variant="contained"
              fullWidth
              sx={{
                py: 1.25,
                fontWeight: 700,
                borderRadius: 1.5,
                textTransform: 'none',
                bgcolor: BRAND_NAVY,
                '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                boxShadow: 'none',
              }}
            >
              {isSubmitting ? 'Mengunggah...' : 'Kirim Dokumen'}
            </Button>
          </Box>
        </Dialog>

        {/* MODAL KONFIRMASI HAPUS */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', pb: 1 }}>
            <Iconify icon="solar:danger-triangle-bold-duotone" width={26} />
            <Typography variant="h6" fontWeight="bold">Konfirmasi Hapus</Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            <Typography variant="body1">
              Apakah Anda yakin ingin menghapus laporan ini secara permanen?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Laporan yang sudah dihapus tidak dapat dikembalikan dan tidak akan terlihat lagi oleh mentor Anda.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
            <Button onClick={handleCloseDeleteConfirm} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
              Batal
            </Button>
            <Button onClick={executeDelete} variant="contained" color="error" sx={{ px: 3, fontWeight: 700, boxShadow: 'none', textTransform: 'none', borderRadius: 1.5 }}>
              Ya, Hapus
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
