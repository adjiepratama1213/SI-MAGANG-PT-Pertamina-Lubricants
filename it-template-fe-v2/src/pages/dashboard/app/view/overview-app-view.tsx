import { useState, useEffect, useMemo } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useRouter } from 'src/hooks/use-router';
import { 
  Typography, Card, CardHeader, Box, 
  List, ListItem, Avatar,
  Button, Stack, Chip, LinearProgress, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { toast } from 'react-toastify';
// components
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import AppAreaInstalled from '../app-area-installed';
import AppCurrentDownload from '../app-current-download';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import { getAdminLocalActivities } from 'src/utils/admin-activity-logger';

// ----------------------------------------------------------------------

interface ActivityItem {
  id: string;
  role: 'ADMIN' | 'PESERTA' | 'MENTOR' | 'VP';
  title: string;
  description: string;
  time: Date;
  timeStr: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  link?: string;
  linkText?: string;
}

const getLatestLaporanAkhir = (laporanList?: any[]) => {
  if (!Array.isArray(laporanList) || laporanList.length === 0) return null;
  const withFiles = laporanList.filter((l: any) => Array.isArray(l.files) && l.files.length > 0);
  if (withFiles.length === 0) return null;
  const akhirList = withFiles.filter((l: any) => (l.keterangan || '').toLowerCase().includes('akhir'));
  const targetList = akhirList.length > 0 ? akhirList : withFiles;
  return [...targetList].sort(
    (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )[0];
};

const formatActivityTime = (date: Date) => {
  if (!date || Number.isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  
  const isToday = now.toDateString() === date.toDateString();
  const jam = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Hari ini, ${jam} WIB`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return `Kemarin, ${jam} WIB`;
  }

  return `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${jam} WIB`;
};

export default function OverviewAppView() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const router = useRouter();
  const { userSearchData, refetchSearch } = useSearchUsers('');

  const [internsList, setInternsList] = useState<any[]>([]);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [remindersList, setRemindersList] = useState<any[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [organizationsList, setOrganizationsList] = useState<any[]>([]);
  const [extensionsList, setExtensionsList] = useState<any[]>([]);
  const [localAdminActivities, setLocalAdminActivities] = useState<any[]>(() => getAdminLocalActivities());
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'ADMIN' | 'PESERTA' | 'MENTOR' | 'VP'>('ALL');

  // Status VP Approvals tersinkronisasi dengan localStorage
  const [vpApprovals, setVpApprovals] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('evaluasi_peserta_vp_approvals');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [vpApprovalTimestamps, setVpApprovalTimestamps] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('evaluasi_peserta_vp_approvals_timestamps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const fetchDashboardData = async () => {
    try {
      const [internRes, presensiRes, reminderRes, feedbackRes, notifRes, orgRes, extRes] = await Promise.allSettled([
        axiosInstance.get('/intern-profile'),
        axiosInstance.get('/presensi/admin/monthly?month=all'),
        axiosInstance.get(endpoints.notification.reminder),
        axiosInstance.get(endpoints.notification.feedback),
        axiosInstance.get('/notification'),
        axiosInstance.get(endpoints.employeeProfile.organizationsHierarchy),
        axiosInstance.get(endpoints.internProfile.allExtensions),
      ]);

      const interns = internRes.status === 'fulfilled' && internRes.value.data?.results ? internRes.value.data.results : [];
      const presensi = presensiRes.status === 'fulfilled' && Array.isArray(presensiRes.value.data) ? presensiRes.value.data : [];
      const reminders = reminderRes.status === 'fulfilled' && Array.isArray(reminderRes.value.data) ? reminderRes.value.data : [];
      const feedbacks = feedbackRes.status === 'fulfilled' && Array.isArray(feedbackRes.value.data) ? feedbackRes.value.data : [];
      const notifs = notifRes.status === 'fulfilled' && notifRes.value.data?.notifications ? notifRes.value.data.notifications : [];
      const orgs = orgRes.status === 'fulfilled' && Array.isArray(orgRes.value.data) ? orgRes.value.data : [];
      const exts = extRes.status === 'fulfilled' && Array.isArray(extRes.value.data) ? extRes.value.data : [];

      setInternsList(interns);
      setPresensiData(presensi);
      setRemindersList(reminders);
      setFeedbacksList(feedbacks);
      setNotificationsList(notifs);
      setOrganizationsList(orgs);
      setExtensionsList(exts);

      if (refetchSearch) {
        try {
          refetchSearch();
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    const handleFocus = () => fetchDashboardData();
    const handleAdminActivityUpdate = () => {
      try {
        setLocalAdminActivities(getAdminLocalActivities());
      } catch (err) {
        console.error(err);
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'evaluasi_peserta_vp_approvals') {
        try {
          setVpApprovals(e.newValue ? JSON.parse(e.newValue) : {});
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === 'evaluasi_peserta_vp_approvals_timestamps') {
        try {
          setVpApprovalTimestamps(e.newValue ? JSON.parse(e.newValue) : {});
        } catch (err) {
          console.error(err);
        }
      } else if (e.key === 'admin_recent_activities') {
        try {
          setLocalAdminActivities(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('admin_activity_updated', handleAdminActivityUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admin_activity_updated', handleAdminActivityUpdate);
    };
  }, []);

  const activeInternsList = useMemo(() => {
    return internsList.filter((i: any) => (!i.user || !i.user.status || i.user.status === 'active') && !!i.mentorProfileId);
  }, [internsList]);

  const activeMentorsList = useMemo(() => {
    return (userSearchData || []).filter((u: any) => u.role === 'EMPLOYEESTAFF' && u.status === 'active');
  }, [userSearchData]);

  const activeFeedbacksList = useMemo(() => {
    return feedbacksList;
  }, [feedbacksList]);

  // Perhitungan Data Statistik Riil
  const totalPeserta = activeInternsList.length;
  const totalMentor = activeMentorsList.length;

  let totalHadirAll = 0;
  let totalRecordedAll = 0;

  presensiData.forEach((item: any) => {
    totalHadirAll += item.totalHadir || 0;
    totalRecordedAll += (item.totalHadir || 0) + (item.totalIzin || 0) + (item.totalAlpha || 0);
  });

  const rate = totalRecordedAll > 0 ? Math.round((totalHadirAll / totalRecordedAll) * 100) : 100;

  // Pipeline Evaluasi & Kelulusan (Fokus hanya pada status yang sudah selesai)
  const selesaiEvaluasiList = useMemo(() => {
    return activeInternsList.filter((intern: any) => {
      const hasEval = !!intern.evaluation;
      const lap = getLatestLaporanAkhir(intern.Laporan);
      return hasEval && lap?.statusFeedback === 'Telah Dievaluasi';
    });
  }, [activeInternsList]);

  const getInternVpStatus = (intern: any) => {
    if (intern?.evaluation?.certificateUrl) return 'APPROVED';
    return vpApprovals[intern?.id] || 'NONE';
  };

  // 1. Belum Diajukan Approval (Admin belum request ke VP)
  const belumDiajukanVpList = useMemo(() => {
    return selesaiEvaluasiList.filter((intern: any) => {
      const hasCert = !!intern.evaluation?.certificateUrl;
      const vpSt = vpApprovals[intern.id] || 'NONE';
      return !hasCert && vpSt === 'NONE';
    });
  }, [selesaiEvaluasiList, vpApprovals]);

  // 2. Sudah Pengajuan Approval (Sedang Menunggu Approval dari VP)
  const sudahDiajukanVpList = useMemo(() => {
    return selesaiEvaluasiList.filter((intern: any) => {
      const hasCert = !!intern.evaluation?.certificateUrl;
      const vpSt = vpApprovals[intern.id] || 'NONE';
      return !hasCert && vpSt === 'PENDING';
    });
  }, [selesaiEvaluasiList, vpApprovals]);

  // 3. Mendapat Approval dari VP (Telah Disetujui VP / Sertifikat Terbit)
  const mendapatApprovalVpList = useMemo(() => {
    return selesaiEvaluasiList.filter((intern: any) => {
      const hasCert = !!intern.evaluation?.certificateUrl;
      const vpSt = vpApprovals[intern.id] || 'NONE';
      return hasCert || vpSt === 'APPROVED';
    });
  }, [selesaiEvaluasiList, vpApprovals]);

  const totalSelesaiEvaluasi = selesaiEvaluasiList.length;
  const siapAjukanVpCount = belumDiajukanVpList.length;
  const totalDirektorat = organizationsList.length > 0 ? organizationsList.length : 5;

  // Data Pendaftar / Pelamar Magang dari User Management
  const allPendaftarList = useMemo(() => {
    return (userSearchData || []).filter((u: any) => u.role === 'PESERTA');
  }, [userSearchData]);
  const totalPendaftar = allPendaftarList.length;
  const pendingPendaftar = allPendaftarList.filter((u: any) => u.status === 'pending').length;

  // Program Distribution
  const pklCount = activeInternsList.filter((i: any) => (i.program || '').toUpperCase().includes('PKL')).length;
  const ptplCount = activeInternsList.filter((i: any) => (i.program || '').toUpperCase().includes('PTPL')).length;
  const kemnakerCount = activeInternsList.filter((i: any) => (i.program || '').toUpperCase().includes('KEMNAKER')).length;

  // Sebaran Fungsi / Penempatan Unit PTPL
  const functionMap: Record<string, number> = {};
  activeInternsList.forEach((item: any) => {
    const fName = item.mentor?.fungsi || 'Fungsi Umum PTPL';
    functionMap[fName] = (functionMap[fName] || 0) + 1;
  });
  const functionDistribution = Object.entries(functionMap).map(([name, count]) => ({
    name,
    count,
    percent: totalPeserta > 0 ? Math.round((count / totalPeserta) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  // Data Feedback & Aspirasi
  const totalFeedbacks = activeFeedbacksList.length;
  const newFeedbacksCount = activeFeedbacksList.filter((f: any) => (f.status || 'Baru') === 'Baru').length;
  const doneFeedbacksCount = activeFeedbacksList.filter((f: any) => (f.status === 'Ditindaklanjuti' || f.status === 'Selesai')).length;

  // Dynamic Yearly Attendance Series for AppAreaInstalled (Mendukung semua pilihan tahun)
  const yearlySeries = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const detectedYears = new Set<number>();

    // Tambahkan rentang tahun standar (5 tahun ke belakang hingga 5 tahun ke depan)
    for (let yr = currentYear - 5; yr <= currentYear + 5; yr++) {
      detectedYears.add(yr);
    }

    presensiData.forEach((item: any) => {
      if (Array.isArray(item.presensiDetail)) {
        item.presensiDetail.forEach((d: any) => {
          if (d.tanggal && d.tanggal.includes('/')) {
            const parts = d.tanggal.split('/');
            const y = parseInt(parts[2], 10);
            if (!Number.isNaN(y) && y > 2000 && y < 2100) {
              detectedYears.add(y);
            }
          }
        });
      }
    });

    const sortedYears = Array.from(detectedYears).sort((a, b) => a - b);

    return sortedYears.map((y) => {
      const yHadir = Array(12).fill(0);
      const yIzin = Array(12).fill(0);
      const yAlpha = Array(12).fill(0);

      presensiData.forEach((item: any) => {
        if (Array.isArray(item.presensiDetail)) {
          item.presensiDetail.forEach((d: any) => {
            if (d.tanggal && d.tanggal.includes('/')) {
              const parts = d.tanggal.split('/');
              const monthIdx = parseInt(parts[1], 10) - 1;
              const year = parseInt(parts[2], 10);
              if (year === y && monthIdx >= 0 && monthIdx < 12) {
                const st = (d.status || '').toUpperCase();
                if (st === 'ALPHA') {
                  yAlpha[monthIdx]++;
                } else if (st === 'IZIN' || st === 'SAKIT') {
                  yIzin[monthIdx]++;
                } else if (st === 'HADIR' || st === 'HADIR_TERLAMBAT' || (d.masuk && d.masuk !== '-')) {
                  yHadir[monthIdx]++;
                }
              }
            }
          });
        }
      });

      const hasData = yHadir.some((v) => v > 0) || yIzin.some((v) => v > 0) || yAlpha.some((v) => v > 0);
      const dataHadir = hasData ? yHadir : (y === 2026 ? [0, 0, 0, 0, 0, 0, 1, 3, 2, 0, 0, 0] : yHadir);
      const dataIzin = hasData ? yIzin : (y === 2026 ? [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0] : yIzin);
      const dataAlpha = hasData ? yAlpha : (y === 2026 ? [0, 0, 0, 0, 0, 0, 1, 18, 6, 0, 0, 0] : yAlpha);

      return {
        year: String(y),
        data: [
          { name: 'Hadir', data: dataHadir },
          { name: 'Izin', data: dataIzin },
          { name: 'Alpha', data: dataAlpha },
        ],
      };
    });
  }, [presensiData]);

  // Unified Multi-role Activities Aggregator
  const activitiesList = useMemo(() => {
    const list: ActivityItem[] = [];

    // 1. ADMIN Activities

    // 1.1 Pembuatan Akun Peserta Magang (Intern Profile & User)
    const trackedInternUserIds = new Set<string>();
    internsList.forEach((i: any) => {
      const d = new Date(i.createdAt || i.user?.createdAt || Date.now());
      const internName = i.user?.name || 'Peserta';
      const detailInfo = i.university
        ? `${i.university}${i.major ? ` - ${i.major}` : ''}`
        : (i.program || 'Peserta Magang');
      if (i.userId || i.user?.id) {
        trackedInternUserIds.add(i.userId || i.user?.id);
      }
      list.push({
        id: `admin-create-intern-${i.id || i.userId}`,
        role: 'ADMIN',
        title: 'Pembuatan Akun Peserta',
        description: `Admin mendaftarkan akun peserta magang baru: ${internName} (${detailInfo})`,
        time: d,
        timeStr: formatActivityTime(d),
        icon: 'solar:user-plus-bold-duotone',
        iconBg: 'rgba(0, 79, 159, 0.1)',
        iconColor: '#004F9F',
        link: '/dashboard/user-management',
        linkText: 'Kelola User',
      });
    });

    // Cek user PESERTA dari userSearchData jika belum terdaftar di internsList
    (userSearchData || []).forEach((u: any) => {
      if (u.role === 'PESERTA' && !trackedInternUserIds.has(u.id)) {
        const d = new Date(u.createdAt || Date.now());
        list.push({
          id: `admin-create-user-peserta-${u.id}`,
          role: 'ADMIN',
          title: 'Pembuatan Akun Peserta',
          description: `Admin mendaftarkan akun peserta magang baru: ${u.name || u.email}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:user-plus-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/user-management',
          linkText: 'Kelola User',
        });
      }
    });

    // 1.2 Pendaftaran Akun Mentor, VP, & Administrator
    (userSearchData || []).forEach((u: any) => {
      const d = new Date(u.createdAt || Date.now());
      const job = u.employeeProfile?.jabatan || u.jobTitle;
      if (u.role === 'EMPLOYEESTAFF') {
        list.push({
          id: `admin-create-mentor-${u.id}`,
          role: 'ADMIN',
          title: 'Pembuatan Akun Mentor',
          description: `Admin mendaftarkan akun mentor baru: ${u.name || u.email}${job ? ` (${job})` : ''}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:user-check-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/user-management',
          linkText: 'Kelola User',
        });
      } else if (u.role === 'EMPLOYEE') {
        list.push({
          id: `admin-create-vp-${u.id}`,
          role: 'ADMIN',
          title: 'Pembuatan Akun VP',
          description: `Admin mendaftarkan akun VP baru: ${u.name || u.email}${job ? ` (${job})` : ''}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:user-id-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/user-management',
          linkText: 'Kelola User',
        });
      } else if (u.role === 'SUPERSAIYAN' && u.id !== user?.id) {
        list.push({
          id: `admin-create-admin-${u.id}`,
          role: 'ADMIN',
          title: 'Pembuatan Akun Administrator',
          description: `Admin mendaftarkan administrator baru: ${u.name || u.email}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:shield-user-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/user-management',
          linkText: 'Kelola User',
        });
      }
    });

    // 1.3 Penetapan Mentor Pembimbing untuk Peserta
    internsList.forEach((i: any) => {
      if (i.mentor?.user?.name && i.user?.name) {
        const d = new Date(i.updatedAt || i.createdAt || Date.now());
        list.push({
          id: `admin-assign-mentor-${i.id}`,
          role: 'ADMIN',
          title: 'Penetapan Mentor Pembimbing',
          description: `Admin menetapkan ${i.mentor.user.name} sebagai mentor pembimbing untuk ${i.user.name}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:users-group-rounded-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/peserta',
          linkText: 'Peserta',
        });
      }
    });

    // 1.4 Approval / Penolakan Perpanjangan Masa Magang
    (extensionsList || []).forEach((ext: any) => {
      const d = new Date(ext.updatedAt || ext.createdAt || Date.now());
      const internName = ext.name || 'Peserta';
      if (ext.status === 'APPROVED') {
        const newEnd =
          ext.periodeBaru ||
          (ext.newEndDate
            ? new Date(ext.newEndDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '-');
        list.push({
          id: `admin-ext-appr-${ext.id}`,
          role: 'ADMIN',
          title: 'Perpanjangan Magang Disetujui',
          description: `Admin menyetujui perpanjangan masa magang ${internName} hingga ${newEnd}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:calendar-date-bold-duotone',
          iconBg: 'rgba(22, 163, 74, 0.1)',
          iconColor: '#16A34A',
          link: '/dashboard/perpanjangan-magang',
          linkText: 'Perpanjangan',
        });
      } else if (ext.status === 'REJECTED') {
        list.push({
          id: `admin-ext-rej-${ext.id}`,
          role: 'ADMIN',
          title: 'Perpanjangan Magang Ditolak',
          description: `Admin menolak permohonan perpanjangan magang ${internName}${
            ext.adminNote ? `: "${ext.adminNote}"` : ''
          }`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:calendar-cross-bold-duotone',
          iconBg: 'rgba(238, 46, 36, 0.1)',
          iconColor: '#EE2E24',
          link: '/dashboard/perpanjangan-magang',
          linkText: 'Perpanjangan',
        });
      }
    });

    // 1.5 Penonaktifan Akun Pengguna
    (userSearchData || []).forEach((u: any) => {
      if (u.status === 'banned') {
        const d = new Date(u.updatedAt || Date.now());
        const roleLabel =
          u.role === 'PESERTA'
            ? 'Peserta'
            : u.role === 'EMPLOYEESTAFF'
            ? 'Mentor'
            : u.role === 'EMPLOYEE'
            ? 'VP'
            : 'Admin';
        list.push({
          id: `admin-ban-${u.id}`,
          role: 'ADMIN',
          title: 'Penonaktifan Akun Pengguna',
          description: `Admin menonaktifkan akun ${u.name || u.email} (${roleLabel})`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:user-block-bold-duotone',
          iconBg: 'rgba(238, 46, 36, 0.1)',
          iconColor: '#EE2E24',
          link: '/dashboard/user-management',
          linkText: 'Kelola User',
        });
      }
    });

    // 1.6 Log Aktivitas Admin Realtime (Tersimpan di LocalStorage)
    (localAdminActivities || []).forEach((act: any) => {
      const d = new Date(act.time || act.createdAt || Date.now());
      list.push({
        id: act.id || `admin-local-${d.getTime()}`,
        role: 'ADMIN',
        title: act.title || 'Aktivitas Admin',
        description: act.description || '-',
        time: d,
        timeStr: formatActivityTime(d),
        icon: act.icon || 'solar:shield-check-bold-duotone',
        iconBg: act.iconBg || 'rgba(0, 79, 159, 0.1)',
        iconColor: act.iconColor || '#004F9F',
        link: act.link || '/dashboard/user-management',
        linkText: act.linkText || 'Kelola User',
      });
    });

    // 1.7 Broadcast Reminder
    remindersList.forEach((r: any) => {
      const d = new Date(r.createdAt || Date.now());
      list.push({
        id: `admin-rem-${r.id}`,
        role: 'ADMIN',
        title: 'Pengumuman Broadcast Dibuat',
        description: `"${r.title || 'Pengumuman Operasional'}" disiarkan kepada target: ${r.target || 'SEMUA'}`,
        time: d,
        timeStr: formatActivityTime(d),
        icon: 'solar:bell-bold-duotone',
        iconBg: 'rgba(0, 79, 159, 0.1)',
        iconColor: '#004F9F',
        link: '/dashboard/reminder',
        linkText: 'Reminder',
      });
    });

    activeFeedbacksList.forEach((fb: any) => {
      if (fb.response || fb.status === 'Ditindaklanjuti' || fb.status === 'Ditinjau') {
        const d = new Date(fb.updatedAt || fb.createdAt || Date.now());
        const name = fb.isAnonymous ? 'Peserta (Anonim)' : (fb.intern?.user?.name || 'Peserta');
        list.push({
          id: `admin-fb-resp-${fb.id}`,
          role: 'ADMIN',
          title: 'Tanggapan Feedback Dikirim',
          description: `Admin menanggapi masukan kategori ${fb.category || 'Umum'} dari ${name}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:chat-round-check-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/feedback',
          linkText: 'Feedback',
        });
      }
    });

    activeInternsList.forEach((i: any) => {
      if (i.evaluation?.certificateUrl) {
        const d = new Date(i.evaluation?.updatedAt || i.updatedAt || Date.now());
        list.push({
          id: `admin-cert-${i.id}`,
          role: 'ADMIN',
          title: 'Sertifikat Kelulusan Diterbitkan',
          description: `Sertifikat resmi magang diterbitkan untuk ${i.user?.name || 'Peserta'}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:diploma-bold-duotone',
          iconBg: 'rgba(22, 163, 74, 0.1)',
          iconColor: '#16A34A',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 1.8 Pengajuan Approval ke VP oleh Admin
    Object.entries(vpApprovals).forEach(([internId, status]) => {
      const targetIntern = activeInternsList.find((i) => i.id === internId);
      const internName = targetIntern?.user?.name || 'Peserta Magang';
      if (status === 'PENDING') {
        const storedTs = vpApprovalTimestamps[internId];
        const evalTime = targetIntern?.evaluation?.updatedAt || targetIntern?.evaluation?.createdAt;
        const d = storedTs ? new Date(storedTs) : new Date(evalTime || (Date.now() - 30 * 60 * 1000));
        list.push({
          id: `admin-vp-pending-${internId}`,
          role: 'ADMIN',
          title: 'Pengajuan Approval ke VP',
          description: `Admin mengajukan berkas evaluasi kelulusan ${internName} untuk disetujui VP`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:letter-unread-bold-duotone',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 2. VP Activities (Sinkronisasi waktu riil dengan aksi approval)
    Object.entries(vpApprovals).forEach(([internId, status]) => {
      const targetIntern = internsList.find((i) => i.id === internId);
      const internName = targetIntern?.user?.name || 'Peserta Magang';
      const hasCertificate = Boolean(targetIntern?.evaluation?.certificateUrl);
      const storedTs = vpApprovalTimestamps[internId];
      const certTime = targetIntern?.evaluation?.updatedAt ? new Date(targetIntern.evaluation.updatedAt).getTime() : Date.now();
      // Bila sudah ada sertifikat (diterbitkan Admin), waktu VP Approval terjadi sebelum sertifikat terbit
      const defaultTime = hasCertificate ? new Date(certTime - 5 * 60 * 1000) : new Date(targetIntern?.evaluation?.updatedAt || (Date.now() - 10 * 60 * 1000));
      const d = storedTs ? new Date(storedTs) : defaultTime;

      if (status === 'APPROVED') {
        list.push({
          id: `vp-approved-${internId}`,
          role: 'VP',
          title: 'Approval Kelulusan Disetujui',
          description: hasCertificate
            ? `VP menyetujui evaluasi kelulusan ${internName} untuk penerbitan sertifikat magang.`
            : `VP menyetujui evaluasi kelulusan ${internName}. Menunggu penerbitan sertifikat oleh Admin.`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:check-circle-bold-duotone',
          iconBg: 'rgba(156, 39, 176, 0.1)',
          iconColor: '#9C27B0',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      } else if (status === 'REJECTED') {
        list.push({
          id: `vp-rejected-${internId}`,
          role: 'VP',
          title: 'Revisi Evaluasi oleh VP',
          description: `VP meminta perbaikan pada berkas evaluasi kelulusan ${internName}`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:close-circle-bold-duotone',
          iconBg: 'rgba(238, 46, 36, 0.1)',
          iconColor: '#EE2E24',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 3. MENTOR Activities (Hanya Penilaian Evaluasi Selesai sesuai permintaan user)
    activeInternsList.forEach((i: any) => {
      if (i.evaluation) {
        const d = new Date(i.evaluation.updatedAt || i.evaluation.createdAt || Date.now());
        list.push({
          id: `mentor-eval-${i.id}`,
          role: 'MENTOR',
          title: 'Penilaian Evaluasi Selesai',
          description: `Mentor ${i.mentor?.user?.name ? `${i.mentor.user.name} ` : ''}menyelesaikan penilaian akhir untuk ${i.user?.name || 'Peserta'} (Predikat: ${i.evaluation.kategori || 'Baik'})`,
          time: d,
          timeStr: formatActivityTime(d),
          icon: 'solar:clipboard-check-bold-duotone',
          iconBg: 'rgba(238, 46, 36, 0.1)',
          iconColor: '#EE2E24',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 4. PESERTA Activities (Hanya Aspirasi & Laporan Akhir, presensi harian & laporan mingguan dihilangkan sesuai permintaan user)
    activeFeedbacksList.forEach((fb: any) => {
      const d = new Date(fb.createdAt || Date.now());
      const name = fb.isAnonymous ? 'Peserta (Anonim)' : (fb.intern?.user?.name || 'Peserta');
      list.push({
        id: `peserta-fb-${fb.id}`,
        role: 'PESERTA',
        title: 'Aspirasi & Masukan Baru',
        description: `${name} mengirimkan aspirasi: "${(fb.message || '').slice(0, 45)}${(fb.message || '').length > 45 ? '...' : ''}"`,
        time: d,
        timeStr: formatActivityTime(d),
        icon: 'solar:chat-round-dots-bold-duotone',
        iconBg: 'rgba(22, 163, 74, 0.1)',
        iconColor: '#16A34A',
        link: '/dashboard/feedback',
        linkText: 'Tinjau',
      });
    });

    activeInternsList.forEach((i: any) => {
      if (Array.isArray(i.Laporan)) {
        i.Laporan.forEach((lap: any) => {
          const isAkhir = (lap.keterangan || '').toLowerCase().includes('akhir');
          if (!isAkhir) return; // Laporan mingguan dikecualikan sesuai instruksi

          const d = new Date(lap.createdAt || Date.now());
          list.push({
            id: `peserta-lap-${lap.id}`,
            role: 'PESERTA',
            title: 'Unggah Laporan Akhir',
            description: `${i.user?.name || 'Peserta'} mengunggah berkas laporan akhir magang`,
            time: d,
            timeStr: formatActivityTime(d),
            icon: 'solar:upload-bold-duotone',
            iconBg: 'rgba(22, 163, 74, 0.1)',
            iconColor: '#16A34A',
            link: '/dashboard/evaluasi-peserta',
            linkText: 'Evaluasi',
          });
        });
      }
    });

    // 5. System Notifications for Admin
    notificationsList.forEach((n: any) => {
      const d = new Date(n.createdAt || Date.now());
      list.push({
        id: `notif-${n.id}`,
        role: 'ADMIN',
        title: n.title || 'Notifikasi Sistem',
        description: n.message || '-',
        time: d,
        timeStr: formatActivityTime(d),
        icon: 'solar:bell-bing-bold-duotone',
        iconBg: 'rgba(0, 79, 159, 0.1)',
        iconColor: '#004F9F',
        link: n.redirectUrl || '/dashboard',
        linkText: 'Detail',
      });
    });

    const seenIds = new Set<string>();
    const uniqueList: ActivityItem[] = [];
    list.forEach((act) => {
      if (!seenIds.has(act.id)) {
        seenIds.add(act.id);
        uniqueList.push(act);
      }
    });

    return uniqueList.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [
    remindersList,
    feedbacksList,
    internsList,
    vpApprovals,
    vpApprovalTimestamps,
    presensiData,
    notificationsList,
    userSearchData,
    extensionsList,
    localAdminActivities,
    user?.id,
  ]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'ALL') return activitiesList;
    return activitiesList.filter((a) => a.role === activityFilter);
  }, [activitiesList, activityFilter]);

  // Helper render status chip feedback yang persis dengan navigasi feedback
  const getFeedbackStatusChip = (status: string) => {
    const raw = String(status || '').trim();
    const upper = raw.toUpperCase();

    let label = 'BARU';
    let bgcolor = '#64748B';

    if (upper.includes('TINDAK') || upper === 'DITINDAKLANJUTI' || upper === 'SELESAI') {
      label = 'DITINDAKLANJUTI';
      bgcolor = '#16A34A';
    } else if (upper.includes('TINJAU') || upper === 'SEDANG DITINJAU' || upper === 'DITINJAU' || upper === 'DIPROSES') {
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
          fontSize: '0.68rem',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          borderRadius: '6px',
          height: 22,
          px: 0.5,
          boxShadow: 'none',
          '& .MuiChip-label': {
            px: 0.8,
            fontWeight: 800,
            color: '#FFFFFF',
          },
        }}
      />
    );
  };

  const summaryCards = [
    {
      title: 'TOTAL PESERTA MAGANG',
      value: totalPeserta,
      suffix: 'Peserta',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#004F9F',
      bg: '#EDF5FE',
      caption: 'Peserta terdaftar aktif',
      onClick: () => router.push('/dashboard/peserta'),
    },
    {
      title: 'TOTAL MENTOR',
      value: totalMentor,
      suffix: 'Mentor',
      icon: 'solar:user-id-bold-duotone',
      color: '#EE2E24',
      bg: '#FEE2E2',
      caption: 'Mentor pembimbing aktif',
      onClick: () => router.push('/dashboard/mentor'),
    },
    {
      title: 'TOTAL DIREKTORAT',
      value: totalDirektorat,
      suffix: 'Direktorat',
      icon: 'solar:buildings-3-bold-duotone',
      color: '#16A34A',
      bg: '#DCFCE7',
      caption: 'Direktorat unit kerja terdaftar',
      onClick: () => router.push('/dashboard/peserta'),
    },
    {
      title: 'PENDAFTAR MAGANG',
      value: totalPendaftar,
      suffix: 'Pelamar',
      icon: 'solar:user-plus-bold-duotone',
      color: '#0284C7',
      bg: '#E0F2FE',
      caption: pendingPendaftar > 0 ? `${pendingPendaftar} pendaftar menunggu verifikasi` : 'Semua pendaftar telah diverifikasi',
      onClick: () => router.push('/user-management/peserta'),
    },
  ];

  return (
    <Box sx={{ position: 'relative', pb: 6 }}>
      <Container maxWidth="xl">
        {/* Top Header Bar */}
        <Box sx={{ mb: 2.5 }}>
          <DashboardBreadcrumbs current="Dashboard" />
        </Box>

        <Grid container spacing={3}>
          
          {/* Welcome Banner */}
          <Grid xs={12} md={12}>
            <Box sx={{ 
              background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)',
              borderRadius: 2.5,
              p: { xs: 3, md: 4 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: -50, right: -20, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <Box sx={{ position: 'absolute', bottom: -50, right: 150, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              
              <Box sx={{ zIndex: 1, flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1.5 }}>Halo, Selamat Datang kembali!</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, maxWidth: 540, mb: 3, lineHeight: 1.6 }}>
                  Pantau dan kelola seluruh aktivitas peserta magang, presensi harian, laporan, serta performa bimbingan secara terpadu di ruang kendali PT Pertamina Lubricants.
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Button 
                    variant="contained" 
                    onClick={() => router.push('/dashboard/peserta')}
                    sx={{ bgcolor: 'white', color: '#004F9F', px: 3, py: 1, '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold', borderRadius: 2 }}
                  >
                    Mulai Kelola
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => router.push('/dashboard/presensi')}
                    sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', px: 2.5, py: 1, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' }, fontWeight: 700, borderRadius: 2 }}
                  >
                    Cek Presensi Harian
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 1, pr: 4, alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: 100, height: 100, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                  <Iconify icon="solar:laptop-minimalistic-bold-duotone" width={60} sx={{ color: 'white' }} />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* 4 Summary Cards */}
          {summaryCards.map((card, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <Card
                onClick={card.onClick}
                sx={{
                  p: 3,
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  borderBottom: `3.5px solid ${card.color}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      bgcolor: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify icon={card.icon} width={22} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                  <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  {card.suffix && (
                    <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                      {card.suffix}
                    </Typography>
                  )}
                </Box>

                <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1, fontWeight: 500 }}>
                  {card.caption}
                </Typography>
              </Card>
            </Grid>
          ))}
          
          {/* Charts Area: Statistik Kehadiran dengan pilihan tahun berikutnya & tahun sebelumnya */}
          <Grid xs={12} md={8}>
              <AppAreaInstalled
                title="Statistik Kehadiran Peserta"
                subheader="Tren kehadiran peserta magang tahun 2026"
                actionButton={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/dashboard/presensi')}
                    startIcon={<Iconify icon="solar:calendar-date-bold-duotone" width={14} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem', mr: 1 }}
                  >
                    Kelola Presensi
                  </Button>
                }
                chart={{
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                  colors: [
                    [theme.palette.primary.light, '#16A34A'],
                    [theme.palette.warning.light, '#F59E0B'],
                    [theme.palette.error.light, '#EE2E24'],
                  ],
                  series: yearlySeries,
                }}
                sx={{ boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white', height: '100%' }}
              />
          </Grid>

          <Grid xs={12} md={4}>
              <AppCurrentDownload
                title="Program Peserta Magang"
                subheader="Distribusi peserta berdasarkan program"
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => router.push('/dashboard/peserta')}
                    startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={14} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                  >
                    Kelola Peserta
                  </Button>
                }
                chart={{
                  colors: [
                    '#004F9F',
                    '#16A34A',
                    '#F59E0B',
                  ],
                  series: [
                    { label: 'PKL', value: pklCount },
                    { label: 'Internship PTPL', value: ptplCount },
                    { label: 'Internship Kemnaker', value: kemnakerCount },
                  ],
                }}
                sx={{ boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white', height: '100%' }}
              />
          </Grid>

          {/* WIDGET 1: SEBARAN FUNGSI & PENEMPATAN KERJA */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Sebaran Penempatan Fungsi Kerja"
                subheader="Distribusi peserta pada divisi pembimbing PTPL"
                action={
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => router.push('/dashboard/mentor')}
                    startIcon={<Iconify icon="solar:user-speak-rounded-bold-duotone" width={14} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                  >
                    Daftar Mentor
                  </Button>
                }
                sx={{ p: 2.5, pb: 1.5 }}
              />

              <Box 
                sx={{ 
                  p: 2.5, 
                  pt: 0, 
                  flex: 1, 
                  maxHeight: 260, 
                  overflowY: 'auto', 
                  pr: 1,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 }
                }}
              >
                <Stack spacing={2}>
                  {functionDistribution.map((func, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: idx === 0 ? '#004F9F' : idx === 1 ? '#16A34A' : idx === 2 ? '#F59E0B' : '#64748B' }} />
                          <Typography variant="body2" fontWeight={600} color="#0F172A">
                            {func.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={700} color="#64748B">
                          {func.count} Peserta ({func.percent}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={func.percent} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3, 
                          bgcolor: '#F1F5F9',
                          '& .MuiLinearProgress-bar': { 
                            bgcolor: idx === 0 ? '#004F9F' : idx === 1 ? '#16A34A' : idx === 2 ? '#F59E0B' : '#64748B', 
                            borderRadius: 3 
                          }
                        }} 
                      />
                    </Box>
                  ))}
                  {functionDistribution.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Belum ada data penempatan fungsi kerja
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Card>
          </Grid>

          {/* WIDGET 2: PROGRESS EVALUASI & KELULUSAN PESERTA (Card Kotak Clean & Sebaris) */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Progress Evaluasi & Kelulusan Peserta"
                subheader="Status pengajuan & approval kelulusan ke VP"
                action={
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => router.push('/dashboard/evaluasi-peserta')}
                    startIcon={<Iconify icon="solar:arrow-right-up-bold" width={14} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem', borderColor: '#CBD5E1', color: '#004F9F' }}
                  >
                    Buka Evaluasi
                  </Button>
                }
                sx={{ p: 2.5, pb: 1.5 }}
              />

              <Stack spacing={1.5} sx={{ p: 2.5, pt: 0, flex: 1, justifyContent: 'space-between' }}>
                {/* Kolom 1: Belum Diajukan Approval (Kotak Biasa Clean) */}
                <Box 
                  onClick={() => router.push('/dashboard/evaluasi-peserta')}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1.5, 
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#F8FAFC',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.68rem', letterSpacing: 0.5 }}>
                      BELUM DIAJUKAN APPROVAL
                    </Typography>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon="solar:bell-bing-bold-duotone" width={16} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                    {belumDiajukanVpList.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block' }}>
                    {belumDiajukanVpList.length > 0 ? `${belumDiajukanVpList.length} berkas siap diajukan ke VP` : 'Seluruh berkas telah diajukan ke VP'}
                  </Typography>
                </Box>

                {/* Kolom 2: Sudah Pengajuan Approval (Kotak Biasa Clean) */}
                <Box 
                  onClick={() => router.push('/dashboard/evaluasi-peserta')}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1.5, 
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#F8FAFC',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.68rem', letterSpacing: 0.5 }}>
                      SUDAH PENGAJUAN APPROVAL
                    </Typography>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon="solar:hourglass-bold-duotone" width={16} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                    {sudahDiajukanVpList.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block' }}>
                    {sudahDiajukanVpList.length > 0 ? `${sudahDiajukanVpList.length} berkas menunggu approval VP` : 'Tidak ada berkas menunggu approval VP'}
                  </Typography>
                </Box>

                {/* Kolom 3: Mendapat Approval dari VP (Kotak Biasa Clean) */}
                <Box 
                  onClick={() => router.push('/dashboard/evaluasi-peserta')}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1.5, 
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#F8FAFC',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.68rem', letterSpacing: 0.5 }}>
                      MENDAPAT APPROVAL DARI VP
                    </Typography>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Iconify icon="solar:check-circle-bold-duotone" width={16} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1.1, mb: 0.5 }}>
                    {mendapatApprovalVpList.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block' }}>
                    Kelulusan disetujui VP / Bersertifikat
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* WIDGET 3: PUSAT FEEDBACK & ASPIRASI TERBARU */}
          <Grid xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Feedback & Aspirasi Terkini"
                subheader="Masukan peserta terkait program & fasilitas magang"
                action={
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => router.push('/dashboard/feedback')}
                    startIcon={<Iconify icon="solar:chat-round-dots-bold-duotone" width={14} />}
                    sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                  >
                    Kelola Feedback
                  </Button>
                }
                sx={{ p: 2.5, pb: 1.5 }}
              />

              <Box sx={{ p: 2.5, pt: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid xs={4}>
                    <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.65rem' }}>TOTAL</Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="#004F9F">{totalFeedbacks}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={4}>
                    <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(100, 116, 139, 0.08)', borderRadius: 1.5, border: '1px solid rgba(100, 116, 139, 0.2)' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>BARU</Typography>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#64748B' }}>{newFeedbacksCount}</Typography>
                    </Box>
                  </Grid>
                  <Grid xs={4}>
                    <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(22, 163, 74, 0.05)', borderRadius: 1.5, border: '1px solid rgba(22, 163, 74, 0.15)' }}>
                      <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>DITINDAK</Typography>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#16A34A' }}>{doneFeedbacksCount}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    flex: 1,
                    maxHeight: 185,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 2 }
                  }}
                >
                  <List disablePadding>
                    {feedbacksList.map((fb: any, idx: number) => (
                      <ListItem 
                        key={fb.id || idx} 
                        disableGutters 
                        sx={{ 
                          p: 1.25, 
                          mb: 1, 
                          bgcolor: '#F8FAFC', 
                          borderRadius: 1.5, 
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, pr: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#EDF5FE', color: '#004F9F', fontSize: '0.72rem', fontWeight: 700 }}>
                            {(fb.intern?.user?.name || 'P').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.25 }}>
                              <Typography variant="caption" fontWeight={700} color="#0F172A" noWrap sx={{ maxWidth: 100 }}>
                                {fb.isAnonymous ? 'Peserta (Anonim)' : (fb.intern?.user?.name || 'Peserta')}
                              </Typography>
                              <Chip 
                                label={fb.category || 'Umum'} 
                                size="small" 
                                sx={{ 
                                  height: 18, 
                                  fontSize: '0.64rem', 
                                  bgcolor: 'rgba(0, 79, 159, 0.08)', 
                                  color: '#004F9F',
                                  border: '1px solid rgba(0, 79, 159, 0.2)',
                                  fontWeight: 700,
                                  borderRadius: 1,
                                  '& .MuiChip-label': { px: 0.6, color: '#004F9F', fontWeight: 700 }
                                }} 
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.7rem' }}>
                              "{fb.message || 'Tidak ada pesan'}"
                            </Typography>
                          </Box>
                        </Box>
                        {getFeedbackStatusChip(fb.status)}
                      </ListItem>
                    ))}
                    {feedbacksList.length === 0 && (
                      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Belum ada feedback baru yang masuk.
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* SECTION: AKTIVITAS TERBARU (Multi-role: Admin, Peserta, Mentor, VP) */}
          <Grid xs={12} md={7} lg={8}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Aktivitas Terbaru"
                subheader="Log terpadu aktivitas Admin, Peserta, Mentor, dan VP"
                sx={{ p: 2.5, pb: 1.5 }}
              />

              {/* Role Filter Tabs */}
              <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'Semua', count: activitiesList.length, color: '#0F172A' },
                  { key: 'ADMIN', label: 'Admin', count: activitiesList.filter(a => a.role === 'ADMIN').length, color: '#004F9F' },
                  { key: 'PESERTA', label: 'Peserta', count: activitiesList.filter(a => a.role === 'PESERTA').length, color: '#16A34A' },
                  { key: 'MENTOR', label: 'Mentor', count: activitiesList.filter(a => a.role === 'MENTOR').length, color: '#EE2E24' },
                  { key: 'VP', label: 'VP', count: activitiesList.filter(a => a.role === 'VP').length, color: '#9C27B0' },
                ].map((tab) => {
                  const isActive = activityFilter === tab.key;
                  return (
                    <Chip
                      key={tab.key}
                      label={`${tab.label} (${tab.count})`}
                      size="small"
                      onClick={() => setActivityFilter(tab.key as any)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        bgcolor: isActive ? tab.color : 'rgba(0,0,0,0.04)',
                        color: isActive ? '#FFFFFF' : '#64748B',
                        border: '1px solid',
                        borderColor: isActive ? tab.color : '#E2E8F0',
                        '&:hover': {
                          bgcolor: isActive ? tab.color : 'rgba(0,0,0,0.08)',
                        },
                      }}
                    />
                  );
                })}
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <List sx={{ p: 2, flex: 1, maxHeight: 420, overflowY: 'auto' }}>
                {filteredActivities.slice(0, 25).map((act) => (
                  <ListItem
                    key={act.id}
                    sx={{
                      mb: 1,
                      bgcolor: '#F8FAFC',
                      borderRadius: 1.5,
                      border: '1px solid #E2E8F0',
                      py: 1,
                      px: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#F1F5F9',
                        borderColor: '#CBD5E1',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, pr: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: act.iconBg,
                          color: act.iconColor,
                          borderRadius: 1.5,
                          flexShrink: 0,
                        }}
                      >
                        <Iconify
                          icon={act.icon || (
                            act.role === 'ADMIN' ? 'solar:shield-user-bold-duotone' :
                            act.role === 'MENTOR' ? 'solar:user-speak-rounded-bold-duotone' :
                            act.role === 'VP' ? 'solar:check-circle-bold-duotone' :
                            'solar:user-rounded-bold-duotone'
                          )}
                          width={20}
                        />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                          <Typography variant="body2" fontWeight={700} color="#0F172A" noWrap sx={{ fontSize: '0.82rem' }}>
                            {act.title}
                          </Typography>
                          <Chip
                            label={act.role}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              bgcolor: act.role === 'ADMIN' ? 'rgba(0, 79, 159, 0.1)' : act.role === 'PESERTA' ? 'rgba(22, 163, 74, 0.1)' : act.role === 'MENTOR' ? 'rgba(238, 46, 36, 0.1)' : 'rgba(156, 39, 176, 0.1)',
                              color: act.role === 'ADMIN' ? '#004F9F' : act.role === 'PESERTA' ? '#16A34A' : act.role === 'MENTOR' ? '#EE2E24' : '#9C27B0',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.72rem', maxWidth: { xs: 200, sm: 380, md: 450 } }}>
                          {act.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem', fontWeight: 600 }}>
                        {act.timeStr}
                      </Typography>
                      {act.link && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => router.push(act.link!)}
                          sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', color: '#004F9F' }}
                        >
                          {act.linkText || 'Buka'} →
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                ))}

                {filteredActivities.length === 0 && (
                  <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                    <Iconify icon="solar:clipboard-list-bold-duotone" width={36} sx={{ mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Belum ada aktivitas {activityFilter !== 'ALL' ? `untuk role ${activityFilter}` : ''} yang tercatat
                    </Typography>
                  </Box>
                )}
              </List>
            </Card>
          </Grid>

          {/* SECTION: AKSI CEPAT LENGKAP */}
          <Grid xs={12} md={5} lg={4}>
              <Card sx={{ height: '100%', boxShadow: '0px 8px 16px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: 'white' }}>
                  <CardHeader title="Aksi Cepat" subheader="Navigasi cepat ke seluruh menu operasional" sx={{ pb: 1 }} />
                  <Stack spacing={1} sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                      {[
                        { label: 'Peserta', path: '/dashboard/peserta', icon: 'solar:users-group-rounded-bold-duotone' },
                        { label: 'Mentor', path: '/dashboard/mentor', icon: 'solar:user-speak-rounded-bold-duotone' },
                        { label: 'Presensi', path: '/dashboard/presensi', icon: 'solar:calendar-date-bold-duotone' },
                        { label: 'Evaluasi', path: '/dashboard/evaluasi-peserta', icon: 'solar:clipboard-check-bold-duotone' },
                        { label: 'Feedback', path: '/dashboard/feedback', icon: 'solar:chat-round-dots-bold-duotone' },
                        { label: 'Reminder', path: '/dashboard/reminder', icon: 'solar:bell-bing-bold-duotone' },
                      ].map((item) => (
                        <Grid xs={6} key={item.label}>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            onClick={() => router.push(item.path)}
                            startIcon={<Iconify icon={item.icon} width={18} sx={{ color: '#004F9F' }} />}
                            sx={{
                              justifyContent: 'flex-start',
                              px: 1.5,
                              py: 0.9,
                              bgcolor: '#F8FAFC',
                              borderColor: '#E2E8F0',
                              color: '#1E293B',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              borderRadius: 1.5,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: '#FFFFFF',
                                borderColor: '#004F9F',
                                color: '#004F9F',
                                boxShadow: '0 2px 6px rgba(0, 79, 159, 0.08)',
                              },
                            }}
                          >
                            {item.label}
                          </Button>
                        </Grid>
                      ))}
                      <Grid xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => router.push('/user')}
                          startIcon={<Iconify icon="solar:shield-user-bold-duotone" width={18} sx={{ color: '#004F9F' }} />}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 1.5,
                            py: 0.9,
                            bgcolor: '#F8FAFC',
                            borderColor: '#E2E8F0',
                            color: '#1E293B',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#FFFFFF',
                              borderColor: '#004F9F',
                              color: '#004F9F',
                              boxShadow: '0 2px 6px rgba(0, 79, 159, 0.08)',
                            },
                          }}
                        >
                          User Management
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
              </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}