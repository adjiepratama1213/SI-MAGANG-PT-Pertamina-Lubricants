import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Container, Typography, Card, Box, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, TextField, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  RadioGroup, FormControlLabel, Radio, Autocomplete, FormControl
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSearchUsers } from 'src/pages/user-mgmt/query';

const checkStatus = (dateStr: string) => {
  const isPast = new Date(dateStr) < new Date();
  return isPast ? 'Tidak Aktif' : 'Aktif';
};

const DUMMY_DATA = [
  { id: 1, judul: 'Batas unggah laporan mingguan', tujuan: 'Semua peserta bimbingan', jadwal: '15 Sep 2026, 15.00', tanggal: '2026-09-15T15:00:00' },
  { id: 2, judul: 'Presensi belum diisi hari ini', tujuan: 'Nabil Ramadhan', jadwal: '8 Sep 2026, 09.30', tanggal: '2026-09-08T09:30:00' },
  { id: 3, judul: 'Penilaian akhir periode', tujuan: 'Semua peserta bimbingan', jadwal: '25 Sep 2026, 08.00', tanggal: '2026-09-25T08:00:00' },
];

export default function MentorReminderPage() {
  const { user } = useAuthContext();
  const { userSearchData } = useSearchUsers('');

  const myInterns = useMemo(() => {
    if (!userSearchData || !Array.isArray(userSearchData) || !user) return [];
    return userSearchData
      .filter((u: any) =>
        u?.role === 'PESERTA' &&
        u?.internProfile?.mentor?.userId === user.id
      )
      .map((u: any) => u.name || '-');
  }, [userSearchData, user]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  
  const [targetType, setTargetType] = useState('semua');
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);

  const handleOpenAddDialog = () => {
    setTargetType('semua');
    setSelectedMentees([]);
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleOpenEditDialog = (reminder: any) => {
    setSelectedReminder(reminder);
    setTargetType(reminder.tujuan.includes('Semua') ? 'semua' : 'spesifik');
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedReminder(null);
  };

  return (
    <>
      <Helmet>
        <title>Reminder | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* Header */}
        <Box sx={{ p: 4, mb: 4, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:bell-bing-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Reminder</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pengingat otomatis untuk peserta bimbingan dan diri Anda sendiri
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" onClick={handleOpenAddDialog} sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold', px: 3 }}>
            <Iconify icon="mingcute:add-line" sx={{ mr: 1, fontSize: 18 }} /> Buat Reminder
          </Button>
        </Box>

        <Card sx={{ p: 0, border: '1px solid #e2e8f0', boxShadow: '0px 8px 30px rgba(0,0,0,0.05)', borderRadius: 2 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Daftar Reminder</Typography>
            <Typography variant="body2" color="text.secondary">Aktif, terjadwal, dan sudah terkirim</Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Judul</TableCell>
                  <TableCell>Tujuan</TableCell>
                  <TableCell>Jadwal</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Iconify icon="solar:bell-bing-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">Belum ada reminder</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  DUMMY_DATA.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>{row.judul}</TableCell>
                    <TableCell>{row.tujuan}</TableCell>
                    <TableCell>{row.jadwal}</TableCell>
                    <TableCell>
                       <Chip 
                        label={checkStatus(row.tanggal)} 
                        size="small" 
                        color={checkStatus(row.tanggal) === 'Aktif' ? 'success' : 'default'}
                        variant="outlined"
                       />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(row)}
                        sx={{ minWidth: 90, bgcolor: 'white', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}
                      >
                        Lihat
                      </Button>
                    </TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* Add Reminder Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:bell-bing-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Tambah Reminder Baru</Typography>
          </Box>
          <IconButton onClick={handleCloseAddDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Judul Reminder</Typography>
              <TextField fullWidth placeholder="Contoh: Pengingat Logbook Harian" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Tujuan Reminder</Typography>
              <FormControl component="fieldset">
                <RadioGroup row value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                  <FormControlLabel value="semua" control={<Radio />} label="Semua Peserta Bimbingan" />
                  <FormControlLabel value="spesifik" control={<Radio />} label="Peserta Spesifik" />
                </RadioGroup>
              </FormControl>
              {targetType === 'spesifik' && (
                <Autocomplete
                  multiple
                  options={myInterns}
                  value={selectedMentees}
                  onChange={(event, newValue) => setSelectedMentees(newValue)}
                  renderInput={(params) => <TextField {...params} placeholder="Cari Peserta Bimbingan..." sx={{ mt: 1 }} />}
                />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Deskripsi Pesan</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Tuliskan isi pesan dari reminder ini secara detail..." />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Jadwal / Waktu Kirim</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} />
                <TextField fullWidth type="time" InputLabelProps={{ shrink: true }} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseAddDialog} color="inherit" sx={{ fontWeight: 'bold', px: 3 }}>Batal</Button>
          <Button variant="contained" color="primary" onClick={handleCloseAddDialog} sx={{ px: 4, boxShadow: 'none' }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Detail Reminder Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#004F9F' }}>
            <Iconify icon="solar:pen-bold-duotone" width={28} sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Detail & Edit Reminder</Typography>
          </Box>
          <IconButton onClick={handleCloseEditDialog} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Judul Reminder</Typography>
              <TextField fullWidth defaultValue={selectedReminder?.judul} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Tujuan Reminder</Typography>
              <FormControl component="fieldset">
                <RadioGroup row value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                  <FormControlLabel value="semua" control={<Radio />} label="Semua Peserta Bimbingan" />
                  <FormControlLabel value="spesifik" control={<Radio />} label="Peserta Spesifik" />
                </RadioGroup>
              </FormControl>
              {targetType === 'spesifik' && (
                <Autocomplete
                  multiple
                  options={myInterns}
                  defaultValue={selectedReminder?.tujuan?.includes('Nabil') ? [myInterns[0] || 'Nabil Ramadhan'] : []}
                  onChange={(event, newValue) => setSelectedMentees(newValue)}
                  renderInput={(params) => <TextField {...params} placeholder="Cari Peserta Bimbingan..." sx={{ mt: 1 }} />}
                />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Deskripsi Pesan</Typography>
              <TextField fullWidth multiline rows={4} placeholder="Tuliskan isi pesan dari reminder ini secara detail..." />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Jadwal / Waktu Kirim</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField fullWidth type="date" InputLabelProps={{ shrink: true }} defaultValue={selectedReminder?.tanggal ? selectedReminder.tanggal.split('T')[0] : ''} />
                <TextField fullWidth type="time" InputLabelProps={{ shrink: true }} defaultValue={selectedReminder?.tanggal ? selectedReminder.tanggal.split('T')[1].substring(0, 5) : ''} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleCloseEditDialog} color="inherit" sx={{ fontWeight: 'bold', px: 3 }}>Batal</Button>
          <Button variant="contained" color="primary" onClick={handleCloseEditDialog} sx={{ px: 4, boxShadow: 'none' }}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
