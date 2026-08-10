import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFEditor from './rhf-editor';

const meta: Meta<typeof RHFEditor> = {
  title: 'Components/Inputs/HookForm/RHFEditor',
  component: RHFEditor,
  tags: ['autodocs'],
};

function FormDemo() {
  const methods = useForm({ defaultValues: { content: '<p>Initial content</p>' } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFEditor name="content" id="editor-demo" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFEditor>;

export const Default: Story = {
  render: () => <FormDemo />,
};
