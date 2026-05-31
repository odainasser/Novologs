'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useGetContacts, useGetConversation, useGetConversations } from 'src/actions/chat';

import { EmptyContent } from 'src/components/empty-content';
import { getUser } from 'src/actions/user-manage/userManageActions';
import { useMockedUser } from 'src/auth/hooks';

import { Layout } from '../layout';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatHeaderCompose } from '../chat-header-compose';
import { useCollapseNav } from '../hooks/use-collapse-nav';
import { useTranslation } from 'react-i18next';
import { getChatRoom, addChatRoom, getMentions } from 'src/actions/chat/chatActions';
import { useAuthContext } from 'src/auth/hooks';
import useGetRoomMessages from 'src/hooks/chat/use-get-room-messages';
import { ErrorView } from 'src/sections/error/error-view';
import { fToNow, fDate, fTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import {
  transformChatRoomsToConversations,
  transformMessages,
  mapEmployeesToContacts,
} from '../utils/chat-rooms-mapping';
import useChatHub from 'src/hooks/use-live-chat-hook';
// import { insertChatRoom } from 'src/actions/chat/chatActions';
// import { deleteChatMessage } from 'src/actions/chat/chatActions';

import { Button, Box } from '@mui/material';

import { toast } from 'src/components/snackbar';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------------------------
export function attachReplyHeaders(messages) {
  const messageMap = new Map(messages.map((m) => [m.id, m]));

  return messages.map((msg) => {
    let replyTo = null;

    if (msg.replyParentId) {
      const parentMsg = messageMap.get(msg.replyParentId);
      if (parentMsg) {
        replyTo = {
          parentId: parentMsg.id,
          senderName: parentMsg.msgSender?.fullName || 'Unknown',
          parentBody: parentMsg.body || '',
          parentAttachments: parentMsg.attachments || [],
        };
      }
    }

    return {
      ...msg,
      replyTo, // dynamically computed
    };
  });
}
export function ChatView() {
  const router = useRouter();

  const { t } = useTranslation('dashboard/chat');

  const { zetaUser: user } = useAuthContext();

  const { accessToken: accessToken } = useAuthContext();

  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [creationError, setCreationError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const [firstChatRoomId, setFirstChatRoomId] = useState('');
  const [firstGroupChatRoomId, setFirstGroupChatRoomId] = useState('');

  const previousRoomIdRef = useRef(null);
  const [groupName, setGroupName] = useState('');
  const searchParams = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState(
    searchParams.get('id') || ''
  );
  const isMentionsView = selectedConversationId === 'mentions';
  const selectedConversationIdRef = useRef(selectedConversationId);
  const [newMessages, setMessages] = useState([]);
  useEffect(() => {
    localStorage.removeItem('editorContentDocs');
  }, []);
  useEffect(() => {
    const id = searchParams.get('id') || '';
    setSelectedConversationId(id);
    selectedConversationIdRef.current = id;
  }, [searchParams]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const unreadMessages = newMessages.filter((msg) => {
      if (msg.chatRoomIds !== selectedConversationId) return false;
      if (msg.senderId === user?.id) return false;

      const myReceiverEntry = msg.msgReceivers?.find((r) => r.reciever?.id === user?.id);

      return myReceiverEntry && myReceiverEntry.status !== 2; // not read yet
    });

    unreadMessages.forEach((msg) => {
      changeDeliveryStatus({
        MessageId: msg.messageId,
        SenderId: user?.id,
        status: 2,
      });
    });
  }, [selectedConversationId, newMessages, user?.id]);

  // State to manage the message being replied to
  const [replyMessage, setReplyMessage] = useState(null);

  const getChatParams = {
    myRooms: true,
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const {
    chatRoomList,
    chatRoomListLoading,
    chatRoomListError,
    chatRoomListValidating,
    chatRoomListEmpty,
    mutate: mutateChatRooms,
  } = getChatRoom(getChatParams);
  const mentionParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const {
    mentionList,
    mentionListLoading,
    mentionListError,
    mentionListEmpty,
    mutate: mutateMentions,
  } = getMentions(mentionParams);
  useEffect(() => {
    const { chatRooms } = chatRoomList ?? {};
    if (chatRooms?.length) {
      setFirstChatRoomId(chatRooms[0].id);

      const groupChat = chatRooms.find((room) => room.members?.length > 2);
      if (groupChat) {
        setFirstGroupChatRoomId(groupChat.id);
      }
    }
  }, [chatRoomList]);

  console.log('this is the first grp chat room', firstGroupChatRoomId);
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const {
    usersList,
    usersListLoading,
    usersListError,
    usersListValidating,
    usersListEmpty,
    mutate,
  } = getUser(getUsersParams);

  const employeeContacts = useMemo(() => {
    if (usersList?.users) {
      return mapEmployeesToContacts(
        usersList?.users?.filter((employee) => employee.id !== user?.id)
      );
    }
    return [];
  }, [usersList?.users]);
  const mentions = useMemo(() => {
    return (mentionList?.mentions || []).map((item) => {
      let parsedPayload = null;

      try {
        parsedPayload = item.payLoad ? JSON.parse(item.payLoad) : null;
      } catch (error) {
        parsedPayload = null;
      }

      return {
        id: item.mentionId,
        mentionId: item.mentionId,
        messageId: item.messageId,
        chatRoomId: item.chatRoomId,
        mentionedAt: item.mentionedAt,
        messageCreated: item.messageCreated,
        sender: item.sender,
        body: parsedPayload?.body || '',
        contentType: parsedPayload?.contentType || 'text',
        mentions: parsedPayload?.mentions || [],
        attachments: parsedPayload?.attachments || [],
      };
    });
  }, [mentionList?.mentions]);
  const [receiverIds, setReceiverIds] = useState([]);
  const [messageDeliveryMap, setMessageDeliveryMap] = useState({});

  const [recipients, setRecipients] = useState([]);
  const [typingPayload, setTypingPayload] = useState('');
  const [msgSenderId, setMsgSenderId] = useState('');
  const [msgNotification, setMsgNotification] = useState('');
  const isCurrentUser = msgSenderId === `${user?.id}`;

  const [typingChatRoomId, setTypingChatRoomId] = useState('');
  const typingTimeoutRef = useRef(null);
  const conversations = useMemo(() => {
    if (!chatRoomList?.chatRooms || !user) {
      return null;
    }
    return transformChatRoomsToConversations(chatRoomList.chatRooms, user, usersList?.users || []);
  }, [chatRoomList?.chatRooms, user, usersList?.users]);

  const { byId: conversationsById = {} } = conversations || {};

  const conversation = conversationsById[selectedConversationId];

  const {
    messages: initialMessages,
    messagesLoading,
    messagesError,
    mutateMessages,
  } = useGetRoomMessages(selectedConversationId, accessToken, mutateChatRooms);

  console.log('this is the initialMessages', initialMessages);

  const conversationWithMessages = useMemo(() => {
    if (!conversation || !initialMessages) return null;

    const transformedMessages = transformMessages(
      initialMessages,
      conversation?.participants || []
    );

    const messagesWithReplies = attachReplyHeaders(transformedMessages);

    return {
      ...conversation,
      messages: messagesWithReplies,
    };
  }, [conversation, initialMessages]);

  const roomNav = useCollapseNav();
  const conversationsNav = useCollapseNav();

  console.log('conversationss ', conversations);
  console.log('conversationWithMessages ', conversationWithMessages);

  const participants = useMemo(() => {
    if (conversationWithMessages) {
      return conversationWithMessages?.participants || [];
    }
    return [];
  }, [conversationWithMessages, user]);

  const chatType = useMemo(() => {
    if (conversationWithMessages) {
      return conversationWithMessages?.type || [];
    }
    return '';
  }, [conversationWithMessages, user]);

  const chatGroupName = useMemo(() => {
    return chatRoomList?.chatRooms?.map((room) => room?.name) || [];
  }, [chatRoomList?.chatRooms]);

  useEffect(() => {
    if (chatRoomListError || !selectedConversationId) {
      router.push(paths.dashboard.chat);
    }
  }, [chatRoomListError, router, selectedConversationId]);

  const receiveDeliveryStatus = (payload) => {
    if (payload.senderId === user?.id) return;

    console.log(' Delivery status received (from other user):', payload);

    setMessageDeliveryMap((prev) => ({
      ...prev,
      [payload.messageId]: payload.status,
    }));
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.messageId === payload.messageId
          ? {
              ...msg,
              msgReceivers: msg.msgReceivers.map((r) =>
                r.id === payload.senderId ? { ...r, status: payload.status } : r
              ),
            }
          : msg
      )
    );
  };

  console.log('this is the message......', newMessages);
  const onMessageReceived = (payload) => {
    console.log('🚀 Received payload from SignalR:', payload);

    const currentConversationId = selectedConversationIdRef.current;
    console.log('this is the selectedConversationId', currentConversationId);

    setTypingPayload(payload?.payLoad);
    setMsgSenderId(payload?.senderId);
    setTypingChatRoomId(payload?.chatRoomIds?.[0]);
    setMsgNotification(payload?.notificationBody);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTypingPayload('');
      setMsgSenderId('');
      setTypingChatRoomId('');
    }, 5000);

    // ✅ Ignore local pending messages sent by ourselves
    // ✅ Local pending message → render immediately, skip side-effects
    if (payload?.isLocalOnly) {
      console.log('📦 Local pending message – render immediately');
    }

    // ✅ Send delivery status if necessary
    if (
      payload?.messageId &&
      payload?.senderId &&
      payload?.payLoad !== 'Typing' &&
      !isCurrentUser
    ) {
      const statusToSend = payload.chatRoomIds?.includes(currentConversationId) ? 2 : 1;

      console.log('Sending delivery status:', {
        MessageId: payload.messageId,
        SenderId: user?.id,
        status: statusToSend,
      });
      changeDeliveryStatus({
        MessageId: payload.messageId,
        SenderId: user?.id,
        status: statusToSend,
      });
    }

    if (!payload.chatRoomIds || !payload.chatRoomIds.includes(selectedConversationId)) {
      console.log('Message for another room. Mutating chat room list.');
      mutateChatRooms();
      mutateMessages();
      return;
    }

    try {
      const parsedPayload = JSON.parse(payload.payLoad);
      const normalizedMessage = {
        id: payload.messageId,
        messageId: payload.messageId,
        sender: { id: payload.senderId },
        payLoad: payload.payLoad,
        created: payload.serverCreated || new Date().toISOString(),
        chatRoomIds: payload.chatRoomIds,
      };

      const transformed = transformMessages([normalizedMessage], participants)[0];

      console.log('Transformed message:', transformed);

      setMessages((prev) => {
        const index = prev.findIndex((msg) => msg.messageId === transformed.messageId);
        let updated;
        if (index !== -1) {
          updated = [...prev];
          updated[index] = { ...transformed, status: 'SENT' };
        } else {
          updated = [...prev, transformed];
        }
        return attachReplyHeaders(updated); // ✅ recalc replyTo
      });
    } catch (error) {
      console.error('Error handling incoming SignalR message:', error, payload);
    }
  };

  // useEffect(() => {
  //   if (
  //     !msgSenderId ||
  //     typingPayload === 'Typing' ||
  //     !usersList?.users?.length ||
  //     isCurrentUser ||
  //     typingChatRoomId === selectedConversationId
  //   )
  //     return;

  //   const senderUser = usersList?.users?.find((user) => user?.id === msgSenderId);
  //   const senderName = senderUser?.fullName || 'Unknown Sender';

  //   toast.info(
  //     <div
  //       onClick={() => {
  //         router.push(`${paths.dashboard.chat}?id=${typingChatRoomId}`);
  //       }}
  //       style={{
  //         cursor: 'pointer',
  //         backgroundColor: 'transparent',
  //         padding: '8px',
  //         fontSize: '14px',
  //         fontWeight: 600,
  //       }}
  //     >
  //       🔔 {`${msgNotification ?? t('chat.new_message')} from ${senderName}`}
  //     </div>,
  //     {
  //       duration: 5000,
  //     }
  //   );
  //   mutateChatRooms();
  // }, [msgSenderId, msgNotification, usersList]);

  // const onMessageReceived = (payload) => {
  //   console.log('this is the payload', payload);
  //   const transformedMessage = transformMessages([payload], participants)[0];
  //   setMessages((prevMessages) => [...prevMessages, transformedMessage]);
  // };

  const onError = (error) => {
    console.error('Chat Hub Error:', error);
  };

  const onConnectionClosed = () => {
    console.warn('Chat Hub Connection Closed');
  };

  const onConnectionStateChange = (state) => {
    console.log('Connection state:', state);
  };
  const [onlineUsers, setOnlineUsers] = useState([]);

  const handleOnlineUsersReceived = (users) => {
    console.log(' Online users received:', users);
    setOnlineUsers(users);
  };

  const { sendMessage, changeDeliveryStatus, getOnlineUsers, toggleReaction } = useChatHub({
    accessToken,
    receiveDeliveryStatus,
    onMessageReceived,
    onOnlineUsersReceived: handleOnlineUsersReceived, // ✅ pass callback
    onError,
    onConnectionClosed,
    onConnectionStateChange,
  });
  useEffect(() => {
    const interval = setInterval(() => {
      getOnlineUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [getOnlineUsers]);

  const handleMarkAsDelivered = (messageId, senderId) => {
    changeDeliveryStatus({
      MessageId: messageId,
      SenderId: senderId,
      status: 2,
    });
  };
  useEffect(() => {
    if (conversationWithMessages && conversationWithMessages.messages) {
      setMessages(attachReplyHeaders(conversationWithMessages.messages));
    } else {
      setMessages([]);
    }
  }, [conversationWithMessages]);
  const handleAddRecipients = useCallback((selected, groupName) => {
    if (!selected || selected.length === 0) {
      setCreationError(t('messages.selectAtLeastOneRecipient'));
      return;
    }

    setRecipients(selected); // Update the recipients state
    setGroupName(groupName);

    setCreationError(null); // Reset any previous errors
    console.log('Updated Chat Room:', { groupName, selected });
  }, []);

  // Add this function
  const handleDeleteMessage = async (messageId) => {
    try {
      const result = deleteMessage(messageId, selectedConversationId);

      toast.success(t('chat.message_deleted'));
      setMessages((prevMessages) => {
        const updated = prevMessages.filter((message) => message.messageId !== messageId);
        return attachReplyHeaders(updated);
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCreateChatRoom = useCallback(async () => {
    debugger;
    if (!user || !user?.id) {
      setCreationError(t('chat.user_not_logged_in'));
      return;
    }

    if (recipients.length === 0) {
      setCreationError(t('chat.please_select_atleast'));
      return;
    }

    setIsCreatingRoom(true);
    setCreationError(null);

    const selectedMemberIds = recipients.map((recipient) => recipient.id);

    console.log('this is the selectedMemberIds', recipients);

    const payload = {
      memberIds: selectedMemberIds,
    };
    if (selectedMemberIds.length === 1) {
      payload.name = recipients[0].name;
    }
    if (selectedMemberIds.length > 1) {
      payload.name = groupName;
    }

    console.log('this is the payload', payload);

    const chatMemberIds = [user?.id, ...selectedMemberIds];

    // Check if a chat room with the same participants already exists
    const existingChatRoom = chatRoomList?.chatRooms.find((chatRoom) => {
      // Get participant IDs from chatRoom
      const participantIds = chatRoom.members.map((member) => member.member.id);

      console.log('Checking chatRoom:', chatRoom);
      console.log('Participant IDs:', participantIds);

      // For single recipient chats
      if (selectedMemberIds.length === 1) {
        // Only prevent duplicate for 1:1 chat
        return (
          participantIds.length === 2 &&
          participantIds.includes(user?.id) &&
          participantIds.includes(selectedMemberIds[0])
        );
      }

      // Allow group chats even with same members
      return false;
    });

    console.log(`existingChatRoom :  ${existingChatRoom} `);

    if (existingChatRoom) {
      // If chat room exists, navigate to that chat room
      router.push(`${paths.dashboard.chat}?id=${existingChatRoom.id}`);
      setIsCreatingRoom(false);
      return;
    }

    const privateRoomMembers = [
      {
        isOwner: true,
        memberId: user?.id,
        isBlocked: false,
      },
      ...selectedMemberIds.map((id) => ({
        isOwner: false,
        memberId: id,
        isBlocked: false,
      })),
    ];

    try {
      const response = await addChatRoom(payload);
      console.log('this is the response', response);
      if (response.success) {
        setRecipients([]);
        await mutateChatRooms();

        router.push(`${paths.dashboard.chat}?id=${response.response.data.successStatus.id}`);
      } else {
        setCreationError(t('chat.failed_to_create'));
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      setCreationError(error || t('chat.unexpected_error'));
    } finally {
      setIsCreatingRoom(false);
    }
  }, [recipients, user, router, mutateChatRooms, accessToken, chatRoomList?.chatRooms, groupName]);

  const handleSendForwardedMessage = useCallback(
    async (messageToForward, selectedConversationIds) => {
      if (!user || !user?.id) {
        console.warn('User is not logged in.');
        return;
      }

      if (!selectedConversationIds || selectedConversationIds.length === 0) {
        console.warn('No conversations selected for forwarding.');
        return;
      }

      try {
        const payloadObject = {
          body: messageToForward.body,
          contentType: messageToForward.contentType,
          attachments: messageToForward.attachments,
          Forwarded: true,
        };

        console.log(` payloadObject ::  ${payloadObject.body} `);

        for (const conversationId of selectedConversationIds) {
          const payload = {
            RealTime: false,
            MessageId: uuidv4(),
            SenderId: user?.id,
            ChatRoomIds: [conversationId],
            RecieverIds: [],
            PayLoad: JSON.stringify(payloadObject),
          };

          console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

          console.log('Forwarding message payload:', payload);
          await sendMessage(payload);
        }

        toast.success(t('chat.message_forwarded'));
      } catch (error) {
        console.error('Error forwarding message:', error);
        toast.error(t('chat.failed_forward'));
      }
    },
    [user, sendMessage]
  );

  // Handler to set the message being replied to
  const handleReplyMessage = (message) => {
    setReplyMessage(message);
  };

  // Handler to cancel the reply
  const handleCancelReply = () => {
    setReplyMessage(null);
  };

  if (!user) {
    // Avoid early return; display a minimal layout instead
    return (
      <DashboardContent
        sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
        maxWidth={false}
      ></DashboardContent>
    );
  }

  if (chatRoomListError) {
    return <ErrorView errorCode={chatRoomListError} />;
  }
  console.log('this is the mentionssDSD', mentions);
  return (
    <DashboardContent
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
      maxWidth={false}
    >
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {t('chat.name')}
      </Typography>

      <Layout
        sx={{
          maxHeight: '78vh',
          flex: '1 1 0',
          borderRadius: 2,
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.card,
        }}
        slots={{
          header: isMentionsView ? (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Mentions
            </Typography>
          ) : selectedConversationId ? (
            <ChatHeaderDetail
              collapseNav={roomNav}
              conversation={conversationWithMessages}
              participants={participants}
              loading={chatRoomListLoading}
              chatType={chatType}
              mutateChatRooms={mutateChatRooms}
              firstChatRoomId={firstChatRoomId}
              firstGroupChatRoomId={firstGroupChatRoomId}
              roomCode={selectedConversationId}
              chatRoomList={chatRoomList}
              typingPayload={typingPayload}
              msgSenderId={msgSenderId}
              typingChatRoomId={typingChatRoomId}
              onlineUsers={onlineUsers}
            />
          ) : (
            <ChatHeaderCompose contacts={employeeContacts} onAddRecipients={handleAddRecipients} />
          ),
          nav: (
            <ChatNav
              contacts={employeeContacts}
              conversations={conversations}
              loading={chatRoomListLoading}
              selectedConversationId={selectedConversationId}
              collapseNav={conversationsNav}
              chatGroupName={chatGroupName}
              messages={newMessages}
              chatType={chatType}
              onlineUsers={onlineUsers}
              mentions={mentions}
              mentionsLoading={mentionListLoading}
              onOpenMentions={() => router.push(`${paths.dashboard.chat}?id=mentions`)}
            />
          ),
          main: (
            <>
              {isMentionsView ? (
                <>
                  {mentionListLoading && <LinearProgress sx={{ mb: 1 }} />}
                  <Scrollbar sx={{ p: 2 }}>
                    {mentions.length === 0 ? (
                      <EmptyContent
                        title="No mentions yet"
                        description="The chats where you are mentioned are shown here"
                      />
                    ) : (
                      mentions.map((mention) => {
                        const mentionDate = mention?.mentionedAt || mention.messageCreated;

                        const chatRoom = chatRoomList?.chatRooms?.find(
                          (room) => room.id === mention.chatRoomId
                        );

                        const isGroup = chatRoom?.members?.length > 2;

                        const chatTitle = isGroup
                          ? chatRoom?.name || 'Group chat'
                          : mention.sender?.fullName || 'Unknown';

                        const renderMentionBody = (text = '') => {
                          const parts = text.split(/(@\w+)/g);

                          return parts.map((part, index) =>
                            part.startsWith('@') ? (
                              <Box
                                key={index}
                                component="span"
                                sx={{ color: '#006A67', fontWeight: 600 }}
                              >
                                {part}
                              </Box>
                            ) : (
                              part
                            )
                          );
                        };

                        return (
                          <Box key={mention.mentionId} sx={{ mb: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.disabled', display: 'block' }}
                            >
                              {fDate(mentionDate) || 'Not Available'}
                            </Typography>

                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                display: 'block',
                                mt: 0.3,
                              }}
                            >
                              {chatTitle}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                              <Avatar
                                alt={mention?.sender?.fullName}
                                src={mention?.sender?.profileImageUrl}
                                sx={{ width: 32, height: 32, mr: 1, fontSize: 14 }}
                              >
                                {!mention?.sender?.profileImageUrl &&
                                  mention?.sender?.fullName?.charAt(0).toUpperCase()}
                              </Avatar>

                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {mention.sender?.fullName || 'Unknown'} mentioned your name
                              </Typography>
                            </Box>

                            <Box
                              onClick={() =>
                                router.push(`${paths.dashboard.chat}?id=${mention.chatRoomId}`)
                              }
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.5,
                                cursor: 'pointer',
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    flex: 1,
                                    minWidth: 0,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {renderMentionBody(mention.body || 'This message was deleted')}
                                </Typography>{' '}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.disabled',
                                    mt: 0.5,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                  }}
                                >
                                  {fTime(mentionDate) || 'Not Available'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                  </Scrollbar>
                </>
              ) : selectedConversationId ? (
                <>
                  <ChatMessageList
                    messages={newMessages}
                    conversations={conversations}
                    participants={participants}
                    loading={messagesLoading}
                    onForwardMessage={handleSendForwardedMessage}
                    onReplyMessage={handleReplyMessage}
                    onDeleteMessage={handleDeleteMessage}
                    mutateMessages={mutateMessages}
                    replyMessage={replyMessage}
                    onSendMessage={sendMessage}
                    receiverIds={receiverIds}
                    messageDeliveryMap={messageDeliveryMap}
                    toggleReaction={toggleReaction}
                  />

                  <ChatMessageInput
                    recipients={recipients}
                    user={user}
                    selectedConversationId={selectedConversationId}
                    disabled={!recipients.length && !selectedConversationId}
                    replyMessage={replyMessage}
                    onSendMessage={sendMessage}
                    onCancelReply={handleCancelReply}
                    mutateChatRooms={mutateChatRooms}
                    mutateMessages={mutateMessages}
                    changeDeliveryStatus={changeDeliveryStatus}
                    setReceiverIds={setReceiverIds}
                    participants={participants}
                  />
                </>
              ) : (
                <EmptyContent
                  imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-active.svg`}
                  title={t('chat.no_conversation_selected')}
                  description={t('chat.start_new_chat')}
                  action={
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#006A67' }}
                        onClick={handleCreateChatRoom}
                        disabled={
                          isCreatingRoom ||
                          recipients.length === 0 ||
                          (groupName === '' && recipients.length > 1)
                        }
                      >
                        {recipients.length > 1 ? t('chat.add-group') : t('chat.start-conversation')}
                      </Button>
                    </Box>
                  }
                />
              )}
            </>
          ),
          details:
            selectedConversationId && !isMentionsView ? (
              <ChatRoom
                collapseNav={roomNav}
                participants={participants}
                loading={messagesLoading}
                messages={conversationWithMessages?.messages ?? []}
                employees={usersList?.users}
                roomCode={selectedConversationId}
                chatType={chatType}
                conversations={conversations}
                mutateChatRooms={mutateChatRooms}
                onlineUsers={onlineUsers}
              />
            ) : null,
        }}
      />
    </DashboardContent>
  );
}
