import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';

import { STORAGE_KEY, ZETA_STORAGE_KEY, EXPIRATION_KEY } from './constant';
import { zetaAxiosInstance } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

const EXPIRY_BUFFER_MS = 60 * 1000; // 1 minute
let refreshPromise = null;

export function isExpired(expiration) {
  if (!expiration) return true;

  let expTime;

  if (typeof expiration === 'number') {
    // if seconds, convert to ms
    expTime = expiration < 1e12 ? expiration * 1000 : expiration;
  } else {
    expTime = new Date(expiration).getTime();
  }

  if (Number.isNaN(expTime)) return true;

  return expTime - EXPIRY_BUFFER_MS <= Date.now();
}

function clearZetaAuthStorage() {
  localStorage.removeItem('ACCESS_TOKEN');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('refreshTokenExpiration');
  localStorage.removeItem(ZETA_STORAGE_KEY);
  localStorage.removeItem(EXPIRATION_KEY);

  delete zetaAxiosInstance.defaults.headers.common.Authorization;
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = paths.auth.jwt.signIn;
  }
}

export async function handleTokenExpiration(forceRefresh = false) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  const refreshToken = localStorage.getItem('refreshToken');
  const refreshTokenExpiration = localStorage.getItem('refreshTokenExpiration');

  if (!refreshToken) {
    clearZetaAuthStorage();
    redirectToLogin();
    return null;
  }

  // Logout only when refresh token is really expired
  if (isExpired(refreshTokenExpiration)) {
    clearZetaAuthStorage();
    redirectToLogin();
    return null;
  }

  // IMPORTANT: if access token is still valid, return it and do NOT refresh
  if (!forceRefresh && accessToken && !isExpired(tokenExpiration)) {
    return accessToken;
  }

  // If a refresh call is already running, reuse it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await zetaAxiosInstance.post(apiEndpoints.auth.refreshToken, {
        refreshToken,
      });

      const refreshData = response?.data?.successStatus ?? response?.data;

      const newAccessToken = refreshData?.token;
      const newRefreshToken = refreshData?.refreshToken;
      const newTokenExpiration = refreshData?.expiration;
      const newRefreshTokenExpiration = refreshData?.refreshTokenExpiration;

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Invalid refresh response');
      }

      localStorage.setItem('ACCESS_TOKEN', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('tokenExpiration', newTokenExpiration);
      localStorage.setItem('refreshTokenExpiration', newRefreshTokenExpiration);
      localStorage.setItem(ZETA_STORAGE_KEY, newAccessToken);

      zetaAxiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      return newAccessToken;
    } catch (err) {
      console.error('Refresh token failed:', err);
      clearZetaAuthStorage();
      redirectToLogin();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ----------------------------------------------------------------------

export async function setSession(accessToken) {
  try {
    if (accessToken) {
      sessionStorage.setItem(STORAGE_KEY, accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (!decodedToken || !('exp' in decodedToken)) {
        throw new Error('Invalid access token!');
      }
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function setZetaApiSession(accessToken) {
  try {
    if (accessToken) {
      localStorage.setItem(ZETA_STORAGE_KEY, accessToken);
      zetaAxiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);
      if (decodedToken && 'exp' in decodedToken) {
        localStorage.setItem(EXPIRATION_KEY, String(decodedToken.exp || ''));
      } else {
        localStorage.removeItem(EXPIRATION_KEY);
      }
    } else {
      localStorage.removeItem(ZETA_STORAGE_KEY);
      localStorage.removeItem(EXPIRATION_KEY);
      delete zetaAxiosInstance.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during setZetaApiSession:', error);
    throw error;
  }
}