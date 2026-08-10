// routes
import { paths } from 'src/pages/paths';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navConfig = [
  // {
  //   title: 'About',
  //   icon: <Iconify icon="solar:home-2-bold-duotone" />,
  //   path: '#',
  // },
  {
    title: 'About Us',
    icon: <Iconify icon="eva:info-fill" />,
    path: paths.aboutUs.root,
  },
  {
    title: 'Privacy Policy',
    icon: <Iconify icon="eva:shield-fill" />,
    path: paths.privacyPolicy.root,
  },
];
