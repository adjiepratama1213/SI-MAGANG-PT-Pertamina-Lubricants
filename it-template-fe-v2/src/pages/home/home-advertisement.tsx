import { m } from 'framer-motion';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
// theme
import { bgGradient } from 'src/theme/css';
// components
import Iconify from 'src/components/iconify';
import { MotionViewport, varFade } from 'src/components/animate';
import { paths } from '../paths';

// ----------------------------------------------------------------------

export default function HomeAdvertisement() {
  const theme = useTheme();

  const renderDescription = (
    <Stack
      spacing={3}
      sx={{
        textAlign: {
          xs: 'center',
          md: 'left',
        },
        flex: 1,
        py: { xs: 2, md: 4 },
      }}
    >
      <Box>
        <Typography
          component={m.div}
          variants={varFade().inDown}
          sx={{
            mb: 1.5,
            color: 'common.white',
            typography: { xs: 'h4', md: 'h2' },
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          Akses Semua Aplikasi
          <br />
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              mt: 0.5,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.75) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            dalam Satu Platform
          </Box>
        </Typography>

        <Typography
          component={m.div}
          variants={varFade().inDown}
          sx={{
            color: alpha(theme.palette.common.white, 0.95),
            typography: { xs: 'caption', md: 'h6' },
            fontWeight: 400,
            maxWidth: { md: 520 },
            lineHeight: 1.8,
            mb: { xs: 3, md: 5 },
          }}
        >
          Kelola semua dokumentasi, kolaborasi tim, dan akses aplikasi penting dalam satu platform
          yang aman, efisien, dan mudah digunakan.
        </Typography>

        <Box
          component={m.div}
          variants={varFade().inDown}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 2,
          }}
        >
          {[
            { label: 'Bank Data', icon: 'eva:file-text-fill' },
            { label: 'Kolaborasi Real-time', icon: 'eva:sync-fill' },
            { label: 'AI-Powered', icon: 'eva:flash-fill' },
            { label: 'Secure & Trusted', icon: 'eva:shield-fill' },
          ].map((tag) => (
            <Box
              key={tag.label}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 0.75,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
              }}
            >
              <Iconify icon={tag.icon} width={16} sx={{ color: 'common.white', mr: 1 }} />
              <Typography
                variant="caption"
                sx={{ color: 'common.white', fontWeight: 600, fontSize: '0.75rem' }}
              >
                {tag.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Stack
        component={m.div}
        variants={varFade().inRight}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        sx={{ pt: 1 }}
      >
        <Button
          color="inherit"
          size="large"
          variant="contained"
          target="_self"
          rel="noopener"
          href={paths.auth.login}
          endIcon={<Iconify icon="eva:arrow-forward-fill" width={20} />}
          sx={{
            color: (theme.palette as any).pertamina?.main || theme.palette.primary.main,
            bgcolor: 'common.white',
            fontWeight: 700,
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.common.white, 0.95),
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.25)}`,
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Login Sekarang
        </Button>

        <Button
          color="inherit"
          size="large"
          variant="outlined"
          target="_self"
          rel="noopener"
          href={paths.auth.register}
          endIcon={<Iconify icon="eva:person-add-fill" width={20} />}
          sx={{
            color: 'common.white',
            borderColor: alpha(theme.palette.common.white, 0.5),
            borderWidth: 2,
            fontWeight: 600,
            fontSize: '1rem',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.common.white, 0.1),
            '&:hover': {
              borderColor: 'common.white',
              bgcolor: alpha(theme.palette.common.white, 0.2),
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Daftar Akun
        </Button>
      </Stack>
    </Stack>
  );

  const renderImg = (
    <Box
      component={m.div}
      variants={varFade().inUp}
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: 280, md: 400 },
        width: { xs: '100%', md: 'auto' },
        flex: { md: '0 0 460px' },
        overflow: 'visible',
      }}
    >
      {/* Animated background circles */}
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 250, md: 350 },
          height: { xs: 250, md: 350 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.15)} 0%, transparent 70%)`,
          animation: 'pulse 3s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              transform: 'scale(1)',
              opacity: 0.5,
            },
            '50%': {
              transform: 'scale(1.15)',
              opacity: 0.2,
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: { xs: 180, md: 260 },
          height: { xs: 180, md: 260 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
          animation: 'pulse 2.5s ease-in-out infinite',
          animationDelay: '0.5s',
        }}
      />

      {/* Rocket image */}
      <Box
        component="img"
        loading="eager"
        decoding="async"
        alt="rocket illustration"
        src="/assets/images/home/illustration-rocket-large.png"
        sx={{
          position: 'absolute',
          top: { xs: -80, md: -80 },
          right: { xs: -40, md: -60 },
          width: { xs: 320, md: 400 },
          height: 'auto',
          display: 'block',
          zIndex: 10,
          objectFit: 'contain',
          minWidth: { md: 400 },
          transformOrigin: 'top right',
          filter:
            'drop-shadow(0 30px 60px rgba(0,0,0,0.4)) drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
          animation: {
            xs: 'float 3s ease-in-out infinite',
            md: 'floatLarge 3s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
            },
            '50%': {
              transform: 'translateY(-30px) rotate(3deg)',
            },
          },
          '@keyframes floatLarge': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg) scale(1.3)',
            },
            '50%': {
              transform: 'translateY(-30px) rotate(3deg) scale(1.3)',
            },
          },
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: { xs: 'translateY(-10px) scale(1.05)', md: 'translateY(-10px) scale(1.35)' },
            filter:
              'drop-shadow(0 40px 80px rgba(0,0,0,0.5)) drop-shadow(0 15px 30px rgba(0,0,0,0.4))',
          },
        }}
      />
    </Box>
  );

  return (
    <Container component={MotionViewport} maxWidth="xl">
      <Card
        sx={{
          position: 'relative',
          overflow: 'visible',
          ...bgGradient({
            direction: '135deg',
            startColor: (theme.palette as any).pertamina?.main || theme.palette.primary.main,
            endColor: (theme.palette as any).pertamina?.dark || theme.palette.primary.dark,
          }),
          borderRadius: { xs: 2, md: 4 },
          p: { xs: 4, md: 6 },
          boxShadow: `0 20px 60px ${alpha((theme.palette as any).pertamina?.main || theme.palette.primary.main, 0.3)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at top right, ${alpha(theme.palette.common.white, 0.15)} 0%, transparent 60%),
                         radial-gradient(circle at bottom left, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 60%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack
          alignItems="center"
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 6 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {renderImg}
          {renderDescription}
        </Stack>
      </Card>
    </Container>
  );
}
