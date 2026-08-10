import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import { RHFUpload, RHFUploadAvatar } from './rhf-upload';

const meta: Meta<typeof RHFUpload> = {
  title: 'Components/Inputs/HookForm/RHFUpload',
  component: RHFUpload,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

function FormDemo() {
  const methods = useForm({
    defaultValues: { avatar: null, file: null, files: [] },
  });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={3}>
        <RHFUpload name="file" helperText="Upload a single file" />
        <RHFUpload name="files" multiple helperText="Upload multiple files" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

function AvatarFormDemo() {
  const methods = useForm({ defaultValues: { avatar: null } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} alignItems="center">
        <RHFUploadAvatar name="avatar" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFUpload>;

export const SingleFile: Story = {
  render: () => <FormDemo />,
};

export const Avatar: Story = {
  render: () => <AvatarFormDemo />,
};
