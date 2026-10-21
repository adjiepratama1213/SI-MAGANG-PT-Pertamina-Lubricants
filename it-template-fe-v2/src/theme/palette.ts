import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'pertamina' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }
}

// SETUP COLORS

const GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

const PRIMARY = {
  lighter: '#D1E4F9',
  light: '#73A9E0',
  main: '#004F9F',
  dark: '#003366',
  darker: '#001A33',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#FCE0E2',
  light: '#F48E96',
  main: '#EC2028',
  dark: '#A5161C',
  darker: '#5E0C10',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#00B8D9',
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
};

const PERTAMINA = {
  lighter: '#D1E4F9',
  light: '#73A9E0',
  main: '#004F9F',
  dark: '#003366',
  darker: '#001A33',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#E6F6D6',
  light: '#BCE486',
  main: '#8CC63F',
  dark: '#5D8526',
  darker: '#2E4213',
  contrastText: '#ffffff',
};

const WARNING = {
  lighter: '#FEF3C7',
  light: '#FCD34D',
  main: '#F59E0B',
  dark: '#B45309',
  darker: '#78350F',
  contrastText: GREY[800],
};

// ======================================================================
// PANDUAN DESAIN & TOKEN WARNA SISTEM (PT PERTAMINA LUBRICANTS)
// ======================================================================
// File ini adalah pusat penyimpanan seluruh palet warna dan token desain aplikasi.
//
// 1. KATEGORI WARNA KORPORAT & UTAMA (NAVY / PERTAMINA BLUE):
//    - navy (#004F9F): Biru korporat resmi PT Pertamina Lubricants dari Welcome Page.
//      Digunakan pada: Banner Sambutan, Card Total Kehadiran, Sidebar Aktif
//      (Role Peserta), Tombol Utama (Check In, Kirim, Submit), & Ikon Lokasi GPS.
//    - navyHover (#002D62): Varian hover untuk tombol aksi & interaktif dari Welcome Page.
//    - bannerGradient ('radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)'):
//      Gradasi header modern di seluruh halaman role peserta dan welcome page.
//
// 2. KATEGORI CAPAIAN & EVALUASI (GREEN):
//    - green (#10B981) / greenDark (#059669):
//      Digunakan pada: Card Nilai Evaluasi Akhir, Chip status Hadir,
//      dan indikator performa magang.
//
// 3. KATEGORI STATUS PERINGATAN & IZIN (YELLOW / AMBER):
//    - yellow (#F59E0B):
//      Digunakan pada: Status Izin & Sakit, Banner Pemberitahuan Presensi,
//      Modal Keterlambatan Check-In, dan segmen Donut Chart.
//
// 4. KATEGORI ALFA & AKSEN PROGRAM (RED):
//    - red (#EF4444):
//      Digunakan pada: Card Program Magang, Status Alfa / Tidak Hadir,
//      dan error alert.
// ======================================================================
export const PERTAMINA_TOKENS = {
  navy: '#004F9F',
  navyHover: '#002D62',
  bannerGradient: 'radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(135deg, #002D62 0%, #004F9F 55%, #001E3D 100%)',
  green: '#10B981',
  greenDark: '#059669',
  yellow: '#F59E0B',
  red: '#EF4444',
};

const ERROR = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

const COMMON = {
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  pertamina: PERTAMINA,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.2),
  action: {
    hover: alpha(GREY[500], 0.08),
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

export function palette(mode: 'light' | 'dark') {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
    },
    background: {
      paper: '#FFFFFF',
      default: '#FFFFFF',
      neutral: GREY[200],
    },
    action: {
      ...COMMON.action,
      active: GREY[600],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      disabled: GREY[600],
    },
    background: {
      paper: GREY[800],
      default: GREY[900],
      neutral: alpha(GREY[500], 0.12),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  };

  return mode === 'light' ? light : dark;
}
