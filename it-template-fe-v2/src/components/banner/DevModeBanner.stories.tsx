import type { Meta, StoryObj } from '@storybook/react';
import { DevModeBanner } from './DevModeBanner';

const meta: Meta<typeof DevModeBanner> = {
  title: 'Components/Feedback/DevModeBanner',
  component: DevModeBanner,
  tags: ['autodocs'],
  argTypes: {
    devMode: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof DevModeBanner>;

export const Default: Story = {
  args: { devMode: 'DEV' },
};

export const Staging: Story = {
  args: { devMode: 'STAGING' },
};
