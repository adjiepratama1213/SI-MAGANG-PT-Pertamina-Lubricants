import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFTextField from './rhf-text-field';

const meta: Meta<typeof RHFTextField> = {
  title: 'Components/Inputs/HookForm/RHFTextField',
  component: RHFTextField,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
  },
};

function FormDemo() {
  const methods = useForm({ defaultValues: { email: '', name: '' } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <RHFTextField name="name" label="Name" />
        <RHFTextField name="email" label="Email" />
        <Button type="submit" variant="contained">Submit</Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFTextField>;

export const Default: Story = {
  render: () => <FormDemo />,
};
