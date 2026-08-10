import type { Meta, StoryObj } from '@storybook/react';
import Markdown from './markdown';

const meta: Meta<typeof Markdown> = {
  title: 'Components/Media/Markdown',
  component: Markdown,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Markdown>;

const sample = `
# Heading 1
## Heading 2
Paragraph with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`js
const x = 1;
\`\`\`
`;

export const Default: Story = {
  args: {
    children: sample,
  },
};

export const Short: Story = {
  args: {
    children: 'Hello **world** from Markdown.',
  },
};
