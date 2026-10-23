import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Snackbar, Alert, Divider, InputAdornment
} from '@mui/material';
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

const formatDateIndo = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStatusPeserta, setFilterStatusPeserta] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Admin response in dialog
  const [statusVal, setStatusVal] = useState('Baru');
  const [adminResponse, setAdminResponse] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);

  // Helper cek keaktifan peserta
  const isFeedbackInternActive = (intern: any) => {
    if (!intern) return true;
    const userStatus = (intern.user?.status || '').toLowerCase();
    if (userStatus && userStatus !== 'active') return false;
    if (intern.endDate) {
      const end = new Date(intern.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date() > end) return false;
    }
    return true;
  };

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(endpoints.notification.feedback);
      setFeedbacks(res.data || []);
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenDetail = (feedback: any) => {
    setSelectedFeedback(feedback);
    setStatusVal(feedback.status || 'Baru');
    setAdminResponse(feedback.response || '');
    setOpenDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedFeedback(null);
  };

  const handleSaveResponse = async () => {
    if (!selectedFeedback) return;
    try {
      setSavingResponse(true);
      await axiosInstance.patch(endpoints.notification.updateFeedbackStatus(selectedFeedback.id), {
        status: statusVal,
        response: adminResponse,
      });

      setToast({
        open: true,
        message: 'Status dan tanggapan feedback berhasil disimpan!',
        severity: 'success',
      });

      setOpenDetailDialog(false);
      fetchFeedbacks();
    } catch (error: any) {
      console.error('Failed to update feedback status:', error);
      setToast({
        open: true,
        message: error?.message || 'Gagal menyimpan tanggapan',
        severity: 'error',
      });
    } finally {
      setSavingResponse(false);
    }
  };

  // Seluruh feedbacks (tidak menghilangkan feedback dari peserta yang masa magangnya telah usai / tidak aktif)
  const allFeedbacks = feedbacks;

  // KPI Calculations
  const totalFeedback = allFeedbacks.length;
  const avgRating = totalFeedback > 0
    ? (allFeedbacks.reduce((sum, item) => sum + (item.rating || 5), 0) / totalFeedback).toFixed(1)
    : '0.0';
  const unreadCount = allFeedbacks.filter((f) => f.status === 'Baru').length;
  const resolvedCount = allFeedbacks.filter((f) => f.status === 'Ditindaklanjuti').length;

  // Filtered List
  const filteredFeedbacks = allFeedbacks.filter((item) => {
    const isRowActive = isFeedbackInternActive(item.intern);
    if (filterStatusPeserta === 'ACTIVE' && !isRowActive) return false;
    if (filterStatusPeserta === 'INACTIVE' && isRowActive) return false;

    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const internName = item.isAnonymous ? 'Anonim' : item.intern?.user?.name || '';
    const matchesKeyword =
      !searchKeyword ||
      internName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesCategory && matchesStatus && matchesKeyword;
  });

  const getStatusChip = (status: string) => {
    const raw = String(status || '').trim();
    const upper = raw.toUpperCase();

    let label = 'BARU';
    let bgcolor = '#64748B';

    if (upper.includes('TINDAK') || upper === 'DITINDAKLANJUTI' || upper === 'SELESAI') {
      label = 'DITINDAKLANJUTI';
      bgcolor = '#16A34A';
    } else if (upper.includes('TINJAU') || upper === 'SEDANG DITINJAU' || upper === 'DITINJAU') {
      label = 'SEDANG DITINJAU';
      bgcolor = '#F59E0B';
    } else if (upper === 'BARU') {
      label = 'BARU';
      bgcolor = '#64748B';
    }

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor,
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
        }}
      />
    );
  };

  return (
    <>
      <Helmet>
        <title> Feedback Peserta Magang | SI-Magang PTPL</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <DashboardBreadcrumbs current="Feedback" />

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Kotak Feedback & Evaluasi Peserta Magang
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Tinjau kritik, saran, serta kepuasan peserta terhadap fasilitas, mentor, dan program
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #004F9F', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(0, 79, 159, 0.1)',
                    color: '#004F9F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Iconify icon="solar:chat-round-dots-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Feedback</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalFeedback}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #F59E0B', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Iconify icon="solar:star-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Rata-rata Rating</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>{avgRating} / 5</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #EE2E24', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(238, 46, 36, 0.1)',
                    color: '#EE2E24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Feedback Baru</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#EE2E24', fontWeight: 'bold' }}>{unreadCount}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', borderBottom: '3.5px solid #16A34A', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(22, 163, 74, 0.1)',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Ditindaklanjuti</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#16A34A', fontWeight: 'bold' }}>{resolvedCount}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                <InputLabel>Status Peserta</InputLabel>
                <Select
                  label="Status Peserta"
                  value={filterStatusPeserta}
                  onChange={(e) => setFilterStatusPeserta(e.target.value as any)}
                >
                  <MenuItem value="ALL">Semua Status Peserta</MenuItem>
                  <MenuItem value="ACTIVE">Peserta Aktif</MenuItem>
                  <MenuItem value="INACTIVE">Peserta Tidak Aktif (Selesai)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                <InputLabel>Kategori Feedback</InputLabel>
                <Select
                  label="Kategori Feedback"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="ALL">Semua Kategori</MenuItem>
                  <MenuItem value="Fasilitas">Fasilitas Kantor</MenuItem>
                  <MenuItem value="Bimbingan Mentor">Bimbingan Mentor</MenuItem>
                  <MenuItem value="Sistem/Aplikasi">Sistem / Aplikasi SI-Magang</MenuItem>
                  <MenuItem value="Lingkungan Kerja">Lingkungan Kerja & Budaya</MenuItem>
                  <MenuItem value="Umum">Umum / Lainnya</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                <InputLabel>Status Feedback</InputLabel>
                <Select
                  label="Status Feedback"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">Semua Status</MenuItem>
                  <MenuItem value="Baru">Baru</MenuItem>
                  <MenuItem value="Ditinjau">Ditinjau</MenuItem>
                  <MenuItem value="Ditindaklanjuti">Ditindaklanjuti</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari pesan atau nama peserta..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                sx={{ bgcolor: 'white' }}
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
                onClick={() => {
                  setFilterStatusPeserta('ALL');
                  setFilterCategory('ALL');
                  setFilterStatus('ALL');
                  setSearchKeyword('');
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
            </Grid>
          </Grid>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer sx={{ minHeight: 350 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Belum ada feedback yang masuk</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Pengirim</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Pesan / Kendala</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Waktu Masuk</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFeedbacks.map((row) => {
                    const isRowActive = isFeedbackInternActive(row.intern);
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.isAnonymous ? (
                            <Chip label="Anonim (Dirahasiakan)" size="small" variant="outlined" />
                          ) : (
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  {row.intern?.user?.name || 'Peserta'}
                                </Typography>
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
                              <Typography variant="caption" color="text.secondary">
                                {row.intern?.university || '-'}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      <TableCell>
                        <Chip label={row.category} size="small" color="primary" variant="soft" />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontWeight: 'bold' }}>
                          <Iconify icon="solar:star-bold" width={16} sx={{ mr: 0.5 }} />
                          {row.rating || 5}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {row.message}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                      <TableCell>{formatDateIndo(row.createdAt)}</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }}
                          onClick={() => handleOpenDetail(row)}
                          title="Tinjau & Tanggapi"
                        >
                          <Iconify icon="solar:eye-bold-duotone" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      </Container>

      {/* Dialog Detail & Tindak Lanjut Feedback */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">
              Tinjauan Feedback & Saran Peserta
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetail} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          {selectedFeedback && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      PENGIRIM
                    </Typography>
                    {selectedFeedback.isAnonymous ? (
                      <Typography variant="body2" fontWeight="bold">
                        Anonim (Identitas Dirahasiakan)
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedFeedback.intern?.user?.name || 'Peserta Magang'}
                        </Typography>
                        <Chip
                          label={isFeedbackInternActive(selectedFeedback.intern) ? 'Aktif' : 'Tidak Aktif'}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: isFeedbackInternActive(selectedFeedback.intern) ? '#DCFCE7' : '#FEE2E2',
                            color: isFeedbackInternActive(selectedFeedback.intern) ? '#16A34A' : '#DC2626',
                          }}
                        />
                      </Box>
                    )}
                    {!selectedFeedback.isAnonymous && (
                      <Typography variant="caption" color="text.secondary">
                        {selectedFeedback.intern?.university || ''} ({selectedFeedback.intern?.major || ''})
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      KATEGORI & TANGGAL
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={selectedFeedback.category} size="small" color="primary" variant="soft" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {formatDateIndo(selectedFeedback.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      KEPUASAN / RATING
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#f59e0b', mt: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <Iconify
                          key={i}
                          icon={i < (selectedFeedback.rating || 5) ? 'solar:star-bold' : 'solar:star-linear'}
                          width={22}
                        />
                      ))}
                      <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'bold', color: 'text.primary' }}>
                        {selectedFeedback.rating || 5} dari 5 Bintang
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Isi Pesan / Masukan Peserta:
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{selectedFeedback.message}"
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Tindak Lanjut dari Admin */}
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: '#004F9F' }}>
                  Tindak Lanjut Admin Human Capital
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status Feedback</InputLabel>
                      <Select
                        label="Status Feedback"
                        value={statusVal}
                        onChange={(e) => setStatusVal(e.target.value)}
                      >
                        <MenuItem value="Baru">Baru (Belum Ditindak)</MenuItem>
                        <MenuItem value="Ditinjau">Ditinjau (Dalam Evaluasi)</MenuItem>
                        <MenuItem value="Ditindaklanjuti">Ditindaklanjuti (Selesai)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Catatan / Tanggapan Admin ke Peserta"
                    placeholder="Tuliskan catatan tindak lanjut atau tanggapan apresiasi kepada peserta (opsional)..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    * Jika peserta tidak anonim, tanggapan ini akan memicu notifikasi langsung ke dashboard peserta.
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={handleCloseDetail}
            variant="outlined"
            color="inherit"
            sx={{ borderColor: '#CBD5E1', borderRadius: 1.5, textTransform: 'none' }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveResponse}
            disabled={savingResponse}
            sx={{ px: 3, bgcolor: '#004F9F', borderRadius: 1.5, textTransform: 'none' }}
          >
            {savingResponse ? 'Menyimpan...' : 'Simpan Tindak Lanjut'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}