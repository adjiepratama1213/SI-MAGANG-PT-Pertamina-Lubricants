import { m, MotionProps } from 'framer-motion';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
// theme
import { bgGradient } from 'src/theme/css';
//
import { MotionContainer, varFade } from 'src/components/animate';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AboutUsHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: (theme.palette as any).pertamina.main,
          endColor: (theme.palette as any).pertamina.dark,
        }),
        height: { xs: 400, md: 500 },
        py: { xs: 8, md: 0 },
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, ${alpha(theme.palette.common.white, 0.08)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container component={MotionContainer} sx={{ position: 'relative', height: '100%' }}>
        <Box
          sx={{
            bottom: { md: 80 },
            position: { md: 'absolute' },
            textAlign: { xs: 'center', md: 'left' },
            width: '100%',
          }}
        >
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Box
              component={m.div}
              variants={varFade().inDown}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.5,
                py: 1,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.common.white, 0.15),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                mb: 2,
              }}
            >
              <Iconify icon="eva:info-fill" width={24} sx={{ color: 'common.white' }} />
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'common.white',
                  letterSpacing: 1.5,
                }}
              >
                TENTANG KAMI
              </Typography>
            </Box>

            <TextAnimate
              sx={{
                typography: { xs: 'h3', md: 'h1' },
                fontWeight: 800,
                color: 'common.white',
                lineHeight: 1.2,
              }}
              text="Tentang POST IT"
              variants={varFade().inRight}
            />

            <Typography
              component={m.div}
              variants={varFade().inRight}
              sx={{
                typography: { xs: 'body1', md: 'h6' },
                color: alpha(theme.palette.common.white, 0.9),
                maxWidth: { md: 600 },
                lineHeight: 1.8,
              }}
            >
              Platform terintegrasi untuk manajemen dokumentasi dan kolaborasi tim di Pertamina Lubricants
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

type TextAnimateProps = BoxProps &
  MotionProps & {
    text: string;
  };

function TextAnimate({ text, variants, sx, ...other }: TextAnimateProps) {
  return (
    <Box
      component={m.div}
      sx={{
        overflow: 'hidden',
        display: 'inline-block',
        ...sx,
      }}
      {...other}
    >
      <m.span variants={variants || varFade().inUp}>{text}</m.span>
    </Box>
  );
}
