import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
//
import { router } from './pages/routes';
import { DEV_MODE } from './config-global';
import { DevModeBanner } from './components/banner/DevModeBanner';
import { AppSnackbarProvider } from './components/snackbar';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <HelmetProvider>
    <Suspense>
      <AppSnackbarProvider>
      {DEV_MODE && DEV_MODE !== 'production' && (
        <DevModeBanner devMode={DEV_MODE} />
      )}
      <RouterProvider router={router} />
      </AppSnackbarProvider>
    </Suspense>
  </HelmetProvider>
);
