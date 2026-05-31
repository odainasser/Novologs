import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  CreateDocument,
  GetDocumentPayload,
  GetDocumentResponse,
  UpdateDocument,
  GetDocumentCommentPayload,
  GetDocumentCommentResponse,
  AddDocumentComments,
} from './documentModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getDocument(payload: GetDocumentPayload | null) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetDocumentPayload = {
      pagination: {
        pageNumber: 1,
        pageSize: 1,
      },
      ...payload,
    };
    return [apiEndpoints.documents.getDocument, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetDocumentResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const documentObject = data?.successStatus;
    const documents = data?.successStatus?.items ?? [];
    const totalDocuments = data?.successStatus?.total ?? 0;

    return {
      documentList: { documents, documentObject, totalDocuments },
      documentListLoading: isLoading,
      documentListError: error,
      documentListValidating: isValidating,
      documentListEmpty: !isLoading && documents.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export async function addDocument(data: CreateDocument) {
  const requestData: CreateDocument = {
    type: data.type,
    visibiltiy: data.visibiltiy,
    status: data.status,
    parentDocumentId: data.parentDocumentId,
    documentCategoryId: data.documentCategoryId,
    members: data.members,
    documentContent: {
      id: data.documentContent.id,
      version: data.documentContent.version,
      title: data.documentContent.title,
      description: data.documentContent.description,
      content: data.documentContent.content,
      headerImgFileId: data.documentContent.headerImgFileId,
      filesIds: data.documentContent.filesIds || [],
    },
    taskId: data.taskId,
    mileStoneId: data.mileStoneId,
    projectId: data.projectId,
    clientId: data.clientId,
    clientLeadId: data.clientLeadId,
    vendorId: data.vendorId,
    vendorContractId: data.vendorContractId,
  };

  if (requestData.members === undefined) {
    requestData.members = [];
  }

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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.documents.createDocument,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, error: 'Failed to create document' };
    }
  } catch (error: any) {
    console.error('Error adding document:', error);
    return { success: false, error };
  }
}

export async function updateDocument(data: UpdateDocument) {
  const requestData: UpdateDocument = {
    id: data.id,
    type: data.type,
    visibiltiy: data.visibiltiy,
    status: data.status,
    parentDocumentId: data.parentDocumentId,
    documentCategoryId: data.documentCategoryId,
    members: data.members,
    documentContent: data.documentContent && {
      id: data.documentContent.id,
      version: data.documentContent.version,
      title: data.documentContent.title,
      description: data.documentContent.description,
      content: data.documentContent.content,
      headerImgFileId: data.documentContent.headerImgFileId,
      filesIds: data.documentContent.filesIds,
    },
    taskId: data.taskId,
    mileStoneId: data.mileStoneId,
    projectId: data.projectId,
    clientId: data.clientId,
    clientLeadId: data.clientLeadId,
    vendorId: data.vendorId,
    vendorContractId: data.vendorContractId,
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
    const response = await zetaAxiosInstance.put(
      apiEndpoints.documents.updateDocument,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to updating doc');
    }
  } catch (error: any) {
    console.error('Error updating doc:', error);

    return { success: false, error };
  }
}

export async function deleteDocument(id: string) {
  if (!id) {
    console.error('Error deleting document: ID is missing');
    return { success: false, error: 'Document ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.documents.deleteDocument}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting Document:', error);

    return { success: false, error };
  }
}

export function getDocumentComment(payload: GetDocumentCommentPayload | null) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetDocumentCommentPayload = {
      pagination: {
        pageNumber: 1,
        pageSize: 50,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
      ...payload,
    };
    return [apiEndpoints.documents.getCommentItem, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetDocumentCommentResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const documentCommentObject = data?.successStatus;
    const documentComments = data?.successStatus?.items ?? [];
    const totalDocumentComments = data?.successStatus?.total ?? 0;

    return {
      documentCommentList: { documentComments, documentCommentObject, totalDocumentComments },
      documentCommentListLoading: isLoading,
      documentCommentListError: error,
      documentCommentListValidating: isValidating,
      documentCommentListEmpty: !isLoading && documentComments.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export function getDocumentCommentThread(payload: GetDocumentCommentPayload | null) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetDocumentCommentPayload = {
      pagination: {
        pageNumber: 1,
        pageSize: 50,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
      ...payload,
    };
    return [apiEndpoints.documents.getCommentThread, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetDocumentCommentResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const documentCommentObject = data?.successStatus;
    const documentComments = data?.successStatus?.items ?? [];
    const totalDocumentComments = data?.successStatus?.total ?? 0;

    return {
      documentCommentList: { documentComments, documentCommentObject, totalDocumentComments },
      documentCommentListLoading: isLoading,
      documentCommentListError: error,
      documentCommentListValidating: isValidating,
      documentCommentListEmpty: !isLoading && documentComments.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export async function addDocumentComments(data: AddDocumentComments) {
  const requestData: AddDocumentComments = {
    threadId: data.threadId,
    content: data.content,
    filesIds: data.filesIds,
    mentionedUsersIds: data.mentionedUsersIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.documents.addCommentItem,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding document comments:', error);

    return { success: false, error };
  }
}

export async function deleteDocumentComments(id: string) {
  if (!id) {
    console.error('Error deleting document comment: ID is missing');
    return { success: false, error: 'Document comment ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.documents.deleteCommentItem}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting Document comment:', error);

    return { success: false, error };
  }
}

export async function getPublicDocument(id: string) {
  const requestData = {
    id: id,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.documents.getPublicDocument,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, error: 'Failed' };
    }
  } catch (error: any) {
    console.error('Error :', error);
    return { success: false, error };
  }
}
