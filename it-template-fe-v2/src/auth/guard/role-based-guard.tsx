import { m } from 'framer-motion';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
// hooks
// assets
import { ForbiddenIllustration } from 'src/assets/illustrations';
// components
import { useCallback, useEffect, useState } from 'react';
import { MotionContainer, varBounce } from 'src/components/animate';
import { useRouter } from 'src/hooks/use-router';
import { pathAfterLogin } from 'src/utils/path-after-login';
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export function PermissionDenied({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Container component={MotionContainer} sx={{ textAlign: 'center', ...sx }}>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Permission Denied
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'text.secondary' }}>
          You do not have permission to access this page
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <ForbiddenIllustration
          sx={{
            height: 260,
            my: { xs: 5, sm: 10 },
          }}
        />
      </m.div>
    </Container>
  );
}

type RoleBasedGuardProp = {
  hasContent?: boolean;
  roles: string[];
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  isRoute?: boolean;
};

export default function RoleBasedGuard({
  hasContent,
  roles,
  children,
  sx,
  isRoute,
}: RoleBasedGuardProp) {
  // Logic here to get current user role
  const { user } = useAuthContext();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const currentRole = user?.role; // admin;

  const check = useCallback(() => {
    if (typeof roles !== 'undefined' && !roles.includes(currentRole)) {
      if (isRoute) {
        return router.replace(pathAfterLogin(currentRole));
      }
  
      return hasContent ? <PermissionDenied sx={sx} /> : null;
    }
  
    setChecked(true);
    return null; // Ensure a value is returned
  }, [roles, currentRole, isRoute, hasContent, sx, router]);  

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <> {children} </>;
}
