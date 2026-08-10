import type { Meta, StoryObj } from '@storybook/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MotionViewport from './motion-viewport';

const meta: Meta<typeof MotionViewport> = {
  title: 'Components/Animate/MotionViewport',
  component: MotionViewport,
  tags: ['autodocs'],
  argTypes: {
    disableAnimatedMobile: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof MotionViewport>;

export const Default: Story = {
  render: () => (
    <MotionViewport>
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography>Content animates when scrolled into view</Typography>
      </Box>
    </MotionViewport>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: 200 }} />
      <MotionViewport>
        <Box sx={{ p: 3, bgcolor: 'primary.lighter', borderRadius: 2 }}>
          <Typography variant="h6">Animated block</Typography>
          <Typography variant="body2">This block uses viewport animation.</Typography>
        </Box>
      </MotionViewport>
      <div style={{ height: 200 }} />
    </div>
  ),
};
