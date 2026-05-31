import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetChatPayload,
  GetChatResponse,
  CreateChatRoom,
  UpdateChatRoom,
  UpdateChat,
  GetMentionsResponse
} from './chatModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export function getChatRoom(payload?: GetChatPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetChatPayload = {
      ...payload,
    };
    return [apiEndpoints.chat.getChatRoom, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetChatResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const chatRoomObject = data?.successStatus;
    const chatRooms = data?.successStatus?.items ?? [];
    const totalChat = data?.successStatus?.total ?? 0;
    return {
      chatRoomList: { chatRooms, chatRoomObject, totalChat },
      chatRoomListLoading: isLoading,
      chatRoomListError: error,
      chatRoomListValidating: isValidating,
      chatRoomListEmpty: !isLoading && chatRooms.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export function getMentions(payload?: GetChatPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetChatPayload = {
      ...payload,
    };

    return [apiEndpoints.chat.getMentions, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetMentionsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const mentionObject = data?.successStatus;
    const mentions = data?.successStatus?.items ?? [];
    const totalMentions = data?.successStatus?.total ?? 0;

    return {
      mentionList: { mentions, mentionObject, totalMentions },
      mentionListLoading: isLoading,
      mentionListError: error,
      mentionListValidating: isValidating,
      mentionListEmpty: !isLoading && mentions.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}
export function getAllChatMessages(payload?: GetChatPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetChatPayload = {
      ...payload,
    };
    return [apiEndpoints.chat.getChatMessage, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const chatMsgObject = data?.successStatus;
    const chatMessages = data?.successStatus?.items ?? [];
    const totalMsg = data?.successStatus?.total ?? 0;
    return {
      chatMsgList: { chatMessages, chatMsgObject, totalMsg },
      chatMsgListLoading: isLoading,
      chatMsgListError: error,
      chatMsgListValidating: isValidating,
      chatMsgListEmpty: !isLoading && chatMessages.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addChatRoom(data: CreateChatRoom) {
  const requestData: CreateChatRoom = {
    name: data?.name,
    memberIds: data?.memberIds,
    code: data?.code,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        // For arrays, allow empty arrays
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.chat.addChatRoom, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding chat room:', error);

    return { success: false, error };
  }
}

export async function updateChatRoom(data: UpdateChatRoom) {
  const requestData: UpdateChatRoom = {
    id: data?.id,
    name: data?.name,
    memberIds: data?.memberIds,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.chat.updateChatRoom, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating chat room:', error);

    return { success: false, error };
  }
}
export async function deleteChatRoom(id: string) {
  if (!id) {
    console.error('Error deleting chat room: ID is missing');
    return { success: false, error: 'ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.chat.deleteChatRoom}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting chat room:', error);

    return { success: false, error };
  }
}

export async function updateChatMsg(data: UpdateChat) {
  const requestData: UpdateChat = {
    id: data?.id,
    payLoad: data?.payLoad,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.chat.updateChatMessage, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating chat:', error);

    return { success: false, error };
  }
}
export async function deleteChatMsg(id: string, status: number) {
  if (!id) {
    console.error('Error deleting chat msg: ID is missing');
    return { success: false, error: 'ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.chat.deleteChatMessage}/${id}/${status}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting chat msg:', error);

    return { success: false, error };
  }
}
export async function transcribeMessage(messageId: string) {
  if (!messageId) {
    console.error('ID is required');
    return { success: false, error: 'ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.chat.transcribeMessage(messageId));

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, response };
    }
  } catch (error: any) {
    console.error('Error transcribing message:', error);
    return { success: false, error };
  }
}
