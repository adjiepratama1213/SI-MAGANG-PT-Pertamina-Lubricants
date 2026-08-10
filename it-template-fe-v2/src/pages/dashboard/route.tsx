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
      //   { path: 'realization', element: <PagePostCreation /> },
      //   { path: 'realization/:id', element: <PagePostDetail /> },
    ],
  },
];
