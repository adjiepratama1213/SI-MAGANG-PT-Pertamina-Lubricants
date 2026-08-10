import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import RHFAutocomplete from './rhf-autocomplete';

const meta: Meta<typeof RHFAutocomplete> = {
  title: 'Components/Inputs/HookForm/RHFAutocomplete',
  component: RHFAutocomplete,
  tags: ['autodocs'],
};

const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

const optionsWithLabel = [
  { label: 'Label A', value: 'a' },
  { label: 'Label B', value: 'b' },
  { label: 'Label C', value: 'c' },
];

function SimpleDemo() {
  const methods = useForm({ defaultValues: { value: null as string | null } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <RHFAutocomplete
          name="value"
          label="Autocomplete"
          placeholder="Type to search"
          options={options}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

function OptionLabelDemo() {
  const methods = useForm({ defaultValues: { value: null as (typeof optionsWithLabel)[0] | null } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2} sx={{ maxWidth: 360 }}>
        <RHFAutocomplete
          name="value"
          label="With options"
          options={optionsWithLabel}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt?.label ?? '')}
          isOptionEqualToValue={(opt, val) => (opt as any)?.value === (val as any)?.value}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFAutocomplete>;

export const Default: Story = {
  render: () => <SimpleDemo />,
};

export const WithOptions: Story = {
  render: () => <OptionLabelDemo />,
};
