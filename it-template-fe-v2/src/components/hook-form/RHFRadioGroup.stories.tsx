import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFRadioGroup from './rhf-radio-group';

const meta: Meta<typeof RHFRadioGroup> = {
  title: 'Components/Inputs/HookForm/RHFRadioGroup',
  component: RHFRadioGroup,
  tags: ['autodocs'],
};

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

function FormDemo() {
  const methods = useForm({ defaultValues: { choice: 'a' } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFRadioGroup name="choice" label="Choose one" options={options} />
        <RHFRadioGroup name="choiceRow" label="Horizontal" options={options} row />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFRadioGroup>;

export const Default: Story = {
  render: () => <FormDemo />,
};
