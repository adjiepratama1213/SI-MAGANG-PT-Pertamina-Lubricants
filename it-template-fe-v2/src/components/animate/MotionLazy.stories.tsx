import type { Meta, StoryObj } from '@storybook/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { MotionLazy } from './motion-lazy';

const meta: Meta<typeof MotionLazy> = {
  title: 'Components/Animate/MotionLazy',
  component: MotionLazy,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MotionLazy>;

export const Default: Story = {
  render: () => (
    <MotionLazy>
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography>Content wrapped with LazyMotion (domMax)</Typography>
      </Box>
    </MotionLazy>
  ),
};
