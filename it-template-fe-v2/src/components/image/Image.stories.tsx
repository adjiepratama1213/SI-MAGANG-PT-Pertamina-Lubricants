import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Image from './image';

const meta: Meta<typeof Image> = {
  title: 'Components/Media/Image',
  component: Image,
  tags: ['autodocs'],
  argTypes: {
    ratio: { control: 'select', options: ['4/3', '3/4', '6/4', '8/6', '16/9', '21/9', undefined] },
    objectFit: { control: 'select', options: ['cover', 'contain'] },
  },
};

export default meta;

type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    alt: 'Sample',
    src: 'https://placehold.co/400x300',
  },
};

export const WithRatio: Story = {
  args: {
    alt: '16:9',
    src: 'https://placehold.co/800x450',
    ratio: '16/9',
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
};

export const Rounded: Story = {
  args: {
    alt: 'Rounded',
    src: 'https://placehold.co/200x200',
    sx: { borderRadius: 2 },
  },
};
