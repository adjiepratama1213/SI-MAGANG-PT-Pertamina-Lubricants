import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import { RHFSelect, RHFMultiSelect } from './rhf-select';

const meta: Meta<typeof RHFSelect> = {
  title: 'Components/Inputs/HookForm/RHFSelect',
  component: RHFSelect,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

function SingleSelectDemo() {
  const methods = useForm({ defaultValues: { role: '' } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFSelect name="role" label="Role">
          <MenuItem value="">Select...</MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </RHFSelect>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

function MultiSelectDemo() {
  const methods = useForm({ defaultValues: { tags: [] as string[] } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFMultiSelect name="tags" label="Tags" options={options} chip placeholder="Select tags" />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFSelect>;

export const Single: Story = {
  render: () => <SingleSelectDemo />,
};

export const MultiSelect: Story = {
  render: () => <MultiSelectDemo />,
};
