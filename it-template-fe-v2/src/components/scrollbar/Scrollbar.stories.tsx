import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Scrollbar from './scrollbar';

const meta: Meta<typeof Scrollbar> = {
  title: 'Components/Layout/Scrollbar',
  component: Scrollbar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ height: 200, width: 280 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Scrollbar>;

const longContent = (
  <>
    {Array.from({ length: 20 }).map((_, i) => (
      <p key={i}>Line {i + 1} — Lorem ipsum dolor sit amet.</p>
    ))}
  </>
);

export const Default: Story = {
  args: {
    children: longContent,
    sx: { p: 2, height: '100%' },
  },
};
