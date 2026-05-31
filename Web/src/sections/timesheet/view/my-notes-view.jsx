'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { varAlpha } from 'src/theme/styles';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { DocumentsTableToolbar } from 'src/sections/documents/documents-table-toolbar';
import { DocumentsTableFiltersResult } from 'src/sections/documents/documents-table-filters';
import DocumentGridView from 'src/sections/documents/documents-grid-view';
import Pagination from '@mui/material/Pagination';
import Grid from '@mui/material/Unstable_Grid2';

import { _mockDocuments, _documentCategories } from 'src/sections/documents/documents-mock-data';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import { getDocument, deleteDocument } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';
import { EmptyContent } from 'src/components/empty-content';
import { TimeSheetCalendar } from 'src/sections/timesheet/timesheet-calendar';
import dayjs from 'dayjs';

export default function MyNotesView({ isTimeSheetView }) {
  const { t, i18n } = useTranslation('dashboard/documents');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const filters = useSetState({ name: '', category: [], sortBy: 'latest', type: [] });

  const DOCUMENT_TYPE_OPTIONS = [
    { value: 0, label: t('documents.type.book') },
    { value: 1, label: t('documents.type.wiki') },
    { value: 2, label: t('documents.type.post') },
    { value: 3, label: t('documents.type.story') },
    { value: 4, label: t('documents.type.task') },
    { value: 5, label: t('documents.type.project') },
    { value: 6, label: t('documents.type.milestone') },
    { value: 7, label: t('documents.type.client') },
    { value: 8, label: t('documents.type.lead') },
    { value: 9, label: t('documents.type.vendor') },
    { value: 10, label: t('documents.type.contract') },
  ];

  const [page, setPage] = useState(0);
  const rowsPerPage = 8;
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [calendarFocusDate, setCalendarFocusDate] = useState(dayjs().format('YYYY-MM-DD'));
  console.log('this is the selected date', selectedDate);

  const getDayRangeISO = (dateStr) => {
    const startOfDay = dayjs(dateStr).startOf('day').toISOString();
    const endOfDay = dayjs(dateStr).endOf('day').toISOString();
    return { startOfDay, endOfDay };
  };
  const handleCalendarViewDateChange = useCallback((newFocusDate) => {
    setCalendarFocusDate(newFocusDate);
  }, []);
  const getDocParams = useMemo(() => {
    const startDate = dayjs(selectedDate).format('YYYY-MM-DD');
    const endDate = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');

    return {
      search: {
        fieldName: 'Created',
        fieldValue: startDate,
        operator: 5,
        logicOperator: 0,
        subFilters: [
          {
            fieldName: 'Created',
            fieldValue: endDate,
            operator: 4,
          },
        ],
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
      pagination: {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      },
    };
  }, [selectedDate, page]);

  const {
    documentList,
    documentListLoading,
    documentListError,
    documentListEmpty,
    mutate: mutateDocument,
  } = getDocument(getDocParams);
  const [documents, setDocuments] = useState([]);

  const hasMutatedRef = useRef(false);

  useEffect(() => {
    if (!hasMutatedRef.current) {
      mutateDocument();
      hasMutatedRef.current = true;
    }
  }, []);
  useEffect(() => {
    const filteredDocs = documentList?.documents?.filter((doc) => doc.type === 1) || [];

    setDocuments(filteredDocs);
  }, [documentList]);
  console.log('this is the documents', documents);

  useEffect(() => {
    const newDoc = localStorage.getItem('newDocument');
    const updatedDoc = localStorage.getItem('updatedDocument');

    if (newDoc) {
      const parsed = JSON.parse(newDoc);
      setDocuments((prev) => [parsed, ...prev]);
      localStorage.removeItem('newDocument');
    }

    if (updatedDoc) {
      const parsed = JSON.parse(updatedDoc);
      setDocuments((prev) => prev.map((doc) => (doc?.id === parsed.id ? parsed : doc)));
      localStorage.removeItem('updatedDocument');
    }
  }, []);

  const filteredDocuments = useMemo(
    () => applyFilter({ inputData: documents, filters: filters.state, DOCUMENT_TYPE_OPTIONS }),
    [documents, filters.state]
  );
  const totalPages = Math.ceil(documentList?.totalDocuments / rowsPerPage);

  const handleAddNewDocument = () => {
    const queryParams = new URLSearchParams();

    const queryString = queryParams.toString();
    const path = paths.dashboard.notes.new;
    router.push(path);
  };

  const canReset =
    !!filters.state.name ||
    filters.state.category?.length > 0 ||
    filters.state.type?.length > 0 ||
    filters.state.sortBy !== 'latest';

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1);
  };
  const handleDeleteDoc = async (id) => {
    if (id) {
      try {
        const response = await deleteDocument(id);
        if (response.success) {
          await mutateDocument();
          toast.success(t('documents.toast.document_delete'));
        } else {
          toast.error(response.error || t('documents.toast.response_error'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('documents.toast.unexpected_error_delete'));
      }
    }
  };
  const handleEditDoc = useCallback(
    (doc) => {
      // localStorage.setItem('docDetails', JSON.stringify(doc));
      const queryParams = new URLSearchParams();

      const queryString = queryParams.toString();
      const path = paths.dashboard.notes.edit(doc.id);
      router.push(path);
    },
    [router]
  );

  if (documentListLoading)
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
  if (documentListError) {
    return <ErrorView errorCode={documentListError} />;
  }

  const renderView = (
    <>
      <Card>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            px: 2.5,
            py: 1,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          <DocumentsTableToolbar
            filters={filters}
            onResetPage={() => setPage(0)}
            options={{ categories: _documentCategories }}
            typeOptions={{ docType: DOCUMENT_TYPE_OPTIONS }}
            isTimeSheetView={isTimeSheetView}
          />

          {isTimeSheetView && (
            <Button
              startIcon={
                <Iconify
                  icon="mingcute:add-line"
                  sx={{
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
              sx={{ mx: 1 }}
              variant="contained"
              onClick={handleAddNewDocument}
            >
              Add Note
            </Button>
          )}
        </Box>

        {canReset && (
          <DocumentsTableFiltersResult
            filters={filters}
            onResetPage={() => setPage(0)}
            totalResults={filteredDocuments.length}
            sx={{ px: 2.5, pt: 0 }}
          />
        )}
        <Grid container sx={{ my: 2 }}>
          <Grid xs={12} md={3.5} sx={{ pl: 3 }}>
            <TimeSheetCalendar
              onDateSelect={setSelectedDate}
              // datesWithData={datesWithData}
              onCalendarViewDateChange={handleCalendarViewDateChange}
              selectedDate={selectedDate} // Pass selectedDate down to the calendar component
            />
          </Grid>
          <Grid xs={12} md={8.5} sx={{ p: 3, pt: 0 }}>
            {filteredDocuments.length > 0 && !zetaUser?.roles?.includes('External') ? (
              <DocumentGridView
                documents={filteredDocuments}
                onView={(doc) => router.push(paths.dashboard.notes.view(doc?.id))}
                onEdit={(doc) => handleEditDoc(doc)}
                onDelete={(doc) => handleDeleteDoc(doc?.id)}
                isTimeSheetView={isTimeSheetView}
              />
            ) : (
              <EmptyContent
                filled
                sx={{ py: 10 }}
                title="No notes found"
                description="There are no notes available"
              />
            )}
          </Grid>
        </Grid>
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" sx={{ mt: { xs: 3, md: 5 }, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              sx={{
                '& .MuiPaginationItem-icon': {
                  transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                },
              }}
            />
          </Box>
        )}
      </Card>
    </>
  );
  return <>{renderView}</>;
}
export function applyFilter({ inputData, filters, DOCUMENT_TYPE_OPTIONS }) {
  const { name, category, sortBy, type } = filters;

  let data = Array.isArray(inputData) ? [...inputData] : [];
  // Keyword search
  if (name) {
    const keyword = name.toLowerCase();
    data = data.filter(
      (item) =>
        Array.isArray(item?.documentVersionList) &&
        item.documentVersionList.some(
          (v) => typeof v.title === 'string' && v.title.toLowerCase().includes(keyword)
        )
    );
  }

  // Category filter
  if (category && category.length > 0) {
    data = data.filter((item) => category.includes(item.category));
  }

  if (type && type.length > 0) {
    data = data.filter((item) => {
      if (item?.type === undefined || item?.type === null) return false;

      const typeOption = DOCUMENT_TYPE_OPTIONS.find((opt) => opt.value === item.type);
      const itemTypeLabel = typeOption ? typeOption.label : null;

      return itemTypeLabel ? type.includes(itemTypeLabel) : false;
    });
  }

  // Sort
  if (sortBy === 'latest') {
    data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'oldest') {
    data = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return data;
}
