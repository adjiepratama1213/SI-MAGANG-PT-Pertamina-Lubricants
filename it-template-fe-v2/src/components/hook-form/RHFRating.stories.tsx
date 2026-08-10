import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormProvider from './form-provider';
import { RHFRating } from './rhf-rating';

const meta: Meta<typeof RHFRating> = {
  title: 'Components/Inputs/HookForm/RHFRating',
  component: RHFRating,
  tags: ['autodocs'],
};

function FormDemo() {
  const methods = useForm({ defaultValues: { rating: 0 } });
  return (
    <FormProvider methods={methods} onSubmit={methods.handleSubmit((d) => console.log(d))}>
      <Stack spacing={2}>
        <RHFRating name="rating" label="Rating" />
        <RHFRating name="score" label="Score (out of 10)" max={10} />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
}

export default meta;

type Story = StoryObj<typeof RHFRating>;

export const Default: Story = {
  render: () => <FormDemo />,
};
