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
import { changePassword } from 'src/actions/user-manage/userManageActions';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';

export function ChangePassword({ handleClosePWDialog, userEmail }) {
  const { t, i18n } = useTranslation('dashboard/sign');
  const RegistrationSchema = z
    .object({
      password: z
        .string()
        .min(8, t('validations.password_valid'))
        .regex(/[A-Z]/, t('validations.Must_contain_uppercase'))
        .regex(/[0-9]/, t('validations.Must_contain_number'))
        .regex(/[^A-Za-z0-9]/, t('validations.Must_contain_special')),
      confirmPassword: z.string().min(1, t('validations.please_confirm')),
      currentPassword: z.string().min(1, t('validations.current_password')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('validations.passwords_match'),
    });

  const storedLang = localStorage.getItem('selectedLang');

  const methods = useForm({
    resolver: zodResolver(RegistrationSchema),
    mode: 'onChange',
    shouldFocusError: true,
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
      email: userEmail,
      currentPassword: data.currentPassword,
      newPassword: data.password,
    };
    console.log('this is the payload', payload);

    try {
      const response = await changePassword(payload);
      if (response.success) {
        toast.success(t('toast.password_changed'));
        handleClosePWDialog();
        reset();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('error changing password:', error);
    } finally {
      setLoading(false);
    }
  });
  return (
    <>
      <DialogTitle>{t('labels.change_password')}</DialogTitle>
      <FormProvider {...methods}>
        <DialogContent>
          <Box component="form" onSubmit={onSubmit} noValidate>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Controller
                name="currentPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('labels.current_password')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      [`${storedLang === 'ar' ? 'startAdornment' : 'endAdornment'}`]: (
                        <InputAdornment position={storedLang === 'ar' ? 'start' : 'end'}>
                          <IconButton onClick={handleClickShowCurrentPassword} edge="end">
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t('labels.new_password')}
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t("labels.confirm_password")}
                    type={showConfirmPassword ? 'text' : 'password'}
                    size="small"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      [`${storedLang === 'ar' ? 'startAdornment' : 'endAdornment'}`]: (
                        <InputAdornment position={storedLang === 'ar' ? 'start' : 'end'}>
                          <IconButton onClick={handleClickShowConfirmPassword} edge="end">
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Alert severity="warning" sx={{ textAlign: 'justify' }}>
             {t("labels.password_must")}
              </Alert>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClosePWDialog}
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
            {t('labels.change')}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </>
  );
}
