import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { OverviewAppView } from './app/view';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  useEffect(() => {
    const scheduleRefresh = () => {
      const now = new Date();
      const next6am = new Date();

      next6am.setHours(6, 0, 0, 0); // target jam 6 pagi

      // kalau sudah lewat 6 pagi, geser ke besok
      if (now >= next6am) {
        next6am.setDate(next6am.getDate() + 1);
      }

      const msUntil6am = next6am.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        window.location.reload();
      }, msUntil6am);

      return () => clearTimeout(timeout);
    };

    const cleanup = scheduleRefresh();
    return cleanup;
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard: Analytics</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
