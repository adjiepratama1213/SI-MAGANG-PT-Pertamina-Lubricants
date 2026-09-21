import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Divider, MenuItem, Select, FormControl, InputLabel, TablePagination
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';

// ----------------------------------------------------------------------

export default function DataBimbinganPage() {
  const { user } = useAuthContext();
  const { userSearchData } = useSearchUsers('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterProgram('all');
    setFilterStatus('all');
    setPage(0);
  };

  const myInterns = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData
      .filter((u: any) =>
        u?.role === 'PESERTA' &&
        u?.internProfile?.mentor?.userId === user.id
      )
      .map((u: any) => {
        const intern = u.internProfile || {};
        return {
          id: u.id,
          name: u.name || '-',
          nim: intern.internId || '-',
          kampus: intern.university || '-',
          jurusan: intern.major || '-',
          program: intern.program || '-',
          kelamin: intern.gender === 'PRIA' ? 'Laki-laki' : intern.gender === 'WANITA' ? 'Perempuan' : '-',
          kontak: u.phone || '-',
          tglLahir: formatDate(intern.dateOfBirth),
          periode: `${formatDate(intern.startDate)} - ${formatDate(intern.endDate)}`,
          status: u.status === 'active' ? 'Aktif' : 'Tidak Aktif',
          dokumen: intern.documentUrls || [],
          raw: u,
        };
      });
  }, [userSearchData, user]);

  const countPKL = myInterns.filter(p => String(p.program || '').toLowerCase().includes('pkl')).length;
  const countPTPL = myInterns.filter(p => String(p.program || '').toLowerCase().includes('ptpl')).length;
  const countKemnaker = myInterns.filter(p => String(p.program || '').toLowerCase().includes('kemnaker')).length;

  const filteredInterns = useMemo(() => myInterns.filter(p => {
      const matchSearch = String(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.nim || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.kampus || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchProgram = filterProgram === 'all' || String(p.program || '').toLowerCase().includes(filterProgram.toLowerCase());
      const matchStatus = filterStatus === 'all' || String(p.status || '').toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchProgram && matchStatus;
    }), [myInterns, searchQuery, filterProgram, filterStatus]);

  const handleOpenDialog = (peserta: any) => {
    setSelectedPeserta(peserta);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPeserta(null);
  };

  return (
    <>
      <Helmet>
        <title>Data Bimbingan | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Bimbingan</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total: {myInterns.length} peserta yang Anda bimbing
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total PKL</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>{countPKL}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #00B8D9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 184, 217, 0.1)', color: '#00B8D9', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Internship PTPL</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#00B8D9', fontWeight: 'bold' }}>{countPTPL}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 3, border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary">Total Internship Kemnaker</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>{countKemnaker}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Cari peserta (Nama/ID Peserta/Asal Intansi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Program</InputLabel>
              <Select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} label="Program">
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="pkl">PKL</MenuItem>
                <MenuItem value="internship ptpl">Internship PTPL</MenuItem>
                <MenuItem value="internship kemnaker">Internship Kemnaker</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">Semua</MenuItem>
                <MenuItem value="aktif">Aktif</MenuItem>
                <MenuItem value="tidak aktif">Tidak Aktif</MenuItem>
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
                  <TableCell>Nama</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Jurusan</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInterns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada peserta bimbingan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((peserta) => (
                    <TableRow key={peserta.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{peserta.name}</TableCell>
                      <TableCell>{peserta.nim}</TableCell>
                      <TableCell>{peserta.kampus}</TableCell>
                      <TableCell>{peserta.jurusan}</TableCell>
                      <TableCell>
                        <Chip
                          label={peserta.program}
                          size="small"
                          variant="soft"
                          color={String(peserta.program || '').toLowerCase().includes('pkl') ? 'warning' : String(peserta.program || '').toLowerCase().includes('kemnaker') ? 'success' : 'info'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{peserta.periode}</TableCell>
                      <TableCell>
                        <Chip
                          label={peserta.status}
                          size="small"
                          color={peserta.status === 'Aktif' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleOpenDialog(peserta)}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredInterns.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>

        {/* DETAIL DIALOG */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify icon="solar:user-id-bold-duotone" width={28} sx={{ color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h6" fontWeight="bold">Profil Peserta Bimbingan</Typography>
            </Box>
            <IconButton onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </DialogTitle>
          <Divider />

          {selectedPeserta && (
            <DialogContent sx={{ p: 4 }}>
              {/* Header Profile */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 64, height: 64, borderRadius: '50%',
                    bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mr: 3, fontSize: 28, fontWeight: 'bold'
                  }}
                >
                  {selectedPeserta.name ? selectedPeserta.name.charAt(0).toUpperCase() : '?'}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>{selectedPeserta.name}</Typography>
                  <Chip
                    label={selectedPeserta.program}
                    size="small"
                    variant="soft"
                    color={String(selectedPeserta.program || '').toLowerCase().includes('pkl') ? 'warning' : String(selectedPeserta.program || '').toLowerCase().includes('kemnaker') ? 'success' : 'info'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              {/* Informasi Akademik */}
              <Typography variant="subtitle2" sx={{ color: '#004F9F', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                Informasi Akademik
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ID Peserta</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.nim}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Periode Magang</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.periode}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Asal Kampus / Instansi</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.kampus}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Jurusan</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.jurusan}</Typography>
                </Grid>
              </Grid>

              {/* Informasi Pribadi */}
              <Typography variant="subtitle2" sx={{ color: '#004F9F', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                Informasi Pribadi
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Jenis Kelamin</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.kelamin}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tanggal Lahir</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.tglLahir}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Kontak (No. HP/WA)</Typography>
                  <Typography variant="body2" fontWeight="medium">{selectedPeserta.kontak}</Typography>
                </Grid>
              </Grid>

              {/* Dokumen */}
              <Typography variant="subtitle2" sx={{ color: '#004F9F', mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                Dokumen Pendukung
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedPeserta.dokumen?.length > 0 ? (
                  selectedPeserta.dokumen.map((doc: string, i: number) => (
                    <Chip
                      key={i}
                      label={doc.split('/').pop() || `Dokumen ${i + 1}`}
                      variant="outlined"
                      color="primary"
                      component="a"
                      href={doc}
                      target="_blank"
                      clickable
                      icon={<Iconify icon="solar:file-download-bold-duotone" />}
                      sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' }, borderColor: '#cbd5e1' }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>Tidak ada dokumen yang diunggah.</Typography>
                )}
              </Box>
            </DialogContent>
          )}

          <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
            <Button onClick={handleCloseDialog} variant="contained" color="inherit" sx={{ px: 6, py: 1, boxShadow: 'none', borderRadius: 2 }}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
