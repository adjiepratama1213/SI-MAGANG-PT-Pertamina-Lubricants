import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ProgressBar from './progress-bar';

function ProgressBarDemo() {
  return (
    <MemoryRouter>
      <ProgressBar />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/" variant="contained">
            Home
          </Button>
          <Button component={Link} to="/page1" variant="outlined">
            Page 1
          </Button>
          <Button component={Link} to="/page2" variant="outlined">
            Page 2
          </Button>
        </Stack>
        <Routes>
          <Route path="/" element={<div>Home - Progress bar shows on route change</div>} />
          <Route path="/page1" element={<div>Page 1</div>} />
          <Route path="/page2" element={<div>Page 2</div>} />
        </Routes>
      </Stack>
    </MemoryRouter>
  );
}

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/Feedback/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  render: () => <ProgressBarDemo />,
};
