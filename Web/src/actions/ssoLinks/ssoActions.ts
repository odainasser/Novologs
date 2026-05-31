import useSWR from 'swr';
import { useMemo } from 'react';
import { mutate } from 'swr';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import { userLinkedId, targetToken } from './ssoModels';
import { setZetaApiSession } from 'src/auth/context/jwt/utils';

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getSSOLinks(userId: string) {
  const url = userId ? `${apiEndpoints.ssoLinks.getLinks}?userId=${userId}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetchGetRequest, swrOptions);

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const successData = isApiError ? null : data?.successStatus;
    const linkedTo = successData?.linkedTo;
    const linkedFrom = successData?.linkedFrom;

    return {
      ssoLinks: { linkedTo, linkedFrom },
      ssoLinksLoading: isLoading,
      ssoLinksError: isApiError ? data?.message : error,
      ssoLinksValidating: isValidating,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}

export async function generateToken(data: userLinkedId) {
  const requestData: userLinkedId = {
    tenantUsersLinkedToId: data?.tenantUsersLinkedToId,
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
      apiEndpoints.ssoLinks.generateToken,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error generating token:', error);

    return { success: false, error };
  }
}

export async function ssoLogin(data: { ssoToken: string; targetDomain: string }) {
  const { ssoToken, targetDomain } = data;

  const filteredData = {
    ssoToken,
  };

  try {
    const baseURL = `https://${targetDomain}`;
    const zetaResponse = await zetaAxiosInstance.post(
      `${baseURL}${apiEndpoints.ssoLinks.ssoLogin}`,
      filteredData
    );

    console.log('this is the response', zetaResponse);
    // delete zetaAxiosInstance.defaults.headers.common['Authorization'];

    const zetaAccessToken = zetaResponse.data?.successStatus?.token;

    const zetaRefreshToken = zetaResponse.data?.successStatus?.refreshToken;
    const zetaTokenExpiration = zetaResponse.data?.successStatus?.expiration;
    const zetaRefreshTokenExpiration = zetaResponse.data?.successStatus?.refreshTokenExpiration;

    localStorage.setItem('ACCESS_TOKEN', zetaAccessToken);
    localStorage.setItem('refreshToken', zetaRefreshToken);
    localStorage.setItem('tokenExpiration', zetaTokenExpiration);
    localStorage.setItem('refreshTokenExpiration', zetaRefreshTokenExpiration);

    setZetaApiSession(zetaAccessToken);

    mutate(() => true, null, { revalidate: false });

    return zetaResponse.data;
  } catch (error: any) {
    const message =
      error ||
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred during login';
    throw new Error(message);
  }
}

export async function ssoInitiate(data: targetToken) {
  const requestData: targetToken = {
    targetTenantAccessToken: data?.targetTenantAccessToken,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.ssoLinks.ssoInitiate, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error initiating:', error);

    return { success: false, error };
  }
}
