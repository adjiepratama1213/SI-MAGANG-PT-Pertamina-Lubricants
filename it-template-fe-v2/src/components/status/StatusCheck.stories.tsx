import type { Meta, StoryObj } from '@storybook/react';
import Stack from '@mui/material/Stack';
import CheckStatus from './status-check';

const meta: Meta<typeof CheckStatus> = {
  title: 'Components/Feedback/StatusCheck',
  component: CheckStatus,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [0, 1, 2, 3],
      mapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CheckStatus>;

export const Drafted: Story = { args: { status: 0 } };
export const Passed: Story = { args: { status: 1 } };
export const Rejected: Story = { args: { status: 2 } };
export const Pending: Story = { args: { status: 3 } };

export const All: Story = {
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <CheckStatus status={0} />
      <CheckStatus status={1} />
      <CheckStatus status={2} />
      <CheckStatus status={3} />
    </Stack>
  ),
};
