import { PATH_AFTER_LOGIN } from 'src/config-global';
import { paths } from 'src/pages/paths';

export function pathAfterLogin(_role?: string) {
  if (_role === 'EMPLOYEESTAFF') {
    return paths.dashboard.mentorDashboard;
  }
  if (_role === 'PESERTA') {
    return paths.dashboard.pesertaDashboard;
  }
  if (_role === 'EMPLOYEE') {
    return paths.dashboard.vpApproval;
  }
  return PATH_AFTER_LOGIN;
}
