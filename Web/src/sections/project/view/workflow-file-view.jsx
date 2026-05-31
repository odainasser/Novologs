'use client';

import { useState, useCallback, useEffect } from 'react';
import Card from '@mui/material/Card';
import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import { useForm, Controller } from 'react-hook-form';
import { Fragment } from 'react';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Select, InputLabel, FormControl, OutlinedInput } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FileManagerTableToolbar } from 'src/sections/file-manager/file-manager-table-toolbar';
import { FileManagerFiltersResult } from 'src/sections/file-manager/file-manager-filters-result';
import { Label } from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TablePaginationCustom,
  useTable,
  rowInPage,
  getComparator,
  emptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TableEmptyRows,
  TableNoData,
} from 'src/components/table';
import {
  _fmProjects,
  _allFiles,
  _fmMembers,
  _fmClients,
} from 'src/sections/file-manager/file-manager-mock-data';
import { fileFormat } from 'src/components/file-thumbnail';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { useTheme, useMediaQuery, Typography } from '@mui/material';
import { WorkFlowFileTableRow } from '../workflow-file-table-row';
import { FileSharedTableRow } from 'src/sections/file-manager/file-shared-table-row';
import { TextField, MenuItem } from '@mui/material';
import { WorkFlowFileMembers } from '../workflow-file-members';
import { useTranslation } from 'react-i18next';
import FileDetailsDrawer from 'src/sections/file-manager/file-manager-file-details';
import { addFile, getFiles, deleteFile } from 'src/actions/file/fileActions';
import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/actions/user-manage/userManageActions';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { v4 as uuidv4 } from 'uuid';
import { mock_data } from '../workflow-mock-data';

export function WorkflowFileView({
  isProject,
  projectId,
  isClient,
  clientId,
  isClientView,
  isLead,
  leadId,
  projectRootFolderId,
  clientRootFolderId,
  leadRootFolderId,
  isMainView,
  isDetailsView,
}) {
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');
  console.log('this is the mock data', mock_data);
  const { user } = useMockedUser();

  const [currentFolderId, setCurrentFolderId] = useState(null);

  const [currentFolderParentId, setCurrentFolderParentId] = useState(null);

  console.log('this is the current folder id', currentFolderId);
  const [folderPath, setFolderPath] = useState([]);
  const [currentFolderName, setCurrentFolderName] = useState('');

  const [isRootSystemFolder, setIsRootSystemFolder] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState('');

  const [selectedRowMembers, setSelectedRowMembers] = useState(null);

  const TABLE_HEAD = [
    { id: 'serial', label: 'Sl. No', width: '5%', align: 'center' },
    {
      id: 'code',
      label: 'Code',
      width: '5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    ...(isMainView
      ? [
          {
            id: 'project',
            label: 'Project',
            width: '5%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
    {
      id: 'chat',
      label: 'Chat',
      width: '5%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'creator',
      label: 'Creator',
      width: '25%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: '',
      label: '',
      width: '30%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: '',
      label: '',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: '',
      label: '',
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    ...(!folderPath.some((folder) => folder.name === 'System')
      ? [
          {
            id: '',
            label: '',
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),
  ];

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 50,
    initialPage: 0,
    defaultOrderBy: 'created',
    defaultOrder: 'asc',
  });
  const STATUS_TABS = [
    { value: 'all', label: t('files.tabs.all') },
    { value: 'my', label: t('files.tabs.my') },
    { value: 'shared', label: t('files.tabs.shared') },
    // { value: 'starred', label: t('files.tabs.starred')  },
  ];
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const { zetaUser } = useAuthContext();
  const { usersList, usersListLoading, usersListError, usersListValidating, usersListEmpty } =
    getUser();
  const currentPageForApi = table.page + 1;
  const currentPageSize = table.rowsPerPage;
  const getFileParams = {
    pagination: {
      pageNumber: currentPageForApi,
      pageSize: currentPageSize,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
  };
  if (isProject && !currentFolderId) {
    getFileParams.entityType = 7;
    getFileParams.entityId = projectRootFolderId;
  }

  if (isClient && !currentFolderId) {
    if (isClientView) {
      getFileParams.entityType = 7; //Client
    } else {
      getFileParams.entityType = 7; //Vendor
    }
    getFileParams.entityId = clientRootFolderId;
  }
  if (isLead && !currentFolderId) {
    if (isClientView) {
      getFileParams.entityType = 7; //Lead
    } else {
      getFileParams.entityType = 7; //Contract
    }
    getFileParams.entityId = leadRootFolderId;
  }
  if (currentFolderId) {
    getFileParams.entityType = 7;
    getFileParams.entityId = currentFolderId;
  }
  if (currentFolderName === 'My shares') {
    getFileParams.entityType = 9;
    getFileParams.entityId = null;
  }

  const { fileList, fileListLoading, fileListError, fileListValidating, fileListEmpty, mutate } =
    getFiles(getFileParams);
  const router = useRouter();
  const confirm = useBoolean();
  const [viewMembersDialog, setViewMembersDialog] = useState(false);
  const [viewedPersons, setViewedPersons] = useState([]);
  const [fileCreator, setFileCreator] = useState();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMode, setFileMode] = useState('view');
  const [isProjectDisabled, setIsProjectDisabled] = useState(false);
  const [isClientDisabled, setIsClientDisabled] = useState(false);
  const filters = useSetState({
    name: '',
    type: [],
    projectName: '',
    clientName: '',
    startDate: null,
    endDate: null,
    status: '',
  });

  const openDateRange = useBoolean();
  const [uploading, setUploading] = useState(false);
  const allowedFileTypes = [
    'doc',
    'pdf',
    'xls',
    'xlsx',
    'docx',
    'zip',
    'jpeg',
    'jpg',
    'png',
    'webp',
    'txt',
    'm4v',
    'mp4',
    'mp4v',
    'm4a',
    'wav',
    'mp3',
    'mov',
    'ogg',
    'mpeg',
    'mpg',
    'mpe',
    'mpa',
    'mpv2',
  ];
  const [view, setView] = useState('list');
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    if (Array.isArray(mock_data)) {
      setTableData(mock_data);
    }
  }, [mock_data]);

  console.log('this is the fileList', tableData);

  const [vendorParentFolderId, setVendorParentFolderId] = useState(null);
  const [projectParentFolderId, setProjectParentFolderId] = useState(null);

  const [clientParentFolderId, setClientParentFolderId] = useState(null);
  const [leadParentFolderId, setLeadParentFolderId] = useState(null);
  const [contractParentFolderId, setContractParentFolderId] = useState(null);
  const sharedFolder = {
    id: uuidv4(),
    name: 'My shares',
    isFile: false,
    mimeType: null,
    size: null,
    url: null,
    path: null,
    type: 1,
    parentFolderId: null,
    creatorId: 'c1bef256-02db-443d-8a2e-b78144a57e55',
    creator: {
      serial: 1,
      fullName: 'Admin',
      designation: {
        id: '9bd45caf-0b13-4fc9-b6ca-b731c6f2aa39',
        value: 'Admin',
        localizedStrings: [],
      },
      department: {
        id: '90ad96c3-1e17-4ef6-9caf-b14330f57f9f',
        value: 'Admin',
        localizedStrings: [],
      },
      profileImageUrl: null,
      folderSharePermissionLevel: 0,
    },
    projectId: null,
    project: null,
    milestoneId: null,
    milestone: null,
    clientId: null,
    client: null,
    leadId: null,
    lead: null,
    vendorId: null,
    vendor: null,
    contractId: null,
    contract: null,
    taskId: null,
    task: null,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    subfolders: [],
    shares: [],
  };

  const [newItem, setNewItem] = useState({
    name: '',
    type: 'file', // default to folder
    size: 0,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    members: '',
    projectName: '',
    clientName: '',
    fileObject: null,
    parentId: null, // new field
  });

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const dataFiltered = useMemo(() => {
    return applyFilter({
      inputData: tableData,
      comparator: getComparator(table.order, table.orderBy),
      filters: filters.state,
      dateError,
      currentFolderId, // ✅ Watch for changes
    });
  }, [
    tableData,
    table.order,
    table.orderBy,
    filters.state,
    dateError,
    currentFolderId, // 👈 Add this to re-run on folder change
  ]);

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.type.length > 0 ||
    (!!filters.state.startDate && !!filters.state.endDate) ||
    !!filters.state.projectName ||
    !!filters.state.clientName;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) setView(newView);
  }, []);

  const handleDeleteRow = async (id) => {
    if (id) {
      try {
        const response = await deleteFile(id);
        if (response.success) {
          await mutate();
          toast.success('Deleted Successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };
  const handleDelete = () => {
    onDelete(file.id); // This should trigger the deletion logic from the parent
  };
  const handleDeleteFile = async (fileId) => {
    if (fileId) {
      try {
        const response = await deleteFile(fileId);
        if (response.success) {
          await mutate();
          toast.success('Deleted Successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleEditRow = useCallback((row) => {
    setNewItem({ ...row });

    const firstMember =
      Array.isArray(row.members) && row.members.length > 0 ? row.members[0] : null;
    setSelectedPersons(firstMember);

    setFileMode('edit');
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = _fmProjects.filter((proj) =>
    proj.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [clientSearch, setClientSearch] = useState('');
  const filteredClients = _fmClients.filter((client) =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );
  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );
  const [members, setMembers] = useState(false); // for dialog open
  const [selectedPersons, setSelectedPersons] = useState(null); // for selected users

  console.log('this is the selected persons', selectedPersons);
  const handleMemberDialogClose = () => setMembers(false);

  const handleTogglePerson = (person) => {
    setSelectedPersons((prev) => (prev?.id === person.id ? null : person));
  };

  const handleToggleStar = useCallback(
    (id) => {
      const updatedData = tableData.map((file) =>
        file.id === id ? { ...file, starred: !file.starred } : file
      );
      setTableData(updatedData);
      toast.success(t('files.toast.star_updated'));
    },
    [tableData]
  );

  // When a folder is clicked in the table
  const handleOpenFolderInTable = (folderToOpen) => {
    console.log('this is the folder to open', folderToOpen);
    if (folderToOpen && !folderToOpen.isFile) {
      setFolderPath((prevPath) => [...prevPath, folderToOpen]);
      setCurrentFolderId(folderToOpen.id);
      setCurrentFolderName(folderToOpen.name);
      setCurrentFolderParentId(folderToOpen.parentFolderId);
      if (folderToOpen.name === 'System' || !folderToOpen.parentFolderId) {
        setIsRootSystemFolder(true);
      }
    }
  };
  console.log('this is the current folder name', currentFolderName);

  // When a breadcrumb item or the "Back" button is clicked
  const handleNavigateBreadcrumb = (targetFolderId, indexInPath) => {
    if (targetFolderId === null) {
      // Navigate to root
      setFolderPath([]);
      setCurrentFolderId(null);
      setCurrentFolderName(''); // Reset folder name
      setCurrentFolderParentId(null); // Reset parent ID
      setIsRootSystemFolder(false); // Reset root system folder flag
    } else {
      const newPath = folderPath.slice(0, indexInPath + 1);
      const navigatedToFolder = newPath[newPath.length - 1];

      setFolderPath(newPath);
      setCurrentFolderId(navigatedToFolder.id);
      setCurrentFolderName(navigatedToFolder.name); // Update folder name
      setCurrentFolderParentId(navigatedToFolder.parentFolderId); // Update parent ID

      // Update isRootSystemFolder based on the folder navigated to
      if (navigatedToFolder.name === 'System' || !navigatedToFolder.parentFolderId) {
        setIsRootSystemFolder(true);
      } else {
        setIsRootSystemFolder(false);
      }
    }
  };

  const [mode, setMode] = useState('add');
  const isFileMangerView = true;

  const [variant, setVariant] = useState('General');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');

  const [missionName, setMissionsName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [businessLead, setBusinessLead] = useState('');
  const [contract, setContract] = useState('');

  const [details, setDetails] = useState(false);
  const handleOpenDetails = () => {
    setDetails(true);
  };
  const handleDetailsDialogClose = () => {
    setTimeout(() => {
      setDetails(false);
    }, 100);
  };
  const addNewDetails = (details) => {
    details.variant = variant;
    details.projectName = projectName;
    details.clientName = clientName;
    details.vendorName = vendorName;
    details.businessLead = businessLead;
    details.missionName = missionName;
    details.contract = contract;
    details.projectParentFolderId = projectParentFolderId;
    details.clientParentFolderId = clientParentFolderId;
    details.vendorParentFolderId = vendorParentFolderId;
    details.leadParentFolderId = leadParentFolderId;
    details.contractParentFolderId = contractParentFolderId;
  };

  const handleFileUpload = async () => {
    if (!newItem.name && newItem.type === 'folder') {
      toast.error(t('files.toast.folder_name_is_required'));
      return;
    }

    const itemToSave = {
      ...newItem,
      members: selectedPersons,
      modifiedAt: new Date().toISOString(),
      parentId: currentFolderId || null,
    };

    if (fileMode === 'edit') {
      // ✅ Update existing item by ID
      setTableData((prev) => prev.map((item) => (item.id === itemToSave.id ? itemToSave : item)));
      toast.error(t('files.toast.update_success'));
    } else {
      // ✅ Add new item with unique ID
      // itemToSave.id = Date.now();
      // setTableData((prev) => [itemToSave, ...prev]);
      // toast.success(
      //   `${itemToSave.type === 'folder' ? t('files.labels.folders') : t('files.labels.files')} added!`
      // );
      const payload = {
        name: newItem.name,
        // parentFolderId: null,
        // entityType: 0,
        // entityId: '',
        members: [
          ...selectedPersons?.map((person) => ({
            id: person.id,
            folderSharePermissionLevel: person.sharePermission ? 1 : 0,
          })),
        ],
      };
      if (newItem?.type === 'file') {
        payload.file = newItem.fileObject;
        payload.name = `UploadedFile_${Date.now()}`;
      }
      if (variant === 'Project') {
        payload.entityType = 1;
        payload.entityId = projectName;
        if (!currentFolderId) {
          payload.parentFolderId = projectParentFolderId;
        }
      }
      if (isProject) {
        payload.entityType = 1;
        payload.entityId = projectId;
        if (!currentFolderId) {
          payload.parentFolderId = projectRootFolderId;
        }
      }
      if (isClient) {
        if (isClientView) {
          payload.entityType = 3; //Client
        } else {
          payload.entityType = 5; //Vendor
        }
        payload.entityId = clientId;
        if (!currentFolderId) {
          payload.parentFolderId = clientRootFolderId;
        }
      }
      if (isLead) {
        if (isClientView) {
          payload.entityType = 4; //Lead
        } else {
          payload.entityType = 6; //Contract
        }
        payload.entityId = leadId;
        if (!currentFolderId) {
          payload.parentFolderId = leadRootFolderId;
        }
      } else if (variant === 'Mission') {
        payload.entityType = 1;
        payload.entityId = missionName;
        if (!currentFolderId) {
          payload.parentFolderId = projectParentFolderId;
        }
      } else if (variant === 'Client' && !businessLead) {
        payload.entityType = 3; //Client
        payload.entityId = clientName;
        if (!currentFolderId) {
          payload.parentFolderId = clientParentFolderId;
        }
      } else if (variant === 'Client' && businessLead) {
        payload.entityType = 4; //Lead
        payload.entityId = businessLead;
        if (!currentFolderId) {
          payload.parentFolderId = leadParentFolderId;
        }
      } else if (variant === 'Vendor' && !contract) {
        payload.entityType = 5; //Vendor
        payload.entityId = vendorName;
        if (!currentFolderId) {
          payload.parentFolderId = vendorParentFolderId;
        }
      } else if (variant === 'Vendor' && contract) {
        payload.entityType = 6;
        payload.entityId = contract; //Contract
        if (!currentFolderId) {
          payload.parentFolderId = contractParentFolderId;
        }
      }
      if (currentFolderId) {
        payload.parentFolderId = currentFolderId;
      }

      console.log('this is the payload', payload);
      try {
        const response = await addFile(payload);
        if (response.success) {
          toast.success('Folder created successfully');
          setVariant('General');
          setProjectName('');
          setClientName('');
          setMissionsName('');
          setVendorName('');
          setBusinessLead('');
          setContract('');
          await mutate();
        } else {
          toast.error(response.error);
          console.error('Upload error:', response.error);
        }
      } catch (error) {
        console.error('Add file failed:', error);
        toast.error('An unexpected error occurred.');
      }
    }

    // ✅ Reset form (reset both project and client)
    setNewItem({
      name: '',
      type: 'file', // Reset to default
      size: 0,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      members: '',
      projectName: '', // Reset project field
      clientName: '', // Reset client field
      fileObject: null,
      parentId: currentFolderId || null,
    });

    setSelectedPersons(null); // Reset members selection
    setFileMode('view'); // Switch to view fileMode

    // ✅ Re-enable dropdowns for project and client
    setIsClientDisabled(false);
    setIsProjectDisabled(false);
  };
  const renderView = (
    <>
      {/* <CustomBreadcrumbs heading="Workflow Files" links={[]} sx={{ mb: 2 }} /> */}

      {!isDetailsView &&
        (isMainView ? (
          <CustomBreadcrumbs
            heading="Workflow Files"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Workflow', href: paths.dashboard.workflow.root },
              { name: 'Workflow Files' },
            ]}
            sx={{ mb: 2 }}
          />
        ) : (
          <CustomBreadcrumbs heading="Workflow Files" links={[]} sx={{ mb: 2 }} />
        ))}

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
          <FileManagerTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ projects: _fmProjects, clients: _fmClients }}
            openDateRange={openDateRange.value}
            onOpenDateRange={openDateRange.onTrue}
            onCloseDateRange={openDateRange.onFalse}
            view={view}
          />
        </Box>

        {canReset && (
          <FileManagerFiltersResult
            filters={filters}
            totalResults={dataFiltered.length}
            onResetPage={table.onResetPage}
            sx={{ px: 2.5, pt: 0, mb: 0.5 }}
            view={view}
          />
        )}
        {currentFolderId && (
          <Box
            sx={{
              p: 1,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                onClick={() => {
                  if (folderPath.length > 0) {
                    const parentIndexInPath = folderPath.length - 2;
                    if (parentIndexInPath >= 0) {
                      handleNavigateBreadcrumb(folderPath[parentIndexInPath].id, parentIndexInPath);
                    } else {
                      handleNavigateBreadcrumb(null, -1); // Back to root
                    }
                  }
                }}
                size="small"
                variant="contained"
                sx={{ cursor: 'pointer', fontWeight: 600, bgcolor: '#006A67' }}
                startIcon={
                  <Iconify
                    icon="eva:arrow-back-fill"
                    sx={{
                      transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                      ...(storedLang === 'ar' && { ml: 1 }),
                    }}
                  />
                }
              >
                {t('files.buttons.back')}
              </Button>
            </Stack>
          </Box>
        )}

        {view === 'list' && (
          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title={t('files.tooltip.delete')}>
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
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

                <TableBody>
                  {!isMainView && (
                    <TableRow>
                      <TableCell
                        sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: 'inherit',
                          '&:hover': {
                            backgroundColor: 'rgba(0,106,103,0.08)',
                          },
                          borderRight: '1px dotted rgba(200,200,200,0.6)',
                          ...(storedLang === 'ar' && {
                            borderLeft: '1px dotted rgba(200,200,200,0.6)',
                          }),

                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            my: 1,
                            justifyContent: 'space-between',
                          }}
                          gap={1}
                        >
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '100%',
                                my: 1,
                              }}
                            >
                              {zetaUser?.fullName}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                              {newItem.type === 'file' && (
                                <>
                                  <input
                                    id="upload-file-input"
                                    type="file"
                                    hidden
                                    accept={allowedFileTypes.map((ext) => `.${ext}`).join(',')}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      const extension = file.name.split('.').pop()?.toLowerCase();
                                      if (!allowedFileTypes.includes(extension)) {
                                        toast.error(t('files.validations.invalid_type'));
                                        return;
                                      }

                                      setUploading(true);

                                      setTimeout(() => {
                                        setNewItem({
                                          ...newItem,
                                          name: file.name,
                                          type: 'file',
                                          size: file.size,
                                          fileObject: file,
                                          createdAt: new Date().toISOString(),
                                          modifiedAt: new Date(file.lastModified).toISOString(),
                                        });
                                        setUploading(false);
                                      }, 800); // simulate loading
                                    }}
                                  />

                                  <Tooltip title={t('files.tooltip.choose_file')}>
                                    <IconButton
                                      component="label"
                                      htmlFor="upload-file-input"
                                      sx={{
                                        width: 16,
                                        height: 16,
                                      }}
                                    >
                                      <Iconify
                                        icon={
                                          uploading
                                            ? 'line-md:loading-loop'
                                            : 'mdi:clipboard-text-outline'
                                        }
                                        sx={{ color: '#006A67' }}
                                      />
                                    </IconButton>
                                  </Tooltip>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      ml: 1,
                                      '& .MuiInputBase-input': {
                                        padding: '9px 14px',
                                      },
                                      '& .MuiInputLabel-root': {
                                        top: '-5px',
                                        fontSize: '10px',
                                      },
                                    }}
                                  >
                                    {newItem.fileObject?.name || t('files.toast.no_file_chosen')}
                                  </Typography>
                                </>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }} gap={1}>
                              {selectedPersons?.id && (
                                <Tooltip
                                  key={selectedPersons?.id}
                                  title={`${selectedPersons?.fullName}`}
                                  arrow
                                >
                                  <Avatar
                                    key={selectedPersons.id}
                                    alt={selectedPersons.fullName}
                                    src={selectedPersons?.profileImageFileUrl}
                                    sx={{ width: 25, height: 25 }}
                                  >
                                    {!selectedPersons?.profileImageFileUrl &&
                                      selectedPersons?.fullName?.charAt(0).toUpperCase()}
                                  </Avatar>
                                </Tooltip>
                              )}
                              <Tooltip
                                title={
                                  selectedPersons?.id
                                    ? 'Change Member'
                                    : t('files.placeholder.add_members')
                                }
                              >
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setMembers(true);
                                    setMode('add');
                                  }}
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    mt: 1,
                                    bgcolor: '#006A67',
                                    color: 'primary.contrastText',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                    cursor: 'pointer',
                                  }}
                                >
                                  {/* <Iconify icon="mingcute:add-line" width={16} /> */}
                                  <Iconify
                                    icon={
                                      selectedPersons?.id
                                        ? 'mdi:account-edit-outline'
                                        : 'mingcute:add-line'
                                    }
                                    width={16}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <WorkFlowFileMembers
                              open={members}
                              shared={usersList?.users?.filter((user) => user.id !== zetaUser?.id)}
                              selectedPersons={selectedPersons}
                              setSelectedPersons={setSelectedPersons}
                              handleClose={handleMemberDialogClose}
                              onTogglePerson={handleTogglePerson}
                              fileType={newItem.type}
                              mode={mode}
                            />
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Tooltip title="Send">
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
                                disabled={!selectedPersons?.id || !newItem?.fileObject}
                              >
                                Send
                              </Button>
                            </Tooltip>
                            {(selectedPersons?.id || newItem?.fileObject) && (
                              <Tooltip title="Clear Field" arrow>
                                <Iconify
                                  icon="solar:trash-bin-trash-bold"
                                  onClick={() => {
                                    setNewItem({
                                      name: '',
                                      type: 'file',
                                      size: 0,
                                      createdAt: new Date().toISOString(),
                                      modifiedAt: new Date().toISOString(),
                                      members: '',
                                      projectName: '',
                                      clientName: '',
                                      fileObject: null,
                                      parentId: currentFolderId || null,
                                    });
                                    setSelectedPersons(null);
                                    setFileMode('view');
                                  }}
                                  sx={{
                                    cursor: 'pointer',
                                    height: 13,
                                    width: 13,
                                    color: 'error.main',
                                    ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }),
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* {!folderPath.some((folder) => folder.name === 'System') && (
                    <TableRow>
                      <TableCell
                        sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                        align="center"
                      ></TableCell>
                      <TableCell
                        sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                        align="center"
                      ></TableCell>

                      <TableCell sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {newItem.type === 'file' ? (
                            <>
                              <input
                                id="upload-file-input"
                                type="file"
                                hidden
                                accept={allowedFileTypes.map((ext) => `.${ext}`).join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const extension = file.name.split('.').pop()?.toLowerCase();
                                  if (!allowedFileTypes.includes(extension)) {
                                    toast.error(t('files.validations.invalid_type'));
                                    return;
                                  }

                                  setUploading(true);

                                  setTimeout(() => {
                                    setNewItem({
                                      ...newItem,
                                      name: file.name,
                                      type: 'file',
                                      size: file.size,
                                      fileObject: file,
                                      createdAt: new Date().toISOString(),
                                      modifiedAt: new Date(file.lastModified).toISOString(),
                                    });
                                    setUploading(false);
                                  }, 800); // simulate loading
                                }}
                              />

                              <Tooltip title={t('files.tooltip.choose_file')}>
                                <IconButton
                                  component="label"
                                  htmlFor="upload-file-input"
                                  sx={{
                                    bgcolor: '#006A67',
                                    color: '#fff',
                                    width: 28,
                                    height: 28,
                                    '&:hover': {
                                      bgcolor: '#00574f',
                                    },
                                  }}
                                >
                                  <Iconify
                                    icon={uploading ? 'line-md:loading-loop' : 'mingcute:add-line'}
                                  />
                                </IconButton>
                              </Tooltip>

                              <Typography
                                variant="caption"
                                sx={{
                                  ml: 1,
                                  '& .MuiInputBase-input': {
                                    padding: '9px 14px',
                                  },
                                  '& .MuiInputLabel-root': {
                                    top: '-5px',
                                    fontSize: '10px',
                                  },
                                }}
                              >
                                {newItem.fileObject?.name || t('files.toast.no_file_chosen')}
                              </Typography>
                            </>
                          ) : (
                            <TextField
                              fullWidth
                              placeholder={t('files.placeholder.foldername')}
                              size="small"
                              value={newItem.name}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  name: e.target.value,
                                  size: 0,
                                  type: 'file',
                                })
                              }
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
                          )}
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {selectedPersons && (
                            <AvatarGroup sx={{ cursor: 'pointer' }}>
                              <Tooltip title={selectedPersons?.fullName} arrow>
                                <Avatar
                                  alt={selectedPersons?.fullName}
                                  src={selectedPersons?.profileImageFileUrl}
                                  sx={{ width: 25, height: 25 }}
                                >
                                  {!selectedPersons?.profileImageFileUrl &&
                                    selectedPersons?.fullName?.charAt(0).toUpperCase()}
                                </Avatar>
                              </Tooltip>
                            </AvatarGroup>
                          )}

                          <Tooltip title={t('files.placeholder.add_members')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setMembers(true);
                                setMode('add');
                              }}
                              sx={{
                                width: 20,
                                height: 20,
                                mt: 1,
                                ml: 2,
                                bgcolor: '#006A67',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                                cursor: 'pointer',
                              }}
                            >
                              <Iconify icon="mingcute:add-line" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <WorkFlowFileMembers
                          open={members}
                          shared={
                            mode === 'share'
                              ? usersList?.users?.filter(
                                  (user) =>
                                    user.id !== zetaUser?.id &&
                                    (!selectedRowMembers ||
                                      !selectedRowMembers.some(
                                        (member) => member.sharedWithUserId === user.id
                                      ))
                                )
                              : usersList?.users?.filter((user) => user.id !== zetaUser?.id)
                          }
                          selectedPersons={selectedPersons}
                          setSelectedPersons={setSelectedPersons}
                          handleClose={handleMemberDialogClose}
                          onTogglePerson={handleTogglePerson}
                          fileType={newItem.type}
                          mode={mode}
                          selectedRowId={selectedRowId}
                          mutateFiles={mutate}
                        />
                      </TableCell>

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
                          }}
                        >
                          <Tooltip
                            title={
                              fileMode === 'edit'
                                ? t('files.buttons.update_file/folder')
                                : t('files.buttons.addfile/folder')
                            }
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                handleFileUpload();
                              }}
                              size="small"
                              sx={{
                                bgcolor: '#006A67',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                                textTransform: 'none',
                                padding: '6px 12px',
                                alignItems: 'center',
                              }}
                            >
                              {fileMode === 'edit' ? t('files.buttons.update') : 'Send'}
                            </Button>
                          </Tooltip>
                          <Tooltip title={t('files.tooltip.clear_all')} arrow>
                            <Iconify
                              icon="solar:trash-bin-trash-bold"
                              onClick={() => {
                                setNewItem({
                                  name: '',
                                  type: 'file',
                                  size: 0,
                                  createdAt: new Date().toISOString(),
                                  modifiedAt: new Date().toISOString(),
                                  members: '',
                                  projectName: '',
                                  clientName: '',
                                  fileObject: null,
                                  parentId: currentFolderId || null,
                                });
                                setSelectedPersons(null);
                                setFileMode('view');
                                setIsClientDisabled(false); // ✅ re-enable client dropdown
                                setIsProjectDisabled(false); // ✅ re-enable project dropdown
                              }}
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
                  )} */}
                  {currentFolderName === 'System' && !currentFolderParentId && (
                    <FileSharedTableRow
                      key={sharedFolder.id}
                      row={sharedFolder}
                      onDeleteRow={() => handleDeleteRow(sharedFolder.id)}
                      onEditRow={() => handleEditRow(sharedFolder)}
                      // pass the full row

                      onOpenFolder={(folderObject) => handleOpenFolderInTable(folderObject)}
                      onUploadFile={() => {}}
                      onClickFile={(file) => {
                        setSelectedFile(file);
                        setDetailsOpen(true);
                      }}
                      onUpdateShare={(updatedRow) => {
                        setTableData((prev) =>
                          prev.map((item) => (item.id === updatedRow.id ? updatedRow : item))
                        );
                      }}
                      onToggleStar={handleToggleStar}
                      onViewMembers={(members, creator) => {
                        console.log('this is the members', members);
                        setViewedPersons(members);
                        setFileCreator(creator);
                        setViewMembersDialog(true);
                      }}
                      isProject={isProject}
                      isClient={isClient}
                      isLead={isLead}
                      currentFolderId={currentFolderId}
                      setCurrentFolderName={setCurrentFolderName}
                      setMembers={setMembers}
                      setMode={setMode}
                      folderPath={folderPath}
                      sharedFolder={sharedFolder}
                    />
                  )}
                  {dataFiltered
                    .filter((row) => row.name !== 'System' && row.isFile !== false)
                    .map((row, index) => (
                      <WorkFlowFileTableRow
                        key={row.id}
                        row={row}
                        index={index + table.page * table.rowsPerPage}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row)}
                        // pass the full row

                        onOpenFolder={(folderObject) => handleOpenFolderInTable(folderObject)}
                        onUploadFile={() => {}}
                        onClickFile={(file) => {
                          setSelectedFile(file);
                          setDetailsOpen(true);
                        }}
                        onUpdateShare={(updatedRow) => {
                          setTableData((prev) =>
                            prev.map((item) => (item.id === updatedRow.id ? updatedRow : item))
                          );
                        }}
                        onToggleStar={handleToggleStar}
                        onViewMembers={(members, creator) => {
                          console.log('this is the members', members);
                          setViewedPersons(members);
                          setFileCreator(creator);
                          setViewMembersDialog(true);
                        }}
                        isProject={isProject}
                        isClient={isClient}
                        isLead={isLead}
                        currentFolderId={currentFolderId}
                        setCurrentFolderName={setCurrentFolderName}
                        setMembers={setMembers}
                        setMode={setMode}
                        folderPath={folderPath}
                        sharedFolder={sharedFolder}
                        setSelectedRowId={setSelectedRowId}
                        setSelectedRowMembers={setSelectedRowMembers}
                        allowedFileTypes={allowedFileTypes}
                        setTableData={setTableData}
                        isMainView={isMainView}
                      />
                    ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>
        )}

        {view === 'list' && (
          <TablePaginationCustom
            page={table.page}
            rowsPerPageOptions={[50, 100, 150]}
            dense={table.dense}
            count={fileList.totalFiles}
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
        )}
      </Card>

      <FileDetailsDrawer
        file={selectedFile}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onDelete={(id) => handleDeleteFile(id)}
        onUpdateShare={(updatedFile) => {
          setTableData((prev) =>
            prev.map((item) => (item.id === updatedFile.id ? updatedFile : item))
          );
          setSelectedFile(updatedFile); // ✅ update drawer content too
        }}
        setMembers={setMembers}
        setMode={setMode}
      />

      <Dialog
        fullWidth
        maxWidth="md"
        open={viewMembersDialog}
        onClose={() => setViewMembersDialog(false)}
      >
        <DialogTitle>{t('files.labels.members')}</DialogTitle>
        <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
                borderRadius: 1,
                width: '100%',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <Avatar
                alt={fileCreator?.fullName}
                src={fileCreator?.profileImageUrl || fileCreator?.fullName?.charAt(0).toUpperCase()}
                sx={{ width: 56, height: 56, mb: 1 }}
              />

              <Typography
                variant="subtitle1"
                fontWeight="bold"
                noWrap
                sx={{
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {fileCreator?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Designation: {fileCreator?.designation?.value || 'Not Available'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Department: {fileCreator?.department?.value || 'Not Available'}
              </Typography>
            </Box>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 2,
                listStyle: 'none',
                p: 0,
                m: 0,
                pb: 1,
              }}
            >
              {viewedPersons.map((member) => (
                <Card
                  key={member.id}
                  sx={{
                    width: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    alt={member.sharedWithUser.fullName}
                    src={
                      member.sharedWithUser.profileImageUrl ||
                      member?.sharedWithUser.fullName?.charAt(0).toUpperCase()
                    }
                    sx={{ width: 56, height: 56, mb: 1 }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    noWrap
                    sx={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {member.sharedWithUser.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Designation: {member.sharedWithUser.designation?.value || 'Not Available'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Department : {member.sharedWithUser.department?.value || 'Not Available'}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
        </Scrollbar>
        <DialogActions>
          <Button variant="contained" onClick={() => setViewMembersDialog(false)}>
            {t('files.buttons.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  if (fileListLoading)
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
  if (fileListError) {
    return <ErrorView errorCode={fileListError} />;
  }
  return (
    <>
      {isMainView ? <DashboardContent>{renderView}</DashboardContent> : <>{renderView}</>}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('files.dialog.delete_title')}
        content={
          <span>
            {t('files.dialog.delete_content')}
            <strong>{table.selected.length}</strong> {t('files.dialog.items')}
          </span>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            {t('files.dialog.delete_title')}
          </Button>
        }
      />
    </>
  );
}

function applyFilter({ inputData = [], comparator, filters, dateError, currentFolderId }) {
  const { name, type, startDate, endDate, projectName, clientName, status } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (file) =>
        file.name?.toLowerCase().includes(name.toLowerCase()) ||
        file.path?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (projectName) {
    inputData = inputData.filter((file) => file.projectName === projectName);
  }

  if (clientName) {
    inputData = inputData.filter((file) => file.clientName === clientName);
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(fileFormat(file.type)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      const startOfDay = dayjs(startDate).startOf('day');
      const endOfDay = dayjs(endDate).endOf('day');

      inputData = inputData.filter((file) => {
        const fileDate = dayjs(file.created);
        return fileDate.isBetween(startOfDay, endOfDay, null, '[]');
      });
    }
  }

  return inputData;
}
