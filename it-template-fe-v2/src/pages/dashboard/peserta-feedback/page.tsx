import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  FormControlLabel, Switch, Rating, CircularProgress, Alert, Snackbar,
  Divider, Paper, IconButton
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { PERTAMINA_TOKENS } from 'src/theme/palette';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;
const BRAND_NAVY_HOVER = PERTAMINA_TOKENS.navyHover;

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

export default function PesertaFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form State
  const [category, setCategory] = useState('Fasilitas');
  const [rating, setRating] = useState<number | null>(5);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchMyFeedbacks = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await axiosInstance.get(endpoints.notification.myFeedback);
      setFeedbacks(res.data || []);
    } catch (error) {
      console.error('Failed to load my feedbacks:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchMyFeedbacks();
  }, [fetchMyFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setToast({
        open: true,
        message: 'Mohon tuliskan pesan atau masukan feedback Anda!',
        severity: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post(endpoints.notification.feedback, {
        category,
        rating: rating || 5,
        message,
        isAnonymous,
      });

      setToast({
        open: true,
        message: res.data?.message || 'Feedback berhasil dikirimkan ke Admin!',
        severity: 'success',
      });

      // Reset form
      setMessage('');
      setRating(5);
      setIsAnonymous(false);

      // Refresh list
      fetchMyFeedbacks();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      setToast({
        open: true,
        message: error?.message || 'Gagal mengirimkan feedback',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status: string) => {
    const raw = String(status || '').trim();
    const upper = raw.toUpperCase();

    let label = 'TERKIRIM KE ADMIN';
    let bgcolor = '#64748B'; // Default netral abu-abu

    if (upper.includes('TINDAK') || upper === 'DITINDAKLANJUTI' || upper === 'SELESAI') {
      label = 'DITINDAKLANJUTI';
      bgcolor = '#16A34A'; // Hijau #16A34A
    } else if (upper.includes('TINJAU') || upper === 'SEDANG DITINJAU' || upper === 'DITINJAU') {
      label = 'SEDANG DITINJAU';
      bgcolor = '#F59E0B'; // Kuning #F59E0B sama seperti peserta-presensi
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
        <title>Feedback & Saran Peserta | SI-Magang PTPL</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Feedback */}
        <DashboardBreadcrumbs current="Feedback" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Umpan Balik & Saran Peserta Magang
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Suara dan masukan Anda sangat berarti untuk pengembangan berkelanjutan serta peningkatan mutu program magang di PT Pertamina Lubricants.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Kolom Kiri: Form Input */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A', mb: 2.5, display: 'flex', alignItems: 'center' }}>
                <Iconify icon="solar:pen-bold-duotone" width={22} sx={{ mr: 1, color: BRAND_NAVY }} />
                Form Pengiriman Feedback
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori Feedback *</InputLabel>
                  <Select
                    label="Kategori Feedback *"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="Fasilitas">Fasilitas & Sarana Kantor</MenuItem>
                    <MenuItem value="Bimbingan Mentor">Bimbingan & Supervisi Mentor</MenuItem>
                    <MenuItem value="Sistem/Aplikasi">Sistem / Aplikasi Magang</MenuItem>
                    <MenuItem value="Lingkungan Kerja">Lingkungan Kerja & Budaya BUMN</MenuItem>
                    <MenuItem value="Umum">Umum / Kritik & Saran Lainnya</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>
                    Tingkat Kepuasan / Rating:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Rating
                      name="rating"
                      value={rating}
                      onChange={(event, newValue) => {
                        setRating(newValue);
                      }}
                      size="large"
                      sx={{ color: '#F59E0B' }}
                    />
                    <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 800 }}>
                      {rating} / 5
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700, color: '#475569' }}>
                    Pesan Feedback / Kendala / Saran *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Sampaikan kendala, apresiasi, atau saran perbaikan secara jelas..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>

                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        sx={{
                          '& .Mui-checked': {
                            color: BRAND_NAVY,
                          },
                          '& .Mui-checked + .MuiSwitch-track': {
                            backgroundColor: `${BRAND_NAVY} !important`,
                          },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#0F172A' }}>
                          Kirim Sebagai Anonim
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Nama dan profil Anda akan disembunyikan dari laporan Admin.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    bgcolor: BRAND_NAVY,
                    py: 1.25,
                    fontWeight: 700,
                    borderRadius: 1.5,
                    boxShadow: 'none',
                    textTransform: 'none',
                    '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                  }}
                >
                  {submitting ? 'Mengirimkan...' : 'Kirim Feedback ke Admin'}
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Kolom Kanan: Riwayat Feedback Saya */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#0F172A', display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:history-bold-duotone" width={22} sx={{ mr: 1, color: BRAND_NAVY }} />
                  Riwayat Feedback Saya
                </Typography>
                <IconButton size="small" onClick={fetchMyFeedbacks} title="Segarkan" sx={{ color: BRAND_NAVY }}>
                  <Iconify icon="solar:restart-bold" />
                </IconButton>
              </Box>

              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress size={32} sx={{ color: BRAND_NAVY }} />
                </Box>
              ) : feedbacks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: '#94A3B8',
                    }}
                  >
                    <Iconify icon="solar:chat-round-dots-bold-duotone" width={28} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#334155' }}>
                    Belum Ada Feedback
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    Kritik atau saran yang Anda kirimkan akan tampil di sini beserta status tanggapannya dari Admin.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {feedbacks.map((item) => (
                    <Paper
                      key={item.id}
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#F8FAFC',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={item.category} size="small" sx={{ bgcolor: 'rgba(0, 79, 159, 0.08)', color: BRAND_NAVY, fontWeight: 700 }} />
                          {item.isAnonymous && (
                            <Chip label="Anonim" size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600, borderColor: '#CBD5E1', color: '#64748B' }} />
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', color: '#F59E0B', fontSize: '0.85rem' }}>
                            <Iconify icon="solar:star-bold" width={16} sx={{ mr: 0.25 }} />
                            <b>{item.rating || 5}</b>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {getStatusChip(item.status)}
                        </Stack>
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1.5, color: '#1E293B', lineHeight: 1.5 }}>
                        "{item.message}"
                      </Typography>

                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94A3B8' }}>
                        Dikirim pada: {formatDateIndo(item.createdAt)}
                      </Typography>

                      {/* Tanggapan Admin jika ada */}
                      {item.response && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#F0F9FF', borderRadius: 1.5, borderLeft: `4px solid ${BRAND_NAVY}` }}>
                          <Typography variant="caption" fontWeight="bold" sx={{ color: BRAND_NAVY, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon="solar:check-circle-bold-duotone" width={16} />
                            Tanggapan Admin Human Capital:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: '#0F172A' }}>
                            {item.response}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

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
