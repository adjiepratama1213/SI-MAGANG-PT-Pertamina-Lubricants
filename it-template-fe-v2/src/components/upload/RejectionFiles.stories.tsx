import type { Meta, StoryObj } from '@storybook/react';
import RejectionFiles from './errors-rejection-files';

const meta: Meta<typeof RejectionFiles> = {
  title: 'Components/Inputs/Upload/RejectionFiles',
  component: RejectionFiles,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RejectionFiles>;

const mockFile = new File(['content'], 'large-file.zip');
const mockRejections = [
  {
    file: mockFile,
    errors: [{ code: 'file-too-large', message: 'File is larger than 5MB' }],
  },
];

export const Default: Story = {
  args: {
    fileRejections: mockRejections,
  },
};

export const Empty: Story = {
  args: {
    fileRejections: [],
  },
};
