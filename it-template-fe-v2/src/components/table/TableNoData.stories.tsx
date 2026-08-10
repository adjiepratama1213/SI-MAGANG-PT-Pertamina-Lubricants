import type { Meta, StoryObj } from '@storybook/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableNoData from './table-no-data';

const meta: Meta<typeof TableNoData> = {
  title: 'Components/Data Display/Table/TableNoData',
  component: TableNoData,
  tags: ['autodocs'],
  argTypes: {
    notFound: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
        <Table>
          <TableBody>
            <Story />
          </TableBody>
        </Table>
      </TableContainer>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableNoData>;

export const NoData: Story = {
  args: {
    notFound: true,
  },
};

export const HasData: Story = {
  args: {
    notFound: false,
  },
};
