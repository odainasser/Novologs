'use client';

import { useState, useEffect } from 'react';

import { z as zod } from 'zod';
import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { user_gender } from 'src/sections/user/user-mock-data';
import CardHeader from '@mui/material/CardHeader';
import { Iconify } from 'src/components/iconify';
import { AddUserFiles } from './add-user-files';
import { MultiFilePreview } from 'src/components/upload/components/preview-multi-file';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export function UserNewEditForm({ currentUser }) {

  const { t, i18n } = useTranslation('dashboard/teams');
  const NewUserSchema = zod.object({
    avatarUrl: schemaHelper.file({
      message: { required_error:t('editform.validations.avatar_required') },
    }),
    id: zod.string().min(1, { message:  t('editform.validations.id_required') }),
    name: zod.string().min(1, { message: t('editform.validations.name_required') }),
    username: zod.string().min(1, { message: t('editform.validations.username_required') }),
    email: zod
      .string()
      .min(1, { message: t('editform.validations.email_required') })
      .email({ message: t('editform.validations.email_invalid') }),
    phoneNumber: schemaHelper.phoneNumber({
      isValidPhoneNumber,
      message: t('editform.validations.phone_invalid'),
    }),
    country: schemaHelper.objectOrNull({
      message: { required_error: t('editform.validations.country_required') },
    }),
    address: zod.string().min(1, { message: t('editform.validations.address_required') }),
    company: zod.string().min(1, { message: t('editform.validations.company_required') }),
    state: zod.string().min(1, { message: t('editform.validations.state_required') }),
    city: zod.string().min(1, { message: t('editform.validations.city_required') }),
    role: zod.string().min(1, { message: t('editform.validations.role_required') }),
    zipCode: zod.string().min(1, { message: t('editform.validations.zipcode_required') }),
    status: zod.string(),
    isVerified: zod.boolean(),
  });
  
  console.log('this is the current user', currentUser);
  const router = useRouter();

  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (typeof currentUser?.avatarUrl === 'string') {
      setPreview(currentUser?.avatarUrl);
    } else if (currentUser?.avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(currentUser?.avatarUrl));
    }
  }, [currentUser?.avatarUrl]);
  const [openFiles, setOpenFiles] = useState(false);
  const handleOpenFile = () => {
    setOpenFiles(true);
  };
  const handleFileDialogClose = () => {
    setTimeout(() => {
      setOpenFiles(false);
    }, 100);
  };
  const [files, setFiles] = useState([]);
  console.log('this is the files', files);
  const handleRemoveFile = (inputFile) => {
    const filesFiltered = files.filter((fileFiltered) => fileFiltered !== inputFile);
    setFiles(filesFiltered);
  };
  const filePreview = useBoolean();

  const defaultValues = useMemo(
    () => ({
      status: currentUser?.type || '',
      avatarUrl: preview || null,
      username: currentUser?.email || '',
      isVerified: currentUser?.isVerified || true,
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      country: currentUser?.country || '',
      state: currentUser?.state || '',
      city: currentUser?.city || '',
      address: currentUser?.address || '',
      zipCode: currentUser?.zipCode || '',
      company: currentUser?.company || '',
      role: currentUser?.role || '',
      id: currentUser?.empId || '',
      department: currentUser?.department || '',
    }),
    [currentUser]
  );
  console.log('this is the default values', defaultValues);
  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ?  t('editform.toast.update_success') : t('editform.toast.create_success'));
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });
  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 1, pb: 1, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 1 }}>
              <Field.UploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      my: 1,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                   {t("editform.helper_text.avatar_upload")}{fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {/* {currentUser && (
                     <FormControlLabel
                       labelPlacement="start"
                       control={
                         <Controller
                           name="status"
                           control={control}
                           render={({ field }) => (
                             <Switch
                               {...field}
                               checked={field.value !== 'active'}
                               onChange={(event) =>
                                 field.onChange(event.target.checked ? 'banned' : 'active')
                               }
                             />
                           )}
                         />
                       }
                       label={
                         <>
                           <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                             Banned
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                             Apply disable account
                           </Typography>
                         </>
                       }
                       sx={{
                         mx: 0,
                         mb: 3,
                         width: 1,
                         justifyContent: 'space-between',
                       }}
                     />
                   )} */}

            {/* <Field.Switch
                     name="isVerified"
                     labelPlacement="start"
                     label={
                       <>
                         <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                           Email verified
                         </Typography>
                         <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                           Disabling this will automatically send the user a verification email
                         </Typography>
                       </>
                     }
                     sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                   /> */}

            {/* {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  Deactivate user
                </Button>
              </Stack>
            )} */}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Field.Text name="id" label={t("editform.labels.employee_id")} size="small" />
              <Field.Text name="name" label={t("editform.labels.name")} size="small" />

              <Field.Text name="username" label={t("editform.labels.username")} size="small" />

              <Field.Text name="email" label={t("editform.labels.email")} size="small" />
              <Field.Phone
                name="phoneNumber"
                label={t("editform.labels.phone_number")}
                sx={{
                  '& .MuiInputBase-input': {
                    py: '12px',
                    pl: '50px',
                  },
                }}
              />

              <Field.CountrySelect
                fullWidth
                name="country"
                label={t("editform.labels.nationality")}
                placeholder={t("editform.placeholders.choose_country")}
                sx={{
                  '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                    padding: '2px 4px 2px 5px',
                  },
                }}
              />

              <Field.Text name="address" label={t("editform.labels.address")} size="small" />
              <Field.Text name="role" label={t("editform.labels.designation")} size="small" />

              <Field.Text name="department" label={t("editform.labels.department")} size="small" />
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3, pt: 0 }}>
            <Typography sx={{ mt: 2, mb: 3 }} variant="subtitle1" color="#006A67">
            {' '}
            {t("editform.labels.personal_details")}
            </Typography>

            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >
              <Field.DatePicker
                name="dateOfBirth"
                label= {t("editform.labels.date_of_birth")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />

              <Field.Text name="city" label= {t("editform.labels.city")} size="small" />

              <Field.Text name="nationalId" label={t("editform.labels.national_id")} size="small" />
              <Field.DatePicker
                name="nationalIdExpiry"
                label={t("editform.labels.national_id_expiry")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />
              <Field.Text name="passport" label={t("editform.labels.passport")} size="small" />

              <Field.DatePicker
                name="passportExpiry"
                label={t("editform.labels.passport_expiry")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />
              <Field.Text name="insuranceId" label={t("editform.labels.insurance_id")} size="small" />
              <Field.DatePicker
                name="insuranceIdExpiry"
                label={t("editform.labels.insurance_id_expiry")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />
              <Field.Text name="visType" label={t("editform.labels.visa_type")} size="small" />
              <Field.DatePicker
                name="visaExpiry"
                label={t("editform.labels.visa_expiry")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />
              <Field.Select name="gender" label={t("editform.labels.gender")} size="small">
                {user_gender.map((option) => (
                  <MenuItem key={option.value} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Box>

            <Typography sx={{ mt: 2, mb: 3 }} variant="subtitle1" color="#006A67">
              {' '}
              {t("editform.labels.social_media_links")}
            </Typography>

            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >
              <Field.Text name="linkedIn" label={t("editform.labels.linkedin")}  size="small" />

              <Field.Text name="facebook" label={t("editform.labels.facebook")} size="small" />
              <Field.Text name="instagram" label={t("editform.labels.instagram")} size="small" />
              <Field.Text name="whatsapp" label={t("editform.labels.whatsapp")} size="small" />
              <Field.Text name="twitter" label={t("editform.labels.twitter")} size="small" />
            </Box>
            <Typography sx={{ mt: 2, mb: 3 }} variant="subtitle1" color="#006A67">
              {' '}
              {t("editform.labels.job_data")}
            </Typography>

            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >
              <Field.DatePicker
                name="dateHired"
                label=  {t("editform.labels.date_hired")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />
              <Field.DatePicker
                name="dateJoining"
                label= {t("editform.labels.date_joining")}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '8.5px 14px',
                  },
                }}
              />

              <Field.Text
                name="basicSalary"
                label={t("editform.labels.basic_salary")}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                size="small"
              />

              <Field.Text
                name="hraAmount"
                label={t("editform.labels.hra_amount")}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                size="small"
              />
              <Field.Text
                name="transportationAllowance"
                label={t("editform.labels.transportation_allowance")}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                size="small"
              />
              <Field.Text
                name="otherAllowance"
                label={t("editform.labels.other_allowance")}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                size="small"
              />
            </Box>

            <Typography sx={{ mt: 2, mb: 3 }} variant="subtitle1" color="#006A67">
              {' '}
              {t("editform.labels.files")}
            </Typography>

            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="eva:cloud-upload-fill" />}
              onClick={() => {
                setOpenFiles(true);
              }}
            >
              {t("editform.labels.uploadfiles")}
            </LoadingButton>
            {files.length > 0 && (
              <>
                <FormControlLabel
                  control={<Switch checked={filePreview.value} onClick={filePreview.onToggle} />}
                  label=   {t("editform.labels.showthumbnail")}
                  sx={{ mb: 1, width: 1, justifyContent: 'flex-end' }}
                />
                <MultiFilePreview
                  files={files}
                  thumbnail={filePreview.value}
                  onRemove={handleRemoveFile}
                  sx={{ my: 3 }}
                />
              </>
            )}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? t('editform.buttons.create_user') : t('editform.buttons.save_changes')}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <AddUserFiles
        open={openFiles}
        onClick={handleOpenFile}
        handleClose={handleFileDialogClose}
        files={files}
        setFiles={setFiles}
        onRemove={handleRemoveFile}
        filePreview={filePreview}
      />
    </Form>
  );
}
