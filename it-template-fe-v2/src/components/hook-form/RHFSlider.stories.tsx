import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFSlider from './rhf-slider';

const meta: Meta<typeof RHFSlider> = {
  title: 'Components/Inputs/HookForm/RHFSlider',
  component: RHFSlider,
  tags: ['autodocs'],
};

function FormDemo() {
  const methods = useForm({ defaultValues: { volume: 50 } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} sx={{ maxWidth: 320 }}>
        <RHFSlider name="volume" helperText="Adjust volume" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFSlider>;

export const Default: Story = {
  render: () => <FormDemo />,
};
