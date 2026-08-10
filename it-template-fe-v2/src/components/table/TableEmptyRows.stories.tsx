import type { Meta, StoryObj } from '@storybook/react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableEmptyRows from './table-empty-rows';

const meta: Meta<typeof TableEmptyRows> = {
  title: 'Components/Data Display/Table/TableEmptyRows',
  component: TableEmptyRows,
  tags: ['autodocs'],
  argTypes: {
    emptyRows: { control: { type: 'number', min: 0 } },
    height: { control: { type: 'number', min: 0 } },
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

type Story = StoryObj<typeof TableEmptyRows>;

export const Default: Story = {
  args: { emptyRows: 3 },
};

export const WithHeight: Story = {
  args: { emptyRows: 2, height: 48 },
};
