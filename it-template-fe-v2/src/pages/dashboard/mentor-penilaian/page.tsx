import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Divider, LinearProgress, MenuItem, Select, FormControl, InputLabel, TablePagination
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import axios from 'src/utils/axios';
import { toast } from 'react-toastify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

export default function MentorPenilaianPage() {
  const { user } = useAuthContext();
  const { userSearchData, refetchSearch } = useSearchUsers('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterKategori, setFilterKategori] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [catatan, setCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (peserta: any) => {
    setSelectedPeserta(peserta);
    if (peserta.evaluationData) {
      const ev = peserta.evaluationData;
      setScores({
        0: String(ev.integritas),
        1: String(ev.ketepatanWaktu),
        2: String(ev.keahlian),
        3: String(ev.kerjasama),
        4: String(ev.komunikasi),
        5: String(ev.penggunaanTI),
        6: String(ev.pengembanganDiri),
      });
      setCatatan(ev.catatan || '');
      setIsReadOnly(true);
    } else {
      setScores({}); // Reset scores when opening
      setCatatan('');
      setIsReadOnly(false);
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPeserta(null);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterProgram('all');
    setFilterKategori('all');
    setFilterStatus('all');
    setPage(0);
  };

  const handleScoreChange = (index: number, value: string) => {
    setScores(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmitPenilaian = async () => {
    if (!selectedPeserta) return;

    for (let i = 0; i < 7; i++) {
      const val = scores[i];
      if (val === undefined || val === '' || Number(val) < 0 || Number(val) > 100) {
        toast.error('Harap isi semua aspek dengan nilai antara 0-100');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const data = {
        integritas: Number(scores[0]),
        ketepatanWaktu: Number(scores[1]),
        keahlian: Number(scores[2]),
        kerjasama: Number(scores[3]),
        komunikasi: Number(scores[4]),
        penggunaanTI: Number(scores[5]),
        pengembanganDiri: Number(scores[6]),
        catatan,
      };

      await axios.post(`/intern-profile/${selectedPeserta.id}/evaluation`, data);
      
      toast.success('Penilaian berhasil disimpan');
      handleCloseDialog();
      refetchSearch(); 
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Terjadi kesalahan saat menyimpan penilaian');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const myInterns = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData
      .filter((u: any) =>
        u?.role === 'PESERTA' &&
        u?.internProfile?.mentor?.userId === user.id
      )
      .map((u: any) => {
        const intern = u.internProfile || {};
        const {evaluation} = intern;
        return {
          id: u.id,
          name: u.name || '-',
          nim: intern.internId || '-',
          kampus: intern.university || '-',
          jurusan: intern.major || '-',
          program: intern.program || '-',
          status: evaluation ? 'Sudah Dinilai' : 'Belum Dinilai',
          nilai: evaluation ? evaluation.nilaiRataRata.toFixed(2) : '-',
          kategori: evaluation ? evaluation.kategori : '-',
          evaluationData: evaluation,
        };
      });
  }, [userSearchData, user]);

  const filteredData = useMemo(() => myInterns.filter(p => {
      const matchSearch = String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(p.nim || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchProgram = filterProgram === 'all' || String(p.program || '').toLowerCase().includes(filterProgram.toLowerCase());
      const matchKategori = filterKategori === 'all' || String(p.kategori || '').toLowerCase() === filterKategori.toLowerCase();
      const matchStatus = filterStatus === 'all' || String(p.status || '').toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchProgram && matchKategori && matchStatus;
    }), [myInterns, searchQuery, filterProgram, filterKategori, filterStatus]);

  const sudahDinilai = myInterns.filter(p => p.status === 'Sudah Dinilai').length;
  const belumDinilai = myInterns.filter(p => p.status !== 'Sudah Dinilai').length;

  return (
    <>
      <Helmet>
        <title>Penilaian Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Penilaian */}
        <DashboardBreadcrumbs current="Penilaian" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Penilaian Peserta Magang
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Berikan evaluasi performa akhir, penilaian aspek kompetensi, dan catatan bimbingan bagi peserta di PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* SUMMARY */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
                borderBottom: '3.5px solid #004F9F',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Total Peserta
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#EDF5FE',
                    color: '#004F9F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {myInterns.length}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
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
                borderBottom: '3.5px solid #16A34A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Sudah Dinilai
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {sudahDinilai}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
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
                borderBottom: '3.5px solid #F59E0B',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  Belum Dinilai
                </Typography>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    bgcolor: '#FEF3C7',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {belumDinilai}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#FFFFFF', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Cari peserta (Nama/ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
              size="small"
              sx={{ width: { xs: '100%', sm: 240 } }}
            />
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 150 } }}>
              <InputLabel>Program</InputLabel>
              <Select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} label="Program">
                <MenuItem value="all">Semua Program</MenuItem>
                <MenuItem value="pkl">PKL</MenuItem>
                <MenuItem value="internship ptpl">Internship PTPL</MenuItem>
                <MenuItem value="internship kemnaker">Internship Kemnaker</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 140 } }}>
              <InputLabel>Kategori</InputLabel>
              <Select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} label="Kategori">
                <MenuItem value="all">Semua Kategori</MenuItem>
                <MenuItem value="sangat baik">Sangat Baik</MenuItem>
                <MenuItem value="baik">Baik</MenuItem>
                <MenuItem value="cukup">Cukup</MenuItem>
                <MenuItem value="kurang">Kurang</MenuItem>
                <MenuItem value="-">-</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 140 } }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="sudah dinilai">Sudah Dinilai</MenuItem>
                <MenuItem value="belum dinilai">Belum Dinilai</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleResetFilter}
              startIcon={<Iconify icon="solar:restart-bold" />}
              sx={{
                height: 40,
                px: 2,
                flexShrink: 0,
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
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Nama</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ID Peserta</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Asal Instansi</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Program</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Nilai</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Kategori</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" width="10%" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:star-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada peserta untuk dinilai</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                    <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.name}</TableCell>
                      <TableCell>{row.nim}</TableCell>
                      <TableCell>{row.kampus}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.program}
                          size="small"
                          variant="soft"
                          color={String(row.program || '').toLowerCase().includes('pkl') ? 'warning' : String(row.program || '').toLowerCase().includes('kemnaker') ? 'success' : 'info'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">{row.nilai}</TableCell>
                      <TableCell align="center">{row.kategori}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 90,
                            bgcolor: '#FFFFFF',
                            borderColor: row.status === 'Sudah Dinilai' ? '#16A34A' : '#F59E0B',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            color: row.status === 'Sudah Dinilai' ? '#16A34A' : '#F59E0B',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                            letterSpacing: '0.3px',
                            '& .MuiChip-label': { px: 1, fontWeight: 700 },
                            '&:hover': { bgcolor: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenDialog(row)}
                          sx={{ minWidth: 90, bgcolor: 'white', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                        >
                          {row.status === 'Sudah Dinilai' ? 'Lihat' : 'Nilai'}
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
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* DIALOG PENILAIAN */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:diploma-verified-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Penilaian Peserta: {selectedPeserta?.name}</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, bgcolor: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Iconify icon="solar:info-circle-bold-duotone" sx={{ color: 'warning.main', mr: 1 }} width={20} />
                <Typography variant="subtitle2" sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
                  Informasi Penentuan Kategori
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, ml: 3.5 }}>
                Kategori akhir akan ditentukan secara otomatis berdasarkan <strong>nilai rata-rata</strong> dari seluruh aspek penilaian:
              </Typography>
              <Grid container spacing={1} sx={{ ml: 2.5 }}>
                <Grid item xs={12} sm={6} md={4}><Typography variant="caption" sx={{ color: 'text.secondary' }}>• <strong>90 – 100:</strong> Sangat Baik</Typography></Grid>
                <Grid item xs={12} sm={6} md={4}><Typography variant="caption" sx={{ color: 'text.secondary' }}>• <strong>76 – 89:</strong> Baik</Typography></Grid>
                <Grid item xs={12} sm={6} md={4}><Typography variant="caption" sx={{ color: 'text.secondary' }}>• <strong>60 – 75:</strong> Cukup</Typography></Grid>
                <Grid item xs={12} sm={6} md={4}><Typography variant="caption" sx={{ color: 'text.secondary' }}>• <strong>50 – 59:</strong> Kurang</Typography></Grid>
                <Grid item xs={12} sm={6} md={4}><Typography variant="caption" sx={{ color: 'text.secondary' }}>• <strong>0 – 49:</strong> Sangat Kurang</Typography></Grid>
              </Grid>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Beri nilai dari 0 hingga 100 untuk setiap aspek berikut:</Typography>
            {[
              "Integritas (Etika, moral, dan kesungguhan)",
              "Ketepatan waktu dalam bekerja",
              "Keahlian berdasarkan bidang ilmu",
              "Kerjasama dalam tim",
              "Komunikasi",
              "Penggunaan teknologi informasi",
              "Pengembangan diri"
            ].map((aspek, index) => {
              const value = scores[index] || '';
              const isError = value !== '' && (Number(value) < 0 || Number(value) > 100);

              return (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: isError ? 'error.main' : '#e2e8f0',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: isError ? 'error.main' : '#004F9F',
                    boxShadow: isError ? 'none' : '0px 4px 12px rgba(0,79,159,0.08)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      bgcolor: isError ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 79, 159, 0.1)',
                      color: isError ? 'error.main' : '#004F9F',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: 14
                    }}>
                      {index + 1}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {aspek}
                      </Typography>
                      {isError && (
                        <Typography variant="caption" color="error">
                          Nilai harus antara 0 hingga 100
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    placeholder="0"
                    value={value}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    error={isError}
                    disabled={isReadOnly}
                    inputProps={{ min: 0, max: 100, style: { textAlign: 'center', fontWeight: 'bold' } }}
                    sx={{ width: 80, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
              )
            })}

            <Box sx={{ mt: 1.5, p: 3, borderRadius: 2, bgcolor: 'white', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: '#004F9F' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Catatan Evaluasi (Opsional)</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                disabled={isReadOnly}
                placeholder="Berikan masukan, apresiasi, atau evaluasi Anda terhadap peserta ini..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#f8fafc' } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 3, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 'bold' }} disabled={isSubmitting}>
            {isReadOnly ? 'Tutup' : 'Batal'}
          </Button>
          {isReadOnly ? (
            <Button variant="contained" color="primary" onClick={() => setIsReadOnly(false)} sx={{ px: 4, boxShadow: 'none' }}>
              Edit
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleSubmitPenilaian} disabled={isSubmitting} sx={{ px: 4, boxShadow: 'none' }}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
