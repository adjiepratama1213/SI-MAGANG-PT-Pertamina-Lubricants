import isEqual from 'lodash/isEqual';
import { useState, useCallback } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { useRouter } from 'src/hooks/use-router';
import { RouterLink } from 'src/components/router-link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
// _mock
import { _roles, USER_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// types
import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';
//
import { useDebounce } from 'src/hooks/use-debounce';
import { Stack, Box, Typography } from '@mui/material';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';
import UserTableRow from '../molecules/user-table-row';
import UserTableToolbar from '../molecules/user-table-toolbar';
import UserTableFiltersResult from '../molecules/user-table-filters-result';
import UserCreateDialog from '../molecules/user-create-dialog';
import { useSearchUsers } from '../query';
import { paths } from '../../paths';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'banned', label: 'Diblokir' },
  { value: 'rejected', label: 'Ditolak' }
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nama Pengguna' },
  { id: 'Team', label: 'Tim / Bagian', width: 220 },
  { id: 'role', label: 'Peran (Role)', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'aksi', label: 'Aksi', width: 140, align: 'center' },
];

type Props = {
  defaultRole?: string;
};

export default function UserListView({ defaultRole }: Props) {
  const defaultFilters: IUserTableFilters = {
    name: '',
    role: [],
    status: 'all',
  };

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();
  const createPopup = useBoolean();
  const [syncLoading, setSyncLoading] = useState(false);

  const debouncedQuery = useDebounce('');
  const { userSearchData } = useSearchUsers(debouncedQuery);

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: userSearchData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    defaultRole,
  });

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.userManagement.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSyncIdaman = async () => {
    setSyncLoading(true);
    try {
      await axiosInstance.post(`${endpoints.user.syncIdaman}`, {});

      console.info('Sync successful');
    } catch (error) {
      console.error('Error syncing Idaman:', error);
      // Handle the error as needed
    }
    setSyncLoading(false);
  };

  const queryClient = useQueryClient();

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await axiosInstance.delete(endpoints.user.edit(id));
        table.onUpdatePageDeleteRow(dataFiltered.length);
        queryClient.invalidateQueries({ queryKey: ['getUserRequestByTeam'] });
        toast.success('Pengguna berhasil dihapus');
      } catch (error) {
        console.error(error);
        toast.error('Gagal menghapus pengguna');
      }
    },
    [dataFiltered.length, table, queryClient]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(
        table.selected.map((id) => axiosInstance.delete(endpoints.user.edit(id)))
      );
      table.onUpdatePageDeleteRows({
        totalRows: userSearchData.length,
        totalRowsInPage: dataFiltered.length,
        totalRowsFiltered: dataFiltered.length,
      });
      queryClient.invalidateQueries({ queryKey: ['getUserRequestByTeam'] });
      confirm.onFalse();
      toast.success('Beberapa pengguna berhasil dihapus');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus pengguna');
    }
  }, [dataFiltered.length, table, userSearchData.length, confirm, queryClient]);

  const handleApproveRow = useCallback(
    async (id: string) => {
      try {
        await axiosInstance.patch(endpoints.user.edit(id), { status: 'active' });
        queryClient.invalidateQueries({ queryKey: ['getUserRequestByTeam'] });
        toast.success('Peserta berhasil diterima!');
      } catch (error) {
        console.error(error);
        toast.error('Gagal menerima peserta');
      }
    },
    [queryClient]
  );

  const handleRejectRow = useCallback(
    async (id: string) => {
      try {
        await axiosInstance.patch(endpoints.user.edit(id), { status: 'rejected' });
        queryClient.invalidateQueries({ queryKey: ['getUserRequestByTeam'] });
        toast.success('Peserta berhasil ditolak');
      } catch (error) {
        console.error(error);
        toast.error('Gagal menolak peserta');
      }
    },
    [queryClient]
  );


  return (
    <>
      <Container maxWidth="xl" sx={{ pb: 10, minHeight: '120vh' }}>
        {/* HEADER */}
        <Box sx={{ p: 4, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #004F9F 0%, #003366 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Iconify icon="solar:users-group-two-rounded-bold-duotone" width={28} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {defaultRole ? `Manajemen ${defaultRole.replace('SUPERSAIYAN', 'Admin').replace('EMPLOYEESTAFF', 'Mentor')}` : 'Manajemen Pengguna'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {defaultRole ? `Kelola data ${defaultRole.replace('SUPERSAIYAN', 'Admin').replace('EMPLOYEESTAFF', 'Mentor')} sistem` : 'Kelola seluruh akses, peran, dan data pengguna sistem'}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={handleSyncIdaman}
              variant="outlined"
              disabled={syncLoading}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, fontWeight: 'bold', px: 3 }}
              startIcon={
                syncLoading ? (
                  <Iconify
                    icon="mingcute:refresh-3-fill"
                    width={20}
                    height={20}
                    sx={{
                      animation: 'rotation 1s linear infinite',
                      '@keyframes rotation': {
                        from: { transform: 'rotate(0deg)' },
                        to: { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                ) : (
                  <Iconify icon="mingcute:refresh-3-fill" width={20} height={20} />
                )
              }
            >
              {syncLoading ? 'Syncing...' : 'Sync Idaman'}
            </Button>
            <Button
              onClick={createPopup.onTrue}
              variant="contained"
              sx={{ bgcolor: 'white', color: '#004F9F', '&:hover': { bgcolor: '#f1f5f9', boxShadow: '0px 4px 12px rgba(255,255,255,0.2)' }, fontWeight: 'bold', px: 3 }}
              startIcon={<Iconify icon="mingcute:add-line" width={20} />}
            >
              Pengguna Baru
            </Button>
          </Stack>
        </Box>

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => {
              const roleFilteredData = userSearchData.filter((user) => defaultRole ? user.role === defaultRole : true);
              return (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' && roleFilteredData.length}
                    {tab.value === 'active' &&
                      roleFilteredData.filter((user) => user.status === 'active').length}

                    {tab.value === 'pending' &&
                      roleFilteredData.filter((user) => user.status === 'pending').length}
                    {tab.value === 'banned' &&
                      roleFilteredData.filter((user) => user.status === 'banned').length}
                    {tab.value === 'rejected' &&
                      roleFilteredData.filter((user) => user.status === 'rejected').length}
                  </Label>
                }
              />
            )})}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_roles}
          />



          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={userSearchData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  userSearchData.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userSearchData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      userSearchData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onApproveRow={() => handleApproveRow(row.id)}
                        onRejectRow={() => handleRejectRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, userSearchData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
          >
            Delete
          </Button>
        }
      />

      <UserCreateDialog open={createPopup.value} onClose={createPopup.onFalse} defaultRole={defaultRole} />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
  defaultRole,
}: {
  inputData: IUserItem[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
  defaultRole?: string;
}) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (defaultRole) {
    inputData = inputData.filter((user) => user.role === defaultRole);
  } else if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}
