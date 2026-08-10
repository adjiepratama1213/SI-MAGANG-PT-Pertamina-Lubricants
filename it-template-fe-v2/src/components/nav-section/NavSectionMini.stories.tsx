import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Iconify from '../iconify';
import NavSectionMini from './mini/nav-section-mini';

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

const meta: Meta<typeof NavSectionMini> = {
  title: 'Components/Navigation/NavSectionMini',
  component: NavSectionMini,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 72 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof NavSectionMini>;

export const Default: Story = {
  args: { data: mockData },
};
