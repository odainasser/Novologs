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
import { DocumentsTableToolbar } from '../documents-table-toolbar';
import { DocumentsTableFiltersResult } from '../documents-table-filters';
import DocumentGridView from '../documents-grid-view';
import Pagination from '@mui/material/Pagination';

import { _mockDocuments, _documentCategories } from '../documents-mock-data';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import { getDocument, deleteDocument } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { useAuthContext } from 'src/auth/hooks';
import { EmptyContent } from 'src/components/empty-content';

export default function DocumentView({
  isProject,
  projectId,
  isClient,
  isClientView,
  clientId,
  isLead,
  leadId,
}) {
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

  const getDocParams = {
    pagination: {
      pageNumber: page + 1,
      pageSize: rowsPerPage,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
  };
  if (isProject) {
    getDocParams.search = {
      logicOperator: 0,
      fieldName: 'ProjectId',
      operator: 0,
      fieldValue: projectId,
    };
  }

  if (isClient) {
    const fieldName = isClientView ? 'ClientId' : 'VendorId';
    getDocParams.search = {
      logicOperator: 0,
      fieldName: fieldName,
      operator: 0,
      fieldValue: clientId,
    };
  }

  if (isLead) {
    const fieldName = isClientView ? 'ClientLeadId' : 'VendorContractId';
    getDocParams.search = {
      logicOperator: 0,
      fieldName: fieldName,
      operator: 0,
      fieldValue: leadId,
    };
  }

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
    const filteredDocs = documentList?.documents?.filter((doc) => doc.type !== 1) || [];

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

  // const paginatedDocuments = useMemo(
  //   () => filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
  //   [page, filteredDocuments, rowsPerPage]
  // );

  const handleAddNewDocument = () => {
    const queryParams = new URLSearchParams();

    if (isProject !== undefined) {
      queryParams.append('isProject', String(isProject)); // Convert boolean/value to string
    }
    if (projectId !== undefined) {
      queryParams.append('projectId', projectId);
    }

    if (isClient !== undefined) {
      if (isClientView) {
        queryParams.append('isClient', String(isClient));
      } else {
        queryParams.append('isVendor', String(isClient));
      }
    }
    if (clientId !== undefined) {
      if (isClientView) {
        queryParams.append('clientId', clientId);
      } else {
        queryParams.append('vendorId', clientId);
      }
    }

    if (isLead !== undefined) {
      if (isClientView) {
        queryParams.append('isLead', String(isLead));
      } else {
        queryParams.append('isContract', String(isLead));
      }
    }
    if (leadId !== undefined) {
      if (isClientView) {
        queryParams.append('leadId', leadId);
      } else {
        queryParams.append('contractId', leadId);
      }
    }

    const queryString = queryParams.toString();
    const path = queryString
      ? `${paths.dashboard.documents.new}?${queryString}`
      : paths.dashboard.documents.new;
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

      if (isProject !== undefined) {
        queryParams.append('isProject', String(isProject)); // Convert boolean/value to string
      }
      if (projectId !== undefined) {
        queryParams.append('projectId', projectId);
      }
      if (isClient !== undefined) {
        if (isClientView) {
          queryParams.append('isClient', String(isClient));
        } else {
          queryParams.append('isVendor', String(isClient));
        }
      }
      if (clientId !== undefined) {
        if (isClientView) {
          queryParams.append('clientId', clientId);
        } else {
          queryParams.append('vendorId', clientId);
        }
      }

      if (isLead !== undefined) {
        if (isClientView) {
          queryParams.append('isLead', String(isLead));
        } else {
          queryParams.append('isContract', String(isLead));
        }
      }
      if (leadId !== undefined) {
        if (isClientView) {
          queryParams.append('leadId', leadId);
        } else {
          queryParams.append('contractId', leadId);
        }
      }

      const queryString = queryParams.toString();
      const path = queryString
        ? `${paths.dashboard.documents.edit(doc.id)}?${queryString}`
        : paths.dashboard.documents.edit(doc.id);
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
      {!isProject && !isClient && !isLead && (
        <CustomBreadcrumbs
          heading={t('documents.add.documents')}
          links={[
            { name: t('documents.add.dashboard'), href: paths.dashboard.root },
            { name: t('documents.list.heading'), href: paths.dashboard.documents.root },
            { name: t('documents.list.tabs.list') },
          ]}
          sx={{ mb: 2 }}
        />
      )}

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
            isProject={isProject}
            isClient={isClient}
            isLead={isLead}
          />

          {zetaUser?.permissions?.includes('Documents.Create') && (
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
              {t('documents.list.toolbar.add_button')}
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
        {documentList &&
        documentList.totalDocuments > 0 &&
        !zetaUser?.roles?.includes('External') ? (
          <DocumentGridView
            documents={filteredDocuments}
            onView={(doc) => router.push(`/dashboard/documents/view/${doc?.id}`)}
            onEdit={(doc) => handleEditDoc(doc)}
            onDelete={(doc) => handleDeleteDoc(doc?.id)}
          />
        ) : (
          <EmptyContent
            filled
            sx={{ py: 10 }}
            title={t('documents.actions.no_documents_found')}
            description={t('documents.actions.no_douments_available')}
          />
        )}

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
  return (
    <>
      {isProject || isClient || isLead ? (
        <>{renderView}</>
      ) : (
        <DashboardContent>{renderView}</DashboardContent>
      )}
    </>
  );
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
