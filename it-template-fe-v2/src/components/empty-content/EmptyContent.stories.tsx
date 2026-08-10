import type { Meta, StoryObj } from '@storybook/react';
import Button from '@mui/material/Button';
import EmptyContent from './empty-content';

const meta: Meta<typeof EmptyContent> = {
  title: 'Components/Data Display/EmptyContent',
  component: EmptyContent,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    filled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof EmptyContent>;

export const Default: Story = {
  args: {
    title: 'No data',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
  },
};

export const Filled: Story = {
  args: {
    title: 'No Data',
    description: 'There is no data to display.',
    filled: true,
  },
};

export const WithAction: Story = {
  args: {
    title: 'No items',
    description: 'Get started by creating a new item.',
    action: (
      <Button variant="contained" size="medium" sx={{ mt: 2 }}>
        Create item
      </Button>
    ),
  },
};

export const CustomImage: Story = {
  args: {
    title: 'Empty state',
    description: 'Custom empty state with your own image.',
    imgUrl: '/assets/icons/empty/ic_content.svg',
  },
};
