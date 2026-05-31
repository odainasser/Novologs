// src/contexts/ChatNotificationProvider.jsx
'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import useChatHub from 'src/hooks/use-live-chat-hook';
import { useAuthContext } from 'src/auth/hooks';
// import { getUser } from 'src/actions/userManage/userManageActions';

const ChatNotificationContext = createContext({});

export function ChatNotificationProvider({ children }) {
  const router = useRouter();
  // const getUsersParams = {
  //   pagination: {
  //     pageNumber: 1,
  //     pageSize: 1000,
  //   },
  // };
  // const { usersList } = getUser(getUsersParams);
  const { zetaUser: user, accessToken } = useAuthContext();
  const shownMessagesRef = useRef(new Set());

  const onMessageReceived = (payload) => {
    if (!payload) return;

    const currentConversationId =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;

    const typingPayload = payload?.payLoad;
    const msgSenderId = payload?.senderId;
    const typingChatRoomId = payload?.chatRoomIds?.[0];
    const isCurrentUser = msgSenderId === user?.id;

    console.log('CHECK BLOCK:', {
      msgSenderId,
      typingPayload,
      isCurrentUser,
      typingChatRoomId,
      currentConversationId,
    });
    if (
      !msgSenderId ||
      typingPayload === 'Typing' ||
      isCurrentUser ||
      typingChatRoomId === currentConversationId
    )
      return;

    const messageId = payload?.messageId || `${msgSenderId}-${payload?.notificationBody}`;

    if (shownMessagesRef.current.has(messageId)) return;
    shownMessagesRef.current.add(messageId);

    // const senderUser = usersList?.users?.find((u) => u?.id === msgSenderId);

    // const senderName = payload?.notificationTitle || senderUser?.fullName || 'Unknown';
    const senderName = payload?.notificationTitle || 'Unknown';
    const messageText = payload?.notificationBody || '';

    toast.info(
      <div
        onClick={() => {
          router.push(`/dashboard/chat?id=${typingChatRoomId}`);
        }}
        style={{
          cursor: 'pointer',
          backgroundColor: 'transparent',
          padding: '8px',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        🔔 {`${senderName}: ${messageText}`}
      </div>,
      { duration: 5000 }
    );
  };
  const { sendMessage, changeDeliveryStatus, getOnlineUsers } = useChatHub({
    accessToken,
    receiveDeliveryStatus: () => {},
    onMessageReceived,
  });

  // Refresh online users periodically
  useEffect(() => {
    const interval = setInterval(() => getOnlineUsers(), 30000);
    return () => clearInterval(interval);
  }, [getOnlineUsers]);
  useEffect(() => {
    const interval = setInterval(() => {
      shownMessagesRef.current.clear();
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ChatNotificationContext.Provider value={{ sendMessage, changeDeliveryStatus }}>
      {children}
    </ChatNotificationContext.Provider>
  );
}

export const useChatNotifications = () => useContext(ChatNotificationContext);
