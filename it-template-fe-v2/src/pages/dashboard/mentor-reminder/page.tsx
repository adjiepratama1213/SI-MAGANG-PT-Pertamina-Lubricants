import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Stack, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  RadioGroup, FormControlLabel, Radio, Autocomplete, FormControl,
  CircularProgress, Alert, Snackbar, Tooltip
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { HOST_API } from 'src/config-global';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

interface Mentee {
  id: string; // internProfileId
  userId: string;
  name: string;
  email: string;
  nim: string;
  university: string;
  program: string;
}

interface MentorReminderItem {
  id: string;
  title: string;
  content: string;
  targetType: 'semua' | 'spesifik';
  targetPesertaIds: string[];
  targetNames: string[];
  jadwal: string | null;
  openedAt: string | null;
  dueAt: string | null;
  fileUrls?: string[];
  fileNames?: string[];
  status: string;
  createdAt: string;
}

// Helper untuk format tanggal Bahasa Indonesia (contoh: Rabu, 11 Maret 2026, 00:00)
const formatIndoDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';

  const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const hari = hariList[d.getDay()];
  const tanggal = d.getDate();
  const bulan = bulanList[d.getMonth()];
  const tahun = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');

  return `${hari}, ${tanggal} ${bulan} ${tahun}, ${jam}:${menit}`;
};

const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toLocalDate = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
};
const toLocalTime = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`;
};

export default function MentorReminderPage() {
  const [reminders, setReminders] = useState<MentorReminderItem[]>([]);
  const [myMentees, setMyMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State: Tambah Reminder
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'semua' | 'spesifik'>('semua');
  const [selectedMentees, setSelectedMentees] = useState<Mentee[]>([]);

  // Jadwal Dibuka & Batas Waktu (Opsional)
  const [openedDate, setOpenedDate] = useState('');
  const [openedTime, setOpenedTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // Multi-File Upload State (Maksimal 5MB per file)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog State: Detail & Edit
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<MentorReminderItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTargetType, setEditTargetType] = useState<'semua' | 'spesifik'>('semua');
  const [editSelectedMentees, setEditSelectedMentees] = useState<Mentee[]>([]);
  const [editOpenedDate, setEditOpenedDate] = useState('');
  const [editOpenedTime, setEditOpenedTime] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDueTime, setEditDueTime] = useState('');
  const [existingFiles, setExistingFiles] = useState<{ url: string; name: string }[]>([]);
  const [editNewFiles, setEditNewFiles] = useState<File[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Dialog State: Hapus
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<MentorReminderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch daftar reminder mentor dari database
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(endpoints.notification.mentorReminder);
      setReminders(res.data || []);
    } catch (err) {
      console.error('Failed to load mentor reminders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch daftar peserta bimbingan yang dibimbing mentor ini dari database
  const fetchMentees = useCallback(async () => {
    try {
      const res = await axiosInstance.get(endpoints.notification.mentorMentees);
      setMyMentees(res.data || []);
    } catch (err) {
      console.error('Failed to load mentor mentees:', err);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
    fetchMentees();
  }, [fetchReminders, fetchMentees]);

  // Handle Dialog Tambah
  const handleOpenAddDialog = () => {
    setTitle('');
    setContent('');
    setTargetType('semua');
    setSelectedMentees([]);
    setOpenedDate('');
    setOpenedTime('');
    setDueDate('');
    setDueTime('');
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Multi-file selection (Maksimal 5MB per file)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_SIZE) {
        setToast({
          open: true,
          message: `Ukuran berkas "${file.name}" melebihi batas maksimal 5MB`,
          severity: 'error',
        });
      } else {
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Reminder Baru
  const handleCreateReminder = async () => {
    if (!title.trim()) {
      setToast({ open: true, message: 'Judul reminder harus diisi', severity: 'error' });
      return;
    }
    if (!content.trim()) {
      setToast({ open: true, message: 'Deskripsi pesan harus diisi', severity: 'error' });
      return;
    }
    if (targetType === 'spesifik' && selectedMentees.length === 0) {
      setToast({ open: true, message: 'Pilih minimal satu peserta bimbingan spesifik', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      let openedAtCombined: string | undefined;
      if (openedDate) {
        openedAtCombined = openedTime ? `${openedDate}T${openedTime}:00` : `${openedDate}T00:00:00`;
      }

      let dueAtCombined: string | undefined;
      if (dueDate) {
        dueAtCombined = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:00`;
      }

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('targetType', targetType);

      if (targetType === 'spesifik') {
        formData.append('targetPesertaIds', JSON.stringify(selectedMentees.map((m) => m.userId)));
      }

      if (openedAtCombined) {
        formData.append('openedAt', openedAtCombined);
      }
      if (dueAtCombined) {
        formData.append('dueAt', dueAtCombined);
      }

      // Lampirkan berkas (bisa lebih dari satu)
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await axiosInstance.post(endpoints.notification.mentorReminder, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setToast({
        open: true,
        message: 'Reminder berhasil dibuat & diteruskan ke notifikasi peserta!',
        severity: 'success',
      });

      handleCloseAddDialog();
      fetchReminders();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal membuat reminder';
      setToast({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Detail & Edit
  const handleOpenDetail = (reminder: MentorReminderItem) => {
    setSelectedReminder(reminder);
    setIsEditing(false);

    // Prefill form edit
    setEditTitle(reminder.title || '');
    setEditContent(reminder.content || '');
    setEditTargetType(reminder.targetType || 'semua');

    const matched = myMentees.filter(
      (m) =>
        reminder.targetPesertaIds?.includes(m.userId) ||
        reminder.targetPesertaIds?.includes(m.id) ||
        reminder.targetNames?.includes(m.name)
    );
    setEditSelectedMentees(matched);

    setEditOpenedDate(toLocalDate(reminder.openedAt));
    setEditOpenedTime(toLocalTime(reminder.openedAt));
    setEditDueDate(toLocalDate(reminder.dueAt));
    setEditDueTime(toLocalTime(reminder.dueAt));

    const files: { url: string; name: string }[] = [];
    if (reminder.fileUrls && reminder.fileUrls.length > 0) {
      reminder.fileUrls.forEach((url, idx) => {
        const name =
          reminder.fileNames?.[idx] ||
          url.split('/').pop()?.replace(/^\d+-/, '') ||
          `Berkas ${idx + 1}`;
        files.push({ url, name });
      });
    }
    setExistingFiles(files);
    setEditNewFiles([]);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }

    setOpenDetailDialog(true);
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedReminder(null);
    setIsEditing(false);
    setEditNewFiles([]);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_SIZE) {
        setToast({
          open: true,
          message: `Ukuran berkas "${file.name}" melebihi batas maksimal 5MB`,
          severity: 'error',
        });
      } else {
        newFiles.push(file);
      }
    }

    if (newFiles.length > 0) {
      setEditNewFiles((prev) => [...prev, ...newFiles]);
    }

    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleRemoveEditNewFile = (index: number) => {
    setEditNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateReminder = async () => {
    if (!selectedReminder) return;
    if (!editTitle.trim()) {
      setToast({ open: true, message: 'Judul reminder harus diisi', severity: 'error' });
      return;
    }
    if (!editContent.trim()) {
      setToast({ open: true, message: 'Deskripsi pesan harus diisi', severity: 'error' });
      return;
    }
    if (editTargetType === 'spesifik' && editSelectedMentees.length === 0) {
      setToast({ open: true, message: 'Pilih minimal satu peserta bimbingan spesifik', severity: 'error' });
      return;
    }

    try {
      setEditSubmitting(true);

      let openedAtCombined: string | undefined;
      if (editOpenedDate) {
        openedAtCombined = editOpenedTime ? `${editOpenedDate}T${editOpenedTime}:00` : `${editOpenedDate}T00:00:00`;
      }

      let dueAtCombined: string | undefined;
      if (editDueDate) {
        dueAtCombined = editDueTime ? `${editDueDate}T${editDueTime}:00` : `${editDueDate}T23:59:00`;
      }

      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('content', editContent.trim());
      formData.append('targetType', editTargetType);

      if (editTargetType === 'spesifik') {
        formData.append('targetPesertaIds', JSON.stringify(editSelectedMentees.map((m) => m.userId)));
      } else {
        formData.append('targetPesertaIds', JSON.stringify([]));
      }

      if (openedAtCombined) {
        formData.append('openedAt', openedAtCombined);
      } else {
        formData.append('openedAt', '');
      }

      if (dueAtCombined) {
        formData.append('dueAt', dueAtCombined);
      } else {
        formData.append('dueAt', '');
      }

      formData.append('existingFileUrls', JSON.stringify(existingFiles.map((f) => f.url)));
      formData.append('existingFileNames', JSON.stringify(existingFiles.map((f) => f.name)));

      editNewFiles.forEach((file) => {
        formData.append('files', file);
      });

      await axiosInstance.patch(endpoints.notification.updateMentorReminder(selectedReminder.id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setToast({
        open: true,
        message: 'Reminder berhasil diperbarui!',
        severity: 'success',
      });

      handleCloseDetail();
      fetchReminders();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Gagal memperbarui reminder';
      setToast({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Hapus
  const handleOpenDelete = (reminder: MentorReminderItem) => {
    setReminderToDelete(reminder);
    setOpenDeleteDialog(true);
  };
  const handleCloseDelete = () => {
    setOpenDeleteDialog(false);
    setReminderToDelete(null);
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;
    try {
      setDeleting(true);
      await axiosInstance.delete(endpoints.notification.deleteMentorReminder(reminderToDelete.id));
      setToast({ open: true, message: 'Reminder berhasil dihapus', severity: 'success' });
      handleCloseDelete();
      fetchReminders();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Gagal menghapus reminder';
      setToast({ open: true, message: errMsg, severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search
  const filteredReminders = useMemo(() => {
    return reminders.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetNames?.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSearch;
    });
  }, [reminders, searchQuery]);

  const paginatedData = useMemo(() => {
    return filteredReminders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredReminders, page, rowsPerPage]);

  return (
    <>
      <Helmet>
        <title>Reminder Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Reminder */}
        <DashboardBreadcrumbs current="Reminder" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
              Reminder Peserta Bimbingan
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Kirimkan informasi pengingat, instruksi tugas, dan tenggat waktu langsung ke notifikasi peserta bimbingan Anda di PT Pertamina Lubricants.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenAddDialog}
            startIcon={<Iconify icon="mingcute:add-line" width={20} />}
            sx={{
              bgcolor: '#004F9F',
              color: '#FFFFFF',
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'none',
              px: 2.5,
              py: 1,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#003366' },
            }}
          >
            Buat Reminder
          </Button>
        </Box>

        {/* Filter Card */}
        <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Cari judul, isi pengingat, atau nama peserta..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
            />

            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setSearchQuery('');
                setPage(0);
              }}
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

        {/* Table Card */}
        <Card sx={{ p: 0, border: '1px solid #E2E8F0', boxShadow: 'none', borderRadius: 2, bgcolor: '#FFFFFF' }}>
          <Box sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A' }}>Daftar Reminder</Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Total {filteredReminders.length} reminder aktif terdaftar di sistem
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Judul</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Tujuan</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Jadwal / Waktu Pelaksanaan</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', width: 140 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Memuat data reminder...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:bell-bing-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada reminder yang dibuat</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleOpenAddDialog}
                        sx={{ mt: 2, textTransform: 'none' }}
                        startIcon={<Iconify icon="mingcute:add-line" />}
                      >
                        Buat Reminder Pertama
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => {
                    const targetLabel =
                      row.targetType === 'semua'
                        ? 'Semua Peserta Bimbingan'
                        : row.targetNames && row.targetNames.length > 0
                        ? row.targetNames.join(', ')
                        : 'Peserta Spesifik';

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <span>{row.title}</span>
                            {row.fileUrls && row.fileUrls.length > 0 && (
                              <Tooltip title={`${row.fileUrls.length} berkas terlampir`}>
                                <Chip
                                  size="small"
                                  icon={<Iconify icon="solar:paperclip-bold" width={12} />}
                                  label={row.fileUrls.length}
                                  sx={{ height: 20, fontSize: '0.7rem', px: 0.5, bgcolor: '#f1f5f9' }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 260 }} title={targetLabel}>
                            {targetLabel}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {row.openedAt || row.dueAt ? (
                            <Stack spacing={0.3}>
                              {row.openedAt && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 80 }}>
                                    Dibuka:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                    {formatIndoDateTime(row.openedAt)}
                                  </Typography>
                                </Box>
                              )}
                              {row.dueAt && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#dc2626', minWidth: 80 }}>
                                    Batas Waktu:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                                    {formatIndoDateTime(row.dueAt)}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {formatIndoDateTime(row.createdAt)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const statusText = row.status || 'Terkirim';
                            const isPending = /menunggu|draft/i.test(statusText);
                            const isDanger = /batal|kadaluarsa/i.test(statusText);
                            const statusColor = isPending ? '#F59E0B' : isDanger ? '#EC2028' : '#16A34A';
                            return (
                              <Chip
                                label={statusText}
                                size="small"
                                variant="outlined"
                                sx={{
                                  minWidth: 90,
                                  bgcolor: '#FFFFFF',
                                  borderColor: statusColor,
                                  borderWidth: 1.5,
                                  borderStyle: 'solid',
                                  color: statusColor,
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  borderRadius: 1,
                                  height: 28,
                                  letterSpacing: '0.3px',
                                  '& .MuiChip-label': { px: 1, fontWeight: 700 },
                                  '&:hover': { bgcolor: '#FFFFFF' },
                                }}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Lihat & Edit Reminder">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDetail(row)}
                                sx={{
                                  color: '#004F9F',
                                  bgcolor: 'rgba(0, 79, 159, 0.08)',
                                  '&:hover': { bgcolor: 'rgba(0, 79, 159, 0.16)' },
                                }}
                              >
                                <Iconify icon="solar:eye-bold" width={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus Reminder">
                              <IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Tooltip>
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
            count={filteredReminders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Baris per halaman:"
          />
        </Card>
      </Container>

      {/* Add Reminder Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:bell-bing-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Tambah Reminder Baru</Typography>
          </Box>
          <IconButton onClick={handleCloseAddDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Judul Reminder */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Judul Reminder</Typography>
              <TextField
                fullWidth
                size="small"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengingat Mengisi Presensi & Logbook Mingguan"
              />
            </Box>

            {/* Tujuan Reminder */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Tujuan Peserta</Typography>
              <FormControl component="fieldset">
                <RadioGroup row value={targetType} onChange={(e) => setTargetType(e.target.value as any)}>
                  <FormControlLabel
                    value="semua"
                    control={<Radio />}
                    label={`Semua Peserta Bimbingan (${myMentees.length} peserta)`}
                  />
                  <FormControlLabel
                    value="spesifik"
                    control={<Radio />}
                    label="Peserta Spesifik"
                  />
                </RadioGroup>
              </FormControl>

              {targetType === 'spesifik' && (
                <Box sx={{ mt: 1.5 }}>
                  <Autocomplete
                    multiple
                    options={myMentees}
                    getOptionLabel={(option) => `${option.name} (${option.university || option.nim})`}
                    value={selectedMentees}
                    onChange={(event, newValue) => setSelectedMentees(newValue)}
                    isOptionEqualToValue={(option, value) => option.userId === value.userId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Pilih peserta bimbingan Anda..."
                        helperText="Hanya menampilkan peserta yang terdaftar dibimbing oleh Anda di database."
                      />
                    )}
                  />
                </Box>
              )}
            </Box>

            {/* Deskripsi Pesan */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Deskripsi Pesan / Instruksi
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan isi pesan pengingat atau instruksi secara detail..."
              />
            </Box>

            {/* Lampiran Berkas (Bisa lebih dari 1, Maksimal 5MB) */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Lampiran Berkas (Opsional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Maksimal 5MB per berkas (Bisa lebih dari 1 file)
                </Typography>
              </Box>

              <label htmlFor="mentor-reminder-files">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="mentor-reminder-files"
                />
                <Box
                  sx={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 2,
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: '#f8fafc',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#004F9F',
                      bgcolor: 'rgba(0, 79, 159, 0.04)',
                    },
                  }}
                >
                  <Iconify icon="solar:cloud-upload-bold-duotone" width={36} sx={{ color: '#004F9F', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Klik untuk memilih berkas atau dokumen
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mendukung berkas PDF, Word, Excel, PPT, Gambar (Maks 5MB per berkas)
                  </Typography>
                </Box>
              </label>

              {/* Daftar Berkas Terpilih */}
              {selectedFiles.length > 0 && (
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {selectedFiles.map((file, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.2,
                        px: 2,
                        bgcolor: 'white',
                        borderRadius: 1.5,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Iconify icon="solar:document-bold" sx={{ color: '#004F9F', flexShrink: 0 }} />
                        <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: { xs: 200, sm: 350 } }}>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemoveFile(idx)}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Jadwal / Waktu Pelaksanaan (Opsional) */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Jadwal / Waktu Pelaksanaan (Opsional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Atur waktu dibuka dan batas akhir pelaksanaan jika diperlukan
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {/* Waktu Dibuka (Opened) */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#004F9F', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={18} />
                      Waktu Dibuka (Opened)
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Tanggal Dibuka"
                        value={openedDate}
                        onChange={(e) => setOpenedDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="time"
                        label="Jam Dibuka"
                        value={openedTime}
                        onChange={(e) => setOpenedTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                  </Box>
                </Grid>

                {/* Batas Waktu (Due) */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #fee2e2' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="solar:alarm-bold-duotone" width={18} />
                      Batas Waktu (Due)
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Tanggal Batas Waktu"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="time"
                        label="Jam Batas Waktu"
                        value={dueTime}
                        onChange={(e) => setDueTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseAddDialog} color="inherit" sx={{ fontWeight: 600, px: 3 }}>
            Tutup
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateReminder}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:plain-bold" />}
            sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, textTransform: 'none', fontWeight: 600 }}
          >
            {submitting ? 'Mengirim...' : 'Kirim Reminder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail / Edit Reminder Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#004F9F' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify
              icon={isEditing ? 'solar:pen-bold-duotone' : 'solar:document-text-bold-duotone'}
              width={28}
              sx={{ mr: 1.5 }}
            />
            <Typography variant="h6" fontWeight="bold">
              {isEditing ? 'Edit Reminder' : 'Detail Reminder'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetail} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 1 }}>
          {selectedReminder && (
            isEditing ? (
              /* MODE EDIT */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                {/* Judul Reminder */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Judul Reminder
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Contoh: Pengingat Mengisi Presensi & Logbook Mingguan"
                  />
                </Box>

                {/* Tujuan Peserta */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Tujuan Peserta
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={editTargetType}
                      onChange={(e) => setEditTargetType(e.target.value as any)}
                    >
                      <FormControlLabel
                        value="semua"
                        control={<Radio />}
                        label={`Semua Peserta Bimbingan (${myMentees.length} peserta)`}
                      />
                      <FormControlLabel
                        value="spesifik"
                        control={<Radio />}
                        label="Peserta Spesifik"
                      />
                    </RadioGroup>
                  </FormControl>

                  {editTargetType === 'spesifik' && (
                    <Box sx={{ mt: 1.5 }}>
                      <Autocomplete
                        multiple
                        options={myMentees}
                        getOptionLabel={(option) => `${option.name} (${option.university || option.nim})`}
                        value={editSelectedMentees}
                        onChange={(event, newValue) => setEditSelectedMentees(newValue)}
                        isOptionEqualToValue={(option, value) => option.userId === value.userId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Pilih peserta bimbingan Anda..."
                            helperText="Hanya menampilkan peserta yang terdaftar dibimbing oleh Anda di database."
                          />
                        )}
                      />
                    </Box>
                  )}
                </Box>

                {/* Deskripsi / Instruksi */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Deskripsi / Instruksi Reminder
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Tuliskan pesan instruksi pengingat untuk peserta magang..."
                  />
                </Box>

                {/* Lampiran Berkas (Multiple File Upload) */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:paperclip-bold-duotone" width={20} sx={{ color: '#004F9F' }} />
                    Lampiran Berkas (Opsional, Maks. 5MB per file)
                  </Typography>

                  {/* Berkas yang Sudah Ada */}
                  {existingFiles.length > 0 && (
                    <Box sx={{ mb: 1.5, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                        Berkas Sebelumnya ({existingFiles.length} file):
                      </Typography>
                      <Stack spacing={1}>
                        {existingFiles.map((file, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              px: 1.5,
                              bgcolor: 'white',
                              borderRadius: 1,
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                              <Iconify icon="solar:document-text-bold" width={18} sx={{ color: '#004F9F', flexShrink: 0 }} />
                              <Typography variant="body2" noWrap sx={{ maxWidth: 380, fontWeight: 500 }}>
                                {file.name}
                              </Typography>
                            </Box>
                            <Tooltip title="Hapus Berkas Ini">
                              <IconButton size="small" color="error" onClick={() => handleRemoveExistingFile(idx)}>
                                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Berkas Baru yang Dipilih */}
                  {editNewFiles.length > 0 && (
                    <Box sx={{ mb: 1.5, p: 2, bgcolor: '#eff6ff', borderRadius: 1.5, border: '1px solid #bfdbfe' }}>
                      <Typography variant="caption" color="#1e40af" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                        Berkas Baru Ditambahkan ({editNewFiles.length} file):
                      </Typography>
                      <Stack spacing={1}>
                        {editNewFiles.map((file, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              px: 1.5,
                              bgcolor: 'white',
                              borderRadius: 1,
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                              <Iconify icon="solar:file-check-bold" width={18} sx={{ color: '#16a34a', flexShrink: 0 }} />
                              <Typography variant="body2" noWrap sx={{ maxWidth: 380, fontWeight: 500 }}>
                                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                              </Typography>
                            </Box>
                            <IconButton size="small" color="error" onClick={() => handleRemoveEditNewFile(idx)}>
                              <Iconify icon="solar:close-circle-bold" width={18} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <input
                    type="file"
                    multiple
                    ref={editFileInputRef}
                    onChange={handleEditFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:upload-bold-duotone" />}
                    onClick={() => editFileInputRef.current?.click()}
                    sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: 'text.primary' }}
                  >
                    Tambah Berkas Lainnya
                  </Button>
                </Box>

                {/* Jadwal Pelaksanaan (Dibuka & Batas Waktu) */}
                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#004F9F' }}>
                    <Iconify icon="solar:calendar-date-bold-duotone" width={22} />
                    Jadwal / Waktu Pelaksanaan (Opsional)
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Tanggal Dibuka */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0369a1', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:calendar-mark-bold-duotone" width={18} />
                          Dibuka (Opened)
                        </Typography>
                        <Stack spacing={1.5}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Tanggal Dibuka"
                            value={editOpenedDate}
                            onChange={(e) => setEditOpenedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Jam Dibuka"
                            value={editOpenedTime}
                            onChange={(e) => setEditOpenedTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Batas Waktu (Due) */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #fee2e2' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:alarm-bold-duotone" width={18} />
                          Batas Waktu (Due)
                        </Typography>
                        <Stack spacing={1.5}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Tanggal Batas Waktu"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            size="small"
                            type="time"
                            label="Jam Batas Waktu"
                            value={editDueTime}
                            onChange={(e) => setEditDueTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            ) : (
              /* MODE DETAIL (LIHAT) */
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Judul
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedReminder.title}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedReminder.status || 'Terkirim'}
                      color="success"
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Target Peserta Penerima
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {selectedReminder.targetType === 'semua'
                      ? 'Semua Peserta Bimbingan'
                      : selectedReminder.targetNames?.join(', ') || 'Peserta Spesifik'}
                  </Typography>
                </Box>

                {/* Jadwal Pelaksanaan Bahasa Indonesia */}
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                    Jadwal / Waktu Pelaksanaan
                  </Typography>
                  {selectedReminder.openedAt && (
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Dibuka:</strong> {formatIndoDateTime(selectedReminder.openedAt)}
                    </Typography>
                  )}
                  {selectedReminder.dueAt && (
                    <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
                      <strong>Batas Waktu:</strong> {formatIndoDateTime(selectedReminder.dueAt)}
                    </Typography>
                  )}
                  {!selectedReminder.openedAt && !selectedReminder.dueAt && (
                    <Typography variant="body2" color="text.secondary">
                      Dibuat pada: {formatIndoDateTime(selectedReminder.createdAt)}
                    </Typography>
                  )}
                </Box>

                {/* Lampiran Berkas Jika Ada */}
                {selectedReminder.fileUrls && selectedReminder.fileUrls.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                      Lampiran Berkas ({selectedReminder.fileUrls.length} file)
                    </Typography>
                    <Stack spacing={1}>
                      {selectedReminder.fileUrls.map((url, idx) => {
                        const fileName =
                          selectedReminder.fileNames?.[idx] ||
                          url.split('/').pop()?.replace(/^\d+-/, '') ||
                          `Berkas ${idx + 1}`;
                        const fullUrl = `${HOST_API}${url.replace(/^\//, '')}`;

                        return (
                          <Button
                            key={idx}
                            variant="outlined"
                            size="small"
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
                            sx={{
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              color: 'text.primary',
                              borderColor: '#cbd5e1',
                              bgcolor: 'white',
                              '&:hover': { borderColor: '#004F9F', color: '#004F9F' },
                            }}
                          >
                            {fileName}
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                    Isi Pesan / Instruksi
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                    {selectedReminder.content}
                  </Typography>
                </Box>
              </Stack>
            )
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                color="inherit"
                disabled={editSubmitting}
                sx={{ fontWeight: 600, px: 3 }}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateReminder}
                disabled={editSubmitting}
                sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, textTransform: 'none', fontWeight: 600 }}
              >
                {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleCloseDetail}
                color="inherit"
                sx={{ fontWeight: 600, px: 3 }}
              >
                Tutup
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
                sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, textTransform: 'none', fontWeight: 600 }}
              >
                Edit Reminder
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pb: 1, display: 'flex', alignItems: 'center', color: 'error.main' }}>
          <Iconify icon="solar:danger-triangle-bold" width={26} sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">Hapus Reminder?</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Apakah Anda yakin ingin menghapus reminder{' '}
            <strong>"{reminderToDelete?.title}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={handleCloseDelete} color="inherit" sx={{ fontWeight: 600 }}>
            Tutup
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteReminder}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ fontWeight: 600, textTransform: 'none' }}
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
