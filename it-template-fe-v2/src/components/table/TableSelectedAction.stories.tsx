import type { Meta, StoryObj } from '@storybook/react';
import Button from '@mui/material/Button';
import TableSelectedAction from './table-selected-action';

const meta: Meta<typeof TableSelectedAction> = {
  title: 'Components/Data Display/Table/TableSelectedAction',
  component: TableSelectedAction,
  tags: ['autodocs'],
  argTypes: {
    numSelected: { control: { type: 'number', min: 0 } },
    rowCount: { control: { type: 'number', min: 0 } },
    dense: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', paddingTop: 60 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TableSelectedAction>;

export const Default: Story = {
  args: {
    rowCount: 10,
    numSelected: 3,
    onSelectAllRows: (checked: boolean) => console.log('Select all', checked),
  },
};

export const WithAction: Story = {
  args: {
    rowCount: 10,
    numSelected: 2,
    onSelectAllRows: (checked: boolean) => console.log('Select all', checked),
    action: <Button size="small">Delete</Button>,
  },
};

export const Dense: Story = {
  args: {
    rowCount: 10,
    numSelected: 5,
    dense: true,
    onSelectAllRows: (checked: boolean) => console.log('Select all', checked),
  },
};
