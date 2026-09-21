// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
// auth
import { useAuthContext } from 'src/auth/hooks';
// routes
import { RouterLink } from 'src/components/router-link';
import { paths } from 'src/pages/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// theme
import { bgGradient } from 'src/theme/css';
// components
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

const METHODS = [
  {
    id: 'jwt',
    label: 'Jwt',
    path: paths.auth.login,
    icon: '/assets/icons/auth/ic_jwt.svg',
  },
];

type Props = {
  title?: string;
  subTitle?: string;
  image?: string;
  children: React.ReactNode;
};

export default function AuthClassicLayout({ children, image, title, subTitle }: Props) {
  const { method } = useAuthContext();

  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const authTheme = createTheme(theme, {
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'Inter, Poppins, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 50,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 4px 14px 0 rgba(16, 98, 172, 0.39)',
            padding: '10px 24px',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(16, 98, 172, 0.23)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            background: 'linear-gradient(135deg, #1062AC 0%, #009FE3 100%)',
            color: 'white',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-focused': {
              backgroundColor: '#fff',
              boxShadow: '0 0 0 3px rgba(16, 98, 172, 0.15)',
            }
          },
        },
      },
    },
  });

  const renderLogo = (
    <Logo
      sx={{
        zIndex: 9,
        position: 'absolute',
        m: { xs: 2, md: 5 },
        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))',
      }}
    />
  );

  const renderContent = (
    <Stack
      justifyContent="center"
      sx={{
        width: { xs: 1, md: '50%' },
        mx: 'auto',
        maxWidth: 520,
        px: { xs: 4, md: 8 },
        pt: { xs: 10, md: 8 },
        pb: { xs: 15, md: 8 },
        minHeight: '100vh',
        bgcolor: '#ffffff',
      }}
    >
      {children}
    </Stack>
  );

  const renderSection = (
    <Stack
      flexGrow={1}
      spacing={5}
      alignItems="center"
      justifyContent="center"
      sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 50%, rgba(16, 98, 172, 0.08), transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(237, 50, 55, 0.08), transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(141, 198, 63, 0.08), transparent 50%)
          `,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ zIndex: 1, textAlign: 'center', px: 5 }}>
        <Typography variant="h3" sx={{ maxWidth: 480, mx: 'auto', mb: 2, color: 'text.primary', fontWeight: 800 }}>
          {title || 'Hi, Welcome back'}
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 480, mx: 'auto', color: 'text.secondary' }}>
          {subTitle || ''}
        </Typography>
      </Box>

      <Box
        component="img"
        alt="auth"
        src={image || '/assets/illustrations/post_it_bg.png'}
        sx={{
          zIndex: 1,
          maxWidth: {
            xs: 480,
            lg: 560,
            xl: 720,
          },
          filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.15))',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-10px)',
          }
        }}
      />

      <Stack direction="row" spacing={2}>
        {METHODS.map((option) => (
          <Tooltip key={option.label} title={option.label}>
            <Link component={RouterLink} href={option.path}>
              <Box
                component="img"
                alt={option.label}
                src={option.icon}
                sx={{
                  width: 32,
                  height: 32,
                  ...(method !== option.id && {
                    filter: 'grayscale(100%)',
                  }),
                }}
              />
            </Link>
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );

  return (
    <ThemeProvider theme={authTheme}>
      <Stack
        component="main"
        direction="row"
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        {renderLogo}

        {mdUp && renderSection}

        {renderContent}
      </Stack>
    </ThemeProvider>
  );
}
