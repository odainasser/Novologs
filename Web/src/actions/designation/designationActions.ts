import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetDesignationResponse,
  GetDesignationPayload,
  DeleteDesignation,
  AddDesignation,
  UpdateDesignation,
} from './designationModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getDesignations(payload?: GetDesignationPayload) {
  const defaultPayload: GetDesignationPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 300,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.designations.getDesignation, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetDesignationResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const designations = data?.successStatus?.items ?? [];

    return {
      designationsList: { designations },
      designationsListLoading: isLoading,
      designationsListError: error,
      designationsListValidating: isValidating,
      designationsListEmpty: !isLoading && designations.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addDesignation(data: AddDesignation) {
  const requestData: AddDesignation = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.designations.addDesignation,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding designation:', error);

    return { success: false, error };
  }
}

export async function updateDesignation(data: UpdateDesignation) {
  const requestData: UpdateDesignation = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings?.map((ls) => ({
        ...(ls.id ? { id: ls.id } : {}),
        language: ls.language,
        value: ls.value,
      })),
    },
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.designations.updateDesignation,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      return { success: false, error: response };
    }
  } catch (error: any) {
    console.error('Error updating designation:', error);
    return { success: false, error };
  }
}

export async function deleteDesignation(id: string) {
  const requestData: DeleteDesignation = {
    id: id || '',
  };

  try {
    const response = await zetaAxiosInstance.delete(apiEndpoints.designations.deleteDesignation, {
      data: requestData,
    });

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting designation:', error);

    return { success: false, error };
  }
}
