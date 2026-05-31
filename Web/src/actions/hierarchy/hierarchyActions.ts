import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetHierarchyResponse,
  GetHierarchyPayload,
  AddUserToHierarchy,
  DeleteUserFromHierarchy,
  SwapUserInHierarchy,
} from './hierarchyModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getHierarchy(payload?: GetHierarchyPayload) {
  const defaultPayload: GetHierarchyPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    // sort: {
    //   fieldName: 'Created',
    //   sortDirection: 1,
    // },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.hierarchy.getHierarchy, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetHierarchyResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const hierarchyObject = data?.successStatus;
    const hierarchy = data?.successStatus?.items ?? [];

    return {
      hierarchyList: { hierarchy, hierarchyObject },
      hierarchyListLoading: isLoading,
      hierarchyListError: error,
      hierarchyListValidating: isValidating,
      hierarchyListEmpty: !isLoading && hierarchy.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addUserToHierarchy(data: AddUserToHierarchy) {
  const requestData: AddUserToHierarchy = {
    nodeToInsertId: data?.nodeToInsertId || '',
    destinationParentNodeId: data?.destinationParentNodeId || '',
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.hierarchy.addUserToHierarchy,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to add user to hierarchy');
    }
  } catch (error: any) {
    console.error('Error adding user to hierarchy:', error);

    return { success: false, error };
  }
}

export async function swapUserInHierarchy(data: SwapUserInHierarchy) {
  const requestData: SwapUserInHierarchy = {
    sourceNodeId: data?.sourceNodeId || '',
    targetNodeId: data?.targetNodeId || '',
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.hierarchy.swapUserInHierarchy,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to add user to hierarchy');
    }
  } catch (error: any) {
    console.error('Error adding user to hierarchy:', error);

    return { success: false, error };
  }
}

export async function deleteUserFromHierarchy(id: string) {
  const requestData: DeleteUserFromHierarchy = {
    nodeToDeleteId: id || '',
  };

  try {
    const response = await zetaAxiosInstance.delete(
      apiEndpoints.hierarchy.deleteUserFromHierarchy,
      {
        data: requestData,
      }
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to add user to hierarchy');
    }
  } catch (error: any) {
    console.error('Error adding deleting user from hierarchy:', error);

    return { success: false, error };
  }
}
