import { utils, writeFile } from 'xlsx';

/**
 * Ekspor Data Peserta Magang ke format Microsoft Excel (.xlsx)
 */
export const exportPesertaExcel = (data: any[], year?: string) => {
  const rows = data.map((item, index) => ({
    'No': index + 1,
    'Nama Peserta': item.name || '-',
    'NIM / ID Peserta': item.nim || '-',
    'Program Magang': item.program || '-',
    'Asal Universitas / Kampus': item.kampus || '-',
    'Jurusan': item.jurusan || '-',
    'Jenis Kelamin': item.kelamin || '-',
    'Kontak / Telepon': item.kontak || '-',
    'Tanggal Lahir': item.tglLahir || '-',
    'Direktorat': item.direktorat || '-',
    'Fungsi': item.fungsi || '-',
    'Sub Fungsi': item.subFungsi || '-',
    'Mentor Pembimbing': item.mentor || '-',
    'Periode Magang': item.periode || '-',
    'Status Magang': item.status_aktif || 'Aktif',
    'Bank': item.bank || '-',
    'No. Rekening': item.noRek || '-',
  }));

  const worksheet = utils.json_to_sheet(rows);

  // Atur lebar kolom agar proporsional dan mudah dibaca
  worksheet['!cols'] = [
    { wch: 6 },   // No
    { wch: 28 },  // Nama
    { wch: 18 },  // NIM
    { wch: 18 },  // Program
    { wch: 30 },  // Kampus
    { wch: 25 },  // Jurusan
    { wch: 14 },  // Kelamin
    { wch: 16 },  // Kontak
    { wch: 16 },  // Tgl Lahir
    { wch: 32 },  // Direktorat
    { wch: 26 },  // Fungsi
    { wch: 26 },  // Sub Fungsi
    { wch: 25 },  // Mentor
    { wch: 30 },  // Periode
    { wch: 14 },  // Status
    { wch: 15 },  // Bank
    { wch: 20 },  // No Rek
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Data Peserta');

  const fileYearSuffix = year && year !== 'all' ? year : 'Semua_Tahun';
  writeFile(workbook, `Data_Peserta_Magang_PTPL_${fileYearSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Ekspor Data Mentor Pembimbing ke format Microsoft Excel (.xlsx)
 */
export const exportMentorExcel = (data: any[], year?: string) => {
  const rows = data.map((item, index) => {
    const bimbinganList = (item.pesertaList || [])
      .map((p: any) => `${p.nama || '-'} (${p.instansi || '-'})`)
      .join(', ');

    return {
      'No': index + 1,
      'Nama Mentor': item.name || '-',
      'Email': item.email || '-',
      'Jabatan': item.jabatan || '-',
      'Direktorat': item.direktorat || '-',
      'Fungsi': item.fungsi || '-',
      'Sub Fungsi': item.subFungsi || '-',
      'Jumlah Bimbingan': `${item.bimbingan || 0} Peserta`,
      'Status': item.status || 'Tidak Aktif',
      'Peserta Bimbingan': bimbinganList || '-',
    };
  });

  const worksheet = utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },   // No
    { wch: 28 },  // Nama Mentor
    { wch: 30 },  // Email
    { wch: 25 },  // Jabatan
    { wch: 32 },  // Direktorat
    { wch: 26 },  // Fungsi
    { wch: 26 },  // Sub Fungsi
    { wch: 18 },  // Jumlah Bimbingan
    { wch: 15 },  // Status
    { wch: 45 },  // Peserta Bimbingan
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Data Mentor');

  const fileYearSuffix = year && year !== 'all' ? year : 'Semua_Tahun';
  writeFile(workbook, `Data_Mentor_PTPL_${fileYearSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Ekspor Data Rekapitulasi Presensi Peserta ke format Microsoft Excel (.xlsx)
 */
export const exportPresensiExcel = (data: any[], filterBulan: string = 'all') => {
  let periodeLabel = 'Semua Periode (Akumulasi Total)';
  if (filterBulan && filterBulan !== 'all') {
    const [year, month] = filterBulan.split('-');
    if (year && month) {
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      periodeLabel = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } else {
      periodeLabel = filterBulan;
    }
  }

  const rows = data.map((row, index) => {
    const hadir = row.totalHadir ?? 0;
    const izin = row.totalIzin ?? 0;
    const alpha = row.totalAlpha ?? 0;
    const totalHari = hadir + izin + alpha;
    const persentase = totalHari > 0 ? `${Math.round((hadir / totalHari) * 100)}%` : '-';

    return {
      'No': index + 1,
      'Nama Peserta': row.name || '-',
      'NIM / ID': row.nim || '-',
      'Program Magang': row.program || '-',
      'Asal Universitas / Kampus': row.kampus || '-',
      'Direktorat': row.direktorat || '-',
      'Fungsi': row.fungsi || '-',
      'Sub Fungsi': row.subFungsi || '-',
      'Mentor Pembimbing': row.mentor || '-',
      'Periode Presensi': periodeLabel,
      'Hadir': hadir,
      'Izin': izin,
      'Alpha': alpha,
      'Total Hari': totalHari,
      'Tingkat Kehadiran': persentase,
    };
  });

  const worksheet = utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },   // No
    { wch: 28 },  // Nama
    { wch: 18 },  // NIM
    { wch: 20 },  // Program
    { wch: 30 },  // Kampus
    { wch: 32 },  // Direktorat
    { wch: 26 },  // Fungsi
    { wch: 26 },  // Sub Fungsi
    { wch: 25 },  // Mentor
    { wch: 25 },  // Periode Presensi
    { wch: 10 },  // Hadir
    { wch: 10 },  // Izin
    { wch: 10 },  // Alpha
    { wch: 12 },  // Total Hari
    { wch: 18 },  // Tingkat Kehadiran
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Rekap Presensi');

  const fileSuffix = filterBulan && filterBulan !== 'all' ? filterBulan : 'Semua_Periode';
  writeFile(workbook, `Rekap_Presensi_PTPL_${fileSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Ekspor Data Evaluasi Peserta ke format Microsoft Excel (.xlsx)
 */
export const exportEvaluasiPesertaExcel = (data: any[], year?: string) => {
  let vpApprovals: Record<string, string> = {};
  try {
    const saved = localStorage.getItem('evaluasi_peserta_vp_approvals');
    if (saved) vpApprovals = JSON.parse(saved);
  } catch {
    vpApprovals = {};
  }

  const rows = data.map((row, index) => {
    // Hitung presensi
    const presensi = (row.presensi || []).filter((p: any) => {
      const d = new Date(p.tanggalInput).getDay();
      return d !== 0 && d !== 6;
    });
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const hadir = presensi.filter((p: any) => p.presensiStatus === 'HADIR' || p.presensiStatus === 'HADIR_TERLAMBAT').length;
    const izin = presensi.filter((p: any) => p.presensiStatus === 'IZIN').length;
    const sakit = presensi.filter((p: any) => p.presensiStatus === 'SAKIT').length;
    const alpha = presensi.filter((p: any) => {
      if (p.presensiStatus !== 'ALPHA') return false;
      const pDate = new Date(p.tanggalInput);
      const pStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
      if (pStr === todayStr && !p.masuk) return false;
      return true;
    }).length;

    // Laporan Akhir
    let laporanStatus = '-';
    if (Array.isArray(row.Laporan) && row.Laporan.length > 0) {
      const withFiles = row.Laporan.filter((l: any) => Array.isArray(l.files) && l.files.length > 0);
      if (withFiles.length > 0) {
        const akhirList = withFiles.filter((l: any) => l.keterangan?.toLowerCase().includes('akhir'));
        const targetList = akhirList.length > 0 ? akhirList : withFiles;
        const latest = [...targetList].sort(
          (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];
        laporanStatus = latest?.statusFeedback || 'Menunggu Evaluasi';
      }
    }

    const hasEvaluation = !!row.evaluation;
    const nilai = hasEvaluation && row.evaluation.nilaiRataRata != null ? row.evaluation.nilaiRataRata.toFixed(2) : '-';
    const kategori = hasEvaluation && row.evaluation.kategori ? row.evaluation.kategori : '-';
    const isSelesai = hasEvaluation && laporanStatus === 'Telah Dievaluasi';
    const statusText = isSelesai ? 'Selesai' : 'Belum Selesai';

    let vpStatusText = '-';
    if (isSelesai) {
      if (row.evaluation?.certificateUrl) {
        vpStatusText = 'Disetujui VP';
      } else {
        const status = vpApprovals[row.id];
        vpStatusText = status === 'APPROVED' ? 'Disetujui VP' : status === 'PENDING' ? 'Menunggu Approval' : 'Belum Diajukan';
      }
    }

    const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    const periodeStr = row.startDate || row.endDate ? `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` : '-';

    return {
      'No': index + 1,
      'Nama Peserta': row.user?.name || '-',
      'NIM / ID': row.internId || '-',
      'Program Magang': row.program || '-',
      'Universitas / Instansi': row.university || '-',
      'Jurusan': row.major || '-',
      'Periode Magang': periodeStr,
      'Mentor Pembimbing': row.mentor?.user?.name || row.mentor?.name || '-',
      'Direktorat': row.mentor?.direktorat || '-',
      'Fungsi': row.mentor?.fungsi || '-',
      'Sub Fungsi': row.mentor?.subFungsi || '-',
      'Hadir': hadir,
      'Izin & Sakit': izin + sakit,
      'Alpha': alpha,
      'Status Laporan Akhir': laporanStatus,
      'Nilai Rata-rata': nilai,
      'Kategori Nilai': kategori,
      'Status Evaluasi': statusText,
      'Status Approval VP': vpStatusText,
    };
  });

  const worksheet = utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 6 },   // No
    { wch: 28 },  // Nama
    { wch: 18 },  // NIM
    { wch: 18 },  // Program
    { wch: 28 },  // Universitas
    { wch: 24 },  // Jurusan
    { wch: 28 },  // Periode
    { wch: 25 },  // Mentor
    { wch: 32 },  // Direktorat
    { wch: 25 },  // Fungsi
    { wch: 25 },  // Sub Fungsi
    { wch: 10 },  // Hadir
    { wch: 12 },  // Izin & Sakit
    { wch: 10 },  // Alpha
    { wch: 22 },  // Status Laporan Akhir
    { wch: 15 },  // Nilai
    { wch: 16 },  // Kategori
    { wch: 16 },  // Status Evaluasi
    { wch: 20 },  // Status Approval VP
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Evaluasi Peserta');

  const fileYearSuffix = year && year !== 'all' ? year : 'Semua_Tahun';
  writeFile(workbook, `Evaluasi_Peserta_PTPL_${fileYearSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};



