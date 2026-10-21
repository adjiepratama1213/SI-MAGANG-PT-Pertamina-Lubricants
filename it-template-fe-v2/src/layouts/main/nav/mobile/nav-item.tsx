// @mui
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// routes
import { useNavigate, useLocation } from 'react-router-dom';
import { RouterLink } from 'src/components/router-link';
// components
import Iconify from 'src/components/iconify';
//
import { NavItemMobileProps } from '../types';
import { ListItem } from './styles';

// ----------------------------------------------------------------------

export default function NavItem({
  item,
  open,
  active,
  externalLink,
  onClose,
  ...other
}: NavItemMobileProps) {
  const { title, path, icon, children } = item;
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (path.includes('#')) {
      const hash = path.split('#')[1];
      if (location.pathname === '/' || location.pathname === '') {
        e.preventDefault();
        navigate(`/#${hash}`);
        onClose?.();
        setTimeout(() => {
          if (hash === 'beranda') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const target = document.getElementById(hash);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 150);
        return;
      }
    }
    onClose?.();
  };

  const renderContent = (
    <ListItem active={active} {...other}>
      <ListItemIcon> {icon} </ListItemIcon>

      <ListItemText disableTypography primary={title} />

      {!!children && (
        <Iconify
          width={16}
          icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
          sx={{ ml: 1 }}
        />
      )}
    </ListItem>
  );

  // External link
  if (externalLink) {
    return (
      <Link href={path} target="_blank" rel="noopener" underline="none">
        {renderContent}
      </Link>
    );
  }

  // Has child
  if (children) {
    return renderContent;
  }

  // Default
  return (
    <Link component={RouterLink} href={path} underline="none" onClick={handleAnchorClick}>
      {renderContent}
    </Link>
  );
}
