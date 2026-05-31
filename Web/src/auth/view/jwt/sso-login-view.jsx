'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { ssoLogin } from 'src/actions/ssoLinks/ssoActions';
import { useAuthContext } from 'src/auth/hooks';
import Alert from '@mui/material/Alert';
import { Card, CardContent, Box, LinearProgress, Typography } from '@mui/material';

export  function SsoLoginView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const ssoToken = searchParams.get('ssoToken');
    if (ssoToken) {
      handleSsoLogin(ssoToken);
    }
  }, [isMounted]);

  const handleSsoLogin = async (ssoToken) => {
    setLoading(true);

    try {
      if (typeof window === 'undefined') return; // Prevent SSR access
      const targetDomain = window.location.hostname;

      const loginResponse = await ssoLogin({ ssoToken, targetDomain });
      console.log('SSO login response:', loginResponse);

      if (loginResponse?.succeeded) {
        await checkUserSession?.();
        router.refresh();
        toast.success('Account switched successfully', { autoClose: 1000, closeOnClick: true });
      } else {
        toast.error(loginResponse?.errors?.[0]?.description || 'Login failed', { autoClose: 5000 });
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
      setTimeout(() => router.push('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null; // ✅ Prevent prerender issues

  return (
    <>
      {!!errorMsg && (
        <Box sx={{ m: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        </Box>
      )}
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          bgcolor="#f9f9f9"
        >
          <Card sx={{ width: 400, p: 3, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
            <CardContent>
              <>
                <Typography variant="h6" sx={{ color: '#006A67' }} gutterBottom>
                  Please wait...
                </Typography>
                <LinearProgress
                  sx={{
                    mt: 2,
                    mb: 1,
                    '& .MuiLinearProgress-bar': { backgroundColor: '#2FBBA8' },
                    backgroundColor: 'rgba(47, 187, 168, 0.2)',
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  Processing your request
                </Typography>
              </>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
