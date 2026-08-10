import type { Meta, StoryObj } from '@storybook/react';
import CustomBreadcrumbs from './custom-breadcrumbs';

const meta: Meta<typeof CustomBreadcrumbs> = {
  title: 'Components/Navigation/CustomBreadcrumbs',
  component: CustomBreadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    heading: { control: 'text' },
    activeLast: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof CustomBreadcrumbs>;

const sampleLinks = [
  { name: 'Home', href: '/' },
  { name: 'Catalog', href: '/catalog' },
  { name: 'Detail', href: '#' },
];

export const Simple: Story = {
  args: {
    links: sampleLinks,
  },
};

export const WithHeading: Story = {
  args: {
    heading: 'Detail Page',
    links: sampleLinks,
  },
};

export const ActiveLast: Story = {
  args: {
    heading: 'Current page as link',
    links: sampleLinks,
    activeLast: false,
  },
};

export const SingleLink: Story = {
  args: {
    links: [{ name: 'Dashboard', href: '/' }],
  },
};
