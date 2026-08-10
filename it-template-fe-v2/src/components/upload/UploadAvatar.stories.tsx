import type { Meta, StoryObj } from '@storybook/react';
import UploadAvatar from './upload-avatar';

const meta: Meta<typeof UploadAvatar> = {
  title: 'Components/Inputs/Upload/UploadAvatar',
  component: UploadAvatar,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof UploadAvatar>;

export const Default: Story = {};

export const WithPreview: Story = {
  args: {
    file: 'https://placehold.co/144x144',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
