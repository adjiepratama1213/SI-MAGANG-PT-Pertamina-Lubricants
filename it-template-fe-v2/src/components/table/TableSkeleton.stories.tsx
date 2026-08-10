import type { Meta, StoryObj } from '@storybook/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableSkeleton from './table-skeleton';

const meta: Meta<typeof TableSkeleton> = {
  title: 'Components/Data Display/Table/TableSkeleton',
  component: TableSkeleton,
  tags: ['autodocs'],
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

type Story = StoryObj<typeof TableSkeleton>;

export const Default: Story = {};
