import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import { UpdateLocalizable } from './localizableModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export async function updateLocalizable(data: UpdateLocalizable) {
  const requestData: UpdateLocalizable = {
    id: data.id,
    value: data?.value || '',
    localizedStrings: data?.localizedStrings,
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.localizable.updateLocalizable,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating designation:', error);

    return { success: false, error };
  }
}
