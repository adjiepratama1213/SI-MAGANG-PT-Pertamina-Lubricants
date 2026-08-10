import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import CarouselArrows from './carousel-arrows';

const meta: Meta<typeof CarouselArrows> = {
  title: 'Components/Other/Carousel/CarouselArrows',
  component: CarouselArrows,
  tags: ['autodocs'],
  argTypes: {
    shape: { control: 'select', options: ['circular', 'rounded'] },
    filled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof CarouselArrows>;

export const Inline: Story = {
  args: {
    onPrev: () => {},
    onNext: () => {},
  },
};

export const Filled: Story = {
  args: {
    filled: true,
    onPrev: () => {},
    onNext: () => {},
  },
};

export const WithChild: Story = {
  render: () => (
    <Box sx={{ position: 'relative', width: 400, height: 200, bgcolor: 'grey.200', borderRadius: 2 }}>
      <CarouselArrows
        onPrev={() => {}}
        onNext={() => {}}
        filled
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>Slide content</Box>
      </CarouselArrows>
    </Box>
  ),
};
