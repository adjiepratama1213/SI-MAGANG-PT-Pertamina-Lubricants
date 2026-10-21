// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
// utils
import { fToNow } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export type NotificationData = {
  id: string;
  userId?: string;
  title: string;
  message: string;
  category: 'REMINDER_ADMIN' | 'FEEDBACK_PESERTA' | 'PRESENSI' | 'LAPORAN' | 'BERKAS' | 'EVALUASI' | 'APPROVAL_VP' | 'SISTEM' | string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT' | string;
  isRead: boolean;
  redirectUrl?: string | null;
  metadata?: any;
  createdAt: string | Date;
};

type Props = {
  notification: NotificationData;
  onClickItem: (notification: NotificationData) => void;
};

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

export default function NotificationItem({ notification, onClickItem }: Props) {
  const getCategoryConfig = (category: string, type: string) => {
    switch (category) {
      case 'REMINDER_ADMIN': {
        const isUrgent = type === 'URGENT';
        const isWarning = type === 'WARNING';
        return {
          icon: 'solar:volume-loud-bold-duotone',
          color: isUrgent ? '#e11d48' : isWarning ? '#d97706' : '#004F9F',
          bgColor: isUrgent
            ? 'rgba(225, 29, 72, 0.15)'
            : isWarning
            ? 'rgba(245, 158, 11, 0.18)'
            : 'rgba(0, 79, 159, 0.12)',
          label: 'Pengumuman Admin',
          chipColor: isUrgent ? ('error' as const) : isWarning ? ('warning' as const) : ('primary' as const),
        };
      }
      case 'FEEDBACK_PESERTA':
        return {
          icon: 'solar:chat-round-dots-bold-duotone',
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.12)',
          label: 'Feedback Peserta',
          chipColor: 'secondary' as const,
        };
      case 'PRESENSI':
        return {
          icon: 'solar:calendar-date-bold-duotone',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          label: 'Presensi & Izin',
          chipColor: 'warning' as const,
        };
      case 'LAPORAN':
        return {
          icon: 'solar:document-text-bold-duotone',
          color: '#0284c7',
          bgColor: 'rgba(2, 132, 199, 0.12)',
          label: 'Laporan Magang',
          chipColor: 'info' as const,
        };
      case 'BERKAS':
        return {
          icon: 'solar:user-id-bold-duotone',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          label: 'Status Berkas / Mentor',
          chipColor: 'success' as const,
        };
      case 'EVALUASI':
        return {
          icon: 'solar:star-bold-duotone',
          color: '#8CC63F',
          bgColor: 'rgba(140, 198, 63, 0.15)',
          label: 'Evaluasi & Sertifikat',
          chipColor: 'success' as const,
        };
      case 'APPROVAL_VP':
        return {
          icon: 'solar:shield-check-bold-duotone',
          color: '#6366f1',
          bgColor: 'rgba(99, 102, 241, 0.12)',
          label: 'Approval VP',
          chipColor: 'primary' as const,
        };
      case 'REMINDER_MENTOR':
        return {
          icon: type === 'WARNING' ? 'solar:clipboard-check-bold-duotone' : 'solar:bell-bing-bold-duotone',
          color: type === 'WARNING' ? '#d97706' : '#004F9F',
          bgColor: type === 'WARNING' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(0, 79, 159, 0.12)',
          label: type === 'WARNING' ? 'Tugas Mentor' : 'Pengingat Mentor',
          chipColor: type === 'WARNING' ? ('warning' as const) : ('primary' as const),
        };
      default:
        return {
          icon: 'solar:bell-bing-bold-duotone',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.12)',
          label: 'Sistem',
          chipColor: 'default' as const,
        };
    }
  };

  const config = getCategoryConfig(notification.category, notification.type);

  return (
    <ListItemButton
      onClick={() => onClickItem(notification)}
      sx={{
        p: 2,
        alignItems: 'flex-start',
        borderBottom: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: notification.isRead ? 'transparent' : 'rgba(0, 79, 159, 0.04)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        '&:hover': {
          bgcolor: notification.isRead ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 79, 159, 0.08)',
        },
      }}
    >
      {/* Indicator dot unread */}
      {!notification.isRead && (
        <Box
          sx={{
            top: 18,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#e11d48',
            position: 'absolute',
            boxShadow: '0 0 0 3px rgba(225, 29, 72, 0.2)',
          }}
        />
      )}

      {/* Avatar Icon */}
      <ListItemAvatar sx={{ minWidth: 44, mr: 1.5, mt: 0.25, flexShrink: 0 }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: config.bgColor,
            color: config.color,
          }}
        >
          <Iconify icon={config.icon} width={22} />
        </Stack>
      </ListItemAvatar>

      {/* Text Info */}
      <ListItemText
        disableTypography
        sx={{
          minWidth: 0,
          m: 0,
          width: '100%',
          overflow: 'hidden',
        }}
        primary={
          <Stack spacing={0.6} sx={{ pr: 1.5, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
              <Chip
                label={config.label}
                size="small"
                color={config.chipColor}
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                }}
              />
              {notification.type === 'URGENT' && (
                <Chip
                  label="Mendesak"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                />
              )}
              {notification.type === 'WARNING' && (
                <Chip
                  label="Penting"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderColor: '#f59e0b',
                    color: '#d97706',
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: notification.isRead ? 600 : 700,
                color: notification.isRead ? 'text.primary' : '#004F9F',
                lineHeight: 1.35,
                fontSize: '0.875rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {notification.title.replace(/^\[(PENGUMUMAN|PENGINGAT MENTOR)\]\s*/i, '')}
              {(notification.metadata?.fileUrl || (Array.isArray(notification.metadata?.fileUrls) && notification.metadata.fileUrls.length > 0)) && (
                <Iconify
                  icon="solar:paperclip-linear"
                  width={14}
                  sx={{ color: 'text.secondary', ml: 0.6, verticalAlign: 'middle', display: 'inline' }}
                />
              )}
            </Typography>
          </Stack>
        }
        secondary={
          <Stack spacing={0.75} sx={{ mt: 0.5, pr: 1.5, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {notification.message.replace(/Dibuka:\s*[^\n\r]+/gi, '').replace(/Batas Waktu:\s*[^\n\r]+/gi, '').trim() || notification.message}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.disabled', typography: 'caption' }}>
              <Iconify icon="solar:clock-circle-linear" width={13} sx={{ flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
                {formatTimeAgoIndo(notification.createdAt)}
              </Typography>
            </Stack>
          </Stack>
        }
      />
    </ListItemButton>
  );
}
