import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Editor from './editor';

const meta: Meta<typeof Editor> = {
  title: 'Components/Other/Editor',
  component: Editor,
  tags: ['autodocs'],
};

function EditorDemo() {
  const [value, setValue] = useState('<p>Hello <strong>world</strong></p>');
  return (
    <div style={{ maxWidth: 800 }}>
      <Editor
        id="story-editor"
        value={value}
        onChange={setValue}
        helperText="Rich text editor (Jodit)"
      />
    </div>
  );
}

export default meta;

type Story = StoryObj<typeof Editor>;

export const Default: Story = {
  render: () => <EditorDemo />,
};
