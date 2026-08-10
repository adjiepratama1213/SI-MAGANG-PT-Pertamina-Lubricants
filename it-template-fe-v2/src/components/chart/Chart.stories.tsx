import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import Chart from './chart';

const meta: Meta<typeof Chart> = {
  title: 'Components/Data Display/Chart',
  component: Chart,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 400, height: 280 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Chart>;

const lineOptions = {
  chart: { id: 'basic-line', toolbar: { show: false } },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
};

const lineSeries = [{ name: 'Series 1', data: [30, 40, 35, 50, 49] }];

export const Line: Story = {
  args: {
    type: 'line',
    series: lineSeries,
    options: lineOptions,
    height: 280,
  },
};

const barOptions = {
  chart: { id: 'basic-bar', toolbar: { show: false } },
  plotOptions: { bar: { horizontal: false } },
  xaxis: { categories: ['A', 'B', 'C', 'D'] },
};

const barSeries = [{ name: 'Series 1', data: [44, 55, 41, 67] }];

export const Bar: Story = {
  args: {
    type: 'bar',
    series: barSeries,
    options: barOptions,
    height: 280,
  },
};
