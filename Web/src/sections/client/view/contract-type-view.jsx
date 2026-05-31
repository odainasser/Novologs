'use client';

import { useState, useEffect } from 'react';
import { toast } from 'src/components/snackbar';
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
import { useTranslation } from 'react-i18next';
import {
  getContractType,
  addContractType,
  updateContractType,
  deleteContractType,
} from 'src/actions/vendor/vendorActions';

export function ContractTypeView() {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');

  const { contractTypeList, contractTypeListEmpty, mutate } = getContractType();

  const [newType, setNewType] = useState('');
  const [newTypeAr, setNewTypeAr] = useState('');
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [openTypeConfirmDialog, setOpenTypeConfirmDialog] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState(null);

  const handleOpenTypeDialog = (type) => {
    setTypeToDelete(type);
    setOpenTypeConfirmDialog(true);
  };

  const handleCloseTypeDialog = () => {
    setOpenTypeConfirmDialog(false);
    setTypeToDelete(null);
  };

  const handleAddType = async () => {
    if (newType.trim()) {
      const payload = {
        name: {
          value: newType,
          localizedStrings: newTypeAr
            ? [
                {
                  language: 'ar',
                  value: newTypeAr,
                },
              ]
            : undefined,
        },
      };

      try {
        const response = await addContractType(payload);
        if (response.success) {
          await mutate();
          toast.success(t("clients.columns.contract_type_added"));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Add type failed:', error);
      }

      setNewType('');
      setNewTypeAr('');
    }
  };

  const handleRemoveType = async (typeToRemove) => {
    if (typeToRemove?.id) {
      try {
        const response = await deleteContractType(typeToRemove.id);
        if (response.success) {
          await mutate();
          toast.success(t("clients.columns.contract_type_deleted"));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditType = (type) => {
    setEditingTypeId(type.id);
    setNewType(type.name?.value);
    setNewTypeAr(type?.name?.localizedStrings[0]?.value);
  };

  const handleUpdateType = async () => {
    if (!editingTypeId) return;
    const type = contractTypeList.contractType.find((s) => s.id === editingTypeId);
    if (!type) return;
    if (newType.trim() && editingTypeId) {
      const payload = {
        id: editingTypeId,
        name: {
          id: type.name.id,
          value: newType,
          localizedStrings: newTypeAr
            ? [
                {
                  id: type?.name?.localizedStrings?.[0]?.id,
                  language: 'ar',
                  value: newTypeAr,
                },
              ]
            : [],
        },
      };

      try {
        const response = await updateContractType(payload);
        if (response.success) {
          await mutate();
          toast.success(t("clients.columns.contract_type_updated"));
          setEditingTypeId(null);
          setNewType('');
          setNewTypeAr('');
        } else {
          toast.error(response.error || '');
        }
      } catch (error) {
        console.error('Update type failed:', error);
      }
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {contractTypeList.contractType.map((type) => (
            <Grid item key={type.id} xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {editingTypeId === type.id ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateType();
                          }
                        }}
                        autoFocus
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={newTypeAr}
                        onChange={(e) => setNewTypeAr(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateType();
                          }
                        }}
                        sx={{ ml: 1 }}
                        autoFocus
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
                      {type.name.value}{' '}
                      {type?.name?.localizedStrings[0]?.value
                        ? ` | ${type?.name?.localizedStrings[0]?.value}`
                        : ''}
                    </Typography>
                  )}
                  <>
                    {editingTypeId === type.id ? (
                      <Tooltip title={t('clients.buttons.save')}>
                        <IconButton onClick={handleUpdateType} size="small" color="primary">
                          <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('clients.buttons.edit')}>
                        <IconButton onClick={() => handleEditType(type)} size="small">
                          <Iconify icon="eva:edit-fill" width={20} height={20} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                  <Tooltip title={t('clients.buttons.delete')}>
                    <IconButton
                      onClick={() => handleOpenTypeDialog(type)}
                      size="small"
                      color="error"
                    >
                      <Iconify icon="eva:trash-2-outline" width={20} height={20} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" spacing={2}>
          <>
            <TextField
              fullWidth
              size="small"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder={t("clients.columns.contract_type")}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingTypeId ? handleUpdateType() : handleAddType();
                }
              }}
            />
            <TextField
              fullWidth
              size="small"
              value={newTypeAr}
              onChange={(e) => setNewTypeAr(e.target.value)}
              placeholder={t("clients.columns.contract_type_arabic")}
      
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editingTypeId ? handleUpdateType() : handleAddType();
                }
              }}
            />
          </>
          <Button
            startIcon={
              <Iconify
                icon={editingTypeId ? 'eva:checkmark-fill' : 'eva:plus-fill'}
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                }}
              />
            }
            onClick={editingTypeId ? handleUpdateType : handleAddType}
            variant="contained"
            sx={{ px: 4 }}
          >
            {editingTypeId ? t('clients.buttons.save') : t('clients.buttons.add')}
          </Button>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={1}>
          <ConfirmDialog
            open={openTypeConfirmDialog}
            onClose={handleCloseTypeDialog}
            title={t('clients.buttons.delete')}
            content={t("clients.columns.are_you_sure_want_contract")}
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleRemoveType(typeToDelete);
                  handleCloseTypeDialog();
                }}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              >
                {t('clients.buttons.delete')}
              </Button>
            }
            sx={{
              direction: storedLang === 'ar' ? 'rtl' : 'ltr',
            }}
          />
        </Stack>
      </Stack>
    </>
  );
}
