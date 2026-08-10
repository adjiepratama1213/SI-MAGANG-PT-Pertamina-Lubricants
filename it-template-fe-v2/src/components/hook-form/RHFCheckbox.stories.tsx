import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';

const meta: Meta<typeof RHFCheckbox> = {
  title: 'Components/Inputs/HookForm/RHFCheckbox',
  component: RHFCheckbox,
  tags: ['autodocs'],
};

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

function SingleDemo() {
  const methods = useForm({ defaultValues: { agreed: false } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFCheckbox name="agreed" label="I agree to the terms" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

function MultiDemo() {
  const methods = useForm({ defaultValues: { selected: [] as string[] } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFMultiCheckbox name="selected" label="Select options" options={options} />
        <RHFMultiCheckbox name="selectedRow" label="Horizontal" options={options} row />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFCheckbox>;

export const Single: Story = {
  render: () => <SingleDemo />,
};

export const MultiCheckbox: Story = {
  render: () => <MultiDemo />,
};
