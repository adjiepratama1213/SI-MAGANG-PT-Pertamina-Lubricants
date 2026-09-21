import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Chip, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Alert
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

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

  // States untuk fitur Absensi
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [locError, setLocError] = useState('');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [todayStatus, setTodayStatus] = useState<string>('Belum Check In');

  // States untuk Izin / Sakit
  const [openIzin, setOpenIzin] = useState(false);
  const [formIzin, setFormIzin] = useState({
    tipe: 'Izin',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
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

  const fetchPresensi = async () => {
    try {
      const res = await axiosInstance.get('/presensi/me');
      if (res.data) {
        const formatted = res.data.map((item: any) => ({
          id: item.id,
          tanggal: new Date(item.tanggalInput).toLocaleDateString('id-ID'),
          tanggalInput: item.tanggalInput.split('T')[0],
          masuk: item.masuk ? new Date(item.masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          keluar: item.keluar ? new Date(item.keluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
          presensiStatus: item.presensiStatus,
          keterangan: item.keterangan || '-',
          tanggalSelesai: item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID') : null,
          fileBukti: item.fileBukti || null,
        }));
        setMyPresensi(formatted);

        // Determine today's status
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = formatted.find((f: any) => f.tanggalInput === todayStr);
        if (todayRecord) {
          setTodayStatus(todayRecord.presensiStatus);
          if (todayRecord.masuk !== '-') setCheckInTime(new Date()); // simple flag
          if (todayRecord.keluar !== '-') setCheckOutTime(new Date()); // simple flag
        } else {
          setTodayStatus('Belum Check In');
          setCheckInTime(null);
          setCheckOutTime(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPresensi();
  }, []);

  // Ambil lokasi saat komponen dimuat
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setLocError(err.message),
        { enableHighAccuracy: true }
      );
    } else {
      setLocError('Browser Anda tidak mendukung Geolokasi');
    }
  }, []);

  const handleResetFilter = () => {
    setFilterDate('');
    setFilterStatus('all');
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
      fetchPresensi();
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
      fetchPresensi();
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
      fetchPresensi();
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
      fetchPresensi();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal Check Out');
    }
  };

  const filteredPresensi = myPresensi
    .filter(item => {
      const matchDate = !filterDate || item.tanggalInput === filterDate;
      const matchStatus = filterStatus === 'all' || item.presensiStatus?.toLowerCase()?.includes(filterStatus);
      return matchDate && matchStatus;
    })
    .sort((a, b) => new Date(b.tanggalInput).getTime() - new Date(a.tanggalInput).getTime())
    .slice(0, 7);

  return (
    <>
      <Helmet>
        <title>Presensi Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:calendar-date-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Presensi Saya</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Kelola dan pantau kehadiran harian Anda
              </Typography>
            </Box>
          </Box>
        </Box>



        {/* SUMMARY */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Hadir</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                {myPresensi.filter(p => p.presensiStatus?.toLowerCase().includes('hadir')).length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Izin / Sakit</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>
                {myPresensi.filter(p => p.presensiStatus?.toLowerCase() === 'izin' || p.presensiStatus?.toLowerCase() === 'sakit').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Alpha</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                {myPresensi.filter(p => p.presensiStatus?.toLowerCase().includes('alpha')).length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-icon': { mt: 0.5 } }}>
          <Typography variant="subtitle2" fontWeight="bold">Pemberitahuan Presensi:</Typography>
          <Typography variant="body2">
            Peserta magang <strong>wajib melakukan Check In sebelum pukul 08:00 pagi</strong>. Check In di atas jam tersebut akan dianggap terlambat. Untuk Check Out, dapat dilakukan setelah jam kerja selesai.
          </Typography>
        </Alert>

        {/* FORM ABSENSI */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">
              Form Absensi - {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">Pastikan lokasi Anda akurat sebelum melakukan Check In atau Check Out</Typography>
          </Box>
          <Grid container spacing={4}>
            {/* Kolom Maps */}
            <Grid item xs={12} md={7}>
              <Box sx={{
                height: 300,
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                position: 'relative'
              }}>
                {location ? (
                  <iframe
                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=16&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: 'none' }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Magang Anda"
                  />
                ) : (
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Iconify icon="solar:map-point-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">Mencari lokasi Anda...</Typography>
                    {locError && <Typography color="error" variant="caption">{locError}</Typography>}
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Kolom Aksi */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Status Hari Ini</Typography>
                  {todayStatus === 'Belum Check In' ? (
                    <Typography variant="body2" fontWeight="bold">-</Typography>
                  ) : (
                    <Chip
                      label={todayStatus}
                      size="small"
                      color={
                        todayStatus?.toLowerCase().includes('hadir') ? 'success' :
                          (todayStatus?.toLowerCase() === 'izin' || todayStatus?.toLowerCase() === 'sakit') ? 'warning' :
                            todayStatus?.toLowerCase() === 'alpha' ? 'error' : 'default'
                      }
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Lokasi Terdeteksi</Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="solar:map-point-bold-duotone" sx={{ color: location ? 'success.main' : 'error.main', mr: 1 }} />
                    {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Menunggu akses lokasi...'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckIn}
                    disabled={!location || checkInTime !== null}
                    sx={{ flex: 1, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, '&:disabled': { bgcolor: 'action.disabledBackground' } }}
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
                    sx={{ flex: 1 }}
                    startIcon={<Iconify icon="solar:logout-2-bold-duotone" />}
                  >
                    Check Out
                  </Button>
                </Stack>

                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tidak bisa hadir? <Button variant="text" onClick={handleOpenIzin} sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 'bold' }}>Ajukan Izin / Sakit</Button>
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* SEARCH + FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type="date"
              size="small"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status Presensi</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status Presensi">
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="hadir">Hadir</MenuItem>
                <MenuItem value="izin">Izin</MenuItem>
                <MenuItem value="alpha">Alpha</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="error"
              onClick={handleResetFilter}
            >
              Reset
            </Button>
          </Stack>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                  <TableCell align="center">Masuk</TableCell>
                  <TableCell align="center">Keluar</TableCell>
                  <TableCell align="center" width="15%">Status</TableCell>
                  <TableCell align="center" width="10%">Aksi</TableCell>
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
                  filteredPresensi.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>{row.tanggal}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={row.masuk !== '-' ? "bold" : "normal"}>{row.masuk}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={row.keluar !== '-' ? "bold" : "normal"}>{row.keluar}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {row.presensiStatus === '-' ? (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        ) : (
                          <Chip
                            label={row.presensiStatus}
                            size="small"
                            color={
                              row.presensiStatus?.toLowerCase().includes('hadir') ? 'success' :
                                (row.presensiStatus?.toLowerCase() === 'izin' || row.presensiStatus?.toLowerCase() === 'sakit') ? 'warning' :
                                  row.presensiStatus?.toLowerCase() === 'alpha' ? 'error' : 'default'
                            }
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenDetail(row)}
                          sx={{ minWidth: 90, bgcolor: 'white', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
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
        </Card>

        {/* MODAL IZIN / SAKIT */}
        <Dialog open={openIzin} onClose={handleCloseIzin} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:document-add-bold-duotone" width={28} sx={{ color: 'primary.main', mr: 1.5 }} />
            Form Pengajuan Izin
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Bukti Pendukung (Opsional)</Typography>
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
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <Iconify icon="solar:upload-minimalistic-bold-duotone" width={28} sx={{ mb: 1 }} />
                  {fileIzin ? fileIzin.name : 'Klik untuk Unggah Gambar/PDF'}
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Maksimal ukuran file 5MB</Typography>
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
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={handleCloseIzin} color="inherit">Batal</Button>
            <Button onClick={handleSubmitIzin} variant="contained" color="primary" sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' } }}>
              Kirim Pengajuan
            </Button>
          </DialogActions>
        </Dialog>

        {/* MODAL DETAIL */}
        <Dialog open={openDetail} onClose={handleCloseDetail} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
              <Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">Detail Presensi</Typography>
            </Box>
            <IconButton onClick={handleCloseDetail}><Iconify icon="eva:close-fill" /></IconButton>
          </DialogTitle>
          <Divider />

          <DialogContent sx={{ pt: 3, pb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                    <TableRow>
                      <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary', width: '40%' }}>Keterangan</TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Informasi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ py: 1.5 }}>Status Kehadiran</TableCell>
                      <TableCell>
                        <Chip
                          label={selectedDetail?.presensiStatus || '-'}
                          size="small"
                          color={
                            selectedDetail?.presensiStatus?.toLowerCase().includes('hadir') ? 'success' :
                              (selectedDetail?.presensiStatus?.toLowerCase() === 'izin' || selectedDetail?.presensiStatus?.toLowerCase() === 'sakit') ? 'warning' :
                                selectedDetail?.presensiStatus?.toLowerCase() === 'alpha' ? 'error' : 'default'
                          }
                          variant="soft"
                          sx={{ fontWeight: 'bold' }}
                        />
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
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Keterangan */}
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                  Keterangan / Alasan
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                  "{selectedDetail?.keterangan || 'Tidak ada keterangan tambahan.'}"
                </Typography>
              </Box>

              {/* Bukti Pendukung */}
              {selectedDetail?.fileBukti && (
                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
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
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                            onError={(e) => {
                              // Fallback if not image
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

          <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end', bgcolor: '#f8fafc' }}>
            <Button onClick={handleCloseDetail} variant="contained" sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, boxShadow: 'none' }}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      {/* Modal Terlambat */}
      <Dialog open={openTerlambat} onClose={() => setOpenTerlambat(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 3, pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Keterlambatan Check-In</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ bgcolor: 'rgba(255, 171, 0, 0.05)', border: '1px solid rgba(255, 171, 0, 0.2)', borderRadius: 2, p: 2, mb: 3, display: 'flex', alignItems: 'flex-start' }}>
            <Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ color: 'warning.main', mr: 1.5, mt: 0.5 }} />
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Bukti Pendukung (Opsional)</Typography>
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
                  bgcolor: '#f8fafc',
                  '&:hover': { bgcolor: '#f1f5f9' }
                }}
              >
                <Iconify icon="solar:upload-minimalistic-bold-duotone" width={28} sx={{ mb: 1 }} />
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
        <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', gap: 1 }}>
          <Button onClick={() => setOpenTerlambat(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Batal</Button>
          <Button onClick={submitTerlambat} variant="contained" color="primary" sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, boxShadow: 'none' }}>
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
