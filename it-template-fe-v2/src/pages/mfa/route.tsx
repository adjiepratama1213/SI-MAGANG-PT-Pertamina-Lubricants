import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
// layouts
// components
import { LoadingScreen } from 'src/components/loading-screen';

import AuthCompactLayout from '../auth/compact-auth-layout';
import PageMFAReset from './reset';
import PageMFASetup from './setup';
import PageMFAValidation from './validation';
import PageMFAVerify from './verify';

// ----------------------------------------------------------------------

export const mfaRoute: RouteObject[] = [
  {
    id: 'mfa',
    path: 'mfa',
    element: (
      // <AuthGuard>
      <AuthCompactLayout title="Multi Factor Authentication">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </AuthCompactLayout>
      // </AuthGuard>
    ),
    children: [
      { element: <PageMFASetup />, index: true },
      { path: 'setup', element: <PageMFASetup /> },
      { path: 'verify', element: <PageMFAVerify /> },
      { path: 'validation', element: <PageMFAValidation /> },
      { path: 'reset', element: <PageMFAReset /> },
    ],
  },
];
