import type { Meta, StoryObj } from '@storybook/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { toast } from 'react-toastify';
import { SettingsContext } from '../settings/context/settings-context';
import { Toaster } from './react-toasify';

const mockSettings = {
  themeStretch: false,
  themeMode: 'light' as const,
  themeDirection: 'ltr' as const,
  themeContrast: 'default' as const,
  themeLayout: 'vertical' as const,
  themeColorPresets: 'default' as const,
  onUpdate: () => {},
  onChangeDirectionByLang: () => {},
  canReset: false,
  onReset: () => {},
  open: false,
  onToggle: () => {},
  onClose: () => {},
};

function ToasterDemo() {
  return (
    <SettingsContext.Provider value={mockSettings as any}>
      <Toaster />
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Button variant="contained" onClick={() => toast.success('Success!')}>
          Success
        </Button>
        <Button variant="outlined" onClick={() => toast.error('Error!')}>
          Error
        </Button>
        <Button variant="outlined" onClick={() => toast.info('Info')}>
          Info
        </Button>
        <Button variant="outlined" onClick={() => toast.warning('Warning')}>
          Warning
        </Button>
      </Stack>
    </SettingsContext.Provider>
  );
}

const meta: Meta<typeof Toaster> = {
  title: 'Components/Feedback/Toaster',
  component: Toaster,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => <ToasterDemo />,
};
