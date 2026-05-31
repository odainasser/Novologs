'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import {
  addSetting,
  getSettings,
  deleteSetting,
  updateSetting,
} from 'src/actions/settings/settingActions';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LinearProgress from '@mui/material/LinearProgress';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

export function TeamNoticeView() {
  const {
    settingsList,
    settingsListLoading,
    settingsListError,
    settingsListValidating,
    settingsListEmpty,
    mutate,
  } = getSettings();

  const confirm = useBoolean();
  const { zetaUser  } = useAuthContext();

  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const [openDialog, setOpenDialog] = useState(false);
  const [newNotice, setNewNotice] = useState('');
  const [newNoticeAr, setNewNoticeAr] = useState('');

  const [error, setError] = useState('');

  const handleNoticeInputChange = (e) => {
    setNewNotice(e.target.value);
    if (error) {
      setError('');
    }
  };
  const handleNoticeInputChangeAr = (e) => {
    setNewNoticeAr(e.target.value);
  };

  const handleAddClick = () => {
    setOpenDialog(true);
  };
  const [settingsId, setSettingsId] = useState('');

  useEffect(() => {
    if (settingsList?.settings) {
      const TeamNoticeSetting = settingsList.settings.find(
        (setting) => setting.key === 'teamNotice'
      );
      if (TeamNoticeSetting) {
        let parsedValue = {};
        try {
          parsedValue = JSON.parse(TeamNoticeSetting.value);
        } catch (e) {
          console.error('Invalid JSON in TeamNoticeSetting.value:', TeamNoticeSetting.value);
        }

        setNewNotice(parsedValue?.name?.value || '');
        setNewNoticeAr(
          parsedValue?.name?.localizedStrings?.find((item) => item.language === 'ar')?.value || ''
        );
        setSettingsId(TeamNoticeSetting.id);
      }
    }
  }, [settingsList]);

  const handleSaveClick = async () => {
    if (!newNotice.trim()) {
      setError(t('team_notice.errors.empty_notice'));
      return;
    }
    const payload = {
      key: 'teamNotice',
      value: JSON.stringify({
        name: {
          value: newNotice,
          localizedStrings: [
            {
              language: 'ar',
              value: newNoticeAr,
            },
          ],
        },
      }),
    };

    if (settingsId) {
      payload.isActive = true;
    }
    console.log('This is the payload', payload);
    let response;
    if (settingsId) {
      response = await updateSetting(payload);
    } else {
      response = await addSetting(payload);
    }

    try {
      if (response.success) {
        toast.success(
          settingsId ? t('team_notice.toast.update_success') : t('team_notice.toast.add_success')
        );
        await mutate();
        setOpenDialog(false);
        setError('');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add Notice failed:', error);
    }
  };

  const handleCancelClick = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleDeleteNotice = async () => {
    if (settingsId) {
      try {
        const response = await deleteSetting(settingsId);
        if (response.success) {
          confirm.onFalse();
          await mutate();
          setSettingsId('');
          setNewNotice('');
          setNewNoticeAr('');
          setError('');
          toast.success(t('team_notice.toast.delete'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };
  if (settingsListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  return (
    <Box sx={{ m: 2 }}>
      {settingsId && (
        <Box sx={{ mb: 1 }} display="flex" justifyContent="flex-end">
          <Iconify
            icon="solar:pen-bold"
            color="#006A67"
            onClick={handleAddClick}
            sx={{ cursor: 'pointer' }}
          />

          <Iconify
            icon="solar:trash-bin-trash-bold"
            color="error.main"
            onClick={() => {
              confirm.onTrue();
            }}
            sx={{ ml: 1, cursor: 'pointer' }}
          />
        </Box>
      )}

      {settingsId ? (
        <Typography
          sx={{
            flexGrow: 1,
            m: 2,
          }}
        >
          {storedLang === 'ar' ? newNoticeAr || newNotice : newNotice}
        </Typography>
      ) : (
        <>
          {zetaUser?.permissions?.includes('Users.AddNoticeBoard') && (
          <Button variant="contained" sx={{ mt: 1, bgcolor: '#006A67' }} onClick={handleAddClick}>
            {t('team_notice.buttons.add')}
          </Button>
          )}

        </>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCancelClick}
        PaperProps={{
          sx: { width: '500px' },
        }}
      >
        <DialogTitle> {t('team_notice.buttons.add')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('team_notice.labels.notice_en')}
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newNotice}
            onChange={handleNoticeInputChange}
            error={!!error}
            helperText={error}
            sx={{
              mb: 2,
              ...(storedLang === 'ar' && {
                '& .MuiFormLabel-root': {
                  right: 30,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
                '& .MuiInputBase-input': {
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
          />
          <TextField
            autoFocus
            margin="dense"
            label={t('team_notice.labels.notice_ar')}
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newNoticeAr}
            onChange={handleNoticeInputChangeAr}
            sx={{
              mb: 2,
              ...(storedLang === 'ar' && {
                '& .MuiFormLabel-root': {
                  right: 30,
                  left: 'auto',
                  transformOrigin: 'top right',
                },
                '& .MuiInputBase-input': {
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
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelClick}
            variant="contained"
            sx={storedLang === 'ar' ? { ml: 2 } : {}}
          >
            {t('team_notice.buttons.cancel')}
          </Button>
          <Button onClick={handleSaveClick} variant="contained" sx={{ bgcolor: '#006A67' }}>
            {t('team_notice.buttons.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('team_notice.dialog.title2')}
        content={t('team_notice.toast.delete_confirm')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteNotice}
            sx={storedLang === 'ar' ? { mr: 2 } : {}}
          >
            {t('status.buttons.delete')}
          </Button>
        }
      />
    </Box>
  );
}
