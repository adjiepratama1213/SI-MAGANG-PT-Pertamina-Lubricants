import type { Meta, StoryObj } from '@storybook/react';
import CarouselDots from './carousel-dots';

const meta: Meta<any> = {
  title: 'Components/Other/Carousel/CarouselDots',
  component: CarouselDots as any,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<any>;

function DotsPreview({ rounded = false }: { rounded?: boolean }) {
  const { appendDots, customPaging } = CarouselDots({ rounded });
  const dots = [0, 1, 2].map((i) => (
    <li key={i} className={i === 0 ? 'slick-active' : ''} style={{ listStyle: 'none' }}>
      {customPaging()}
    </li>
  ));
  return appendDots(dots);
}

export const Default: Story = {
  render: () => <DotsPreview />,
};

export const Rounded: Story = {
  render: () => <DotsPreview rounded />,
};
