'use client';

import { z as zod } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'src/routes/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify';

import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { signInUserWithPassword, forgetPassword } from '../../context/jwt';
import { PasswordIcon } from 'src/assets/icons';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { ssoLogin } from 'src/actions/ssoLinks/ssoActions';
import { Card, CardContent, LinearProgress, Typography } from '@mui/material';

export function JwtSignInView() {
  const { t } = useTranslation('dashboard/sign');
  const searchParams = useSearchParams();

  useEffect(() => {

    const ssoToken = searchParams.get('ssoToken');
    if (ssoToken) {
      handleSsoLogin(ssoToken);
    }
  }, []);

  const SignInSchema = zod.object({
    email: zod.string().min(1, { message: t('validations.email_required') }),

    password: zod
      .string()
      .min(1, { message: t('validations.Password_required') })
      .min(8, { message: t('validations.Password_valid') })
      .regex(/[A-Z]/, t('validations.Must_contain_uppercase'))
      .regex(/[0-9]/, t('validations.Must_contain_number'))
      .regex(/[^A-Za-z0-9]/, t('validations.Must_contain_special')),
  });

  const router = useRouter();

  const { checkUserSession } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const [isForgetPassword, setIsForgetPassword] = useState(false);

  const [showError, setShowError] = useState(false);

  const [forgetPWformData, setForgetPWFormData] = useState({
    email: '',
  });
  const password = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const forgetPasswordMethods = useForm({
    defaultValues: { email: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await signInUserWithPassword({ email: data.email, password: data.password });

      console.log('API Response:', response);
      if (response.succeeded) {
        await checkUserSession?.();

        router.refresh();
        toast.success(t('toast.Loggedsuccessfully'), {
          autoClose: 1000,
          closeOnClick: true,
        });

        // toast.success('Firebase Notification permission granted.');
      } else {
        toast.error(response.errors[0]?.description, {
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const forgetPasswordSubmit = forgetPasswordMethods.handleSubmit(async () => {
    if (!forgetPWformData.email) {
      setShowError(true);
      return;
    }

    const payload = { email: forgetPWformData.email };
    console.log('Payload for forgetPassword:', payload);

    try {
      const response = await forgetPassword(payload);
      if (response.success) {
        toast.success(t('toast.email_sent'));

        setForgetPWFormData({ email: '' });
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Sending email failed:', error);
    }
  });
  const handleSsoLogin = async (ssoToken) => {
    setLoading(true);

    try {
      const targetDomain = window.location.hostname;
      // const targetDomain = `novocyber.cyber.cloudhome.online`;

      const loginResponse = await ssoLogin({ ssoToken, targetDomain });

      console.log('SSO login response:', loginResponse);
      if (loginResponse?.succeeded) {
        await checkUserSession?.();
        router.refresh();
        toast.success(t('toast.account_switched_successfully'), {
          autoClose: 1000,
          closeOnClick: true,
        });
      } else {
        toast.error(response.errors[0]?.description, {
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };
  const renderSignInForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text
        name="email"
        label={t('labels.email_address')}
        InputLabelProps={{ shrink: true }}
      />

      <Box gap={1.5} display="flex" flexDirection="column">
        <Link
          component="button"
          type="button"
          onClick={() => setIsForgetPassword(true)}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end', cursor: 'pointer' }}
        >
          {t('labels.forgot_password?')}
        </Link>

        <Field.Text
          name="password"
          label={t('labels.password')}
          placeholder={t('labels.password')}
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
            inputProps: {
              style: {
                '::-ms-reveal': { display: 'none' },
                '::-ms-clear': { display: 'none' },
              },
            },
          }}
          sx={{
            '& input::-ms-reveal': {
              display: 'none',
            },
            '& input::-ms-clear': {
              display: 'none',
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={t('labels.signin')}
      >
        {t('labels.sign_in')}
      </LoadingButton>
    </Box>
  );

  const renderForgetPasswordForm = (
    <Box gap={3} display="flex" flexDirection="column">
      <TextField
        fullWidth
        label={t('labels.email_id')}
        name="email"
        value={forgetPWformData.email}
        onChange={(e) => {
          setForgetPWFormData({
            ...forgetPWformData,
            email: e.target.value,
          });
          setShowError(false);
        }}
        required
        error={showError && !forgetPWformData.email}
        helperText={showError && !forgetPWformData.email ? t('toast.email_required') : ''}
      />

      <LoadingButton fullWidth color="inherit" size="large" type="submit" variant="contained">
        {t('labels.send_request')}
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title={isForgetPassword ? '' : t('labels.sigin_account')}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {isForgetPassword ? (
        <>
          <FormHead
            icon={<PasswordIcon />}
            title={t('labels.forgot_password?')}
            description={t('toast.please_enter')}
          />

          <Form methods={forgetPasswordMethods} onSubmit={forgetPasswordSubmit}>
            {renderForgetPasswordForm}
          </Form>
          <Link
            color="inherit"
            variant="subtitle2"
            sx={{
              mt: 3,
              gap: 0.5,
              mx: 'auto',
              alignItems: 'center',
              display: 'inline-flex',
              cursor: 'pointer',
            }}
            onClick={() => setIsForgetPassword(false)}
          >
            <Iconify width={16} icon="eva:arrow-ios-back-fill" />
            {t('labels.back_to_sigin')}
          </Link>
        </>
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          {renderSignInForm}
        </Form>
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
                  {t('labels.please_wait')}...
                </Typography>
                <LinearProgress
                  sx={{
                    mt: 2,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#2FBBA8',
                    },
                    backgroundColor: 'rgba(47, 187, 168, 0.2)',
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  {t('labels.processing_request')}...
                </Typography>
              </>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
