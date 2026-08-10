import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import UploadBox from './upload-box';

const meta: Meta<typeof UploadBox> = {
  title: 'Components/Inputs/Upload/UploadBox',
  component: UploadBox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof UploadBox>;

export const Default: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    error: true,
  },
};

export const Multiple: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <UploadBox />
      <UploadBox />
      <UploadBox />
    </Box>
  ),
};
