import type { Meta, StoryObj } from '@storybook/react';
import MultiFilePreview from './preview-multi-file';

const meta: Meta<typeof MultiFilePreview> = {
  title: 'Components/Inputs/Upload/PreviewMultiFile',
  component: MultiFilePreview,
  tags: ['autodocs'],
  argTypes: {
    thumbnail: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof MultiFilePreview>;

const mockFiles = [
  'https://placehold.co/200x200',
  'document.pdf',
  'https://placehold.co/100x100',
];

export const List: Story = {
  args: {
    files: mockFiles,
    onRemove: (file) => console.log('Remove', file),
  },
};

export const Thumbnail: Story = {
  args: {
    files: mockFiles,
    thumbnail: true,
    onRemove: (file) => console.log('Remove', file),
  },
};
