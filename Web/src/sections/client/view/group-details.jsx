'use client';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import { Scrollbar } from 'src/components/scrollbar';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Stack from '@mui/material/Stack';
import { useRouter } from 'src/routes/hooks';

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
import { useTheme, useMediaQuery } from '@mui/material';
import { employees, departments } from 'src/sections/user/user-mock-data';

import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { GroupMemberTableRow } from 'src/sections/client/group-member-table-row';
import { SalesMemberTableRow } from '../sales-member-table-row';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { SalesMemberTableToolbar } from '../sales-member-table-toolbar';
import { SalesMemberTableFiltersResult } from '../sales-member-table-filters-result';

import { varAlpha } from 'src/theme/styles';
import { useTranslation } from 'react-i18next';

export function GroupDetails({ grpId }) {
  const {t ,i18n}=useTranslation('dashboard/client');
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const router = useRouter();

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 100,
  });

  const [tableData, setTableData] = useState(employees);
  const filters = useSetState({
    name: '',
    member: [],
    department: [],
  });
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const canReset =
    !!filters.state.name || filters.state.member.length > 0 || filters.state.department.length > 0;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleOpenRow = useCallback(
    (id) => {
      const queryParams = new URLSearchParams({
        key: grpId,
      });
      router.push(`${paths.dashboard.clientMember.details(id)}?${queryParams}`);
    },
    [router]
  );

  const [view, setView] = useState('list');

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const TABLE_HEAD = [
   { id: 'serialNo', label: t('clients.columns.serial_no'), width: 60 },
  { id: 'empId', label: t('clients.columns.empId'), width: 120 },
  { id: 'name', label: t('clients.columns.name'), width: 190 },
  { id: 'role', label: t('clients.columns.role'), width: 120 },
  { id: 'department', label: t('clients.columns.department'), width: 130 },
  { id: 'email', label: t('clients.columns.email'), width: 160 },
  { id: 'status', label: t('clients.columns.status'), width: 50 },
  ];

  return (
    <DashboardContent>
      <Box display="flex" gap={1} sx={{ mb: 2 }} alignItems="flex-end">
        <Stack direction="row" alignItems="">
          <Button
            component={RouterLink}
            href={paths.dashboard.client.list}
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
           {t("clients.buttons.back")}
          </Button>
        </Stack>
        <CustomBreadcrumbs
          heading={t("clients.breadcrumb.group_details")}
          links={[
            { name: t("clients.breadcrumb.dashboard"), href: paths.dashboard.root },
            { name: t('clients.tabs.groups'), href: paths.dashboard.client.list },
            { name: t("clients.breadcrumb.group_details") },
          ]}
        />
        <Box>
          <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
            <Tooltip title={t("clients.views.list")} arrow>
              <ToggleButton value="list">
                <Iconify icon="solar:list-bold" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={t("clients.views.grid")} arrow>
              <ToggleButton value="grid">
                <Iconify icon="mingcute:dot-grid-fill" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            px: 2.5,
            py: 0.5,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          <SalesMemberTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            departments={{ departments: departments }}
          />
        </Box>

        {canReset && (
          <SalesMemberTableFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960, my: 1 }}>
              {view === 'list' && (
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
                />
              )}
              {view === 'list' ? (
                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row, index) => (
                      <SalesMemberTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        index={index + table.page * table.rowsPerPage}
                        onOpenRow={() => handleOpenRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              ) : (
                <TableBody>
                  {Array.from({
                    length: Math.ceil(dataFiltered.length / (isLargeScreen ? 4 : 3)),
                  }).map((_, index) => {
                    const startIdx = index * (isLargeScreen ? 4 : 3);
                    const rows = dataFiltered.slice(startIdx, startIdx + (isLargeScreen ? 4 : 3));

                    return (
                      <TableRow key={index}>
                        <TableCell colSpan={isLargeScreen ? 4 : 3}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {rows.map((row, rowIndex) => (
                              <Box key={row.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Card
                                  sx={{
                                    width: 'auto',
                                    minWidth: 200,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    my: 1,
                                  }}
                                >
                                  <GroupMemberTableRow
                                    row={row}
                                    selected={table.selected.includes(row.id)}
                                    onSelectRow={() => table.onSelectRow(row.id)}
                                    onDeleteRow={() => handleDeleteRow(row.id)}
                                    onEditRow={() => handleEditRow(row.id)}
                                    onOpenRow={() => handleOpenRow(row.id)}
                                  />
                                </Card>

                                {rowIndex < rows.length - 1 && (
                                  <Box
                                    sx={{
                                      height: '100px',
                                      width: '1px',
                                      borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                                      marginX: 2,
                                    }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />
                  <TableNoData notFound={notFound} />
                </TableBody>
              )}
            </Table>
          </Scrollbar>
        </Box>
        {view === 'list' && (
          <TablePaginationCustom
            page={table.page}
            rowsPerPageOptions={[100, 150, 250]}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        )}
      </Card>
    </DashboardContent>
  );
}
function applyFilter({ inputData, comparator, filters }) {
  const { name, member, department } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (member.length) {
    inputData = inputData.filter((user) =>
      user.members?.some((person) => member.includes(person.firstName))
    );
  }
  if (department.length) {
    inputData = inputData.filter((user) => department.includes(user.department));
  }
  return inputData;
}
