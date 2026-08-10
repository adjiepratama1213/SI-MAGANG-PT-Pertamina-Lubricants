import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import ConfirmDialog from './confirm-dialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/Overlay/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

function ConfirmDialogDemo({
  title,
  content,
  defaultOpen,
}: {
  title: React.ReactNode;
  content?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        content={content}
        action={
          <Button variant="contained" color="error" onClick={() => setOpen(false)}>
            Confirm
          </Button>
        }
      />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <ConfirmDialogDemo
      title="Konfirmasi"
      content="Apakah Anda yakin ingin melanjutkan tindakan ini?"
      defaultOpen
    />
  ),
};

export const DeleteConfirmation: Story = {
  render: () => (
    <ConfirmDialogDemo
      title="Hapus item?"
      content="Data yang dihapus tidak dapat dikembalikan."
      defaultOpen
    />
  ),
};
