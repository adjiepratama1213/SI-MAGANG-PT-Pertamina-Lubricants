import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Iconify from './iconify';

const meta: Meta<typeof Iconify> = {
  title: 'Components/Atoms/Iconify',
  component: Iconify,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    width: { control: { type: 'number', min: 16, max: 64 } },
  },
};

export default meta;

type Story = StoryObj<typeof Iconify>;

export const Default: Story = {
  args: {
    icon: 'solar:home-2-bold-duotone',
    width: 24,
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Iconify icon="solar:user-bold-duotone" width={20} />
      <Iconify icon="solar:user-bold-duotone" width={28} />
      <Iconify icon="solar:user-bold-duotone" width={36} />
      <Iconify icon="solar:user-bold-duotone" width={48} />
    </Box>
  ),
};

export const IconSet: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Iconify icon="solar:home-2-bold-duotone" width={28} />
      <Iconify icon="solar:user-bold-duotone" width={28} />
      <Iconify icon="solar:settings-bold-duotone" width={28} />
      <Iconify icon="solar:shield-user-bold-duotone" width={28} />
      <Iconify icon="solar:letter-bold-duotone" width={28} />
      <Iconify icon="solar:lock-keyhole-bold-duotone" width={28} />
    </Box>
  ),
};
