import { useMemo } from 'react';
import { NavListProps } from 'src/components/nav-section';
import SvgColor from 'src/components/svg-color';
import Iconify from 'src/components/iconify';
import { rolePTPL } from 'src/config-global';
import { paths } from 'src/pages/paths';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

// Roles khusus admin (tanpa EMPLOYEESTAFF dan EMPLOYEE)
const roleAdmin = ['SUPERSAIYAN', 'PTPL_IT', 'PTPL_QA', 'PTPL_PROD'];

// ======================================================================
// PANDUAN SISTEM IKON & NAVIGASI (PT PERTAMINA LUBRICANTS)
// ======================================================================
// File ini adalah pusat konfigurasi rute menu dan sistem icon navigasi.
//
// 1. IKON NAVIGASI UTAMA (Sidebar):
//    - Dashboard: ICONS.dashboard (/assets/icons/navbar/ic_dashboard.svg)
//    - Presensi: solar:calendar-date-bold-duotone
//    - Laporan: solar:document-text-bold-duotone
//    - Penilaian: solar:diploma-verified-bold-duotone
//    - Feedback & Saran: solar:chat-round-dots-bold-duotone
//    - Reminder: solar:bell-bing-bold-duotone
//    - User Management: solar:settings-bold-duotone
//
// 2. IKON DASHBOARD & METRIK:
//    - Total Kehadiran: solar:calendar-mark-bold-duotone
//    - Nilai Evaluasi Akhir: solar:star-bold
//    - Program Magang: solar:shield-check-bold-duotone
//    - Rekap Kehadiran (Donut): solar:pie-chart-2-bold-duotone
//    - Aspek Kinerja (Bar): solar:chart-2-bold-duotone
//
// 3. IKON PRESENSI & LOKASI GPS:
//    - Peta Lokasi Presensi: solar:map-point-wave-bold (Warna Biru Pertamina #004F9F)
//    - Titik Koordinat GPS: solar:map-point-bold-duotone / solar:map-bold-duotone
//    - Deteksi Ulang GPS: solar:restart-bold
//    - Form Izin: solar:document-add-bold-duotone
//    - Peringatan Keterlambatan: solar:info-circle-bold-duotone
// ======================================================================

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
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
    // UTAMA (Admin only - hidden from EMPLOYEESTAFF)
    // ----------------------------------------------------------------------
    {
      subheader: 'Utama',
      items: [
        { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard, roles: roleAdmin },
        { title: 'Peserta', path: paths.dashboard.peserta, icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />, roles: roleAdmin },
        { title: 'Mentor', path: paths.dashboard.mentor, icon: <Iconify icon="solar:user-id-bold-duotone" />, roles: roleAdmin },
        { title: 'Presensi', path: paths.dashboard.presensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: roleAdmin },
      ],
    },

    // EVALUASI (Admin only - hidden from EMPLOYEESTAFF)
    // ----------------------------------------------------------------------
    {
      subheader: 'Evaluasi',
      items: [
        { title: 'Evaluasi Peserta', path: paths.dashboard.evaluasiPeserta, icon: <Iconify icon="solar:clipboard-list-bold-duotone" />, roles: roleAdmin },
      ],
    },

    // PUSAT INFORMASI (Admin only - hidden from EMPLOYEESTAFF)
    // ----------------------------------------------------------------------
    {
      subheader: 'Pusat Informasi',
      items: [
        { title: 'Feedback', path: paths.dashboard.feedback, icon: <Iconify icon="solar:chat-round-dots-bold-duotone" />, roles: roleAdmin },
        { title: 'Reminder', path: paths.dashboard.reminder, icon: <Iconify icon="solar:bell-bing-bold-duotone" />, roles: roleAdmin },
      ],
    },

    // MENTOR MENU - UTAMA
    // ----------------------------------------------------------------------
    {
      subheader: 'Utama',
      items: [
        { title: 'Dashboard', path: paths.dashboard.mentorDashboard, icon: ICONS.dashboard, roles: ['EMPLOYEESTAFF'] },
        { title: 'Data Bimbingan', path: paths.dashboard.dataBimbingan, icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Presensi', path: paths.dashboard.mentorPresensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Laporan', path: paths.dashboard.mentorLaporan, icon: <Iconify icon="solar:document-text-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
        { title: 'Penilaian', path: paths.dashboard.mentorPenilaian, icon: <Iconify icon="solar:diploma-verified-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
      ],
    },

    // MENTOR MENU - REKAPITULASI
    // ----------------------------------------------------------------------
    {
      subheader: 'Rekapitulasi',
      items: [
        { title: 'Rekap Akhir', path: paths.dashboard.mentorRekap, icon: <Iconify icon="solar:clipboard-check-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
      ],
    },

    // MENTOR MENU - PUSAT INFORMASI
    // ----------------------------------------------------------------------
    {
      subheader: 'Pusat Informasi',
      items: [
        { title: 'Reminder', path: paths.dashboard.mentorReminder, icon: <Iconify icon="solar:bell-bing-bold-duotone" />, roles: ['EMPLOYEESTAFF'] },
      ],
    },

    // VP MENU - APPROVAL
    // ----------------------------------------------------------------------
    {
      subheader: 'Approval',
      items: [
        {
          title: 'Approval Evaluasi',
          path: paths.dashboard.vpApproval,
          icon: <Iconify icon="solar:shield-check-bold-duotone" />,
          roles: ['EMPLOYEE'],
        },
      ],
    },

    // PESERTA MENU - UTAMA
    // ----------------------------------------------------------------------
    {
      subheader: 'Utama',
      items: [
        { title: 'Dashboard', path: paths.dashboard.pesertaDashboard, icon: ICONS.dashboard, roles: ['PESERTA'] },
        { title: 'Presensi', path: paths.dashboard.pesertaPresensi, icon: <Iconify icon="solar:calendar-date-bold-duotone" />, roles: ['PESERTA'] },
        { title: 'Laporan', path: paths.dashboard.pesertaLaporan, icon: <Iconify icon="solar:document-text-bold-duotone" />, roles: ['PESERTA'] },
      ],
    },
    // PESERTA MENU - EVALUASI
    // ----------------------------------------------------------------------
    {
      subheader: 'Evaluasi',
      items: [
        { title: 'Penilaian', path: paths.dashboard.pesertaPenilaian, icon: <Iconify icon="solar:diploma-verified-bold-duotone" />, roles: ['PESERTA'] },
      ],
    },
    // PESERTA MENU - FEEDBACK & SARAN
    // ----------------------------------------------------------------------
    {
      subheader: 'Feedback & Saran',
      items: [
        { title: 'Feedback', path: paths.dashboard.pesertaFeedback, icon: <Iconify icon="solar:chat-round-dots-bold-duotone" />, roles: ['PESERTA'] },
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
  const { user } = useAuthContext();
  const currentRole = user?.role || 'GUEST';

  const data = useMemo(() => {
    return navItem
      .map((group) => {
        const filteredItems = (group.items || [])
          .filter((item) => {
            if (item.roles && !item.roles.includes(currentRole)) {
              return false;
            }
            return true;
          })
          .map((item) => {
            if (item.children) {
              const filteredChildren = item.children.filter((child: any) => {
                if (child.roles && !child.roles.includes(currentRole)) {
                  return false;
                }
                return true;
              });
              return { ...item, children: filteredChildren };
            }
            return item;
          });

        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0);
  }, [currentRole]);

  return data;
}

export { navItem };
