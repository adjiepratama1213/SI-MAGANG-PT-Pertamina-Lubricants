import type { Meta, StoryObj } from '@storybook/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableHeadCustom from './table-head-custom';

const headLabel = [
  { id: 'name', label: 'Name', width: 180 },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'role', label: 'Role', width: 120 },
  { id: 'status', label: 'Status', align: 'center' as const },
];

const meta: Meta<typeof TableHeadCustom> = {
  title: 'Components/Data Display/Table/TableHeadCustom',
  component: TableHeadCustom,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TableContainer component={Paper} sx={{ maxWidth: 640 }}>
        <Table>
          <Story />
          <TableBody />
        </Table>
      </TableContainer>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableHeadCustom>;

export const Default: Story = {
  args: { headLabel },
};

export const WithSort: Story = {
  args: {
    headLabel,
    order: 'asc',
    orderBy: 'name',
    onSort: (id: string) => console.log('Sort', id),
  },
};

export const WithSelectAll: Story = {
  args: {
    headLabel,
    rowCount: 10,
    numSelected: 2,
    onSelectAllRows: (checked: boolean) => console.log('Select all', checked),
  },
};
