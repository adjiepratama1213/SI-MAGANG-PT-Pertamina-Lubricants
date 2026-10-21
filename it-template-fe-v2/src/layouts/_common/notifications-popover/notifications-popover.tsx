import { m } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useRouter } from 'src/hooks/use-router';
// utils
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { fToNow } from 'src/utils/format-time';
import { HOST_API } from 'src/config-global';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
//
import NotificationItem, { NotificationData } from './notification-item';

// ----------------------------------------------------------------------

const formatDateIndo = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeAgoIndo = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari yang lalu`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} bulan yang lalu`;
  return `${Math.floor(diffDay / 365)} tahun yang lalu`;
};

const formatIndoScheduleDate = (dateStr: string | Date | undefined) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';

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

  return `${hari}, ${tanggal} ${bulan} ${tahun} pukul ${jam}.${menit}`;
};

const parseNotificationContent = (notification: NotificationData) => {
  let cleanMessage = notification.message || '';
  let openedText = '';
  let dueText = '';

  const openedMatch = cleanMessage.match(/Dibuka:\s*([^\n\r]+)/i);
  const dueMatch = cleanMessage.match(/Batas Waktu:\s*([^\n\r]+)/i);

  if (openedMatch) {
    openedText = openedMatch[1].trim();
  } else if (notification.metadata?.openedAt) {
    openedText = formatIndoScheduleDate(notification.metadata.openedAt);
  }

  if (dueMatch) {
    dueText = dueMatch[1].trim();
  } else if (notification.metadata?.dueAt) {
    dueText = formatIndoScheduleDate(notification.metadata.dueAt);
  }

  cleanMessage = cleanMessage
    .replace(/Dibuka:\s*[^\n\r]+/gi, '')
    .replace(/Batas Waktu:\s*[^\n\r]+/gi, '')
    .trim();

  return {
    cleanMessage,
    openedText,
    dueText,
    hasSchedule: Boolean(openedText || dueText),
  };
};

const getAttachedFiles = (metadata: any) => {
  if (!metadata) return [];
  const files: { url: string; name: string }[] = [];

  // Multiple files (MentorReminder)
  if (Array.isArray(metadata.fileUrls) && metadata.fileUrls.length > 0) {
    metadata.fileUrls.forEach((url: string, idx: number) => {
      if (url) {
        const name = metadata.fileNames?.[idx] || url.split('/').pop()?.replace(/^\d+-/, '') || `Berkas ${idx + 1}`;
        files.push({ url, name });
      }
    });
  }

  // Single file (AdminReminder)
  if (metadata.fileUrl && !files.some((f) => f.url === metadata.fileUrl)) {
    const name = metadata.fileName || metadata.fileUrl.split('/').pop()?.replace(/^\d+-/, '') || 'Berkas Lampiran';
    files.push({ url: metadata.fileUrl, name });
  }

  return files;
};

const getFileDownloadUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${HOST_API}${url.replace(/^\//, '')}`;
};

export default function NotificationsPopover() {
  const router = useRouter();
  const drawer = useBoolean();
  const smUp = useResponsive('up', 'sm');

  const [currentTab, setCurrentTab] = useState('all');
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detail Modal State
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(endpoints.notification.list);
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Also refetch when drawer is opened
  useEffect(() => {
    if (drawer.value) {
      fetchNotifications();
    }
  }, [drawer.value, fetchNotifications]);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await axiosInstance.patch(endpoints.notification.markAllRead);
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Open detail dialog on item click
  const handleClickItem = async (item: NotificationData) => {
    setSelectedNotification(item);
    setOpenDetailDialog(true);

    if (!item.isRead) {
      try {
        await axiosInstance.patch(endpoints.notification.markRead(item.id));
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === item.id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyMessage = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedNotification(null);
    setCopiedMessage(false);
  };

  // Filter based on tab and search query
  const filteredNotifications = notifications.filter((item) => {
    if (currentTab === 'unread' && item.isRead) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  const TABS = [
    {
      value: 'all',
      label: 'Semua',
      count: notifications.length,
    },
    {
      value: 'unread',
      label: 'Belum Dibaca',
      count: unreadCount,
    },
  ];

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1.5, minHeight: 68 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Pusat Notifikasi
        </Typography>
        {unreadCount > 0 && (
          <Label color="error" variant="filled">
            {unreadCount} Baru
          </Label>
        )}
      </Stack>

      {unreadCount > 0 && (
        <Tooltip title="Tandai semua sudah dibaca">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Muat ulang">
        <IconButton onClick={fetchNotifications}>
          <Iconify icon="solar:restart-bold" />
        </IconButton>
      </Tooltip>

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        px: 2,
        '& .MuiTab-root': {
          minHeight: 44,
          fontWeight: 600,
          fontSize: '0.85rem',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={tab.value === currentTab ? 'filled' : 'soft'}
              color={tab.value === 'unread' ? 'error' : 'default'}
              sx={{ ml: 0.5 }}
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </Tabs>
  );

  const renderSearch = (
    <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Cari notifikasi atau pesan..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          bgcolor: 'white',
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 18 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <Iconify icon="eva:close-fill" width={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
    </Box>
  );

  const renderList = (
    <Scrollbar sx={{ flexGrow: 1 }}>
      {loading && notifications.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : filteredNotifications.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10, px: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(0, 79, 159, 0.08)',
              color: '#004F9F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Iconify icon="solar:bell-bing-bold-duotone" width={32} />
          </Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {searchQuery ? 'Hasil Tidak Ditemukan' : 'Tidak Ada Notifikasi'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 280 }}>
            {searchQuery
              ? `Tidak ada notifikasi yang cocok dengan kata kunci "${searchQuery}".`
              : currentTab === 'unread'
                ? 'Semua notifikasi sudah Anda baca.'
                : 'Belum ada aktivitas notifikasi terbaru.'}
          </Typography>
        </Stack>
      ) : (
        <List disablePadding>
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClickItem={handleClickItem}
            />
          ))}
        </List>
      )}
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
        sx={{
          color: drawer.value ? 'primary.main' : 'text.secondary',
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        disableScrollLock
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        PaperProps={{
          sx: { width: 1, maxWidth: 440, display: 'flex', flexDirection: 'column' },
        }}
      >
        {renderHead}

        <Divider />

        {renderTabs}

        {renderSearch}

        {renderList}
      </Drawer>

      {/* Dialog Detail Pesan Notifikasi */}
      <Dialog
        disableScrollLock
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            maxWidth: { xs: '100%', sm: 630 },
            maxHeight: '90vh',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            py: 2.25,
            px: { xs: 2.5, sm: 3.5 },
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1.75,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:bell-bing-bold-duotone" width={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', lineHeight: 1.3, fontSize: '1.05rem' }}>
                Detail Notifikasi
              </Typography>

            </Box>
          </Box>
          <IconButton
            onClick={handleCloseDetail}
            size="small"
            sx={{
              color: '#64748b',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 1.25,
              '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a', borderColor: '#cbd5e1' },
              p: 0.75,
              transition: 'all 0.15s ease',
            }}
          >
            <Iconify icon="eva:close-fill" width={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            py: { xs: '20px !important', sm: '24px !important' },
            px: { xs: '20px !important', sm: '32px !important' },
            bgcolor: '#ffffff',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 },
          }}
        >
          {selectedNotification && (() => {
            const { cleanMessage, openedText, dueText, hasSchedule } = parseNotificationContent(selectedNotification);
            const attachedFiles = getAttachedFiles(selectedNotification.metadata);

            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                {/* Meta Bar: Kategori, Prioritas, & Tanggal */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1.25}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<Iconify icon="solar:tag-bold-duotone" width={14} />}
                      label={
                        selectedNotification.category === 'REMINDER_ADMIN'
                          ? 'Pengumuman Admin'
                          : selectedNotification.category === 'REMINDER_MENTOR'
                            ? 'Pengingat Mentor'
                            : selectedNotification.category === 'FEEDBACK_PESERTA'
                              ? 'Feedback Peserta'
                              : selectedNotification.category === 'PRESENSI'
                                ? 'Presensi & Izin'
                                : selectedNotification.category === 'LAPORAN'
                                  ? 'Laporan Magang'
                                  : selectedNotification.category === 'BERKAS'
                                    ? 'Administrasi'
                                    : selectedNotification.category === 'EVALUASI'
                                      ? 'Evaluasi & Nilai'
                                      : selectedNotification.category === 'APPROVAL_VP'
                                        ? 'Approval VP'
                                        : 'Informasi'
                      }
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.76rem',
                        height: 26,
                        bgcolor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        '& .MuiChip-icon': { color: '#64748b' },
                      }}
                    />

                    {selectedNotification.type === 'URGENT' && (
                      <Chip
                        icon={<Iconify icon="solar:danger-triangle-bold" width={13} />}
                        label="Mendesak"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.74rem',
                          height: 26,
                          bgcolor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                        }}
                      />
                    )}

                    {selectedNotification.type === 'WARNING' && (
                      <Chip
                        icon={<Iconify icon="solar:alarm-bold" width={13} />}
                        label="Penting"
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.74rem',
                          height: 26,
                          bgcolor: '#fffbeb',
                          color: '#d97706',
                          border: '1px solid #fde68a',
                          borderRadius: '6px',
                        }}
                      />
                    )}
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: '#64748b' }}>
                    <Iconify icon="solar:calendar-date-bold-duotone" width={15} sx={{ color: '#94a3b8' }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                      {formatDateIndo(selectedNotification.createdAt)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', mx: 0.25 }}>•</Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>
                      {formatTimeAgoIndo(selectedNotification.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Judul Pengumuman */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.45,
                      fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {selectedNotification.title.replace(/^\[(PENGUMUMAN|PENGINGAT MENTOR)\]\s*/i, '')}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: '#f1f5f9' }} />

                {/* Jadwal Pelaksanaan (Dibuka & Batas Waktu) */}
                {hasSchedule && (
                  <Grid container spacing={1.5}>
                    {openedText && (
                      <Grid item xs={12} sm={dueText ? 6 : 12}>
                        <Box
                          sx={{
                            p: 1.75,
                            borderRadius: 1.75,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 1.5,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon="solar:calendar-mark-bold-duotone" width={19} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.25 }}>
                              Waktu Dibuka
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#0f172a',
                                fontWeight: 600,
                                fontSize: '0.84rem',
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                              }}
                            >
                              {openedText}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {dueText && (
                      <Grid item xs={12} sm={openedText ? 6 : 12}>
                        <Box
                          sx={{
                            p: 1.75,
                            borderRadius: 1.75,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 1.5,
                              bgcolor: '#fef2f2',
                              border: '1px solid #fee2e2',
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon="solar:alarm-bold-duotone" width={19} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600, display: 'block', mb: 0.25 }}>
                              Batas Waktu (Tenggat)
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#0f172a',
                                fontWeight: 600,
                                fontSize: '0.84rem',
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                              }}
                            >
                              {dueText}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}

                {/* Isi Pesan / Deskripsi Notifikasi */}
                {cleanMessage && (
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header Deskripsi */}
                    <Box
                      sx={{
                        px: 2.25,
                        py: 1.25,
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: '#475569',
                          fontSize: '0.78rem',
                        }}
                      >
                        Isi Pesan
                      </Typography>
                    </Box>

                    {/* Body Deskripsi */}
                    <Box
                      sx={{
                        p: { xs: 2.25, sm: 2.75 },
                        minHeight: 110,
                        maxHeight: 290,
                        overflowY: 'auto',
                        bgcolor: '#ffffff',
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 },
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          lineHeight: 1.75,
                          fontSize: '0.92rem',
                          color: '#334155',
                        }}
                      >
                        {cleanMessage}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Berkas Lampiran jika ada */}
                {attachedFiles.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: '#64748b',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}
                    >
                      <Iconify icon="solar:paperclip-bold-duotone" width={16} />
                      Lampiran Berkas ({attachedFiles.length})
                    </Typography>

                    <Stack spacing={1}>
                      {attachedFiles.map((file, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.75,
                            bgcolor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#cbd5e1',
                              bgcolor: '#f8fafc',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 1.25,
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Iconify icon="solar:document-text-bold-duotone" width={20} />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                noWrap
                                sx={{ color: '#1e293b', fontSize: '0.85rem' }}
                              >
                                {file.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                                Lampiran dokumen berkas
                              </Typography>
                            </Box>
                          </Box>

                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={getFileDownloadUrl(file.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            sx={{
                              color: '#0f172a',
                              borderColor: '#e2e8f0',
                              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '0.78rem',
                              px: 1.75,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                            startIcon={<Iconify icon="solar:file-download-bold-duotone" width={16} />}
                          >
                            Unduh
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions
          sx={{
            py: 2,
            px: { xs: 2.5, sm: 3.5 },
            bgcolor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={handleCloseDetail}
            variant="contained"
            sx={{
              bgcolor: '#004F9F',
              '&:hover': { bgcolor: '#003366' },
              fontWeight: 600,
              minWidth: 100,
              px: 3.5,
              py: 0.75,
              borderRadius: 1.25,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
