// components/ChatArea.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { JSX } from 'react/jsx-runtime';
import { m } from 'framer-motion';
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Stack from '@mui/material/Stack';
import { useTheme, alpha } from '@mui/material/styles';
import { CHAT_IT_MODE } from 'src/config-global';
import { Message } from 'src/types/chat';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/pages/paths';
import Iconify from '../iconify';
import { UploadBox } from '../upload';
import ImageFullScreenViewer from '../image/imageFullScreenViewer';

const disabledAnimation = {
  enabled: { opacity: 1, scale: 1, transition: { duration: 5.8 } },
  disabled: { opacity: 0.6, scale: 0.95, transition: { duration: 5.8 } },
};

type Props = {
  user: { name: string; photoUrl: string };
  messages: Message[];
  botTyping: boolean;
  botDisplayedText: string;
  loading: boolean;
  input: string;
  placeholderDots: string;
  setInput: (value: string) => void;
  onSend: ({ boxChoosed, attachment }: { boxChoosed?: string; attachment?: File }) => void;
  isHandleByIT?: boolean;
  fullscreen: boolean;
  quickReplies?: { command: string; label: string }[];
};

export default function ChatArea({
  user,
  messages,
  botTyping,
  botDisplayedText,
  loading,
  input,
  placeholderDots,
  setInput,
  onSend,
  isHandleByIT = false,
  fullscreen,
  quickReplies,
}: Props) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [forceBottom, setForceBottom] = useState(false);
  const isDisabled = loading || botTyping || input.trim() === '';
  const theme = useTheme();
  const lightMode = theme.palette.mode === 'light';
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const router = useRouter();

  const handleDropImage = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      onSend({ attachment: newFile });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: forceBottom ? 'instant' : 'smooth' });
      }
      setForceBottom(false);
    }, 800);
  }, [messages, botDisplayedText, forceBottom]);

  const formatMessage = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let isInCodeBlock = false;
    let codeBuffer: string[] = [];

    const renderBoldAndInlineCode = (content: string) => {
      // Pertama, split berdasarkan triple backtick untuk inline code
      const codeParts = content.split(/(```.*?```)/g); // regex match triple backtick inline

      return codeParts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          return (
            <Box
              key={`codeblock-${idx}`}
              sx={{
                backgroundColor: !lightMode
                  ? theme.palette.success.light
                  : theme.palette.success.lighter,
                color: lightMode ? 'black' : '#f8f8f2',
                fontSize: 12,
                borderRadius: 1,
                px: 1,
                py: 1.5,
                mb: 2,
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              {renderBoldAndInlineCode(part.slice(3, -3))}
            </Box>
          );
        }
        // handle bold **text** di luar inline code
        const boldParts = part.split(/(\*\*[^*]+\*\*)/);
        return boldParts.map((boldPart, boldIdx) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return <strong key={`bold-${idx}-${boldIdx}`}>{boldPart.slice(2, -2)}</strong>;
          }
          return <span key={`text-${idx}-${boldIdx}`}>{boldPart}</span>;
        });
      });
    };

    lines.forEach((line, i) => {
      if (line.trim().startsWith('```')) {
        if (isInCodeBlock) {
          // Akhiri blok kode
          elements.push(
            <Box
              key={`codeblock-${i}`}
              sx={{
                backgroundColor: !lightMode
                  ? theme.palette.success.main
                  : theme.palette.success.lighter,
                color: lightMode ? 'black' : '#f8f8f2',
                fontSize: 12,
                borderRadius: 1,
                px: 1,
                py: 1.5,
                mb: 2,
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              }}
            >
              {renderBoldAndInlineCode(codeBuffer.join('\n'))}
            </Box>
          );
          codeBuffer = [];
          isInCodeBlock = false;
        } else {
          isInCodeBlock = true;
        }
      } else if (isInCodeBlock) {
        codeBuffer.push(line);
      } else if (/^\d+\.\s/.test(line) || /^-\s/.test(line)) {
        const match = line.match(/^(\d+\.\s|-)\s?(.*)/);
        elements.push(
          <Typography
            key={i}
            variant="body2"
            component="div"
            sx={{ display: 'flex', alignItems: 'flex-start', pl: 1, mb: 0.5 }}
          >
            <Box sx={{ minWidth: 16, pr: 1 }}>{match?.[1]}</Box>
            <Box>{renderBoldAndInlineCode(match?.[2] || '')}</Box>
          </Typography>
        );
      } else if (line.trim() !== '') {
        elements.push(
          <Typography key={i} variant="body2" paragraph sx={{ mb: 0.75 }}>
            {renderBoldAndInlineCode(line)}
          </Typography>
        );
      }
    });

    return elements;
  };

  return (
    <>
      {/* HEADER */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Typography variant="h6" sx={{ color: 'grey' }}>
            <AutoAwesomeIcon sx={{ width: 18, height: 18, mr: 1, verticalAlign: 'middle' }} />
            POST Generative AI
          </Typography>
          <Typography
            sx={{ color: 'grey', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            onClick={() => router.push(paths.newTab.root)}
          >
            <Iconify icon="mdi:close" width={18} height={18} />
          </Typography>
        </Stack>
      </Box>

      {/* CHAT MESSAGES */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg, index) => {
          if (msg.type === 'divider') {
            return (
              <Box
                key={index}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  my: 1,
                  userSelect: 'none',
                }}
              >
                {/* Garis kiri */}
                <Box sx={{ flexGrow: 1, height: 1.1, bgcolor: 'divider' }} />

                {/* Teks di tengah */}
                <Typography
                  variant="body1"
                  sx={{
                    mx: 2, // margin horizontal, bisa disesuaikan
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {msg.text && formatMessage(msg.text)}
                </Typography>

                {/* Garis kanan */}
                <Box sx={{ flexGrow: 1, height: 1.1, bgcolor: 'divider' }} />
              </Box>
            );
          }

          const isUser = msg.from === 'user';
          return (
            <Stack
              key={index}
              direction="row"
              justifyContent={isUser ? 'flex-end' : 'flex-start'}
              alignItems="flex-end"
              spacing={1}
              sx={{ mb: 1 }}
            >
              {!isUser && (
                <IconButton
                  sx={{
                    width: 14,
                    height: 14,
                    color: (t) => alpha(t.palette.success.main, 1),
                  }}
                >
                  <AutoAwesomeIcon sx={{ width: 14, height: 14 }} />
                </IconButton>
              )}
              <Paper
                sx={(t) => {
                  const { palette } = t;

                  let backgroundColor: string;
                  if (isUser) {
                    backgroundColor = lightMode ? palette.primary.light : palette.primary.dark;
                  } else {
                    backgroundColor = lightMode ? palette.grey[200] : palette.grey[700];
                  }

                  return {
                    p: 2,
                    maxWidth: '600px',
                    backgroundColor,
                  };
                }}
              >
                <Box sx={{ flexGrow: 1, height: 1, bgcolor: 'divider' }} />
                {msg.attachment && (
                  // <Box
                  //   component="img"
                  //   src={URL.createObjectURL(msg.attachment)}
                  //   alt={msg.attachment?.name}
                  //   sx={{ maxWidth: 200, borderRadius: 2, mt: 1 }}
                  //   onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} // Cleanup
                  // />
                  <ImageFullScreenViewer
                    url={URL.createObjectURL(msg.attachment)}
                    alt={msg.attachment?.name}
                    maxWidth={isXs ? 200 : 400}
                  />
                )}
                {msg.text?.includes('https://storage.googleapis.com/certificateofquality') ? (
                  <ImageFullScreenViewer
                    url={msg.text}
                    alt={msg.text}
                    maxWidth={isXs ? 200 : 400}
                  />
                ) : (
                  <Typography variant="body2">{msg.text ? formatMessage(msg.text) : ''}</Typography>
                )}
              </Paper>
              {isUser && (
                <Avatar src={user?.photoUrl} alt={user?.name} sx={{ width: 28, height: 28 }}>
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Stack>
          );
        })}

        {botTyping && (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="flex-start"
            alignItems="flex-end"
            sx={{ mb: 1 }}
          >
            <IconButton sx={{ width: 14, height: 14 }}>
              <AutoAwesomeIcon sx={{ width: 14, height: 14 }} />
            </IconButton>
            <Paper
              sx={(t) => {
                const { palette } = t;
                const backgroundColor = lightMode ? palette.grey[200] : palette.grey[700];

                return {
                  p: 2,
                  maxWidth: '600px',
                  backgroundColor,
                };
              }}
            >
              <Typography variant="body2">{formatMessage(botDisplayedText)}</Typography>
            </Paper>
          </Stack>
        )}

        {loading && !botTyping && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            sedang mengetik...
          </Typography>
        )}

        <div ref={chatEndRef} />

        {CHAT_IT_MODE && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, ml: 1, px: 2, flexWrap: 'wrap', gap: 1 }}>
            {!isHandleByIT &&
              !(botTyping || loading) &&
              quickReplies?.map((option) => {
                // Optional: Filter jika perlu
                if (option.command === '/pengajuan-via-form')
                  return (
                    <Box
                      key={option.command}
                      component="button"
                      type="button"
                      onClick={() => {
                        router.push(paths.newTab.newTicketIT);
                      }}
                      sx={(t) => {
                        const { palette } = t;
                        const backgroundColor = lightMode ? palette.grey[300] : palette.grey[700];

                        return {
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: 2,
                          border: 0,
                          fontSize: 12,
                          backgroundColor,
                          color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                        };
                      }}
                    >
                      {option.label}
                    </Box>
                  );

                return (
                  <Box
                    key={option.command}
                    component="button"
                    type="button"
                    onClick={() => {
                      onSend({ boxChoosed: option.command });
                    }}
                    sx={(t) => {
                      const { palette } = t;
                      const backgroundColor = lightMode ? palette.grey[300] : palette.grey[700];

                      return {
                        cursor: 'pointer',
                        padding: '6px 12px',
                        borderRadius: 2,
                        border: 0,
                        fontSize: 12,
                        backgroundColor,
                        color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      };
                    }}
                  >
                    {option.label}
                  </Box>
                );
              })}
          </Stack>
        )}
      </Box>

      {/* INPUT */}
      <Box
        sx={{
          px: 2,
          pb: fullscreen ? 3 : 2,
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {(botTyping || loading) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 1 }}>
            <AutoAwesomeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              PGA sedang mengetik{placeholderDots}
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowY: 'auto',
            width: '100%',
          }}
        >
          {!isHandleByIT ? (
            <TextField
              sx={{
                fontSize: {
                  xs: '1rem', // 16px → supaya tidak zoom-in di mobile
                  sm: '0.875rem', // 14px untuk screen >600px (opsional)
                },
                // kadang perlu juga set fontSize ke input root-nya:
                '& .MuiInputBase-input': {
                  fontSize: {
                    xs: '1rem',
                    sm: '0.875rem',
                  },
                },
              }}
              fullWidth
              size={!isXs ? 'small' : 'medium'}
              placeholder="Tanyakan sesuatu mengenai IT..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend({})}
              disabled={loading || botTyping}
            />
          ) : (
            quickReplies?.map((option) => {
              if (option.command === '/1-isi-nomor-telepon') {
                return (
                  <TextField
                    sx={{
                      fontSize: {
                        xs: '1rem', // 16px → supaya tidak zoom-in di mobile
                        sm: '0.875rem', // 14px untuk screen >600px (opsional)
                      },
                      // kadang perlu juga set fontSize ke input root-nya:
                      '& .MuiInputBase-input': {
                        fontSize: {
                          xs: '1rem',
                          sm: '0.875rem',
                        },
                      },
                    }}
                    key={option.command}
                    fullWidth
                    size={!isXs ? 'small' : 'medium'}
                    placeholder="Isi Nomor Telepon Anda"
                    value={input}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const digitsOnly = raw.replace(/\D/g, ''); // \D = non-digit
                      const normalized = digitsOnly.replace(/^0+|^62/, '');
                      setInput(digitsOnly ? `/62${normalized}` : '');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && onSend({})}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '\\d*',
                    }}
                    disabled={loading || botTyping}
                  />
                );
              }
              if (option.command === '/1-isi-deskripsi') {
                return (
                  <TextField
                    sx={{
                      fontSize: {
                        xs: '1rem', // 16px → supaya tidak zoom-in di mobile
                        sm: '0.875rem', // 14px untuk screen >600px (opsional)
                      },
                      // kadang perlu juga set fontSize ke input root-nya:
                      '& .MuiInputBase-input': {
                        fontSize: {
                          xs: '1rem',
                          sm: '0.875rem',
                        },
                      },
                    }}
                    key={option.command}
                    fullWidth
                    size={!isXs ? 'small' : 'medium'}
                    placeholder="Isi Deskripsi Kendala Anda..."
                    value={input}
                    multiline
                    rows={4}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInput(val.startsWith('/') ? val : `/${val}`);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && onSend({})}
                    disabled={loading || botTyping}
                  />
                );
              }
              if (option.command === '/1-isi-attachment') {
                return (
                  <UploadBox
                    accept={{
                      'image/*': [],
                    }}
                    onDrop={handleDropImage}
                    placeholder={
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Iconify icon="eva:cloud-upload-fill" width={20} />
                        <Typography variant="body2">Upload Image</Typography>
                      </Stack>
                    }
                    sx={{ flexGrow: 1, height: 'auto', py: 1 }}
                  />
                );
              }
              // skip
              if (option.command === '/restart-session') {
                if (botTyping) {
                  return <Skeleton sx={{ height: 36 }} />;
                }
                return (
                  <Box
                    key={option.command}
                    component="button"
                    type="button"
                    onClick={() => {
                      onSend({ boxChoosed: option.command });
                    }}
                    sx={(t) => {
                      const { palette } = t;
                      const backgroundColor = lightMode ? palette.info.light : palette.info.dark;

                      return {
                        cursor: 'pointer',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 2,
                        border: 0,
                        fontSize: 14,
                        backgroundColor,
                        color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      };
                    }}
                  >
                    {option.label}
                  </Box>
                );
              }
              // skip
              if (option.command === '/skip') {
                if (botTyping) {
                  return <Skeleton sx={{ width: 50, height: 36 }} />;
                }
                return (
                  <Box
                    key={option.command}
                    component="button"
                    type="button"
                    onClick={() => {
                      onSend({ boxChoosed: option.command });
                    }}
                    maxWidth={50}
                    sx={(t) => {
                      const { palette } = t;
                      const backgroundColor = lightMode
                        ? palette.warning.light
                        : palette.warning.dark;

                      return {
                        cursor: 'pointer',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 2,
                        border: 0,
                        fontSize: 14,
                        backgroundColor,
                        color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      };
                    }}
                  >
                    {option.label}
                  </Box>
                );
              }
              // kembali
              if (option.command === '/0') {
                if (botTyping) {
                  return <Skeleton sx={{ width: 100, height: 36 }} />;
                }
                return (
                  <Box
                    key={option.command}
                    component="button"
                    type="button"
                    onClick={() => {
                      setForceBottom(true);
                      onSend({ boxChoosed: option.command });
                    }}
                    maxWidth={100}
                    sx={(t) => {
                      const { palette } = t;
                      const backgroundColor = lightMode ? palette.error.light : palette.error.dark;

                      return {
                        cursor: 'pointer',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 2,
                        border: 0,
                        fontSize: 14,
                        backgroundColor,
                        color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      };
                    }}
                  >
                    {option.label}
                  </Box>
                );
              }
              return botTyping ? (
                <Skeleton sx={{ width: '100%', height: 36 }} />
              ) : (
                <Box
                  key={option.command}
                  component="button"
                  type="button"
                  onClick={() => {
                    if (botTyping) return;
                    onSend({ boxChoosed: option.command });
                  }}
                  sx={(t) => {
                    const { palette } = t;
                    const backgroundColor = lightMode ? palette.grey[300] : palette.grey[700];

                    return {
                      cursor: 'pointer',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 2,
                      border: 0,
                      fontSize: 14,
                      backgroundColor,
                      color: lightMode ? 'text.secondary' : t.palette.primary.contrastText,
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    };
                  }}
                >
                  {option.label}
                </Box>
              );
            })
          )}
          {(!isHandleByIT || input.trim() !== '') && (
            <IconButton
              component={m.button}
              onClick={() => onSend({})}
              disabled={isDisabled}
              animate={isDisabled ? 'disabled' : 'enabled'}
              variants={disabledAnimation}
              whileHover={!isDisabled ? 'hover' : undefined}
              whileTap={!isDisabled ? 'tap' : undefined}
              sx={{
                width: 38,
                height: 38,
                color: 'white',
                background: (t) => alpha(t.palette.success.main, 1),
                borderRadius: '30%',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                  color: 'white',
                  background: (t) => alpha(t.palette.success.dark, 1),
                },
              }}
              aria-label="send message"
              type="button"
            >
              <Iconify icon="mynaui:send" width={30} height={30} />
            </IconButton>
          )}
        </Box>
      </Box>
    </>
  );
}
