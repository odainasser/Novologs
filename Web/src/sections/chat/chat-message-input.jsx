import React, { useRef, useState, useCallback, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import { addFile } from 'src/actions/file/fileActions';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { FileThumbnail } from 'src/components/file-thumbnail';

import { Box, Tooltip, Typography } from '@mui/material';
import mime from 'mime-types';

import { useTranslation } from 'react-i18next';

import { AudioRecorder } from 'react-audio-voice-recorder';
import ReactPlayer from 'react-player';
import VoiceRecorder from './view/AudioRecorderFiles.js/index.jsx';
import { v4 as uuidv4 } from 'uuid';
import * as signalR from '@microsoft/signalr';

import { List, ListItem, ListItemText, ListItemAvatar, Paper, Avatar } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';

export function ChatMessageInput({
  disabled,
  user,
  selectedConversationId,
  onSendMessage,
  replyMessage,
  onCancelReply,
  mutateChatRooms,
  mutateMessages,
  changeDeliveryStatus,
  setReceiverIds,
  participants,
}) {
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState([]);
  const [loadingFileId, setLoadingFileId] = useState(null);
  // audio setup state and ref
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer for elapsed time
  const [audioUrl, setAudioUrl] = useState(null);
  const emojiPickerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const connectionRef = useRef(null);
  const isOnline = () => navigator.onLine;
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentions, setMentions] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };
  useEffect(() => {
    const onOnline = () => toast.success('Back online. Retrying uploads...');
    const onOffline = () => toast.warning('You are offline');

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  useEffect(() => {
    const retryOnReconnect = () => {
      if (attachedFile?.status === 'failed') {
        retryFileUpload();
      }
    };

    window.addEventListener('online', retryOnReconnect);
    return () => window.removeEventListener('online', retryOnReconnect);
  }, [attachedFile]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // audio setup state and ref

  const supportedFileTypes = {
    images: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
    documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  };
  console.log('this is the attachedFile', attachedFile);

  //audio setup functions

  // Start recording

  const startRecording = async () => {
    try {
      if (isAudioUploading) return;

      setAudioUrl(null);
      setElapsedTime(0);

      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await uploadAudio(audioBlob);
        } catch (error) {
          console.error('Error after stopping recording:', error);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Unable to access microphone');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setIsRecording(false);
    }
  };

  // Discard recording
  const discardRecording = () => {
    setAudioUrl(null);
    setElapsedTime(0);
    audioChunksRef.current = [];
  };

  const uploadAudio = async (audioBlob) => {
    console.log('this is the audio blob', audioBlob);

    setIsAudioUploading(true);

    try {
      const audioFile = new File([audioBlob], 'record.webm', { type: 'audio/webm' });

      const uniqueIdentifier = 'file_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const uniqueFileName = `${uniqueIdentifier}_${audioFile.name}`;

      const filePayload = {
        name: uniqueFileName,
        file: audioFile,
        // parentFolderPath: '/BIN',
        entityType: 11,
        entityId: selectedConversationId,
      };

      console.log('this is the file payload', filePayload);

      const uploadedFile = await addFile(filePayload);
      console.log('this is the result', uploadedFile);

      if (uploadedFile.success) {
        const fileResponse = uploadedFile?.response?.data?.successStatus;

        if (fileResponse) {
          setAudioUrl(fileResponse.url);
          toast.success('Audio uploaded successfully.');
        } else {
          toast.error('Audio upload failed.');
        }
      } else {
        toast.error(uploadedFile.error);
        console.error('Upload error:', uploadedFile.error);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Error uploading audio');
    } finally {
      setIsAudioUploading(false);
    }
  };

  const handleSendAudioMessage = () => {
    console.log('audiourl', audioUrl);
  };

  //audio setup functions end

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const isValidFileType = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return supportedFileTypes.images.includes(ext) || supportedFileTypes.documents.includes(ext);
  };

  const handleFileChange = useCallback(
    async (event) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;

      const tempFiles = files.map((file) => ({
        id: uuidv4(),
        name: file.name,
        rawFile: file,
        status: 'uploading',
        url: null,
      }));

      setAttachedFile((prev) => [...prev, ...tempFiles]);

      if (!navigator.onLine) {
        setAttachedFile((prev) =>
          prev.map((item) =>
            tempFiles.some((f) => f.id === item.id) ? { ...item, status: 'failed' } : item
          )
        );
        toast.error('No internet. Files saved. Tap retry when online.');
        return;
      }

      for (const tempFile of tempFiles) {
        try {
          const uploadedFile = await addFile({
            name: tempFile.name,
            file: tempFile.rawFile,
            entityType: 11,
            entityId: selectedConversationId,
          });

          if (uploadedFile.success) {
            const fileResponse = uploadedFile?.response?.data?.successStatus;

            if (fileResponse) {
              setAttachedFile((prev) =>
                prev.map((item) =>
                  item.id === tempFile.id ? { ...fileResponse, status: 'uploaded' } : item
                )
              );
            }
          } else {
            setAttachedFile((prev) =>
              prev.map((item) =>
                item.id === tempFile.id ? { ...tempFile, status: 'failed' } : item
              )
            );
            toast.error(uploadedFile.error);
          }
        } catch (err) {
          setAttachedFile((prev) =>
            prev.map((item) => (item.id === tempFile.id ? { ...tempFile, status: 'failed' } : item))
          );
          toast.error(`Upload failed: ${tempFile.name}`);
        }
      }

      toast.success('Files attached successfully');

      if (fileRef.current) fileRef.current.value = '';
    },
    [selectedConversationId]
  );
  const retryFileUpload = async () => {
    if (!attachedFile?.rawFile) return;

    if (!navigator.onLine) {
      toast.error('Still offline');
      return;
    }

    setAttachedFile({ ...attachedFile, status: 'uploading' });

    try {
      const uploadedFile = await addFile({
        name: attachedFile.name,
        file: attachedFile.rawFile,
        // parentFolderPath: '/BIN',
        entityType: 11,
        entityId: selectedConversationId,
      });
      if (uploadedFile.success) {
        const fileResponse = uploadedFile?.response?.data?.successStatus;

        if (fileResponse) {
          setAttachedFile({
            ...fileResponse,
            status: 'uploaded',
          });
          toast.success('File uploaded');
        }
      } else {
        setAttachedFile({ ...attachedFile, status: 'failed' });
        toast.error(uploadedFile.error);
        console.error('Upload error:', uploadedFile.error);
      }
    } catch (e) {
      setAttachedFile({ ...attachedFile, status: 'failed' });
      toast.error('Retry failed');
    }
  };

  console.log('this is the attached file', attachedFile);
  const handleChangeMessage = useCallback((event) => {
    const newMessage = event.target.value;
    setMessage(newMessage);

    const cursorIndex = event.target.selectionStart;
    const textBeforeCursor = newMessage.slice(0, cursorIndex);

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping();
    }, 500);
  }, []);
  const filteredParticipants = participants?.filter((p) =>
    p.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );
  const handleSelectMention = (participant) => {
    const mentionText = `@${participant.name}`;

    const newText = message.replace(/@\w*$/, mentionText + ' ');

    setMessage(newText);

    setMentions((prev) => [
      ...prev,
      {
        id: participant.id,
        name: participant.name,
        email: participant.email,
      },
    ]);

    setShowMentionList(false);
  };

  // Utility functions
  const determineContentType = (message, attachedFiles) => {
    const files = Array.isArray(attachedFiles)
      ? attachedFiles
      : attachedFiles
        ? [attachedFiles]
        : [];

    if (files.length) {
      const hasOnlyImages = files.every((file) => /^image\//i.test(file.mimeType || ''));

      if (hasOnlyImages) return 'image';

      return 'file';
    }

    return 'text';
  };

  const buildAttachments = (attachedFiles) => {
    const files = Array.isArray(attachedFiles)
      ? attachedFiles
      : attachedFiles
        ? [attachedFiles]
        : [];

    return files
      .filter((file) => file?.url)
      .map((file) => ({
        fileName: file.name || '',
        fileType: file.mimeType || 'application/octet-stream',
        url: file.url,
      }));
  };
  const handleTyping = () => {
    if (!selectedConversationId || !user?.id) return;

    // Send "Typing" payload
    const typingPayload = {
      PayLoad: 'Typing',
      SenderId: user.id,
      ChatRoomIds: [selectedConversationId],
      RealTime: true,
    };

    onSendMessage(typingPayload);
  };
  const handleSendMessage = useCallback(
    async (event) => {
      if (isSending) return;

      if (event?.key && event.key !== 'Enter') return;
      if (event?.shiftKey && event.key === 'Enter') return;

      const currentMessage = message.trim();
      const currentAttachedFile = attachedFile;
      const currentAudioUrl = audioUrl;
      const currentMentions = mentions;

      if (!currentMessage && !currentAttachedFile?.length && !currentAudioUrl) return;
      if (!selectedConversationId) return;

      setIsSending(true);

      setMessage('');
      setAttachedFile([]);
      setAudioUrl(null);
      setMentions([]);

      try {
        const replyParentId = replyMessage ? replyMessage.id : null;

        const replyBody = replyMessage
          ? {
              senderName: replyMessage.senderName || 'Unknown',
              parentContentBody: {
                attachments: replyMessage.attachments || [],
                body: replyMessage.body || '',
                contentType: replyMessage.contentType || 'text',
              },
            }
          : null;

        let contentType = 'text';
        let attachments = [];

        if (currentAudioUrl) {
          contentType = 'audio';
          attachments = [
            {
              fileName: 'record.mp3',
              fileType: 'audio/mpeg',
              url: currentAudioUrl,
            },
          ];
        } else if (currentAttachedFile?.length) {
          for (const file of currentAttachedFile) {
            const fileContentType = determineContentType('', [file]);
            const fileAttachments = buildAttachments([file]);

            const payloadObject = {
              body: currentMessage,
              contentType: fileContentType,
              attachments: fileAttachments,
              mentions: currentMentions,
              ReplyBody: replyBody,
              replyParentId,
              Forwarded: false,
            };

            const messageId = uuidv4();

            const signalRMessage = {
              RealTime: false,
              MessageId: messageId,
              SenderId: user?.id,
              ChatRoomIds: [selectedConversationId],
              RecieverIds: [],
              PayLoad: JSON.stringify(payloadObject),
              NotificationTitle: 'New Message',
              NotificationBody: 'New Message',
            };

            await onSendMessage(signalRMessage);

            await changeDeliveryStatus({
              MessageId: messageId,
              SenderId: user?.id,
              status: 0,
            });
          }

          return;
        }

        const payloadObject = {
          body: currentMessage,
          contentType,
          attachments,
          mentions: currentMentions,
          ReplyBody: replyBody,
          replyParentId,
          Forwarded: false,
        };
        const messageId = uuidv4();

        const signalRMessage = {
          RealTime: false,
          MessageId: messageId,
          SenderId: user?.id,
          ChatRoomIds: [selectedConversationId],
          RecieverIds: [],
          PayLoad: JSON.stringify(payloadObject),
          NotificationTitle: 'New Message',
          NotificationBody: 'New Message',
        };

        console.log('this is the offline msg', signalRMessage);

        if (replyMessage && onCancelReply) onCancelReply();

        await onSendMessage(signalRMessage);
        await changeDeliveryStatus({
          MessageId: messageId,
          SenderId: user?.id,
          status: 0,
        });

        const receiverIds = Array.from(
          new Set([...(participants?.map((p) => p?.id) || []), user?.id])
        ).map((id) => ({ id }));
        setReceiverIds(receiverIds);
      } catch (error) {
        toast.error('Failed to send the message.');
      } finally {
        setIsSending(false);
      }
    },
    [
      isSending,
      mentions,
      message,
      audioUrl,
      attachedFile,
      user,
      selectedConversationId,
      replyMessage,
      onCancelReply,
      onSendMessage,
      changeDeliveryStatus,
      participants,
      setReceiverIds,
    ]
  );

  const handleDeleteUploadedFile = useCallback(async (fileId) => {
    setLoadingFileId(fileId);
    try {
      setAttachedFile((prev) => prev.filter((file) => file.id !== fileId));
      toast.success('File removed successfully.');
    } finally {
      setLoadingFileId(null);
    }
  }, []);

  const isImage = (input) => {
    if (!input || typeof input !== 'string') return false;
    const ext = input.split('.').pop().toLowerCase();
    return supportedFileTypes.images.includes(ext);
  };
  // Function to render the reply message content
  const renderReplyContent = () => {
    if (!replyMessage) return null;

    const { body, attachments } = replyMessage;

    // Function to check if the attachment is an image
    const isAttachmentImage = (attachment) => {
      const mimeType = attachment?.type || attachment?.fileType || '';
      const ext = attachment?.url?.split('.').pop()?.toLowerCase();

      return (
        mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)
      );
    };

    // Check if there's an attachment
    if (attachments && attachments.length > 0) {
      const attachment = attachments[0];
      console.log('this is the attachment', attachment);

      if (isAttachmentImage(attachment)) {
        return (
          <Box
            sx={{
              mb: 1,
              p: 1,
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default',
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <IconButton
              size="small"
              onClick={onCancelReply}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <Iconify icon="eva:close-outline" width={16} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', ...(storedLang === 'ar' && { mr: 3 }) }}
            >
              {`Replying to: ${replyMessage.senderName || 'Unknown'}`}
            </Typography>
            {body && (
              <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                {body}
              </Typography>
            )}
            {attachments.map((att) => (
              <Box key={att.id} sx={{ position: 'relative', mb: 1 }}>
                <Box
                  component="img"
                  alt={att.name}
                  src={att.url}
                  sx={{
                    width: '25%',
                    height: '25%',
                    borderRadius: 1.5,
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </Box>
        );
      } else {
        return (
          <Box
            sx={{
              mb: 1,
              p: 1,
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default',
              borderRadius: 1,
              position: 'relative',
            }}
          >
            <IconButton
              size="small"
              onClick={onCancelReply}
              sx={{ position: 'absolute', top: 4, right: 4 }}
            >
              <Iconify icon="eva:close-outline" width={16} />
            </IconButton>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', ...(storedLang === 'ar' && { mr: 3 }) }}
            >
              {`Replying to: ${replyMessage.senderName || 'Unknown'}`}
            </Typography>
            {body && (
              <Typography variant="body2" sx={{ mb: 1 }} noWrap>
                {body}
              </Typography>
            )}
            {attachments.map((att) => (
              <Stack key={att.id} direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <FileThumbnail file={att.url} tooltip={att.name} sx={{ width: 40, height: 40 }} />
                <Typography variant="body2" noWrap>
                  {att.name}
                </Typography>
              </Stack>
            ))}
          </Box>
        );
      }
    } else {
      // No attachments, render as text
      return (
        <Box
          sx={{
            mb: 1,
            p: 1,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            bgcolor: 'background.default',
            borderRadius: 1,
            position: 'relative',
          }}
        >
          {/* Close button to cancel reply */}
          <IconButton
            size="small"
            onClick={onCancelReply}
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <Iconify icon="eva:close-outline" width={16} />
          </IconButton>

          {/* Display the sender's name */}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              ...(storedLang === 'ar' && { mr: 3 }),
            }}
          >
            Replying to {replyMessage.senderName || 'Unknown'}:
          </Typography>

          {/* Display the text body */}
          <Typography variant="body2" noWrap>
            {body || '...'}
          </Typography>
        </Box>
      );
    }
  };
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1); // Update elapsed time in seconds
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [isRecording]);
  const isFileStillUploading = attachedFile?.some((file) => file.status === 'uploading');
  return (
    <>
      <Box
        sx={{
          px: 1,
          py: 1,
          borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        {/* Display the reply indicator if replyMessage is set */}
        {replyMessage && renderReplyContent()}

        {/* Display attached image prominently */}
        {attachedFile && isImage(attachedFile.url) && (
          <Box
            sx={{
              mb: 1,
              position: 'relative',
            }}
          >
            <img
              src={attachedFile.url}
              alt={attachedFile.name}
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 4,
              }}
            />
            <IconButton
              onClick={() => handleDeleteUploadedFile(attachedFile.id)}
              color="error"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              }}
              disabled={loadingFileId === attachedFile.id}
              aria-label="Delete attached image"
            >
              {loadingFileId === attachedFile.id ? (
                <CircularProgress size={24} />
              ) : (
                <Iconify icon="eva:trash-2-outline" />
              )}
            </IconButton>
          </Box>
        )}

        {/* Display attached non-image file with name */}
        {attachedFile.length > 0 && (
          <Stack spacing={1} sx={{ mb: 1 }}>
            {attachedFile.map((file) => (
              <Box
                key={file.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                }}
              >
                {file.status === 'uploading' ? (
                  <CircularProgress size={24} />
                ) : (
                  <FileThumbnail
                    file={file.url || file.name}
                    tooltip={file.name}
                    sx={{ width: 60, height: 60 }}
                  />
                )}

                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {file.name}
                </Typography>

                {file.status === 'failed' && (
                  <Tooltip title="Retry" arrow>
                    <IconButton onClick={() => retryFileUpload(file)} color="warning">
                      <Iconify icon="solar:restart-bold" />
                    </IconButton>
                  </Tooltip>
                )}

                <IconButton
                  onClick={() => handleDeleteUploadedFile(file.id)}
                  color="error"
                  disabled={loadingFileId === file.id}
                >
                  {loadingFileId === file.id ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Iconify icon="eva:trash-2-outline" />
                  )}
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
        {(isRecording || audioUrl !== null || isAudioUploading) && (
          <VoiceRecorder
            isAudioUploading={isAudioUploading}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            elapsedTime={elapsedTime}
            setElapsedTime={setElapsedTime}
            mediaRecorderRef={mediaRecorderRef}
            audioChunksRef={audioChunksRef}
            handleSendMessage={handleSendMessage}
            streamRef={streamRef}
            intervalRef={intervalRef}
            startRecording={startRecording}
            stopRecording={stopRecording}
            discardRecording={discardRecording}
            handleSendAudioMessage={handleSendAudioMessage}
          />
        )}
        {showMentionList && filteredParticipants?.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              bottom: 60,
              width: 300,
              maxHeight: 250,
              overflow: 'auto',
              zIndex: 999,
            }}
          >
            <List dense>
              {filteredParticipants.map((p) => (
                <ListItem button key={p.id} onClick={() => handleSelectMention(p)}>
                  <ListItemAvatar>
                    <Avatar src={p.avatarUrl}>{p.name?.charAt(0)}</Avatar>
                  </ListItemAvatar>

                  <ListItemText primary={p.name} secondary={p.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        {showEmojiPicker && (
          <Box
            ref={emojiPickerRef}
            sx={{
              position: 'absolute',
              bottom: 60,
              right: 10,
              zIndex: 1000,
            }}
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}
        {!isRecording && audioUrl === null && !isAudioUploading && (
          <InputBase
            name="chat-message"
            id="chat-message-input"
            value={message}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            onChange={handleChangeMessage}
            placeholder={t('chat.type_message')}
            disabled={disabled || isUploading || isSending || audioUrl !== null || isRecording}
            fullWidth
            multiline
            maxRows={4}
            endAdornment={
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                {attachedFile.length === 0 && audioUrl === null && isRecording === false && (
                  <>
                    <IconButton
                      onClick={handleAttach}
                      disabled={isUploading}
                      aria-label="Attach image"
                    >
                      <Iconify icon="solar:gallery-add-bold" />
                    </IconButton>
                    <IconButton
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isAudioUploading}
                    >
                      <Iconify
                        icon={
                          isAudioUploading
                            ? 'eos-icons:loading'
                            : isRecording
                              ? 'ic:baseline-stop'
                              : 'mdi:microphone'
                        }
                      />
                    </IconButton>
                    <IconButton
                      onClick={handleAttach}
                      disabled={isUploading}
                      aria-label="Attach file"
                    >
                      <Iconify icon="eva:attach-2-fill" />
                    </IconButton>
                    <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                      <Iconify icon="mdi:emoticon-outline" />
                    </IconButton>
                  </>
                )}

                {isUploading && <CircularProgress size={24} />}
                <IconButton
                  onClick={handleSendMessage}
                  disabled={
                    disabled ||
                    isUploading ||
                    isSending ||
                    isFileStillUploading ||
                    (!message.trim() && !attachedFile?.length && !audioUrl)
                  }
                  aria-label="Send message"
                >
                  <Iconify
                    icon="ic:round-send"
                    sx={{
                      transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </IconButton>
              </Stack>
            }
            sx={{
              px: 1,
              minHeight: 45,
              border: '1px solid',
              borderColor: (theme) => theme.palette.divider,
              borderRadius: 1,
              '& textarea': {
                maxHeight: 100,
                overflowY: 'auto',
              },
            }}
          />
        )}
      </Box>

      <input
        type="file"
        multiple
        ref={fileRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        // accept={
        //   'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain'
        // }
      />
    </>
  );
}
