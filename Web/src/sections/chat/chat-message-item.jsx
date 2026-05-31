import EmojiPicker from 'emoji-picker-react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { toast } from 'src/components/snackbar';
import { FormControlLabel } from '@mui/material';
import { fToNow } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { FileThumbnail } from 'src/components/file-thumbnail';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useTranslation } from 'react-i18next';
import { deleteChatMsg, updateChatMsg, transcribeMessage } from 'src/actions/chat/chatActions';
import DoneIcon from '@mui/icons-material/Done'; // Material UI single tick
import DoneAllIcon from '@mui/icons-material/DoneAll';
dayjs.extend(utc);
import SVG from 'react-inlinesvg';
import { KanbanTranscript } from 'src/sections/kanban/kanban-transcript';
import Popper from '@mui/material/Popper';
import { Paper, Chip, Divider } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
// ----------------------------------------------------------------------

export function ChatMessageItem({
  message,
  participants,
  conversations, // Object containing conversation data
  onForwardMessage, // Function to handle forwarding the message
  onReplyMessage,
  onDeleteMessage,
  mutateMessages,
  replyMessage,
  onScrollToMessage,
  receiverIds,
  messageDeliveryMap,
  toggleReaction,
}) {
  const { t } = useTranslation('dashboard/chat');
  const storedLang = localStorage.getItem('selectedLang');
  const router = useRouter();

  const { zetaUser: user } = useAuthContext();
  const { firstName, avatarUrl } = getSenderDetails(message, participants, user?.id, user);
  const { body, contentType, attachments, createdAt, mentions, isTask } = message;
  console.log('this is the message from chat item', message);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [openForwardDialog, setOpenForwardDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEmojiPickerMap, setShowEmojiPickerMap] = useState({});
  const emojiRef = useRef(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isCurrentUser = message.senderId === `${user?.id}`;
  const [deleteType, setDeleteType] = useState(1);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [failedSvgs, setFailedSvgs] = useState({});
  const [reactions, setReactions] = useState({});
  const [openTranscript, setOpenTranscript] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [selectedReactionMessage, setSelectedReactionMessage] = useState(null);
  const [selectedEmojiFilter, setSelectedEmojiFilter] = useState('ALL');
  const handleReactionClick = (event) => {
    if (reactionAnchorEl) {
      handleCloseReactionPopup();
      return;
    }

    setReactionAnchorEl(event.currentTarget);
    setSelectedReactionMessage(message);
    setSelectedEmojiFilter('ALL');
  };

  const handleCloseReactionPopup = () => {
    setReactionAnchorEl(null);
    setSelectedReactionMessage(null);
  };
  const fetchTranscript = useCallback(async () => {
    try {
      const res = await transcribeMessage(message.id);

      if (res.success) {
        const data = res.response.data?.successStatus?.audio?.description;

        const formattedTranscript = JSON.stringify({
          TranscriptStr: data?.transcriptStr || '',
          TranscriptEnglishStr: data?.transcriptEnglishStr || '',
          TranscriptArabicStr: data?.transcriptArabicStr || '',
        });

        setTranscript(formattedTranscript);

        return data?.transcriptStr || '';
      } else {
        setTranscript(null);
        toast.error(res.error || 'Failed to fetch transcript');
        return '';
      }
    } catch (err) {
      console.error('Error fetching transcript', err);
      setTranscript(null);
      toast.error('Error fetching transcript');
      return '';
    }
  }, [message.id]);
  const handleOpenTranscriptDialog = async () => {
    setLoadingAction('transcript');
    setLoadingTranscript(true);

    try {
      if (!transcript) {
        await fetchTranscript();
      }
      setOpenTranscript(true);
    } finally {
      setLoadingTranscript(false);
      setLoadingAction(null);
    }
  };
  const handleTranscriptDialogClose = () => {
    setTimeout(() => {
      setOpenTranscript(false);
    }, 100);
  };
  useEffect(() => {
    setReactions(message.reactions || []);
  }, [message.reactions]);
  const handleCheckboxChange = (type) => {
    setDeleteType(type);
  };
  const handleEmojiClick = (emojiData, messageId) => {
    const emoji = emojiData.emoji;

    if (editingMessageId === messageId) {
      setEditedBody((prev) => prev + emoji);
      return;
    }

    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);

      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji
            ? {
                ...r,
                count: r.currentUserReacted ? r.count - 1 : r.count + 1,
                currentUserReacted: !r.currentUserReacted,
              }
            : r
        );
      }

      return [...prev, { emoji, count: 1, currentUserReacted: true, users: [] }];
    });

    // 🔥 SignalR
    toggleReaction?.(messageId, emoji);

    // ✅ Close emoji picker
    setAnchorEl(null);
    setSelectedMessageId(null);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setAnchorEl(null);
        setSelectedMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleImageLoad = () => setIsLoadingImage(false);
  const receiverStatus = message.msgReceivers
    ?.filter((r) => r.reciever.id !== message.senderId)
    .reduce((max, r) => (r.status > max ? r.status : max), 0);

  const deliveryStatus = messageDeliveryMap[message.messageId] || 0;
  const renderMessageWithMentions = () => {
    if (!mentions?.length) return body;

    let parts = [body];

    mentions.forEach((mention) => {
      const mentionText = `@${mention.name}`;

      parts = parts.flatMap((part) => {
        if (typeof part !== 'string') return [part];

        return part.split(mentionText).flatMap((chunk, index, arr) =>
          index < arr.length - 1
            ? [
                chunk,
                <Typography
                  component="span"
                  key={`${mention.id}-${index}`}
                  sx={{
                    color: '#006A67',
                  }}
                >
                  {mentionText}
                </Typography>,
              ]
            : [chunk]
        );
      });
    });

    return parts;
  };
  const getTickIcon = () => {
    if (!isCurrentUser) return null;

    // 👇 OFFLINE / PENDING MESSAGE
    if (message.status === 'PENDING') {
      return <Iconify icon="mdi:clock-outline" width={16} sx={{ color: 'text.disabled' }} />;
    }

    switch (deliveryStatus || receiverStatus) {
      case 0:
        return <Iconify icon="mdi:check" width={16} color="text.secondary" />;
      case 1:
        return <Iconify icon="mdi:check-all" width={16} color="text.secondary" />;
      case 2:
        return <Iconify icon="mdi:check-all" width={16} color="#2196f3" />;
      default:
        return null;
    }
  };

  // Handle delete click
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleReplyClick = () => {
    if (onReplyMessage) {
      const senderDetails = getSenderDetails(message, participants, user?.id, user);
      onReplyMessage({
        ...message,
        senderName: senderDetails.firstName, // Add senderName to the message
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (message?.id) {
      try {
        const response = await deleteChatMsg(message.id, deleteType);
        if (response.success) {
          setOpenDeleteDialog(false);
          await mutateMessages();
        } else {
          console.log(response.error || 'Failed to delete message.');
          toast.error(response.error || 'Failed to delete message');
        }
      } catch (error) {
        console.error('Unexpected error while deleting message:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    // Close the dialog
    setOpenDeleteDialog(false);
  };

  const handleForwardClick = () => {
    setOpenForwardDialog(true);
  };
  const isTextMessage = contentType?.toLowerCase() === 'text';
  const isAudioMessage = contentType?.toLowerCase() === 'audio';
  const canCreateTask = !isTask && ((isTextMessage && body) || isAudioMessage);
  const handleCreateTask = useCallback(async () => {
    let taskDescription = body || '';

    setLoadingAction('task');
    setLoadingTranscript(true);

    try {
      if (contentType?.toLowerCase() === 'audio') {
        if (transcript) {
          const parsed = JSON.parse(transcript);
          taskDescription = parsed?.TranscriptStr || '';
        } else {
          taskDescription = await fetchTranscript();
        }
      }

      sessionStorage.setItem(
        'chatTaskDescription',
        JSON.stringify({
          description: taskDescription,
          messageId: message.id,
        })
      );

      router.push(paths.dashboard.kanban.list);
    } catch (err) {
      console.error('Error creating task from message', err);
      toast.error('Failed to create task');
    } finally {
      setLoadingTranscript(false);
      setLoadingAction(null);
    }
  }, [body, contentType, transcript, fetchTranscript, message.id, router]);

  const handleToggleConversation = (conversationId) => {
    setSelectedConversations((prevSelected) => {
      if (prevSelected.includes(conversationId)) {
        return prevSelected.filter((id) => id !== conversationId);
      } else {
        return [...prevSelected, conversationId];
      }
    });
  };

  const handleSendForwardedMessage = () => {
    if (onForwardMessage) {
      onForwardMessage(message, selectedConversations);
    }

    // Reset state
    setOpenForwardDialog(false);
    setSelectedConversations([]);
    setSearchQuery('');
  };

  const handleCancelForwarding = () => {
    setOpenForwardDialog(false);
    setSelectedConversations([]);
    setSearchQuery('');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUpdateMessage = async () => {
    console.log('Updated Message Body:', editedBody);

    try {
      const replyParentId = message.replyTo?.parentId || null;

      const replyBody = message.replyTo
        ? {
            senderName: message.replyTo.senderName || 'Unknown',
            parentContentBody: {
              attachments: message.replyTo.parentAttachments || [],
              body: message.replyTo.parentBody || '',
              contentType: 'text',
            },
          }
        : null;
      let contentType = 'text';
      let attachments = [];
      const payloadObject = {
        body: editedBody.trim(),
        contentType,
        attachments,
        ReplyBody: replyBody,
        replyParentId: replyParentId,
        Forwarded: false,
      };
      const payload = {
        id: message.id,
        payLoad: JSON.stringify(payloadObject),
      };
      console.log('this is the payload sklhfukdahfgdsufghsf', payload);

      const result = await updateChatMsg(payload);
      if (result.success) {
        setEditingMessageId(null);
        toast.success('Chat updated successfully');
        await mutateMessages();
      } else {
        toast.error(result.error || 'Failed to update chat');
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const filteredConversations = conversations.allIds.filter((conversationId) => {
    const conversation = conversations.byId[conversationId];
    const conversationName =
      conversation.type === 'GROUP'
        ? conversation.groupName
        : conversation.participants[0]?.name || 'Unknown';

    return conversationName?.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const displayTime = createdAt === '0001-01-01T00:00:00' ? dayjs() : dayjs.utc(createdAt).local();
  const renderInfo = (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ mb: 1, ...(!isCurrentUser && { mr: 'auto' }) }}
    >
      <Typography
        noWrap
        variant="caption"
        sx={{ mb: 1, color: 'text.disabled', ...(!isCurrentUser && { mr: 'auto' }) }}
      >
        {!isCurrentUser && `${firstName}, `}
        {fToNow(displayTime)} ago
      </Typography>
      {getTickIcon()}
    </Stack>
  );

  const renderContent = () => {
    const isForwarded = message.isForwarded;
    const replyTo = message.replyTo; // Assuming replyTo is another message object
    console.log('this is replying to', replyTo);
    // Render the reply or forwarded header if applicable
    const renderHeader = () => {
      if (isForwarded) {
        return (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <Iconify icon="eva:share-forward-outline" width={16} sx={{ color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Forwarded
            </Typography>
          </Stack>
        );
      } else if (replyTo) {
        // Display the reply content
        return (
          <Box
            onClick={() => {
              console.log(
                '[ChatMessageItem] Reply clicked. Scrolling to message ID:',
                replyTo?.parentId
              );
              onScrollToMessage && replyTo?.parentId && onScrollToMessage(replyTo.parentId);
            }}
            sx={{
              p: 1,
              mb: 1,
              // borderLeft: '4px solid',
              // borderColor: 'primary.main',
              bgcolor: 'background.default',
              cursor: 'pointer',
              transition: (theme) =>
                theme.transitions.create('background-color', {
                  duration: theme.transitions.duration.shorter,
                }),
              '&:hover': { bgcolor: 'action.hover' },
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {replyTo.senderName || 'Unknown'}:
            </Typography>

            {/* If the original message had text */}
            {replyTo.parentBody && (
              <Typography variant="body2" noWrap>
                {replyTo.parentBody}
              </Typography>
            )}

            {/* If the original message had attachments */}
            {replyTo?.parentAttachments?.length > 0 &&
              replyTo.parentAttachments.map((att, index) => (
                <Stack
                  key={att.id || att.url || att.fileName || index}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  {att.type?.startsWith('image/') || att.fileType?.startsWith('image/') ? (
                    <img
                      src={att.preview || att.url}
                      alt={att.name || att.fileName}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : att.type?.startsWith('video/') || att.fileType?.startsWith('video/') ? (
                    <video width="100" height="60" style={{ borderRadius: 4 }} controls>
                      <source src={att.preview || att.url} type={att.type || att.fileType} />
                      Your browser does not support the video tag.
                    </video>
                  ) : att.type?.startsWith('application/') ||
                    att.fileType?.startsWith('application/') ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FileThumbnail file={att.url} tooltip={att.name || att.fileName} />

                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexGrow: 1 }}>
                        <Tooltip title={att.name || att.fileName}>
                          <Typography
                            variant="body2"
                            sx={{
                              flexGrow: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '180px',
                            }}
                          >
                            {att.name || att.fileName
                              ? (att.name || att.fileName).length > 20
                                ? `${(att.name || att.fileName).slice(0, 20)}...`
                                : att.name || att.fileName
                              : ''}
                          </Typography>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  ) : (
                    <>
                      <Iconify icon="eva:attach-outline" width={16} />
                      <Typography variant="body2" noWrap>
                        {att.name || att.fileName}
                      </Typography>
                    </>
                  )}
                </Stack>
              ))}
          </Box>
        );
      }
      return null;
    };

    switch (contentType) {
      case 'typing':
      case 'TYPING': {
        const typingBoxStyles = {
          p: 1,
          minWidth: 48,
          maxWidth: 120,
          borderRadius: 1,
          typography: 'body2',
          fontStyle: 'italic',
          bgcolor: 'background.neutral',
          color: 'text.secondary',
          fontWeight: 500,
          ...(isCurrentUser && {
            bgcolor: 'powderblue',
            color: 'grey.800',
          }),
        };

        return <Box sx={typingBoxStyles}>...</Box>;
      }

      case 'image':
      case 'IMAGE': {
        const imageBoxStyles = {
          minWidth: 48,
          maxWidth: 300,
          borderRadius: 1,
          // ...(isCurrentUser && {
          //   color: 'grey.800',
          //   background: 'powderblue',
          // }),
        };

        return (
          <Box sx={imageBoxStyles}>
            {renderHeader()}

            {body && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {renderMessageWithMentions()}
              </Typography>
            )}

            {attachments?.map((att) => {
              const isSvg =
                att.fileType === 'image/svg+xml' ||
                att.type === 'image/svg+xml' ||
                att.url?.toLowerCase().endsWith('.svg');

              const hasFailed = failedSvgs[att.url];

              return (
                <Box key={att.id} sx={{ mb: 1 }}>
                  {isSvg ? (
                    !hasFailed ? (
                      <Box
                        component="img"
                        src={att.url}
                        alt={att.fileName}
                        onError={() => setFailedSvgs((prev) => ({ ...prev, [att.url]: true }))}
                        sx={{
                          width: 120,
                          height: 120,
                          objectFit: 'contain',
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <Button
                        component="a"
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: '#006A67',
                          '&:hover': { bgcolor: '#00524f' },
                          textTransform: 'none',
                        }}
                      >
                        Open SVG
                      </Button>
                    )
                  ) : (
                    <Box
                      component="img"
                      src={att.url}
                      alt={att.fileName}
                      sx={{
                        width: '100%',
                        maxWidth: 300,
                        borderRadius: 1.5,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        );
      }

      case 'file':
      case 'FILE': {
        const fileBoxStyles = {
          p: 1.5,
          minWidth: 48,
          maxWidth: 320,
          borderRadius: 1,
          background: isCurrentUser ? 'powderblue' : 'grey.100',
          color: isCurrentUser ? 'grey.800' : 'inherit',
        };

        return (
          <Box sx={fileBoxStyles}>
            {/* Render Forwarded or Reply Header */}
            {renderHeader()}

            {/* Display the text body */}
            {body && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={body}
              >
                {renderMessageWithMentions()}
              </Typography>
            )}

            {/* Display file attachments */}
            <Stack spacing={1}>
              {attachments?.map((att) => (
                <Stack key={att.id} direction="row" alignItems="flex-start" spacing={1}>
                  {/* File Thumbnail */}
                  <FileThumbnail file={att.url} tooltip={att.name || att.fileName} />

                  {/* File Name with Download Option */}
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexGrow: 1 }}>
                    <Tooltip title={att.name || att.fileName}>
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '180px',
                        }}
                      >
                        {att.name || att.fileName
                          ? (att.name || att.fileName).length > 20
                            ? `${(att.name || att.fileName).slice(0, 20)}...`
                            : att.name || att.fileName
                          : ''}
                      </Typography>
                    </Tooltip>
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        component="a"
                        href={att.url}
                        download={att.name || att.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Iconify icon="eva:download-fill" width={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Box>
        );
      }

      case 'audio':
      case 'AUDIO': {
        const audioBoxStyles = {
          p: 1,
          minWidth: 158,
          maxWidth: 510,
          borderRadius: 1,
          background: isCurrentUser ? 'powderblue' : 'grey.100',
          color: isCurrentUser ? 'grey.800' : 'inherit',
        };

        return (
          <Box sx={audioBoxStyles}>
            {/* Render Forwarded or Reply Header */}
            {renderHeader()}

            {/* Display the text body */}
            {body && (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={body}
              >
                {renderMessageWithMentions()}
              </Typography>
            )}

            {/* Display audio attachments */}
            {attachments?.map((att) => (
              <Stack key={att.id} direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <audio
                  controls
                  src={att.url}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    backgroundColor: 'inherit',
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </Stack>
            ))}
          </Box>
        );
      }

      case 'video':
      case 'VIDEO': {
        const videoBoxStyles = {
          minWidth: 48,
          maxWidth: 300,
          borderRadius: 1,
        };

        return (
          <Box sx={videoBoxStyles}>
            {renderHeader()}

            {body && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {renderMessageWithMentions()}
              </Typography>
            )}

            {attachments?.map((att) => (
              <Box key={att.id} sx={{ position: 'relative', mb: 1 }}>
                <Box
                  component="video"
                  controls
                  src={att.url}
                  sx={{
                    width: '100%',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    objectFit: 'cover',
                    '&:hover': { opacity: 0.9 },
                  }}
                >
                  Sorry, your browser doesn't support embedded videos.
                </Box>
              </Box>
            ))}
          </Box>
        );
      }
      case 'text':
      case 'TEXT':
      default:
        return (
          <>
            <Box
              sx={{
                p: 1,
                minWidth: 48,
                maxWidth: 520,
                borderRadius: 1,
                typography: 'body2',
                bgcolor: 'background.neutral',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                ...(isCurrentUser && {
                  color: 'grey.800',
                  background: editingMessageId === message.id ? '' : 'powderblue',
                }),
                ...(isTask && {
                  fontWeight: 'bold',
                  color: '#006A67',
                }),
              }}
            >
              {renderHeader()}

              {editingMessageId === message.id ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TextField
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                  />
                </Stack>
              ) : (
                renderMessageWithMentions()
              )}
            </Box>

            {editingMessageId === message.id && (
              <>
                <IconButton onClick={handleUpdateMessage}>
                  <Iconify icon="mdi:check-bold" width={14} color="success.main" />
                </IconButton>
                <IconButton onClick={() => setEditingMessageId(null)}>
                  <Iconify icon="mdi:close-thick" width={14} color="error.main" />
                </IconButton>
              </>
            )}
          </>
        );
    }
  };
  const renderRetryUI = () => {
    // show only for sender
    if (!isCurrentUser) return null;

    // detect offline / failed
    const isPending = message.status === 'PENDING';
    const isFailed = message.status === 'FAILED';

    if (!isPending && !isFailed) return null;

    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mt: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'background.default',
        }}
      >
        {isPending && (
          <>
            <Iconify icon="mdi:clock-outline" width={14} color="text.disabled" />
            <Typography variant="caption" color="text.secondary">
              Sending…
            </Typography>
          </>
        )}

        {isFailed && (
          <>
            <Iconify icon="mdi:alert-circle-outline" width={14} color="error.main" />
            <Typography variant="caption" color="error.main">
              Failed to send
            </Typography>

            <Button
              size="small"
              variant="text"
              sx={{ minWidth: 'auto', px: 1 }}
              onClick={() => {
                // UI hook only — parent already handles resend
                onForwardMessage?.(message, []);
              }}
            >
              Retry
            </Button>
          </>
        )}
      </Stack>
    );
  };

  const renderActions = (
    <Stack
      direction="row"
      spacing={1} // Added spacing between the icons
      className="message-actions"
      sx={{
        pt: 0.5,
        left: 0,
        opacity: 0,
        top: '100%',
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
        ...(isCurrentUser && { right: 0, left: 'unset' }),
      }}
    >
      {/* Reply Icon */}
      {isTask && (
        <Typography variant="caption" color="textSecondary">
          Task created for this chat message
        </Typography>
      )}
      <Tooltip title="Reply">
        <IconButton size="small" onClick={handleReplyClick}>
          <Iconify icon="solar:reply-bold" width={16} />
        </IconButton>
      </Tooltip>

      {/* Forward Icon */}
      <Tooltip title="Forward">
        <IconButton size="small" onClick={handleForwardClick}>
          <Iconify icon="solar:multiple-forward-left-bold" width={16} />
        </IconButton>
      </Tooltip>

      {isCurrentUser && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => {
              setEditingMessageId(message.id);
              setEditedBody(message.body);
            }}
          >
            <Iconify icon="solar:pen-bold" width={16} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Delete">
        <IconButton size="small" onClick={handleDeleteClick}>
          <Iconify icon="solar:trash-bin-trash-bold" width={16} />
        </IconButton>
      </Tooltip>
      {canCreateTask && (
        <Tooltip title="Create task">
          <span>
            <IconButton size="small" onClick={handleCreateTask} disabled={loadingTranscript}>
              {loadingAction === 'task' ? (
                <CircularProgress size={16} />
              ) : (
                <Iconify icon="solar:list-bold" width={16} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {contentType?.toLowerCase() === 'audio' && (
        <Tooltip title="Show transcript">
          <span>
            <IconButton
              size="small"
              onClick={handleOpenTranscriptDialog}
              disabled={loadingTranscript}
            >
              {loadingAction === 'transcript' ? (
                <CircularProgress size={16} />
              ) : (
                <Iconify icon="mdi:script-text-outline" width={16} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Add reaction">
        <IconButton
          size="small"
          onClick={(e) => {
            if (selectedMessageId === message.id) {
              setAnchorEl(null);
              setSelectedMessageId(null);
            } else {
              setAnchorEl(e.currentTarget);
              setSelectedMessageId(message.id);
            }
          }}
        >
          <Iconify icon="mdi:emoticon-outline" width={16} />
        </IconButton>
      </Tooltip>
      <Popper
        open={selectedMessageId === message.id}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: 9999 }}
      >
        <Box
          ref={emojiRef}
          sx={{
            mt: 1,
          }}
        >
          <EmojiPicker
            onEmojiClick={(emoji) => {
              handleEmojiClick(emoji, message.id);
              setAnchorEl(null);
              setSelectedMessageId(null);
            }}
          />
        </Box>
      </Popper>
    </Stack>
  );

  // Helper function to get sender details
  function getSenderDetails(message, participants, currentUserId, user) {
    const isMe = message.senderId === `${currentUserId}`;
    if (isMe) {
      return {
        firstName: 'You',
        avatarUrl: user?.avatarUrl || '',
      };
    }

    const participant = participants.find((p) => p.id === message.senderId);

    if (participant) {
      const firstName = participant.name.split(' ')[0] || 'Unknown';
      return {
        firstName,
        avatarUrl: participant.avatarUrl || '',
      };
    }

    return {
      firstName: 'Unknown',
      avatarUrl: '',
    };
  }

  // If there's no message body and no attachments, render nothing
  if (!body && attachments?.length === 0) {
    return null;
  }
  const emojiTabs = selectedReactionMessage?.reactions?.map((r) => r.emoji) || [];
  const reactionUsers =
    selectedEmojiFilter === 'ALL'
      ? selectedReactionMessage?.reactions?.flatMap((r) =>
          r.users.map((u) => ({ ...u, emoji: r.emoji }))
        )
      : selectedReactionMessage?.reactions
          ?.filter((r) => r.emoji === selectedEmojiFilter)
          .flatMap((r) => r.users.map((u) => ({ ...u, emoji: r.emoji })));

  return (
    <>
      <Stack direction="row" justifyContent={isCurrentUser ? 'flex-end' : 'unset'}>
        {!isCurrentUser && (
          <Avatar alt={firstName} src={avatarUrl} sx={{ width: 32, height: 32, mr: 2 }} />
        )}

        <Stack alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}>
          <Stack
            direction={isCurrentUser ? 'row' : 'row-reverse'}
            alignItems="center"
            sx={{
              position: 'relative',
              '&:hover .message-actions': { opacity: 1 },
            }}
          >
            {/* Actions and Content */}
            {renderActions}
            {/* {showEmojiPicker && (
              <Box
                ref={emojiRef}
                sx={{
                  position: 'absolute',
                  bottom: 40,
                  zIndex: 999,
                }}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Box>
            )} */}
            {renderContent()}

            {reactions.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                {reactions.length > 0 && (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {reactions.map((reaction, index) => (
                      <Box
                        key={index}
                        onClick={(e) => handleReactionClick(e)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 0.7,
                          py: 0.2,
                          borderRadius: 1,
                          bgcolor: reaction.currentUserReacted ? '#E6F4F3' : '#f1f1f1',
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <span>{reaction.emoji}</span>
                        <span style={{ fontSize: 12 }}>{reaction.count}</span>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {renderRetryUI()}
          </Stack>
          {renderInfo}
        </Stack>
      </Stack>
      <Popper
        open={Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        placement="top"
        sx={{ zIndex: 9999 }}
      >
        <ClickAwayListener onClickAway={handleCloseReactionPopup}>
          <Paper sx={{ width: 280, p: 1, background: '#F5F5F5' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="All"
                  size="small"
                  onClick={() => setSelectedEmojiFilter('ALL')}
                  sx={{ background: selectedEmojiFilter === 'ALL' ? '#006A67' : 'default' }}
                />

                {emojiTabs.map((emoji) => (
                  <Chip
                    key={emoji}
                    label={emoji}
                    size="small"
                    onClick={() => setSelectedEmojiFilter(emoji)}
                    sx={{ background: selectedEmojiFilter === emoji ? '#006A67' : 'default' }}
                  />
                ))}
              </Stack>

              <Divider />

              <Stack spacing={1} sx={{ maxHeight: 200, overflow: 'auto' }}>
                {reactionUsers?.map((user) => (
                  <Stack
                    key={user.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={user.profileImageUrl}
                        alt={user.fullName}
                        sx={{ width: 28, height: 28 }}
                      />

                      <Box>
                        <Typography variant="body2">{user.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.userName}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography fontSize={16}>{user.emoji}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </ClickAwayListener>
      </Popper>
      {/* Forward Dialog */}
      <Dialog
        open={openForwardDialog}
        onClose={handleCancelForwarding}
        fullWidth
        maxWidth="sm"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle>Forward Message</DialogTitle>
        <DialogContent>
          {/* Search Bar */}
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* List of Conversations with Scrollbar */}
          <Box sx={{ overflow: 'auto' }}>
            <List dense>
              {filteredConversations.map((conversationId) => {
                const conversation = conversations.byId[conversationId];
                const conversationName =
                  conversation.type === 'GROUP'
                    ? conversation.groupName
                    : conversation.participants[0]?.name || 'Unknown';

                return (
                  <ListItem
                    key={conversationId}
                    button
                    onClick={() => handleToggleConversation(conversationId)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedConversations.includes(conversationId)}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemAvatar>
                      <Avatar
                        src={conversation.participants[0]?.avatarUrl || ''}
                        sx={{ width: 32, height: 32 }}
                      />
                    </ListItemAvatar>

                    <ListItemText primary={conversationName} />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelForwarding}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendForwardedMessage}
            variant="contained"
            disabled={selectedConversations.length === 0}
            sx={{ bgcolor: '#006A67' }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle id="confirm-delete-dialog-title">Delete Message</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox checked={deleteType === 1} onChange={() => handleCheckboxChange(1)} />
            }
            label="Delete for me"
          />
          {isCurrentUser && (
            <FormControlLabel
              control={
                <Checkbox checked={deleteType === 2} onChange={() => handleCheckboxChange(2)} />
              }
              label="Delete for everyone"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <KanbanTranscript
        open={openTranscript}
        handleClose={handleTranscriptDialogClose}
        kanbanDescription={transcript || ''}
        loading={loadingTranscript}
      />
    </>
  );
}
