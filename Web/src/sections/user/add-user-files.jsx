'use client';
import { useState, useCallback } from 'react';

import { UploadAvatar } from 'src/components/upload';
import Typography from '@mui/material/Typography';
import { fData } from 'src/utils/format-number';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Upload } from 'src/components/upload';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function AddUserFiles({
  open,
  onClose,
  handleClose,
  files,
  setFiles,
  onRemove,
  filePreview,
  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/teams');
  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files]
  );

  const handleRemoveAllFiles = () => {
    setFiles([]);
  };
  const handleCloseDialog = () => {
    handleClose();
  };
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleCloseDialog} {...other}>
      <DialogTitle sx={{ pb: 0 }}> {t("editform.labels.uploadfiles")} </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <FormControlLabel
          control={<Switch checked={filePreview.value} onClick={filePreview.onToggle} />}
          label={t("editform.labels.showthumbnail")}
          sx={{ mb: 1, width: 1, justifyContent: 'flex-end' }}
        />
        <Upload
          multiple
          thumbnail={filePreview.value}
          value={files}
          onDrop={handleDropMultiFile}
          onRemove={onRemove}
          onRemoveAll={handleRemoveAllFiles}
          onUpload={() => handleCloseDialog()}
        />
      </DialogContent>
    </Dialog>
  );
}
