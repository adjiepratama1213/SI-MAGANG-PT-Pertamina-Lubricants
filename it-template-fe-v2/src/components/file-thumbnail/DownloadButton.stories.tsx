import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import DownloadButton from './download-button';

const meta: Meta<typeof DownloadButton> = {
  title: 'Components/Media/FileThumbnail/DownloadButton',
  component: DownloadButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ position: 'relative', width: 80, height: 80, bgcolor: 'grey.300' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DownloadButton>;

export const Default: Story = {
  args: {
    onDownload: () => console.log('Download'),
  },
};
