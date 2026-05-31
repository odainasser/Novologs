'use client';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';

import { TextField, Box, Button } from '@mui/material';

import { DialogContent, DialogTitle, DialogActions } from '@mui/material';

import { toast } from 'src/components/snackbar';
import { PhoneInput } from 'src/components/phone-input/phone-input';
import { UploadAvatar } from 'src/components/upload';
import { addFile } from 'src/actions/file/fileActions';
import Typography from '@mui/material/Typography';
import { fData } from 'src/utils/format-number';
import { updateUser } from 'src/actions/userSettings/userSettingsActions';
import { useTranslation } from 'react-i18next';

export function EditProfile({ handleCloseProfileDialog, zetaUser, checkUserSession }) {
  const { t, i18n } = useTranslation('dashboard/sign');
  const storedLang = localStorage.getItem('selectedLang');

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageFileId, setProfileImageFileId] = useState('');

  const handleDropAvatar = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const newFile = acceptedFiles[0];

      const payload = {
        name: newFile.name,
        file: newFile,
        parentFolderId: null,
        parentFolderPath: '/BIN',
        entityType: 0,
        entityId: '',
      };

      try {
        const response = await addFile(payload);

        if (response.success) {
          toast.success(t('toast.image_uploaded'));
          const fileId = response.response?.data?.successStatus?.id;
          if (fileId) {
            setProfileImageFileId(fileId);
            setAvatarUrl(newFile);
          }
        } else {
          toast.error(response.error);
          console.error('Upload error:', response.error);
        }
      } catch (error) {
        console.error('Add file failed:', error);
        toast.error(t('toast.unexpected_error'));
      }
    },
    [setAvatarUrl, setProfileImageFileId]
  );

  useEffect(() => {
    if (zetaUser) {
      setEditUser((prev) => ({
        ...prev,
        fullName: zetaUser.fullName || '',
      }));
      setPhoneNumber(zetaUser.phoneNumber || '');
      setAvatarUrl(zetaUser.profileImageFileUrl || '');
      setProfileImageFileId(zetaUser.profileImageFileId || '');
    }
  }, [zetaUser]);
  useEffect(() => {
    if (typeof avatarUrl === 'string') {
      setPreview(avatarUrl);
    } else if (avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(avatarUrl));
    }
  }, [avatarUrl]);
  const [nameError, setNameError] = useState('');
  const handleNameInputChange = (e) => {
    const newName = e.target.value;
    setEditUser((prev) => ({ ...prev, fullName: newName }));
    if (nameError && newName.trim()) {
      setNameError('');
    }
  };

  const handlePhoneNumberChange = useCallback(
    (val) => {
      setPhoneNumber(val ?? '');
    },
    [setPhoneNumber]
  );
  const [editUser, setEditUser] = useState({
    fullName: '',
  });

  const handleEditProfile = async () => {
    let hasError = false;
    const trimmedFullName = editUser.fullName.trim();

    if (!trimmedFullName) {
      setNameError(t('toast.nameRequried'));
      hasError = true;
    } else {
      setNameError('');
    }

    if (hasError) return;

    const detail = {
      ...zetaUser,
      userId: zetaUser?.id,
      fullName: trimmedFullName,
      phoneNumber: phoneNumber ?? '',
      profileImageFileId: profileImageFileId,
    };
    console.log('this is the details', detail);
    try {
      const response = await updateUser(detail);
      if (response.response.data.succeeded) {
        toast.success('Profile updated successfully');
        if (typeof checkUserSession === 'function') {
          await checkUserSession();
        }

        handleCloseProfileDialog();
      } else {
        toast.error(response?.response?.data?.errors?.[0]?.description);
      }
    } catch (error) {
      console.error('Add update failed:', error);
    }
  };

  return (
    <>
      <DialogTitle>{t('labels.editProfile')}</DialogTitle>
      <>
        <DialogContent>
          <Box>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <UploadAvatar
                value={avatarUrl}
                onDrop={handleDropAvatar}
                validator={(fileData) => {
                  if (fileData.size > 3000000) {
                    return {
                      code: t('toast.file-too-large'),
                      message: `${t('toast.file-is-larger')} ${fData(3000000)}`,
                    };
                  }
                  return null;
                }}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    {t('labels.allowed')}
                    <br /> {t('labels.max_size')} {fData(3145728)}
                  </Typography>
                }
              />

              <TextField
                fullWidth
                variant="outlined"
                label={t('labels.name')}
                value={editUser.fullName}
                onChange={handleNameInputChange}
                sx={{
                  '& .MuiInputBase-input': {
                    padding: '9px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-5px',
                    fontSize: '10px',
                  },
                }}
                error={!!nameError}
                helperText={nameError}
              />
              <Box
                sx={{
                  ...(storedLang === 'ar' && {
                    '& .MuiFormLabel-root': {
                      right: 30,
                      left: 'auto',
                      transformOrigin: 'top right',
                    },
                    '& .MuiInputBase-input': {
                      paddingRight: '50px',
                      direction: 'rtl',
                    },
                    '& .MuiButtonBase-root': {
                      marginRight: '12px',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      textAlign: 'right',
                    },
                  }),
                }}
              >
                {' '}
                <PhoneInput
                  label={t('labels.Phonenumber')}
                  fullWidth
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                />
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseProfileDialog}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('labels.cancel')}
          </Button>
          <Button
            onClick={handleEditProfile}
            variant="contained"
            sx={{
              bgcolor: !editUser.fullName ? 'grey.400' : '#006A67',
            }}
          >
            {t('labels.save')}
          </Button>
        </DialogActions>
      </>
    </>
  );
}
