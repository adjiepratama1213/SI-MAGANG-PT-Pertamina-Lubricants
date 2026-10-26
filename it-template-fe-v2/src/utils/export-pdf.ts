/* eslint-disable new-cap */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Warna Khas Pertamina Lubricants
const COLOR_PRIMARY: [number, number, number] = [0, 79, 159]; // #004F9F
const COLOR_DARK: [number, number, number] = [30, 41, 59]; // #1E293B
const COLOR_MUTED: [number, number, number] = [100, 116, 139]; // #64748B
const COLOR_BORDER: [number, number, number] = [226, 232, 240]; // #E2E8F0

const formatCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';
};

/**
 * Helper untuk menambahkan header resmi PT Pertamina Lubricants pada PDF
 */
const addPertaminaHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Garis aksen biru atas
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Judul Perusahaan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('PT PERTAMINA LUBRICANTS', 14, 16);

  // Sub-header SI-Magang
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);
  doc.text('Sistem Informasi Manajemen Magang (SI-Magang)', 14, 21);

  // Judul Dokumen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_DARK);
  doc.text(title.toUpperCase(), 14, 30);

  // Tanggal cetak di kanan atas
  const printDate = `Dicetak: ${formatCurrentDateTime()}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(printDate, pageWidth - 14, 16, { align: 'right' });

  if (subtitle) {
    doc.text(subtitle, pageWidth - 14, 21, { align: 'right' });
  }

  // Garis pemisah tipis
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.5);
  doc.line(14, 33, pageWidth - 14, 33);
};

/**
 * Helper untuk menambahkan footer nomor halaman pada PDF
 */
const addPertaminaFooter = (doc: jsPDF) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text('Dokumen ini digenerate secara otomatis melalui SI-Magang PT Pertamina Lubricants.', 14, pageHeight - 7);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
};

/**
 * 1. Unduh Data Peserta ke PDF
 */
export const exportPesertaPdf = (data: any[], year?: string) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const docTitle = year && year !== 'all' ? `Laporan Data Peserta Magang (Tahun ${year})` : 'Laporan Data Peserta Magang';
  addPertaminaHeader(doc, docTitle, `Total Data: ${data.length} Peserta`);

  const tableHead = [
    ['No', 'Nama Peserta', 'NIM / ID', 'Program', 'Universitas / Instansi', 'Direktorat', 'Fungsi & Sub Fungsi', 'Mentor', 'Periode', 'Status']
  ];

  const tableBody = data.map((item, index) => [
    index + 1,
    item.name || '-',
    item.nim || '-',
    item.program || '-',
    item.kampus || '-',
    item.direktorat || '-',
    item.subFungsi && item.subFungsi !== '-' ? `${item.fungsi} - ${item.subFungsi}` : (item.fungsi || '-'),
    item.mentor || '-',
    item.periode || '-',
    item.status_aktif || 'Aktif'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: COLOR_DARK,
      valign: 'middle',
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 24 },
      4: { cellWidth: 35 },
      5: { cellWidth: 36 },
      6: { cellWidth: 36 },
      7: { cellWidth: 28 },
      8: { cellWidth: 28, fontSize: 7 },
      9: { halign: 'center', cellWidth: 16 },
    },
    didDrawPage: () => {
      // hook if needed
    },
  });

  addPertaminaFooter(doc);
  const fileYearSuffix = year && year !== 'all' ? `${year}_` : '';
  doc.save(`Data_Peserta_PTPL_${fileYearSuffix}${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * 2. Unduh Data Mentor ke PDF
 */
export const exportMentorPdf = (data: any[], year?: string) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const docTitle = year && year !== 'all' ? `Laporan Data Mentor Pembimbing (Tahun ${year})` : 'Laporan Data Mentor Pembimbing';
  addPertaminaHeader(doc, docTitle, `Total Data: ${data.length} Mentor`);

  const tableHead = [
    ['No', 'Nama Mentor', 'Email', 'Jabatan', 'Direktorat', 'Fungsi', 'Sub Fungsi', 'Bimbingan', 'Status']
  ];

  const tableBody = data.map((item, index) => [
    index + 1,
    item.name || '-',
    item.email || '-',
    item.jabatan || '-',
    item.direktorat || '-',
    item.fungsi || '-',
    item.subFungsi || '-',
    `${item.bimbingan || 0} Peserta`,
    item.status || 'Tidak Aktif'
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: COLOR_DARK,
      valign: 'middle',
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { fontStyle: 'bold', cellWidth: 42 },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 42 },
      5: { cellWidth: 35 },
      6: { cellWidth: 35 },
      7: { halign: 'center', cellWidth: 20 },
      8: { halign: 'center', cellWidth: 20 },
    },
  });

  addPertaminaFooter(doc);
  const fileYearSuffix = year && year !== 'all' ? year : 'Semua_Tahun';
  doc.save(`Data_Mentor_PTPL_${fileYearSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * 3. Unduh Data Evaluasi Peserta ke PDF
 */
export const exportEvaluasiPesertaPdf = (data: any[], year?: string) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const docTitle = year && year !== 'all' ? `Laporan Rekapitulasi Evaluasi Peserta (Tahun ${year})` : 'Laporan Rekapitulasi Evaluasi Peserta';
  addPertaminaHeader(doc, docTitle, `Total Data: ${data.length} Peserta`);

  const tableHead = [
    ['No', 'Nama Peserta', 'ID Peserta', 'Program & Instansi', 'Hadir', 'Izin', 'Alpha', 'Laporan Akhir', 'Nilai', 'Kategori', 'Status', 'Approval VP']
  ];

  const tableBody = data.map((row, index) => {
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
        try {
          const saved = localStorage.getItem('evaluasi_peserta_vp_approvals');
          const vpApprovals = saved ? JSON.parse(saved) : {};
          const status = vpApprovals[row.id];
          vpStatusText = status === 'APPROVED' ? 'Disetujui VP' : status === 'PENDING' ? 'Menunggu Approval' : 'Belum Diajukan';
        } catch {
          vpStatusText = 'Belum Diajukan';
        }
      }
    }

    return [
      index + 1,
      row.user?.name || '-',
      row.internId || '-',
      `${row.program || '-'} - ${row.university || '-'}`,
      hadir,
      izin + sakit,
      alpha,
      laporanStatus,
      nilai,
      kategori,
      statusText,
      vpStatusText
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: COLOR_DARK,
      valign: 'middle',
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 35 },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 40 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'center', cellWidth: 14 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 30 },
      8: { halign: 'center', cellWidth: 16 },
      9: { halign: 'center', cellWidth: 20 },
      10: { halign: 'center', cellWidth: 24 },
      11: { halign: 'center', cellWidth: 25 },
    },
  });

  addPertaminaFooter(doc);
  const fileYearSuffix = year && year !== 'all' ? year : 'Semua_Tahun';
  doc.save(`Evaluasi_Peserta_PTPL_${fileYearSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * 4. Unduh Rekap Presensi ke PDF
 */
export const exportPresensiPdf = (data: any[], filterBulan: string = 'all') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

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

  addPertaminaHeader(doc, 'Laporan Rekapitulasi Presensi Peserta', `Periode: ${periodeLabel} | Total: ${data.length} Peserta`);

  const tableHead = [
    ['No', 'Nama Peserta', 'NIM / ID', 'Program & Kampus', 'Penempatan', 'Mentor', 'Hadir', 'Izin', 'Alpha', 'Total Hari', 'Kehadiran (%)']
  ];

  const tableBody = data.map((row, index) => {
    const hadir = row.totalHadir ?? 0;
    const izin = row.totalIzin ?? 0;
    const alpha = row.totalAlpha ?? 0;
    const totalHari = hadir + izin + alpha;
    const persentase = totalHari > 0 ? `${Math.round((hadir / totalHari) * 100)}%` : '-';

    const penempatan = row.subFungsi && row.subFungsi !== '-'
      ? `${row.direktorat || '-'}\n${row.fungsi || '-'} - ${row.subFungsi}`
      : `${row.direktorat || '-'}\n${row.fungsi || '-'}`;

    return [
      index + 1,
      row.name || '-',
      row.nim || '-',
      `${row.program || '-'}\n${row.kampus || '-'}`,
      penempatan,
      row.mentor || '-',
      hadir,
      izin,
      alpha,
      totalHari,
      persentase,
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 37,
    theme: 'grid',
    headStyles: {
      fillColor: COLOR_PRIMARY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: COLOR_DARK,
      valign: 'middle',
      lineColor: COLOR_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 36 },
      2: { halign: 'center', cellWidth: 22 },
      3: { cellWidth: 42 },
      4: { cellWidth: 48 },
      5: { cellWidth: 30 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 16 },
      8: { halign: 'center', cellWidth: 16 },
      9: { halign: 'center', cellWidth: 18 },
      10: { halign: 'center', cellWidth: 20 },
    },
  });

  addPertaminaFooter(doc);
  doc.save(`Rekap_Presensi_PTPL_${filterBulan !== 'all' ? filterBulan + '_' : ''}${new Date().toISOString().slice(0, 10)}.pdf`);
};
