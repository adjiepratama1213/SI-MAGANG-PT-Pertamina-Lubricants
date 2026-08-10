import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import ChatArea from './chat-area';

const mockUser = { name: 'John', photoUrl: '' };

const mockMessages = [
  { from: 'bot', text: 'Halo! Ada yang bisa saya bantu?', createdAt: new Date().toISOString() },
  { from: 'user', text: 'Saya butuh bantuan dengan laptop.', createdAt: new Date().toISOString() },
  {
    from: 'bot',
    text: 'Baik, silakan jelaskan kendala Anda. Apakah terkait hardware atau software?',
    createdAt: new Date().toISOString(),
  },
];

const meta: Meta<typeof ChatArea> = {
  title: 'Components/Other/Chatbot/ChatArea',
  component: ChatArea,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: 400, height: 500, border: '1px solid #ddd', borderRadius: 8 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ChatArea>;

export const Default: Story = {
  args: {
    user: mockUser,
    messages: mockMessages,
    botTyping: false,
    botDisplayedText: '',
    loading: false,
    input: '',
    placeholderDots: '',
    setInput: () => {},
    onSend: () => {},
    fullscreen: false,
    quickReplies: [
      { label: 'Cek Status', command: '/check-status' },
      { label: 'Buat Tiket', command: '/new-ticket' },
    ],
  },
};

export const BotTyping: Story = {
  args: {
    ...Default.args,
    botTyping: true,
    botDisplayedText: 'Sedang memproses',
  },
};
