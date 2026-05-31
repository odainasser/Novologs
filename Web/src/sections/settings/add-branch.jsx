import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { EmptyContent } from 'src/components/empty-content';
import { toast } from 'src/components/snackbar';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableSelectedAction,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

import {
  getCompanyBranches,
  addCompanyBranch,
  updateCompanyBranch,
  deleteCompanyBranch,
} from 'src/actions/user-manage/userManageActions';
import { CountrySelect } from 'src/components/country-select/country-select';
import { PhoneInput } from 'src/components/phone-input/phone-input';
import { useTranslation } from 'react-i18next';

export function AddBranch() {
  const storedLang = localStorage.getItem('selectedLang');
  const { t, i18n } = useTranslation('dashboard/projects');
  const [tableData, setTableData] = useState([]);

  const TABLE_HEAD = [
    { id: 'serialNo', label: t('projects.table.serial_no'), width: '4%', align: 'center' },
    {
      id: 'name',
      label: t('projects.table.name'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'code',
      label: t('projects.table.code'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'email',
      label: t('projects.table.email'),
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'phoneNumber',
      label: t('projects.table.phone_number'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'country',
      label: t('projects.table.country'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'city',
      label: t('projects.table.city'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'address',
      label: t('projects.table.address'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    { id: '', label: t('projects.table.actions'), width: '11%', align: 'center' },
  ];
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });

  const getBranchParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };

  const {
    branchList,
    branchListLoading,
    branchListError,
    branchListValidating,
    branchListEmpty,
    mutate,
  } = getCompanyBranches(getBranchParams);

  useEffect(() => {
    if (branchList?.branches.length) {
      setTableData([...branchList?.branches]);
    } else {
      setTableData([]);
    }
  }, [branchList]);
  const confirm = useBoolean();
  const [editingBranchId, setEditingBranchId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const [code, setCode] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [branchId, setBranchId] = useState('');

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCode('');
    setShowError(false);
    setCountry('');
    setCity('');
    setAddress('');
  };

  const clearBranch = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCode('');
    setShowError(false);
    setCountry('');
    setCity('');
    setAddress('');
  };

  const handleEditBranch = (branch) => {
    setEditingBranchId(branch.id);
    setName(branch.name);
    setEmail(branch.email);
    setPhone(branch.phone);
    setCode(branch.code);

    setCountry(branch.country);
    setCity(branch.city);
    setAddress(branch.address);
  };
  const clearField = () => {
    setEditingBranchId(null);
    setName('');
    setEmail('');
    setPhone('');
    setCode('');
    setShowError(false);

    setCountry('');
    setCity('');
    setAddress('');
  };

  const handleSubmit = async () => {
    console.log({
      name,
      email,
      phone,
      code,
    });

    if (!name || !email) {
      setShowError(true);
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email,
      phone,
      code,
      country,
      city,
      address,
    };
    if (editingBranchId) {
      payload.id = editingBranchId;
    }
    console.log('this is the payload', payload);

    try {
      let response;
      if (editingBranchId) {
        response = await updateCompanyBranch(payload);
      } else {
        response = await addCompanyBranch(payload);
      }
      if (response.success) {
        toast.success(
          editingBranchId ? t('projects.table.branchupdated') : t('projects.table.branchcreated')
        );
        setEditingBranchId(null);

        handleDialogClose();
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add branch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        let response;
        response = await deleteCompanyBranch(id);

        if (response.success) {
          confirm.onFalse();
          await mutate();
          toast.success(t('projects.table.branchdeleted'));
        } else {
          toast.error(response.error || t('projects.table.failed_to_update'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handlePhoneNumberChange = useCallback(
    (val) => {
      setPhone(val ?? '');
    },
    [setPhone]
  );
  const handleCountryChange = (event, value) => {
    console.log('this is the value', value);
    setCountry(value);
  };
  const handleCityChange = (event) => {
    setCity(event.target.value);
  };
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
      ></Box>
      <Card>
        <TableContainer
          component={Paper}
          sx={{
            width: '100%',
            overflowX: 'auto',
          }}
        >
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{
              width: '100%',
              tableLayout: 'fixed',
              '& td, & th': {
                padding: table.dense ? '4px' : '8px',
              },
            }}
          >
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={tableData.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
            />

            <TableBody>
              {!editingBranchId && (
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
                  >
                    <TextField
                      label={t('projects.table.name')}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setShowError(false);
                      }}
                      fullWidth
                      margin="dense"
                      required
                      error={showError && !name}
                      helperText={showError && !name ? `Name is required` : ''}
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
                  >
                    {' '}
                    <TextField
                      label={t('projects.table.code')}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      fullWidth
                      margin="dense"
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
                  >
                    {' '}
                    <TextField
                      label={t('projects.table.email')}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setShowError(false);
                      }}
                      required
                      error={showError && !email}
                      helperText={showError && !email ? `Email is required` : ''}
                      fullWidth
                      margin="dense"
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
                  >
                    <Box
                      sx={{
                        ...(storedLang === 'ar' && {
                          '& .MuiFormLabel-root': {
                            right: 30,
                            left: 'auto',
                            transformOrigin: 'top right',
                          },
                          '& .MuiInputBase-input': {
                            paddingRight: '50px',
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
                    >
                      <PhoneInput
                        label={t('projects.table.phone_number')}
                        fullWidth
                        onChange={handlePhoneNumberChange}
                        value={phone}
                      />
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    }}
                  >
                    <Box
                      sx={{
                        ...(storedLang === 'ar' && {
                          '& .MuiOutlinedInput-root': {
                            '&&': {
                              paddingRight: '8px',
                              direction: 'rtl',
                            },
                          },
                          '& .MuiFormLabel-root': {
                            right: 30,
                            left: 'auto',
                            transformOrigin: 'top right',
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            textAlign: 'right',
                          },
                          '& .MuiAutocomplete-endAdornment': {
                            left: 0,
                            right: 'auto',
                          },
                        }),
                        '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                          padding: '2px 4px 2px 5px',
                        },
                      }}
                    >
                      <CountrySelect
                        label={t('projects.table.country')}
                        fullWidth
                        value={country}
                        onChange={handleCountryChange}
                        sx={{
                          '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
                            padding: '2px 4px 2px 5px',
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    }}
                  >
                    <Box display="flex" gap={2}>
                      <TextField
                        placeholder={t('projects.table.city')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={city || ''}
                        onChange={handleCityChange}
                      />
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    }}
                  >
                    <Box display="flex" gap={2}>
                      <TextField
                        placeholder={t('projects.table.address')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        // multiline
                        // rows={2}
                        value={address || ''}
                        onChange={handleAddressChange}
                      />
                    </Box>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      ...(storedLang === 'ar' && {
                        borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                      }),
                    }}
                  >
                    {' '}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tooltip title={t('projects.table.AddBranch')}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            if (!loading) {
                              handleSubmit();
                            }
                          }}
                          size="small"
                          disabled={loading}
                          sx={{
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none',
                            padding: '6px 12px',
                            bgcolor: loading
                              ? 'grey.500'
                              : !name || !email
                                ? 'grey.400'
                                : loading
                                  ? 'grey.500'
                                  : '#006A67',
                          }}
                        >
                          {loading ? (
                            <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                          ) : (
                            t('projects.table.save')
                          )}
                        </Button>
                      </Tooltip>
                      <Tooltip title={t('projects.table.clear_all')} arrow>
                        <Iconify
                          icon="solar:trash-bin-trash-bold"
                          onClick={() => clearBranch()}
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
              )}

              {branchList?.branches?.length > 0 ? (
                tableData
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((branch, index) => (
                    <TableRow
                      key={branch.id}
                      sx={{
                        '& .MuiTableCell-root': {
                          borderColor: 'rgba(200, 200, 200, 0.6) !important',
                        },
                      }}
                    >
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setShowError(false);
                            }}
                            autoFocus
                            error={showError && !name}
                            helperText={showError && !name ? `Name is required` : ''}
                          />
                        ) : (
                          branch?.name
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {' '}
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          branch?.code || t('projects.not_available')
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setShowError(false);
                            }}
                            error={showError && !email}
                            helperText={
                              showError && !email ? `${t('projects.table.email_required')}` : ''
                            }
                            autoFocus
                          />
                        ) : (
                          branch?.email
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {' '}
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          branch?.phone || t('projects.not_available')
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {' '}
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          branch?.country || t('projects.not_available')
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {' '}
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          branch?.city || t('projects.not_available')
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {' '}
                        {editingBranchId === branch.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          branch?.address || t('projects.not_available')
                        )}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          ...(storedLang === 'ar' && {
                            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                          }),
                        }}
                      >
                        {editingBranchId === branch.id ? (
                          <>
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
                                onClick={() => {
                                  if (!loading) {
                                    handleSubmit();
                                  }
                                }}
                                size="small"
                                disabled={loading}
                                sx={{
                                  color: 'primary.contrastText',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                  textTransform: 'none',
                                  padding: '6px 12px',
                                  bgcolor: loading
                                    ? 'grey.500'
                                    : !name || !email
                                      ? 'grey.400'
                                      : loading
                                        ? 'grey.500'
                                        : '#006A67',
                                }}
                              >
                                {loading ? (
                                  <CircularProgress
                                    size={24}
                                    sx={{ color: 'primary.contrastText' }}
                                  />
                                ) : (
                                  t('projects.table.update')
                                )}
                              </Button>
                              <Tooltip title={t('projects.table.cancel')} arrow>
                                <Iconify
                                  icon="solar:trash-bin-trash-bold"
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
                          </>
                        ) : (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                handleEditBranch(branch);
                              }}
                            >
                              <Iconify icon="eva:edit-fill" />
                            </IconButton>
                            {/* <IconButton
                              color="error"
                              onClick={() => {
                                confirm.onTrue();
                                setBranchId(branch.id);
                              }}
                            >
                              <Iconify icon="eva:trash-2-outline" />
                            </IconButton> */}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {/* <Typography variant="body2" color="textSecondary">
                      No branchs found
                    </Typography> */}
                    <EmptyContent
                      filled
                      sx={{ py: 10 }}
                      title={t('projects.table.no_branches_found')}
                      description={t('projects.table.no_branches_available_for')}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationCustom
          page={table.page}
          rowsPerPageOptions={[100, 150, 250]}
          dense={table.dense}
          count={tableData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          sx={{
            borderTopColor: 'transparent',
            '& .MuiTablePagination-actions > button svg': {
              transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
            },
          }}
        />
      </Card>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('projects.table.actions_delete')}
        content={t('projects.table.are_you_sure_want_delete')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(branchId);
            }}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('projects.table.actions_delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </Box>
  );
}
