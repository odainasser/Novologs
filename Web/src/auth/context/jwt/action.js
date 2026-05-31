'use client';

import { mutate } from 'swr';

import axios, { endpoints } from 'src/utils/axios';
import { apiEndpoints } from 'src/utils/api-endpoints';

import { setSession, setZetaApiSession } from './utils';
import { STORAGE_KEY } from './constant';
import { toast } from 'src/components/snackbar';
import zetaAxiosInstance from 'src/utils/axios-zeta';
/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};
export const signInUserWithPassword = async ({ email, password }) => {
  try {
    const loginParams = {
      usernameOrEmail: email,
      password,
      deviceType: 3,
      deviceTypeData: 'browser',
    };
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('refreshTokenExpiration');

    delete zetaAxiosInstance.defaults.headers.common['Authorization'];

    const zetaResponse = await zetaAxiosInstance.post(apiEndpoints.auth.signIn, loginParams);

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
  } catch (error) {
    const message =
      error ||
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred during login';
    throw new Error(message);
  }
};

export const linkAccountSignIn = async ({ email, password, company }) => {
  try {
    const baseURL = `https://${company}.novologs.com`;

    const loginParams = {
      usernameOrEmail: email,
      password,
      deviceType: 3,
      deviceTypeData: 'browser',
    };

    delete zetaAxiosInstance.defaults.headers.common['Authorization'];

    const zetaResponse = await zetaAxiosInstance.post(
      `${baseURL}${apiEndpoints.auth.signIn}`,
      loginParams
    );


    mutate(() => true, null, { revalidate: false });

    return zetaResponse.data;
  } catch (error) {
    const message =
      error ||
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred during login';
    toast.error(message);
  }
};

export async function forgetPassword(data) {
  try {
    const requestData = { usernameOrEmail: data.email };

    const response = await zetaAxiosInstance.post(apiEndpoints.auth.forgotPassword, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error) {
    console.error('Error sending email:', error);

    return { success: false, error };
  }
}

export async function resetPassword(data) {
  try {
    const requestData = {
      code: data?.code || '',
      userId: data?.userId || '',
      password: data?.password,
    };

    const response = await zetaAxiosInstance.post(apiEndpoints.auth.resetPassword, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error) {
    console.error('Error sending:', error);

    return { success: false, error };
  }
}

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
