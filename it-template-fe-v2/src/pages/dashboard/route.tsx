import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';
import { rolePTPL } from 'src/config-global';
import DashboardLayout from './layout';
import OverviewAnalyticsPage from './analytics';
import PesertaPage from './peserta/page';
import MentorPage from './mentor/page';
import PresensiPage from './presensi/page';
import PenilaianPage from './penilaian/page';
import LaporanPage from './laporan/page';
import ReminderPage from './reminder/page';
import FeedbackPage from './feedback/page';
// Mentor-specific pages
import MentorDashboardPage from './mentor-dashboard/page';
import DataBimbinganPage from './data-bimbingan/page';
import MentorPresensiPage from './mentor-presensi/page';
import MentorPenilaianPage from './mentor-penilaian/page';
import MentorLaporanPage from './mentor-laporan/page';
import MentorReminderPage from './mentor-reminder/page';
import MentorRekapPage from './mentor-rekap/page';

// Peserta-specific pages
import PesertaDashboardPage from './peserta-dashboard/page';
import PesertaPresensiPage from './peserta-presensi/page';
import PesertaPenilaianPage from './peserta-penilaian/page';
import PesertaLaporanPage from './peserta-laporan/page';

// ----------------------------------------------------------------------

export const dashboardRoutes: RouteObject[] = [
  {
    id: 'dashboard',
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <RoleBasedGuard hasContent roles={rolePTPL} isRoute>
              <Outlet />
            </RoleBasedGuard>
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { element: <OverviewAnalyticsPage />, index: true },
      { path: 'peserta', element: <PesertaPage /> },
      { path: 'mentor', element: <MentorPage /> },
      { path: 'presensi', element: <PresensiPage /> },
      { path: 'penilaian', element: <PenilaianPage /> },
      { path: 'laporan', element: <LaporanPage /> },
      { path: 'reminder', element: <ReminderPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
      // Mentor-specific routes
      { path: 'mentor-dashboard', element: <MentorDashboardPage /> },
      { path: 'data-bimbingan', element: <DataBimbinganPage /> },
      { path: 'mentor-presensi', element: <MentorPresensiPage /> },
      { path: 'mentor-penilaian', element: <MentorPenilaianPage /> },
      { path: 'mentor-laporan', element: <MentorLaporanPage /> },
      { path: 'mentor-reminder', element: <MentorReminderPage /> },
      { path: 'mentor-rekap', element: <MentorRekapPage /> },
      // Peserta-specific routes
      { path: 'peserta-dashboard', element: <PesertaDashboardPage /> },
      { path: 'peserta-presensi', element: <PesertaPresensiPage /> },
      { path: 'peserta-penilaian', element: <PesertaPenilaianPage /> },
      { path: 'peserta-laporan', element: <PesertaLaporanPage /> },
      //   { path: 'realization', element: <PagePostCreation /> },
      //   { path: 'realization/:id', element: <PagePostDetail /> },
    ],
  },
];

