import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFCode from './rhf-code';

const meta: Meta<typeof RHFCode> = {
  title: 'Components/Inputs/HookForm/RHFCode',
  component: RHFCode,
  tags: ['autodocs'],
};

function FormDemo() {
  const methods = useForm({ defaultValues: { code: '' } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <RHFCode name="code" length={6} />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFCode>;

export const Default: Story = {
  render: () => <FormDemo />,
};
