import type { Meta, StoryObj } from '@storybook/react';
import UserDeviceInfo from './user-device-info';

const meta: Meta<typeof UserDeviceInfo> = {
  title: 'Components/Other/UserDeviceInfo',
  component: UserDeviceInfo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: 'Displays browser, OS, device, timezone and a live clock from the current environment.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof UserDeviceInfo>;

export const Default: Story = {};
