import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container, Typography, Card, Box, Grid, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider,
  Tabs, Tab, alpha
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', kampus: 'Universitas Airlangga', jurusan: 'Manajemen Perkantoran Digital', program: 'PKL', status_aktif: 'Aktif', direktorat: 'Direktorat Finance & Business Support', fungsi: 'Sumber Daya Manusia', subFungsi: 'Pengembangan SDM', mentor: 'Gaston Alfonsa', periode: '1 Jul 2025 - 1 Desember 2025', kelamin: 'Perempuan', kontak: '081517981009', tglLahir: '15 Oct 2004', thnLulus: '-', statusMagang: 'PKL', bank: '-', noRek: '-', dokumen: ['Proposal Magang.pdf', 'Surat Pengantar Kampus.pdf', 'MOU Magang.pdf'] },
  { id: 2, name: 'Gaston Alfonsa', nim: '123456789', kampus: '-', jurusan: '-', program: 'Internship PTPL', status_aktif: 'Tidak Aktif', direktorat: 'Direktorat Operasi', fungsi: 'Unit Produksi', subFungsi: 'Produksi I', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Internship PTPL', bank: '-', noRek: '-', dokumen: [] },
  { id: 3, name: 'Harding Long', nim: '987654321', kampus: '-', jurusan: '-', program: 'Internship Kemnaker', status_aktif: 'Aktif', direktorat: 'Direktorat Sales & Marketing', fungsi: 'VP Sales & Marketing', subFungsi: 'Sales', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Internship Kemnaker', bank: '-', noRek: '-', dokumen: [] },
  { id: 4, name: 'Jovanz Mikail Baihaqi', nim: '187221077', kampus: 'Universitas Airlangga', jurusan: 'Sistem Informasi', program: 'PKL', status_aktif: 'Aktif', direktorat: 'Direktorat Utama & Pengawasan', fungsi: 'Internal Audit', subFungsi: 'Audit TI', mentor: '-', periode: '2025 - Feb 2026', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'PKL', bank: '-', noRek: '-', dokumen: [] },
];

const DUMMY_PERPANJANGAN = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', program: 'PKL', mentor: 'Gaston Alfonsa', periodeLama: '1 Jul 2025 - 1 Des 2025', periodeBaru: '1 Des 2025 - 1 Feb 2026', alasan: 'Penyelesaian Proyek Akhir', status: 'Menunggu', dokumen: 'Surat_Perpanjangan.pdf' },
  { id: 2, name: 'Harding Long', nim: '987654321', program: 'Internship Kemnaker', mentor: '-', periodeLama: '1 Jan 2025 - 1 Jun 2025', periodeBaru: '1 Jun 2025 - 1 Sep 2025', alasan: 'Rekomendasi Mentor', status: 'Disetujui', dokumen: 'Rekomendasi_Mentor.pdf' },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState('data_peserta'); // 'data_peserta' | 'perpanjangan'
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenDialog = (user: any) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Helmet>
        <title> Peserta | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total: 22 | Terverifikasi 1</Typography>
            </Box>
          </Box>
          <Button variant="contained" sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Data
          </Button>
        </Box>

        {/* SUMMARY CARDS */}
        {activeTab === 'data_peserta' && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:shield-check-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Utama & Pengawasan</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">1</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 15 Peserta</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(0, 79, 159, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#004F9F', borderRadius: 3, width: `${(1 / 15) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #EC2028', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(236, 32, 40, 0.1)', color: '#EC2028', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:settings-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Operasi</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">20</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 46 Peserta</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(236, 32, 40, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#EC2028', borderRadius: 3, width: `${(20 / 46) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:cart-large-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Sales & Marketing</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">0</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 28 Peserta</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(140, 198, 63, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#8CC63F', borderRadius: 3, width: `0%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:calculator-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Finance & Bus. Support</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">1</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 10 Peserta</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(255, 171, 0, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#FFAB00', borderRadius: 3, width: `${(1 / 10) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {activeTab === 'perpanjangan' && (
          <>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:documents-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Pengajuan</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">12</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Pengajuan</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(0, 79, 159, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#004F9F', borderRadius: 3, width: `100%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Menunggu Persetujuan</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">5</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 12 Pengajuan</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(255, 171, 0, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#FFAB00', borderRadius: 3, width: `${(5 / 12) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #22c55e', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Disetujui</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">6</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 12 Pengajuan</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#22c55e', borderRadius: 3, width: `${(6 / 12) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #ef4444', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                      <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Ditolak</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4">1</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>/ 12 Pengajuan</Typography>
                  </Box>
                  <Box sx={{ mt: 2, height: 6, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 3 }}>
                    <Box sx={{ height: '100%', bgcolor: '#ef4444', borderRadius: 3, width: `${(1 / 12) * 100}%` }} />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        <Card sx={{ p: 3 }}>
          {/* TABS */}
          <Box sx={{ display: 'flex', mb: 4, borderBottom: '1px solid #e2e8f0' }}>
            <Button
              variant="text"
              onClick={() => setActiveTab('data_peserta')}
              sx={{
                pb: 1.5, pt: 1, px: 3, borderRadius: 0,
                color: activeTab === 'data_peserta' ? 'primary.main' : 'text.secondary',
                borderBottom: activeTab === 'data_peserta' ? '3px solid #004F9F' : '3px solid transparent',
                fontWeight: activeTab === 'data_peserta' ? 'bold' : 'normal',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
              }}>
              Data Peserta
            </Button>
            <Button
              variant="text"
              onClick={() => setActiveTab('perpanjangan')}
              sx={{
                pb: 1.5, pt: 1, px: 3, borderRadius: 0,
                color: activeTab === 'perpanjangan' ? 'primary.main' : 'text.secondary',
                borderBottom: activeTab === 'perpanjangan' ? '3px solid #004F9F' : '3px solid transparent',
                fontWeight: activeTab === 'perpanjangan' ? 'bold' : 'normal',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
              }}>
              Perpanjangan
            </Button>
          </Box>

          {activeTab === 'data_peserta' && (
            <>
              {/* FILTERS FOR DATA PESERTA */}
              <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem><MenuItem value="pkl">PKL</MenuItem><MenuItem value="internship_ptpl">Internship PTPL</MenuItem><MenuItem value="internship_kemnaker">Internship Kemnaker</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status</InputLabel><Select label="Status" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="aktif">Aktif</MenuItem><MenuItem value="tidak_aktif">Tidak Aktif</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua Fungsi</MenuItem></Select></FormControl>
                  </Grid>

                  {/* Row 2 */}
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" defaultValue="all"><MenuItem value="all">Semua Sub Fungsi</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Mentor</InputLabel><Select label="Mentor" defaultValue="all"><MenuItem value="all">Semua Mentor</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Cari nama peserta..." sx={{ bgcolor: 'white' }} />
                    <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                      <Iconify icon="eva:search-fill" />
                    </Button>
                    <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* TABLE FOR DATA PESERTA */}
              <TableContainer sx={{ minHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama</TableCell>
                      <TableCell>ID Peserta</TableCell>
                      <TableCell>Asal Instansi</TableCell>

                      <TableCell>Program</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Direktorat</TableCell>
                      <TableCell>Fungsi</TableCell>
                      <TableCell>Sub Fungsi</TableCell>
                      <TableCell>Mentor</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DUMMY_DATA.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.light', mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{row.name.substring(0, 2).toUpperCase()}</Box>
                          {row.name}
                        </TableCell>
                        <TableCell>{row.nim}</TableCell>
                        <TableCell>{row.kampus}</TableCell>

                        <TableCell>
                          <Typography variant="body2">{row.program}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: row.status_aktif === 'Aktif' ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}>
                            {row.status_aktif}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.direktorat}</TableCell>
                        <TableCell>{row.fungsi}</TableCell>
                        <TableCell>{row.subFungsi}</TableCell>
                        <TableCell>{row.mentor}</TableCell>
                        <TableCell>{row.periode}</TableCell>
                        <TableCell align="center">
                          <Button variant="outlined" size="small" color="primary" sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {activeTab === 'perpanjangan' && (
            <>
              {/* FILTERS FOR PERPANJANGAN */}
              <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status Pengajuan</InputLabel><Select label="Status Pengajuan" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="menunggu">Menunggu</MenuItem><MenuItem value="disetujui">Disetujui</MenuItem><MenuItem value="ditolak">Ditolak</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem><MenuItem value="pkl">PKL</MenuItem><MenuItem value="internship_ptpl">Internship PTPL</MenuItem><MenuItem value="internship_kemnaker">Internship Kemnaker</MenuItem></Select></FormControl>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1 }}>
                    <TextField fullWidth size="small" placeholder="Cari nama atau ID peserta..." sx={{ bgcolor: 'white' }} />
                    <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                      <Iconify icon="eva:search-fill" />
                    </Button>
                    <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                      Reset
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* TABLE FOR PERPANJANGAN */}
              <TableContainer sx={{ minHeight: 400 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                    <TableRow>
                      <TableCell>Nama Peserta</TableCell>
                      <TableCell>ID Peserta</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Periode Lama</TableCell>
                      <TableCell>Pengajuan Periode Baru</TableCell>
                      <TableCell>Alasan</TableCell>
                      <TableCell>Dokumen Pendukung</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DUMMY_PERPANJANGAN.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.light', mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{row.name.substring(0, 2).toUpperCase()}</Box>
                          {row.name}
                        </TableCell>
                        <TableCell>{row.nim}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{row.program}</Typography>
                        </TableCell>
                        <TableCell>{row.periodeLama}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{row.periodeBaru}</TableCell>
                        <TableCell>{row.alasan}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                            Lihat Dokumen
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={row.status} size="small" color={row.status === 'Disetujui' ? 'success' : row.status === 'Menunggu' ? 'warning' : 'error'} variant="soft" />
                        </TableCell>
                        <TableCell align="center">
                          <Button variant="outlined" size="small" color="primary" sx={{ whiteSpace: 'nowrap', minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }}>
                            Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedUser && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Detail Peserta</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedUser.name}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, pt: 5, bgcolor: '#f8fafc' }}>
              
              {/* Data Diri */}
              <Box sx={{ mb: 2.5, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Data Diri
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">ID Peserta</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.nim}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Tanggal Lahir</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.tglLahir}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jurusan</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedUser.jurusan}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jenis Kelamin</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.kelamin}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Kontak</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.kontak}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Asal Instansi</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedUser.kampus}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

              {/* Informasi Magang */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:case-round-bold-duotone" sx={{ mr: 1 }} /> Informasi
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Periode</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.periode}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.subFungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Status</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={selectedUser.status_aktif} size="small" color={selectedUser.status_aktif === 'Aktif' ? 'success' : 'default'} variant="soft" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nama Mentor</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.mentor}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.fungsi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Program</Typography>
                      <Box sx={{ mt: 0.5, mb: 1 }}>
                        <Chip label={selectedUser.program} size="small" color={selectedUser.program === 'PKL' ? 'warning' : selectedUser.program === 'Internship PTPL' ? 'info' : 'primary'} variant="soft" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

              {/* Rekening & Berkas (Kiri Kanan) */}
              <Grid container spacing={2.5}>
                {/* Rekening */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="solar:card-bold-duotone" sx={{ mr: 1 }} /> Rekening
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)', height: 'calc(100% - 36px)' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Bank</Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedUser.bank}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nomor Rekening</Typography>
                          <Typography variant="body2" fontWeight="bold">{selectedUser.noRek}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* Berkas */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: '100%' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                      <Iconify icon="solar:folder-with-files-bold-duotone" sx={{ mr: 1 }} /> Berkas
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)', height: 'calc(100% - 36px)' }}>
                      {selectedUser.dokumen.length > 0 ? (
                        <Stack spacing={1}>
                          {selectedUser.dokumen.map((doc: string, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px dashed #cbd5e1' }}>
                              <Iconify icon="solar:document-bold" sx={{ mr: 1.5, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium' }}>{doc}</Typography>
                              <Button size="small" variant="contained" color="primary" sx={{ boxShadow: 'none' }}>Lihat</Button>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">- Tidak ada berkas -</Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>

            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8fafc' }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' } }}>
                Tutup
              </Button>
              <Button variant="contained" color="primary" autoFocus>
                Edit Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}