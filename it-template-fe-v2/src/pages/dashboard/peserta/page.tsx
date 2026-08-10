import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_DATA = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', kampus: 'Universitas Airlangga', jurusan: 'Manajemen Perkantoran Digital', program: 'PKL', status_aktif: 'Aktif', direktorat: 'Direktorat Finance & Business Support', fungsi: 'Sumber Daya Manusia', subFungsi: '-', mentor: 'Gaston Alfonsa', periode: '1 Jul 2025 - 1 Desember 2025', kelamin: 'Perempuan', kontak: '081517981009', tglLahir: '15 Oct 2004', thnLulus: '-', statusMagang: 'PKL', bank: '-', noRek: '-', dokumen: ['Proposal Magang.pdf', 'Surat Pengantar Kampus.pdf', 'MOU Magang.pdf'] },
  { id: 2, name: 'Gaston Alfonsa', nim: '123456789', kampus: '-', jurusan: '-', program: 'Internship', status_aktif: 'Tidak Aktif', direktorat: 'Direktorat Operasi', fungsi: 'Unit Produksi', subFungsi: '-', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Internship', bank: '-', noRek: '-', dokumen: [] },
  { id: 3, name: 'Harding Long', nim: '987654321', kampus: '-', jurusan: '-', program: 'Magang Hub', status_aktif: 'Aktif', direktorat: 'Direktorat Sales & Marketing', fungsi: 'VP Sales & Marketing', subFungsi: '-', mentor: '-', periode: '-', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'Magang Hub', bank: '-', noRek: '-', dokumen: [] },
  { id: 4, name: 'Jovanz Mikail Baihaqi', nim: '187221077', kampus: 'Universitas Airlangga', jurusan: 'Sistem Informasi', program: 'KP', status_aktif: 'Aktif', direktorat: 'Direktorat Utama & Pengawasan', fungsi: 'Internal Audit', subFungsi: '-', mentor: '-', periode: '2025 - Feb 2026', kelamin: 'Laki-laki', kontak: '-', tglLahir: '-', thnLulus: '-', statusMagang: 'KP', bank: '-', noRek: '-', dokumen: [] },
];

const DUMMY_PERPANJANGAN = [
  { id: 1, name: 'Alyssa Afadila R', nim: '433221088', program: 'PKL', mentor: 'Gaston Alfonsa', periodeLama: '1 Jul 2025 - 1 Des 2025', periodeBaru: '1 Des 2025 - 1 Feb 2026', alasan: 'Penyelesaian Proyek Akhir', status: 'Menunggu', dokumen: 'Surat_Perpanjangan.pdf' },
  { id: 2, name: 'Harding Long', nim: '987654321', program: 'Magang Hub', mentor: '-', periodeLama: '1 Jan 2025 - 1 Jun 2025', periodeBaru: '1 Jun 2025 - 1 Sep 2025', alasan: 'Rekomendasi Mentor', status: 'Disetujui', dokumen: 'Rekomendasi_Mentor.pdf' },
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

      <Container maxWidth="xl">
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, bgcolor: '#6941C6', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" width={48} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h4">Data Peserta Magang</Typography>
            <Typography variant="body2">Total: 22 | Terverifikasi 1</Typography>
          </Box>
        </Box>

        {/* SUMMARY CARDS */}
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Iconify icon="solar:pie-chart-bold-duotone" sx={{ mr: 1 }} /> Statistik Kuota per Direktorat
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Dir. Utama & Pengawasan</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h3">1</Typography>
                <Typography variant="body2" color="text.secondary">/ 15</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Dir. Operasi</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h3">20</Typography>
                <Typography variant="body2" color="text.secondary">/ 46</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Dir. Sales & Marketing</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h3">0</Typography>
                <Typography variant="body2" color="text.secondary">/ 28</Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Dir. Finance & Business Support</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h3">1</Typography>
                <Typography variant="body2" color="text.secondary">/ 10</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          {/* TABS */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
             <Button 
                variant={activeTab === 'data_peserta' ? 'contained' : 'outlined'} 
                onClick={() => setActiveTab('data_peserta')}
                sx={{ borderRadius: '20px 0 0 20px' }}>
                Data Peserta
             </Button>
             <Button 
                variant={activeTab === 'perpanjangan' ? 'contained' : 'outlined'} 
                onClick={() => setActiveTab('perpanjangan')}
                sx={{ borderRadius: '0 20px 20px 0' }}>
                Perpanjangan
             </Button>
          </Box>

          {activeTab === 'data_peserta' && (
            <>
              {/* FILTERS FOR DATA PESERTA */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small"><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem><MenuItem value="pkl">PKL</MenuItem><MenuItem value="internship">Internship</MenuItem><MenuItem value="kp">Kerja Praktik (KP)</MenuItem><MenuItem value="maganghub">Magang Hub</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select label="Status" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="aktif">Aktif</MenuItem><MenuItem value="tidak_aktif">Tidak Aktif</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua Fungsi</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" defaultValue="all"><MenuItem value="all">Semua Sub Fungsi</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={10}>
                  <TextField fullWidth size="small" placeholder="Cari nama peserta..." />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="contained" size="large">Cari</Button>
                </Grid>
              </Grid>

              {/* TABLE FOR DATA PESERTA */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama</TableCell>
                      <TableCell>ID Peserta</TableCell>
                      <TableCell>Asal Instansi</TableCell>
                      <TableCell>Jurusan</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Direktorat</TableCell>
                      <TableCell>Fungsi</TableCell>
                      <TableCell>Sub Fungsi</TableCell>
                      <TableCell>Mentor</TableCell>
                      <TableCell>Periode</TableCell>
                      <TableCell align="right">Aksi</TableCell>
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
                        <TableCell>{row.jurusan}</TableCell>
                        <TableCell>
                          <Chip label={row.program} size="small" color={row.program === 'PKL' ? 'warning' : row.program === 'Internship' ? 'info' : 'primary'} />
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
                        <TableCell align="right">
                          <Button variant="contained" size="small" onClick={() => handleOpenDialog(row)}>Lihat Detail</Button>
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
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small"><InputLabel>Status Pengajuan</InputLabel><Select label="Status Pengajuan" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="menunggu">Menunggu</MenuItem><MenuItem value="disetujui">Disetujui</MenuItem><MenuItem value="ditolak">Ditolak</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={9}>
                  <TextField fullWidth size="small" placeholder="Cari nama atau ID peserta..." />
                </Grid>
              </Grid>

              {/* TABLE FOR PERPANJANGAN */}
              <TableContainer>
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
                      <TableCell align="right">Aksi</TableCell>
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
                          <Chip label={row.program} size="small" color={row.program === 'PKL' ? 'warning' : row.program === 'Internship' ? 'info' : 'primary'} />
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
                        <TableCell align="right">
                          <Button variant="outlined" size="small">Review</Button>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'primary.light', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>
                  {selectedUser.name.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedUser.nim} • {selectedUser.kampus}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4 }}>
              
              {/* Data Diri */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Data Diri
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">ID Peserta</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.nim}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Jenis Kelamin</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.kelamin}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tanggal Lahir</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.tglLahir}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Kontak</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.kontak}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Jurusan</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.jurusan}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tahun Lulus</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.thnLulus}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Informasi Magang */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Iconify icon="solar:briefcase-bold-duotone" sx={{ mr: 1 }} /> Informasi Magang
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Periode</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.periode}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Nama Mentor</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.mentor}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Direktorat</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.direktorat}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fungsi</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.fungsi}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Sub Fungsi</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.subFungsi}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Program</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      <Chip label={selectedUser.program} size="small" color={selectedUser.program === 'PKL' ? 'warning' : selectedUser.program === 'Internship' ? 'info' : 'primary'} />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: selectedUser.status_aktif === 'Aktif' ? 'success.main' : 'text.secondary' }}>
                      {selectedUser.status_aktif}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Rekening */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Iconify icon="solar:card-bold-duotone" sx={{ mr: 1 }} /> Rekening
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Bank</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.bank}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Nomor Rekening</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedUser.noRek}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Berkas */}
              <Box>
                <Typography variant="subtitle1" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Iconify icon="solar:folder-with-files-bold-duotone" sx={{ mr: 1 }} /> Berkas
                </Typography>
                {selectedUser.dokumen.length > 0 ? (
                  <Stack spacing={1}>
                    {selectedUser.dokumen.map((doc: string, idx: number) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Iconify icon="solar:document-bold" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ mr: 2 }}>{doc}</Typography>
                        <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                          Lihat
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">- Tidak ada berkas -</Typography>
                )}
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} color="inherit" variant="outlined">
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
