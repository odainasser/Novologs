'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
import { MOCK_STATUS, PRESET_COLORS } from 'src/sections/user/user-mock-data';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Tooltip from '@mui/material/Tooltip';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  getWorkStatus,
  addStatus,
  updateStatus,
  deleteStatus,
} from 'src/actions/user-manage/userManageActions';
import LinearProgress from '@mui/material/LinearProgress';

export function UserStatusView() {
  const { workStatusList, workStatusListEmpty, workStatusListLoading, mutate } = getWorkStatus();

  const [employeeStatuses, setEmployeeStatuses] = useState([]);
  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  useEffect(() => {
    const employeeStatus = workStatusList?.workStatuses.map((item) => ({
      id: item.id,
      name: item.name.value,
      nameAr: item.name?.localizedStrings[0]?.value,
      color: item?.color,
    }));
    setEmployeeStatuses(employeeStatus);
  }, []);

  const [newEmployeeStatus, setNewEmployeeStatus] = useState('');
  const [newEmployeeStatusAr, setNewEmployeeStatusAr] = useState('');

  const [newStatusColor, setNewStatusColor] = useState('#00AB55');
  const [editingEmployeeStatusId, setEditingEmployeeStatusId] = useState(null);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const handleAddEmployeeStatus = async () => {
    if (newEmployeeStatus.trim()) {
      const payload = {
        name: {
          value: newEmployeeStatus,
          localizedStrings: newEmployeeStatusAr
            ? [
                {
                  language: 'ar',
                  value: newEmployeeStatusAr,
                },
              ]
            : undefined,
        },
        color: newStatusColor,
      };

      console.log('this is the employee status', payload);
      try {
        const response = await addStatus(payload);
        if (response.success) {
          await mutate();
          toast.success('Employee status added successfully');
          setNewEmployeeStatus('');
          setNewEmployeeStatusAr('');

          setNewStatusColor('#00AB55');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add status failed:', error);
      }
    }
  };

  const handleUpdateEmployeeStatus = async () => {
    if (newEmployeeStatus.trim()) {
      const status = workStatusList?.workStatuses?.find((s) => s.id === editingEmployeeStatusId);

      const payload = {
        id: editingEmployeeStatusId,
        name: {
          id: status.name.id,
          value: newEmployeeStatus,
          localizedStrings: newEmployeeStatusAr
            ? [
                {
                  id: status?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newEmployeeStatusAr,
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
          toast.success('Employee status updated successfully');
          setEditingEmployeeStatusId(null);
          setNewEmployeeStatus('');
          setNewEmployeeStatusAr('');
          setNewStatusColor('#00AB55');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update status failed:', error);
      }
    }
  };

  const handleRemoveEmployeeStatus = async (statusToRemove) => {
    if (statusToRemove?.id) {
      try {
        const response = await deleteStatus(statusToRemove.id);
        if (response.success) {
          await mutate();
          toast.success('Employee status deleted successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
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
    } else {
      setEmployeeStatuses((prevStatuses) =>
        prevStatuses.map((s) => (s.id === activeColorPicker ? { ...s, color: color } : s))
      );
    }
    handleCloseColorPicker();
  };
  const [openEmployeeConfirmDialog, setOpenEmployeeConfirmDialog] = useState(false);

  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const handleOpenEmployeeDialog = (status) => {
    setEmployeeToDelete(status);
    setOpenEmployeeConfirmDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeConfirmDialog(false);
    setEmployeeToDelete(null);
  };

  if (workStatusListLoading)
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
    <Stack spacing={3} sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {workStatusList?.workStatuses?.map((status) => (
          <Grid item key={status.id} xs={12} sm={6} md={3}>
            <Card
              sx={{
                py: 1,
                px: 2,
                boxShadow: (theme) => theme.customShadows.z8,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.customShadows.z24,
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: editingEmployeeStatusId === status.id ? '5em' : '36px',
                      height: 36,
                      borderRadius: '12px',
                      bgcolor: status?.color || 'grey',
                      mr: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: (theme) => alpha(theme.palette.common.white, 0.24),
                    }}
                    onClick={(e) => handleOpenColorPicker(e, status.id)}
                  />
                  {editingEmployeeStatusId === status.id ? (
                    <>
                      <TextField
                        size="small"
                        value={newEmployeeStatus}
                        onChange={(e) => setNewEmployeeStatus(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateEmployeeStatus();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newEmployeeStatusAr}
                        onChange={(e) => setNewEmployeeStatusAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateEmployeeStatus();
                          }
                        }}
                        sx={{ ml: 1 }}
                        autoFocus
                      />
                    </>
                  ) : (
                    // <Typography variant="subtitle1">{status.name}</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        flexGrow: 1,
                        mr: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: { xs: '100%', sm: '4vw', md: '6vw', lg: '10vw' },
                      }}
                    >
                      {status.name.value}{' '}
                      {status?.name?.localizedStrings[0]?.value
                        ? ` | ${status?.name?.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  {editingEmployeeStatusId === status.id ? (
                    <Tooltip title={t('status.tooltips.save')}>
                      <IconButton onClick={handleUpdateEmployeeStatus} size="small" color="primary">
                        <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('status.tooltips.edit')}>
                      <IconButton
                        onClick={() => {
                          setEditingEmployeeStatusId(status.id);
                          setNewEmployeeStatus(status.name.value);
                          setNewEmployeeStatusAr(status.name?.localizedStrings[0]?.value);
                          setNewStatusColor(status?.color);
                        }}
                        size="small"
                      >
                        <Iconify icon="eva:edit-fill" width={20} height={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={t('status.tooltips.delete')}>
                    <IconButton
                      onClick={() => handleOpenEmployeeDialog(status)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ p: 2, boxShadow: (theme) => theme.customShadows.z8 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
            value={newEmployeeStatus}
            onChange={(e) => setNewEmployeeStatus(e.target.value)}
            placeholder={t('status.labels.new_status')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                editingEmployeeStatusId ? handleUpdateEmployeeStatus() : handleAddEmployeeStatus();
              }
            }}
          />
          <TextField
            fullWidth
            size="small"
            value={newEmployeeStatusAr}
            onChange={(e) => setNewEmployeeStatusAr(e.target.value)}
            placeholder={t('status.labels.arabic_status')}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                editingEmployeeStatusId
                  ? handleUpdateEmployeeStatus()
                  : handleUpdateEmployeeStatus();
              }
            }}
          />
          <Button
            startIcon={
              <Iconify
                icon={editingEmployeeStatusId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                }}
              />
            }
            onClick={editingEmployeeStatusId ? handleUpdateEmployeeStatus : handleAddEmployeeStatus}
            variant="contained"
            sx={{ px: '27px', bgcolor: '#006A67' }}
          >
            {editingEmployeeStatusId ? t('status.buttons.update') : t('status.buttons.add')}
          </Button>
        </Stack>
      </Card>
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
            {t('status.labels.choose_color')}
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
        open={openEmployeeConfirmDialog}
        onClose={handleCloseEmployeeDialog}
        title={t('status.dialog.delete_title')}
        content={t('status.dialog.delete_confirm')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleRemoveEmployeeStatus(employeeToDelete);
              handleCloseEmployeeDialog();
            }}
          >
            {t('status.dialog.delete_title')}
          </Button>
        }
      />
    </Stack>
  );
}
