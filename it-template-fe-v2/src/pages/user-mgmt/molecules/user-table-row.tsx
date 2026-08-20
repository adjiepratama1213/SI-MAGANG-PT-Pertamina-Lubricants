// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// types
import { IUserItem } from 'src/types/user';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import UserEditDialog from './user-edit-dialog';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}: Props) {
  const { name, Position, role, status, email } = row;

  const confirm = useBoolean();
  const editPopup = useBoolean();
  const quickView = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'primary.light', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 14 }}>
            {name ? name.substring(0, 2).toUpperCase() : 'US'}
          </Box>

          <ListItemText
            primary={name}
            secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'medium' }}>{Position?.Team?.name || '-'}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{email}</TableCell> */}

        <TableCell>
          <Label
            variant="soft"
            color={
              (role === 'EMPLOYEE' && 'success') ||
              (role === 'GUEST' && 'warning') ||
              (role === 'SUPERSAIYAN' && 'error') ||
              'default'
            }
          >
            {role}
          </Label>
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'banned' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton color="default" onClick={quickView.onTrue} sx={{ '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' } }}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton color="info" onClick={editPopup.onTrue} sx={{ '&:hover': { color: 'info.main', bgcolor: 'info.lighter' } }}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton color="error" onClick={confirm.onTrue} sx={{ '&:hover': { color: 'error.main', bgcolor: 'error.lighter' } }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserEditDialog userId={row.id} open={quickView.value} onClose={quickView.onFalse} isViewOnly />
      <UserEditDialog userId={row.id} open={editPopup.value} onClose={editPopup.onFalse} />



      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => { onDeleteRow(); confirm.onFalse(); }}>
            Delete
          </Button>
        }
      />
    </>
  );
}
