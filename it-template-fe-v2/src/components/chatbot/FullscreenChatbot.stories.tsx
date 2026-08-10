import type { Meta, StoryObj } from '@storybook/react';
import FullscreenChatbot from './fullscreen-chatbot';

const mockUser = { name: 'User', photoUrl: '' };

const mockOnSendMessage = async () => ({
  response: 'Respons dari asisten (fullscreen mode).',
  feedbackComment: undefined,
});

const meta: Meta<typeof FullscreenChatbot> = {
  title: 'Components/Other/Chatbot/FullscreenChatbot',
  component: FullscreenChatbot,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '80vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FullscreenChatbot>;

export const Default: Story = {
  args: {
    user: mockUser,
    sessionId: 'fullscreen-session-1',
    onSendMessage: mockOnSendMessage,
  },
};
