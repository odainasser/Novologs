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

export function AddClientImage({
  open,
  onClose,
  handleClose,
  mode,
  avatarUrl,
  setAvatarUrl,
  setProfileImageFileId,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/client');

  const handleDropAvatar = useCallback(
    (acceptedFiles) => {
      const newFile = acceptedFiles[0];
      setAvatarUrl(newFile);
    },
    [setAvatarUrl]
  );

  const handleCloseDialog = () => {
    handleClose();
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCloseDialog} {...other}>
      <DialogTitle>
        {mode === 'add'
          ? t('clients.labels.add_client_image')
          : t('clients.labels.edit_client_image')}
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
            {t('clients.validations.allowed')}
            <br /> {t('clients.validations.max')} {fData(3145728)}
          </Typography>
        }
      />
      <DialogActions>
        <Button variant="contained" onClick={handleCloseDialog}>
          {mode === 'add' ? t('clients.buttons.add') : t('clients.buttons.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
