import axios from 'axios';
import { CONFIG } from 'src/config-global';
import { apiEndpoints } from 'src/utils/api-endpoints';
import { handleTokenExpiration } from 'src/auth/context/jwt/utils';

export const zetaAxiosInstance = axios.create({
  baseURL: CONFIG.zetaApiUrl,
  timeout: 20000,
});

function isAuthApi(url = '') {
  return url.includes(apiEndpoints.auth.signIn) || url.includes(apiEndpoints.auth.refreshToken);
}

// Add Authorization header before each request
zetaAxiosInstance.interceptors.request.use(
  async (config) => {
    const url = config?.url || '';
    // config.headers['x-language'] = storedLang;
    if (isAuthApi(url)) return config;

    let token = localStorage.getItem('ACCESS_TOKEN');

    // If token missing, just continue. Response interceptor will handle 401 if needed.
    if (!token) {
      return config;
    }

    // Always ask utils for valid token.
    // If current token is still valid, same token will be returned.
    // If expired, refresh will happen only once.
    try {
      token = await handleTokenExpiration(false);
    } catch (error) {
      console.error('Request interceptor token handling failed:', error);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

zetaAxiosInstance.interceptors.response.use(
  (res) => {
    if (res?.data?.succeeded === false) {
      const errorMessage =
        res?.data?.errors?.[0]?.description || res?.data?.message || 'Something went wrong!';

      return Promise.reject(errorMessage);
    }

    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Timeout handling
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        'The request is taking longer than expected. Please check your internet connection or try again.'
      );
    }

    if (status === 401) {
      // Never retry login / refresh APIs
      if (isAuthApi(url)) {
        return Promise.reject(error);
      }

      // Prevent infinite retry loop
      if (originalRequest?._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newToken = await handleTokenExpiration(true);

        if (!newToken) {
          return Promise.reject(error);
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return zetaAxiosInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Standard error message fallback
    let errorMessage = 'Something went wrong!';

    if (Array.isArray(error.response?.data) && error.response.data[0]?.description) {
      errorMessage = error.response.data[0].description;
    } else if (
      Array.isArray(error.response?.data?.errors) &&
      error.response.data.errors[0]?.description
    ) {
      errorMessage = error.response.data.errors[0].description;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.statusText) {
      errorMessage = error.response.statusText;
    }

    return Promise.reject(errorMessage);
  }
);

export default zetaAxiosInstance;

// GET Fetcher function
export const fetchGetRequest = async (url) => {
  try {
    const res = await zetaAxiosInstance.get(url);
    return res.data;
  } catch (error) {
    console.error('Failed to get:', error);

    const apiError =
      error?.response?.data?.[0]?.description ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';

    return {
      __error: true,
      message: apiError,
      raw: error.response?.data,
    };
  }
};

// POST Fetcher function
export const postFetcher = async (args) => {
  try {
    const [url, data, config] = Array.isArray(args) ? args : [args, {}, {}];

    const res = await zetaAxiosInstance.post(url, data, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to post:', error);
    return null;
  }
};
