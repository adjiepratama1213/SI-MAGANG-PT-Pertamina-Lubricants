import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  Tabs, Tab, RadioGroup, FormControlLabel, Radio, FormControl
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';

export default function PesertaLaporanPage() {
  const { user } = useAuthContext();
  const [laporans, setLaporans] = useState<any[]>([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [kategori, setKategori] = useState('Laporan Progres');
  const [keterangan, setKeterangan] = useState('');
  const [fileLaporans, setFileLaporans] = useState<File[]>([]);
  const [currentTab, setCurrentTab] = useState('Laporan Progres');

  // State untuk dialog konfirmasi hapus
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [laporanToDelete, setLaporanToDelete] = useState<string | null>(null);

  const fetchLaporan = async () => {
    try {
      const res = await axiosInstance.get('/laporan/me');
      setLaporans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleSubmit = async () => {
    if (fileLaporans.length === 0) {
      toast.warning('Silakan pilih minimal 1 file laporan!');
      return;
    }

    const formData = new FormData();
    formData.append('keterangan', `[${kategori}] ${keterangan}`);
    fileLaporans.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axiosInstance.post('/laporan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`${kategori} berhasil diunggah!`);
      fetchLaporan();
      setOpenUpload(false);
      setKeterangan('');
      setFileLaporans([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah laporan');
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setLaporanToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteDialog(false);
    setLaporanToDelete(null);
  };

  const executeDelete = async () => {
    if (!laporanToDelete) return;
    try {
      await axiosInstance.delete(`/laporan/${laporanToDelete}`);
      toast.success('Laporan berhasil dihapus');
      fetchLaporan();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus laporan');
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  // Filter laporan berdasarkan tab aktif
  const filteredLaporans = useMemo(() => laporans.filter(row => {
      const isAkhir = row.keterangan?.includes('[Laporan Akhir]');
      if (currentTab === 'Laporan Akhir') return isAkhir;
      if (currentTab === 'Laporan Progres') return !isAkhir;
      return true;
    }), [laporans, currentTab]);

  return (
    <>
      <Helmet>
        <title>Laporan Magang | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:document-text-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Laporan Magang</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Unggah dan kelola laporan magang Anda di sini
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:upload-minimalistic-bold-duotone" />}
            onClick={() => setOpenUpload(true)}
            sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}
          >
            Unggah Laporan
          </Button>
        </Box>

        {/* TABS */}
        <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, val) => setCurrentTab(val)}
            sx={{
              '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', textTransform: 'none', minWidth: 160 },
              '& .Mui-selected': { color: 'primary.main' }
            }}
          >
            <Tab label="Laporan Progres" value="Laporan Progres" icon={<Iconify icon="solar:graph-up-bold-duotone" sx={{ mr: 1 }} />} iconPosition="start" />
            <Tab label="Laporan Akhir" value="Laporan Akhir" icon={<Iconify icon="solar:diploma-verified-bold-duotone" sx={{ mr: 1 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* CARDS GRID */}
        {filteredLaporans.length === 0 ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '2px dashed #e2e8f0' }}>
            <Iconify icon="solar:folder-error-bold-duotone" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight="bold">Belum ada {currentTab.toLowerCase()} yang diunggah</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Silakan klik tombol Unggah di pojok kanan atas untuk menambahkan.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredLaporans.map((row) => (
              <Grid item xs={12} sm={6} md={4} key={row.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', borderColor: 'primary.light' } }}>
                  {/* Status Banner */}
                  <Box sx={{ px: 3, py: 1.5, bgcolor: row.statusFeedback === 'Telah Dievaluasi' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 171, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: row.statusFeedback === 'Telah Dievaluasi' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 171, 0, 0.2)' }}>
                    <Chip
                      label={row.statusFeedback}
                      size="small"
                      color={row.statusFeedback === 'Telah Dievaluasi' ? 'success' : 'warning'}
                      icon={<Iconify icon={row.statusFeedback === 'Telah Dievaluasi' ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'} />}
                      sx={{ fontWeight: 'bold', '& .MuiChip-icon': { ml: 1 } }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                        {new Date(row.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                      {/* Tombol Delete jika belum dinilai */}
                      {(row.statusFeedback === 'Menunggu Evaluasi' || row.statusFeedback === 'Belum Dinilai' || row.statusFeedback === 'Menunggu Ditinjau') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(row.id)}
                          title="Batalkan / Hapus Laporan"
                          sx={{ p: 0.5, bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                      {row.keterangan ? row.keterangan.replace(/\[.*?\]\s*/, '') : `Dokumen ${currentTab}`}
                    </Typography>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        File Terlampir:
                      </Typography>
                      {row.files && row.files.map((file: string, idx: number) => {
                        const fileName = file.split('/').pop() || '';
                        const displayFileName = /^\d{13}-/.test(fileName) ? fileName.substring(14) : fileName;
                        return (
                          <Box key={idx} component="a" href={`${HOST_API}${file.startsWith('/') ? file.slice(1) : file}`} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', color: 'primary.main', textDecoration: 'none', transition: 'all 0.2s', '&:hover': { bgcolor: '#eff6ff', borderColor: 'primary.light' } }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                              <Iconify icon="solar:file-download-bold-duotone" width={20} />
                            </Box>
                            <Typography variant="body2" fontWeight="bold" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {displayFileName}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Mentor Comment Section */}
                  {row.statusFeedback === 'Telah Dievaluasi' && row.komentar && (
                    <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px dashed #cbd5e1' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Iconify icon="solar:chat-line-bold-duotone" width={18} sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="caption" fontWeight="bold" color="primary.main">Catatan Mentor:</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', pl: 3.5 }}>
                        "{row.komentar}"
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* MODAL UPLOAD */}
        <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 3, pb: 2 }}>
            <Iconify icon="solar:upload-square-bold-duotone" width={28} sx={{ color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Unggah Dokumen</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Kategori Laporan</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant={kategori === 'Laporan Progres' ? 'contained' : 'outlined'}
                    onClick={() => setKategori('Laporan Progres')}
                    sx={{ flex: 1, boxShadow: 'none' }}
                  >
                    Laporan Progres
                  </Button>
                  <Button
                    variant={kategori === 'Laporan Akhir' ? 'contained' : 'outlined'}
                    onClick={() => setKategori('Laporan Akhir')}
                    sx={{ flex: 1, boxShadow: 'none' }}
                  >
                    Laporan Akhir
                  </Button>
                </Stack>
              </Box>

              <TextField
                label="Keterangan Tambahan (Opsional)"
                multiline
                rows={3}
                fullWidth
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Misal: Revisi laporan akhir..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>File Laporan (PDF)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  sx={{
                    borderStyle: 'dashed',
                    borderWidth: 1.5,
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'text.secondary',
                    bgcolor: '#f8fafc',
                    '&:hover': { bgcolor: '#f1f5f9' },
                    p: 2
                  }}
                >
                  <Iconify icon="solar:upload-minimalistic-bold-duotone" width={32} sx={{ mb: 1, color: 'primary.main' }} />
                  {fileLaporans.length > 0
                    ? <Stack spacing={0.5} alignItems="center">
                      <Typography variant="subtitle2" color="primary.main">{fileLaporans.length} File Terpilih</Typography>
                      {fileLaporans.map((f, i) => (
                        <Typography key={i} variant="caption" noWrap sx={{ maxWidth: 250 }}>{f.name}</Typography>
                      ))}
                    </Stack>
                    : 'Klik untuk Mengunggah Beberapa File'
                  }
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const filesArray = Array.from(e.target.files);
                        const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
                        if (validFiles.length < filesArray.length) {
                          toast.warning('Beberapa file diabaikan karena melebihi batas 5MB!');
                        }
                        setFileLaporans(prev => [...prev, ...validFiles]);
                        e.target.value = '';
                      }
                    }}
                  />
                </Button>
                {fileLaporans.length > 0 && (
                  <Button size="small" color="error" onClick={() => setFileLaporans([])} sx={{ mt: 1, display: 'block', mx: 'auto' }}>
                    Reset Pilihan File
                  </Button>
                )}
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.main', textAlign: 'center' }}>
                  * Anda bisa memilih lebih dari 1 file (Maksimal 5MB/file)
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <Divider />
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 2, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <Button onClick={() => setOpenUpload(false)} variant="outlined" color="inherit" fullWidth sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2 }}>
              Batal
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, boxShadow: '0 8px 16px rgba(0, 79, 159, 0.24)' }}>
              Kirim Dokumen
            </Button>
          </Box>
        </Dialog>

        {/* MODAL KONFIRMASI HAPUS */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', pb: 1 }}>
            <Iconify icon="solar:danger-triangle-bold-duotone" width={28} />
            <Typography variant="h6" fontWeight="bold">Konfirmasi Hapus</Typography>
          </DialogTitle>
          <DialogContent sx={{ pb: 1 }}>
            <Typography variant="body1">
              Apakah Anda yakin ingin menghapus laporan ini secara permanen?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Laporan yang sudah dihapus tidak dapat dikembalikan dan tidak akan terlihat lagi oleh mentor Anda.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
            <Button onClick={handleCloseDeleteConfirm} color="inherit" sx={{ fontWeight: 'bold' }}>
              Batal
            </Button>
            <Button onClick={executeDelete} variant="contained" color="error" sx={{ px: 3, fontWeight: 'bold', boxShadow: 'none' }}>
              Ya, Hapus
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </>
  );
}
