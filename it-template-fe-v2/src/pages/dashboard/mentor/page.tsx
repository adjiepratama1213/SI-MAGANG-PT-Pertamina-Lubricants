import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Autocomplete, LinearProgress, InputAdornment
} from '@mui/material';
import Iconify from 'src/components/iconify';
import DashboardBreadcrumbs from 'src/components/dashboard-breadcrumbs';
import { useSearchUsers } from 'src/pages/user-mgmt/query';
import { toast } from 'react-toastify';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import { exportMentorPdf } from 'src/utils/export-pdf';

const DUMMY_PESERTA = [
  { id: 201, nama: 'Fajar Nugroho', instansi: 'Universitas Brawijaya', periode: '1 Ags 2026 - 31 Des 2026', program: 'PKL' },
  { id: 202, nama: 'Dinda Kirana', instansi: 'Telkom University', periode: '1 Sep 2026 - 28 Feb 2027', program: 'Internship PTPL' },
  { id: 203, nama: 'Gilang Ramadhan', instansi: 'Politeknik Negeri Jakarta', periode: '1 Ags 2026 - 30 Nov 2026', program: 'Internship Kemnaker' },
];

const DUMMY_USERS = [
  { id: 101, name: 'Budi Santoso', email: 'budi.santoso@pertamina.com', jabatan: 'Staff HR' },
  { id: 102, name: 'Siti Aminah', email: 'siti.aminah@pertamina.com', jabatan: 'Finance Officer' },
  { id: 103, name: 'Andi Wijaya', email: 'andi.wijaya@pertamina.com', jabatan: 'IT Manager' },
  { id: 104, name: 'Rina Melati', email: 'rina.melati@pertamina.com', jabatan: 'Marketing Executive' },
  { id: 105, name: 'Dr. Hendra', email: 'hendra@pertamina.com', jabatan: 'VP Operation' },
];

const DUMMY_DATA = [
  {
    id: 1,
    name: 'Kareem Graham',
    direktorat: 'Direktorat Utama & Pengawasan',
    fungsi: 'Internal Audit',
    subFungsi: 'Audit TI',
    bimbingan: 1,
    status: 'Aktif',
    jabatan: 'Audit Executive',
    email: 'kareem@pertamina.com',
    pesertaList: [
      { nama: 'Alyssa Afadila R', instansi: 'Universitas Airlangga', periode: '1 Juli 2025 - 1 Desember 2025', program: 'PKL' }
    ]
  },
  {
    id: 2,
    name: 'Mercedes Mclean',
    direktorat: 'Direktorat Operasi',
    fungsi: 'Supply Chain dan Logistik',
    subFungsi: 'Logistik',
    bimbingan: 0,
    status: 'Tidak Aktif',
    jabatan: 'Manager Logistik',
    email: 'mercedes@pertamina.com',
    pesertaList: []
  },
  {
    id: 3,
    name: 'Dawn Dillon',
    direktorat: 'Direktorat Sales & Marketing',
    fungsi: 'Sales Region',
    subFungsi: 'Sales',
    bimbingan: 0,
    status: 'Tidak Aktif',
    jabatan: 'Sales Manager',
    email: 'dawn@pertamina.com',
    pesertaList: []
  },
  {
    id: 4,
    name: 'Mentor',
    direktorat: 'Direktorat Finance & Business Support',
    fungsi: 'Keuangan & Akuntansi',
    subFungsi: 'Treasury',
    bimbingan: 2,
    status: 'Aktif',
    jabatan: 'Finance Manager',
    email: 'mentor@pertamina.com',
    pesertaList: [
      { nama: 'Budi Santoso', instansi: 'Universitas Indonesia', periode: '1 Juli 2025 - 1 Desember 2025', program: 'Internship PTPL' },
      { nama: 'Siti Aminah', instansi: 'Institut Teknologi Bandung', periode: '1 Juli 2025 - 1 Desember 2025', program: 'Internship Kemnaker' }
    ]
  },
  {
    id: 5,
    name: 'Henry Adams',
    direktorat: 'Direktorat Utama & Pengawasan',
    fungsi: 'Sekretariat Perusahaan & Legal',
    subFungsi: 'Legal',
    bimbingan: 0,
    status: 'Aktif',
    jabatan: 'Legal Counsel',
    email: 'henry@pertamina.com',
    pesertaList: []
  },
];

export default function Page() {
  const { userSearchData, searchLoading, refetchSearch } = useSearchUsers('');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMentorData, setNewMentorData] = useState<any>(null);
  const [openAddPesertaDialog, setOpenAddPesertaDialog] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);
  const [originalPesertaIds, setOriginalPesertaIds] = useState<string[]>([]);
  const [isSavingMain, setIsSavingMain] = useState(false);

  const [openDeleteMentorConfirm, setOpenDeleteMentorConfirm] = useState(false);
  const [mentorToDelete, setMentorToDelete] = useState<any>(null);

  const mentors = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData)) return [];
    const vps = userSearchData.filter((u: any) => u?.role === 'EMPLOYEE' && u?.status === 'active');

    return userSearchData
      .filter((u: any) => u?.role === 'EMPLOYEESTAFF' && u?.status === 'active')
      .map((u: any) => {
        const vp = vps.find((v: any) => v.employeeProfile?.fungsi === u?.employeeProfile?.fungsi);
        const activeMentees = (u?.employeeProfile?.internsMentored || []).filter((intern: any) => !intern.user || !intern.user.status || intern.user.status === 'active');
        return {
          id: u?.id,
          name: u?.name || 'Unknown',
          direktorat: u?.employeeProfile?.direktorat || '-',
          fungsi: u?.employeeProfile?.fungsi || '-',
          subFungsi: u?.employeeProfile?.subFungsi || '-',
          vpName: vp ? vp.name : '-',
          bimbingan: activeMentees.length,
          status: activeMentees.length > 0 ? 'Aktif' : 'Tidak Aktif',
          jabatan: u?.employeeProfile?.jabatan || '-',
          email: u?.email || '',
          employeeProfile: u?.employeeProfile,
          pesertaList: activeMentees.map((intern: any) => ({
            id: intern?.id,
            nama: intern?.user?.name || '-',
            instansi: intern?.university || '-',
            periode: `${intern?.startDate ? new Date(intern.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} - ${intern?.endDate ? new Date(intern.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}`,
            program: intern?.program || '-'
          }))
        };
      });
  }, [userSearchData]);

  const [searchQuery, setSearchQuery] = useState('');

  const [filterDir, setFilterDir] = useState('all');
  const [filterFungsi, setFilterFungsi] = useState('all');
  const [filterSubFungsi, setFilterSubFungsi] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [detailPage, setDetailPage] = useState(0);
  const [detailRowsPerPage, setDetailRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleDetailChangePage = (event: unknown, newPage: number) => setDetailPage(newPage);
  const handleDetailChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetailRowsPerPage(parseInt(event.target.value, 10));
    setDetailPage(0);
  };

  const [organizations, setOrganizations] = useState<any[]>([]);
  const fetchOrgs = async () => {
    try {
      const res = await axiosInstance.get(endpoints.employeeProfile.organizationsHierarchy);
      setOrganizations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleOpenDialog = (data: any) => {
    setSelectedMentor(data);
    setOriginalPesertaIds(data.pesertaList.map((p: any) => p.id));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMentor(null);
  };

  const handleSaveMentor = () => {
    if (newMentorData) {
      setOpenAddDialog(false);
      setNewMentorData(null);
    }
  };

  const handleRemovePeserta = (internId: string) => {
    if (!internId) return;
    setSelectedMentor((prev: any) => {
      if (!prev) return prev;
      const updatedPesertaList = prev.pesertaList.filter((p: any) => p.id !== internId);
      return {
        ...prev,
        pesertaList: updatedPesertaList,
        bimbingan: updatedPesertaList.length
      };
    });
  };

  const handleSaveMainDialog = async () => {
    if (!selectedMentor) return;
    setIsSavingMain(true);
    const currentPesertaIds = selectedMentor.pesertaList.map((p: any) => p.id);
    const addedIds = currentPesertaIds.filter((id: string) => !originalPesertaIds.includes(id));
    const removedIds = originalPesertaIds.filter((id: string) => !currentPesertaIds.includes(id));

    try {
      for (const id of addedIds) {
        await axiosInstance.patch(endpoints.internProfile.details(id), { mentorProfileId: selectedMentor.employeeProfile.id });
      }
      for (const id of removedIds) {
        await axiosInstance.patch(endpoints.internProfile.details(id), { mentorProfileId: null });
      }

      if (addedIds.length > 0 || removedIds.length > 0) {
        toast.success('Data peserta bimbingan berhasil diperbarui!');
        if (refetchSearch) await refetchSearch();
      }
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      const errorMessage = err?.message || 'Terjadi kesalahan saat menyimpan data';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSavingMain(false);
    }
  };

  const uniqueDirs = Array.from(new Set((organizations || []).map(o => o.name)));
  const uniqueFungsi = Array.from(new Set((organizations || []).flatMap(o => (o.fungsi || []).map((f: any) => f.name))));
  const uniqueSubFungsi = Array.from(new Set((organizations || []).flatMap(o => (o.fungsi || []).flatMap((f: any) => (f.subFungsi || []).map((sf: any) => sf.name)))));

  const filteredMentors = mentors.filter((m) => {
    const matchName = (m.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchDir = filterDir === 'all' || m.direktorat === filterDir;
    const matchFungsi = filterFungsi === 'all' || m.fungsi === filterFungsi;
    const matchSubFungsi = filterSubFungsi === 'all' || m.subFungsi === filterSubFungsi;
    const matchStatus = filterStatus === 'all' || (m.status || '').toLowerCase() === (filterStatus === 'aktif' ? 'aktif' : 'tidak aktif');

    return matchName && matchDir && matchFungsi && matchSubFungsi && matchStatus;
  }).sort((a, b) => {
    const aActive = a.status === 'Aktif' ? 1 : 0;
    const bActive = b.status === 'Aktif' ? 1 : 0;
    return bActive - aActive; // Aktif di depan, Tidak Aktif di belakang
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDir('all');
    setFilterFungsi('all');
    setFilterSubFungsi('all');
    setFilterStatus('all');
    setPage(0);
  };

  const handleDeleteMentor = (mentor: any) => {
    setMentorToDelete(mentor);
    setOpenDeleteMentorConfirm(true);
  };

  const confirmDeleteMentor = async () => {
    if (!mentorToDelete) return;
    try {
      await axiosInstance.delete(endpoints.user.details(mentorToDelete.id));
      toast.success('Berhasil menghapus mentor!');
      if (refetchSearch) await refetchSearch();
      setOpenDeleteMentorConfirm(false);
      setMentorToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus mentor.');
    }
  };

  return (
    <>
      <Helmet>
        <title> Mentor</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        <DashboardBreadcrumbs current="Mentor" />

        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2.5, background: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:user-id-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Mentor</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total: {mentors.length} | Aktif: {mentors.filter(m => m.status === 'Aktif').length} | Tidak Aktif: {mentors.filter(m => m.status === 'Tidak Aktif').length}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => exportMentorPdf(filteredMentors)}
              sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}
            >
              <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Data Mentor
            </Button>
          </Stack>
        </Box>

        {/* SEARCH & FILTER */}
        <Card sx={{ p: 3, mb: 3, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Direktorat</InputLabel>
                <Select label="Direktorat" value={filterDir} onChange={(e) => { setFilterDir(e.target.value); setFilterFungsi('all'); setFilterSubFungsi('all'); }}>
                  <MenuItem value="all">Semua Direktorat</MenuItem>
                  {uniqueDirs.map((dir: any) => <MenuItem key={dir} value={dir}>{dir}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Fungsi</InputLabel>
                <Select label="Fungsi" value={filterFungsi} onChange={(e) => { setFilterFungsi(e.target.value); setFilterSubFungsi('all'); }}>
                  <MenuItem value="all">Semua Fungsi</MenuItem>
                  {uniqueFungsi.map((f: any) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sub Fungsi</InputLabel>
                <Select label="Sub Fungsi" value={filterSubFungsi} onChange={(e) => setFilterSubFungsi(e.target.value)}>
                  <MenuItem value="all">Semua Sub Fungsi</MenuItem>
                  {uniqueSubFungsi.map((sf: any) => <MenuItem key={sf} value={sf}>{sf}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Mentor</InputLabel>
                <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="aktif">Aktif</MenuItem>
                  <MenuItem value="tidak_aktif">Tidak Aktif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Cari nama mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetFilters}
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
            </Grid>
          </Grid>
        </Card>

        {/* TABLE */}
        <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell width="22%" sx={{ fontWeight: 'bold' }}>Nama Mentor</TableCell>
                  <TableCell width="18%" sx={{ fontWeight: 'bold' }}>Direktorat</TableCell>
                  <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Fungsi</TableCell>
                  <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Sub Fungsi</TableCell>
                  <TableCell width="12%" sx={{ fontWeight: 'bold' }}>Jumlah Peserta</TableCell>
                  <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" width="8%" sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredMentors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:clipboard-remove-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Tidak ada data mentor ditemukan</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMentors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row.id} hover sx={{ '& td': { py: 1.5 } }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {row.name}
                      </TableCell>
                      <TableCell>{row.direktorat}</TableCell>
                      <TableCell>{row.fungsi}</TableCell>
                      <TableCell>{row.subFungsi}</TableCell>
                      <TableCell>{row.bimbingan} Peserta</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status || 'Tidak Aktif'}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 80,
                            bgcolor: '#FFFFFF',
                            borderColor: row.status === 'Aktif' ? '#16A34A' : '#EC2028',
                            color: row.status === 'Aktif' ? '#16A34A' : '#EC2028',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
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
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="primary" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white', mr: 1 }} onClick={() => handleOpenDialog(row)} title="Detail / Edit">
                          <Iconify icon="solar:eye-bold-duotone" width={18} />
                        </IconButton>
                        <IconButton size="small" color="error" title="Hapus" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: 'white' }} onClick={() => handleDeleteMentor(row)}>
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                        </IconButton>
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
            count={filteredMentors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedMentor && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">Detail Mentor</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedMentor.name} • {selectedMentor.jabatan}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 5, bgcolor: '#f8fafc' }}>
              {/* Informasi Mentor */}
              <Box sx={{ mb: 2.5, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5 }}>
                  Informasi Mentor
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Email</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedMentor.email}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedMentor.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedMentor.fungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedMentor.subFungsi}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jabatan</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedMentor.jabatan}</Typography>


                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedMentor.status || 'Tidak Aktif'}
                          size="small"
                          variant="outlined"
                          sx={{
                            minWidth: 80,
                            bgcolor: '#FFFFFF',
                            borderColor: selectedMentor.status === 'Aktif' ? '#16A34A' : '#EC2028',
                            color: selectedMentor.status === 'Aktif' ? '#16A34A' : '#EC2028',
                            borderWidth: 1.5,
                            borderStyle: 'solid',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            height: 28,
                            letterSpacing: '0.3px',
                            '& .MuiChip-label': { px: 1, fontWeight: 700 },
                            '&:hover': { bgcolor: '#FFFFFF' },
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

              {/* Mahasiswa / Peserta Bimbingan */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    Peserta Bimbingan ({selectedMentor.pesertaList.length} Peserta)
                  </Typography>
                  <Button size="small" variant="contained" color="primary" onClick={() => setOpenAddPesertaDialog(true)} sx={{ boxShadow: 'none' }}>
                    Tambah Peserta
                  </Button>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  {selectedMentor.pesertaList.length > 0 ? (
                    <>
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                            <TableRow>
                              <TableCell>Nama</TableCell>
                              <TableCell>Asal Instansi</TableCell>
                              <TableCell>Periode</TableCell>
                              <TableCell>Program</TableCell>
                              <TableCell align="center">Aksi</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedMentor.pesertaList.slice(detailPage * detailRowsPerPage, detailPage * detailRowsPerPage + detailRowsPerPage).map((peserta: any, idx: number) => (
                              <TableRow key={peserta.id || idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{peserta.nama}</TableCell>
                                <TableCell>{peserta.instansi}</TableCell>
                                <TableCell>{peserta.periode}</TableCell>
                                <TableCell>
                                  <Chip label={peserta.program} size="small" color={peserta.program === 'PKL' ? 'warning' : peserta.program === 'Internship PTPL' ? 'info' : 'primary'} variant="soft" sx={{ fontWeight: 'bold' }} />
                                </TableCell>
                                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                  <IconButton size="small" color="error" title="Hapus dari Mentor" sx={{ p: 0.75, borderRadius: 1, border: '1px solid #e2e8f0' }} onClick={() => handleRemovePeserta(peserta.id)}>
                                    <Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={selectedMentor.pesertaList.length}
                        rowsPerPage={detailRowsPerPage}
                        page={detailPage}
                        onPageChange={handleDetailChangePage}
                        onRowsPerPageChange={handleDetailChangeRowsPerPage}
                      />
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      Belum ada peserta bimbingan.
                    </Typography>
                  )}
                </Box>
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8fafc' }}>
              <Button onClick={handleCloseDialog} variant="contained" disabled={isSavingMain} sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' }, boxShadow: 'none' }}>
                Tutup
              </Button>
              <Button variant="contained" color="primary" onClick={handleSaveMainDialog} disabled={isSavingMain} sx={{ boxShadow: 'none' }}>
                {isSavingMain ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* TAMBAH MENTOR DIALOG */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="mingcute:add-line" width={28} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">Tambah Mentor Baru</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Masukkan detail informasi mentor</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setOpenAddDialog(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: '40px !important', bgcolor: '#f8fafc' }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Pilih pegawai dari sistem User Management untuk dijadikan mentor magang. Data email dan jabatan akan otomatis terisi.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={Array.isArray(userSearchData) ? userSearchData.filter((user: any) => user?.role === 'EMPLOYEESTAFF' && user?.status === 'active') : []}
                getOptionLabel={(option) => option?.name || 'Unknown'}
                onChange={(event, newValue) => {
                  setNewMentorData(newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Cari Pegawai / Calon Mentor" placeholder="Ketik nama pegawai..." sx={{ bgcolor: 'white' }} />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.email} • {option.employeeProfile?.jabatan || '-'}</Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                placeholder="Otomatis terisi dari User Management"
                value={newMentorData?.email || ''}
                disabled
                sx={{ bgcolor: newMentorData ? '#f1f5f9' : 'white' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Jabatan"
                placeholder="Otomatis terisi dari User Management"
                value={newMentorData?.employeeProfile?.jabatan || ''}
                disabled
                sx={{ bgcolor: newMentorData ? '#f1f5f9' : 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Direktorat"
                placeholder="Otomatis"
                value={newMentorData?.employeeProfile?.direktorat || ''}
                disabled
                sx={{ bgcolor: newMentorData ? '#f1f5f9' : 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Fungsi"
                placeholder="Otomatis"
                value={newMentorData?.employeeProfile?.fungsi || ''}
                disabled
                sx={{ bgcolor: newMentorData ? '#f1f5f9' : 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sub Fungsi"
                placeholder="Otomatis"
                value={newMentorData?.employeeProfile?.subFungsi || ''}
                disabled
                sx={{ bgcolor: newMentorData ? '#f1f5f9' : 'white' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit" variant="outlined" sx={{ bgcolor: '#f4f6f8' }}>
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveMentor} sx={{ background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', boxShadow: 'none' }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* TAMBAH PESERTA DIALOG */}
      <Dialog open={openAddPesertaDialog} onClose={() => setOpenAddPesertaDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">Tambah Peserta</Typography>
          <IconButton onClick={() => setOpenAddPesertaDialog(false)} size="small" sx={{ bgcolor: '#f1f5f9' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 3, pt: '16px !important' }}>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Pilih peserta magang (yang sudah diterima) untuk ditugaskan kepada mentor ini.</Typography>
          <Autocomplete
            options={Array.isArray(userSearchData) ? userSearchData.filter((u: any) => u?.role === 'PESERTA' && u?.status === 'active') : []}
            getOptionLabel={(option) => option?.name || 'Unknown'}
            getOptionDisabled={(option) => !!option.internProfile?.mentorProfileId}
            onChange={(event, newValue) => setSelectedPeserta(newValue)}
            renderInput={(params) => <TextField {...params} label="Cari Peserta..." placeholder="Ketik nama peserta" size="small" />}
            renderOption={(props, option) => {
              const hasMentor = !!option.internProfile?.mentorProfileId;
              const mentorName = option.internProfile?.mentor?.user?.name || 'Mentor lain';
              return (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {option.name}
                      {hasMentor && <span style={{ color: '#ef4444', marginLeft: 6, fontSize: '0.75rem', fontWeight: 'normal' }}>(Sudah dibimbing oleh {mentorName})</span>}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{option.internProfile?.university || '-'} • {option.internProfile?.program || '-'}</Typography>
                  </Box>
                </li>
              );
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenAddPesertaDialog(false)} color="inherit">Batal</Button>
          <Button variant="contained" color="primary" onClick={() => {
            if (selectedPeserta && selectedMentor) {
              // Update local state regardless to show UI changes for the dialog
              const formatDateStr = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
              const updatedPesertaList = [...selectedMentor.pesertaList, {
                id: selectedPeserta.internProfile?.id,
                nama: selectedPeserta.name,
                instansi: selectedPeserta.internProfile?.university || '-',
                periode: `${formatDateStr(selectedPeserta.internProfile?.startDate)} - ${formatDateStr(selectedPeserta.internProfile?.endDate)}`,
                program: selectedPeserta.internProfile?.program || '-'
              }];
              const updatedMentor = { ...selectedMentor, pesertaList: updatedPesertaList, bimbingan: updatedPesertaList.length };
              setSelectedMentor(updatedMentor);

              setOpenAddPesertaDialog(false);
            }
          }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM DELETE DIALOG FOR MENTOR */}
      <Dialog open={openDeleteMentorConfirm} onClose={() => setOpenDeleteMentorConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:danger-triangle-bold-duotone" width={24} />
            </Box>
            <Typography variant="h6" fontWeight="bold">Konfirmasi Hapus</Typography>
          </Box>
          <IconButton onClick={() => setOpenDeleteMentorConfirm(false)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: '40px !important' }}>
          <Typography variant="body1" textAlign="center">
            Apakah Anda yakin ingin menghapus mentor <strong style={{ color: '#ef4444' }}>{mentorToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
            Tindakan ini akan menghapus data mentor sepenuhnya dari sistem dan tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setOpenDeleteMentorConfirm(false)} variant="outlined" color="inherit" sx={{ minWidth: 120 }}>
            Batal
          </Button>
          <Button onClick={confirmDeleteMentor} variant="contained" color="error" sx={{ minWidth: 120, boxShadow: 'none' }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}