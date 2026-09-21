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
import Divider from '@mui/material/Divider';
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
  onApproveRow?: VoidFunction;
  onRejectRow?: VoidFunction;
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onApproveRow,
  onRejectRow,
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

        <TableCell>
          <ListItemText
            primary={name}
            secondary={email}
            primaryTypographyProps={{ typography: 'subtitle2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.secondary',
              typography: 'body2',
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
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 180 }}
      >
        {status === 'pending' && onApproveRow && (
          <MenuItem
            onClick={() => {
              onApproveRow();
              popover.onClose();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="solar:check-circle-bold" />
            Terima Peserta
          </MenuItem>
        )}

        {status === 'pending' && onRejectRow && (
          <MenuItem
            onClick={() => {
              onRejectRow();
              popover.onClose();
            }}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="solar:close-circle-bold" />
            Tolak Peserta
          </MenuItem>
        )}

        {status === 'pending' && (onApproveRow || onRejectRow) && <Divider sx={{ borderStyle: 'dashed' }} />}

        <MenuItem
          onClick={() => {
            quickView.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Lihat Detail
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Hapus
        </MenuItem>
      </CustomPopover>

      <UserEditDialog userId={row.id} open={quickView.value} onClose={quickView.onFalse} isViewOnly />

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
