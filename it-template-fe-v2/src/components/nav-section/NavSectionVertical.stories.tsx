import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Iconify from '../iconify';
import NavSectionVertical from './vertical/nav-section-vertical';

const mockData = [
  {
    subheader: 'Main',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: <Iconify icon="solar:home-2-bold-duotone" /> },
      { title: 'Users', path: '/users', icon: <Iconify icon="solar:user-bold-duotone" /> },
    ],
  },
  {
    subheader: 'Settings',
    items: [
      { title: 'Profile', path: '/profile', icon: <Iconify icon="solar:user-id-bold-duotone" /> },
    ],
  },
];

const meta: Meta<typeof NavSectionVertical> = {
  title: 'Components/Navigation/NavSectionVertical',
  component: NavSectionVertical,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 280 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NavSectionVertical>;

export const Default: Story = {
  args: {
    data: mockData,
  },
};
