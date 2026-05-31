import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetTransactionPayload,
  GetTransactionResponse,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
} from './transactionModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export async function addTransaction(data: CreateTransaction, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.post(
      apiEndpoints.transactions.createTransaction,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    console.error('Error adding transaction:', error);
    return { success: false, error };
  }
}

export function getTransactions(payload?: GetTransactionPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetTransactionPayload = {
      ...payload,
    };
    return [apiEndpoints.transactions.getTransactions, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetTransactionResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const transactionObject = data?.successStatus;
    const transactions = data?.successStatus?.items ?? [];
    const totalAccounts = data?.successStatus?.total ?? 0;
    return {
      transactionList: { transactions, transactionObject, totalAccounts },
      transactionListLoading: isLoading,
      transactionListError: error,
      transactionListValidating: isValidating,
      transactionListEmpty: !isLoading && transactions.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function updateTransaction(data: UpdateTransaction, id: string, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.transactions.updateTransaction}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return { success: false, error };
  }
}

export async function postTransaction(id: number) {
  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.transactions.postTransaction(id));

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error posting transaction:', error);
    return { success: false, error };
  }
}
export async function deleteTransaction(id: string) {
  const requestData: DeleteTransaction = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting transaction: ID is missing');
    return { success: false, error: 'Transaction ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.transactions.deleteTransaction}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting transaction:', error);

    return { success: false, error };
  }
}
