import type { Meta, StoryObj } from '@storybook/react';
import Label from './label';
import Iconify from '../iconify';

const meta: Meta<typeof Label> = {
  title: 'Components/Atoms/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'soft'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Label',
    color: 'default',
    variant: 'soft',
  },
};

export const Filled: Story = {
  args: {
    children: 'Filled',
    color: 'primary',
    variant: 'filled',
  },
};

export const Outlined: Story = {
  args: {
    children: 'Outlined',
    color: 'success',
    variant: 'outlined',
  },
};

export const WithStartIcon: Story = {
  args: {
    children: 'With icon',
    color: 'info',
    variant: 'soft',
    startIcon: <Iconify icon="solar:check-circle-bold" />,
  },
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {(['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'] as const).map(
        (color) => (
          <Label key={color} color={color} variant="soft">
            {color}
          </Label>
        )
      )}
    </div>
  ),
};
