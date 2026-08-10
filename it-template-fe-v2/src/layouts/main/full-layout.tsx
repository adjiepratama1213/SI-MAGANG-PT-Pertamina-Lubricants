// @mui
import Box from '@mui/material/Box';
// routes
import { usePathname } from 'src/hooks/use-pathname';
//
import Footer from './footer';
import FullHeader from './full-header';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function FullMainLayout({ children }: Props) {
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <FullHeader />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ...(!isHome && {
            pt: { xs: 8, md: 10 },
          }),
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
}
