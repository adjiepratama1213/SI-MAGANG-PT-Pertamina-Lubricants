import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import DashboardLayout from '../dashboard/layout';
import ExtensionPage from './extension-page';

// ----------------------------------------------------------------------

export const extensionRoutes: RouteObject[] = [
  {
    id: 'extension',
    path: 'extension',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [{ element: <ExtensionPage />, index: true }],
  },
];

