import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
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
import { useBoolean } from 'src/hooks/use-boolean';
import Button from '@mui/material/Button';
import { ConfirmDialog } from 'src/components/custom-dialog';

// import { AuditLogTableToolbar } from '../audit-log-table-toolbar';
// import { AuditLogTableFiltersResult } from '../audit-log-table-filter-result';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';

import { varAlpha } from 'src/theme/styles';
import { fDateTimeNew } from 'src/utils/format-time';
import { useSetState } from 'src/hooks/use-set-state';
import { getUser } from 'src/actions/userManage/userManageActions';
import { fIsAfter } from 'src/utils/format-time';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { addLeadUpdate, getLeadUpdates, deleteLeadUpdate } from 'src/actions/client/clientActions';
import { toast } from 'src/components/snackbar';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm, FormProvider } from 'react-hook-form';
import { Field } from 'src/components/hook-form';
import { EmptyContent } from 'src/components/empty-content';

export function LeadUpdateView({ leadId }) {
  const storedLang = localStorage.getItem('selectedLang');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });
  const methods = useForm({
    defaultValues: {
      description: '',
      start: null,
    },
  });
  const openDateRange = useBoolean();
  const confirm = useBoolean();

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const subFilters = [
    {
      fieldName: 'emailConfirmed',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    },
  ];
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    search: {
      fieldName: 'isActive',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
      subFilters,
    },
  };
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser(getUsersParams);
  const {
    leadUpdateList,
    leadUpdateListLoading,
    leadUpdateListError,
    leadUpdateListEmpty,
    mutate: mutateLeadUpdates,
  } = getLeadUpdates({ leadId });

  const filters = useSetState({
    name: '',
    members: null,
    startDate: null,
    endDate: null,
  });
  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const [searchText, setSearchText] = useState(filters.state.name || '');
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      table.onResetPage();
      filters.setState({ name: searchText });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);
  const canReset =
    !!filters.state.name ||
    !!filters.state.members ||
    (!!filters.state.startDate && !!filters.state.endDate);
  const memberId = filters.state.members?.id || '';
  const [updateText, setUpdateText] = useState('');
  const [status, setStatus] = useState('');
  const [deleteUpdateId, setDeleteUpdateId] = useState('');

  const mockData = useMemo(
    () => [
      {
        id: 1,
        name: 'Ahmed Khan',
        description: 'Follow-up meeting regarding vendor onboarding and documentation review.',
        date: '31/03/2026',
        time: '10:00 AM',
      },
      {
        id: 2,
        name: 'Sara Ali',
        description: 'Discussion about purchase order changes and item quantity confirmation.',
        date: '31/03/2026',
        time: '11:30 AM',
      },
      {
        id: 3,
        name: 'Mohammed Faisal',
        description: 'Client requested revised quotation with updated delivery timeline.',
        date: '01/04/2026',
        time: '02:15 PM',
      },
      {
        id: 4,
        name: 'Nadia Rahman',
        description: 'Internal review for pending approvals and invoice status check.',
        date: '01/04/2026',
        time: '04:00 PM',
      },
      {
        id: 5,
        name: 'Fatima Noor',
        description: 'Project kickoff discussion and clarification of scope items.',
        date: '02/04/2026',
        time: '09:45 AM',
      },
    ],
    []
  );
  const mappedLeadUpdates = useMemo(() => {
    return (leadUpdateList?.leadUpdates || []).map((item) => ({
      id: item.id,
      name: item.createdByName || 'Unknown User',
      creatorProfileImageFileUrl: item.createdByProfileImage || '',
      description: item.description || '',
      status: item.status || 'Pending',
      changedAt: item.created,
      date: item.created ? dayjs(item.created).format('DD/MM/YYYY') : '-',
      time: item.created ? dayjs(item.created).format('hh:mm A') : '-',
    }));
  }, [leadUpdateList]);

  const dataFiltered = applyFilter({
    inputData: mappedLeadUpdates,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  console.log('this is the data filtered', dataFiltered);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;
  const [openDialog, setOpenDialog] = useState(false);
  const [openTodo, setOpenTodo] = useState(false);

  const handleAddClick = () => {
    setOpenDialog(true);
  };
  const handleCancelClick = () => {
    setOpenDialog(false);
  };
  const handleClickTodo = () => {
    setOpenTodo(true);
  };
  const handleCancelTodo = () => {
    setOpenTodo(false);
  };
  const handleAddUpdate = async () => {
    const payload = {
      leadId,
      description: updateText,
      status,
    };
    console.log('this is the payload', payload);

    try {
      const response = await addLeadUpdate(payload);
      console.log('this is the response', response);
      if (response.success) {
        toast.success('Lead update added successfully');
        await mutateLeadUpdates();
        setOpenDialog(false);
      } else {
        toast.error(response.error || 'Add lead update failed');
      }
    } catch (error) {}
  };
  const handleDeleteUpdate = async (id) => {
    if (!id) return;

    try {
      const response = await deleteLeadUpdate(id);

      if (response?.success) {
        await mutateLeadUpdates();
        toast.success('Lead Update deleted successfully');
        confirm.onFalse();
        setDeleteUpdateId('');
      } else {
        toast.error(response?.error || 'Delete lead update failed');
      }
    } catch (error) {}
  };
  const TABLE_HEAD = [
    { id: 'serialNo', label: 'Sl. No', width: '5%', align: 'center' },
    {
      id: 'name',
      label: 'Creator',
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'action',
      label: 'Updates',
      width: '22.5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // {
    //   id: 'old',
    //   label: 'Old Value',
    //   width: '30%',
    //   align: storedLang === 'ar' ? 'right' : 'left',
    // },
    // {
    //   id: 'new',
    //   label: 'New Value',
    //   width: '30%',
    //   align: storedLang === 'ar' ? 'right' : 'left',
    // },
    {
      id: 'date',
      label: 'Date & Time',
      width: '15%',
    },
  ];
  if (leadUpdateListLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)',
          }}
        />
      </div>
    );
  if (leadUpdateListError) {
    return <ErrorView errorCode={leadUpdateListError} />;
  }
  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
      ></Box>
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            py: 0,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          {' '}
          <Button variant="contained" sx={{ m: 1 }} onClick={handleAddClick}>
            Add Updates
          </Button>
          <Dialog
            open={openDialog}
            onClose={handleCancelClick}
            PaperProps={{
              sx: { width: '500px' },
            }}
          >
            <DialogTitle> Updates</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Type here..."
                type="text"
                fullWidth
                multiline
                rows={3}
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                sx={{
                  mb: 2,
                  ...(storedLang === 'ar' && {
                    '& .MuiFormLabel-root': {
                      right: 30,
                      left: 'auto',
                      transformOrigin: 'top right',
                    },
                    '& .MuiInputBase-input': {
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
              />
              <TextField
                autoFocus
                margin="dense"
                label="Status"
                type="text"
                fullWidth
                multiline
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{
                  mb: 2,
                  ...(storedLang === 'ar' && {
                    '& .MuiFormLabel-root': {
                      right: 30,
                      left: 'auto',
                      transformOrigin: 'top right',
                    },
                    '& .MuiInputBase-input': {
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
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCancelClick}
                variant="contained"
                sx={storedLang === 'ar' ? { ml: 2 } : {}}
              >
                Cancel
              </Button>
              <Button variant="contained" sx={{ bgcolor: '#006A67' }} onClick={handleAddUpdate}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
            p: 2,
          }}
        >
          {!dataFiltered.length ? (
            <EmptyContent
              filled
              sx={{ py: 10 }}
              title="No Updates Yet"
              description="No updates have been added for this lead."
            />
          ) : (
            dataFiltered.map((row, index) => (
              <Card
                key={row.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    #{index + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Add Todo">
                      <IconButton
                        size="small"
                        sx={{
                          width: 15,
                          height: 15,
                          bgcolor: '#006A67',
                          color: '#fff',
                          '&:hover': { bgcolor: '#005B58' },
                        }}
                        onClick={handleClickTodo}
                      >
                        <Iconify icon="mingcute:add-line" sx={{ width: 15, height: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Lead Update">
                      <IconButton
                        size="small"
                        sx={{ color: 'error.main' }}
                        onClick={() => {
                          confirm.onTrue();
                          setDeleteUpdateId(row?.id);
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: 15, height: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar
                    alt={row?.name}
                    src={row?.creatorProfileImageFileUrl || ''}
                    sx={{ width: 30, height: 30 }}
                  >
                    {!row?.creatorProfileImageFileUrl && row?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">{row.name}</Typography>
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 0.5,
                    // color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                  }}
                >
                  {row.description}
                </Typography>

                {/* Footer */}
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Chip
                    label={row.status || 'Pending'}
                    size="small"
                    color={
                      row.status?.toLowerCase() === 'completed'
                        ? 'success'
                        : row.status?.toLowerCase() === 'pending'
                          ? 'warning'
                          : 'info'
                    }
                    variant="soft"
                    sx={{
                      height: 18,
                      '& .MuiChip-label': {
                        fontSize: '10px',
                        px: 0.5,
                      },
                    }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                    {row.date} • {row.time}
                  </Typography>
                </Box>
              </Card>
            ))
          )}
        </Box>
      </Card>
      <Dialog
        open={openTodo}
        onClose={handleCancelTodo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Add Todo</DialogTitle>
        <FormProvider {...methods}>
          <form>
            {' '}
            <DialogContent>
              <Card sx={{ p: 2, mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <TextField
                    fullWidth
                    label="Description"
                    placeholder="Enter todo..."
                    size="small"
                  />

                  <Field.MobileDateTimePicker
                    name="start"
                    label="Date"
                    sx={{
                      minWidth: 200,
                      '& .MuiInputBase-input': { padding: '9px 14px' },
                      '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#006A67',
                      minWidth: 130,
                      '&:hover': { bgcolor: '#005B58' },
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Card>

              <Box sx={{ px: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  1 of 3 completed
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={33}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Stack spacing={1.2} sx={{ mt: 2 }}>
                {[
                  {
                    id: 1,
                    content: 'Call client and confirm updated quotation.',
                    date: '31-03-2026 10:00 AM',
                    assignee: 'Ahmed Khan',
                    status: 'Pending',
                    checked: false,
                  },
                  {
                    id: 2,
                    content: 'Prepare follow-up document for vendor onboarding.',
                    date: '31-03-2026 01:30 PM',
                    assignee: 'Sara Ali',
                    status: 'Completed',
                    checked: true,
                  },
                  {
                    id: 3,
                    content: 'Send revised delivery timeline to client.',
                    date: '01-04-2026 09:15 AM',
                    assignee: 'Mohammed Faisal',
                    status: 'Pending',
                    checked: false,
                  },
                ].map((todo) => (
                  <Paper
                    key={todo.id}
                    sx={{
                      p: 1.2,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox checked={todo.checked} size="small" />

                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            textDecoration: todo.checked ? 'line-through' : 'none',
                            color: todo.checked ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {todo.content}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.7 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {todo.assignee.charAt(0)}
                          </Avatar>

                          <Typography variant="caption" color="text.secondary">
                            {todo.assignee}
                          </Typography>

                          <Chip
                            label={todo.status}
                            size="small"
                            color={todo.checked ? 'success' : 'warning'}
                            variant="soft"
                            sx={{
                              height: 18,
                              '& .MuiChip-label': { fontSize: '10px', px: 0.7 },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {todo.date}
                      </Typography>

                      <IconButton size="small" color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" width={15} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </DialogContent>
          </form>
        </FormProvider>

        <DialogActions>
          <Button onClick={handleCancelTodo}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Lead Update"
        content="Are you sure you want to delete this lead update?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteUpdate(deleteUpdateId)}
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
      />{' '}
    </Box>
  );
}
function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, role, member, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);
  if (!dateError) {
    if (startDate && endDate) {
      const startOfDay = dayjs(startDate).startOf('day');
      const endOfDay = dayjs(endDate).endOf('day');

      inputData = inputData.filter((file) => {
        const fileDate = dayjs(file.changedAt);
        return fileDate.isBetween(startOfDay, endOfDay, null, '[]');
      });
    }
  }
  return inputData;
}
