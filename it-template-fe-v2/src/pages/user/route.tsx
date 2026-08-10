import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardLayout from '../dashboard/layout';
import AccountPage from './account';
import PageSettings from './settings';

// ----------------------------------------------------------------------

export const userRoutes: RouteObject[] = [
  {
    id: 'user',
    path: 'user',
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
      { element: <AccountPage />, index: true },
      { path: 'settings', element: <PageSettings /> },
    ],
  },
];
