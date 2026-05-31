'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';

import { departments } from 'src/sections/project/project-mock-data';
import { TextField, MenuItem } from '@mui/material';
import { Field } from 'src/components/hook-form';
import { useFormContext } from 'react-hook-form';

import Avatar from '@mui/material/Avatar';
import { _members } from 'src/sections/kanban/kanban-mock-data';
import AvatarGroup from '@mui/material/AvatarGroup';

import { fDate } from 'src/utils/format-time';
import { salesStatus, mock_source, CURRENCIES } from 'src/sections/client/client-mock-data';
import { addLead } from 'src/actions/client/clientActions';
import { addContract } from 'src/actions/vendor/vendorActions';

export function LeadCreateForm({
  setTableData,
  clientId,
  mutate,
  isClientView,
  currencyList,
  sourceList,
  sourceListEmpty,
  salesStatusList,
  statusEmpty,
  filters,
}) {
  const { t, i18n } = useTranslation('dashboard/client');

  const [nameError, setNameError] = useState('');
  const storedLang = localStorage.getItem('selectedLang');

  const handleIdChange = (e) => {
    setNewLead({ ...newLead, code: e.target.value });
  };
  const handleNameChange = (e) => {
    setNewLead({ ...newLead, name: e.target.value });
    setNameError('');
  };
  const rhfMethods = useFormContext();

  const setValue = rhfMethods ? rhfMethods.setValue : null;

  const [newLead, setNewLead] = useState({
    code: '',
    name: '',
    value: '',
    percentageOfSuccess: '',
    leadSourceId: '',
    saleStatusId: '',
    currencyId: '',
    type: 'leads',
    expectedStartDate: '',
  });

  const handleDateChange = (newDate) => {
    setNewLead({ ...newLead, expectedStartDate: newDate });
  };
  const addNewLead = async (newLead) => {
    let hasError = false;

    if (!newLead.name || !newLead.name.trim()) {
      setNameError(t('clients.validations.required'));
      hasError = true;
    } else {
      setNameError('');
    }
    if (hasError) return;
    newLead.clientId = clientId;
    newLead.vendorId = clientId;

    console.log('this is new lead', newLead);
    try {
      let response;
      if (isClientView) {
        newLead.probability = parseFloat(newLead.percentageOfSuccess);
        response = await addLead(newLead);
      } else {
        newLead.vendorContractStatusId = newLead.saleStatusId;
        newLead.vendorContractTypeId = newLead.leadSourceId;
        delete newLead.leadSourceId;
        delete newLead.saleStatusId;
        response = await addContract(newLead);
      }
      if (response.success) {
        if (isClientView) {
          toast.success(t('leaddetails.toast.leadAdded'));
        } else {
          toast.success('Contract Added Successfully');
        }
        setNewLead({
          code: '',
          name: '',
          value: '',
          percentageOfSuccess: '',
          leadSourceId: '',
          saleStatusId: '',
          currencyId: '',
          type: 'leads',
          expectedStartDate: '',
        });
        if (setValue) {
          setValue('expectedStartDate', '', { shouldValidate: false, shouldDirty: false });
        }

        setNameError('');

        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add  failed:', error);
    }
  };

  const clearField = () => {
    setNewLead({
      code: '',
      name: '',
      value: '',
      percentageOfSuccess: '',
      leadSourceId: '',
      saleStatusId: '',
      currencyId: '',
      type: 'leads',
      expectedStartDate: '',
    });

    if (setValue) {
      setValue('expectedStartDate', '', { shouldValidate: false, shouldDirty: false });
    }
    setNameError('');
  };

  return (
    <>
      <TableRow>
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        ></TableCell>
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        ></TableCell>

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label={t('leaddetails.form.idLabel')}
            value={newLead.code || ''}
            onChange={handleIdChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          />
        </TableCell>

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        ></TableCell>
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            label={
              <span>
                {isClientView
                  ? t('leaddetails.form.nameLabel')
                  : t('leaddetails.common.contract_name')}{' '}
                <span style={{ color: 'red' }}>*</span>
              </span>
            }
            value={newLead.name || ''}
            onChange={handleNameChange}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
            error={!!nameError}
            helperText={nameError}
          />
        </TableCell>

        {isClientView && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align="center"
          ></TableCell>
        )}
        {!isClientView && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          >
            <Field.DatePicker
              name="expectedStartDate"
              label="Date"
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
              onDateChange={handleDateChange}
            />
          </TableCell>
        )}
        {!clientId && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          ></TableCell>
        )}

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        >
          <Box display="flex" gap={1}>
            <TextField
              select
              label="AED"
              value={newLead.currencyId || ''}
              onChange={(e) => setNewLead({ ...newLead, currencyId: e.target.value })}
              sx={{
                width: { xs: 100, sm: 110, md: 110, xl: 90 },

                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
                '& .MuiSelect-icon': {
                  top: 'calc(50% - 12px)',
                  right: '10px',
                },
              }}
            >
              {currencyList?.currency.map((currency) => (
                <MenuItem key={currency.id} value={currency.id}>
                  {currency.symbol}
                </MenuItem>
              ))}
            </TextField>

            {/* Value input takes up remaining space */}
            <TextField
              fullWidth
              variant="outlined"
              label={t('leaddetails.form.amountLabel')}
              type="number"
              value={newLead.value || ''}
              onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
            />
          </Box>
        </TableCell>

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        >
          {' '}
          <TextField
            select
            fullWidth
            label={
              isClientView
                ? t('leaddetails.form.sourceLabel')
                : t('leaddetails.common.contract_type')
            }
            value={newLead.leadSourceId || ''}
            onChange={(e) => setNewLead({ ...newLead, leadSourceId: e.target.value })}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          >
            {sourceListEmpty ? (
              <MenuItem value="">
                {isClientView
                  ? t('clients.columns.no_source_available')
                  : t('clients.columns.no_contract_type_available')}
              </MenuItem>
            ) : (
              sourceList?.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.name.value}
                </MenuItem>
              ))
            )}
          </TextField>
        </TableCell>

        {isClientView && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align="center"
          >
            <TextField
              fullWidth
              variant="outlined"
              label={t('leaddetails.form.probabilityLabel')}
              type="number"
              inputProps={{ step: '0.1', min: 0, max: 100 }}
              value={newLead.percentageOfSuccess || ''}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;

                if (val === '') {
                  setNewLead({ ...newLead, percentageOfSuccess: '' });
                  return;
                }

                const num = Number(val);

                if (!isNaN(num) && num >= 0 && num <= 100) {
                  setNewLead({ ...newLead, percentageOfSuccess: val });
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '9px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-5px',
                  fontSize: '10px',
                },
              }}
            />
          </TableCell>
        )}

        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align="center"
        >
          {' '}
          <TextField
            select
            fullWidth
            label={t('leaddetails.form.statusLabel')}
            value={newLead.saleStatusId || ''}
            onChange={(e) => setNewLead({ ...newLead, saleStatusId: e.target.value })}
            sx={{
              '& .MuiInputBase-input': {
                padding: '9px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-5px',
                fontSize: '10px',
              },
            }}
          >
            {statusEmpty ? (
              <MenuItem value="">{t('clients.columns.no_status_available')}</MenuItem>
            ) : (
              salesStatusList?.status.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name.value}
                </MenuItem>
              ))
            )}
          </TextField>
        </TableCell>
        {isClientView && filters.state.type === 0 && (
          <TableCell
            align="center"
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          ></TableCell>
        )}

        <TableCell align="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tooltip title={t('leaddetails.buttons.add_lead')} arrow>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addNewLead(newLead);
                  setNewLead({});
                }}
                size="small"
                sx={{
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  textTransform: 'none',
                  padding: '6px 12px',

                  bgcolor: !newLead.name ? 'grey.400' : '#006A67',
                }}
              >
                {t('leaddetails.form.addButton')}
              </Button>
            </Tooltip>

            <Tooltip title={t('leaddetails.common.clear_all')} arrow>
              <Iconify
                icon="mdi:close-circle"
                onClick={() => clearField()}
                sx={{
                  cursor: 'pointer',
                  height: 13,
                  width: 13,
                  color: 'error.main',
                  ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                }}
              />
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}
