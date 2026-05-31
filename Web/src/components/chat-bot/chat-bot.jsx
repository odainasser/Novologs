import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Fab,
  Paper,
  TextField,
  IconButton,
  Typography,
  Stack,
  CircularProgress,
  Avatar,
  Badge,
  Tooltip,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import zetaAxiosInstance from 'src/utils/axios-zeta';
import { ZETA_STORAGE_KEY } from 'src/auth/context/jwt/constant';
import { toast } from 'src/components/snackbar';
import { CONFIG } from 'src/config-global';
import { apiEndpoints } from 'src/utils/api-endpoints';
import { MenuItem } from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
import {useTranslation} from 'react-i18next';

const extractHtmlContent = (html) => {
  if (!html) return '';

  return html;
};

export default function ChatBot() {
  const storedLang = localStorage.getItem('selectedLang');

  const [open, setOpen] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const lastPlayedMessageIndex = useRef(null);
  const { t } = useTranslation('dashboard/chat');

  const { zetaUser, accessToken } = useAuthContext();
  const baseURL = CONFIG.zetaApiUrl;
  const models = [
    { value: 'google-gla:gemini-2.5-pro', label: t('novotak_ai.smart') },
    { value: 'google-gla:gemini-2.5-flash', label: t('novotak_ai.fast') },
    { value: 'google-gla:gemini-2.5-flash-lite-preview-06-17', label:  t('novotak_ai.lite') },
    // { value: 'openai:gpt-4o-mini', label: 'Quick (GPT-4o Mini)' },
    // { value: 'openai:gpt-4o', label: 'Balanced (GPT-4o)' },
    // { value: 'openai:gpt-4.1', label: 'Advanced (GPT-4.1)' },
    // { value: 'openai:gpt-4.1-mini', label: 'Efficient (GPT-4.1 Mini)' },
    // { value: 'openai:gpt-4.1-nano', label: 'Compact (GPT-4.1 Nano)' },
  ];
  const [selectedModel, setSelectedModel] = useState('google-gla:gemini-2.5-pro');
  const [getAudioResponse, setGetAudioResponse] = useState(false);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!open) return;

    const lastIndex = messages.length - 1;
    const lastMsg = messages[lastIndex];

    if (
      lastMsg &&
      !lastMsg.isUser &&
      lastMsg.audioUrl &&
      lastPlayedMessageIndex.current !== lastIndex
    ) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const newAudio = new Audio(lastMsg.audioUrl);
      audioRef.current = newAudio;
      newAudio.play().catch((err) => {
        console.warn('Audio playback failed:', err);
      });

      lastPlayedMessageIndex.current = lastIndex;
    }
  }, [messages, open]);
  useEffect(() => {
    if (!open && messages.length > 0) {
      const assistantMessages = messages.filter((msg) => !msg.isUser);
      setUnreadCount(assistantMessages.length);
    } else if (open) {
      setUnreadCount(0);
    }
  }, [messages, open]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);
  const cancelledRef = useRef(false);

  const startSession = async () => {
    try {
      setLoading(true);
      const zetaToken = localStorage.getItem(ZETA_STORAGE_KEY);
      const url = `${baseURL}${apiEndpoints.auth.chatBotStartSession}`;

      const response = await axios.post(
        url,
        {
          user_id: null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${zetaToken}`,
          },
        }
      );

      setSessionId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(t('novotak_ai.failed_to_add'), { variant: 'error' });

      return null;
    } finally {
      setLoading(false);
    }
  };
  const handleUploadVoice = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await sendVoiceMessage(file);
      event.target.value = '';
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      cancelledRef.current = false;
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordingIntervalRef.current);
        setRecordingTime(0);
        if (cancelledRef.current) {
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const audioFile = new File([audioBlob], `voice_${Date.now()}.mp3`, { type: 'audio/mpeg' });
        await sendVoiceMessage(audioFile);
      };

      mediaRecorder.start();
      setRecording(true);

      // Start timer
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error(t('novotak_ai.microphone_access_denied'));
    }
  };
  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    clearInterval(recordingIntervalRef.current);
  };
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };
  const handleCancelRecording = () => {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    setRecording(false);
    setRecordingTime(0);
    clearInterval(recordingIntervalRef.current);
  };

  const sendMessage = async (text, sid = null) => {
    try {
      setLoading(true);

      // If no session exists, create one
      const currentSessionId = sid || sessionId || (await startSession());

      if (!currentSessionId) return;

      // Add user message to chat
      setMessages((prev) => [...prev, { text, isUser: true }]);
      setInput('');

      // Create form data
      const formData = new FormData();
      formData.append('text_message', text);
      formData.append('model_choice', selectedModel);
      formData.append('get_audio_response', getAudioResponse.toString());

      const zetaToken = localStorage.getItem(ZETA_STORAGE_KEY);
      zetaAxiosInstance.defaults.headers.common.Authorization = `Bearer ${zetaToken}`;

      const response = await zetaAxiosInstance.post(
        `${baseURL}/agent/api/v1/sessions/${currentSessionId}/messages`,
        formData
      );
      if (
        response.data &&
        response.data.assistant_message &&
        response.data.assistant_message.content
      ) {
        const formattedContent = extractHtmlContent(response.data.assistant_message.content);
        setMessages((prev) => [
          ...prev,
          {
            text: formattedContent,
            isUser: false,
            isHtml: true,
            audioUrl: response.data.assistant_audio_url || null,
          },
        ]);
        setGetAudioResponse(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error || t('novotak_ai.failed_to_send'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const sendVoiceMessage = async (file) => {
    try {
      setLoading(true);
      const currentSessionId = sessionId || (await startSession());
      if (!currentSessionId) return;

      const formData = new FormData();
      formData.append('voice_file', file);
      formData.append('model_choice', selectedModel);
      formData.append('get_audio_response', getAudioResponse.toString());

      const zetaToken = localStorage.getItem(ZETA_STORAGE_KEY);
      zetaAxiosInstance.defaults.headers.common.Authorization = `Bearer ${zetaToken}`;

      const response = await zetaAxiosInstance.post(
        `${baseURL}/agent/api/v1/sessions/${currentSessionId}/messages`,
        formData
      );
      console.log('This is the response', response);

      if (
        response.data &&
        response.data.assistant_message &&
        response.data.assistant_message.content
      ) {
        const formattedContent = extractHtmlContent(response.data.assistant_message.content);
        setMessages((prev) => [
          ...prev,
          {
            text: formattedContent,
            isUser: false,
            isHtml: true,
            audioUrl: response.data.assistant_audio_url || null,
          },
        ]);
        setGetAudioResponse(false);
      }
    } catch (error) {
      toast.error(error || t('novotak_ai.failed_to_send_voice'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!open && !sessionId) {
      await startSession();
    }
    setOpen(!open);
    if (!open) {
      setUnreadCount(0);
    }
  };

  const handleEnlarge = () => {
    setEnlarged(!enlarged);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
  };

  // Only show the chat bot if user is authenticated
  if (!zetaUser) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        transform: 'none !important',
        transition: 'none !important',
        left: 'auto',
        top: 'auto',
      }}
    >
      {open && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 0,
            width: enlarged ? '75vw' : 350,
            height: enlarged ? '80vh' : '65vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 1,
            transition: 'width 0.3s, height 0.3s',
          }}
        >
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(266.48deg, #006A67 -23.21%, #00D0CA 82.9%)',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle1">{t('novotak_ai.name')}</Typography>
            <Box>
              <Tooltip title={enlarged ? 'Minimize' : 'Enlarge'} arrow>
                <IconButton size="small" color="inherit" onClick={handleEnlarge} sx={{ mr: 1 }}>
                  <Iconify icon={enlarged ? 'eva:collapse-fill' : 'eva:expand-fill'} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" color="inherit" onClick={handleToggle}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: 'background.paper',
            }}
          >
            <TextField
              select
              label={t("novotak_ai.select_model")}
              value={selectedModel}
              onChange={handleModelChange}
              fullWidth
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: 13000 },
                },
              }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
              }}
            >
              {models.map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  {model.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: '4px',
                background: '#006A67',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              scrollbarWidth: 'thin', // For Firefox
              scrollbarColor: '#006A67 transparent', // For Firefox
            }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  opacity: 0.7,
                }}
              >
                <Iconify icon="mdi:robot" width={48} height={48} sx={{ color: '#006A67' }} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                {t("novotak_ai.message")}
                </Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {!msg.isUser && (
                      <Avatar sx={{ width: 32, height: 32, color: '#006A67' }}>
                        <Iconify icon="mdi:robot" width={20} />
                      </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '80%',
                        background: msg.isUser
                          ? 'linear-gradient(266.48deg, #006A67 -23.21%, #00D0CA 82.9%)'
                          : 'grey.100',
                        color: msg.isUser ? '#ffffff' : 'text.primary',
                        borderRadius: 1,
                        borderTopRightRadius: msg.isUser ? 0 : 1,
                        borderTopLeftRadius: msg.isUser ? 1 : 0,
                      }}
                    >
                      {msg.isHtml ? (
                        <Box
                          dangerouslySetInnerHTML={{ __html: msg.text }}
                          sx={{
                            fontSize: enlarged ? '1rem' : '0.875rem',
                            width: '100%',
                            '& a': {
                              color: msg.isUser ? '#ffffff' : '#006A67',
                              textDecoration: 'underline',
                            },
                            '& ul, & ol': {
                              paddingLeft: 2,
                              margin: 0,
                            },
                            '& img': {
                              maxWidth: '100%',
                              height: 'auto',
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2">{msg.text}</Typography>
                      )}
                      {msg.audioUrl && (
                        <Box sx={{ mt: 1, width: enlarged ? 300 : 250 }}>
                          <audio
                            src={msg.audioUrl}
                            controls
                            style={{
                              width: '100%',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: '#f0f0f0',
                              outline: 'none',
                            }}
                          />
                        </Box>
                      )}
                    </Paper>
                    {msg.isUser && (
                      // <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                      //   <Iconify icon="eva:person-fill" width={20} />
                      // </Avatar>
                      <Avatar
                        src={
                          zetaUser?.profileImageFileUrl ||
                          zetaUser?.fullName?.charAt(0).toUpperCase()
                        }
                        sx={{ width: 40, height: 40 }}
                      />
                    )}
                  </Stack>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex' }}
          >
            <input
              accept="audio/*"
              type="file"
              onChange={handleUploadVoice}
              style={{ display: 'none' }}
              id="voice-upload"
            />
            <label htmlFor="voice-upload">
              <IconButton component="span" sx={{ color: '#006A67' }}>
                <Iconify icon="mdi:cloud-upload-outline" />
              </IconButton>
            </label>

            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={recording ? handleStopRecording : handleStartRecording}
                sx={{ color: recording ? 'error.main' : '#006A67' }}
              >
                <Iconify icon={recording ? 'mdi:stop-circle' : 'mdi:microphone'} />
              </IconButton>
              {recording && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatTime(recordingTime)}
                </Typography>
              )}
              {recording && (
                <IconButton onClick={handleCancelRecording} sx={{ color: 'warning.main' }}>
                  <Iconify icon="mdi:close-circle" />
                </IconButton>
              )}
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={getAudioResponse}
                  onChange={(e) => setGetAudioResponse(e.target.checked)}
                  sx={{
                    p: 0.5,
                    mx: 1,
                    '&.Mui-checked': {
                      color: '#006A67',
                      background: 'linear-gradient(266.48deg, #006A67 -23.21%, #00D0CA 82.9%)',
                      borderRadius: '4px',
                    },
                    '&.Mui-checked svg': {
                      background: 'linear-gradient(266.48deg, #006A67 -23.21%, #00D0CA 82.9%)',
                      borderRadius: '4px',
                      color: '#fff',
                    },
                  }}
                />
              }
              label={t("novotak_ai.get_audio_assitance")}
              sx={{
                whiteSpace: 'nowrap',
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            />

            {enlarged && (
              <>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("novotak_ai.placeholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  sx={{ mx: 1 }}
                />

                <IconButton
                  type="submit"
                  disabled={!input.trim() || loading}
                  sx={{ color: '#006A67' }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Iconify
                      icon="ic:round-send"
                      sx={{
                        transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  )}
                </IconButton>
              </>
            )}
          </Box>
          {!enlarged && (
            <Box component="form" onSubmit={handleSend} sx={{ pb: 2, display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t("novotak_ai.placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                sx={{ mx: 1 }}
              />

              <IconButton
                type="submit"
                disabled={!input.trim() || loading}
                sx={{ color: '#006A67' }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Iconify
                    icon="ic:round-send"
                    sx={{
                      transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    }}
                  />
                )}
              </IconButton>
            </Box>
          )}
        </Paper>
      )}

      <Badge
        badgeContent={unreadCount}
        color="error"
        invisible={unreadCount === 0 || open}
        sx={{
          '& .MuiBadge-badge': {
            right: 5,
            top: 5,
            zIndex: 9999,
          },
        }}
      >
        <Fab
          onClick={handleToggle}
          sx={{
            width: 56,
            height: 56,
            boxShadow: (theme) => theme.customShadows.z8,
            background: 'linear-gradient(266.48deg, #006A67 -23.21%, #00D0CA 82.9%)',
            color: 'primary.contrastText',
            position: 'relative',
            transform: 'none !important',
            transition: 'none !important',
          }}
        >
          <Iconify icon={open ? 'eva:close-fill' : 'eva:message-circle-fill'} width={24} />
        </Fab>
      </Badge>
    </Box>
  );
}
