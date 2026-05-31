import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { CONFIG } from 'src/config-global';
import { handleTokenExpiration } from 'src/auth/context/jwt/utils';
const QUEUE_KEY = 'chat_offline_queue';
const STATUS_QUEUE_KEY = 'chat_offline_status_queue';

const generateUUIDSafe = () => {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/* ======================= Local Storage Helpers ======================= */

const getQueue = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (err) {
    console.error(`❌ Failed to parse queue ${key}`, err);
    return [];
  }
};

const addToQueue = (key, payload) => {
  const queue = getQueue(key);
  queue.push({ payload, queuedAt: Date.now() });
  localStorage.setItem(key, JSON.stringify(queue));
};

const clearQueue = (key) => localStorage.removeItem(key);

/* ======================= Hook ======================= */

const useChatHub = ({
  accessToken,
  onMessageReceived,
  receiveDeliveryStatus,
  onOnlineUsersReceived,
  onError = () => {},
  onConnectionStateChange = () => {},
}) => {
  const hubUrl = `${CONFIG.zetaApiUrl}/chat/chat_hub`;
  const connectionRef = useRef(null);

  /* ======================= Connect ======================= */

  const connectSignalR = async () => {
    if (!accessToken) return;

    const freshToken = await handleTokenExpiration(false);

    if (!freshToken) {
      onConnectionStateChange('TOKEN_EXPIRED');
      return;
    }

    try {
      onConnectionStateChange('CONNECTING');

      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => {
            const token = localStorage.getItem('ACCESS_TOKEN');

            if (!token) return '';

            const latestToken = await handleTokenExpiration(false);
            return latestToken || '';
          },
          withCredentials: false,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      hubConnection.on('ReceiveMessage', (payload) => {
        console.log('🚀 Received payload from SignalR:', payload);
        onMessageReceived?.(payload);
      });

      hubConnection.on('ReceiveDeliveryStatus', (payload) => receiveDeliveryStatus?.(payload));

      hubConnection.on('OnlineUsersList', (payload) => onOnlineUsersReceived?.(payload));
      hubConnection.on('ReceiveReaction', (payload) => {
        console.log('Reaction received', payload);

        onMessageReceived?.({
          type: 'REACTION',
          ...payload,
        });
      });
      hubConnection.onreconnecting((err) => {
        console.warn('🔄 Reconnecting...', err);
        onConnectionStateChange('RECONNECTING');
      });

      hubConnection.onreconnected(async () => {
        console.log('✅ SignalR reconnected');
        onConnectionStateChange('RECONNECTED');
        await flushQueuedMessages();
        await flushQueuedStatuses();
      });

      hubConnection.onclose((error) => {
        console.error('❌ SignalR closed', error);
        connectionRef.current = null;
        onConnectionStateChange('DISCONNECTED');
      });

      await hubConnection.start();
      connectionRef.current = hubConnection;
      onConnectionStateChange('CONNECTED');

      await flushQueuedMessages();
      await flushQueuedStatuses();
      await hubConnection.invoke('GetOnlineUsers');
    } catch (error) {
      console.error('❌ SignalR connection failed', error);
      onError(error.message);
      onConnectionStateChange('CONNECTION_FAILED');
    }
  };

  /* ======================= Flush Messages ======================= */

  const flushQueuedMessages = async () => {
    const queue = getQueue(QUEUE_KEY);
    if (!queue.length || !connectionRef.current) return;

    for (const item of queue) {
      try {
        await connectionRef.current.invoke('SendMessage', item.payload);
        console.log('✅ Flushed queued message:', item.payload.MessageId);
      } catch (err) {
        console.error('❌ Failed to flush queued message', err);
        return;
      }
    }
    clearQueue(QUEUE_KEY);
  };

  const flushQueuedStatuses = async () => {
    const queue = getQueue(STATUS_QUEUE_KEY);
    if (!queue.length || !connectionRef.current) return;

    for (const item of queue) {
      try {
        await connectionRef.current.invoke('ChangeDeliveryStatus', item.payload);
        console.log('✅ Flushed queued status:', item.payload.MessageId);
      } catch (err) {
        console.error('❌ Failed to flush queued status', err);
        return;
      }
    }
    clearQueue(STATUS_QUEUE_KEY);
  };

  /* ======================= Send Message ======================= */

  const sendMessage = async (payload) => {
    const isConnected = connectionRef.current?.state === signalR.HubConnectionState.Connected;

    // ✅ NORMALIZED LOCAL MESSAGE (CRITICAL FIX)
    const pendingMessage = {
      ...payload,
      messageId: payload.MessageId,
      senderId: payload.SenderId,
      chatRoomIds: payload.ChatRoomIds,
      payLoad: payload.PayLoad, // 🔥 REQUIRED FOR UI
      serverCreated: new Date().toISOString(),
      status: 'PENDING',
      isLocalOnly: true,
    };

    console.log('this is the pending msg', pendingMessage);

    // 🔥 ALWAYS show immediately
    onMessageReceived?.(pendingMessage);

    if (!navigator.onLine || !isConnected) {
      console.warn('📦 Offline → queueing message');
      addToQueue(QUEUE_KEY, payload);
      onConnectionStateChange('MESSAGE_QUEUED');
      return;
    }

    try {
      await connectionRef.current.invoke('SendMessage', payload);
      onConnectionStateChange('MESSAGE_SENT');
    } catch (err) {
      console.error('❌ Send failed → queueing', err);
      addToQueue(QUEUE_KEY, payload);
      onConnectionStateChange('MESSAGE_QUEUED');
    }
  };

  /* ======================= Delivery Status ======================= */

  const changeDeliveryStatus = async (payload) => {
    const isConnected = connectionRef.current?.state === signalR.HubConnectionState.Connected;

    if (!isConnected) {
      console.warn('⚠️ Connection not ready – queueing delivery status');
      addToQueue(STATUS_QUEUE_KEY, payload);
      return;
    }

    try {
      await connectionRef.current.invoke('ChangeDeliveryStatus', payload);
    } catch (err) {
      console.error('❌ ChangeDeliveryStatus failed, queueing', err);
      addToQueue(STATUS_QUEUE_KEY, payload);
    }
  };
  /* ======================= Toggle Reaction ======================= */

  const toggleReaction = async (messageId, emoji) => {
    const isConnected = connectionRef.current?.state === signalR.HubConnectionState.Connected;

    if (!isConnected) {
      console.warn('⚠️ Connection not ready – reaction skipped');
      return;
    }

    try {
      await connectionRef.current.invoke('ToggleReaction', messageId, emoji);
    } catch (err) {
      console.error('❌ ToggleReaction failed', err);
    }
  };

  /* ======================= Online / Offline ======================= */

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Internet back online');
      onConnectionStateChange('ONLINE');
      flushQueuedMessages();
      flushQueuedStatuses();
    };

    const handleOffline = () => {
      console.warn('⚡ Offline mode');
      onConnectionStateChange('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    connectSignalR();
    return () => {
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [accessToken]);

  return {
    sendMessage,
    changeDeliveryStatus,
    toggleReaction,
    getOnlineUsers: async () => {
      if (connectionRef.current?.state !== signalR.HubConnectionState.Connected) return;
      await connectionRef.current.invoke('GetOnlineUsers');
    },
  };
};

export default useChatHub;
