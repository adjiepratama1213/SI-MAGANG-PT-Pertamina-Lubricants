import type { Meta, StoryObj } from '@storybook/react';
import CarouselArrowIndex from './carousel-arrow-index';

const meta: Meta<typeof CarouselArrowIndex> = {
  title: 'Components/Other/Carousel/CarouselArrowIndex',
  component: CarouselArrowIndex,
  tags: ['autodocs'],
  argTypes: {
    index: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 1 } },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 400, height: 200, background: '#eee' }}>
        <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CarouselArrowIndex>;

export const Default: Story = {
  args: {
    index: 0,
    total: 5,
    onPrev: () => {},
    onNext: () => {},
  },
};

export const Middle: Story = {
  args: {
    index: 2,
    total: 5,
    onPrev: () => {},
    onNext: () => {},
  },
};
