// @mui
import Collapse from '@mui/material/Collapse';
import { listClasses } from '@mui/material/List';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { listItemButtonClasses } from '@mui/material/ListItemButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { NavSectionVertical } from 'src/components/nav-section';
import { usePathname } from 'src/hooks/use-pathname';
//
import { NavItemProps } from '../types';
import NavItem from './nav-item';

// ----------------------------------------------------------------------

type NavListProps = {
  item: NavItemProps;
  onClose?: VoidFunction;
};

export default function NavList({ item, onClose }: NavListProps) {
  const pathname = usePathname();

  const { path, children } = item;

  const externalLink = path.includes('http');

  const nav = useBoolean();

  return (
    <>
      <NavItem
        item={item}
        open={nav.value}
        onClick={children ? nav.onToggle : undefined}
        active={pathname === path}
        externalLink={externalLink}
        onClose={onClose}
      />

      {!!children && (
        <Collapse in={nav.value} unmountOnExit>
          <NavSectionVertical
            data={children}
            sx={{
              [`& .${listClasses.root}`]: {
                '&:last-of-type': {
                  [`& .${listItemButtonClasses.root}`]: {
                    height: 160,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    bgcolor: 'background.neutral',
                    backgroundRepeat: 'no-repeat',
                    backgroundImage: 'url(/assets/illustrations/illustration_dashboard.png)',
                    [`& .${listItemTextClasses.root}`]: {
                      display: 'none',
                    },
                  },
                },
              },
            }}
          />
        </Collapse>
      )}
    </>
  );
}
