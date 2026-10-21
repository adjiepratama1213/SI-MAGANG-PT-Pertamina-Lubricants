// @mui
import Box from '@mui/material/Box';
// routes
import { usePathname } from 'src/hooks/use-pathname';
//
import { HEADER } from '../config-layout';
import Footer from './footer';
import Header from './header';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: `${HEADER.H_MOBILE}px`, md: `${HEADER.H_DESKTOP}px` },
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}
