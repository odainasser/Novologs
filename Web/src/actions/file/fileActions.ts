import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetFilePayload,
  GetFileResponse,
  AddFilePayload,
  shareFilePayload,
  UpdateFilePayload,
} from './fileModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getFiles(payload?: GetFilePayload) {
  const defaultPayload: GetFilePayload = {
    ...payload,
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.files.getFiles, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetFileResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const fileObject = data?.successStatus;
    const files = data?.successStatus?.items ?? [];
    const totalFiles = data?.successStatus?.total ?? 0;

    return {
      fileList: { files, fileObject, totalFiles },
      fileListLoading: isLoading,
      fileListError: error,
      fileListValidating: isValidating,
      fileListEmpty: !isLoading && files.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addFile(data: AddFilePayload) {
  const formData = new FormData();

  formData.append('name', data.name);
  if (data.file) {
    formData.append('file', data.file);
  }

  if (data.parentFolderId) {
    formData.append('parentFolderId', data.parentFolderId);
  }
  if (data.parentFolderPath) {
    formData.append('parentFolderPath', data.parentFolderPath);
  }

  if (data.entityType !== undefined) {
    formData.append('entityType', data.entityType.toString());
  }

  if (data.entityId) {
    formData.append('entityId', data.entityId);
  }

  if (data.members && data.members.length > 0) {
    data.members.forEach((member, index) => {
      formData.append(`members[${index}].id`, member.id);
      formData.append(
        `members[${index}].folderSharePermissionLevel`,
        member.folderSharePermissionLevel.toString()
      );
    });
  }

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.files.addFile, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, error: response };
    }
  } catch (error: any) {
    console.error('Error adding file:', error);
    return { success: false, error };
  }
}

export async function updateFile(data: UpdateFilePayload) {
  const requestData: UpdateFilePayload = {
    id: data?.id,
    name: data?.name,
    members: data?.members,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.files.updateFile, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating file:', error);

    return { success: false, error };
  }
}

export async function deleteFile(id: string) {
  if (!id) {
    console.error('Error deleting file: ID is missing');
    return { success: false, error: 'File ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.files.deleteFile}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting file:', error);

    return { success: false, error };
  }
}

export async function shareFile(data: shareFilePayload) {
  const requestData: shareFilePayload = {
    id: data?.id,
    members: data?.members,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.files.shareFile, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding task:', error);

    return { success: false, error };
  }
}
export function getRepository(enabled = true) {
  const swrKey = useMemo(() => (enabled ? apiEndpoints.files.getRepository : null), [enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;
    const successData = isApiError ? null : data?.successStatus;

    const filesAndFolders = successData?.filesAndFolders ?? {
      projects: [],
      clients: [],
      vendors: [],
    };

    const systemGenerated = successData?.systemGenerated ?? {
      tasks: [],
      chat: [],
      users: [],
    };

    return {
      allFilesAndFolders: { filesAndFolders, systemGenerated },
      allFilesAndFoldersLoading: isLoading,
      allFilesAndFoldersError: isApiError ? data?.message : error,
      allFilesAndFoldersValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}
