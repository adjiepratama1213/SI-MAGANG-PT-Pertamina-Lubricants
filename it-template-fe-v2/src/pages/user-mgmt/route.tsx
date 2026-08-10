import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardLayout from '../dashboard/layout';
import ListPage from './list';
import UserCreatePage from './new';
import UserEditPage from './edit';

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
      { element: <ListPage />, index: true },
      { path: 'new', element: <UserCreatePage /> },
      { path: 'edit/:id', element: <UserEditPage /> },
      // { path: 'settings', element: <PageSettings /> },
      // { path: 'settings', element: <PageSettings /> },
    ],
  },
];
