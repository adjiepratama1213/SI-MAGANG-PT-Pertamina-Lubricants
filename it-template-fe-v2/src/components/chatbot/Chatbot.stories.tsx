import type { Meta, StoryObj } from '@storybook/react';
import Chatbot from './chatbot';

const mockUser = { name: 'User', photoUrl: '' };

const mockOnSendMessage = async () => ({
  response: 'Ini adalah respons dari asisten IT. Ada yang bisa saya bantu?',
  feedbackComment: undefined,
});

const meta: Meta<typeof Chatbot> = {
  title: 'Components/Other/Chatbot/Chatbot',
  component: Chatbot,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Chatbot>;

export const Default: Story = {
  args: {
    user: mockUser,
    sessionId: 'story-session-1',
    onSendMessage: mockOnSendMessage,
  },
};
