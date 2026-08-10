import type { Meta, StoryObj } from '@storybook/react';
import WebcamCapture from './WebCapture';

const meta: Meta<typeof WebcamCapture> = {
  title: 'Components/Other/Camera/WebCapture',
  component: WebcamCapture,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: 'Requires camera permission. May not work in all Storybook environments.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof WebcamCapture>;

export const Default: Story = {};
