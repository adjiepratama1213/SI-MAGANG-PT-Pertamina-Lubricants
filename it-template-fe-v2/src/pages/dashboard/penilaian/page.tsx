import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '@mui/material/styles';
import { 
  Container, Typography, Card, Box, Grid, Stack, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, MenuItem, Select, FormControl, InputLabel, TextField, Chip, CardHeader,
  Dialog, DialogTitle, DialogContent, IconButton, LinearProgress, Divider
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';

const DUMMY_DATA = [
  { 
    id: 1, 
    name: 'Alyssa Afadila R', 
    nim: '433221088', 
    instansi: 'Universitas Airlangga', 
    jurusan: 'Manajemen Perkantoran Digital', 
    program: 'PKL', 
    direktorat: 'Direktorat Finance & Business Support', 
    fungsi: 'Human Capital', 
    subFungsi: 'Pengembangan SDM',
    mentor: 'Mentor', 
    nilai: '84.43', 
    kategori: 'Memuaskan', 
    status: 'Sudah Dinilai',
    detailNilai: {
      integritas: 80,
      ketepatanWaktu: 88,
      keahlian: 86,
      kerjasama: 76,
      komunikasi: 90,
      penggunaanTI: 82,
      pengembanganDiri: 89
    },
    rekomendasi: 'Direkomendasikan',
    catatan: 'tes'
  },
  { 
    id: 2, 
    name: 'Gaston Alfonsa', 
    nim: '123456789', 
    instansi: '-', 
    jurusan: '-', 
    program: 'PKL', 
    direktorat: 'Direktorat Utama & Pengawasan', 
    fungsi: 'HSSE', 
    subFungsi: 'K3',
    mentor: '-', 
    nilai: '-', 
    kategori: '-', 
    status: 'Belum Dinilai',
    detailNilai: null,
    rekomendasi: '-',
    catatan: '-'
  },
];

export default function Page() {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPenilaian, setSelectedPenilaian] = useState<any>(null);

  // --- Chart 1: Rata-rata per Mentor ---
  const mentorSeries = [{ name: 'Rata-rata Nilai', data: [88, 92, 85, 90, 87] }];
  const mentorOptions = useChart({
    colors: [theme.palette.primary.main],
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: '40%', borderRadius: 4 } },
    xaxis: { categories: ['Kareem', 'Budi S', 'Gaston', 'Siti', 'Jovanz'] },
    tooltip: { y: { formatter: (value: number) => `${value} Poin` } },
  });

  // --- Chart 2: Status Penilaian ---
  const statusSeries = [3, 2];
  const statusOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.warning.main],
    labels: ['Sudah Dinilai', 'Belum Dinilai'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: false, horizontalAlign: 'center', position: 'bottom' },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (value: number) => `${value} Peserta` },
    },
    plotOptions: { pie: { donut: { size: '80%' } } },
  });

  const handleOpenDialog = (data: any) => {
    setSelectedPenilaian(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPenilaian(null);
  };

  const chartOptions1: any = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Budi Santoso', 'Kareem Graham', 'Siti Aminah', 'Andi Wijaya'] },
    yaxis: { title: { text: 'Nilai Rata-rata' }, max: 100 },
    fill: { opacity: 1, colors: ['#004F9F'] },
    tooltip: { y: { formatter: (val: number) => val + " Poin" } }
  };
  const chartSeries1 = [{ name: 'Rata-rata Nilai', data: [85, 92, 78, 88] }];

  const chartOptions2: any = {
    chart: { type: 'donut' },
    labels: ['Sudah Dinilai', 'Belum Dinilai'],
    colors: ['#22c55e', '#eab308'],
    plotOptions: { pie: { donut: { size: '75%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' }
  };
  const chartSeries2 = [3, 1];

  const renderProgressBar = (value: number) => {
    // Warna progress bar (hijau jika >= 85, kuning jika < 85)
    const color = value >= 85 ? '#22c55e' : '#eab308';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 2, bgcolor: '#f1f5f9', borderRadius: 4, height: 8, overflow: 'hidden' }}>
          <Box sx={{ width: `${value}%`, bgcolor: color, height: '100%', borderRadius: 4 }} />
        </Box>
        <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ minWidth: 25 }}>
          {value}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Helmet>
        <title> Penilaian | SI-Magang</title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:star-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">Data Penilaian Peserta</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Kelola dan analisis hasil penilaian magang seluruh peserta.</Typography>
            </Box>
          </Box>
          <Button variant="contained" sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9' }, fontWeight: 'bold' }}>
            <Iconify icon="solar:download-minimalistic-bold-duotone" sx={{ mr: 1 }} /> Unduh Rekap Penilaian
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #004F9F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(0, 79, 159, 0.1)', color: '#004F9F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Total Peserta Dinilai</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#004F9F', fontWeight: 'bold' }}>3</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #8CC63F', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(140, 198, 63, 0.1)', color: '#8CC63F', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:medal-star-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Rata-rata Nilai Keseluruhan</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#8CC63F', fontWeight: 'bold' }}>88.5</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', borderBottom: '4px solid #FFAB00', '&:hover': { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: 'rgba(255, 171, 0, 0.1)', color: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Iconify icon="solar:user-id-bold-duotone" width={24} />
                </Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.2 }}>Mentor Aktif</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: '#FFAB00', fontWeight: 'bold' }}>2</Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 340 }}>
                <CardHeader title="Rata-rata Nilai Peserta per Mentor" />
                <Box sx={{ p: 3, height: 260 }} dir="ltr">
                    <Chart type="bar" series={mentorSeries} options={mentorOptions} height={240} />
                </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: 340 }}>
                <CardHeader title="Status Penilaian Keseluruhan" />
                <Box sx={{ p: 3, height: 260 }} dir="ltr">
                    <Chart type="donut" series={statusSeries} options={statusOptions} height={240} />
                </Box>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Program</InputLabel><Select label="Program" defaultValue="all"><MenuItem value="all">Semua Program</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Direktorat</InputLabel><Select label="Direktorat" defaultValue="all"><MenuItem value="all">Semua Direktorat</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Fungsi</InputLabel><Select label="Fungsi" defaultValue="all"><MenuItem value="all">Semua Fungsi</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Sub Fungsi</InputLabel><Select label="Sub Fungsi" defaultValue="all"><MenuItem value="all">Semua Sub Fungsi</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Mentor</InputLabel><Select label="Mentor" defaultValue="all"><MenuItem value="all">Semua Mentor</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}><InputLabel>Status Penilaian</InputLabel><Select label="Status Penilaian" defaultValue="all"><MenuItem value="all">Semua Status</MenuItem></Select></FormControl>
            </Grid>
            
            <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1 }}>
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

        <Card sx={{ p: 3 }}>
          {/* TABLE */}
          <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:list-bold-duotone" sx={{ mr: 1 }} /> Daftar Penilaian Peserta
          </Typography>
          <TableContainer sx={{ minHeight: 400 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                <TableRow>
                  <TableCell>Nama Peserta</TableCell>
                  <TableCell>ID Peserta</TableCell>
                  <TableCell>Asal Instansi</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Direktorat</TableCell>
                  <TableCell>Fungsi</TableCell>
                  <TableCell>Sub Fungsi</TableCell>
                  <TableCell>Mentor</TableCell>
                  <TableCell>Nilai Akhir</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.nim}</TableCell>
                    <TableCell>{row.instansi}</TableCell>
                    <TableCell>{row.program}</TableCell>
                    <TableCell>{row.direktorat}</TableCell>
                    <TableCell>{row.fungsi}</TableCell>
                    <TableCell>{row.subFungsi}</TableCell>
                    <TableCell>{row.mentor}</TableCell>
                    <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.nilai}</TableCell>
                    <TableCell>
                      {row.kategori !== '-' && <Chip label={row.kategori} size="small" color="info" variant="soft" />}
                    </TableCell>
                    <TableCell>
                       <Chip label={row.status} size="small" color={row.status === 'Sudah Dinilai' ? 'success' : 'warning'} variant="soft" />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <Button variant="outlined" size="small" color="primary" sx={{ mr: 1, minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }} onClick={() => handleOpenDialog(row)}>Detail</Button>
                      <Button variant="outlined" size="small" color="error" sx={{ minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 1 }}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>

      {/* DETAIL PENILAIAN DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedPenilaian && selectedPenilaian.detailNilai && (
          <>
            {/* Header dengan Gradient Ungu-Pink -> Biru Pertamina */}
            <DialogTitle sx={{ 
              m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', 
              color: 'white' 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon="solar:clipboard-text-bold" width={28} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">Detail Penilaian</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Informasi lengkap hasil penilaian peserta
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
              
              {/* Data Peserta */}
              <Box sx={{ mb: 2.5, mt: 1 }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Iconify icon="solar:user-id-bold-duotone" sx={{ mr: 1 }} /> Data Peserta
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Nama Lengkap</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.name}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Asal Instansi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.instansi}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Direktorat</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.direktorat}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedPenilaian.fungsi}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">ID Peserta</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.nim}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Jurusan</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.jurusan}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Mentor</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>{selectedPenilaian.mentor}</Typography>

                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Sub Fungsi</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedPenilaian.subFungsi}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Detail Penilaian (Progress Bars) */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Iconify icon="solar:checklist-bold-duotone" sx={{ mr: 1 }} /> Detail Penilaian
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>1. Integritas (Etika, moral, dan kesungguhan)</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.integritas)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>2. Ketepatan waktu dalam bekerja</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.ketepatanWaktu)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>3. Keahlian berdasarkan bidang ilmu</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.keahlian)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>4. Kerjasama dalam tim</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.kerjasama)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>5. Komunikasi</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.komunikasi)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>6. Penggunaan teknologi informasi</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.penggunaanTI)}</Box>
                    </Grid>
                    <Grid item xs={12} display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ width: '40%' }}>7. Pengembangan diri</Typography>
                      <Box sx={{ width: '60%' }}>{renderProgressBar(selectedPenilaian.detailNilai.pengembanganDiri)}</Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Nilai Akhir & Keterangan Cards */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>Nilai Akhir</Typography>
                    <Typography variant="h4" fontWeight="bold">{selectedPenilaian.nilai}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #8CC63F 0%, #6da12c 100%)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 90 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>Keterangan</Typography>
                    <Typography variant="h4" fontWeight="bold">{selectedPenilaian.kategori}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Penilaian Keseluruhan & Catatan */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Iconify icon="solar:like-bold-duotone" sx={{ mr: 1 }} /> Kesimpulan Penilaian
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: '0px 2px 4px rgba(0,0,0,0.02)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Status Rekomendasi</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1.5 }}>{selectedPenilaian.rekomendasi}</Typography>
                      
                      <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">Catatan / Feedback</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedPenilaian.catatan}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}