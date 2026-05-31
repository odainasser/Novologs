'use client';
import { useState, useEffect } from 'react';

import {
  Box,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { RouterLink } from 'src/routes/components';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';
import { getPublicDocument, updateDocument } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';

export function PostDetailsToolbar({
  backLink = '/dashboard/documents',
  editLink = '/dashboard/documents/edit/101',
  sx,
  document,
  documentId,
  mutateDocument,
  isTimeSheetView,
  ...other
}) {
  const { t } = useTranslation('dashboard/documents');
  const storedLang = localStorage.getItem('selectedLang');

  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  useEffect(() => {
    if (documentId) {
      setPublicLink(
        `${CONFIG.zetaApiUrl}/dashboard/${isTimeSheetView ? 'notes' : 'documents'}/view/${documentId}`
      );
      console.log(
        'Public link set to:',
        `${CONFIG.zetaApiUrl}/dashboard/documents/view/${documentId}`
      );
    }
  }, [documentId]);
  const [isPublicLink, setIsPublicLink] = useState(document?.visibiltiy === 0 ? false : true);

  useEffect(() => {
    if (document) {
      setIsPublicLink(document.visibiltiy !== 0);
    }
  }, [document?.visibiltiy]);

  useEffect(() => {
    console.log('Visibility:', document?.visibiltiy);
    console.log('isPublicLink:', isPublicLink);
  }, [document, isPublicLink]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    if (!navigator?.clipboard) {
      fallbackCopyText(publicLink);
      return;
    }

    try {
      await navigator.clipboard.writeText(publicLink);
      toast.success(t('documents.list.toolbar.copied_to_clipboard'));
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      fallbackCopyText(publicLink);
    }
  };
  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // avoid scrolling
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };

  const handleVisibilityChange = async () => {
    const newVisibility = isPublicLink ? 0 : 2;
    const payload = { id: documentId, visibiltiy: newVisibility };

    try {
      const response = await updateDocument(payload);
      if (response.success) {
        setIsPublicLink(!isPublicLink);
        toast.success(newVisibility === 2 ? 'Document is made public' : 'Document is now private');
        await mutateDocument();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <>
      <Stack spacing={1.5} direction="row" sx={{ mb: { xs: 3, md: 5 }, ...sx }} {...other}>
        <Button
          component={RouterLink}
          href={backLink}
          startIcon={
            <Iconify
              icon="eva:arrow-ios-back-fill"
              width={16}
              sx={{
                mt: 0.5,
                transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            />
          }
        >
          {t('documents.list.toolbar.back')}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={t('documents.list.toolbar.edit')}>
          <IconButton component={RouterLink} href={editLink}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('documents.list.toolbar.share')}>
          <Button
            color="info"
            variant="contained"
            startIcon={
              <Iconify
                icon="eva:share-fill"
                sx={{
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            sx={{ textTransform: 'capitalize' }}
            onClick={handleOpenDialog}
          >
            {t('documents.list.toolbar.share')}
          </Button>
        </Tooltip>
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{t('documents.list.toolbar.dialog_title')}</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch size="small" checked={isPublicLink} onChange={handleVisibilityChange} />
            }
            label={t('documents.list.toolbar.make_public')}
          />
          <Typography gutterBottom sx={{ mt: 2 }}>
            {t('documents.list.toolbar.copy_instruction')}
          </Typography>
          <TextField fullWidth value={publicLink} InputProps={{ readOnly: true }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('documents.list.toolbar.close_button')}</Button>
          <Button
            color="primary"
            startIcon={<Iconify icon="eva:copy-fill" />}
            onClick={handleCopyLink}
          >
            {t('documents.list.toolbar.copy_button')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          {t('documents.list.toolbar.copied_to_clipboard')}
        </Alert>
      </Snackbar>
    </>
  );
}
