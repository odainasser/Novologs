'use client';
import { useState } from 'react';

import Stack from '@mui/material/Stack';

import IconButton from '@mui/material/IconButton';

import { TextField, InputAdornment, Box, Button } from '@mui/material';

import { DialogContent, DialogTitle, DialogActions } from '@mui/material';

import { useForm, Controller, FormProvider } from 'react-hook-form';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { linkAccountSignIn } from 'src/auth/context/jwt';
import { ssoInitiate } from 'src/actions/sso-links/ssoActions';

export function AddAccount({ handleCloseAccountDialog, mutateLinks }) {
  const { t, i18n } = useTranslation('dashboard/sign');
  const RegistrationSchema = z.object({
    password: z
      .string()
      .min(8, t('validations.password_valid'))
      .regex(/[A-Z]/, t('validations.Must_contain_uppercase'))
      .regex(/[0-9]/, t('validations.Must_contain_number'))
      .regex(/[^A-Za-z0-9]/, t('validations.Must_contain_special')),
    email: z.string().min(1, t('validations.email_required')),
    company: z.string().min(1, t('validations.company_name_is_required')),
  });

  const storedLang = localStorage.getItem('selectedLang');

  const methods = useForm({
    resolver: zodResolver(RegistrationSchema),
    mode: 'onChange',
    shouldFocusError: true,
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      company: '',
    },
  });
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, isValid },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const payload = {
      email: data.email,
      password: data.password,
    };
    console.log('this is the payload', payload);

    try {
      const response = await linkAccountSignIn({
        email: data.email,
        password: data.password,
        company: data.company,
      });
      const accountToken = response?.successStatus?.token;
      console.log('this is the response', response);

      if (response.succeeded) {
        const ssoResponse = await ssoInitiate({ targetTenantAccessToken: accountToken });
        console.log('this is the response of initiate', ssoResponse);
        if (ssoResponse.success) {
          toast.success(t('toast.accounts_added'));
          handleCloseAccountDialog();
          await mutateLinks();
          reset();
        } else {
          toast.error(ssoResponse.error);
          await mutateLinks();
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error:', error);
    } finally {
      setLoading(false);
    }
  });
  return (
    <>
      <DialogTitle>{t('labels.add_account')}</DialogTitle>
      <FormProvider {...methods}>
        <DialogContent>
          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={3} sx={{ p: 0.1, pt: 1 }}>
              <Controller
                name="company"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('labels.company')}
                    type="text"
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('labels.email')}
                    type="text"
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('labels.password')}
                    type={showPassword ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      [`${storedLang === 'ar' ? 'startAdornment' : 'endAdornment'}`]: (
                        <InputAdornment position={storedLang === 'ar' ? 'start' : 'end'}>
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseAccountDialog}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('labels.Cancel')}
          </Button>
          <LoadingButton
            onClick={onSubmit}
            variant="contained"
            disabled={isSubmitting}
            loading={isSubmitting}
            sx={{
              bgcolor: isSubmitting || !isValid ? 'grey.400' : '#006A67',
            }}
          >
            {t('labels.add')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </>
  );
}
