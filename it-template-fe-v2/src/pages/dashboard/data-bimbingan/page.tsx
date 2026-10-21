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
import { HOST_API } from 'src/config-global';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';

// ----------------------------------------------------------------------

const getDocUrl = (url: string) => {
  if (!url || typeof url !== 'string' || url === '[object File]' || url.includes('[object')) return '#';
  let targetUrl = url;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    const cleanPath = targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl;
    const base = HOST_API ? (HOST_API.endsWith('/') ? HOST_API : `${HOST_API}/`) : 'http://localhost:8080/';
    targetUrl = `${base}${cleanPath}`;
  }
  return encodeURI(targetUrl);
};

const parseDocList = (docs: any): string[] => {
  if (!docs) return [];
  let list: any[] = [];
  if (Array.isArray(docs)) {
    list = docs;
  } else if (typeof docs === 'string' && docs.trim()) {
    try {
      const parsed = JSON.parse(docs);
      list = Array.isArray(parsed) ? parsed : [docs];
    } catch {
      list = [docs];
    }
  }
  return list
    .filter((d) => typeof d === 'string' && d.trim() && d !== '[object File]' && !d.includes('[object'))
    .map((d) => String(d).trim());
};

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

      <Container maxWidth="xl" sx={{ pb: 8, pt: 0, minHeight: '120vh' }}>
        {/* BREADCRUMB: Data Bimbingan */}
        <DashboardBreadcrumbs current="Data Bimbingan" />

        {/* PAGE HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, letterSpacing: -0.3 }}>
            Data Bimbingan Peserta
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Kelola dan pantau informasi identitas, program, dan kontak seluruh peserta magang yang Anda bimbing di PT Pertamina Lubricants.
          </Typography>
        </Box>

        {/* SUMMARY CARDS */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
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
                  Total PKL
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
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {countPKL}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
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
                  Total Internship PTPL
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
                  {countPTPL}
                </Typography>
                <Typography sx={{ ml: 1, fontSize: '0.95rem', fontWeight: 600, color: '#64748B' }}>
                  Peserta
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
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
                  Total Internship Kemnaker
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
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={22} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography sx={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {countKemnaker}
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
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
              <InputLabel>Program</InputLabel>
              <Select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} label="Program">
                <MenuItem value="all">Semua Program</MenuItem>
                <MenuItem value="pkl">PKL</MenuItem>
                <MenuItem value="internship ptpl">Internship PTPL</MenuItem>
                <MenuItem value="internship kemnaker">Internship Kemnaker</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: { xs: '100%', sm: 150 } }}>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="aktif">Aktif</MenuItem>
                <MenuItem value="tidak aktif">Tidak Aktif</MenuItem>
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
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Jurusan</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Program</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Periode</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>Aksi</TableCell>
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
                    <TableRow key={peserta.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>{peserta.name}</TableCell>
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
                          variant="outlined"
                          sx={{
                            minWidth: 90,
                            bgcolor: '#FFFFFF',
                            borderColor: peserta.status === 'Aktif' ? '#16A34A' : '#EC2028',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            color: peserta.status === 'Aktif' ? '#16A34A' : '#EC2028',
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {parseDocList(selectedPeserta.dokumen).length > 0 ? (
                  parseDocList(selectedPeserta.dokumen).map((doc: string, i: number) => {
                    const fullUrl = getDocUrl(doc);
                    let cleanName = doc.split('/').pop()?.split('\\').pop() || `Dokumen ${i + 1}`;
                    try { cleanName = decodeURIComponent(cleanName); } catch {}
                    cleanName = cleanName.replace(/^\d+[-_]/, '');
                    return (
                      <Button
                        key={i}
                        component="a"
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<Iconify icon="solar:file-download-bold-duotone" width={18} />}
                        sx={{
                          bgcolor: '#FFFFFF',
                          borderColor: '#004F9F',
                          borderWidth: 1.5,
                          borderStyle: 'solid',
                          color: '#004F9F',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          borderRadius: 1.5,
                          textTransform: 'none',
                          px: 2,
                          py: 0.8,
                          '&:hover': {
                            bgcolor: '#EDF5FE',
                            borderColor: '#004F9F',
                            borderWidth: 1.5,
                          },
                        }}
                      >
                        {cleanName}
                      </Button>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                    Tidak ada dokumen yang diunggah.
                  </Typography>
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
