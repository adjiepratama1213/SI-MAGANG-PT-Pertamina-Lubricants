import { Suspense } from 'react';
import { Outlet, RouteObject } from 'react-router-dom';
// auth
import { GuestGuard } from 'src/auth/guard';
// layouts

// components
import { SplashScreen } from 'src/components/loading-screen';

import ForgotPasswordPage from './forgot-password';
import AuthClassicLayout from './layout';
import LoginPage from './login';
import RegisterPage from './register';
import VerificationPage from './verification';

// ----------------------------------------------------------------------

export const authRoutes: RouteObject[] = [
  {
    id: 'auth',
    path: 'auth',
    element: (
      <GuestGuard>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </GuestGuard>
    ),

    children: [
      {
        path: 'login',
        element: (
          <AuthClassicLayout title="POST IT" subTitle="Pertamina On Single Tab">
            <LoginPage />
          </AuthClassicLayout>
        ),
      },
      {
        path: 'register',
        element: (
          <AuthClassicLayout title="Register">
            <RegisterPage />
          </AuthClassicLayout>
        ),
      },
      {
        path: 'verify-email',
        element: (
          <AuthClassicLayout title="Email Verification">
            <VerificationPage />
          </AuthClassicLayout>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <AuthClassicLayout>
            <ForgotPasswordPage />
          </AuthClassicLayout>
        ),
      },
    ],
  },
];
