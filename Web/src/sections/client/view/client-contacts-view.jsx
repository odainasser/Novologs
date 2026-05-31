import React, { useState, useEffect } from 'react';
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
import { PhoneInput } from 'src/components/phone-input/phone-input';

import {
  getClientContacts,
  addClientContacts,
  updateClientContact,
  deleteClientContact,
} from 'src/actions/client/clientActions';

import {
  getVendorContacts,
  addVendorContacts,
  updateVendorContact,
  deleteVendorContact,
} from 'src/actions/vendor/vendorActions';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';



export function ClientContactsView({ clientId, isClientView }) {
  const { t } = useTranslation('dashboard/client');
  
  const storedLang = localStorage.getItem('selectedLang');
  const [tableData, setTableData] = useState([]);
  const { zetaUser } = useAuthContext();

  const TABLE_HEAD = [
    { id: 'serialNo', label:t('clients.columns.serial_no'), width: '4%', align: 'center' },
    {
      id: 'name',
      label: t('clients.columns.name'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'designation',
      label: t('clients.columns.role'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'email',
      label: t('clients.columns.email'),
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'mobileNumber',
      label: t('clients.columns.phone_no'),
      
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    { id: '', label: t('clients.columns.actions'), width: '11%', align: 'center' },
  ];
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });

  function useClientOrVendorContact(isClientView) {
    const payload = {
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
    };

    if (isClientView) {
      payload.search = {
        fieldName: 'ClientId',
        fieldValue: clientId,
        operator: 0,
        logicOperator: 0,
      };
    }

    if (!isClientView) {
      payload.search = {
        fieldName: 'VendorId',
        fieldValue: clientId,
        operator: 0,
        logicOperator: 0,
      };
    }

    const result = isClientView ? getClientContacts(payload) : getVendorContacts(payload);

    return {
      list: isClientView
        ? result.clientContactList.clientContacts
        : result.vendorContactList.vendorContacts,
      listLoading: isClientView ? result.clientContactListLoading : result.vendorContactListLoading,
      listError: isClientView ? result.clientContactListError : result.vendorContactListError,
      listValidating: isClientView
        ? result.clientContactListValidating
        : result.vendorContactListValidating,
      listEmpty: isClientView ? result.clientContactListEmpty : result.vendorContactListEmpty,
      mutate: result.mutate,
    };
  }

  const { list, listLoading, listError, listValidating, listEmpty, mutate } =
    useClientOrVendorContact(isClientView);

  useEffect(() => {
    if (list.length) {
      setTableData([...list]);
    } else {
      setTableData([]);
    }
  }, [list]);
  const confirm = useBoolean();
  const [editingContactId, setEditingContactId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [designation, setDesignation] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [contactId, setContactId] = useState('');
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => {
    setName('');
    setEmail('');
    setMobileNumber('');
    setDesignation('');
    setShowError(false);
  };

  const clearContact = () => {
    setName('');
    setEmail('');
    setMobileNumber('');
    setDesignation('');
    setShowError(false);
  };

  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setEmail(contact.email);
    setMobileNumber(contact.mobileNumber);
    setDesignation(contact.designation);
  };
  const clearField = () => {
    setEditingContactId(null);
    setName('');
    setEmail('');
    setMobileNumber('');
    setDesignation('');
    setShowError(false);
  };

  const handleSubmit = async () => {
    console.log({
      clientId,
      name,
      email,
      mobileNumber,
      designation,
    });

    if (!name || !email) {
      setShowError(true);
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email,
      mobileNumber,
      designation,
    };
    if (editingContactId) {
      payload.id = editingContactId;
    }
    if (isClientView) {
      payload.clientId = clientId;
    } else {
      payload.vendorId = clientId;
    }
    try {
      let response;
      if (editingContactId) {
        if (isClientView) {
          response = await updateClientContact(payload);
        } else {
          response = await updateVendorContact(payload);
        }
      } else {
        if (isClientView) {
          response = await addClientContacts(payload);
        } else {
          response = await addVendorContacts(payload);
        }
      }
      if (response.success) {
        toast.success(
          editingContactId ? t('leaddetails.toast.contact_updated') : t('leaddetails.toast.contact_created_successfully')
        );
        setEditingContactId(null);

        handleDialogClose();
        await mutate();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add contact failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        let response;
        if (isClientView) {
          response = await deleteClientContact(id);
        } else {
          response = await deleteVendorContact(id);
        }
        if (response.success) {
          confirm.onFalse();
          await mutate();
          toast.success(t('leaddetails.toast.contact_deleted'));
        } else {
          toast.error(response.error || t('leaddetails.toast.failed_delete_contact'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
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
              {!editingContactId &&
                ((isClientView && zetaUser?.permissions?.includes('Client.AddContact')) ||
                  (!isClientView &&
                    zetaUser?.permissions?.includes('Vendor.AddVendorContact'))) && (
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
                        label={t('clients.columns.name')}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setShowError(false);
                        }}
                        fullWidth
                        margin="dense"
                        required
                        error={showError && !name}
                         helperText={showError && !name ? `${t('clients.validations.name_required')}` : ''}
                       
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
                        label={t('clients.columns.role')}
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
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
                      label={t('clients.columns.email')}
                       
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setShowError(false);
                        }}
                        required
                        error={showError && (!email || !isValidEmail(email))}
                        helperText={
                          showError && !email
                            ? `${t('clients.columns.email_required')}`
                            : showError && !isValidEmail(email)
                              ? t('clients.columns.enter_valid_emailaddress')
                              : ''
                        }
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
                          label={t("clients.columns.phonenumber")}
                          fullWidth
                          onChange={(e) => {
                            setMobileNumber(e);
                          }}
                          value={mobileNumber}
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
                      <Tooltip title={t('clients.columns.add_contact')}>
                      
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
                            t('clients.buttons.save')
                           
                            )}
                          </Button>
                        </Tooltip>
                      <Tooltip title={t('clients.buttons.clear_all')} arrow>
                       
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            onClick={() => clearContact()}
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

              {list?.length > 0 ? (
                tableData
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((contact, index) => (
                    <TableRow
                      key={contact.id}
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
                        {editingContactId === contact.id ? (
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
                            helperText={showError && !name ? `${t('clients.validations.name_required')}` : ''}
                          />
                        ) : (
                          contact.name
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
                        {editingContactId === contact.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          contact?.designation || t('clients.labels.no_available')
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                        align={storedLang === 'ar' ? 'right' : 'left'}
                      >
                        {editingContactId === contact.id ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setShowError(false);
                            }}
                            error={showError && (!email || !isValidEmail(email))}
                            helperText={
                              showError && !email
                                ? `${t('clients.validations.email_required')}`
                                : showError && !isValidEmail(email)
                                ? t('clients.columns.enter_valid_emailaddress')
                                  : ''
                            }
                            autoFocus
                          />
                        ) : (
                          contact.email
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
                        {editingContactId === contact.id ? (
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
                              label={t("clients.columns.phonenumber")}
                              fullWidth
                              onChange={(e) => setMobileNumber(e)}
                              value={mobileNumber}
                            />
                          </Box>
                        ) : (
                          contact.mobileNumber || t('clients.labels.no_available')
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
                        {editingContactId === contact.id ? (
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
                                  t('clients.buttons.update')
                                )}
                              </Button>
                              <Tooltip title={t('clients.buttons.cancel')} arrow>
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
                            {((isClientView &&
                              zetaUser?.permissions?.includes('Client.UpdateContact')) ||
                              (!isClientView &&
                                zetaUser?.permissions?.includes('Vendor.UpdateVendorContact'))) && (
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  handleEditContact(contact);
                                }}
                              >
                                <Iconify icon="eva:edit-fill" />
                              </IconButton>
                            )}
                            {((isClientView &&
                              zetaUser?.permissions?.includes('Client.DeleteContact')) ||
                              (!isClientView &&
                                zetaUser?.permissions?.includes('Vendor.DeleteVendorContact'))) && (
                              <IconButton
                                color="error"
                                onClick={() => {
                                  confirm.onTrue();
                                  setContactId(contact.id);
                                }}
                              >
                                <Iconify icon="eva:trash-2-outline" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {/* <Typography variant="body2" color="textSecondary">
                      No contacts found
                    </Typography> */}
                    <EmptyContent
                      filled
                      sx={{ py: 10 }}
                      title={t('clients.labels.no_contact_found')}
                      description={t('clients.labels.no_contact_available')}
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
        title={t('clients.buttons.delete')}
        content={t('leaddetails.toast.are_you_sure_contact')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(contactId);
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
    </Box>
  );
}
