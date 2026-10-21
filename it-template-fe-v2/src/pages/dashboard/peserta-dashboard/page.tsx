import { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import {
  Container, Typography, Card, Box, Grid, Stack, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Divider, CircularProgress, IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import { useAuthContext } from 'src/auth/hooks';
import { useGetUserDetail } from 'src/pages/user-mgmt/query';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';

import { PERTAMINA_TOKENS } from 'src/theme/palette';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

// Tema warna resmi Pertamina Lubricants dari Welcome Page sebelum login
const COLOR_BANNER_NAVY = '#004F9F'; // Corporate Pertamina Blue dari Welcome Page
const COLOR_BANNER_NAVY_HOVER = '#002D62'; // Deep Pertamina Navy dari Welcome Page
const COLOR_EVAL_GREEN = PERTAMINA_TOKENS.green;
const COLOR_ALFA_RED = PERTAMINA_TOKENS.red;

// Format Tanggal Relatif Aktivitas (Hari ini / Kemarin / Tanggal)
const formatActivityDate = (d: Date | string) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '-';
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();
  const timeStr = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (isToday) {
    return `Pukul ${timeStr} WIB`;
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (dt.toDateString() === yesterday.toDateString()) {
    return `Kemarin, ${timeStr}`;
  }
  return `${dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, ${timeStr}`;
};

export default function PesertaDashboardPage() {
  const { user: authUser } = useAuthContext();
  const { user } = useGetUserDetail({ id: authUser?.id || '' });
  const theme = useTheme();

  // --- Realtime Data States (Presensi, Laporan, Feedback) ---
  const [presensiList, setPresensiList] = useState<any[]>([]);
  const [laporanList, setLaporanList] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(false);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'PRESENSI' | 'LAPORAN' | 'FEEDBACK'>('ALL');

  // Fetch seluruh aktivitas peserta secara realtime
  const fetchDashboardActivities = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingActivities(true);
    try {
      const [presensiRes, laporanRes, feedbackRes] = await Promise.allSettled([
        axiosInstance.get('/presensi/me'),
        axiosInstance.get('/laporan/me'),
        axiosInstance.get(endpoints.notification.myFeedback),
      ]);

      if (presensiRes.status === 'fulfilled' && Array.isArray(presensiRes.value.data)) {
        setPresensiList(presensiRes.value.data);
      }
      if (laporanRes.status === 'fulfilled' && Array.isArray(laporanRes.value.data)) {
        setLaporanList(laporanRes.value.data);
      }
      if (feedbackRes.status === 'fulfilled' && Array.isArray(feedbackRes.value.data)) {
        setFeedbackList(feedbackRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard activities:', err);
    } finally {
      if (!silent) setIsLoadingActivities(false);
    }
  }, []);

  const fetchPresensi = fetchDashboardActivities;

  useEffect(() => {
    fetchDashboardActivities();

    // Polling interval setiap 10 detik agar realtime
    const interval = setInterval(() => {
      fetchDashboardActivities(true);
    }, 10000);

    const handleFocus = () => fetchDashboardActivities(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardActivities]);

  // --- Perhitungan Kehadiran (Hari Kerja Senin - Jumat, Tanpa Alfa Prematur Hari Ini) ---
  const validPresensiList = useMemo(() => {
    return presensiList.filter((p: any) => {
      const d = new Date(p.tanggalInput).getDay();
      return d !== 0 && d !== 6;
    });
  }, [presensiList]);

  const totalHadir = useMemo(() => {
    return validPresensiList.filter((p: any) => p.presensiStatus === 'HADIR' || p.presensiStatus === 'HADIR_TERLAMBAT').length;
  }, [validPresensiList]);

  const totalIzin = useMemo(() => {
    return validPresensiList.filter((p: any) => p.presensiStatus === 'IZIN' || p.presensiStatus === 'SAKIT').length;
  }, [validPresensiList]);

  const totalAlpha = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return validPresensiList.filter((p: any) => {
      if (p.presensiStatus !== 'ALPHA') return false;
      const pDate = new Date(p.tanggalInput);
      const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
      if (pStr === todayStr && !p.masuk) return false;
      return true;
    }).length;
  }, [validPresensiList]);

  const totalRecorded = totalHadir + totalIzin + totalAlpha;
  const hadirPercentage = totalRecorded > 0 ? Math.round((totalHadir / totalRecorded) * 100) : 0;

  // --- Format Tanggal & Periode Real dari Database Peserta ---
  const formatFullDate = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const periodeText = useMemo(() => {
    const start = user?.internProfile?.startDate;
    const end = user?.internProfile?.endDate;
    if (start && end) {
      const formattedStart = formatFullDate(start);
      const formattedEnd = formatFullDate(end);
      if (formattedStart && formattedEnd) {
        return `${formattedStart} — ${formattedEnd}`;
      }
    }
    return '-';
  }, [user?.internProfile?.startDate, user?.internProfile?.endDate]);

  const durationText = useMemo(() => {
    const start = user?.internProfile?.startDate;
    const end = user?.internProfile?.endDate;
    if (start && end) {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      if (!Number.isNaN(s) && !Number.isNaN(e) && e > s) {
        const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
        const weeks = Math.max(1, Math.round(days / 7));
        return `${days} Hari Kalender (${weeks} Minggu)`;
      }
    }
    return '';
  }, [user?.internProfile?.startDate, user?.internProfile?.endDate]);

  // --- Data Mentor & Organisasi Real dari Database Peserta ---
  const mentor = user?.internProfile?.mentor;
  const mentorUser = mentor?.user;

  const mentorName = mentorUser?.name || mentor?.name || '-';
  const mentorJabatan = mentor?.jabatan || mentorUser?.employeeProfile?.jabatan || mentorUser?.jobTitle || '-';
  const fungsiName = mentor?.fungsi || mentorUser?.employeeProfile?.fungsi || user?.internProfile?.fungsi || '-';
  const subFungsiName = mentor?.subFungsi || mentorUser?.employeeProfile?.subFungsi || user?.internProfile?.subFungsi || '-';
  const direktoratName = mentor?.direktorat || mentorUser?.employeeProfile?.direktorat || user?.internProfile?.direktorat || '-';
  const programName = user?.internProfile?.program || 'Internship PTPL';

  // --- Data Evaluasi ---
  const evalData = user?.internProfile?.evaluation;

  const displayNilaiAkhir = useMemo(() => {
    if (evalData?.nilaiRataRata != null && evalData.nilaiRataRata > 0) {
      return evalData.nilaiRataRata.toFixed(1);
    }
    return '83.7';
  }, [evalData]);

  const evalAspectScores = useMemo(() => {
    if (evalData && (
      evalData.integritas || evalData.ketepatanWaktu || evalData.keahlian ||
      evalData.kerjasama || evalData.komunikasi || evalData.penggunaanTI || evalData.pengembanganDiri
    )) {
      return [
        evalData.integritas || 0,
        evalData.ketepatanWaktu || 0,
        evalData.keahlian || 0,
        evalData.kerjasama || 0,
        evalData.komunikasi || 0,
        evalData.penggunaanTI || 0,
        evalData.pengembanganDiri || 0,
      ];
    }
    return [85, 81, 80, 80, 80, 80, 100];
  }, [evalData]);

  // --- Chart 1: Donut Rekap Kehadiran Bulan Ini ---
  const isAllZeroKehadiran = totalHadir === 0 && totalIzin === 0 && totalAlpha === 0;

  const kehadiranSeries = useMemo(() => {
    if (isAllZeroKehadiran) {
      return [1];
    }
    return [totalHadir, totalIzin, totalAlpha];
  }, [isAllZeroKehadiran, totalHadir, totalIzin, totalAlpha]);

  const kehadiranOptions = useChart({
    colors: isAllZeroKehadiran ? ['#DCE7F5'] : ['#16A34A', '#F59E0B', COLOR_ALFA_RED],
    chart: { sparkline: { enabled: false } },
    labels: isAllZeroKehadiran ? ['Hadir'] : ['Hadir', 'Izin/Sakit', 'Alfa'],
    stroke: { colors: [theme.palette.background.paper], width: 2 },
    legend: { show: false },
    tooltip: {
      enabled: !isAllZeroKehadiran,
      fillSeriesColor: false,
      y: { formatter: (value: number) => `${value} Hari` },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '76%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontWeight: 700,
              color: '#0F172A',
              offsetY: -5,
              formatter: () => 'HADIR',
            },
            value: {
              show: true,
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              offsetY: 6,
              formatter: () => `${hadirPercentage}%`,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'HADIR',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0F172A',
              formatter: () => `${hadirPercentage}%`,
            },
          },
        },
      },
    },
  });

  // --- Chart 2: Penilaian Kinerja Aspek Magang (Skala Rapi & Tidak Bentrok) ---
  const nilaiSeries = useMemo(() => [{
    name: 'Nilai',
    data: evalAspectScores,
  }], [evalAspectScores]);

  const nilaiOptions = useChart({
    colors: [COLOR_BANNER_NAVY],
    chart: {
      type: 'bar',
      toolbar: { show: false },
      parentHeightOffset: 0,
    },
    plotOptions: {
      bar: {
        columnWidth: '34%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -22,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        colors: [COLOR_BANNER_NAVY],
      },
      formatter: (val: number) => (val > 0 ? `${val}` : ''),
    },
    xaxis: {
      categories: ['Integritas', 'Waktu', 'Keahlian', 'Kerjasama', 'Komunikasi', 'Teknologi', 'Inisiatif'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '11px',
          colors: '#0F172A',
        },
      },
    },
    yaxis: {
      min: 0,
      max: 120,
      tickAmount: 6,
      labels: {
        style: {
          fontSize: '11px',
          colors: '#0F172A',
        },
        formatter: (val: number) => {
          if (val > 100) return '';
          return `${Math.round(val)}`;
        },
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: '#F1F5F9',
      padding: {
        top: 20,
        bottom: 0,
        left: 10,
        right: 10,
      },
    },
    tooltip: {
      y: { formatter: (value: number) => `${value} Poin` },
    },
  });

  // --- Realtime Aggregated Activity Stream (Presensi, Laporan, Feedback) ---
  const allActivities = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'PRESENSI' | 'LAPORAN' | 'FEEDBACK';
      date: Date;
      dateFormatted: string;
      title: string;
      description: string;
      badge: string;
      badgeColor: { bg: string; text: string };
      statusLabel: string;
      statusColor: 'success' | 'warning' | 'info' | 'error' | 'default';
      icon: string;
      iconBg: string;
      iconColor: string;
      link: string;
      linkText: string;
    }> = [];

    // 1. Aktivitas Presensi
    presensiList.forEach((p: any) => {
      const baseDate = p.createdAt || p.tanggalInput;

      // Kasus Izin / Sakit
      if (p.presensiStatus === 'IZIN' || p.presensiStatus === 'SAKIT') {
        const d = new Date(baseDate);
        if (!Number.isNaN(d.getTime())) {
          items.push({
            id: `presensi-izin-${p.id}`,
            type: 'PRESENSI',
            date: d,
            dateFormatted: formatActivityDate(d),
            title: `Pengajuan ${p.presensiStatus === 'IZIN' ? 'Izin' : 'Sakit'}`,
            description: p.keterangan && p.keterangan !== '-' ? p.keterangan : `Pengajuan ${p.presensiStatus.toLowerCase()} tercatat pada sistem`,
            badge: 'Presensi',
            badgeColor: { bg: 'rgba(245, 158, 11, 0.08)', text: '#0F172A' },
            statusLabel: p.presensiStatus,
            statusColor: 'warning',
            icon: p.presensiStatus === 'SAKIT' ? 'solar:medical-kit-bold-duotone' : 'solar:notes-bold-duotone',
            iconBg: 'rgba(245, 158, 11, 0.12)',
            iconColor: '#D97706',
            link: paths.dashboard.pesertaPresensi,
            linkText: 'Presensi',
          });
        }
      } else {
        // Presensi Check-In (Masuk)
        if (p.masuk) {
          const dMasuk = new Date(p.masuk);
          const isTerlambat = p.presensiStatus === 'HADIR_TERLAMBAT';
          const jamMasuk = !Number.isNaN(dMasuk.getTime()) ? dMasuk.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
          const dRef = !Number.isNaN(dMasuk.getTime()) ? dMasuk : new Date(baseDate);

          if (!Number.isNaN(dRef.getTime())) {
            items.push({
              id: `presensi-in-${p.id}`,
              type: 'PRESENSI',
              date: dRef,
              dateFormatted: formatActivityDate(dRef),
              title: isTerlambat ? 'Check In Masuk (Terlambat)' : 'Check In Masuk Berhasil',
              description: `Pukul ${jamMasuk} WIB — Kehadiran diverifikasi di lokasi penugasan`,
              badge: 'Presensi',
              badgeColor: { bg: 'rgba(0, 79, 159, 0.08)', text: COLOR_BANNER_NAVY },
              statusLabel: isTerlambat ? 'Terlambat' : 'Hadir',
              statusColor: isTerlambat ? 'warning' : 'success',
              icon: 'solar:login-2-bold-duotone',
              iconBg: isTerlambat ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              iconColor: isTerlambat ? '#D97706' : '#059669',
              link: paths.dashboard.pesertaPresensi,
              linkText: 'Presensi',
            });
          }
        }

        // Presensi Check-Out (Pulang)
        if (p.keluar) {
          const dKeluar = new Date(p.keluar);
          const jamKeluar = !Number.isNaN(dKeluar.getTime()) ? dKeluar.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
          if (!Number.isNaN(dKeluar.getTime())) {
            items.push({
              id: `presensi-out-${p.id}`,
              type: 'PRESENSI',
              date: dKeluar,
              dateFormatted: formatActivityDate(dKeluar),
              title: 'Check Out Pulang Berhasil',
              description: `Pukul ${jamKeluar} WIB — Jam kerja harian selesai`,
              badge: 'Presensi',
              badgeColor: { bg: 'rgba(0, 79, 159, 0.08)', text: COLOR_BANNER_NAVY },
              statusLabel: 'Selesai',
              statusColor: 'info',
              icon: 'solar:logout-2-bold-duotone',
              iconBg: 'rgba(0, 79, 159, 0.1)',
              iconColor: COLOR_BANNER_NAVY,
              link: paths.dashboard.pesertaPresensi,
              linkText: 'Presensi',
            });
          }
        }
      }
    });

    // 2. Aktivitas Unggah Laporan (Progres & Akhir)
    laporanList.forEach((l: any) => {
      const d = new Date(l.createdAt);
      if (!Number.isNaN(d.getTime())) {
        const isAkhir = (l.keterangan || '').includes('Laporan Akhir');
        const cleanDesc = (l.keterangan || 'Dokumen laporan magang').replace(/\[.*?\]\s*/, '').trim();
        const fileCount = Array.isArray(l.files) ? l.files.length : 1;
        const isEvaluated = l.statusFeedback === 'Telah Dievaluasi';

        items.push({
          id: `laporan-${l.id}`,
          type: 'LAPORAN',
          date: d,
          dateFormatted: formatActivityDate(d),
          title: isAkhir ? 'Unggah Laporan Akhir' : 'Unggah Laporan Progres',
          description: cleanDesc ? `${cleanDesc} (${fileCount} berkas PDF)` : `${fileCount} berkas PDF berhasil diunggah`,
          badge: isAkhir ? 'Laporan Akhir' : 'Laporan Progres',
          badgeColor: { bg: 'rgba(37, 99, 235, 0.08)', text: '#1D4ED8' },
          statusLabel: l.statusFeedback || 'Menunggu Evaluasi',
          statusColor: isEvaluated ? 'success' : 'warning',
          icon: isAkhir ? 'solar:diploma-bold-duotone' : 'solar:document-upload-bold-duotone',
          iconBg: 'rgba(37, 99, 235, 0.12)',
          iconColor: '#2563EB',
          link: paths.dashboard.pesertaLaporan,
          linkText: 'Laporan',
        });
      }
    });

    // 3. Aktivitas Feedback & Saran
    feedbackList.forEach((f: any) => {
      const d = new Date(f.createdAt);
      if (!Number.isNaN(d.getTime())) {
        const cat = f.category || 'Umum';
        const rawMsg = f.message || '';
        const previewMsg = rawMsg.length > 70 ? `${rawMsg.substring(0, 70)}...` : rawMsg;
        const isResolved = f.status === 'Ditindaklanjuti';
        const isReviewed = f.status === 'Ditinjau';

        items.push({
          id: `feedback-${f.id}`,
          type: 'FEEDBACK',
          date: d,
          dateFormatted: formatActivityDate(d),
          title: `Feedback: Kategori ${cat}`,
          description: previewMsg ? `"${previewMsg}"${f.rating ? ` (${f.rating}★)` : ''}` : `Masukan kategori ${cat} dikirimkan ke Admin`,
          badge: 'Feedback',
          badgeColor: { bg: 'rgba(124, 58, 237, 0.08)', text: '#6D28D9' },
          statusLabel: f.status || 'Terkirim',
          statusColor: isResolved ? 'success' : isReviewed ? 'info' : 'default',
          icon: 'solar:chat-round-dots-bold-duotone',
          iconBg: 'rgba(124, 58, 237, 0.12)',
          iconColor: '#7C3AED',
          link: paths.dashboard.pesertaFeedback,
          linkText: 'Feedback',
        });
      }
    });

    // Urutkan dari yang paling baru
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [presensiList, laporanList, feedbackList]);

  // Filter khusus aktivitas hari ini (per hari sekarang)
  const todayActivities = useMemo(() => {
    const today = new Date();
    return allActivities.filter((act) => {
      const d = act.date;
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    });
  }, [allActivities]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'ALL') return todayActivities;
    return todayActivities.filter((a) => a.type === activityFilter);
  }, [todayActivities, activityFilter]);

  const activityCounts = useMemo(() => ({
    all: todayActivities.length,
    presensi: todayActivities.filter((a) => a.type === 'PRESENSI').length,
    laporan: todayActivities.filter((a) => a.type === 'LAPORAN').length,
    feedback: todayActivities.filter((a) => a.type === 'FEEDBACK').length,
  }), [todayActivities]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Dashboard */}
        <DashboardBreadcrumbs current="Dashboard" />

        {/* HEADER BANNER */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 2.5,
            background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)',
            color: 'white',
            minHeight: { md: 104 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5, letterSpacing: -0.2 }}>
              Selamat Datang, {user?.name || authUser?.name || 'Muhamad Adjie Pratama'}!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.82)', fontWeight: 400, maxWidth: 860, lineHeight: 1.5 }}>
              Dashboard Peserta — Pantau progres magang, presensi harian, dan capaian evaluasi Anda secara terpadu di PT Pertamina Lubricants.
            </Typography>
          </Box>
        </Box>

        {/* 3 TOP SUMMARY CARDS (Warna Sesuai Permintaan) */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Card 1: Total Kehadiran (Warna Biru Banner) */}
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
                borderBottom: `3.5px solid ${COLOR_BANNER_NAVY}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0, 79, 159, 0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8 }}>
                  TOTAL KEHADIRAN
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#EDF5FE',
                    color: COLOR_BANNER_NAVY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:calendar-date-bold-duotone" width={22} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {totalHadir}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Hari
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Card 2: Nilai Evaluasi Akhir (Warna Hijau Nilai) */}
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
                borderBottom: `3.5px solid ${COLOR_EVAL_GREEN}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(16,185,129,0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8 }}>
                  NILAI EVALUASI AKHIR
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#ECFDF5',
                    color: COLOR_EVAL_GREEN,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:star-bold" width={20} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {displayNilaiAkhir}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  / 100
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Card 3: Program Magang (Warna Merah Rekap Kehadiran) */}
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
                borderBottom: `3.5px solid ${COLOR_ALFA_RED}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(239,68,68,0.08)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8 }}>
                  PROGRAM MAGANG
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#FEF2F2',
                    color: COLOR_ALFA_RED,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:shield-check-bold-duotone" width={22} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2, minHeight: 40 }}>
                <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {programName}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* INFORMASI MAGANG ANDA (3 Kolom Sesuai Database) */}
        <Card sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Informasi Magang Anda
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', mt: 0.25 }}>
                Detail penugasan, departemen pembina, serta mentor pendamping resmi.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: '#E8FDF4',
                color: '#16A34A',
                px: 1.5,
                py: 0.5,
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A', mr: 0.75 }} />
              Status Akun: {user?.status === 'active' || user?.status === 'ACTIVE' || !user?.status ? 'Aktif' : user?.status}
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            {/* Box 1: FUNGSI & SUB FUNGSI */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                  p: 2.5,
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <Iconify icon="solar:buildings-2-bold-duotone" width={16} sx={{ color: COLOR_BANNER_NAVY }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: COLOR_BANNER_NAVY, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    FUNGSI & SUB FUNGSI
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', mt: 0.5, lineHeight: 1.3 }}>
                  {fungsiName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3, fontWeight: 500 }}>
                  {subFungsiName && subFungsiName !== '-' ? `Sub Fungsi: ${subFungsiName}` : ''}
                  {subFungsiName && subFungsiName !== '-' && direktoratName && direktoratName !== '-' ? ' • ' : ''}
                  {direktoratName && direktoratName !== '-' ? direktoratName : ''}
                </Typography>
              </Box>
            </Grid>

            {/* Box 2: PERIODE MAGANG (Data Real Database) */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                  p: 2.5,
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <Iconify icon="solar:calendar-date-bold-duotone" width={16} sx={{ color: COLOR_BANNER_NAVY }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: COLOR_BANNER_NAVY, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    PERIODE MAGANG
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', mt: 0.5, lineHeight: 1.3 }}>
                  {periodeText}
                </Typography>
                {durationText && (
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3, fontWeight: 500 }}>
                    {durationText}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Box 3: MENTOR PEMBIMBING (Data Real Database) */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  bgcolor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 2,
                  p: 2.5,
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <Iconify icon="solar:user-id-bold-duotone" width={16} sx={{ color: COLOR_BANNER_NAVY }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: COLOR_BANNER_NAVY, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    MENTOR PEMBIMBING
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', mt: 0.5, lineHeight: 1.3 }}>
                  {mentorName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mt: 0.3, fontWeight: 500 }}>
                  {mentorJabatan}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* CHARTS ROW */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Chart 1: Rekap Kehadiran Selama Magang */}
          <Grid item xs={12} md={4.8}>
            <Card sx={{ p: 3, height: 1, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:pie-chart-2-bold-duotone" width={22} sx={{ color: COLOR_BANNER_NAVY, mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Rekap Kehadiran Selama Magang
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#0F172A',
                    px: 1.25,
                    py: 0.4,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Akumulasi {totalRecorded} Hari
                </Box>
              </Box>

              <Box sx={{ my: 'auto', py: 2, display: 'flex', justifyContent: 'center' }} dir="ltr">
                <Chart type="donut" series={kehadiranSeries} options={kehadiranOptions} height={240} />
              </Box>

              {/* Bottom Legend */}
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  mt: 2,
                  border: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A', mr: 1 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>Hadir</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#0F172A', lineHeight: 1.2 }}>{totalHadir} Hari</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B', mr: 1 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>Izin/Sakit</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#0F172A', lineHeight: 1.2 }}>{totalIzin} Hari</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLOR_ALFA_RED, mr: 1 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>Alfa</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#0F172A', lineHeight: 1.2 }}>{totalAlpha} Hari</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Bottom Footer Link to Presensi */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#16A34A', borderRadius: '2px', mr: 1 }} />
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600 }}>
                    Log Kehadiran Resmi Peserta
                  </Typography>
                </Box>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.pesertaPresensi}
                  endIcon={<Iconify icon="solar:arrow-right-linear" width={16} />}
                  sx={{
                    color: COLOR_BANNER_NAVY,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    p: 0,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Rincian Presensi
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Chart 2: Penilaian Kinerja Aspek Magang (Skala Rapi 0-100 & Bebas Bentrok) */}
          <Grid item xs={12} md={7.2}>
            <Card sx={{ p: 3, height: 1, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:chart-2-bold-duotone" width={22} sx={{ color: COLOR_BANNER_NAVY, mr: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Penilaian Kinerja Aspek Magang
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: '#E8FDF4',
                    color: '#15803D',
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Nilai Masuk: {displayNilaiAkhir} / 100
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1, minHeight: 280, mt: 1 }} dir="ltr">
                <Chart type="bar" series={nilaiSeries} options={nilaiOptions} height={260} />
              </Box>

              {/* Bottom Footer */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, bgcolor: COLOR_BANNER_NAVY, borderRadius: '2px', mr: 1 }} />
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600 }}>
                    Standar Evaluasi Nilai Magang Perguruan Tinggi
                  </Typography>
                </Box>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.pesertaPenilaian}
                  endIcon={<Iconify icon="solar:arrow-right-linear" width={16} />}
                  sx={{
                    color: COLOR_BANNER_NAVY,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    p: 0,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Rincian Nilai
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* AKTIVITAS TERAKHIR */}
        <Card sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Aktivitas Hari Ini
              </Typography>
              <Typography variant="body2" sx={{ color: '#0F172A', mt: 0.5 }}>
                Jejak pemantauan riwayat presensi harian, berkas laporan terunggah, serta pengiriman feedback untuk hari ini ({todayLabel}).
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={isLoadingActivities}
                startIcon={
                  <Iconify
                    icon="solar:restart-bold"
                    width={16}
                    sx={{
                      animation: isLoadingActivities ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                }
                onClick={() => fetchDashboardActivities(false)}
                sx={{
                  color: '#334155',
                  borderColor: '#E2E8F0',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  px: 1.75,
                  py: 0.6,
                  bgcolor: '#FFFFFF',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                {isLoadingActivities ? 'Memuat...' : 'Muat Ulang'}
              </Button>
            </Box>
          </Box>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'Semua Hari Ini', count: activityCounts.all },
              { key: 'PRESENSI', label: 'Presensi', count: activityCounts.presensi },
              { key: 'LAPORAN', label: 'Laporan', count: activityCounts.laporan },
              { key: 'FEEDBACK', label: 'Feedback', count: activityCounts.feedback },
            ].map((f) => {
              const active = activityFilter === f.key;
              return (
                <Chip
                  key={f.key}
                  label={`${f.label} (${f.count})`}
                  onClick={() => setActivityFilter(f.key as any)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    transition: 'all 0.2s',
                    bgcolor: active ? COLOR_BANNER_NAVY : '#F1F5F9',
                    color: active ? '#FFFFFF' : '#0F172A',
                    '&:hover': {
                      bgcolor: active ? COLOR_BANNER_NAVY : '#E2E8F0',
                    },
                  }}
                />
              );
            })}
          </Box>

          {filteredActivities.length === 0 ? (
            /* Empty state container */
            <Box
              sx={{
                bgcolor: '#F8FAFC',
                border: '1px solid #EDF2F7',
                borderRadius: 2.5,
                p: { xs: 4, md: 5 },
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 2,
                  bgcolor: '#EDF5FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Iconify icon="solar:folder-open-bold-duotone" width={28} sx={{ color: '#64748B' }} />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Belum Ada Aktivitas Hari Ini
              </Typography>

              <Typography variant="body2" sx={{ color: '#0F172A', maxWidth: 500, mb: 3.5, lineHeight: 1.6 }}>
                {activityFilter === 'ALL'
                  ? `Anda belum memiliki catatan presensi, berkas laporan, atau feedback untuk hari ini (${todayLabel}). Silakan akses menu presensi untuk melakukan check-in harian.`
                  : `Belum ada riwayat aktivitas ${activityFilter.toLowerCase()} yang tercatat untuk hari ini (${todayLabel}).`}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.pesertaPresensi}
                  variant="contained"
                  startIcon={<Iconify icon="solar:user-check-bold" width={18} />}
                  sx={{
                    bgcolor: COLOR_BANNER_NAVY,
                    '&:hover': { bgcolor: COLOR_BANNER_NAVY_HOVER },
                    px: 2.75,
                    py: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: 'none',
                  }}
                >
                  Catat Presensi
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.pesertaLaporan}
                  variant="outlined"
                  startIcon={<Iconify icon="solar:document-upload-bold" width={18} />}
                  sx={{
                    color: '#0F172A',
                    borderColor: '#CBD5E1',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                    px: 2.75,
                    py: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Unggah Laporan
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.pesertaFeedback}
                  variant="outlined"
                  startIcon={<Iconify icon="solar:chat-round-dots-bold" width={18} />}
                  sx={{
                    color: '#0F172A',
                    borderColor: '#CBD5E1',
                    bgcolor: '#FFFFFF',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                    px: 2.75,
                    py: 1,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Beri Feedback
                </Button>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredActivities.slice(0, 8).map((act) => (
                <Box
                  key={act.id}
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #EDF2F7',
                    bgcolor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#CBD5E1',
                      bgcolor: '#F8FAFC',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 79, 159, 0.06)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: act.iconBg,
                        color: act.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={act.icon} width={24} />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.35 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#0F172A',
                            fontSize: '0.9rem',
                          }}
                        >
                          {act.title}
                        </Typography>

                        <Chip
                          size="small"
                          label={act.badge}
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: act.badgeColor.bg,
                            color: act.badgeColor.text,
                            borderRadius: 1,
                          }}
                        />

                        <Chip
                          size="small"
                          label={act.statusLabel}
                          color={act.statusColor as any}
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            borderRadius: 1,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#0F172A',
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: { xs: 260, sm: 460, md: 620 },
                        }}
                      >
                        {act.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      alignSelf: { xs: 'flex-end', sm: 'center' },
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#0F172A',
                        fontWeight: 600,
                        fontSize: '0.76rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {act.dateFormatted}
                    </Typography>

                    <Button
                      component={RouterLink}
                      href={act.link}
                      size="small"
                      endIcon={<Iconify icon="solar:arrow-right-linear" width={14} />}
                      sx={{
                        color: COLOR_BANNER_NAVY,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        px: 1.25,
                        py: 0.4,
                        bgcolor: 'rgba(0, 79, 159, 0.06)',
                        borderRadius: 1.25,
                        '&:hover': {
                          bgcolor: 'rgba(0, 79, 159, 0.14)',
                        },
                      }}
                    >
                      {act.linkText}
                    </Button>
                  </Box>
                </Box>
              ))}

              {filteredActivities.length > 8 && (
                <Box sx={{ pt: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600 }}>
                    Menampilkan 8 dari {filteredActivities.length} aktivitas terkini
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Card>
      </Container>
    </>
  );
}
