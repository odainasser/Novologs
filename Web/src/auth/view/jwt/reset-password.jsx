'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import {
  Card,
  CardContent,
  Box,
  LinearProgress,
  Stack,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from '@mui/material';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import LoadingButton from '@mui/lab/LoadingButton';
import { resetPassword } from '../../context/jwt';
import { toast } from 'src/components/snackbar';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert'; // Added missing Alert import
import { CONFIG } from 'src/config-global';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { paths } from 'src/routes/paths';

const RegistrationSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });
export function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const code = searchParams.get('Code');
  const userId = searchParams.get('userId');

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const methods = useForm({
    resolver: zodResolver(RegistrationSchema),
    mode: 'onChange',
    shouldFocusError: true,
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);

    try {
      const payload = {
        code,
        userId,
        password: data.password,
      };
      const result = await resetPassword(payload);

      if (result.success) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        reset();
        toast.success('Password set successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });

        const clearStorageAndCookies = () => {
          localStorage.clear();

          document.cookie.split(';').forEach((cookie) => {
            document.cookie = cookie
              .replace(/^ +/, '')
              .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
          });
        };
        clearStorageAndCookies();
        setTimeout(() => {
          window.location.href = paths.auth.jwt.signIn;
        }, 2000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <FormProvider {...methods}>
        <Grid
          container
          sx={{
            height: '100vh',
            bgcolor: 'background.default',
            overflow: 'hidden',
          }}
        >
          <Grid
            item
            xs={12}
            md={12}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', lg: 'flex-start' },
              justifyContent: { xs: 'center', lg: 'flex-start' },
              pt: { lg: 4 },
              pl: { lg: 4 },
              width: { md: '100%' },
              margin: { xs: 'auto', md: '0' },
            }}
          >
            <Box
              component="img"
              src={`${CONFIG.assetsDir}/images/novoLogo.svg`}
              alt="Logo"
              sx={{
                width: 'auto',
                // height: "55.74px",

                mb: 4,
                alignSelf: { xs: 'center', md: 'center' },
                ml: { md: 0, lg: 0 },
                mt: { lg: '22vh' },
              }}
            />
            <Box
              sx={{
                width: '100%',
                maxWidth: 480,
                p: { xs: 2, sm: 3 },
                mx: { lg: 'auto' },
                // mt: { lg: "25vh" },
              }}
            >
              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={3.5}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        size="small"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            position: 'relative',
                            borderRadius: '8.87px',
                            backgroundColor: '#F7F7F7',
                            overflow: 'hidden',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: '8.9px',
                              backgroundColor: '#006A67',
                              borderTopLeftRadius: '8.87px',
                              borderBottomLeftRadius: '8.87px',
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleClickShowPassword}>
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
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        size="small"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            position: 'relative',
                            borderRadius: '8.87px',
                            backgroundColor: '#F7F7F7',
                            overflow: 'hidden',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: '8.9px',
                              backgroundColor: '#006A67',
                              borderTopLeftRadius: '8.87px',
                              borderBottomLeftRadius: '8.87px',
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleClickShowConfirmPassword}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                  <Alert severity="warning" sx={{ textAlign: 'justify' }}>
                    Password must be 8–22 characters long with at least one numeric, one uppercase
                    letter, and one special character like @, #, $, %, &, *
                  </Alert>
                  <Stack direction="row" spacing={2}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      fullWidth
                      loading={isSubmitting}
                      sx={{
                        bgcolor: '#006A67',
                        color: '#fff',
                        borderRadius: '8.87px',
                        '&:hover': {
                          bgcolor: '#005c58',
                        },
                      }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Reset Password
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* <Grid
            item
            xs={false}
            md={6}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "stretch",
              justifyContent: "center",
              overflow: "hidden",
              width: { md: "40%" },
            }}
          >
            <Box
              component="img"
              src="/reg/images/img3Crop.png"
              sx={{
                width: "100%",
                height: "100%",
                // objectFit: "cover",
              }}
            />
          </Grid> */}
        </Grid>
      </FormProvider>
    </>
  );
}
