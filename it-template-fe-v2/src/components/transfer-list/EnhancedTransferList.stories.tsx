import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import EnhancedTransferList from './enhanced-transfer-list';

const meta: Meta<typeof EnhancedTransferList> = {
  title: 'Components/Inputs/TransferList/EnhancedTransferList',
  component: EnhancedTransferList,
  tags: ['autodocs'],
};

const defaultItems = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

function EnhancedTransferListDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <EnhancedTransferList items={defaultItems} onListChange={setSelected} />
      {selected.length > 0 && (
        <div style={{ marginTop: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
          Selected: {selected.join(', ')}
        </div>
      )}
    </>
  );
}

export default meta;

type Story = StoryObj<typeof EnhancedTransferList>;

export const Default: Story = {
  args: {
    items: defaultItems,
    onListChange: (items) => console.log('Selected:', items),
  },
};

export const Interactive: Story = {
  render: () => <EnhancedTransferListDemo />,
};
