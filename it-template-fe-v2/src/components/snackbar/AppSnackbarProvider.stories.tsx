import type { Meta, StoryObj } from '@storybook/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useSnackbar } from 'notistack';
import AppSnackbarProvider from './app-snackbar-provider';

function SnackbarDemoContent() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Button variant="contained" onClick={() => enqueueSnackbar('Success message!', { variant: 'success' })}>
        Success
      </Button>
      <Button variant="outlined" onClick={() => enqueueSnackbar('Error message!', { variant: 'error' })}>
        Error
      </Button>
      <Button variant="outlined" onClick={() => enqueueSnackbar('Info message', { variant: 'info' })}>
        Info
      </Button>
      <Button variant="outlined" onClick={() => enqueueSnackbar('Warning!', { variant: 'warning' })}>
        Warning
      </Button>
    </Stack>
  );
}

function SnackbarDemo() {
  return (
    <AppSnackbarProvider>
      <SnackbarDemoContent />
    </AppSnackbarProvider>
  );
}

const meta: Meta<typeof AppSnackbarProvider> = {
  title: 'Components/Feedback/AppSnackbarProvider',
  component: AppSnackbarProvider,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof AppSnackbarProvider>;

export const Default: Story = {
  render: () => <SnackbarDemo />,
};
