import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import TextMaxLine from './text-max-line';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

const meta: Meta<typeof TextMaxLine> = {
  title: 'Components/Atoms/TextMaxLine',
  component: TextMaxLine,
  tags: ['autodocs'],
  argTypes: {
    line: { control: { type: 'number', min: 1, max: 5 } },
    variant: {
      control: 'select',
      options: ['body1', 'body2', 'h6', 'subtitle1', 'subtitle2'],
    },
    asLink: { control: 'boolean' },
    persistent: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof TextMaxLine>;

export const SingleLine: Story = {
  args: {
    children: longText,
    line: 1,
    variant: 'body1',
  },
};

export const TwoLines: Story = {
  args: {
    children: longText,
    line: 2,
    variant: 'body1',
  },
};

export const ThreeLines: Story = {
  args: {
    children: longText,
    line: 3,
    variant: 'body1',
  },
};

export const AsLink: Story = {
  args: {
    children: 'This is a link that truncates when too long',
    line: 1,
    asLink: true,
  },
};

export const InContainer: Story = {
  render: () => (
    <Box sx={{ maxWidth: 280 }}>
      <TextMaxLine line={2} variant="subtitle1">
        {longText}
      </TextMaxLine>
    </Box>
  ),
};
