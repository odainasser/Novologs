import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetRootLevel,
  GetHierarchyChartResponse,
  CreateAccounts,
  GetAccountsPayload,
  GetAccountsResponse,
  DeleteAccount,
  UpdateAccounts,
  OpeningBalancePayload,
} from './accountModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getRootLevel() {
  const swrKey = useMemo(() => apiEndpoints.accounts.getRootLevel, []);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetRootLevel>(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const levels = !isApiError ? (data?.successStatus ?? []) : [];

    return {
      rootLevels: { levels },
      rootLevelsLoading: isLoading,
      rootLevelsError: isApiError ? data?.message : error,
      rootLevelsValidating: isValidating,
      rootLevelsEmpty: !isLoading && levels.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export function getHierarchyChart() {
  const swrKey = useMemo(() => apiEndpoints.accounts.getHierarchyChart, []);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetHierarchyChartResponse>(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const categories = !isApiError ? (data?.successStatus ?? []) : [];

    return {
      allCategories: { categories },
      allCategoriesLoading: isLoading,
      allCategoriesError: isApiError ? data?.message : error,
      allCategoriesValidating: isValidating,
      allCategoriesEmpty: !isLoading && categories.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addAccount(data: CreateAccounts) {
  const requestData: CreateAccounts = {
    name: data?.name,
    accountType: data?.accountType,
    accountCategory: data?.accountCategory,
    parentAccountId: data?.parentAccountId,
    isSubcategory: data?.isSubcategory,
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
      apiEndpoints.accounts.createAccounts,
      filteredData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding accounts:', error);

    return { success: false, error };
  }
}

export function getAccounts(payload?: GetAccountsPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetAccountsPayload = {
      ...payload,
    };
    return [apiEndpoints.accounts.getAccounts, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetAccountsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const accountObject = data?.successStatus;
    const accounts = data?.successStatus?.items ?? [];
    const totalAccounts = data?.successStatus?.total ?? 0;
    return {
      accountList: { accounts, accountObject, totalAccounts },
      accountListLoading: isLoading,
      accountListError: error,
      accountListValidating: isValidating,
      accountListEmpty: !isLoading && accounts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function updateAccount(data: UpdateAccounts, id: string) {
  const requestData: UpdateAccounts = {
    name: data?.name,
    accountType: data?.accountType,
    accountCategory: data?.accountCategory,
    parentAccountId: data?.parentAccountId,
  };

  try {
    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.accounts.updateAccount}/${id}`,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating accounts:', error);

    return { success: false, error };
  }
}

export async function setOpeningBalance(data: OpeningBalancePayload) {
  const requestData = {
    entries: data.entries,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.accounts.setOpeningBalance,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding opening balance:', error);
    return { success: false, error };
  }
}
export async function deleteAccount(id: string) {
  const requestData: DeleteAccount = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting account: ID is missing');
    return { success: false, error: 'Account ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.accounts.deleteAccount}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting account:', error);

    return { success: false, error };
  }
}

export function getAccountLookups() {
  const swrKey = useMemo(() => apiEndpoints.accounts.getAccountLookups, []);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetRootLevel>(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const accounts = !isApiError ? (data?.successStatus ?? []) : [];

    return {
      lookups: { accounts },
      lookupsLoading: isLoading,
      lookupsError: isApiError ? data?.message : error,
      lookupsValidating: isValidating,
      lookupsEmpty: !isLoading && accounts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export function getAccountById(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.accounts.getAccountById(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const account = data?.successStatus ?? null;

    return {
      accountDetails: account,
      accountDetailsLoading: isLoading,
      accountDetailsError: error,
      accountDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
