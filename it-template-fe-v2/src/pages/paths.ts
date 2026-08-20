// ----------------------------------------------------------------------
import { paramCase } from 'src/utils/change-case';

const ROOTS = {
  AUTH: '/auth',
  USER: '/user',
  MFA: '/mfa',
  API: '/api',
  DASHBOARD: '/dashboard',
  PRIVACYPOLICY: '/privacy-policy',
  DISPLAY: '/display',
  PFORM: '/p-form',
  ABOUTUS: '/about-us',
  USERMANAGEMENT: '/user-management',
  TEAMMANAGEMENT: '/team-management',
  //
  PTPL_IT: '/ptpl-it',
  PTPL_QA: '/ptpl-qa',
  PTPL_PROD: '/ptpl-prod',
  PRODUCT: '/product',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  ptpl: 'https://www.pertaminalubricants.com/',
  waSystem: 'https://wa.me/6285283370217',
  home: '/',
  // AUTH
  auth: {
    login: `${ROOTS.AUTH}/login`,
    register: `${ROOTS.AUTH}/register`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
  },
  newTab: {
    root: '/new-tab',
    newTicketIT: '/form-pengajuan-it',
  },
  display: {
    inputLottery: `${ROOTS.DISPLAY}/lottery`,
    gridLottery: `${ROOTS.DISPLAY}/grid-lottery`,
    boxLottery: `${ROOTS.DISPLAY}/box-lottery`,
  },
  chat: {
    root: '/chat',
  },

  privacyPolicy: {
    root: `${ROOTS.PRIVACYPOLICY}`,
  },

  aboutUs: {
    root: `${ROOTS.ABOUTUS}`,
  },

  userManual: {
    root: '/user-manual',
  },

  extension: {
    root: '/extension',
  },

  dashboard: {
    root: `${ROOTS.DASHBOARD}`,
    peserta: `${ROOTS.DASHBOARD}/peserta`,
    mentor: `${ROOTS.DASHBOARD}/mentor`,
    presensi: `${ROOTS.DASHBOARD}/presensi`,
    penilaian: `${ROOTS.DASHBOARD}/penilaian`,
    laporan: `${ROOTS.DASHBOARD}/laporan`,
    reminder: `${ROOTS.DASHBOARD}/reminder`,
    feedback: `${ROOTS.DASHBOARD}/feedback`,
  },

  user: {
    root: `${ROOTS.USER}`,
    settings: `${ROOTS.USER}/settings`,
    profile: '',
  },

  mfa: {
    root: `${ROOTS.MFA}`,
    setup: `${ROOTS.MFA}/setup`,
    verify: `${ROOTS.MFA}/verify`,
    validation: `${ROOTS.MFA}/validation`,
    reset: `${ROOTS.MFA}/reset`,
  },

  userManagement: {
    root: `${ROOTS.USERMANAGEMENT}`,
    admin: `${ROOTS.USERMANAGEMENT}/admin`,
    vp: `${ROOTS.USERMANAGEMENT}/vp`,
    mentor: `${ROOTS.USERMANAGEMENT}/mentor`,
    peserta: `${ROOTS.USERMANAGEMENT}/peserta`,
    details: (id: string) => `${ROOTS.USERMANAGEMENT}/detail/${paramCase(id)}`,
    edit: (id: string) => `${ROOTS.USERMANAGEMENT}/edit/${paramCase(id)}`,
  },

  teamManagement: {
    root: `${ROOTS.TEAMMANAGEMENT}`,
    new: `${ROOTS.TEAMMANAGEMENT}/new`,
    details: (id: string) => `${ROOTS.TEAMMANAGEMENT}/detail/${paramCase(id)}`,
    edit: (id: string) => `${ROOTS.TEAMMANAGEMENT}/edit/${paramCase(id)}`,
  },

  api: {
    me: `${ROOTS.API}/me`,
  },
};
