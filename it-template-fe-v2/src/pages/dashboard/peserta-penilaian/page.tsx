import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Divider, TextField, Stack, CircularProgress
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useGetUserDetail } from 'src/pages/user-mgmt/query';
import { fNumber } from 'src/utils/format-number';
import { HOST_API } from 'src/config-global';
import { toast } from 'react-toastify';
import { PERTAMINA_TOKENS } from 'src/theme/palette';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

const BRAND_NAVY = PERTAMINA_TOKENS.navy;
const BRAND_NAVY_HOVER = PERTAMINA_TOKENS.navyHover;

const getFileUrl = (file: string) => {
  if (!file) return '';
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return file;
  }
  let cleanFile = file.startsWith('/') ? file.slice(1) : file;
  if (!cleanFile.startsWith('uploads/')) {
    if (cleanFile.startsWith('certificate-')) {
      cleanFile = `uploads/certificates/${cleanFile}`;
    } else {
      cleanFile = `uploads/${cleanFile}`;
    }
  }
  const baseUrl = HOST_API ? (HOST_API.endsWith('/') ? HOST_API : `${HOST_API}/`) : 'http://localhost:8080/';
  return `${baseUrl}${cleanFile}`;
};

export default function PesertaPenilaianPage() {
  const { user: authUser } = useAuthContext();
  const { user } = useGetUserDetail({ id: authUser?.id || '' });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const evaluationData = user?.internProfile?.evaluation || null;

  const handleDownloadCertificate = async () => {
    if (!evaluationData?.certificateUrl) return;
    setDownloading(true);
    try {
      const fileUrl = getFileUrl(evaluationData.certificateUrl);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Gagal mengunduh file sertifikat');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Deteksi ekstensi file
      let ext = 'pdf';
      const cleanUrl = evaluationData.certificateUrl.split('?')[0].toLowerCase();
      if (cleanUrl.endsWith('.png')) ext = 'png';
      else if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) ext = 'jpg';
      else if (cleanUrl.endsWith('.pdf')) ext = 'pdf';

      const userName = (user?.name || authUser?.name || 'Peserta').replace(/[^a-zA-Z0-9_-]/g, '_');
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Sertifikat_Magang_${userName}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Sertifikat berhasil diunduh!');
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: direct window.open / anchor download
      const fileUrl = getFileUrl(evaluationData.certificateUrl);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('download', `Sertifikat_Magang_${(user?.name || authUser?.name || 'Peserta').replace(/[^a-zA-Z0-9_-]/g, '_')}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Penilaian | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Penilaian */}
        <DashboardBreadcrumbs current="Penilaian" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Penilaian Akhir & Sertifikat Magang
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Pantau akumulasi evaluasi performa magang Anda oleh mentor resmi serta akses sertifikat kelulusan PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* SUMMARY SCORE */}
        <Card sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0', borderBottom: `3.5px solid ${BRAND_NAVY}`, bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {evaluationData ? (
            <>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                NILAI RATA-RATA AKHIR
              </Typography>
              <Typography sx={{ fontSize: { xs: '3.5rem', md: '4.5rem' }, color: BRAND_NAVY, fontWeight: 900, lineHeight: 1.1, my: 1 }}>
                {evaluationData.nilaiRataRata.toFixed(1)}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  px: 2,
                  py: 0.5,
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                Kategori Predikat: {evaluationData.kategori}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  sx={{
                    bgcolor: BRAND_NAVY,
                    '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                    boxShadow: 'none',
                    borderRadius: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                  }}
                  startIcon={<Iconify icon="solar:clipboard-list-bold-duotone" />}
                  onClick={() => setOpenDialog(true)}
                >
                  Lihat Rincian Penilaian
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#64748B', py: 5, fontWeight: 500 }}>
              Penilaian belum tersedia. Mentor Anda belum memberikan evaluasi nilai akhir.
            </Typography>
          )}
        </Card>

        {/* SERTIFIKAT CARD */}
        {evaluationData && (
          <Card sx={{ p: 4, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              SERTIFIKAT KELULUSAN MAGANG
            </Typography>
            {evaluationData.certificateUrl ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2.5 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 79, 159, 0.08)',
                    color: BRAND_NAVY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Iconify icon="solar:diploma-verified-bold-duotone" width={44} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, textAlign: 'center' }}>
                  Sertifikat Resmi Telah Diterbitkan
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#64748B' }}>
                  Selamat! Dokumen sertifikat Anda siap diunduh atau dilihat secara langsung.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button 
                    variant="contained"
                    disabled={downloading}
                    startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="solar:download-bold" />}
                    onClick={handleDownloadCertificate}
                    sx={{ 
                      bgcolor: BRAND_NAVY, 
                      '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                      px: 3, 
                      py: 1, 
                      fontWeight: 700, 
                      boxShadow: 'none',
                      borderRadius: 1.5,
                      textTransform: 'none',
                    }}
                  >
                    {downloading ? 'Mengunduh...' : 'Unduh Sertifikat'}
                  </Button>
                  <Button 
                    variant="outlined"
                    component="a"
                    href={getFileUrl(evaluationData.certificateUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Iconify icon="solar:eye-bold" />}
                    sx={{
                      px: 2.5,
                      py: 1,
                      fontWeight: 700,
                      color: BRAND_NAVY,
                      borderColor: '#CBD5E1',
                      borderRadius: 1.5,
                      textTransform: 'none',
                      '&:hover': { borderColor: BRAND_NAVY, bgcolor: '#F0F9FF' },
                    }}
                  >
                    Lihat Sertifikat
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2.5, opacity: 0.7 }}>
                <Iconify icon="solar:document-bold-duotone" width={56} sx={{ color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748B' }}>
                  Sertifikat belum tersedia. Tim Admin akan menerbitkannya setelah periode program selesai.
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* DIALOG RINCIAN PENILAIAN */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: BRAND_NAVY }}>
              <Iconify icon="solar:star-bold-duotone" width={22} sx={{ mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">Rincian Penilaian Akhir</Typography>
            </Box>
            <IconButton onClick={() => setOpenDialog(false)}><Iconify icon="eva:close-fill" /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {evaluationData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TableContainer sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, fontWeight: 700, color: '#475569' }}>Kriteria Penilaian</TableCell>
                        <TableCell align="center" width="30%" sx={{ py: 1.5, fontWeight: 700, color: '#475569' }}>Nilai (0-100)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>1. Integritas / Etika / Kedisiplinan</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.integritas}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>2. Ketepatan Waktu Penyelesaian Tugas</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.ketepatanWaktu}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>3. Keahlian / Keterampilan Sesuai Bidang</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.keahlian}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>4. Kerjasama dalam Tim / Pihak Lain</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.kerjasama}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>5. Komunikasi</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.komunikasi}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>6. Penggunaan Teknologi Informasi</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.penggunaanTI}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.25, fontSize: '0.85rem' }}>7. Pengembangan Diri (Inisiatif & Motivasi)</TableCell>
                        <TableCell align="center"><Typography fontWeight={700} color="#0F172A">{evaluationData.pengembanganDiri}</Typography></TableCell>
                      </TableRow>
                      
                      {/* SUMMARY ROW */}
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ py: 1.75, borderBottom: 'none' }}>
                          <Typography fontWeight={800} sx={{ color: BRAND_NAVY }}>Total Rata-rata Akhir</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: 'none' }}>
                          <Typography fontWeight={800} variant="h6" sx={{ color: BRAND_NAVY }}>
                            {evaluationData.nilaiRataRata.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mb: 0.75 }}>
                    Catatan dari Mentor
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#1E293B', lineHeight: 1.6 }}>
                    "{evaluationData.catatan || 'Tidak ada catatan tambahan.'}"
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, justifyContent: 'flex-end', bgcolor: '#F8FAFC' }}>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="contained"
              sx={{
                px: 4,
                bgcolor: BRAND_NAVY,
                '&:hover': { bgcolor: BRAND_NAVY_HOVER },
                boxShadow: 'none',
                borderRadius: 1.5,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Tutup
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
