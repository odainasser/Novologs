'use client';
import { useState, useCallback } from 'react';

import { UploadAvatar } from 'src/components/upload';
import Typography from '@mui/material/Typography';
import { fData } from 'src/utils/format-number';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { addFile } from 'src/actions/file/fileActions';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export function AddUserImage({
  open,
  onClose,
  handleClose,
  mode,
  avatarUrl,
  setAvatarUrl,
  setProfileImageFileId,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const handleDropAvatar = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const newFile = acceptedFiles[0];

      const payload = {
        name: newFile.name,
        file: newFile,
        parentFolderId: null,
        entityType: 0,
        entityId: '',
      };

      try {
        const response = await addFile(payload);

        if (response.success) {
          toast.success(t('editform.toast.image_upload'));
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
        toast.error(t('editform.toast.image_upload'));
      }
    },
    [setAvatarUrl, setProfileImageFileId]
  );

  const handleCloseDialog = () => {
    handleClose();
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={handleCloseDialog}
      dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      {...other}
    >
      <DialogTitle>
        {' '}
        {mode === 'add' ? t('editform.buttons.add_image') : t('editform.buttons.edit_image')}
      </DialogTitle>

      <UploadAvatar
        value={avatarUrl}
        onDrop={handleDropAvatar}
        validator={(fileData) => {
          if (fileData.size > 1000000) {
            return { code: 'file-too-large', message: `File is larger than ${fData(1000000)}` };
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
            {t('Validations.allowed_types')}
            <br /> {t('Validations.max')} {fData(3145728)}
          </Typography>
        }
      />
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleCloseDialog}
          sx={storedLang === 'ar' ? { ml: 2 } : {}}
        >
          {t('table.actions.cancel')}
        </Button>
        <Button variant="contained" onClick={handleCloseDialog} sx={{ bgcolor: '#006A67' }}>
          {mode === 'add' ? t('table.actions.add') : t('table.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
