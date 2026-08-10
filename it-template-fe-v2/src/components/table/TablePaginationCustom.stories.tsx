import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TablePaginationCustom from './table-pagination-custom';

const meta: Meta<typeof TablePaginationCustom> = {
  title: 'Components/Data Display/Table/TablePaginationCustom',
  component: TablePaginationCustom,
  tags: ['autodocs'],
  argTypes: {
    dense: { control: 'boolean' },
  },
};

function TablePaginationWrapper(props: any) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  return (
    <TablePaginationCustom
      count={100}
      page={page}
      onPageChange={(_, p) => setPage(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      {...props}
    />
  );
}

export default meta;

type Story = StoryObj<typeof TablePaginationCustom>;

export const Default: Story = {
  render: () => <TablePaginationWrapper />,
};

export const WithDense: Story = {
  render: () => (
    <TablePaginationWrapper
      dense
      onChangeDense={() => {}}
    />
  ),
};
