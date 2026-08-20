import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardLayout from '../dashboard/layout';
import ListPage from './list';


// ----------------------------------------------------------------------

export const userMgmtRoutes: RouteObject[] = [
  {
    id: 'user-mgmt',
    path: 'user-management',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'admin', element: <ListPage defaultRole="SUPERSAIYAN" /> },
      { path: 'vp', element: <ListPage defaultRole="EMPLOYEE" /> },
      { path: 'mentor', element: <ListPage defaultRole="EMPLOYEESTAFF" /> },
      { path: 'peserta', element: <ListPage defaultRole="PESERTA" /> },

      // { path: 'settings', element: <PageSettings /> },
      // { path: 'settings', element: <PageSettings /> },
    ],
  },
];
