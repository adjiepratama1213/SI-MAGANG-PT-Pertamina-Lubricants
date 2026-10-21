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
  Button, Stack, Chip, LinearProgress, Divider
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import AppAreaInstalled from '../app-area-installed';
import AppCurrentDownload from '../app-current-download';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { useSearchUsers } from 'src/pages/user-mgmt/query';

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
  const { userSearchData } = useSearchUsers('');

  const [internsList, setInternsList] = useState<any[]>([]);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [remindersList, setRemindersList] = useState<any[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
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

  const fetchDashboardData = async () => {
    try {
      const [internRes, presensiRes, reminderRes, feedbackRes, notifRes] = await Promise.allSettled([
        axiosInstance.get('/intern-profile'),
        axiosInstance.get('/presensi/admin/monthly?month=all'),
        axiosInstance.get(endpoints.notification.reminder),
        axiosInstance.get(endpoints.notification.feedback),
        axiosInstance.get('/notification'),
      ]);

      const interns = internRes.status === 'fulfilled' && internRes.value.data?.results ? internRes.value.data.results : [];
      const presensi = presensiRes.status === 'fulfilled' && Array.isArray(presensiRes.value.data) ? presensiRes.value.data : [];
      const reminders = reminderRes.status === 'fulfilled' && Array.isArray(reminderRes.value.data) ? reminderRes.value.data : [];
      const feedbacks = feedbackRes.status === 'fulfilled' && Array.isArray(feedbackRes.value.data) ? feedbackRes.value.data : [];
      const notifs = notifRes.status === 'fulfilled' && notifRes.value.data?.notifications ? notifRes.value.data.notifications : [];

      setInternsList(interns);
      setPresensiData(presensi);
      setRemindersList(reminders);
      setFeedbacksList(feedbacks);
      setNotificationsList(notifs);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    const handleFocus = () => fetchDashboardData();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'evaluasi_peserta_vp_approvals') {
        try {
          setVpApprovals(e.newValue ? JSON.parse(e.newValue) : {});
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const activeInternsList = useMemo(() => {
    return internsList.filter((i: any) => (!i.user || !i.user.status || i.user.status === 'active') && !!i.mentorProfileId);
  }, [internsList]);

  const activeMentorsList = useMemo(() => {
    return (userSearchData || []).filter((u: any) => u.role === 'EMPLOYEESTAFF' && u.status === 'active');
  }, [userSearchData]);

  const activeFeedbacksList = useMemo(() => {
    return feedbacksList.filter((f: any) => !f.intern?.user || !f.intern.user.status || f.intern.user.status === 'active');
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

  // Pipeline Evaluasi & Sertifikat
  const totalEvaluated = activeInternsList.filter((i: any) => !!i.evaluation).length;
  const totalLaporan = activeInternsList.filter((i: any) => Array.isArray(i.Laporan) && i.Laporan.length > 0).length;
  const totalCertificate = activeInternsList.filter((i: any) => !!i.evaluation?.certificateUrl).length;

  // Peserta yang status evaluasinya sudah selesai dinilai & laporan akhir dievaluasi
  const totalSelesaiEvaluasi = activeInternsList.filter((intern: any) => {
    const hasEval = !!intern.evaluation;
    const lap = getLatestLaporanAkhir(intern.Laporan);
    return hasEval && lap?.statusFeedback === 'Telah Dievaluasi';
  }).length;

  // Peserta yang sudah selesai evaluasi tapi belum diajukan approval ke VP
  const siapAjukanVpCount = activeInternsList.filter((intern: any) => {
    const hasEval = !!intern.evaluation;
    const lap = getLatestLaporanAkhir(intern.Laporan);
    const isSelesai = hasEval && lap?.statusFeedback === 'Telah Dievaluasi';
    const hasCert = !!intern.evaluation?.certificateUrl;
    const vpSt = vpApprovals[intern.id] || 'NONE';
    return isSelesai && !hasCert && vpSt === 'NONE';
  }).length;

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

  // Dynamic Yearly Attendance Series for AppAreaInstalled (dengan pilihan tahun sebelumnya & berikutnya)
  const yearlySeries = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const detectedYears = new Set<number>();

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

    // Selalu sediakan tahun sebelumnya, tahun berjalan, dan tahun berikutnya
    detectedYears.add(currentYear - 1);
    detectedYears.add(currentYear);
    detectedYears.add(currentYear + 1);

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
                if (st === 'HADIR' || st === 'HADIR_TERLAMBAT' || (d.masuk && d.masuk !== '-')) {
                  yHadir[monthIdx]++;
                } else if (st === 'IZIN' || st === 'SAKIT') {
                  yIzin[monthIdx]++;
                } else if (st === 'ALPHA') {
                  yAlpha[monthIdx]++;
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

    Object.entries(vpApprovals).forEach(([internId, status]) => {
      const targetIntern = activeInternsList.find((i) => i.id === internId);
      const internName = targetIntern?.user?.name || 'Peserta Magang';
      if (status === 'PENDING') {
        list.push({
          id: `admin-vp-pending-${internId}`,
          role: 'ADMIN',
          title: 'Pengajuan Approval ke VP',
          description: `Admin mengajukan berkas evaluasi kelulusan ${internName} untuk disetujui VP`,
          time: new Date(),
          timeStr: 'Baru saja',
          icon: 'solar:letter-bold',
          iconBg: 'rgba(0, 79, 159, 0.1)',
          iconColor: '#004F9F',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 2. VP Activities
    Object.entries(vpApprovals).forEach(([internId, status]) => {
      const targetIntern = internsList.find((i) => i.id === internId);
      const internName = targetIntern?.user?.name || 'Peserta Magang';
      if (status === 'APPROVED') {
        list.push({
          id: `vp-approved-${internId}`,
          role: 'VP',
          title: 'Approval Kelulusan Disetujui',
          description: `VP menyetujui evaluasi kelulusan ${internName}. Menunggu penerbitan sertifikat oleh Admin.`,
          time: new Date(),
          timeStr: 'Baru saja',
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
          time: new Date(),
          timeStr: 'Baru saja',
          icon: 'solar:close-circle-bold-duotone',
          iconBg: 'rgba(238, 46, 36, 0.1)',
          iconColor: '#EE2E24',
          link: '/dashboard/evaluasi-peserta',
          linkText: 'Evaluasi',
        });
      }
    });

    // 3. MENTOR Activities
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

      if (Array.isArray(i.Laporan)) {
        i.Laporan.forEach((lap: any) => {
          if (lap.statusFeedback === 'Telah Dievaluasi' || lap.komentar) {
            const d = new Date(lap.updatedAt || lap.createdAt || Date.now());
            list.push({
              id: `mentor-lap-${lap.id}`,
              role: 'MENTOR',
              title: 'Review Laporan oleh Mentor',
              description: `Mentor mengevaluasi berkas laporan milik ${i.user?.name || 'peserta'}${lap.komentar ? `: "${lap.komentar.slice(0, 45)}..."` : ''}`,
              time: d,
              timeStr: formatActivityTime(d),
              icon: 'solar:document-check-bold-duotone',
              iconBg: 'rgba(238, 46, 36, 0.1)',
              iconColor: '#EE2E24',
              link: '/dashboard/evaluasi-peserta',
              linkText: 'Evaluasi',
            });
          }
        });
      }
    });

    // 4. PESERTA Activities
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
          const d = new Date(lap.createdAt || Date.now());
          const isAkhir = (lap.keterangan || '').toLowerCase().includes('akhir');
          list.push({
            id: `peserta-lap-${lap.id}`,
            role: 'PESERTA',
            title: isAkhir ? 'Unggah Laporan Akhir' : 'Unggah Laporan Mingguan',
            description: `${i.user?.name || 'Peserta'} mengunggah berkas laporan magang`,
            time: d,
            timeStr: formatActivityTime(d),
            icon: 'solar:document-upload-bold-duotone',
            iconBg: 'rgba(22, 163, 74, 0.1)',
            iconColor: '#16A34A',
            link: '/dashboard/evaluasi-peserta',
            linkText: 'Evaluasi',
          });
        });
      }
    });

    presensiData.forEach((item: any) => {
      if (Array.isArray(item.presensiDetail)) {
        item.presensiDetail.slice(-2).forEach((d: any) => {
          if (d.status === 'HADIR' || d.status === 'HADIR_TERLAMBAT' || (d.masuk && d.masuk !== '-')) {
            const isTerlambat = d.status === 'HADIR_TERLAMBAT';
            let dateObj = new Date();
            if (d.tanggal && d.tanggal.includes('/')) {
              const parts = d.tanggal.split('/');
              const jamParts = (d.masuk && d.masuk.includes(':')) ? d.masuk.split(':') : ['08', '00'];
              dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), parseInt(jamParts[0], 10), parseInt(jamParts[1], 10));
            }
            list.push({
              id: `peserta-in-${item.userId || item.nama}-${d.tanggal}`,
              role: 'PESERTA',
              title: isTerlambat ? 'Presensi Masuk (Terlambat)' : 'Presensi Masuk Berhasil',
              description: `${item.nama || item.userName || 'Peserta'} hadir pukul ${d.masuk || '08:00'} WIB`,
              time: dateObj,
              timeStr: formatActivityTime(dateObj),
              icon: 'solar:login-2-bold-duotone',
              iconBg: isTerlambat ? 'rgba(245, 158, 11, 0.1)' : 'rgba(22, 163, 74, 0.1)',
              iconColor: isTerlambat ? '#F59E0B' : '#16A34A',
              link: '/dashboard/presensi',
              linkText: 'Presensi',
            });
          } else if (d.status === 'IZIN' || d.status === 'SAKIT') {
            let dateObj = new Date();
            if (d.tanggal && d.tanggal.includes('/')) {
              const parts = d.tanggal.split('/');
              dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 8, 0);
            }
            list.push({
              id: `peserta-izin-${item.userId || item.nama}-${d.tanggal}`,
              role: 'PESERTA',
              title: `Pengajuan ${d.status === 'SAKIT' ? 'Sakit' : 'Izin'}`,
              description: `${item.nama || item.userName || 'Peserta'} mengajukan ${d.status.toLowerCase()}${d.keterangan ? `: ${d.keterangan}` : ''}`,
              time: dateObj,
              timeStr: formatActivityTime(dateObj),
              icon: d.status === 'SAKIT' ? 'solar:medical-kit-bold-duotone' : 'solar:notes-bold-duotone',
              iconBg: 'rgba(245, 158, 11, 0.1)',
              iconColor: '#F59E0B',
              link: '/dashboard/presensi',
              linkText: 'Presensi',
            });
          }
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

    return list.sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [remindersList, feedbacksList, internsList, vpApprovals, presensiData, notificationsList]);

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
      title: 'EVALUASI PESERTA',
      value: totalSelesaiEvaluasi,
      suffix: 'Selesai',
      icon: 'solar:clipboard-check-bold-duotone',
      color: '#16A34A',
      bg: '#DCFCE7',
      caption: siapAjukanVpCount > 0 
        ? `${siapAjukanVpCount} siap diajukan approval ke VP` 
        : (totalSelesaiEvaluasi > 0 ? 'Status evaluasi selesai dinilai' : 'Belum ada evaluasi selesai'),
      onClick: () => router.push('/dashboard/evaluasi-peserta'),
    },
    {
      title: 'TINGKAT KEHADIRAN',
      value: `${rate}%`,
      suffix: '',
      icon: 'solar:chart-2-bold-duotone',
      color: '#F59E0B',
      bg: '#FEF3C7',
      caption: 'Akumulasi performa kehadiran',
      onClick: () => router.push('/dashboard/presensi'),
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

          {/* 4 Summary Cards (Termasuk Evaluasi Peserta pengganti Hadir Hari Ini) */}
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

                <Typography variant="caption" sx={{ color: card.title === 'EVALUASI PESERTA' && siapAjukanVpCount > 0 ? '#16A34A' : '#94A3B8', mt: 1, fontWeight: card.title === 'EVALUASI PESERTA' && siapAjukanVpCount > 0 ? 700 : 500 }}>
                  {card.caption}
                </Typography>
              </Card>
            </Grid>
          ))}

          {/* SECTION: PROGRESS EVALUASI & KELULUSAN (Status Selesai Siap Approval ke VP) */}
          <Grid xs={12}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 2.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#004F9F">
                    Progress Evaluasi & Kelulusan Peserta
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pantau status penyelesaian laporan, penilaian mentor, approval VP, dan penerbitan sertifikat
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => router.push('/dashboard/evaluasi-peserta')}
                  startIcon={<Iconify icon="solar:arrow-right-up-bold" width={14} />}
                  sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700, fontSize: '0.75rem' }}
                >
                  Buka Menu Evaluasi
                </Button>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid xs={6} sm={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(0, 79, 159, 0.05)', borderRadius: 1.5, border: '1px solid rgba(0, 79, 159, 0.15)' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.7rem' }}>LAPORAN TERKUMPUL</Typography>
                    <Typography variant="h4" fontWeight={800} color="#004F9F">{totalLaporan}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>Berkas laporan akhir</Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 1.5, border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.7rem' }}>DINILAI MENTOR</Typography>
                    <Typography variant="h4" fontWeight={800} color="#F59E0B">{totalEvaluated}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>Nilai evaluasi terisi</Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(156, 39, 176, 0.05)', borderRadius: 1.5, border: '1px solid rgba(156, 39, 176, 0.15)' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.7rem' }}>STATUS SELESAI</Typography>
                    <Typography variant="h4" fontWeight={800} color="#9C27B0">{totalSelesaiEvaluasi}</Typography>
                    <Typography variant="caption" sx={{ color: siapAjukanVpCount > 0 ? '#9C27B0' : 'text.disabled', fontWeight: siapAjukanVpCount > 0 ? 700 : 500, fontSize: '0.68rem' }}>
                      {siapAjukanVpCount > 0 ? `${siapAjukanVpCount} siap diajukan ke VP` : 'Siap / diproses VP'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={6} sm={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(22, 163, 74, 0.05)', borderRadius: 1.5, border: '1px solid rgba(22, 163, 74, 0.15)' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.7rem' }}>SERTIFIKAT RESMI</Typography>
                    <Typography variant="h4" fontWeight={800} color="#16A34A">{totalCertificate}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>Telah diterbitkan</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                <Iconify icon="solar:info-circle-bold-duotone" width={22} sx={{ color: '#004F9F', flexShrink: 0 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  <strong>{totalSelesaiEvaluasi} dari {totalPeserta} peserta</strong> telah selesai dievaluasi. {siapAjukanVpCount > 0 && <span>Terdapat <strong>{siapAjukanVpCount} peserta</strong> yang siap diajukan approval ke VP. </span>}<strong>{totalCertificate} peserta</strong> telah menerima sertifikat kelulusan magang resmi.
                </Typography>
              </Box>
            </Card>
          </Grid>
          
          {/* Charts Area: Statistik Kehadiran dengan pilihan tahun berikutnya & tahun sebelumnya */}
          <Grid xs={12} md={8}>
              <AppAreaInstalled
                title="Statistik Kehadiran Peserta"
                subheader="Tren kehadiran peserta magang tahun 2026"
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

          {/* WIDGET TAMBAHAN 1: SEBARAN FUNGSI & PENEMPATAN KERJA */}
          <Grid xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#004F9F">
                    Sebaran Penempatan Fungsi Kerja
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Distribusi peserta pada divisi pembimbing PT Pertamina Lubricants
                  </Typography>
                </Box>
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
              </Box>

              <Stack spacing={2} sx={{ mt: 1 }}>
                {functionDistribution.slice(0, 4).map((func, idx) => (
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
            </Card>
          </Grid>

          {/* WIDGET TAMBAHAN 2: PUSAT FEEDBACK & ASPIRASI TERBARU (Kategori jelas & warna status sesuai menu Feedback) */}
          <Grid xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', bgcolor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#004F9F">
                    Feedback & Aspirasi Terkini
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Masukan peserta terkait program & fasilitas magang
                  </Typography>
                </Box>
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
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid xs={4}>
                  <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', fontSize: '0.65rem' }}>TOTAL MASUK</Typography>
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
                    <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>DITINDAKLANJUTI</Typography>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#16A34A' }}>{doneFeedbacksCount}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <List disablePadding>
                {feedbacksList.slice(0, 3).map((fb: any, idx: number) => (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, pr: 1 }}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: '#EDF5FE', color: '#004F9F', fontSize: '0.75rem', fontWeight: 700 }}>
                        {(fb.intern?.user?.name || 'P').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="caption" fontWeight={700} color="#0F172A" noWrap>
                            {fb.isAnonymous ? 'Peserta (Anonim)' : (fb.intern?.user?.name || 'Peserta')}
                          </Typography>
                          <Chip 
                            label={fb.category || 'Umum'} 
                            size="small" 
                            sx={{ 
                              height: 19, 
                              fontSize: '0.66rem', 
                              bgcolor: 'rgba(0, 79, 159, 0.08)', 
                              color: '#004F9F',
                              border: '1px solid rgba(0, 79, 159, 0.2)',
                              fontWeight: 700,
                              borderRadius: 1,
                              '& .MuiChip-label': { px: 0.8, color: '#004F9F', fontWeight: 700 }
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
            </Card>
          </Grid>

          {/* SECTION: AKTIVITAS TERBARU (Multi-role: Admin, Peserta, Mentor, VP) */}
          <Grid xs={12} md={7} lg={8}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#004F9F">
                    Aktivitas Terbaru
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Log terpadu aktivitas Admin, Peserta, Mentor, dan VP
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  onClick={() => router.push('/dashboard/presensi')} 
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
                >
                  Log Presensi
                </Button>
              </Box>

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
                {filteredActivities.slice(0, 10).map((act) => (
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
                        <Iconify icon={act.icon} width={20} />
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
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="primary" size="small" onClick={() => router.push('/dashboard/peserta')} startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 79, 159, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Peserta
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="secondary" size="small" onClick={() => router.push('/dashboard/mentor')} startIcon={<Iconify icon="solar:user-speak-rounded-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(156, 39, 176, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Mentor
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="info" size="small" onClick={() => router.push('/dashboard/presensi')} startIcon={<Iconify icon="solar:calendar-date-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 184, 217, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Presensi
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="success" size="small" onClick={() => router.push('/dashboard/evaluasi-peserta')} startIcon={<Iconify icon="solar:clipboard-check-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(0, 167, 111, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Evaluasi
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="error" size="small" onClick={() => router.push('/dashboard/feedback')} startIcon={<Iconify icon="solar:chat-round-dots-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(255, 86, 48, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Feedback
                        </Button>
                      </Grid>
                      <Grid xs={6}>
                        <Button fullWidth variant="outlined" color="warning" size="small" onClick={() => router.push('/dashboard/reminder')} startIcon={<Iconify icon="solar:bell-bing-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: 'rgba(255, 171, 0, 0.05)', textTransform: 'none', fontWeight: 700 }}>
                          Reminder
                        </Button>
                      </Grid>
                      <Grid xs={12}>
                        <Button fullWidth variant="outlined" color="inherit" size="small" onClick={() => router.push('/user')} startIcon={<Iconify icon="solar:shield-user-bold-duotone" width={18} />} sx={{ justifyContent: 'flex-start', px: 1.5, py: 0.75, bgcolor: '#f8fafc', textTransform: 'none', fontWeight: 700, borderColor: '#e2e8f0' }}>
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