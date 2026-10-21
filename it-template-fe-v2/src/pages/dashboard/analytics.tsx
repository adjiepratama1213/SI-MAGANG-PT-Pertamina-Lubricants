import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/pages/paths';
import { OverviewAppView } from './app/view';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'EMPLOYEESTAFF') {
      navigate(paths.dashboard.mentorDashboard, { replace: true });
    } else if (user?.role === 'PESERTA') {
      navigate(paths.dashboard.pesertaDashboard, { replace: true });
    } else if (user?.role === 'EMPLOYEE') {
      navigate(paths.dashboard.vpApproval, { replace: true });
    }
  }, [user, navigate]);
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
