import { Link as RouterLink } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
// hooks & paths
import { useAuthContext } from 'src/auth/hooks';
import { paths } from 'src/pages/paths';
import { PERTAMINA_TOKENS } from 'src/theme/palette';

// ----------------------------------------------------------------------

interface Props {
  current?: string;
  parent?: string;
  parentHref?: string;
  links?: { name: string; href?: string }[];
  sx?: SxProps<Theme>;
}

export default function DashboardBreadcrumbs({ current, parent, parentHref, links, sx }: Props) {
  const { user } = useAuthContext();
  const BRAND_NAVY = PERTAMINA_TOKENS.navy;

  const dashboardPath = user?.role === 'PESERTA'
    ? paths.dashboard.pesertaDashboard
    : user?.role === 'EMPLOYEESTAFF'
      ? paths.dashboard.mentorDashboard
      : paths.dashboard.root;

  const isProfile = current?.toLowerCase() === 'profil' || current?.toLowerCase() === 'profile';

  return (
    <Breadcrumbs
      separator={
        <Box
          component="span"
          sx={{
            color: '#64748B',
            fontSize: '0.85rem',
            fontWeight: 600,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {'>'}
        </Box>
      }
      sx={{
        mb: 1.5,
        pt: 0,
        '& .MuiBreadcrumbs-separator': {
          mx: 0.75,
        },
        ...sx,
      }}
    >
      {isProfile ? (
        <Link
          component={RouterLink}
          to={dashboardPath}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'text.secondary',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'color 0.2s',
            '&:hover': { color: BRAND_NAVY, textDecoration: 'underline' },
          }}
        >
          dashboard
        </Link>
      ) : parent ? (
        parentHref ? (
          <Link
            component={RouterLink}
            to={parentHref}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.2s',
              '&:hover': { color: BRAND_NAVY, textDecoration: 'underline' },
            }}
          >
            {parent}
          </Link>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {parent}
          </Typography>
        )
      ) : null}

      <Typography
        variant="body2"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {isProfile ? 'Profil' : current || 'Dashboard'}
      </Typography>
    </Breadcrumbs>
  );
}
