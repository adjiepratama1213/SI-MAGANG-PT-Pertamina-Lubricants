import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Alert,
  CircularProgress
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

// Helper untuk format tanggal lokal YYYY-MM-DD tanpa terpengaruh pergeseran timezone UTC
const getLocalDateKey = (dateInput: string | Date = new Date()): string => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper render status presensi konsisten (Desain outlined seperti kolom aksi pada data-bimbingan, pertahankan warna status)
export const renderPresensiStatusChip = (status: string | null | undefined) => {
  if (!status || status === '-') {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }

  const raw = String(status).trim();
  const upper = raw.toUpperCase();

  let label = upper;
  // Pertamina Red: #EC2028 | Hijau: #16A34A | Yellow/Amber: #F59E0B | Default / Belum: #64748B
  let color = '#64748B';

  if (upper.includes('BELUM') || upper === 'BELUM CHECK IN') {
    label = 'BELUM CHECK IN';
    color = '#64748B';
  } else if (upper === 'HADIR_TERLAMBAT' || upper.includes('TERLAMBAT')) {
    label = 'HADIR (TERLAMBAT)';
    color = '#16A34A';
  } else if (upper.includes('HADIR')) {
    label = 'HADIR';
    color = '#16A34A';
  } else if (upper === 'IZIN' || upper.includes('IZIN')) {
    label = 'IZIN';
    color = '#F59E0B'; // Kuning sama seperti di peserta-dashboard
  } else if (upper === 'SAKIT' || upper.includes('SAKIT')) {
    label = 'SAKIT';
    color = '#F59E0B'; // Kuning sama seperti di peserta-dashboard
  } else if (upper.includes('ALPHA') || upper.includes('ALFA') || upper.includes('TIDAK HADIR') || upper.includes('TOLAK')) {
    label = upper.includes('TOLAK') ? 'DITOLAK' : 'ALPHA';
    color = '#EC2028'; // Merah logo Pertamina
  }

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        minWidth: 90,
        bgcolor: '#FFFFFF',
        color,
        borderColor: color,
        borderWidth: 1.5,
        borderStyle: 'solid',
        fontWeight: 700,
        fontSize: '0.75rem',
        borderRadius: 1,
        height: 28,
        letterSpacing: '0.3px',
        '& .MuiChip-label': {
          px: 1,
          fontWeight: 700,
        },
        '&:hover': {
          bgcolor: '#FFFFFF',
        },
      }}
    />
  );
};

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px' }}>
          <h2>Component Crashed</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function PesertaPresensiPageContent() {
  const { user } = useAuthContext();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // States untuk fitur Absensi & Lokasi Maps (murni ditentukan oleh perangkat untuk mencegah kecurangan)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locAccuracy, setLocAccuracy] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [todayStatus, setTodayStatus] = useState<string>('Belum Check In');

  // States untuk Izin / Sakit
  const [openIzin, setOpenIzin] = useState(false);
  const [formIzin, setFormIzin] = useState({
    tipe: 'Izin',
    tanggalMulai: getLocalDateKey(new Date()),
    tanggalSelesai: getLocalDateKey(new Date()),
    keterangan: ''
  });
  const [fileIzin, setFileIzin] = useState<File | null>(null);

  // States untuk Keterlambatan
  const [openTerlambat, setOpenTerlambat] = useState(false);
  const [keteranganTerlambat, setKeteranganTerlambat] = useState('');
  const [fileTerlambat, setFileTerlambat] = useState<File | null>(null);

  // States untuk Detail Presensi
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const handleOpenDetail = (row: any) => {
    setSelectedDetail(row);
    setOpenDetail(true);
  };
  const handleCloseDetail = () => setOpenDetail(false);

  const [myPresensi, setMyPresensi] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Deteksi lokasi murni dari perangkat peserta (anti-kecurangan)
  const detectLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocError('Browser Anda tidak mendukung Geolokasi');
      return;
    }

    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocAccuracy(Math.round(pos.coords.accuracy));
        setLocLoading(false);
        setLocError('');
      },
      (err) => {
        setLocLoading(false);
        console.warn('Geolocation warning:', err.message);
        setLocError(err.message || 'Gagal mendeteksi lokasi perangkat. Pastikan izin lokasi aktif.');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  // Ambil lokasi saat komponen dimuat & pantau perubahan posisi perangkat
  useEffect(() => {
    try {
      localStorage.removeItem('peserta_presensi_custom_loc');
    } catch (e) { }

    detectLocation();

    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocAccuracy(Math.round(pos.coords.accuracy));
            setLocError('');
          },
          () => { },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          }
        );
      } catch (e) {
        // Fallback
      }
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [detectLocation]);

  // Fetch data presensi peserta
  const fetchPresensi = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsFetching(true);
      const res = await axiosInstance.get('/presensi/me');
      if (res.data) {
        const formatted = res.data.map((item: any) => {
          const localKey = getLocalDateKey(item.tanggalInput);
          const tglObj = new Date(item.tanggalInput);
          return {
            id: item.id,
            rawTanggal: item.tanggalInput,
            tanggal: Number.isNaN(tglObj.getTime()) ? '-' : tglObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            tanggalInput: localKey,
            masuk: item.masuk ? new Date(item.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            keluar: item.keluar ? new Date(item.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
            presensiStatus: (localKey === getLocalDateKey(new Date()) && (!item.masuk || item.masuk === '-') && item.presensiStatus === 'ALPHA')
              ? 'BELUM CHECK IN'
              : item.presensiStatus,
            keterangan: item.keterangan || '-',
            tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null,
            fileBukti: item.fileBukti || null,
            lat: item.lat || null,
            lng: item.lng || null,
          };
        });
        setMyPresensi(formatted);

        // Tentukan status hari ini secara akurat dengan tanggal lokal
        const todayStr = getLocalDateKey(new Date());
        const todayRecord = formatted.find((f: any) => f.tanggalInput === todayStr);

        if (todayRecord) {
          if (todayRecord.masuk && todayRecord.masuk !== '-') {
            setTodayStatus(todayRecord.presensiStatus);
            setCheckInTime(new Date());
          } else if (todayRecord.presensiStatus === 'IZIN' || todayRecord.presensiStatus === 'SAKIT') {
            setTodayStatus(todayRecord.presensiStatus);
            setCheckInTime(null);
          } else {
            setTodayStatus('Belum Check In');
            setCheckInTime(null);
          }

          if (todayRecord.keluar && todayRecord.keluar !== '-') {
            setCheckOutTime(new Date());
          } else {
            setCheckOutTime(null);
          }
        } else {
          setTodayStatus('Belum Check In');
          setCheckInTime(null);
          setCheckOutTime(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsFetching(false);
    }
  }, []);

  // Polling interval setiap 8 detik agar data presensi ter-update berkala
  useEffect(() => {
    fetchPresensi();

    const interval = setInterval(() => {
      fetchPresensi(true);
    }, 8000);

    const handleFocus = () => fetchPresensi(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchPresensi]);

  const handleResetFilter = () => {
    setFilterDate('');
    setFilterStatus('all');
    setPage(0);
  };

  const handleOpenIzin = () => setOpenIzin(true);
  const handleCloseIzin = () => setOpenIzin(false);

  const handleSubmitIzin = async () => {
    try {
      const formData = new FormData();
      formData.append('tipe', formIzin.tipe.toUpperCase());
      formData.append('tanggalMulai', formIzin.tanggalMulai);
      formData.append('tanggalSelesai', formIzin.tanggalSelesai);
      formData.append('keterangan', formIzin.keterangan);
      if (fileIzin) {
        formData.append('file', fileIzin);
      }

      await axiosInstance.post('/presensi/izin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Pengajuan Izin/Sakit berhasil');
      await fetchPresensi();
      handleCloseIzin();
      setFileIzin(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengajukan Izin/Sakit');
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast.warning('Tunggu hingga lokasi Anda terdeteksi!');
      return;
    }
    const currentHour = new Date().getHours();
    if (currentHour >= 8) {
      setOpenTerlambat(true);
      return;
    }

    try {
      await axiosInstance.post('/presensi/check-in', {
        lat: location.lat.toString(),
        lng: location.lng.toString(),
      });
      toast.success('Check In berhasil');
      await fetchPresensi();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal Check In');
    }
  };

  const submitTerlambat = async () => {
    if (!keteranganTerlambat) {
      toast.warning('Keterangan keterlambatan harus diisi!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('keterangan', keteranganTerlambat);
      if (location) {
        formData.append('lat', location.lat.toString());
        formData.append('lng', location.lng.toString());
      }
      if (fileTerlambat) {
        formData.append('file', fileTerlambat);
      }

      await axiosInstance.post('/presensi/check-in', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Check In (Terlambat) berhasil');
      await fetchPresensi();
      setOpenTerlambat(false);
      setKeteranganTerlambat('');
      setFileTerlambat(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengirim form keterlambatan');
    }
  };

  const handleCheckOut = async () => {
    if (!checkInTime) {
      toast.warning('Anda belum Check In hari ini');
      return;
    }
    try {
      await axiosInstance.post('/presensi/check-out', {
        lat: location?.lat?.toString(),
        lng: location?.lng?.toString(),
      });
      toast.success('Check Out berhasil');
      await fetchPresensi();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal Check Out');
    }
  };

  const filteredPresensi = useMemo(() => {
    return myPresensi
      .filter(item => {
        const matchDate = !filterDate || item.tanggalInput === filterDate;
        let matchStatus = true;
        if (filterStatus !== 'all') {
          const statusLower = (item.presensiStatus || '').toLowerCase();
          if (filterStatus === 'hadir') {
            matchStatus = statusLower.includes('hadir');
          } else if (filterStatus === 'izin') {
            matchStatus = statusLower === 'izin' || statusLower === 'sakit';
          } else if (filterStatus === 'alpha') {
            matchStatus = statusLower.includes('alpha');
          } else {
            matchStatus = statusLower.includes(filterStatus);
          }
        }
        return matchDate && matchStatus;
      })
      .sort((a, b) => new Date(b.rawTanggal || b.tanggalInput).getTime() - new Date(a.rawTanggal || a.tanggalInput).getTime());
  }, [myPresensi, filterDate, filterStatus]);

  return (
    <>
      <Helmet>
        <title>Presensi Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Presensi */}
        <DashboardBreadcrumbs current="Presensi" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Presensi Saya
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Kelola dan pantau kehadiran harian Anda, pengajuan izin/sakit, serta status check-in harian di PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* PEMBERITAHUAN WAKTU PRESENSI */}
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(245, 158, 11, 0.3)',
            bgcolor: 'rgba(245, 158, 11, 0.08)',
            '& .MuiAlert-icon': { mt: 0.5, color: '#F59E0B' },
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#92400E' }}>
            Pemberitahuan Presensi:
          </Typography>
          <Typography variant="body2" sx={{ color: '#78350F' }}>
            Peserta magang <strong>wajib melakukan Check In sebelum pukul 08:00 pagi</strong>. Check In di atas jam tersebut akan dianggap terlambat. Untuk Check Out, dapat dilakukan setelah jam kerja selesai.
          </Typography>
        </Alert>

        {/* FORM ABSENSI */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Form Absensi — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25 }}>
              Pastikan lokasi Anda akurat sebelum melakukan Check In atau Check Out
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {/* Kolom Maps */}
            <Grid item xs={12} md={7}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:map-point-wave-bold" width={22} sx={{ color: BRAND_NAVY }} />
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A' }}>
                    Peta Lokasi Presensi
                  </Typography>
                  {locAccuracy !== null && (
                    <Chip
                      label={`Akurasi: ±${locAccuracy}m`}
                      size="small"
                      color={locAccuracy <= 50 ? 'success' : 'warning'}
                      variant="soft"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={detectLocation}
                    disabled={locLoading}
                    startIcon={locLoading ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:restart-bold" width={16} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      py: 0.4,
                      px: 1.5,
                      color: BRAND_NAVY,
                      borderColor: '#CBD5E1',
                      borderRadius: 1.5,
                      fontWeight: 600,
                      '&:hover': { borderColor: BRAND_NAVY, bgcolor: '#F0F9FF' },
                    }}
                  >
                    {locLoading ? 'Mendeteksi...' : 'Deteksi Ulang GPS'}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{
                height: 280,
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
                position: 'relative'
              }}>
                {location ? (
                  <iframe
                    key={`${location.lat}-${location.lng}`}
                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&hl=id&z=17&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Perangkat Anda"
                  />
                ) : (
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 3, textAlign: 'center' }}>
                    <Iconify icon="solar:map-point-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" fontWeight={500}>Mendeteksi lokasi perangkat presensi Anda...</Typography>
                    {locError && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                        {locError}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={detectLocation}
                      sx={{
                        mt: 2,
                        bgcolor: BRAND_NAVY,
                        '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 1.5,
                        boxShadow: 'none',
                      }}
                      startIcon={<Iconify icon="solar:map-point-bold" />}
                    >
                      Aktifkan & Deteksi GPS Perangkat
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Kolom Aksi */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.5 }}>
                    STATUS HARI INI
                  </Typography>
                  {renderPresensiStatusChip(todayStatus)}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 1, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.5 }}>
                    TITIK KOORDINAT PRESENSI
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: '#0F172A' }}>
                    <Iconify icon="solar:map-point-bold-duotone" sx={{ color: location ? '#0F172A' : '#EF4444', mr: 1, flexShrink: 0 }} />
                    {location ? `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}` : 'Menunggu akses lokasi perangkat...'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                    Lokasi ditentukan otomatis dari sensor perangkat untuk mencegah kecurangan.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckIn}
                    disabled={!location || checkInTime !== null}
                    sx={{
                      flex: 1,
                      bgcolor: BRAND_NAVY,
                      '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                      '&:disabled': { bgcolor: 'action.disabledBackground' },
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      boxShadow: 'none',
                    }}
                    startIcon={<Iconify icon="solar:login-2-bold-duotone" />}
                  >
                    Check In
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={handleCheckOut}
                    disabled={!checkInTime || checkOutTime !== null}
                    sx={{
                      flex: 1,
                      borderColor: '#CBD5E1',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 1.5,
                      '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                    }}
                    startIcon={<Iconify icon="solar:logout-2-bold-duotone" />}
                  >
                    Check Out
                  </Button>
                </Stack>

                <Box sx={{ textAlign: 'center', pt: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Tidak bisa hadir?{' '}
                    <Button
                      variant="text"
                      onClick={handleOpenIzin}
                      sx={{
                        color: BRAND_NAVY,
                        textTransform: 'none',
                        fontWeight: 700,
                        p: 0,
                        minWidth: 'auto',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                      }}
                    >
                      Ajukan Izin / Sakit
                    </Button>
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* SEARCH + FILTER */}
        <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <TextField
                type="date"
                size="small"
                label="Filter Tanggal"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 170 }}
              />
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Status Presensi</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(0);
                  }}
                  label="Status Presensi"
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="hadir">Hadir / Terlambat</MenuItem>
                  <MenuItem value="izin">Izin / Sakit</MenuItem>
                  <MenuItem value="alpha">Alpha</MenuItem>
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

        {/* TABLE */}
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Tanggal</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Masuk</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Keluar</TableCell>
                  <TableCell align="center" width="15%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" width="10%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPresensi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:calendar-date-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada data presensi</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPresensi
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold', color: '#0F172A' }}>{row.tanggal}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={row.masuk !== '-' ? 'bold' : 'normal'} sx={{ color: row.masuk !== '-' ? '#0F172A' : '#64748B' }}>
                            {row.masuk}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight={row.keluar !== '-' ? 'bold' : 'normal'} sx={{ color: row.keluar !== '-' ? '#0F172A' : '#64748B' }}>
                            {row.keluar}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {renderPresensiStatusChip(row.presensiStatus)}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDetail(row)}
                            sx={{
                              minWidth: 80,
                              bgcolor: 'white',
                              color: BRAND_NAVY,
                              borderColor: '#CBD5E1',
                              borderRadius: 1.5,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': { borderColor: BRAND_NAVY, bgcolor: '#F0F9FF' },
                            }}
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
            count={filteredPresensi.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* MODAL IZIN / SAKIT */}
        <Dialog open={openIzin} onClose={handleCloseIzin} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 2 }}>
            <Iconify icon="solar:document-add-bold-duotone" width={26} sx={{ color: BRAND_NAVY, mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Form Pengajuan Izin / Sakit</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Tanggal Mulai"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formIzin.tanggalMulai}
                  onChange={(e) => setFormIzin({ ...formIzin, tanggalMulai: e.target.value })}
                />
                <TextField
                  label="Tanggal Selesai"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={formIzin.tanggalSelesai}
                  onChange={(e) => setFormIzin({ ...formIzin, tanggalSelesai: e.target.value })}
                />
              </Stack>

              <TextField
                label="Keterangan / Alasan"
                fullWidth
                multiline
                rows={3}
                value={formIzin.keterangan}
                onChange={(e) => setFormIzin({ ...formIzin, keterangan: e.target.value })}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>
                  Bukti Pendukung (Opsional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#F1F5F9' }
                  }}
                >
                  <Iconify icon="solar:upload-minimalistic-bold-duotone" width={28} sx={{ mb: 1, color: BRAND_NAVY }} />
                  {fileIzin ? fileIzin.name : 'Klik untuk Unggah Gambar/PDF'}
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B' }}>Maksimal ukuran file 5MB</Typography>
                  <input type="file" hidden accept="image/*,.pdf" onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        toast.warning('Ukuran file terlalu besar! Maksimal 5MB.');
                        e.target.value = '';
                      } else {
                        setFileIzin(file);
                      }
                    }
                  }} />
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5, px: 3 }}>
            <Button onClick={handleCloseIzin} color="inherit" sx={{ fontWeight: 600 }}>Batal</Button>
            <Button
              onClick={handleSubmitIzin}
              variant="contained"
              sx={{
                bgcolor: BRAND_NAVY,
                '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                borderRadius: 1.5,
                fontWeight: 700,
                boxShadow: 'none',
                px: 3,
              }}
            >
              Kirim Pengajuan
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL DETAIL */}
        <Dialog open={openDetail} onClose={handleCloseDetail} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: BRAND_NAVY }}>
              <Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">Detail Presensi</Typography>
            </Box>
            <IconButton onClick={handleCloseDetail}><Iconify icon="eva:close-fill" /></IconButton>
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ pt: 3, pb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary', width: '32%' }}>Keterangan</TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Informasi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ py: 1.5 }}>Status Kehadiran</TableCell>
                      <TableCell>
                        {renderPresensiStatusChip(selectedDetail?.presensiStatus)}
                      </TableCell>
                    </TableRow>

                    <TableRow hover>
                      <TableCell sx={{ py: 1.5 }}>Tanggal Mulai</TableCell>
                      <TableCell><Typography fontWeight="bold" color="text.primary">{selectedDetail?.tanggal || '-'}</Typography></TableCell>
                    </TableRow>

                    {(selectedDetail?.presensiStatus === 'Izin' || selectedDetail?.presensiStatus === 'Sakit') && selectedDetail?.tanggalSelesai && (
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>Tanggal Selesai</TableCell>
                        <TableCell><Typography fontWeight="bold" color="text.primary">{selectedDetail?.tanggalSelesai || '-'}</Typography></TableCell>
                      </TableRow>
                    )}

                    {(!selectedDetail?.presensiStatus?.includes('Izin') && !selectedDetail?.presensiStatus?.includes('Sakit')) && (
                      <>
                        <TableRow hover>
                          <TableCell sx={{ py: 1.5 }}>Jam Masuk</TableCell>
                          <TableCell><Typography fontWeight="bold" color="text.primary">{selectedDetail?.masuk || '-'}</Typography></TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell sx={{ py: 1.5 }}>Jam Keluar</TableCell>
                          <TableCell><Typography fontWeight="bold" color="text.primary">{selectedDetail?.keluar || '-'}</Typography></TableCell>
                        </TableRow>
                        {selectedDetail?.lat && selectedDetail?.lng && (
                          <TableRow hover>
                            <TableCell sx={{ py: 1.5, verticalAlign: 'top', fontWeight: 500 }}>Lokasi Check-In</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.25,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 0.75,
                                      bgcolor: 'rgba(239, 68, 68, 0.1)',
                                      color: 'error.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Iconify icon="solar:map-point-bold-duotone" width={18} />
                                  </Box>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      Koordinat GPS
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: '#1E293B',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        wordBreak: 'break-all',
                                      }}
                                    >
                                      {selectedDetail.lat}, {selectedDetail.lng}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Button
                                  size="small"
                                  variant="contained"
                                  component="a"
                                  href={`https://maps.google.com/maps?q=${selectedDetail.lat},${selectedDetail.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  startIcon={<Iconify icon="solar:map-bold-duotone" width={16} />}
                                  endIcon={<Iconify icon="eva:external-link-fill" width={14} />}
                                  sx={{
                                    bgcolor: BRAND_NAVY,
                                    '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                                    color: '#fff',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    py: 0.6,
                                    px: 1.5,
                                    borderRadius: 1,
                                    alignSelf: 'flex-start',
                                    whiteSpace: 'nowrap',
                                    boxShadow: 'none',
                                  }}
                                >
                                  Buka di Google Maps
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Keterangan */}
              <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                  Keterangan / Alasan
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                  "{selectedDetail?.keterangan || 'Tidak ada keterangan tambahan.'}"
                </Typography>
              </Box>

              {/* Bukti Pendukung */}
              {selectedDetail?.fileBukti && (
                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={2}>
                    Bukti Pendukung
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedDetail?.fileBukti.toLowerCase().endsWith('.pdf') ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Iconify icon="solar:document-bold-duotone" width={32} sx={{ color: 'error.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight="bold">Dokumen Lampiran</Typography>
                          <Typography variant="caption" color="text.secondary">Format PDF</Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          href={`${HOST_API}${selectedDetail.fileBukti.replace(/^\//, '')}`}
                          target="_blank"
                          sx={{ textTransform: 'none', borderRadius: 1 }}
                        >
                          Lihat
                        </Button>
                      </Box>
                    ) : selectedDetail?.fileBukti ? (
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <a href={`${HOST_API}${selectedDetail.fileBukti.replace(/^\//, '')}`} target="_blank" rel="noreferrer">
                          <img
                            src={`${HOST_API}${selectedDetail.fileBukti.replace(/^\//, '')}`}
                            alt="Bukti Izin"
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #E2E8F0' }}
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        </a>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Bukti tidak tersedia</Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, justifyContent: 'flex-end', bgcolor: '#F8FAFC' }}>
            <Button
              onClick={handleCloseDetail}
              variant="contained"
              sx={{
                px: 4,
                bgcolor: BRAND_NAVY,
                '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                boxShadow: 'none',
                borderRadius: 1.5,
                fontWeight: 700,
              }}
            >
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Modal Terlambat */}
      <Dialog open={openTerlambat} onClose={() => setOpenTerlambat(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', p: 2.5, pb: 2 }}>
          <Iconify icon="solar:clock-circle-bold-duotone" width={26} sx={{ color: BRAND_NAVY, mr: 1.5 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A' }}>Keterlambatan Check-In</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3.5 }}>
          <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 2, p: 2, mb: 3, display: 'flex', alignItems: 'flex-start' }}>
            <Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ color: '#F59E0B', mr: 1.5, mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Anda melakukan Check In di atas <strong>jam 08.00</strong>. Sistem mencatat ini sebagai keterlambatan. Silakan masukkan alasan keterlambatan Anda beserta bukti (jika ada).
            </Typography>
          </Box>
          <Stack spacing={3}>
            <TextField
              label="Alasan Keterlambatan"
              multiline
              rows={3}
              fullWidth
              value={keteranganTerlambat}
              onChange={(e) => setKeteranganTerlambat(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>Bukti Pendukung (Opsional)</Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  borderStyle: 'dashed',
                  borderWidth: 1.5,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'text.secondary',
                  bgcolor: '#F8FAFC',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#F1F5F9' }
                }}
              >
                <Iconify icon="solar:upload-minimalistic-bold-duotone" width={28} sx={{ mb: 1, color: BRAND_NAVY }} />
                {fileTerlambat ? fileTerlambat.name : 'Klik untuk Unggah Gambar / PDF'}
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        toast.warning('Ukuran file terlalu besar! Maksimal 5MB.');
                        e.target.value = '';
                      } else {
                        setFileTerlambat(file);
                      }
                    }
                  }}
                />
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
                Maksimal ukuran file 5MB
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', gap: 1 }}>
          <Button onClick={() => setOpenTerlambat(false)} color="inherit" sx={{ fontWeight: 600 }}>Batal</Button>
          <Button
            onClick={submitTerlambat}
            variant="contained"
            sx={{
              px: 4,
              bgcolor: BRAND_NAVY,
              '&:hover': { bgcolor: BRAND_NAVY_HOVER },
              boxShadow: 'none',
              borderRadius: 1.5,
              fontWeight: 700,
            }}
          >
            Check In
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function PesertaPresensiPage() {
  return (
    <ErrorBoundary>
      <PesertaPresensiPageContent />
    </ErrorBoundary>
  );
}
