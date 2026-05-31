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

import { AuditLogTableToolbar } from '../audit-log-table-toolbar';
import { AuditLogTableFiltersResult } from '../audit-log-table-filter-result';

import { varAlpha } from 'src/theme/styles';
import { getAuditLogs } from 'src/actions/user-manage/userManageActions';
import { fDateTimeNew } from 'src/utils/format-time';
import { useSetState } from 'src/hooks/use-set-state';
import { getUser } from 'src/actions/user-manage/userManageActions';
import { fIsAfter } from 'src/utils/format-time';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

export function AuditLogView() {
  const storedLang = localStorage.getItem('selectedLang');
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
  });
  const openDateRange = useBoolean();

  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const getUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser(getUsersParams);

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

  const getAuditParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },

    ...(memberId && {
      search: {
        fieldName: 'id',
        fieldValue: memberId,
        operator: 0,
      },
    }),
  };
  const { auditList, auditListLoading, auditListError, auditListValidating, auditListEmpty } =
    getAuditLogs(getAuditParams, filters.state.name);
  const dataFiltered = applyFilter({
    inputData: auditList?.audits || [],
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
    dateError,
  });

  console.log('this is the data filtered', dataFiltered);

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
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const TABLE_HEAD = [
    { id: 'serialNo', label: 'Sl. No', width: '5%', align: 'center' },
    {
      id: 'name',
      label: 'Name',
      width: '20%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'entity',
      label: 'Entity Name',
      width: '22.5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'action',
      label: 'Action',
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
          <AuditLogTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            sharedUsers={usersList?.users}
            searchText={searchText}
            setSearchText={setSearchText}
            openDateRange={openDateRange.value}
            onOpenDateRange={openDateRange.onTrue}
            onCloseDateRange={openDateRange.onFalse}
              dateError={dateError}
          />
        </Box>
        {canReset && (
          <AuditLogTableFiltersResult
            filters={filters}
            totalResults={auditList?.totalAudits}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
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
              borderCollapse: 'collapse',
              '& td, & th': {
                padding: table.dense ? '4px' : '8px',
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                borderBottom: '1px dotted rgba(200, 200, 200, 0.6)',
              },
              '& .MuiTableBody-root .MuiTableCell-root:not(:last-child)': {
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              },
              '& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root': {
                borderBottom: '1px dotted rgba(200, 200, 200, 0.6)',
              },
            }}
          >
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
            >
              <TableRow>
                {TABLE_HEAD.map((head) => (
                  <TableCell
                    key={head.id}
                    align={head.align}
                    sx={{
                      width: head.width,
                      py: 1.8,
                    }}
                  >
                    {head.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeadCustom>

            <TableBody>
              {dataFiltered.length > 0 ? (
                dataFiltered.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: 'rgba(0, 106, 103, 0.03)',
                      },
                    }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{row.changedBy}</TableCell>

                    <TableCell align={storedLang === 'ar' ? 'right' : 'left'}>
                      <Typography variant="body2">{row.entityName}</Typography>
                    </TableCell>

                    <TableCell align={storedLang === 'ar' ? 'right' : 'left'}>
                      <Typography variant="body2">{row.action}</Typography>
                    </TableCell>

                    {/* <TableCell align={storedLang === 'ar' ? 'right' : 'left'}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {row.oldValue}
                      </Typography>
                    </TableCell>

                    <TableCell align={storedLang === 'ar' ? 'right' : 'left'}>
                      <Typography variant="body2">{row.newValue}</Typography>
                    </TableCell> */}
                    <TableCell>
                      <Typography
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                        variant="caption"
                      >
                        {' '}
                        {`${
                          !row?.changedAt || row?.changedAt.startsWith('0001-01-01')
                            ? 'Not Available'
                            : fDateTimeNew(row.changedAt)
                        }`}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableNoData notFound={notFound} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationCustom
          page={table.page}
          rowsPerPageOptions={[50, 100, 200]}
          dense={table.dense}
          count={auditList.totalAudits}
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
