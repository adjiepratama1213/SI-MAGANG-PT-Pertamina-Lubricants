import type { Meta, StoryObj } from '@storybook/react';
import Typography from '@mui/material/Typography';
import MotionContainer from './motion-container';

const meta: Meta<typeof MotionContainer> = {
  title: 'Components/Animate/MotionContainer',
  component: MotionContainer,
  tags: ['autodocs'],
  argTypes: {
    animate: { control: 'boolean' },
    action: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof MotionContainer>;

export const Default: Story = {
  args: {
    children: <Typography>Animated container content</Typography>,
  },
};

export const ActionMode: Story = {
  args: {
    action: true,
    animate: true,
    children: <Typography>Action mode (animate=true)</Typography>,
  },
};
