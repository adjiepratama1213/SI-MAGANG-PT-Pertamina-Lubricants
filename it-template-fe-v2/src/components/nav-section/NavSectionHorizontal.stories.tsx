import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Iconify from '../iconify';
import NavSectionHorizontal from './horizontal/nav-section-horizontal';

const mockData = [
  {
    subheader: 'Main',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: <Iconify icon="solar:home-2-bold-duotone" /> },
      { title: 'Users', path: '/users', icon: <Iconify icon="solar:user-bold-duotone" /> },
      { title: 'Settings', path: '/settings', icon: <Iconify icon="solar:settings-bold-duotone" /> },
    ],
  },
];

const meta: Meta<typeof NavSectionHorizontal> = {
  title: 'Components/Navigation/NavSectionHorizontal',
  component: NavSectionHorizontal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NavSectionHorizontal>;

export const Default: Story = {
  args: { data: mockData },
};
