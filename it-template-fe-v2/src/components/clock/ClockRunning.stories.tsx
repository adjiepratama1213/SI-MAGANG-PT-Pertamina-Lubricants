import type { Meta, StoryObj } from '@storybook/react';
import ClockRunning from './clock-running';

const meta: Meta<typeof ClockRunning> = {
  title: 'Components/Other/ClockRunning',
  component: ClockRunning,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['large', 'medium', 'small'] },
  },
};

export default meta;

type Story = StoryObj<typeof ClockRunning>;

export const Large: Story = {
  args: { size: 'large' },
};

export const Medium: Story = {
  args: { size: 'medium' },
};

export const Small: Story = {
  args: { size: 'small' },
};
