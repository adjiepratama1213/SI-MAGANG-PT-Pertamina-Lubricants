import type { Meta, StoryObj } from '@storybook/react';
import Upload from './upload';

const meta: Meta<typeof Upload> = {
  title: 'Components/Inputs/Upload/Upload',
  component: Upload,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Upload>;

export const Single: Story = {
  args: {
    multiple: false,
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
