// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { RouterLink } from 'src/components/router-link';
import { usePathname } from 'src/hooks/use-pathname';
// components
import { Logo } from 'src/components/logo';
import { paths } from 'src/pages/paths';

// ----------------------------------------------------------------------

const LINKS = [
  // {
  //   headline: 'Minimal',
  //   children: [
  //     { name: 'About us', href: paths.about },
  //     { name: 'Contact us', href: paths.contact },
  //     { name: 'FAQs', href: paths.faqs },
  //   ],
  // },
  {
    headline: 'Legal',
    children: [
      // { name: 'Terms and Condition', href: '#' },
      { name: 'Privacy Policy', href: paths.privacyPolicy.root },
    ],
  },
  {
    headline: 'Contact',
    children: [{ name: '135', href: 'tel:135' }],
    // children: [{ name: 'IT Pertamina Lubricants', href: paths.waSystem }],
  },
];

// ----------------------------------------------------------------------

export default function Footer() {
  const pathname = usePathname();

  const isHome = pathname === '/';

  const simpleFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
        minHeight: '150px',
      }}
    >
      <Container>
        <Grid container justifyContent="space-between">
          <Grid xs={4} md={4}>
            <Logo sx={{ mt: 2, mx: 'auto' }} />
          </Grid>
          <Grid xs={8} md={8} sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', md: 'block' },
                mx: { xs: 'auto', md: 'unset' },
                mt: 1.5,
              }}
            >
              POST is a portal designed to streamline access to all of your team&apos;s
              documentation.
            </Typography>

            <Typography variant="caption" component="div" sx={{ mt: { xs: 4, md: 1 } }}>
              2024 © All rights reserved
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Divider />

      <Container
        sx={{
          pt: 10,
          pb: 5,
          textAlign: { xs: 'center', md: 'unset' },
        }}
      >
        <Logo sx={{ mb: 3, display: { xs: 'none', md: 'block' } }} />

        <Grid container justifyContent="space-between">
          <Grid xs={8} md={3}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 270,
                display: { xs: 'none', md: 'block' },
                mx: { xs: 'auto', md: 'unset' },
                mt: 3,
              }}
            >
              POST is a portal designed to streamline access to all of your team&apos;s
              documentation.
            </Typography>
          </Grid>

          <Grid
            xs={12}
            md={6}
            sx={{
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Stack spacing={5} direction={{ xs: 'column', md: 'row' }}>
              {LINKS.map((list) => (
                <Stack
                  key={list.headline}
                  spacing={2}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                  sx={{ width: 1 }}
                >
                  <Typography component="div" variant="overline">
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      color="inherit"
                      variant="body2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mt: { xs: 0, md: 10 } }}>
          © 2024. All rights reserved
        </Typography>
      </Container>
    </Box>
  );

  return isHome ? simpleFooter : mainFooter;
}
