'use client';

import { mutate } from 'swr';

import axios, { endpoints } from 'src/utils/axios';
import { apiEndpoints } from 'src/utils/api-endpoints';

import { setSession, setZetaApiSession } from './utils';
import { STORAGE_KEY } from './constant';
import { toast } from 'src/components/snackbar';
import zetaAxiosInstance from 'src/utils/axios-zeta';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
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
  const withTimeout = (promise, ms) =>
    Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);

  const firebaseConfig = {
    apiKey: 'AIzaSyDO7SzQkbKvF3C5SmiFaUjuq_dfVUrzimw',
    authDomain: 'novotak-3b4b4.firebaseapp.com',
    projectId: 'novotak-3b4b4',
    storageBucket: 'novotak-3b4b4.firebasestorage.app',
    messagingSenderId: '421036600262',
    appId: '1:421036600262:web:54617a5152fc50a83fa0c7',
    measurementId: 'G-5VS1MY2K1B',
  };

  const app = initializeApp(firebaseConfig);

  async function getFcmTokenSafe(app) {
    try {
      const supported = await isSupported();
      if (!supported) {
        console.warn('Firebase Messaging is not supported in this browser.');
        return null;
      }

      if (!('Notification' in window)) return null;

      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        toast.warning(
          'This browser does not support Firebase notifications. You may not receive alerts.'
        );
        return null;
      }
      if (permission === 'granted') {
        console.log('Firebase Notification permission granted.');
        toast.success('Firebase Notification permission granted.');
        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
          vapidKey:
            'BMcQAtW6Jf-bRVFj7EQUPu-IbtCHTlv8yJ9rrfT43FkNA-nZDKc99T7PiC9IJEDlTFAUx3MAzjlzDr2ZbGV1akQ',
        });

        // return token || null;
        if (token) {
          localStorage.setItem('fireMessageToken', token);
          return token;
        } else {
          console.warn('No FCM token received.');
        }
      }
    } catch (err) {
      console.warn('FCM failed:', err);
      return null;
    }
  }

  let fcmToken = null;
  try {
    fcmToken = await withTimeout(getFcmTokenSafe(app), 2500);
  } catch (e) {
    console.warn('FCM failed, continuing login', e);
    fcmToken = null;
  }

  try {
    const loginParams = {
      usernameOrEmail: email,
      password,
      deviceType: 3,
      ...(fcmToken && { fcmDeviceToken: fcmToken }),
      deviceTypeData: 'browser',
    };
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('refreshTokenExpiration');

    delete zetaAxiosInstance.defaults.headers.common['Authorization'];

    const zetaResponse = await zetaAxiosInstance.post(apiEndpoints.auth.signIn, loginParams);
    console.log('this is the response', zetaResponse);

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

    console.log('this is the response', zetaResponse);

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

    console.log('This is the response', response);
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

    console.log('This is the response', response);
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
