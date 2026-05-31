import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetCurrencyPayload,
  GetCurrencyResponse,
  AddCurrency,
  AddSetting,
  GetSettingsResponse,
  UpdateSetting,
} from '../settings/settingModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getCurrencies(payload?: GetCurrencyPayload) {
  const defaultPayload: GetCurrencyPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.settings.getCurrencies, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetCurrencyResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const currencyObject = data?.successStatus;
    const currency = data?.successStatus?.items ?? [];

    return {
      currencyList: { currency, currencyObject },
      currencyListLoading: isLoading,
      currencyListError: error,
      currencyListValidating: isValidating,
      currencyListEmpty: !isLoading && currency.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addCurrency(data: AddCurrency) {
  const requestData: AddCurrency = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    symbol: data.symbol,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.settings.addCurrency, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding currency:', error);

    return { success: false, error };
  }
}

export function getSettings(payload?: GetCurrencyPayload) {
  const defaultPayload: GetCurrencyPayload = {
    search: {
      fieldName: 'IsActive',
      fieldValue: true,
    },
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.settings.getSettings, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSettingsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const settingsObject = data?.successStatus;
    const settings = data?.successStatus?.items ?? [];

    return {
      settingsList: { settings, settingsObject },
      settingsListLoading: isLoading,
      settingsListError: error,
      settingsListValidating: isValidating,
      settingsListEmpty: !isLoading && settings.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addSetting(data: AddSetting) {
  const requestData: AddSetting = {
    key: data?.key,
    value: data?.value,
    extra: data?.extra,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.settings.addSetting, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding company logo:', error);

    return { success: false, error };
  }
}

export async function updateSetting(data: UpdateSetting) {
  const requestData: UpdateSetting = {
    id: data?.id,
    key: data?.key,
    value: data?.value,
    extra: data?.extra,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.settings.updateSetting, requestData);
    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating setting:', error);

    return { success: false, error };
  }
}

export async function deleteSetting(id: string) {
  if (!id) {
    console.error('Error deleting company logo: ID is missing');
    return { success: false, error: 'Logo ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.settings.deleteSetting}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting company logo:', error);

    return { success: false, error };
  }
}
