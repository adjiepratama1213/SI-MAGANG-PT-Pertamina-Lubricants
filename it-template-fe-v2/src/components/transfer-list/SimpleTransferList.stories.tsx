import type { Meta, StoryObj } from '@storybook/react';
import SimpleTransferList from './simple-transfer-list';

const meta: Meta<typeof SimpleTransferList> = {
  title: 'Components/Inputs/TransferList/SimpleTransferList',
  component: SimpleTransferList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SimpleTransferList>;

export const Default: Story = {};
