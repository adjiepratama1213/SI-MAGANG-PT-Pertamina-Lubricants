import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import RouterLink from './router-link';

const meta: Meta<typeof RouterLink> = {
  title: 'Components/Atoms/RouterLink',
  component: RouterLink,
  tags: ['autodocs'],
  argTypes: {
    href: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RouterLink>;

export const Default: Story = {
  args: {
    href: '/dashboard',
    children: 'Go to Dashboard',
  },
};

export const AsButton: Story = {
  args: {
    href: '/settings',
    children: 'Settings',
    color: 'primary',
  },
};
