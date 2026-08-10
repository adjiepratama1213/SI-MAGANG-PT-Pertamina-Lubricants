import { Suspense } from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router-dom';
// config
//

import App from 'src/App';
import FullMainLayout from 'src/layouts/main/full-layout';
import { authRoutes } from 'src/pages/auth/route';
import { GuestGuard } from 'src/auth/guard';
import { dashboardRoutes } from 'src/pages/dashboard/route';
import { userMgmtRoutes } from 'src/pages/user-mgmt/route';
import { teamMgmtRoutes } from 'src/pages/team-mgmt/route';
import { SplashScreen } from 'src/components/loading-screen';
import MainLayout from 'src/layouts/main/layout';
import { RootBoundary } from './error';
import View404 from './error/404';
import CompactLayout from './layout';
import { userRoutes } from './user/route';
import { mfaRoute } from './mfa/route';
import PrivacyPage from './privacy-policy/privacy-policy';
import WelcomePage from './home/welcome-page';
import AboutUsPage from './privacy-policy/about-us';
import UserManualPage from './user-manual/user-manual';
import { extensionRoutes } from './extension/route';

// ----------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    id: 'root',
    Component: App,
    errorElement: <RootBoundary />,
    children: [
      {
        element: (
          <GuestGuard>
            <Suspense fallback={<SplashScreen />}>
              <MainLayout>
                <Outlet />
              </MainLayout>
            </Suspense>
          </GuestGuard>
        ),
        children: [{ index: true, element: <WelcomePage /> }],
      },
      {
        element: (
          <MainLayout>
            <Outlet />
          </MainLayout>
        ),
        children: [{ path: '404', element: <View404 /> }],
      },

      // Auth routes
      ...authRoutes,
      ...mfaRoute,

      ...userRoutes,

      // Dashboard routes
      ...dashboardRoutes,

      {
        element: (
          <CompactLayout>
            <Outlet />
          </CompactLayout>
        ),
        children: [{ path: '404', element: <View404 /> }],
      },

      {
        element: (
          <FullMainLayout>
            <Outlet />
          </FullMainLayout>
        ),
        children: [
          { path: 'privacy-policy', element: <PrivacyPage /> },
          { path: 'about-us', element: <AboutUsPage /> },
          { path: 'user-manual', element: <UserManualPage /> },
        ],
      },

      ...userMgmtRoutes,
      ...teamMgmtRoutes,
      ...extensionRoutes,

      // No match 404
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
