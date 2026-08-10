import type { Meta, StoryObj } from '@storybook/react';
import Typography from '@mui/material/Typography';
import LoadingScreen from './loading-screen';

const meta: Meta<typeof LoadingScreen> = {
  title: 'Components/Feedback/LoadingScreen',
  component: LoadingScreen,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingScreen>;

export const Default: Story = {};

export const WithMessage: Story = {
  args: {
    message: <Typography variant="body2">Loading...</Typography>,
  },
};
