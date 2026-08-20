import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider, Autocomplete
} from '@mui/material';
import Iconify from 'src/components/iconify';

const DUMMY_PESERTA = [
  { id: 201, nama: 'Fajar Nugroho', instansi: 'Universitas Brawijaya', periode: '1 Ags 2026 - 31 Des 2026', program: 'PKL' },
  { id: 202, nama: 'Dinda Kirana', instansi: 'Telkom University', periode: '1 Sep 2026 - 28 Feb 2027', program: 'Internship' },
  { id: 203, nama: 'Gilang Ramadhan', instansi: 'Politeknik Negeri Jakarta', periode: '1 Ags 2026 - 30 Nov 2026', program: 'KP' },
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
      { nama: 'Budi Santoso', instansi: 'Universitas Indonesia', periode: '1 Juli 2025 - 1 Desember 2025', program: 'Internship' },
      { nama: 'Siti Aminah', instansi: 'Institut Teknologi Bandung', periode: '1 Juli 2025 - 1 Desember 2025', program: 'KP' }
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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMentorData, setNewMentorData] = useState<any>(null);
  const [openAddPesertaDialog, setOpenAddPesertaDialog] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null);

  const handleOpenDialog = (data: any) => {
    setSelectedMentor(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMentor(null);
  };

  return (
    <>
      <Helmet>
        <title> Mentor | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:user-id-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Mentor Magang</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total: 5 | Aktif: 3</Typography>
            </Box>
          </Box>
          <Button variant="contained" onClick={() => setOpenAddDialog(true)} sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="mingcute:add-line" sx={{ mr: 1 }} /> Tambah Mentor
          </Button>
        </Box>

        <Card sx={{ p: 3 }}>
          {/* FILTERS */}
          <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua Fungsi</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" defaultValue="all"><MenuItem value="all">Semua Sub Fungsi</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status</InputLabel><Select label="Status" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem><MenuItem value="aktif">Aktif</MenuItem><MenuItem value="tidak_aktif">Tidak Aktif</MenuItem></Select></FormControl>
              </Grid>
              <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Cari nama mentor..." sx={{ bgcolor: 'white' }} />
                <Button variant="contained" color="primary" sx={{ px: 3, boxShadow: 'none' }}>
                  <Iconify icon="eva:search-fill" />
                </Button>
                <Button variant="outlined" sx={{ px: 3, borderColor: '#94a3b8', color: 'text.primary', fontWeight: 'bold', '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' } }}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* TABLE */}
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:list-bold-duotone" sx={{ mr: 1 }} /> Daftar Mentor
          </Typography>
          <TableContainer sx={{ minHeight: 400 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama Mentor</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Sub Fungsi</TableCell>
                  <TableCell>Jumlah Peserta</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', mr: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{row.name.substring(0, 2).toUpperCase()}</Box>
                      {row.name}
                    </TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.subFungsi}</TableCell>
                    <TableCell>{row.bimbingan} Peserta</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: row.status === 'Aktif' ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}>
                        {row.status}
                      </Typography>
                    </TableCell>
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
        </Card>
      </Container>

      {/* DETAIL DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {selectedMentor && (
          <>
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                  {selectedMentor.name.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Detail Mentor</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedMentor.name} • {selectedMentor.jabatan}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 5, bgcolor: '#f8fafc' }}>
              {/* Informasi Mentor */}
              <Box sx={{ mb: 2.5, mt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Informasi Mentor
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
                          label={selectedMentor.status} 
                          size="small" 
                          variant="outlined"
                          color={selectedMentor.status === 'Aktif' ? 'success' : 'default'}
                          sx={{ fontWeight: 'bold', bgcolor: selectedMentor.status === 'Aktif' ? 'rgba(34, 197, 94, 0.1)' : 'transparent', border: 'none' }}
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
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon="solar:users-group-rounded-bold-duotone" sx={{ mr: 1 }} /> Peserta Bimbingan ({selectedMentor.pesertaList.length} Peserta)
                  </Typography>
                  <Button size="small" variant="contained" color="primary" onClick={() => setOpenAddPesertaDialog(true)} sx={{ boxShadow: 'none' }}>
                    <Iconify icon="mingcute:add-line" sx={{ mr: 0.5 }} /> Tambah Peserta
                  </Button>
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  {selectedMentor.pesertaList.length > 0 ? (
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
                          {selectedMentor.pesertaList.map((peserta: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ fontWeight: 'bold' }}>{peserta.nama}</TableCell>
                              <TableCell>{peserta.instansi}</TableCell>
                              <TableCell>{peserta.periode}</TableCell>
                              <TableCell>
                                <Chip label={peserta.program} size="small" color={peserta.program === 'PKL' ? 'warning' : peserta.program === 'Internship' ? 'info' : 'primary'} variant="soft" sx={{ fontWeight: 'bold' }} />
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <IconButton size="small" color="primary" sx={{ bgcolor: 'rgba(0, 79, 159, 0.08)' }}>
                                    <Iconify icon="solar:pen-bold" width={16} />
                                  </IconButton>
                                  <IconButton size="small" color="error" sx={{ bgcolor: 'rgba(255, 86, 48, 0.08)' }}>
                                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      Belum ada peserta bimbingan.
                    </Typography>
                  )}
                </Box>
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, bgcolor: '#f8fafc' }}>
              <Button onClick={handleCloseDialog} variant="contained" sx={{ bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' } }}>
                Tutup
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
                options={DUMMY_USERS}
                getOptionLabel={(option) => option.name}
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
                      <Typography variant="caption" color="text.secondary">{option.email} • {option.jabatan}</Typography>
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
                placeholder="Contoh: Manager Logistik" 
                value={newMentorData?.jabatan || ''}
                sx={{ bgcolor: 'white' }} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ bgcolor: 'white' }}>
                <InputLabel>Direktorat</InputLabel>
                <Select label="Direktorat" defaultValue="">
                  <MenuItem value="1">Direktorat Utama & Pengawasan</MenuItem>
                  <MenuItem value="2">Direktorat Operasi</MenuItem>
                  <MenuItem value="3">Direktorat Sales & Marketing</MenuItem>
                  <MenuItem value="4">Direktorat Finance & Business Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ bgcolor: 'white' }}>
                <InputLabel>Fungsi</InputLabel>
                <Select label="Fungsi" defaultValue="">
                  <MenuItem value="1">Internal Audit</MenuItem>
                  <MenuItem value="2">Supply Chain dan Logistik</MenuItem>
                  <MenuItem value="3">Sales Region</MenuItem>
                  <MenuItem value="4">Keuangan & Akuntansi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit" variant="outlined" sx={{ bgcolor: '#f4f6f8' }}>
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(false)} sx={{ background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)' }}>
            <Iconify icon="solar:diskette-bold" sx={{ mr: 1 }} /> Simpan Mentor
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
            options={DUMMY_PESERTA}
            getOptionLabel={(option) => option.nama}
            onChange={(event, newValue) => setSelectedPeserta(newValue)}
            renderInput={(params) => <TextField {...params} label="Cari Peserta..." placeholder="Ketik nama peserta" size="small" />}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">{option.nama}</Typography>
                  <Typography variant="caption" color="text.secondary">{option.instansi} • {option.program}</Typography>
                </Box>
              </li>
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenAddPesertaDialog(false)} color="inherit">Batal</Button>
          <Button variant="contained" color="primary" onClick={() => {
            // Ideally we would add it to selectedMentor.pesertaList here, but for dummy just close
            setOpenAddPesertaDialog(false);
          }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}