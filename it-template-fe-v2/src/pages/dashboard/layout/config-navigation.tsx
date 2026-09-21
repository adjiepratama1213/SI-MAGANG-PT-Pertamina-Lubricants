import { NavListProps } from 'src/components/nav-section';
import SvgColor from 'src/components/svg-color';
import Iconify from 'src/components/iconify';
import { rolePTPL } from 'src/config-global';
import { paths } from 'src/pages/paths';

// ----------------------------------------------------------------------

// Roles khusus admin (tanpa EMPLOYEESTAFF)
const roleAdmin = ['SUPERSAIYAN', 'PTPL_IT', 'PTPL_QA', 'PTPL_PROD', 'EMPLOYEE'];

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

const navItem: {
  subheader: string;
  items: NavListProps[];
}[] = [
    // MAIN MENU (Admin only - hidden from EMPLOYEESTAFF)
    // ----------------------------------------------------------------------
    {
      subheader: 'Main',
      items: [
        { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard, roles: roleAdmin },
        { title: 'Peserta', path: paths.dashboard.peserta, icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />, roles: roleAdmin },
        { title: 'Mentor', path: paths.dashboard.mentor, icon: <Iconify icon="solar:user-id-bold-duotone" />, roles: roleAdmin },
        { title: 'Presensi', path: paths.dashboard.presensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: roleAdmin },
        { title: 'Penilaian', path: paths.dashboard.penilaian, icon: <Iconify icon="solar:star-bold-duotone" />, roles: roleAdmin },
        { title: 'Laporan', path: paths.dashboard.laporan, icon: <Iconify icon="solar:document-text-bold-duotone" />, roles: roleAdmin },
      ],
    },

    // KOMUNIKASI (Admin only - hidden from EMPLOYEESTAFF)
    // ----------------------------------------------------------------------
    {
      subheader: 'Komunikasi',
      items: [
        { title: 'Feedback', path: paths.dashboard.feedback, icon: <Iconify icon="solar:chat-round-dots-bold-duotone" />, roles: roleAdmin },
        { title: 'Reminder', path: paths.dashboard.reminder, icon: <Iconify icon="solar:bell-bing-bold-duotone" />, roles: roleAdmin },
      ],
    },

    // MENTOR MENU - MAIN
    // ----------------------------------------------------------------------
    {
      subheader: 'Main',
      items: [
        { title: 'Dashboard', path: paths.dashboard.mentorDashboard, icon: ICONS.dashboard, roles: ['EMPLOYEESTAFF'] },
        { title: 'Data Bimbingan', path: paths.dashboard.dataBimbingan, icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Presensi', path: paths.dashboard.mentorPresensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Laporan', path: paths.dashboard.mentorLaporan, icon: <Iconify icon="solar:document-text-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Penilaian', path: paths.dashboard.mentorPenilaian, icon: <Iconify icon="solar:star-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
      ],
    },

    // MENTOR MENU - KOMUNIKASI
    // ----------------------------------------------------------------------
    {
      subheader: 'Komunikasi',
      items: [
        { title: 'Reminder', path: paths.dashboard.mentorReminder, icon: <Iconify icon="solar:bell-bing-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Rekap', path: paths.dashboard.mentorRekap, icon: <Iconify icon="solar:clipboard-list-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
      ],
    },

    // PESERTA MENU - MAIN
    // ----------------------------------------------------------------------
    {
      subheader: 'Main',
      items: [
        { title: 'Dashboard', path: paths.dashboard.pesertaDashboard, icon: ICONS.dashboard, roles: ['PESERTA'] },
        { title: 'Presensi', path: paths.dashboard.pesertaPresensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: ['PESERTA'] },
        { title: 'Laporan', path: paths.dashboard.pesertaLaporan, icon: <Iconify icon="solar:document-text-bold-duotone" />, roles: ['PESERTA'] },
        { title: 'Nilai & Sertifikat', path: paths.dashboard.pesertaPenilaian, icon: <Iconify icon="solar:star-bold-duotone" />, roles: ['PESERTA'] },
      ],
    },

    // MANAGEMENT
    // ----------------------------------------------------------------------
    {
      subheader: 'Administrasi',
      items: [
        {
          roles: ['PTPL_IT', 'SUPERSAIYAN'],
          title: 'User Management',
          path: '#',
          icon: <Iconify icon="solar:settings-bold-duotone" />,
          children: [
            { title: 'Admin', path: paths.userManagement.admin },
            { title: 'VP', path: paths.userManagement.vp },
            { title: 'Mentor', path: paths.userManagement.mentor },
            { title: 'Peserta', path: paths.userManagement.peserta },
          ],
        },
      ],
    },
  ];

export function useNavData() {
  const data = [...navItem];

  return data;
}
