'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import Typography from '@mui/material/Typography';
import { useMockedUser } from 'src/auth/hooks';
import Chip from '@mui/material/Chip';
import { AddGroup } from './add-group';
import { AddAwardAmount } from './add-award-amount';
import { AddRejectReason } from './add-reject-reason';

import { toast } from 'src/components/snackbar';
import { reasonList } from 'src/sections/client/client-mock-data';
import ListItemText from '@mui/material/ListItemText';
import { LeadCreateForm } from './lead-create-form';
import TextField from '@mui/material/TextField';
import { Field } from 'src/components/hook-form';
import { useFormContext } from 'react-hook-form';

import { useTranslation } from 'react-i18next';
import { salesStatus, mock_source, CURRENCIES } from 'src/sections/client/client-mock-data';
import { fDate } from 'src/utils/format-time';
import { updateContract } from 'src/actions/vendor/vendorActions';
import { updateLead, getRejectionReasons } from 'src/actions/client/clientActions';
import { useAuthContext } from 'src/auth/hooks';
import { LeadMember } from './lead-member';
// ----------------------------------------------------------------------

export function LeadTableListRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
  onOpenRow,
  isClient,
  setTableData,
  tableData,
  isClientView,
  mutate,
  clientId,
  sourceList,
  sourceListEmpty,
  salesStatusList,
  statusEmpty,
  currencyList,
  filters,
  isShared,
}) {
  const { t, i18n } = useTranslation('dashboard/client');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const [members, setMembers] = useState(false);

  const [selectedPersons, setSelectedPersons] = useState([]);
  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };
  const handleOpenMembers = () => {
    setMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
      setMode('add');
    }, 100);
  };
  const {
    reasonsList,
    reasonsListLoading,
    reasonsListError,
    reasonsListValidating,
    reasonsListEmpty,
  } = getRejectionReasons();

  const confirm = useBoolean();

  const popover = usePopover();

  const quickEdit = useBoolean();
  const { user } = useMockedUser();
  const rhfMethods = useFormContext();

  const setValue = rhfMethods ? rhfMethods.setValue : null;
  const [selectedReason, setSelectedReason] = useState([]);

  const [awards, setAwards] = useState(false);

  const [reason, setReason] = useState(false);

  const [mode, setMode] = useState('add');

  const [awardAmount, setAwardAmount] = useState('');

  const handleToggleReason = (reason) => {
    setSelectedReason(reason);
  };

  const handleOpenAwardDialog = () => {
    setAwards(true);
  };
  const handleAwardDialogClose = () => {
    setTimeout(() => {
      setAwards(false);
    }, 100);
  };

  const handleOpenReasonDialog = () => {
    setReason(true);
  };

  const handleReasonDialogClose = () => {
    setTimeout(() => {
      setReason(false);
    }, 100);
  };

  const addAwardAmount = (amount) => {
    amount.awardAmount = awardAmount;
    toast.success(t('leadetails.toast.leads_awarded'));
    setAwardAmount('');
  };

  const addReason = (reason) => {
    reason.reason = selectedReason;
    toast.success(t('leadetails.toast.leads_rejected'));
    setSelectedReason([]);
  };
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [newLeadId, setNewLeadId] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newProbability, setNewProbability] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newSource, setNewSource] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');

  const handleEditLead = (lead) => {
    setEditingLeadId(lead.id);
    setNewLeadId(lead.code);
    setNewLeadName(lead.name);
    setNewCurrency(lead.currencyId);
    setNewValue(lead.value);
    setNewProbability(lead.probability);
    setNewStatus(isClientView ? lead?.saleStatus?.id : lead?.vendorContractStatus?.id);
    setNewSource(isClientView ? lead?.leadSource?.id : lead?.vendorContractType?.id);
    const initialDate = lead?.expectedStartDate || '';

    setExpectedStartDate(initialDate);

    if (setValue) {
      setValue('expectedStartDate', initialDate, { shouldValidate: false, shouldDirty: true });
    }
  };
  const clearField = () => {
    setEditingLeadId(null);
    setExpectedStartDate('');
    if (setValue) {
      setValue('expectedStartDate', '', { shouldValidate: false, shouldDirty: false });
    }
  };
  const handleDateChange = (newDate) => {
    setExpectedStartDate(newDate);
  };
  const handleUpdateLead = async () => {
    const payload = {
      id: editingLeadId,
      expectedStartDate: expectedStartDate,
      code: newLeadId,
      name: newLeadName,
      value: newValue,
      probability: parseFloat(newProbability),
      saleStatusId: newStatus,
      leadSourceId: newSource,
    };

    const currencyValue = newCurrency || row?.currencyId;
    if (currencyValue && currencyValue !== '00000000-0000-0000-0000-000000000000') {
      payload.currencyId = currencyValue;
    }

    if (isClientView) {
      payload.clientId = clientId || row?.clientId;
    } else {
      payload.vendorContractStatusId = newStatus;
      payload.vendorContractTypeId = newSource;
      delete payload.saleStatusId;
      delete payload.leadSourceId;
      payload.vendorId = clientId;
    }
    console.log('this is the payload', payload);

    try {
      let response;
      if (isClientView) {
        response = await updateLead(payload);
      } else {
        response = await updateContract(payload);
      }
      if (response.success) {
        toast.success(
          isClientView
            ? t('leaddetails.toast.leadUpdated')
            : t('leaddetails.toast.contract_updated_successfully')
        );

        setTableData(
          tableData.map((lead) =>
            lead.id === editingLeadId
              ? {
                  ...lead,
                  code: newLeadId,
                  name: newLeadName,
                  currencyId: newCurrency,
                  value: newValue,
                  probability: newProbability,
                  saleStatusId: newStatus,
                  leadSourceId: newSource,
                }
              : lead
          )
        );
        setExpectedStartDate('');
        if (setValue) {
          setValue('expectedStartDate', '', { shouldValidate: false, shouldDirty: false });
        }
        setEditingLeadId(null);
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  const creatorName = row?.creator?.fullName || t('clients.labels.no_availble');
  const hasActionAccess = row?.creatorId === zetaUser?.id;

  return (
    <>
      <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align="center"
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          <Box>{index + 1}</Box>
        </TableCell>
        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          <Typography variant="body2" fontWeight="bold">
            {String(row?.serial).padStart(4, '0')}
          </Typography>
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          {editingLeadId === row?.id ? (
            <TextField
              fullWidth
              size="small"
              value={newLeadId}
              onChange={(e) => setNewLeadId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateLead();
                }
              }}
              autoFocus
            />
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Typography
                variant={row?.code ? 'body1' : 'caption'}
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {row?.code || 'Not Available'}
              </Typography>
            </Box>
          )}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Avatar
              alt={row?.creator?.fullName}
              src={row?.creator?.profileImageFileUrl}
              sx={{ width: 30, height: 30 }}
            >
              {!row?.creator?.profileImageFileUrl && row?.creator?.fullName?.charAt(0)}
            </Avatar>

            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <ListItemText
                primary={creatorName}
                secondary={`On: ${fDate(row?.created) || t('clients.labels.no_availble')}`}
                primaryTypographyProps={{
                  typography: 'body1',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
                secondaryTypographyProps={{
                  component: 'span',
                  typography: 'caption',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  },
                }}
              />
            </Box>
          </Box>
        </TableCell>

        <TableCell
          sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          {editingLeadId === row?.id ? (
            <TextField
              fullWidth
              size="small"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateLead();
                }
              }}
              autoFocus
            />
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {row?.name || t('clients.labels.no_availble')}
                </Typography>
              </Box>
            </Box>
          )}
        </TableCell>
        {isClientView && (
          <TableCell
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align="center"
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              onClick={() => {
                setMembers(true);
                setMode('view');
              }}
            >
              {' '}
              <AvatarGroup sx={{ cursor: 'pointer' }}>
                {row?.leadMembers?.slice(0, 1).map((person) => (
                  <Tooltip
                    key={person?.id}
                    title={person?.member?.fullName || 'Not Available'}
                    arrow
                  >
                    <Avatar
                      alt={person?.member?.fullName || 'User'}
                      src={person?.member?.profileImageFileUrl || ''}
                      sx={{ width: 25, height: 25 }}
                    >
                      {!person?.member?.profileImageFileUrl &&
                        person?.member?.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}

                {row?.leadMembers?.length > 1 && (
                  <Avatar sx={{ width: 25, height: 25 }}>+{row.leadMembers.length - 1}</Avatar>
                )}
              </AvatarGroup>
            </Box>
          </TableCell>
        )}
        {!isClientView && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
          >
            {editingLeadId === row?.id ? (
              <Field.DatePicker
                name="expectedStartDate"
                label={t('clients.columns.date')}
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
            ) : (
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {` ${
                    !row?.expectedStartDate || row?.expectedStartDate.startsWith('0001-01-01')
                      ? t('clients.labels.no_availble')
                      : fDate(row?.expectedStartDate)
                  }`}
                </Typography>
              </Box>
            )}
          </TableCell>
        )}
        {!clientId && (
          <TableCell
            sx={{ cursor: 'pointer', borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
            align={storedLang === 'ar' ? 'right' : 'left'}
          >
            <Box display="flex" gap={1} alignItems="center">
              <Box>
                <Avatar
                  alt={isClientView ? row?.client?.name : row?.vendor?.name}
                  src={isClientView ? row?.client?.logoFileUrl : row?.vendor?.logoFileUrl}
                  sx={{ width: 30, height: 30 }}
                >
                  {isClientView ? row?.client?.name?.charAt(0) : row?.vendor?.name?.charAt(0)}
                </Avatar>
              </Box>

              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {isClientView
                      ? row?.client?.name || t('clients.labels.no_availble')
                      : row?.vendor?.name || t('clients.labels.no_availble')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </TableCell>
        )}

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: storedLang === 'ar' ? 'flex-start' : 'flex-end',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {editingLeadId === row?.id ? (
              <>
                <TextField
                  select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateLead();
                    }
                  }}
                  sx={{
                    width: { xs: 80, sm: 90, md: 90, xl: 80 },
                    '& .MuiInputBase-input': {
                      padding: '9px 14px',
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
                <TextField
                  variant="outlined"
                  label="Value"
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateLead();
                    }
                  }}
                  sx={{
                    width: { xs: 120, sm: 140, md: 140, xl: 140 },
                    '& .MuiInputBase-input': {
                      padding: '9px 14px',
                    },
                    '& .MuiInputLabel-root': {
                      top: '-5px',
                      fontSize: '10px',
                    },
                  }}
                />
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body1">
                  {row?.value
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(row?.value)
                    : new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row?.currency?.symbol || 'AED'}
                </Typography>
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
          align={storedLang === 'ar' ? 'right' : 'left'}
          onClick={editingLeadId !== row.id ? onOpenRow : undefined}
        >
          {editingLeadId === row?.id ? (
            <TextField
              select
              fullWidth
              label={
                isClientView ? t('clients.columns.source') : t('clients.columns.contract_type')
              }
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateLead();
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
          ) : (
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {isClientView
                    ? row?.leadSource?.name?.value || t('clients.labels.no_availble')
                    : row?.vendorContractType?.name || t('clients.labels.no_availble')}
                </Typography>
              </Box>
            </Box>
          )}
        </TableCell>
        {row?.leadStatus === 0 && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
          >
            {editingLeadId === row?.id ? (
              <TextField
                fullWidth
                variant="outlined"
                label={t('clients.columns.probability')}
                type="number"
                inputProps={{ step: '0.1', min: 0, max: 100 }}
                value={newProbability}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }

                  if (e.key === 'Enter') {
                    handleUpdateLead();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === '') {
                    setNewProbability('');
                    return;
                  }

                  const num = Number(val);

                  if (!isNaN(num) && num >= 0 && num <= 100) {
                    setNewProbability(val);
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
            ) : (
              <Chip
                label={row?.probability ? `${row?.probability}%` : '0%'}
                color={
                  row?.probability >= 50 ? 'success' : row?.probability <= 25 ? 'error' : 'warning'
                }
                variant="outlined"
                size="small"
                sx={{
                  borderWidth: 1,
                  borderRadius: '16px',
                  color:
                    row?.probability >= 50
                      ? 'success.main'
                      : row?.probability <= 25
                        ? 'error.main'
                        : 'warning.main',
                  borderColor:
                    row?.probability >= 50
                      ? 'success.main'
                      : row?.probability <= 25
                        ? 'error.main'
                        : 'warning.main',
                  bgcolor:
                    row?.probability >= 50
                      ? 'success.lighter'
                      : row?.probability <= 25
                        ? 'error.lighter'
                        : 'warning.lighter',
                }}
              />
            )}
          </TableCell>
        )}
        {(row?.leadStatus === 0 || !isClientView) && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
          >
            {editingLeadId === row?.id ? (
              <TextField
                select
                fullWidth
                label={t('clients.columns.status')}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateLead();
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
            ) : (
              <Box
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {isClientView
                      ? row?.saleStatus?.name?.value || t('clients.labels.no_availble')
                      : row?.vendorContractStatus?.name || t('clients.labels.no_availble')}
                  </Typography>
                </Box>
              </Box>
            )}
          </TableCell>
        )}

        {row?.leadStatus === 1 && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: storedLang === 'ar' ? 'flex-start' : 'flex-end',
              }}
            >
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="body1">
                  {row?.awardedValue
                    ? new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(row?.awardedValue)
                    : new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row?.awardedCurrency?.symbol || 'AED'}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                {fDate(row?.awardedDate)}
              </Typography>
            </Box>
          </TableCell>
        )}

        {row?.leadStatus === 2 && (
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
            align={storedLang === 'ar' ? 'right' : 'left'}
            onClick={editingLeadId !== row.id ? onOpenRow : undefined}
          >
            <Box
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {row?.rejectionReason?.name?.value || t('clients.labels.no_availble')}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {fDate(row?.rejectedDate)}
              </Typography>
            </Box>
          </TableCell>
        )}
        {isClientView && filters.state.type === 0 && (
          <TableCell
            align="center"
            sx={{
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <>
                {hasActionAccess && editingLeadId !== row?.id && (
                  <>
                    {row?.leadStatus === 0 && isClientView && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Button
                          variant="contained"
                          onClick={() => setAwards(true)}
                          size="small"
                          sx={{
                            bgcolor: '#006A67',
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none',
                            padding: '4px 8px',
                            minWidth: 'min-content',
                          }}
                        >
                          {t('clients.columns.award')}
                        </Button>

                        <Button
                          variant="contained"
                          onClick={() => setReason(true)}
                          size="small"
                          sx={{
                            bgcolor: 'error.main',
                            textTransform: 'none',
                            padding: '4px 8px',
                            minWidth: 'min-content',
                          }}
                        >
                          {t('clients.columns.reject')}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </>
            </Box>
          </TableCell>
        )}

        <TableCell
          align="center"
          sx={{
            ...(storedLang === 'ar' && {
              borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            }),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {editingLeadId === row?.id ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateLead}
                  size="small"
                  sx={{
                    bgcolor: '#006A67',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    textTransform: 'none',
                    padding: '4px 10px',
                  }}
                >
                  {t('clients.buttons.update')}
                </Button>
                <Tooltip title={t('clients.buttons.cancel')} arrow>
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
            ) : (
              <>
                {hasActionAccess && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={t('clients.buttons.edit')} arrow>
                        <IconButton
                          onClick={() => {
                            handleEditLead(row);
                          }}
                        >
                          <Iconify icon="solar:pen-bold" color="#006A67" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                      {isClientView && !isShared && (
                        <>
                          <Tooltip title="Share" arrow>
                            <IconButton
                              onClick={() => {
                                setMembers(true);
                                setMode('add');
                              }}
                            >
                              <Iconify icon="mdi:share-variant-outline" width={16} height={16} />
                            </IconButton>
                          </Tooltip>
                          <LeadMember
                            open={members}
                            selectedPersons={selectedPersons}
                            setSelectedPersons={setSelectedPersons}
                            onClick={handleOpenMembers}
                            handleClose={handleMemberDialogClose}
                            onTogglePerson={handleTogglePerson}
                            mode={mode}
                            leadId={row?.id}
                            mutateLead={mutate}
                            leadMembers={row?.leadMembers}
                          />
                        </>
                      )}

                      <Tooltip title={t('clients.buttons.delete')} arrow>
                        <IconButton
                          sx={{ color: 'error.main' }}
                          onClick={() => {
                            confirm.onTrue();
                          }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* <IconButton
                      color={popover.open ? 'inherit' : 'default'}
                      onClick={popover.onOpen}
                      sx={{ p: 0.5 }}
                    >
                      <Iconify icon="eva:more-vertical-fill" width={18} height={18} />
                    </IconButton> */}
                  </>
                )}
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          {((isClientView && zetaUser?.permissions?.includes('Lead.Update')) ||
            (!isClientView && zetaUser?.permissions?.includes('Contract.Update'))) && (
            <MenuItem
              onClick={() => {
                handleEditLead(row);
                popover.onClose();
              }}
            >
              <Iconify icon="solar:pen-bold" color="#006A67" />
              {t('clients.buttons.editButton')}
            </MenuItem>
          )}
          {((isClientView && zetaUser?.permissions?.includes('Lead.Delete')) ||
            (!isClientView && zetaUser?.permissions?.includes('Contract.Delete'))) && (
            <MenuItem
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
              {t('clients.buttons.delete')}
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>
      <AddAwardAmount
        open={awards}
        onClick={handleOpenAwardDialog}
        handleClose={handleAwardDialogClose}
        mode={mode}
        setAwardAmount={setAwardAmount}
        awardAmount={awardAmount}
        addAwardAmount={addAwardAmount}
        currency={row?.currency?.symbol || 'AED'}
        leadId={row?.id}
        mutateLead={mutate}
        currencyList={currencyList}
        filters={filters}
      />
      <AddRejectReason
        open={reason}
        shared={reasonsList?.reasons}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        onClick={handleOpenReasonDialog}
        handleClose={handleReasonDialogClose}
        onToggleReason={handleToggleReason}
        mode={mode}
        setAwardAmount={setAwardAmount}
        awardAmount={awardAmount}
        addReason={addReason}
        leadId={row?.id}
        mutateLead={mutate}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('clients.dialog.delete_title')}
        content={t('clients.dialog.delete_content')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('clients.dialog.delete_title')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
