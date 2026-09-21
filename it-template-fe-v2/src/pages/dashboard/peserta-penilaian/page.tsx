import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Divider, TextField
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useGetUserDetail } from 'src/pages/user-mgmt/query';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function PesertaPenilaianPage() {
  const { user: authUser } = useAuthContext();
  const { user } = useGetUserDetail({ id: authUser?.id || '' });
  
  const [openDialog, setOpenDialog] = useState(false);

  const evaluationData = user?.internProfile?.evaluation || null;

  return (
    <>
      <Helmet>
        <title>Penilaian | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:star-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Penilaian Akhir</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Lihat hasil penilaian akhir dari mentor Anda
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY SCORE */}
        <Card sx={{ p: 4, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {evaluationData ? (
            <>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>Nilai Rata-rata Akhir</Typography>
              <Typography variant="h1" sx={{ color: '#004F9F', fontWeight: 'bold' }}>
                {evaluationData.nilaiRataRata.toFixed(1)}
              </Typography>
              <Typography variant="h6" sx={{ color: 'success.main', mt: 1 }}>
                Kategori: {evaluationData.kategori}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, boxShadow: 'none' }}
                  onClick={() => setOpenDialog(true)}
                >
                  Lihat Rincian Penilaian
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary" sx={{ py: 5 }}>
                Penilaian belum tersedia. Mentor Anda belum memberikan penilaian akhir.
              </Typography>
          )}
        </Card>

        {/* SERTIFIKAT CARD */}
        {evaluationData && (
          <Card sx={{ p: 4, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>Sertifikat Magang</Typography>
            {evaluationData.certificateUrl ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <Iconify icon="solar:document-text-bold-duotone" width={64} sx={{ color: '#004F9F', mb: 2 }} />
                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>Sertifikat Anda telah diterbitkan dan siap diunduh.</Typography>
                <Button 
                  variant="outlined"
                  color="primary"
                  startIcon={<Iconify icon="solar:download-bold" />}
                  onClick={() => {
                    const url = `${process.env.VITE_HOST_API}${evaluationData.certificateUrl}`;
                    window.open(url, '_blank');
                  }}
                  sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                  Unduh Sertifikat
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, opacity: 0.6 }}>
                <Iconify icon="solar:document-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center' }}>Sertifikat belum tersedia. Admin akan mengunggahnya setelah Anda menyelesaikan magang.</Typography>
              </Box>
            )}
          </Card>
        )}

        {/* DIALOG RINCIAN PENILAIAN */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
              <Iconify icon="solar:star-bold-duotone" width={24} sx={{ mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">Rincian Penilaian Akhir</Typography>
            </Box>
            <IconButton onClick={() => setOpenDialog(false)}><Iconify icon="eva:close-fill" /></IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {evaluationData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Kriteria Penilaian</TableCell>
                        <TableCell align="center" width="30%" sx={{ py: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>Nilai (0-100)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>1. Integritas / Etika / Kedisiplinan</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.integritas}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>2. Ketepatan Waktu Penyelesaian Tugas</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.ketepatanWaktu}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>3. Keahlian / Keterampilan Sesuai Bidang</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.keahlian}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>4. Kerjasama dalam Tim / Pihak Lain</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.kerjasama}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>5. Komunikasi</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.komunikasi}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>6. Penggunaan Teknologi Informasi</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.penggunaanTI}</Typography></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ py: 1.5 }}>7. Pengembangan Diri (Inisiatif & Motivasi)</TableCell>
                        <TableCell align="center"><Typography fontWeight="bold" color="text.primary">{evaluationData.pengembanganDiri}</Typography></TableCell>
                      </TableRow>
                      
                      {/* SUMMARY ROW */}
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                          <Typography fontWeight="bold" color="primary.main">Total Rata-rata Akhir</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: 'none' }}>
                          <Typography fontWeight="bold" color="primary.main" variant="h6">
                            {evaluationData.nilaiRataRata.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                    Catatan dari Mentor
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary', lineHeight: 1.6 }}>
                    "{evaluationData.catatan || 'Tidak ada catatan tambahan.'}"
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, pb: 3, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenDialog(false)} variant="contained" sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, boxShadow: 'none' }}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
