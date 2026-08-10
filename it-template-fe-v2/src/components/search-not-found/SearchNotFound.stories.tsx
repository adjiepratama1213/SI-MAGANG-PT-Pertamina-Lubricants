import type { Meta, StoryObj } from '@storybook/react';
import SearchNotFound from './search-not-found';

const meta: Meta<typeof SearchNotFound> = {
  title: 'Components/Data Display/SearchNotFound',
  component: SearchNotFound,
  tags: ['autodocs'],
  argTypes: {
    query: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof SearchNotFound>;

export const WithQuery: Story = {
  args: {
    query: 'keyword tidak ditemukan',
  },
};

export const NoQuery: Story = {
  args: {
    query: undefined,
  },
};

export const EmptyQuery: Story = {
  args: {
    query: '',
  },
};
