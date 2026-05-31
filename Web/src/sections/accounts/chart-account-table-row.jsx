import { useState, useMemo, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import TextField from '@mui/material/TextField';
import { toast } from 'src/components/snackbar';
import { _status, _projects, _categories, _members } from 'src/sections/kanban/kanban-mock-data';

import { useTranslation } from 'react-i18next';

import { AddChartAccount } from './add-chart-account';
import { AccountDetails } from './account-details';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { updateAccount } from 'src/actions/accounts/accountActions';

// ----------------------------------------------------------------------

export function ChartAccountTableRow({
  row,
  selected,
  onDeleteRow,

  index,
  level = 0,
  isOpen,
  hasChildren,
  onToggle,
  mutate,
  accountList,
  mutateChartHierarchy,
  isEditing,
  editingCategoryId,
  setEditingCategoryId,
}) {
  const popover = usePopover();
  const { t } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');
  const [openAccountDetails, setOpenAccountDetails] = useState(false);

  const handleRowClick = () => {
    setOpenAccountDetails(true);
  };

  const handleCloseAccountDetails = () => {
    setOpenAccountDetails(false);
  };
  const [openingId, setOpeningId] = useState(null);
  const [openTasks, setOpenTasks] = useState(false);
  const handleOpenTasks = () => {
    setOpenTasks(true);
  };
  const handleTasksDialogClose = () => {
    setTimeout(() => {
      setOpenTasks(false);
    }, 100);
  };
  const handleOpenAccount = (acc) => {
    setOpeningId(acc.id);
  };
  const clearAll = () => {
    setOpeningId(null);
  };
  const addOpeningBalance = async () => {
    console.log('Opening balance added successfully');
    toast.success(t('accounts.opening_balance_added'));
    setOpeningId(null);
  };
  const confirm = useBoolean();
  const editData = accountList?.find((acc) => acc.id === row.id);
  const levelColors = ['#F5F5F5', '#E0E0E0', '#CCCCCC', '#B8B8B8'];
  // const levelColors = ['#E0E0E0', '#CCCCCC', '#B8B8B8', '#A3A3A3', '#FFFFFF'];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [accountCategory, setAccountCategory] = useState('');
  const [accountType, setAccountType] = useState('');
  const [parentAccountId, setParentAccountId] = useState('');

  const handleEditCategory = (row) => {
    console.log('this is the row edit', row);
    setEditingCategoryId(row.id);
    setNewCategory(row.name);
    setAccountCategory(row.accountCategory);
    setAccountType(row.accountType);
    setParentAccountId(row.parentAccountId);
  };
  const handleUpdateCategory = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      name: newCategory,
      accountType: accountType,
      accountCategory: accountCategory,
      parentAccountId: parentAccountId,
    };
    try {
      let response;
      response = await updateAccount(payload, row.id);
      if (response.success) {
        toast.success('Category updated successfully');
        await mutate();
        await mutateChartHierarchy();
        setEditingCategoryId(null);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Account action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <TableRow
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        onClick={(e) => {
          if (row.isSubcategory) return;
          if (hasChildren) return;
          if (e.target.closest('button, svg, input')) return;
          handleRowClick();
        }}
        sx={{
          backgroundColor: row.isSubcategory ? '#FFFFFF' : '#F5F5F5',
        }}
      >
        <TableCell
          align="center"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: row.isSubcategory || hasChildren ? 'default' : 'pointer',

            maxWidth: '200px',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          {row.code}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: row.isSubcategory || hasChildren ? 'default' : 'pointer',

            maxWidth: '200px',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', pl: `${level * 24}px` }}>
            {hasChildren && (
              <IconButton size="small" onClick={onToggle}>
                <Iconify icon={isOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
              </IconButton>
            )}
            {!hasChildren && (
              <Box sx={{ ml: hasChildren ? 1 : 0, fontWeight: hasChildren ? 'bold' : 'normal' }}>
                {row.name}
              </Box>
            )}
            {hasChildren && (
              <>
                {editingCategoryId === row.id ? (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      autoFocus
                    />
                  </>
                ) : (
                  <>{row.name}</>
                )}
              </>
            )}
          </Box>
        </TableCell>
        <TableCell
          align="right"
          sx={{
            cursor: row.isSubcategory || hasChildren ? 'default' : 'pointer',
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        >
          {row.totalDebit
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(row.totalDebit))
            : ''}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            cursor: row.isSubcategory || hasChildren ? 'default' : 'pointer',
            borderRight: isEditing ? '1px dotted rgba(200, 200, 200, 0.6)' : 'none',
          }}
        >
          {row.totalCredit
            ? new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(row.totalCredit))
            : ''}
        </TableCell>
        {isEditing && (
          <TableCell align="right">
            {!row?.totalDebit && !row?.totalCredit && (
              <>
                {openingId === row.id ? (
                  <Tooltip title={t('accounts.add')} arrow>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        textTransform: 'none',
                        padding: '6px 12px',
                        bgcolor: '#006A67',
                      }}
                      onClick={() => {
                        addOpeningBalance();
                      }}
                    >
                      {t('accounts.add')}
                    </Button>
                  </Tooltip>
                ) : (
                  <>
                    {/* <Tooltip title={t('accounts.add_opening_balance')}>
                    <Iconify
                      icon="mdi:archive-plus"
                      color="#006A67"
                      sx={{
                        mr: storedLang === 'ar' ? 0 : 1,
                        ml: storedLang === 'ar' ? 1 : 0,
                        cursor: 'pointer',
                      }}
                      width={15}
                      height={15}
                      onClick={() => {
                        handleOpenAccount(row);
                      }}
                    />
                  </Tooltip> */}
                  </>
                )}
              </>
            )}
            {openingId === row.id ? (
              <Tooltip title={t('accounts.clear')} arrow>
                <Iconify
                  icon="solar:trash-bin-trash-bold"
                  onClick={() => clearAll()}
                  sx={{
                    cursor: row.isSubcategory || hasChildren ? 'default' : 'pointer',
                    height: 13,
                    width: 13,
                    color: 'error.main',
                    ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                  }}
                />
              </Tooltip>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="right">
                <>
                  {!hasChildren && (
                    <>
                      <Tooltip title={t('accounts.edit')} arrow>
                        <Iconify
                          icon="solar:pen-bold"
                          color="#006A67"
                          sx={{
                            mr: storedLang === 'ar' ? 0 : 1,
                            ml: storedLang === 'ar' ? 1 : 0,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setOpenTasks(true);
                          }}
                          width={15}
                          height={15}
                        />
                      </Tooltip>
                    </>
                  )}

                  {hasChildren && (
                    <>
                      {editingCategoryId === row.id ? (
                        <>
                          <Tooltip title="Save" arrow>
                            <span>
                              <IconButton
                                onClick={handleUpdateCategory}
                                disabled={isSubmitting}
                                size="small"
                                sx={{
                                  color: '#006A67',
                                  p: 0,
                                  ml: storedLang === 'ar' ? 1 : 0,
                                  mr: storedLang === 'ar' ? 0 : 1,
                                  '&:hover': {
                                    backgroundColor: 'transparent',
                                  },
                                }}
                              >
                                {isSubmitting ? (
                                  <CircularProgress size={16} sx={{ color: '#006A67' }} />
                                ) : (
                                  <Iconify icon="eva:checkmark-fill" width={18} height={18} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="Clear" arrow>
                            <Iconify
                              icon="mdi:refresh"
                              color="text.secondary"
                              sx={{
                                mr: storedLang === 'ar' ? 0 : 1,
                                ml: storedLang === 'ar' ? 1 : 1,
                                cursor: 'pointer',
                              }}
                              width={15}
                              height={15}
                              onClick={() => {
                                setEditingCategoryId(null);
                              }}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Edit" arrow>
                          <Iconify
                            icon="solar:pen-bold"
                            color="#006A67"
                            sx={{
                              mr: storedLang === 'ar' ? 0 : 1,
                              ml: storedLang === 'ar' ? 1 : 0,
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditCategory(row)}
                            width={15}
                            height={15}
                          />
                        </Tooltip>
                      )}
                    </>
                  )}

                  {!hasChildren &&
                    Number(row?.totalCredit || 0) === 0 &&
                    Number(row?.totalDebit || 0) === 0 && (
                      <Tooltip title="Delete Account" arrow>
                        <Iconify
                          icon="solar:trash-bin-trash-bold"
                          color="error.main"
                          sx={{
                            mr: storedLang === 'ar' ? 0 : 1,
                            ml: storedLang === 'ar' ? 1 : 0,
                            cursor: 'pointer',
                          }}
                          width={15}
                          height={15}
                          onClick={() => {
                            confirm.onTrue();
                          }}
                        />
                      </Tooltip>
                    )}
                </>
              </Box>
            )}
          </TableCell>
        )}
      </TableRow>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Account"
        content="Are you sure you want to delete this account?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Delete
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <AccountDetails
        open={openAccountDetails}
        onClose={handleCloseAccountDetails}
        account={editData}
      />
      <AddChartAccount
        openDetails={openTasks}
        onClick={handleOpenTasks}
        onCloseDetails={handleTasksDialogClose}
        anchor={storedLang === 'ar' ? 'left' : 'right'}
        mutate={mutate}
        editData={editData}
      />
    </>
  );
}
