import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardLayout from '../dashboard/layout';
import ListPage from './list';
import TeamCreatePage from './new';
import TeamEditPage from './edit';

// ----------------------------------------------------------------------

export const teamMgmtRoutes: RouteObject[] = [
  {
    id: 'team-mgmt',
    path: 'team-management',
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
      { element: <ListPage />, index: true },
      { path: 'new', element: <TeamCreatePage /> },
      { path: 'edit/:id', element: <TeamEditPage /> },
      // { path: 'settings', element: <PageSettings /> },
      // { path: 'settings', element: <PageSettings /> },
    ],
  },
];
