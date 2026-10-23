import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  CircularProgress, Alert, Snackbar, Tooltip, Stack, InputAdornment,
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

export default function ReminderPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  // Detail & Delete Dialog State
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'ALL' | 'PESERTA' | 'MENTOR' | 'VP'>('ALL');
  const [urgency, setUrgency] = useState<'INFO' | 'WARNING' | 'URGENT'>('INFO');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [filterTarget, setFilterTarget] = useState('ALL_FILTER');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(endpoints.notification.reminder);
      setReminders(res.data || []);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleOpenAddDialog = () => {
    setTitle('');
    setContent('');
    setTarget('ALL');
    setUrgency('INFO');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setOpenAddDialog(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setToast({
          open: true,
          message: 'Ukuran berkas maksimal 10MB',
          severity: 'error',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitReminder = async () => {
    if (!title.trim() || !content.trim()) {
      setToast({
        open: true,
        message: 'Mohon isi judul dan pesan pengumuman!',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);

      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'reminders');

        const uploadRes = await axiosInstance.post('/gcp-item/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        fileUrl = uploadRes.data?.url;
        fileName = selectedFile.name;
      }

      const res = await axiosInstance.post(endpoints.notification.reminder, {
        title,
        content,
        target,
        urgency,
        fileUrl,
        fileName,
      });

      setToast({
        open: true,
        message: res.data?.message || 'Pengumuman berhasil disiarkan!',
        severity: 'success',
      });

      handleCloseAddDialog();
      fetchReminders();
    } catch (error: any) {
      console.error('Failed to create reminder:', error);
      setToast({
        open: true,
        message: error?.message || 'Gagal mengirim pengumuman',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = (item: any) => {
    setSelectedReminder(item);
    setOpenDetailDialog(true);
  };

  const handleOpenConfirmDelete = (row: any) => {
    setReminderToDelete(row);
    setOpenDeleteDialog(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenDeleteDialog(false);
    setReminderToDelete(null);
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(endpoints.notification.deleteReminder(reminderToDelete.id));
      setToast({
        open: true,
        message: 'Pengumuman dan seluruh notifikasi terkait berhasil dihapus!',
        severity: 'success',
      });
      handleCloseConfirmDelete();
      fetchReminders();
    } catch (error: any) {
      console.error('Failed to delete reminder:', error);
      setToast({
        open: true,
        message: error?.message || 'Gagal menghapus pengumuman',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Calculations for KPI Cards
  const totalReminders = reminders.length;
  const targetPesertaCount = reminders.filter((r) => r.target === 'PESERTA').length;
  const targetMentorCount = reminders.filter((r) => r.target === 'MENTOR').length;
  const targetAllCount = reminders.filter((r) => r.target === 'ALL').length;

  // Filtered List
  const filteredReminders = reminders.filter((item) => {
    const matchesTarget = filterTarget === 'ALL_FILTER' || item.target === filterTarget;
    const matchesKeyword =
      !searchKeyword ||
      item.title?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesTarget && matchesKeyword;
  });

  const getTargetBadge = (targetVal: string) => {
    let label = 'Semua (Umum)';
    let icon = 'solar:global-bold-duotone';
    if (targetVal === 'PESERTA') {
      label = 'Peserta Magang';
      icon = 'solar:users-group-rounded-bold-duotone';
    } else if (targetVal === 'MENTOR') {
      label = 'Mentor';
      icon = 'solar:user-id-bold-duotone';
    } else if (targetVal === 'VP') {
      label = 'VP / Manajemen';
      icon = 'solar:shield-user-bold-duotone';
    }

    return (
      <Chip
        icon={<Iconify icon={icon} width={14} sx={{ color: '#64748B !important' }} />}
        label={label}
        size="small"
        sx={{
          bgcolor: '#F1F5F9',
          color: '#334155',
          fontWeight: 600,
          border: '1px solid #E2E8F0',
          borderRadius: 1,
          fontSize: '0.75rem',
          height: 24,
          '& .MuiChip-icon': {
            ml: 0.75,
          },
        }}
      />
    );
  };

  const getUrgencyBadge = (urgencyVal: string) => {
    switch (urgencyVal) {
      case 'URGENT':
        return (
          <Chip
            icon={<Iconify icon="solar:danger-triangle-bold" width={14} sx={{ color: '#DC2626 !important' }} />}
            label="Mendesak"
            size="small"
            sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 600, border: '1px solid #FECACA', borderRadius: 1, fontSize: '0.75rem', height: 24 }}
          />
        );
      case 'WARNING':
        return (
          <Chip
            icon={<Iconify icon="solar:bell-bold" width={14} sx={{ color: '#D97706 !important' }} />}
            label="Penting"
            size="small"
            sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 600, border: '1px solid #FDE68A', borderRadius: 1, fontSize: '0.75rem', height: 24 }}
          />
        );
      default:
        return (
          <Chip
            icon={<Iconify icon="solar:info-circle-bold" width={14} sx={{ color: '#0284C7 !important' }} />}
            label="Info"
            size="small"
            sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600, border: '1px solid #BAE6FD', borderRadius: 1, fontSize: '0.75rem', height: 24 }}
          />
        );
    }
  };

  return (
    <>
      <Helmet>
        <title> Reminder & Pengumuman Admin | SI-Magang PTPL</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <DashboardBreadcrumbs current="Reminder" />

        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
              Pusat Pengumuman & Reminder Admin
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Kirim broadcast pengumuman resmi ke Peserta, Mentor, atau Seluruh Pengguna
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAddDialog}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 1.5,
              height: 40,
              px: 2.5,
              boxShadow: 'none',
            }}
          >
            Buat Reminder / Pengumuman
          </Button>
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
                  <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Pengumuman</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{totalReminders}</Typography>
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
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Untuk Peserta</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#16A34A', fontWeight: 'bold' }}>{targetPesertaCount}</Typography>
            </Card>
          </Grid>
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
                  <Iconify icon="solar:user-id-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Untuk Mentor</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>{targetMentorCount}</Typography>
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
                  <Iconify icon="solar:global-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Umum (Semua Role)</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 'bold' }}>{targetAllCount}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                <InputLabel>Target Role</InputLabel>
                <Select
                  label="Target Role"
                  value={filterTarget}
                  onChange={(e) => setFilterTarget(e.target.value)}
                >
                  <MenuItem value="ALL_FILTER">Semua Target</MenuItem>
                  <MenuItem value="ALL">Semua (Umum)</MenuItem>
                  <MenuItem value="PESERTA">Peserta Saja</MenuItem>
                  <MenuItem value="MENTOR">Mentor Saja</MenuItem>
                  <MenuItem value="VP">VP Saja</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={9} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari judul pengumuman atau isi pesan..."
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
                  setFilterTarget('ALL_FILTER');
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
            ) : filteredReminders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Belum ada pengumuman yang sesuai</Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 260, maxWidth: 360 }}>Judul Pengumuman</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 140, whiteSpace: 'nowrap' }}>Target Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 120, whiteSpace: 'nowrap' }}>Tingkat Urgensi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>Lampiran Berkas</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 160, whiteSpace: 'nowrap' }}>Pengirim</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 150, whiteSpace: 'nowrap' }}>Waktu Kirim</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', width: 100, whiteSpace: 'nowrap' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReminders.map((row) => (
                    <TableRow key={row.id} hover sx={{ '& td': { verticalAlign: 'middle', py: 1.5 } }}>
                      <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>
                        <Tooltip
                          title={row.title || ''}
                          arrow
                          placement="top-start"
                          disableHoverListener={!row.title || row.title.length < 40}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: '#0F172A',
                              lineHeight: 1.45,
                              wordBreak: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              cursor: row.title?.length >= 40 ? 'help' : 'default',
                            }}
                          >
                            {row.title}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getTargetBadge(row.target)}</TableCell>
                      <TableCell>{getUrgencyBadge(row.urgency)}</TableCell>
                      <TableCell>
                        {row.fileUrl ? (
                          <Chip
                            icon={<Iconify icon="solar:paperclip-linear" width={16} />}
                            label={row.fileName || 'Lihat Berkas'}
                            size="small"
                            color="info"
                            variant="outlined"
                            component="a"
                            href={row.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            clickable
                            sx={{
                              maxWidth: 180,
                              fontWeight: 600,
                              cursor: 'pointer',
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              },
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Tidak ada
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.createdBy?.name || 'Admin Human Capital'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateIndo(row.createdAt)}</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton
                          size="small"
                          color="primary"
                          sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }}
                          onClick={() => handleOpenDetail(row)}
                          title="Lihat Detail Pesan"
                        >
                          <Iconify icon="solar:eye-bold-duotone" width={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }}
                          onClick={() => handleOpenConfirmDelete(row)}
                          title="Hapus Pengumuman & Notifikasi"
                        >
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      </Container>

      {/* Dialog Buat Reminder / Pengumuman */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:volume-loud-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">
              Buat Reminder / Broadcast Baru
            </Typography>
          </Box>
          <IconButton onClick={handleCloseAddDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
                Judul Pengumuman / Reminder *
              </Typography>
              <TextField
                fullWidth
                placeholder="Contoh: Batas Akhir Unggah Laporan Mingguan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
                  Target Penerima *
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                  >
                    <MenuItem value="ALL">Semua (Umum Seluruh Role)</MenuItem>
                    <MenuItem value="PESERTA">Peserta Magang Saja</MenuItem>
                    <MenuItem value="MENTOR">Mentor Pembimbing Saja</MenuItem>
                    <MenuItem value="VP">VP / Pimpinan Saja</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
                  Tingkat Urgensi *
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                  >
                    <MenuItem value="INFO">Info (Biru - Normal)</MenuItem>
                    <MenuItem value="WARNING">Penting (Kuning - Perlu Perhatian)</MenuItem>
                    <MenuItem value="URGENT">Mendesak (Merah - Segera)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
                Isi Pesan Pengumuman *
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Tuliskan isi pengumuman atau instruksi yang perlu disampaikan kepada target pengguna..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Box>

            {/* Upload File Opsional */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Lampiran Berkas / Dokumen (Opsional)
                </Typography>
                {selectedFile && (
                  <Typography variant="caption" color="success.main" fontWeight="bold">
                    Berkas siap diunggah
                  </Typography>
                )}
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {!selectedFile ? (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1.5px dashed #cbd5e1',
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#004F9F',
                      bgcolor: 'rgba(0, 79, 159, 0.04)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: 'rgba(0, 79, 159, 0.1)',
                      color: '#004F9F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <Iconify icon="solar:cloud-upload-bold-duotone" width={24} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#004F9F' }}>
                    Klik untuk pilih berkas lampiran
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Format: PDF, Word, Excel, JPG, PNG (Maksimal 10MB)
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 79, 159, 0.05)',
                    border: '1px solid rgba(0, 79, 159, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 1.5,
                        bgcolor: '#004F9F',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:document-text-bold-duotone" width={22} />
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Box>

                  <Tooltip title="Hapus berkas">
                    <IconButton size="small" color="error" onClick={handleRemoveFile}>
                      <Iconify icon="eva:close-circle-fill" width={20} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
              Pesan ini akan otomatis disiarkan langsung ke lonceng notifikasi seluruh akun dengan role yang dipilih.
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseAddDialog} color="inherit" disabled={submitting}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReminder}
            disabled={submitting}
            sx={{ px: 4, bgcolor: '#004F9F' }}
          >
            {submitting ? 'Menyiarkan...' : 'Siarkan Pengumuman'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Detail Reminder */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            boxShadow: '0 20px 50px rgba(0, 79, 159, 0.15)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: 'rgba(0, 79, 159, 0.1)',
                color: '#004F9F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:bell-bing-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', lineHeight: 1.2 }}>
                Detail Pengumuman & Reminder
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Informasi lengkap pesan siaran pengumuman resmi
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpenDetailDialog(false)}
            size="small"
            sx={{
              color: '#64748B',
              borderRadius: 1,
              '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A' },
            }}
          >
            <Iconify icon="eva:close-fill" width={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3.5, overflowY: 'auto' }}>
          {selectedReminder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              {/* Judul Pengumuman */}
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    display: 'block',
                    mb: 0.75,
                  }}
                >
                  Judul Pengumuman
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#0F172A',
                    fontWeight: 700,
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                    fontSize: { xs: '1.05rem', sm: '1.2rem' },
                  }}
                >
                  {selectedReminder.title}
                </Typography>
              </Box>

              {/* Grid Metadata: Target, Urgensi, Pengirim, Waktu */}
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      bgcolor: '#FFFFFF',
                      borderRadius: 1.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Target Penerima
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {getTargetBadge(selectedReminder.target)}
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      bgcolor: '#FFFFFF',
                      borderRadius: 1.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:shield-warning-bold-duotone" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Tingkat Urgensi
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {getUrgencyBadge(selectedReminder.urgency)}
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      bgcolor: '#FFFFFF',
                      borderRadius: 1.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:user-circle-bold-duotone" width={20} />
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Pengirim
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#1E293B" noWrap>
                        {selectedReminder.createdBy?.name || 'Admin Human Capital'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      bgcolor: '#FFFFFF',
                      borderRadius: 1.5,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon="solar:calendar-date-bold-duotone" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                        Waktu Disiarkan
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#1E293B">
                        {formatDateIndo(selectedReminder.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Isi Pesan Pengumuman */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Isi Pesan Pengumuman
                </Typography>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    maxHeight: 320,
                    overflowY: 'auto',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      lineHeight: 1.75,
                      fontSize: '0.92rem',
                    }}
                  >
                    {selectedReminder.content}
                  </Typography>
                </Box>
              </Box>

              {/* Lampiran Berkas (Jika Ada) */}
              {selectedReminder.fileUrl && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Dokumen Lampiran
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(0, 79, 159, 0.04)',
                      border: '1px solid rgba(0, 79, 159, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 1.5,
                          bgcolor: '#004F9F',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="solar:document-text-bold-duotone" width={24} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{
                            color: '#0F172A',
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {selectedReminder.fileName || 'Berkas Lampiran Pengumuman'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lampiran dokumen resmi pengumuman
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      component="a"
                      href={selectedReminder.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      sx={{
                        bgcolor: '#004F9F',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        px: 2.25,
                        py: 0.85,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#003B77', boxShadow: 'none' },
                      }}
                      startIcon={<Iconify icon="solar:file-download-bold-duotone" width={18} />}
                    >
                      Unduh / Lihat Berkas
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            variant="outlined"
            sx={{
              px: 3,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 700,
              color: '#004F9F',
              borderColor: '#004F9F',
              bgcolor: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 79, 159, 0.05)',
                borderColor: '#003B77',
                color: '#003B77',
              },
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Reminder */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseConfirmDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={24} />
          <Typography variant="h6" fontWeight="bold">
            Hapus Pengumuman?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Apakah Anda yakin ingin menghapus pengumuman{' '}
            <b>"{reminderToDelete?.title}"</b>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem' }}>
            Menghapus pengumuman ini juga akan otomatis menghapus pesan terkait dari seluruh lonceng notifikasi pengguna penerima.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseConfirmDelete} color="inherit" disabled={deleting}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteReminder}
            disabled={deleting}
            sx={{ px: 3 }}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
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