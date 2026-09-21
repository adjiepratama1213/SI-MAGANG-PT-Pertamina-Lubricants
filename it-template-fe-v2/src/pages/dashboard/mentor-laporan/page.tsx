import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import Iconify from 'src/components/iconify';
import axiosInstance from 'src/utils/axios';
import { toast } from 'react-toastify';
import { HOST_API } from 'src/config-global';

export default function MentorLaporanPage() {
  const [laporans, setLaporans] = useState<any[]>([]);
  const [openFeedback, setOpenFeedback] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);
  const [komentar, setKomentar] = useState('');

  // Fitur Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('Semua');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchLaporan = async () => {
    try {
      const res = await axiosInstance.get('/laporan/all');
      setLaporans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  const handleOpenFeedback = (row: any) => {
    setSelectedLaporan(row);
    setKomentar(row.komentar || '');
    setOpenFeedback(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      await axiosInstance.patch(`/laporan/${selectedLaporan.id}/feedback`, {
        statusFeedback: 'Telah Dievaluasi',
        komentar
      });
      toast.success('Feedback berhasil dikirim!');
      fetchLaporan();
      setOpenFeedback(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengirim feedback');
    }
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setCurrentTab('Semua');
    setFilterDate('');
    setFilterStatus('all');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = useMemo(() => laporans.filter(row => {
      // Pencarian berdasarkan nama atau ID Peserta
      const matchSearch = row.intern?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.intern?.internId?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter berdasarkan Tab Kategori Laporan
      const isAkhir = row.keterangan?.includes('[Laporan Akhir]');
      const matchTab = currentTab === 'Semua' ||
        (currentTab === 'Laporan Akhir' && isAkhir) ||
        (currentTab === 'Laporan Progres' && !isAkhir);

      // Filter berdasarkan Tanggal
      const rowDate = row.createdAt ? new Date(row.createdAt).toISOString().split('T')[0] : '';
      const matchDate = !filterDate || rowDate === filterDate;

      // Filter berdasarkan Status
      const matchStatus = filterStatus === 'all' || row.statusFeedback === filterStatus;

      return matchSearch && matchTab && matchDate && matchStatus;
    }), [laporans, searchQuery, currentTab, filterDate, filterStatus]);

  const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

  return (
    <>
      <Helmet>
        <title>Laporan Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:document-text-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Laporan Peserta Magang</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Kelola dan beri penilaian untuk laporan peserta yang dibimbing
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:document-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Laporan</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>
                {laporans.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #f59e0b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Menunggu Evaluasi</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                {laporans.filter(l => l.statusFeedback !== 'Telah Dievaluasi').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Telah Dievaluasi</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                {laporans.filter(l => l.statusFeedback === 'Telah Dievaluasi').length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* PENCARIAN & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Cari laporan berdasarkan Nama atau ID Peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
              size="small"
            />
            
            <TextField
              type="date"
              size="small"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status Laporan</InputLabel>
              <Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                label="Status Laporan"
              >
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="Menunggu Evaluasi">Menunggu Evaluasi</MenuItem>
                <MenuItem value="Telah Dievaluasi">Telah Dievaluasi</MenuItem>
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

        {/* TABS */}
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 'bold' } }}
        >
          <Tab label="Semua Laporan" value="Semua" />
          <Tab label="Laporan Progres" value="Laporan Progres" />
          <Tab label="Laporan Akhir" value="Laporan Akhir" />
        </Tabs>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell width="18%">Nama Peserta</TableCell>
                  <TableCell width="15%">Asal Instansi</TableCell>
                  <TableCell width="12%">Tgl. Unggah</TableCell>
                  <TableCell width="12%">Kategori</TableCell>
                  <TableCell width="20%">Keterangan</TableCell>
                  <TableCell width="10%">Lampiran</TableCell>
                  <TableCell align="center" width="8%">Status</TableCell>
                  <TableCell align="center" width="5%">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:document-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada laporan yang ditemukan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.intern?.user?.name || '-'}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
                          ID: {row.intern?.internId || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.intern?.university || '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </TableCell>
                      <TableCell>
                        {(() => {
                           const match = (row.keterangan || '').match(/\[(.*?)\]/);
                           const kategori = match ? match[1] : '';
                           return kategori ? (
                             <Chip label={kategori} size="small" sx={{ bgcolor: kategori === 'Laporan Akhir' ? '#004F9F' : 'rgba(0, 79, 159, 0.1)', color: kategori === 'Laporan Akhir' ? 'white' : '#004F9F', fontWeight: 'bold', border: kategori === 'Laporan Akhir' ? 'none' : '1px solid rgba(0, 79, 159, 0.2)' }} />
                           ) : <Typography variant="caption" color="text.disabled">-</Typography>;
                        })()}
                      </TableCell>
                      <TableCell>
                        {(() => {
                           const desc = (row.keterangan || '').replace(/\[.*?\]/, '').trim();
                           return (
                             <Typography variant="body2" sx={{ color: desc ? 'text.primary' : 'text.disabled', fontStyle: desc ? 'normal' : 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                               {desc || 'Tidak ada keterangan tambahan'}
                             </Typography>
                           );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {Array.isArray(row.files) && row.files.map((file: string, idx: number) => {
                            if (!file) return null;
                            const fileName = file.split('/').pop() || '';
                            const displayFileName = /^\d{13}-/.test(fileName) ? fileName.substring(14) : fileName;
                            return (
                              <Box key={idx} component="a" href={`${HOST_API}${file.startsWith('/') ? file.slice(1) : file}`} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                <Iconify icon="solar:file-download-bold-duotone" sx={{ mr: 0.5 }} width={16} />
                                <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={displayFileName}>
                                  {displayFileName}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.statusFeedback}
                          size="small"
                          color={row.statusFeedback === 'Telah Dievaluasi' ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenFeedback(row)}
                          sx={{ minWidth: 90, bgcolor: 'white', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 }, whiteSpace: 'nowrap' }}
                        >
                          {row.statusFeedback === 'Telah Dievaluasi' ? 'Lihat' : 'Lihat'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Baris per halaman:"
          />
        </Card>

        {/* MODAL FEEDBACK */}
        <Dialog open={openFeedback} onClose={() => setOpenFeedback(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafc', p: 3, pb: 2 }}>
            <Iconify icon="solar:pen-bold-duotone" width={28} sx={{ color: 'primary.main', mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Penilaian & Feedback Mentor</Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Informasi Peserta & Laporan</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Nama Peserta</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLaporan?.intern?.user?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">ID Peserta / Instansi</Typography>
                  <Typography variant="body2" fontWeight="bold">{selectedLaporan?.intern?.internId} - {selectedLaporan?.intern?.university}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Kategori</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedLaporan?.keterangan?.match(/\[(.*?)\]/)?.[1] || 'Laporan'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Tanggal Diunggah</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedLaporan?.createdAt ? new Date(selectedLaporan.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Keterangan Tambahan</Typography>
                  <Typography variant="body2" sx={{ fontStyle: (selectedLaporan?.keterangan || '').replace(/\[.*?\]/, '').trim() ? 'normal' : 'italic', bgcolor: 'white', p: 1.5, borderRadius: 1, border: '1px solid #e2e8f0', mt: 0.5 }}>
                    {(selectedLaporan?.keterangan || '').replace(/\[.*?\]/, '').trim() || 'Tidak ada keterangan tambahan dari peserta.'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Dokumen Terlampir</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {Array.isArray(selectedLaporan?.files) && selectedLaporan.files.map((file: string, idx: number) => {
                      if (!file) return null;
                      const fileName = file.split('/').pop() || '';
                      const displayFileName = /^\d{13}-/.test(fileName) ? fileName.substring(14) : fileName;
                      return (
                        <Button 
                          key={idx}
                          component="a"
                          href={`${HOST_API}${file.startsWith('/') ? file.slice(1) : file}`}
                          target="_blank"
                          rel="noreferrer"
                          variant="outlined"
                          size="small"
                          startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
                          sx={{ bgcolor: 'white', borderColor: '#e2e8f0', color: 'primary.main', '&:hover': { bgcolor: '#f1f5f9' } }}
                        >
                          {displayFileName}
                        </Button>
                      );
                    })}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>Form Evaluasi</Typography>
              <TextField
                label="Komentar / Feedback Mentor"
                multiline
                rows={4}
                fullWidth
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                placeholder="Tuliskan komentar, revisi, atau catatan terkait laporan ini..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', gap: 1 }}>
            <Button onClick={() => setOpenFeedback(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Batal</Button>
            <Button onClick={handleSubmitFeedback} variant="contained" color="primary" sx={{ px: 4, bgcolor: '#004F9F', '&:hover': { bgcolor: '#003366' }, boxShadow: 'none' }}>
              Simpan Evaluasi
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
