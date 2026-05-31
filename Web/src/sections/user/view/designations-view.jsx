'use client';

import { useState } from 'react';
import { toast } from 'src/components/snackbar';
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
import {
  getDesignations,
  deleteDesignation,
  addDesignation,
  updateDesignation,
} from 'src/actions/designation/designationActions';
import { updateLocalizable } from 'src/actions/localizable/localizableActions';
import LinearProgress from '@mui/material/LinearProgress';

export function DesignationsView() {
  const {
    designationsList,
    designationsListLoading,
    designationsListError,
    designationsListValidating,
    designationsListEmpty,
    mutate,
  } = getDesignations();

  const { t, i18n } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');

  const [newDesignation, setNewDesignation] = useState('');
  const [newDesignationAr, setNewDesignationAr] = useState('');
  const [newDesignationId, setNewDesignationId] = useState('');

  const [newDesignationArId, setNewDesignationArId] = useState('');

  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [designationIsActive, setdesignationIsActive] = useState(false);
  const [openDesignationConfirmDialog, setOpenDesignationConfirmDialog] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);

  const handleOpenDesignationDialog = (designation) => {
    setDesignationToDelete(designation);
    setOpenDesignationConfirmDialog(true);
  };

  const handleCloseDesignationDialog = () => {
    setOpenDesignationConfirmDialog(false);
    setDesignationToDelete(null);
  };

  const handleAddDesignation = async () => {
    if (newDesignation.trim()) {
      const payload = {
        name: {
          value: newDesignation,
          localizedStrings: newDesignationAr
            ? [
                {
                  language: 'ar',
                  value: newDesignationAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addDesignation(payload);
        if (response.success) {
          await mutate();
          toast.success(t('designations.toast.add_success'));
        } else {
          toast.error(response.error || t('designations.toast.add_success'));
        }
      } catch (error) {
        console.error('Add designation failed:', error);
        toast.error('An unexpected error occurred');
      }

      setNewDesignation('');
      setNewDesignationAr('');
    }
  };

  const handleRemoveDesignation = async (designationToRemove) => {
    if (designationToRemove?.id) {
      try {
        const response = await deleteDesignation(designationToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t('designations.toast.delete_success'));
        } else {
          toast.error(response.error || 'Failed to delete designation');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };

  const handleEditDesignation = (designation) => {
    setEditingDesignationId(designation.id);
    setNewDesignation(designation.name.value);
    setNewDesignationId(designation.name.id);
    const arabicName =
      designation.name.localizedStrings?.find((ls) => ls.language === 'ar')?.value || '';
    const arabicId =
      designation.name.localizedStrings?.find((ls) => ls.language === 'ar')?.id || '';
    setNewDesignationAr(arabicName);
    setNewDesignationArId(arabicId);

    setdesignationIsActive(designation.isActive);
  };

  const handleUpdateDesignation = async () => {
    if (newDesignation.trim() && editingDesignationId) {
      const payload = {
        id: editingDesignationId,
        name: {
          id: newDesignationId,
          value: newDesignation,
          localizedStrings: newDesignationAr
            ? [
                {
                  ...(newDesignationArId ? { id: newDesignationArId } : {}),
                  language: 'ar',
                  value: newDesignationAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateDesignation(payload);
        if (response.success) {
          await mutate();
          toast.success(t('designations.toast.update_success'));
          setEditingDesignationId(null);
          setNewDesignation('');
          setNewDesignationAr('');
        } else {
          toast.error(response.error || 'Failed to update designation');
        }
      } catch (error) {
        console.error('Update designation failed:', error);
        toast.error('An unexpected error occurred');
      }
    }
  };
  if (designationsListLoading) {
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
  }
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {designationsList?.designations?.map((designation) => (
          <Grid item key={designation.id} xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ py: 1, px: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                {editingDesignationId === designation.id ? (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleUpdateDesignation();
                      }}
                      autoFocus
                    />
                    <TextField
                      fullWidth
                      size="small"
                      value={newDesignationAr}
                      onChange={(e) => setNewDesignationAr(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleUpdateDesignation();
                      }}
                      sx={{ ml: 1 }}
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
                    {designation.name.value}
                    {designation.name.localizedStrings?.find((ls) => ls.language === 'ar')?.value
                      ? ` | ${designation.name.localizedStrings.find((ls) => ls.language === 'ar')?.value}`
                      : ''}
                  </Typography>
                )}

                {editingDesignationId === designation.id ? (
                  <Tooltip title={t('designations.tooltips.save')}>
                    <IconButton onClick={handleUpdateDesignation} size="small" color="primary">
                      <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title={t('designations.tooltips.edit')}>
                    <IconButton onClick={() => handleEditDesignation(designation)} size="small">
                      <Iconify icon="eva:edit-fill" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                )}
                {designation.employeeCount === 0 && (
                  <Tooltip title={t('designations.tooltips.delete')}>
                    <IconButton
                      onClick={() => handleOpenDesignationDialog(designation)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 2 }}
              >
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`${designation.employeeCount || 0} ${designation.employeeCount === 1 ? 'Employee' : 'Employees'}`}
                    size="small"
                    sx={{ bgcolor: '#006A67' }}
                  />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ConfirmDialog
        open={openDesignationConfirmDialog}
        onClose={handleCloseDesignationDialog}
        title={t('designations.dialog.delete_title')}
        content={t('designations.dialog.delete_confirm')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleRemoveDesignation(designationToDelete);
              handleCloseDesignationDialog();
            }}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('designations.buttons.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          size="small"
          value={newDesignation}
          onChange={(e) => setNewDesignation(e.target.value)}
          placeholder={t('designations.labels.new_designation')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              editingDesignationId ? handleUpdateDesignation() : handleAddDesignation();
            }
          }}
        />
        <TextField
          fullWidth
          size="small"
          value={newDesignationAr}
          onChange={(e) => setNewDesignationAr(e.target.value)}
          placeholder={t('designations.labels.arabic_designation')}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              editingDesignationId ? handleUpdateDesignation() : handleAddDesignation();
            }
          }}
        />
        <Button
          startIcon={
            <Iconify
              icon={editingDesignationId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
              sx={{
                ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
              }}
            />
          }
          onClick={editingDesignationId ? handleUpdateDesignation : handleAddDesignation}
          variant="contained"
          sx={{ px: 4, bgcolor: '#006A67' }}
        >
          {editingDesignationId ? t('designations.buttons.update') : t('designations.buttons.add')}
        </Button>
      </Stack>
    </Stack>
  );
}
