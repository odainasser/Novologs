'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY, ZETA_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, setZetaApiSession, handleTokenExpiration } from './utils';
import { apiEndpoints } from 'src/utils/api-endpoints/index';
import zetaAxiosInstance from 'src/utils/axios-zeta';
import { toast } from 'src/components/snackbar';
// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    zetaUser: null,
    loading: true,
    zetaLoading: true,
    accessToken: null,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);
      const zetaToken = localStorage.getItem(ZETA_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        const { user } = res.data;

        setState({ user: { ...user, accessToken }, loading: false });
      } else {
        setState({ user: null, loading: false });
      }

      if (zetaToken && isValidToken(zetaToken)) {
        try {
          const url = `${apiEndpoints.users.getInfo}`;
          zetaAxiosInstance.defaults.headers.common.Authorization = `Bearer ${zetaToken}`;

          const resZeta = await zetaAxiosInstance.get(url);

          console.log('this is the resZeta:', resZeta);

          if (resZeta.data) {
            setZetaApiSession(zetaToken);
            setState({
              zetaUser: {
                ...resZeta.data.successStatus,
              },
              accessToken: zetaToken,
              zetaLoading: false,
            });
          } else {
            console.warn(' Zeta API did not return valid data:', resZeta.data);
            setState({
              zetaUser: null,
              accessToken: null,
              zetaLoading: false,
            });
          }
        } catch (error) {
          console.error(' Zeta API request failed:', error);
          toast.error(error || 'Request failed');

          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
          }

          setState({
            zetaUser: null,
            accessToken: null,
            zetaLoading: false,
          });
        }
      } else {
        setState({
          zetaUser: null,
          accessToken: null,
          zetaLoading: false,
        });
      }
    } catch (error) {
      console.error(error);
      setState({
        user: null,
        zetaUser: null,
        loading: false,
        zetaLoading: false,
      });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   const onVisibilityChange = async () => {
  //     if (document.visibilityState === 'visible') {
  //       await handleTokenExpiration();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', onVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  // }, []);
  // ----------------------------------------------------------------------

  const checkAuthenticatedTairra = state.zetaUser ? 'authenticated' : 'unauthenticated';

  const status = state.loading || state.zetaLoading ? 'loading' : checkAuthenticatedTairra;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'admin',
          }
        : null,
      zetaUser: state.zetaUser
        ? {
            ...state.zetaUser,
            role: state.zetaUser?.role ?? 'admin',
          }
        : null,

      checkUserSession,
      accessToken: state.accessToken,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, state.zetaUser, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
