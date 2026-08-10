import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import SingleFilePreview from './preview-single-file';

const meta: Meta<typeof SingleFilePreview> = {
  title: 'Components/Inputs/Upload/PreviewSingleFile',
  component: SingleFilePreview,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ position: 'relative', width: 120, height: 120 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SingleFilePreview>;

export const Default: Story = {
  args: {
    imgUrl: 'https://placehold.co/120x120',
  },
};
