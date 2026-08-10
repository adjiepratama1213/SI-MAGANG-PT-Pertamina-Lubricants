import type { Meta, StoryObj } from '@storybook/react';
import QRCode from './qr-code';

const meta: Meta<typeof QRCode> = {
  title: 'Components/MFA/QRCode',
  component: QRCode,
  tags: ['autodocs'],
  argTypes: {
    qr: { control: 'text' },
    secret: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof QRCode>;

export const Default: Story = {
  args: {
    qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    secret: 'JBSWY3DPEHPK3PXP',
  },
};
