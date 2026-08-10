import type { Meta, StoryObj } from '@storybook/react';
import Stack from '@mui/material/Stack';
import FileThumbnail from './file-thumbnail';

const meta: Meta<typeof FileThumbnail> = {
  title: 'Components/Media/FileThumbnail',
  component: FileThumbnail,
  tags: ['autodocs'],
  argTypes: {
    tooltip: { control: 'boolean' },
    imageView: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof FileThumbnail>;

export const PDF: Story = {
  args: {
    file: 'document.pdf',
  },
};

export const Image: Story = {
  args: {
    file: 'https://placehold.co/64x64',
    imageView: true,
  },
};

export const WithTooltip: Story = {
  args: {
    file: 'report.xlsx',
    tooltip: true,
  },
};

export const Types: Story = {
  render: () => (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <FileThumbnail file="document.pdf" />
      <FileThumbnail file="sheet.xlsx" />
      <FileThumbnail file="image.png" />
    </Stack>
  ),
};
