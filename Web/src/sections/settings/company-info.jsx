'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'src/components/snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import { set, useForm } from 'react-hook-form';
import { Form, Field } from 'src/components/hook-form';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import { fData } from 'src/utils/format-number';
import { UploadAvatar } from 'src/components/upload';
import { addFile } from 'src/actions/file/fileActions';
import {
  addSetting,
  getSettings,
  deleteSetting,
  updateSetting,
} from 'src/actions/settings/settingActions';
import Avatar from '@mui/material/Avatar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useTranslation } from 'react-i18next';
import { CONFIG } from 'src/config-global';

export function CompanyInfo() {
  const {
    settingsList,
    settingsListLoading,
    settingsListError,
    settingsListValidating,
    settingsListEmpty,
    mutate,
  } = getSettings();
  const confirm = useBoolean();
  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const [openDialog, setOpenDialog] = useState(false);

  const [profileImageFileId, setProfileImageFileId] = useState('');
  const [profileImageFileUrl, setProfileImageFileUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [settingsId, setSettingsId] = useState('');

  useEffect(() => {
    if (settingsList?.settings) {
      const companyLogoSetting = settingsList.settings.find(
        (setting) => setting.key === 'companyLogo'
      );
      console.log('This is the company logo setting', companyLogoSetting);
      if (companyLogoSetting) {
        setProfileImageFileUrl(companyLogoSetting.value);
        setProfileImageFileId(companyLogoSetting.extra);
        setSettingsId(companyLogoSetting.id);

        const url = companyLogoSetting?.value || `${CONFIG.assetsDir}/logo/novo.svg`;
        setAvatarUrl(url);

        if (url && url.toLowerCase().endsWith('.svg')) {
          setAvatarDataUrl(null);

          fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error('SVG fetch failed');
              return res.text();
            })
            .then((svgText) => {
              const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
              setAvatarDataUrl(dataUrl);
            })
            .catch((err) => {
              console.warn('Could not inline SVG, falling back to src URL:', err);
              setAvatarDataUrl(null);
            });
        } else {
          setAvatarDataUrl(null);
        }
      }
    }
  }, [settingsList]);

  const finalSrc = avatarDataUrl || avatarUrl;

  const handleAddClick = () => {
    setOpenDialog(true);
  };

  const handleSaveClick = async () => {
    const payload = {
      key: 'companyLogo',
      value: profileImageFileUrl,
      extra: profileImageFileId,
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
          settingsId ? t('settings.company_logo_updated') : t('settings.company_added_successfully')
        );
        await mutate();
        setOpenDialog(false);
        setProfileImageFileId('');
        setProfileImageFileUrl('');
        // setAvatarUrl(null);
        // setPreview('');

        // setSettingsId('');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add logo failed:', error);
    }
  };

  const handleCancelClick = () => {
    setOpenDialog(false);
    // if (settingsId) {
    //   setPreview(avatarUrl);
    // }
  };

  useEffect(() => {
    if (typeof avatarUrl === 'string') {
      setPreview(avatarUrl);
    } else if (avatarUrl instanceof File) {
      setPreview(URL.createObjectURL(avatarUrl));
    }
  }, [avatarUrl]);
  const handleDropAvatar = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const newFile = acceptedFiles[0];

      // Handle SVG separately
      if (newFile.type === 'image/svg+xml') {
        const reader = new FileReader();

        reader.onload = async () => {
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
              toast.success(t('settings.image_success'));
              const fileId = response.response?.data?.successStatus?.id;
              const fileUrl = response.response?.data?.successStatus?.url;

              if (fileId) {
                setProfileImageFileId(fileId);
                setProfileImageFileUrl(fileUrl);
                setAvatarUrl(newFile);
              }
            } else {
              toast.error(response.error);
              console.error('Upload error:', response.error);
            }
          } catch (error) {
            console.error('Add file failed:', error);
            toast.error(t('settings.unexpected_error'));
          }
        };

        reader.onerror = () => {
          toast.error('Invalid SVG image.');
        };

        reader.readAsDataURL(newFile);
        return;
      }

      // For non-SVG: Check image dimensions
      const image = new Image();
      image.src = URL.createObjectURL(newFile);

      image.onload = async () => {
        const { width, height } = image;

        if (width < 555 || height < 185) {
          toast.error('Image must be at least 555 x 185 pixels');
          return;
        }

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
            toast.success(t('settings.image_success'));
            const fileId = response.response?.data?.successStatus?.id;
            const fileUrl = response.response?.data?.successStatus?.url;

            if (fileId) {
              setProfileImageFileId(fileId);
              setProfileImageFileUrl(fileUrl);
              setAvatarUrl(newFile);
            }
          } else {
            toast.error(response.error);
            console.error('Upload error:', response.error);
          }
        } catch (error) {
          console.error('Add file failed:', error);
          toast.error(t('settings.unexpected_error'));
        }
      };

      image.onerror = () => {
        toast.error('Invalid image file.');
      };
    },
    [setAvatarUrl, setProfileImageFileId, setProfileImageFileUrl]
  );

  const handleDeleteLogo = async () => {
    if (settingsId) {
      try {
        const response = await deleteSetting(settingsId);
        if (response.success) {
          confirm.onFalse();

          await mutate();
          setProfileImageFileUrl('');
          setAvatarUrl(null);
          setSettingsId('');
          setPreview('');
          setProfileImageFileId('');
          toast.success(t('settings.company_logo_deleted'));
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
  if (settingsListError) {
    return <ErrorView errorCode={settingsListError} />;
  }

  return (
    <Box sx={{ m: 2 }}>
      {settingsId && (
        <Box sx={{ mb: 1 }} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            sx={{ bgcolor: '#006A67', ...(storedLang === 'ar' && { ml: 1 }) }}
            onClick={handleAddClick}
            size="small"
          >
            {t('settings.edit_company_logo')}
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ ml: 1 }}
            size="small"
            onClick={() => {
              confirm.onTrue();
            }}
          >
            {t('settings.delete')}
          </Button>
        </Box>
      )}

      {settingsId ? (
        <Avatar
          src={finalSrc}
          variant="square"
          sx={{ width: '100%', height: '100vh', cursor: 'pointer', bgcolor: 'background.neutral' }}
          imgProps={{
            style: {
              objectFit: 'none',
            },
          }}
        />
      ) : (
        <Button
          variant="contained"
          sx={{ mt: 1, bgcolor: '#006A67' }}
          onClick={handleAddClick}
          size="small"
        >
          {t('settings.add_company_logo')}
        </Button>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCancelClick}
        PaperProps={{
          sx: { width: '500px' },
        }}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
      >
        <DialogTitle>{t('settings.add_company_logo')}</DialogTitle>

        <DialogContent>
          <Grid xs={12} sx={{ py: 1 }}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ mb: 5 }}>
                <UploadAvatar
                  value={avatarUrl}
                  onDrop={handleDropAvatar}
                  validator={(fileData) => {
                    if (fileData.size > 3000000) {
                      return {
                        code: 'file-too-large',
                        message: `${t('settings.file_large')} ${fData(3000000)}`,
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
                      {t('settings.allowed_types')}
                      <br />
                      {t('settings.max')} {fData(3145728)}
                      <br />
                      Required dimensions: <strong>At least 555 × 185 px</strong>
                      <br />
                      Image must have a white background
                    </Typography>
                  }
                  customWidth="100%"
                  customHeight={220}
                  customBorderRadius="8px"
                  hideBorder
                  sx={{
                    m: 0,
                    p: 0,
                  }}
                />
              </Box>
            </Card>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelClick}
            variant="contained"
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('settings.cancel')}
          </Button>
          <Button
            onClick={handleSaveClick}
            variant="contained"
            sx={{ bgcolor: '#006A67' }}
            disabled={!preview}
          >
            {settingsId ? t('settings.save') : t('settings.add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('settings.confirm_delete_logo')}
        content={t('settings.confirm_content')}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteLogo}>
            {t('settings.delete')}
          </Button>
        }
      />
    </Box>
  );
}
