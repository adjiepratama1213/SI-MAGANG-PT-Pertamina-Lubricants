import { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { insertDateDividers } from 'src/utils/dateUtils';
import { ChatResponse, Message } from 'src/types/chat';
import ChatArea from './chat-area';
import { defaultQuickReply } from './contants';

type Props = {
  onSendMessage: ({
    question,
    attachment,
  }: {
    question?: string;
    attachment?: File;
  }) => Promise<ChatResponse>;
  user: { name: string; photoUrl: string };
  sessionId: string; // session id tambahan untuk reset chat
  initialMessages?: Message[];
};

export default function Chatbot({ onSendMessage, user, sessionId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [botTyping, setBotTyping] = useState(false);
  const [botFullText, setBotFullText] = useState('');
  const [botDisplayedText, setBotDisplayedText] = useState('');
  const [nextLengthShowByBot, setNextLengthShowByBot] = useState(3);
  const typingSpeed = 25; // ms per karakter

  const [quickReplies, setQuickReplies] =
    useState<{ command: string; label: string }[]>(defaultQuickReply);

  const [placeholderDots, setPlaceholderDots] = useState('');
  useEffect(() => {
    const dots = ['', '.', '..', '...'];
    let i = 0;
    let interval: NodeJS.Timeout;

    if (botTyping || loading) {
      interval = setInterval(() => {
        setPlaceholderDots(dots[i % dots.length]);
        i += 1;
      }, 500);
    } else {
      setPlaceholderDots('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [botTyping, loading]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Track last sessionId untuk reset chat saat berganti sesi
  const lastSessionIdRef = useRef<string>('');
  const lastInitialMessageCountRef = useRef<number>(0);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Jika sessionId berubah atau chat kosong, tambah pesan pembuka dari bot
  useEffect(() => {
    if (
      sessionId !== lastSessionIdRef.current ||
      messages.length === 0 ||
      initialMessages?.length !== lastInitialMessageCountRef.current
    ) {
      lastSessionIdRef.current = sessionId;
      lastInitialMessageCountRef.current = initialMessages?.length || 0;
      const initial = [
        ...(initialMessages || []),
        {
          type: 'divider',
          text: 'New Message',
          createdAt: new Date().toISOString(),
        },
        {
          from: 'bot',
          text: 'Halo bagaimana kabarmu, tanyakan pertanyaan IT kepadaku.',
          createdAt: new Date().toISOString(),
        },
      ];

      setMessages(insertDateDividers(initial));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, initialMessages]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  }, [messages, botDisplayedText]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (botTyping && botFullText) {
      interval = setInterval(() => {
        setBotDisplayedText((prev) => {
          if (prev.length < botFullText.length) {
            // Ambil 3 karakter berikutnya dari botFullText
            const nextLength = Math.min(prev.length + nextLengthShowByBot, botFullText.length);
            setNextLengthShowByBot(3);
            return botFullText.slice(0, nextLength);
          }
          clearInterval(interval);
          setBotTyping(false);
          setMessages((prevMsgs) => [...prevMsgs, { from: 'bot', text: botFullText }]);
          setBotFullText('');
          setBotDisplayedText('');
          return prev;
        });
      }, typingSpeed);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botTyping, botFullText]);

  const handleSend = async ({
    boxChoosed,
    attachment,
  }: {
    boxChoosed?: string;
    attachment?: File;
  }) => {
    if (!input.trim() && !boxChoosed && !attachment?.type) return;

    const question = boxChoosed ?? input.trim();
    setInput('');
    if(question === '/check-status') {
      setNextLengthShowByBot(300);
    }
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: question || '', attachment },
    ]);
    setLoading(true);
    try {
      const { response, feedbackComment } = await onSendMessage({
        question,
        attachment,
      });
      setBotFullText(response);
      setBotDisplayedText('');
      setBotTyping(true);

      if (feedbackComment) {
        try {
          const parsed = JSON.parse(feedbackComment);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map((item: { key: string; label: string }) => ({
              command: item.key,
              label: item.label,
            }));
            if (mapped.length > 0) {
              setQuickReplies(mapped);
            } else {
              setQuickReplies(defaultQuickReply);
            }
          } else {
            setQuickReplies(defaultQuickReply);
          }
        } catch {
          setQuickReplies(defaultQuickReply);
        }
      } else {
        setQuickReplies(defaultQuickReply);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Terjadi kesalahan saat menghubungi asisten IT.\nMohon coba kembali dalam beberapa menit kedepan 🙏' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: (theme) => theme.zIndex.modal, // pastikan berada di atas semua
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <ChatArea
        user={user}
        messages={messages}
        botTyping={botTyping}
        botDisplayedText={botDisplayedText}
        loading={loading}
        input={input}
        quickReplies={quickReplies}
        isHandleByIT={JSON.stringify(quickReplies) !== JSON.stringify(defaultQuickReply)}
        placeholderDots={placeholderDots}
        setInput={setInput}
        onSend={handleSend}
        fullscreen
      />
    </Box>
  );
}
