import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFSwitch from './rhf-switch';

const meta: Meta<typeof RHFSwitch> = {
  title: 'Components/Inputs/HookForm/RHFSwitch',
  component: RHFSwitch,
  tags: ['autodocs'],
};

function FormDemo() {
  const methods = useForm({ defaultValues: { active: false } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFSwitch name="active" label="Active" />
        <RHFSwitch name="notify" label="Enable notifications" helperText="You will receive email updates" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFSwitch>;

export const Default: Story = {
  render: () => <FormDemo />,
};
