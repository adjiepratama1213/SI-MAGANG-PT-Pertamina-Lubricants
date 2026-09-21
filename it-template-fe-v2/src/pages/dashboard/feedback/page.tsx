import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, dari: 'Alyssa Afadila R', nim: '433221088', untuk: 'Gaston Alfonsa (Mentor)', pesan: 'Bimbingan sangat membantu, terima kasih pak!', tanggal: '06/08/2026', rating: 5 },
];

export default function Page() {
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const handleOpenDetail = (feedback: any) => {
    setSelectedFeedback(feedback);
    setOpenDetailDialog(true);
  };
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedFeedback(null);
  };

  return (
    <>
      <Helmet>
        <title> Feedback | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:chat-round-dots-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Feedback & Evaluasi</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Kumpulan masukan dari peserta untuk program dan mentor</Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:chat-round-dots-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Feedback</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>128</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:star-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Rata-rata Rating</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>4.8</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Belum Dibaca</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>5</Typography>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
        <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Tipe Feedback</InputLabel><Select label="Tipe Feedback" defaultValue="all"><MenuItem value="all">Semua Tipe</MenuItem><MenuItem value="mentor">Untuk Mentor</MenuItem><MenuItem value="program">Untuk Program</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Rating</InputLabel><Select label="Rating" defaultValue="all"><MenuItem value="all">Semua Rating</MenuItem><MenuItem value="5">Bintang 5</MenuItem><MenuItem value="4">Bintang 4</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" placeholder="Cari isi pesan atau nama peserta..." sx={{ bgcolor: 'white' }} />
              <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                <Iconify icon="eva:search-fill" />
              </Button>
              <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>

          <TableContainer sx={{ minHeight: 400 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Dari</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Untuk</TableCell>
                  <TableCell>Pesan</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.dari}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.untuk}</TableCell>
                    <TableCell>{row.pesan}</TableCell>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell sx={{ color: 'warning.main', fontWeight: 'bold' }}><Iconify icon="solar:star-bold" sx={{ mr: 0.5, mb: -0.5 }} />{row.rating}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" sx={{ mr: 1, p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleOpenDetail(row)} title="Detail / Edit">
                        <Iconify icon="solar:eye-bold-duotone" width={20} />
                      </IconButton>
                      <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }}>
                        <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Detail Feedback Dialog */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:chat-round-dots-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Detail Feedback</Typography>
          </Box>
          <IconButton onClick={handleCloseDetail} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1 }}>
          {selectedFeedback && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Pengirim</Typography>
                <Typography variant="body1" fontWeight="bold">{selectedFeedback.dari}</Typography>
                <Typography variant="body2" color="text.secondary">NIM: {selectedFeedback.nim}</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Ditujukan Untuk</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedFeedback.untuk}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Tanggal</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedFeedback.tanggal}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main', mt: 0.5 }}>
                  {[...Array(5)].map((_, index) => (
                    <Iconify 
                      key={index} 
                      icon={index < selectedFeedback.rating ? "solar:star-bold" : "solar:star-linear"} 
                      width={24} 
                    />
                  ))}
                  <Typography variant="subtitle2" sx={{ ml: 1, color: 'text.primary', fontWeight: 'bold' }}>{selectedFeedback.rating} / 5</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Pesan / Ulasan</Typography>
                <Box sx={{ mt: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    "{selectedFeedback.pesan}"
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button variant="contained" color="primary" onClick={handleCloseDetail} sx={{ px: 4, boxShadow: 'none' }}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}