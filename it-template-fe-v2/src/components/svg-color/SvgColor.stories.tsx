import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import SvgColor from './svg-color';

const meta: Meta<typeof SvgColor> = {
  title: 'Components/Atoms/SvgColor',
  component: SvgColor,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof SvgColor>;

export const Default: Story = {
  args: {
    src: '/assets/icons/empty/ic_content.svg',
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <SvgColor src="/assets/icons/empty/ic_content.svg" sx={{ width: 20, height: 20 }} />
      <SvgColor src="/assets/icons/empty/ic_content.svg" sx={{ width: 32, height: 32 }} />
      <SvgColor src="/assets/icons/empty/ic_content.svg" sx={{ width: 48, height: 48 }} />
    </Box>
  ),
};
