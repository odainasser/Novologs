import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const router = useRouter();
 const {t,i18n} = useTranslation('dashboard/sign');
  const { checkUserSession } = useAuthContext();

  const clearStorageAndCookies = () => {
    localStorage.clear();

    document.cookie.split(';').forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
  };
  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      clearStorageAndCookies();
      await checkUserSession?.();

      onClose?.();
  
      localStorage.setItem('authLogout', Date.now());
      window.location.href = '/auth/jwt/sign-in';
    } catch (error) {
      console.error(error);
      toast.error(t('toast.unable_logout'));
    }
  }, [checkUserSession, onClose, router]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      {...other}
    >
      {t('labels.logout')}
    </Button>
  );
}
