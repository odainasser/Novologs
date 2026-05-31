'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { PRESET_COLORS } from 'src/sections/user/user-mock-data';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { getStatus, addStatus, updateStatus, deleteStatus } from 'src/actions/task/taskActions';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import LinearProgress from '@mui/material/LinearProgress';

export function KanbanStatusView() {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const { statusList, statusListEmpty, statusListLoading, mutate } = getStatus();

  const [newStatus, setNewStatus] = useState('');
  const [newStatusAr, setNewStatusAr] = useState('');
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [newStatusColor, setNewStatusColor] = useState('#00AB55');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [isEditingColorOnly, setIsEditingColorOnly] = useState(false);

  const handleOpenStatusDialog = (status) => {
    setStatusToDelete(status);
    setOpenStatusConfirmDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusConfirmDialog(false);
    setStatusToDelete(null);
  };

  const handleAddStatus = async () => {
    if (newStatus.trim()) {
      const payload = {
        name: {
          value: newStatus,
          localizedStrings: newStatusAr
            ? [
                {
                  language: 'ar',
                  value: newStatusAr,
                },
              ]
            : undefined,
        },
        color: newStatusColor,
      };

      try {
        const response = await addStatus(payload);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_status_added'));

          setNewStatus('');
          setNewStatusAr('');
          setNewStatusColor('#00AB55');
          setIsEditingColorOnly(false);
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add status failed:', error);
        toast.error(t('tasks.toast.unexpected_error'));
      }
    }
  };

  const handleRemoveStatus = async (statusToRemove) => {
    if (statusToRemove?.id) {
      try {
        const response = await deleteStatus(statusToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_status_deleted'));
        } else {
          toast.error(response.error || t('tasks.toast.failed_delete'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('toast.unexpected_error'));
      }
    }
  };

  const handleEditStatus = (status) => {
    setEditingStatusId(status.id);
    setNewStatus(status.name.value);
    setNewStatusAr(status?.name.localizedStrings[0]?.value || '');
    setNewStatusColor(status.color || '#00AB55');
    if (status.status === 1 || status.status === 4) {
      setIsEditingColorOnly(true);
    } else {
      setIsEditingColorOnly(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingStatusId) return;
    const status = statusList.status.find((s) => s.id === editingStatusId);
    if (!status) return;
    if (newStatus.trim() && editingStatusId) {
      const nameValue = isEditingColorOnly ? status.name.value : newStatus;
      const nameArValue = isEditingColorOnly
        ? status.name.localizedStrings?.[0]?.value
        : newStatusAr;

      const payload = {
        id: editingStatusId,
        name: {
          id: status.name.id,
          value: nameValue,
          localizedStrings: nameArValue
            ? [
                {
                  id: status?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: nameArValue,
                },
              ]
            : [],
        },
        color: newStatusColor,
      };
      try {
        const response = await updateStatus(payload);
        if (response.success) {
          await mutate();
          toast.success(t('tasks.toast.task_status_updated'));
          setEditingStatusId(null);
          setNewStatus('');
          setNewStatusAr('');
          setNewStatusColor('#00AB55');
          setIsEditingColorOnly(false);
        } else {
          toast.error(
            response.error || t('tasks.toast.failed_update_status', 'Failed to update status.')
          );
        }
      } catch (error) {
        console.error('Update status failed:', error);
        toast.error(t('tasks.toast.unexpected_error'));
      }
    } else if (!newStatus.trim()) {
      toast.error('Status name is required.');
    }
  };
  const handleOpenColorPicker = (event, statusId) => {
    setColorPickerAnchorEl(event.currentTarget);
    setActiveColorPicker(statusId);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
    setActiveColorPicker(null);
  };

  const handleColorChange = (color) => {
    if (activeColorPicker === 'new') {
      setNewStatusColor(color);
    } else if (activeColorPicker && statusList?.status) {
      if (editingStatusId === activeColorPicker) {
        setNewStatusColor(color);
      }
    }
    handleCloseColorPicker();
  };
  if (statusListLoading)
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
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {statusList.status
            .filter((status) => status.status === 5)
            .map((status) => (
              <Grid item key={status.id} xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <>
                      <Box
                        sx={{
                          width: editingStatusId === status.id ? '5em' : '36px',
                          height: 36,
                          borderRadius: '12px',
                          bgcolor:
                            editingStatusId === status.id
                              ? newStatusColor
                              : status?.color || 'grey',
                          mr: 2,
                          cursor: editingStatusId === status.id ? 'pointer' : 'default',
                          border: '2px solid',
                          borderColor: (theme) => alpha(theme.palette.common.white, 0.24),
                        }}
                        onClick={
                          editingStatusId === status.id
                            ? (e) => handleOpenColorPicker(e, status.id)
                            : undefined
                        }
                      />
                      {editingStatusId === status.id ? (
                        <>
                          <TextField
                            fullWidth
                            size="small"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateStatus();
                              }
                            }}
                            disabled={isEditingColorOnly}
                            autoFocus
                          />
                          <TextField
                            fullWidth
                            size="small"
                            value={newStatusAr}
                            onChange={(e) => setNewStatusAr(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateStatus();
                              }
                            }}
                            sx={{ ml: 1 }}
                            disabled={isEditingColorOnly}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            flexGrow: 1,
                            mr: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {status.name.value}{' '}
                          {status?.name.localizedStrings[0]?.value
                            ? ` | ${status?.name.localizedStrings[0]?.value}`
                            : ''}
                        </Typography>
                      )}
                    </>
                    <>
                      {editingStatusId === status.id ? (
                        <Tooltip title={t('tasks.save')}>
                          <IconButton onClick={handleUpdateStatus} size="small" color="primary">
                            <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('tasks.edit_label')}>
                          <IconButton onClick={() => handleEditStatus(status)} size="small">
                            <Iconify icon="eva:edit-fill" width={20} height={20} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title={t('tasks.delete_label')}>
                        <IconButton
                          onClick={() => handleOpenStatusDialog(status)}
                          size="small"
                          color="error"
                        >
                          <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    </>
                  </Stack>
                </Card>
              </Grid>
            ))}
        </Grid>
        <Typography variant="subtitle1" sx={{ ml: 1 }}>
          {t('tasks.default_statuses')}
        </Typography>
        <Grid container spacing={2}>
          {statusList.status
            .filter((status) => status.status !== 5)
            .map((status) => (
              <Grid item key={status.id} xs={12} sm={6} md={3}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <>
                      <Box
                        sx={{
                          width: editingStatusId === status.id ? '5em' : '36px',
                          height: 36,
                          borderRadius: '12px',
                          bgcolor:
                            editingStatusId === status.id
                              ? newStatusColor
                              : status?.color || 'grey',
                          mr: 2,
                          cursor: editingStatusId === status.id ? 'pointer' : 'default',
                          border: '2px solid',
                          borderColor: (theme) => alpha(theme.palette.common.white, 0.24),
                        }}
                        onClick={
                          editingStatusId === status.id
                            ? (e) => handleOpenColorPicker(e, status.id)
                            : undefined
                        }
                      />
                      {editingStatusId === status.id ? (
                        <>
                          <TextField
                            fullWidth
                            size="small"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateStatus();
                              }
                            }}
                            disabled={isEditingColorOnly}
                            autoFocus
                          />
                          <TextField
                            fullWidth
                            size="small"
                            value={newStatusAr}
                            onChange={(e) => setNewStatusAr(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateStatus();
                              }
                            }}
                            sx={{ ml: 1 }}
                            disabled={isEditingColorOnly}
                          />
                        </>
                      ) : (
                        <Typography
                          variant="subtitle1"
                          sx={{
                            flexGrow: 1,
                            mr: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {status.name.value}{' '}
                          {status?.name.localizedStrings[0]?.value
                            ? ` | ${status?.name.localizedStrings[0]?.value}`
                            : ''}
                        </Typography>
                      )}
                    </>

                    <>
                      {editingStatusId === status.id ? (
                        <Tooltip title={t('tasks.save')}>
                          <IconButton onClick={handleUpdateStatus} size="small" color="primary">
                            <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title={t('tasks.edit_label')}>
                            <IconButton onClick={() => handleEditStatus(status)} size="small">
                              <Iconify icon="eva:edit-fill" width={20} height={20} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </>
                  </Stack>
                </Card>
              </Grid>
            ))}
        </Grid>
        <Stack direction="row" spacing={2}>
          <>
            <Box
              sx={{
                width: '5em',
                height: 36,
                borderRadius: '12px',
                bgcolor: newStatusColor,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: (theme) => alpha(theme.palette.common.white, 0.24),
              }}
              onClick={(e) => handleOpenColorPicker(e, 'new')}
            />
            <TextField
              fullWidth
              size="small"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder={t('tasks.new_status')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingStatusId ? handleUpdateStatus() : handleAddStatus();
                }
              }}
              disabled={isEditingColorOnly}
            />
            <TextField
              fullWidth
              size="small"
              value={newStatusAr}
              onChange={(e) => setNewStatusAr(e.target.value)}
              placeholder={t('tasks.arabic_status')}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingStatusId ? handleUpdateStatus() : handleAddStatus();
                }
              }}
              disabled={isEditingColorOnly}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingStatusId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            }
            onClick={editingStatusId ? handleUpdateStatus : handleAddStatus}
            variant="contained"
            sx={{ px: 4, bgcolor: '#006A67' }}
          >
            {editingStatusId ? t('tasks.todo.update') : t('tasks.todo.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <Popover
            open={Boolean(colorPickerAnchorEl)}
            anchorEl={colorPickerAnchorEl}
            onClose={handleCloseColorPicker}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Box sx={{ p: 2, maxWidth: 424 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Choose color
              </Typography>
              <Grid container spacing={1}>
                {PRESET_COLORS.map((color) => (
                  <Grid item key={color}>
                    <Tooltip title={color}>
                      <Box
                        sx={{
                          width: 25,
                          height: 25,
                          borderRadius: '8px',
                          bgcolor: color,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: (theme) =>
                            color === '#FFFFFF' ? theme.palette.grey[300] : 'transparent',
                        }}
                        onClick={() => handleColorChange(color)}
                      />
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Popover>
          <ConfirmDialog
            open={openStatusConfirmDialog}
            onClose={handleCloseStatusDialog}
            title={t('tasks.delete')}
            content={t('tasks.are_you_sure_want_to_delete')}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveStatus(statusToDelete);
                  handleCloseStatusDialog();
                }}
              >
                {t('tasks.delete')}
              </Button>
            }
          />
        </Stack>
      </Stack>
    </>
  );
}
