import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Logo } from './logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Media/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    opt: { control: 'select', options: ['horizontal', 'vertical'] },
    disabledLink: { control: 'boolean' },
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

type Story = StoryObj<typeof Logo>;

export const Horizontal: Story = {
  args: { opt: 'horizontal' },
};

export const Vertical: Story = {
  args: { opt: 'vertical' },
};

export const DisabledLink: Story = {
  args: { disabledLink: true },
};
