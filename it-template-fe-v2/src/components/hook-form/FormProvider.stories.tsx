import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFTextField from './rhf-text-field';
import RHFSwitch from './rhf-switch';
import { RHFCheckbox } from './rhf-checkbox';

const meta: Meta<typeof FormProvider> = {
  title: 'Components/Inputs/HookForm/FormProvider',
  component: FormProvider,
  tags: ['autodocs'],
};

function ComprehensiveFormDemo() {
  const methods = useForm({
    defaultValues: {
      name: '',
      email: '',
      active: false,
      agreed: false,
    },
  });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={3} sx={{ maxWidth: 400 }}>
        <RHFTextField name="name" label="Name" />
        <RHFTextField name="email" label="Email" type="email" />
        <RHFSwitch name="active" label="Active" />
        <RHFCheckbox name="agreed" label="I agree to terms" />
        <Button type="submit" variant="contained" fullWidth>
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof FormProvider>;

export const ComprehensiveForm: Story = {
  render: () => <ComprehensiveFormDemo />,
};
