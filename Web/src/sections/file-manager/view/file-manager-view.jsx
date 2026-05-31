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
import { FileManagerTableToolbar } from '../file-manager-table-toolbar';
import { FileManagerFiltersResult } from '../file-manager-filters-result';
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
import { _fmProjects, _allFiles, _fmMembers, _fmClients } from '../file-manager-mock-data';
import { fileFormat } from 'src/components/file-thumbnail';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';
import { toast } from 'src/components/snackbar';
import { varAlpha } from 'src/theme/styles';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { useTheme, useMediaQuery, Typography } from '@mui/material';
import { FileManagerTableRow } from '../file-manager-table-row';
import { FileSharedTableRow } from '../file-shared-table-row';
import { TextField, MenuItem } from '@mui/material';
import { FileManagerMembers } from '../file-manager-members'; // adjust the path as needed
import { useTranslation } from 'react-i18next';
import FileDetailsDrawer from '../file-manager-file-details';
import { addFile, getFiles, deleteFile } from 'src/actions/file/fileActions';
import { useAuthContext } from 'src/auth/hooks';
import { getUser } from 'src/actions/userManage/userManageActions';
import { AddFileDetails } from '../add-file-details';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';
import { v4 as uuidv4 } from 'uuid';
import CircularProgress from '@mui/material/CircularProgress';
import { RepositoryFileDialog } from '../repository-file-dialog';

export function FileManagerView({
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
}) {
  const { t, i18n } = useTranslation('dashboard/files');
  const storedLang = localStorage.getItem('selectedLang');

  const { user } = useMockedUser();

  const [currentFolderId, setCurrentFolderId] = useState(null);

  const [currentFolderParentId, setCurrentFolderParentId] = useState(null);
  const [fileSourceOpen, setFileSourceOpen] = useState(false);
  const [repositoryDialogOpen, setRepositoryDialogOpen] = useState(false);
  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  console.log('this is the current folder id', currentFolderId);
  const [folderPath, setFolderPath] = useState([]);
  const [currentFolderName, setCurrentFolderName] = useState('');

  const [isRootSystemFolder, setIsRootSystemFolder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState('');
  const [selectedRowMembers, setSelectedRowMembers] = useState(null);
  const protectedFolders = ['Application', 'BIN', 'Files & Folders'];
  const mySharedFolders = ['Shared Files', 'Deleted Items'];
  const isMySharesFolder = (name) => mySharedFolders.includes(name || '');

  const isProtectedFolder = (name) => protectedFolders.includes(name || '');

  const isInsideProtectedFolder =
    folderPath.some((folder) => isProtectedFolder(folder.name)) &&
    ((folderPath?.length <= 2 && folderPath[1]?.name !== 'Chat') ||
      (folderPath?.length <= 1 && folderPath[1]?.name === 'Chat'));

  const isInsideMySharesFolder = folderPath.some((folder) => isMySharesFolder(folder.name));

  const [isDragging, setIsDragging] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [showDeviceDrop, setShowDeviceDrop] = useState(false);
  const [mode, setMode] = useState('');

  const [selected, setSelected] = useState(mode == 'add' ? 'share' : null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  useEffect(() => {
    if (mode === 'add') {
      setSelected('share');
    }
  }, [mode]);
  const validateUploadFile = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedFileTypes.includes(extension)) {
      toast.warning(`Invalid file type: ${file.name}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.warning(`${file.name} must be ${MAX_FILE_SIZE_MB} MB or less.`);
      return false;
    }

    return true;
  };
  const getBaseUploadPayload = () => {
    const payload = {};

    if (isProject) {
      payload.entityType = 1;
      payload.entityId = projectId;
      payload.parentFolderId = currentFolderId || projectRootFolderId;
    } else if (isClient) {
      payload.entityType = isClientView ? 3 : 5;
      payload.entityId = clientId;
      payload.parentFolderId = currentFolderId || clientRootFolderId;
    } else if (isLead) {
      payload.entityType = isClientView ? 4 : 6;
      payload.entityId = leadId;
      payload.parentFolderId = currentFolderId || leadRootFolderId;
    } else {
      payload.entityType = 0;
      payload.parentFolderId = currentFolderId || null;
    }

    return payload;
  };

  const uploadSingleFile = async (file, parentFolderId) => {
    try {
      if (!validateUploadFile(file)) {
        return { success: false };
      }

      const payload = {
        ...getBaseUploadPayload(),
        name: file.name,
        file,
        parentFolderId,
        members:
          selected === 'select'
            ? selectedPersons.map((person) => ({
                id: person.id,
                folderSharePermissionLevel: person.sharePermission ? 1 : 0,
              }))
            : [],
      };

      const response = await Promise.race([
        addFile(payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), 30000)),
      ]);

      if (response?.success) {
        return { success: true };
      }

      toast.error(response?.error || `Failed to upload ${file.name}`);

      return { success: false };
    } catch (error) {
      console.error('Upload failed:', error);

      toast.error(
        error?.message === 'Upload timeout'
          ? `${file.name} upload timed out`
          : `Failed to upload ${file.name}`
      );

      return { success: false };
    }
  };

  const readAllEntries = async (dataTransferItems, dataTransferFiles) => {
    const files = [];
    const addedKeys = new Set();

    const addFile = (file, relativePath) => {
      const key = `${relativePath}-${file.size}-${file.lastModified}`;

      if (!addedKeys.has(key)) {
        addedKeys.add(key);
        files.push({ file, relativePath });
      }
    };

    const readDirectoryEntries = async (reader) => {
      const allEntries = [];

      while (true) {
        const entries = await new Promise((resolve) => reader.readEntries(resolve));
        if (!entries.length) break;
        allEntries.push(...entries);
      }

      return allEntries;
    };

    const readEntry = async (entry, path = '') => {
      if (entry.isFile) {
        await new Promise((resolve) => {
          entry.file((file) => {
            addFile(file, `${path}${file.name}`);
            resolve();
          });
        });
        return;
      }

      if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await readDirectoryEntries(reader);

        for (const childEntry of entries) {
          await readEntry(childEntry, `${path}${entry.name}/`);
        }
      }
    };

    for (const item of Array.from(dataTransferItems || [])) {
      const entry = item.webkitGetAsEntry?.();

      if (entry) {
        await readEntry(entry);
      } else {
        const file = item.getAsFile?.();
        if (file) addFile(file, file.name);
      }
    }

    // Important fallback for multiple selected files
    for (const file of Array.from(dataTransferFiles || [])) {
      addFile(file, file.webkitRelativePath || file.name);
    }

    return files;
  };
  const uploadNestedFiles = async (items, fileList, emptyMessage = 'No files found.') => {
    if (bulkUploading) return;

    try {
      setBulkUploading(true);

      const parentFolderId =
        currentFolderId || projectRootFolderId || clientRootFolderId || leadRootFolderId || null;

      const files = await readAllEntries(items, fileList);

      console.log('FILES TO UPLOAD:', files);

      if (!files.length) {
        toast.warning(emptyMessage);
        return;
      }

      const folderIdMap = new Map();
      let uploadedCount = 0;

      for (const item of files) {
        const parts = item.relativePath.split('/').filter(Boolean);

        let activeParentId = parentFolderId;
        let folderPathKey = '';

        for (let i = 0; i < parts.length - 1; i++) {
          const folderName = parts[i];
          folderPathKey = folderPathKey ? `${folderPathKey}/${folderName}` : folderName;

          if (!folderIdMap.has(folderPathKey)) {
            const folderResponse = await createFolder(folderName, activeParentId);

            if (!folderResponse?.success) {
              toast.error(folderResponse?.error || `Failed to create folder ${folderName}`);
              break;
            }

            const createdFolderId =
              folderResponse?.response?.data?.successStatus?.id ||
              folderResponse?.data?.successStatus?.id ||
              folderResponse?.successStatus?.id;

            if (!createdFolderId) {
              toast.error(`Folder created but ID missing for ${folderName}`);
              break;
            }

            folderIdMap.set(folderPathKey, createdFolderId);
          }

          activeParentId = folderIdMap.get(folderPathKey);
        }

        const result = await uploadSingleFile(item.file, activeParentId);

        if (result?.success) uploadedCount++;
      }

      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} file(s) uploaded successfully`);
        await mutate();
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      toast.error('Failed to upload copied file/folder');
    } finally {
      setBulkUploading(false);
      setIsDragging(false);
    }
  };
  const handleDropFiles = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await uploadNestedFiles(
      event.dataTransfer.items,
      event.dataTransfer.files,
      'No files found in the dropped item.'
    );
  };
  const handlePasteFiles = useCallback(
    async (event) => {
      const items = event.clipboardData?.items;

      if (!items?.length || bulkUploading) return;

      const hasFiles = Array.from(items).some(
        (item) => item.kind === 'file' || item.webkitGetAsEntry?.()
      );

      if (!hasFiles) return;

      event.preventDefault();
      await uploadNestedFiles(
        event.clipboardData.items,
        event.clipboardData.files,
        'No files found in copied item.'
      );
    },
    [
      bulkUploading,
      currentFolderId,
      projectRootFolderId,
      clientRootFolderId,
      leadRootFolderId,
      selected,
      selectedPersons,
    ]
  );
  useEffect(() => {
    window.addEventListener('paste', handlePasteFiles);

    return () => {
      window.removeEventListener('paste', handlePasteFiles);
    };
  }, [handlePasteFiles]);
  const createFolder = async (folderName, parentFolderId) => {
    const payload = {
      ...getBaseUploadPayload(),
      name: folderName,
      parentFolderId,
      members:
        selected === 'select'
          ? selectedPersons.map((person) => ({
              id: person.id,
              folderSharePermissionLevel: person.sharePermission ? 1 : 0,
            }))
          : [],
    };

    return addFile(payload);
  };
  const handleSelectRepositoryFiles = (selectedFiles) => {
    const mappedFiles = selectedFiles.map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size || 0,
      type: file.mimeType,
      preview: file.url,
      url: file.url,
      isRepositoryFile: true,
    }));

    setNewItem((prev) => {
      const existingFiles = Array.isArray(prev.fileObject)
        ? prev.fileObject
        : prev.fileObject
          ? [prev.fileObject]
          : [];

      const mergedFiles = [...existingFiles, ...mappedFiles];

      const uniqueFiles = mergedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => (f.id && f.id === file.id) || f.name === file.name)
      );

      return {
        ...prev,
        type: 'file',
        name:
          uniqueFiles.length === 1 ? uniqueFiles[0].name : `${uniqueFiles.length} files selected`,
        size: uniqueFiles.reduce((total, file) => total + Number(file.size || 0), 0),
        fileObject: uniqueFiles,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
    });
  };
  const handleDeviceFilesSelect = (files) => {
    const selectedFiles = Array.from(files || []);

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter(validateUploadFile);

    if (!validFiles.length) return;

    setNewItem((prev) => {
      const existingFiles = Array.isArray(prev.fileObject)
        ? prev.fileObject
        : prev.fileObject
          ? [prev.fileObject]
          : [];

      const mergedFiles = [...existingFiles, ...validFiles];

      const uniqueFiles = mergedFiles.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name && f.size === file.size)
      );

      return {
        ...prev,
        name:
          uniqueFiles.length === 1 ? uniqueFiles[0].name : `${uniqueFiles.length} files selected`,
        type: 'file',
        size: uniqueFiles.reduce((total, file) => total + file.size, 0),
        fileObject: uniqueFiles,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
    });

    // setFileSourceOpen(false);
    // setShowDeviceDrop(false);
  };
  const TABLE_HEAD = [
    { id: 'serialNo', label: t('files.labels.serial_no'), width: '5%', align: 'center' },
    {
      id: 'created',
      label: t('files.labels.creators'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'isFile',
      label: t('files.labels.type'),
      width: '10%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },

    {
      id: 'name',
      label: t('files.labels.name'),
      width: '40%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    {
      id: 'members',
      label: t('files.labels.members'),
      width: '12%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'details', label: 'Details', width: '10%' },
    ...(!isProject && !isClient && !isLead && !currentFolderId
      ? [
          {
            id: 'details',
            label: t('files.labels.details'),
            width: '10%',
            align: storedLang === 'ar' ? 'right' : 'left',
          },
        ]
      : []),

    // { id: 'clientName', label: t('files.labels.client'), width: '10%' },
    {
      id: 'size',
      label: t('files.labels.size'),
      width: '8%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: 'type', label: t('files.labels.type'), width: '8%' },
    {
      id: 'lastModified',
      label: t('files.labels.modified'),
      width: '15%',
      align: storedLang === 'ar' ? 'right' : 'left',
    },
    // { id: '', label: t('files.labels.actions'), width: '8%' },
    ...(!isInsideProtectedFolder && (folderPath.length > 0 || isProject || isClient || isLead)
      ? [
          {
            id: '',
            label: t('files.labels.actions'),
            width: '8%',
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
    entityType: 0,
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
  if (currentFolderName === 'Shared Files') {
    getFileParams.entityType = 9;
    getFileParams.entityId = null;
  }
  if (currentFolderName === 'Deleted Items') {
    getFileParams.search = {
      fieldName: 'isDeleted',
      fieldValue: true,
      operator: 0,
      logicOperator: 0,
    };
    getFileParams.entityId = null;
    getFileParams.entityType = 0;
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
    localStorage.removeItem('editorContentDocs');
  }, []);
  useEffect(() => {
    if (fileList && Array.isArray(fileList.files)) {
      setTableData(fileList.files);
    } else if (!fileListLoading) {
      setTableData([]);
    }
  }, [fileList, fileListLoading]);

  console.log('this is the fileList', tableData);

  const [vendorParentFolderId, setVendorParentFolderId] = useState(null);
  const [projectParentFolderId, setProjectParentFolderId] = useState(null);

  const [clientParentFolderId, setClientParentFolderId] = useState(null);
  const [leadParentFolderId, setLeadParentFolderId] = useState(null);
  const [contractParentFolderId, setContractParentFolderId] = useState(null);
  const sharedFolder = {
    id: 'my-shares',
    name: 'Shared Files',
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
  const deletedFolder = {
    id: 'deleted-items',
    name: 'Deleted Items',
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
    type: 'folder', // default to folder
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

  const displayData = useMemo(() => {
    if (!isProject && !isClient && !isLead && folderPath.length === 0) {
      return [sharedFolder, ...dataFiltered, deletedFolder];
    }

    return dataFiltered;
  }, [dataFiltered, isProject, isClient, isLead, folderPath]);
  const isRootFileManager = !isProject && !isClient && !isLead && folderPath.length === 0;

  const rootFolders = useMemo(() => displayData.filter((item) => !item.isFile), [displayData]);

  const dataInPage = rowInPage(displayData, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.type.length > 0 ||
    (!!filters.state.startDate && !!filters.state.endDate) ||
    !!filters.state.projectName ||
    !!filters.state.clientName;

  const notFound = (!displayData.length && canReset) || !displayData.length;

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
    setNewItem({ ...row }); // sets the row for editing
    setSelectedPersons(row.members || []); // sets existing members
    setFileMode('edit'); // ⬅️ IMPORTANT
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

  const handleMemberDialogClose = () => setMembers(false);

  const handleTogglePerson = (person) => {
    setSelectedPersons((prevSelected) => {
      const exists = prevSelected.some((p) => p.id === person.id);
      if (exists) {
        return prevSelected.filter((p) => p.id !== person.id);
      }

      return [...prevSelected, { ...person, sharePermission: false }];
    });
  };
  const handleToggleSharePermission = (personId, isChecked) => {
    setSelectedPersons((prevSelected) =>
      prevSelected.map((person) =>
        person.id === personId ? { ...person, sharePermission: isChecked } : person
      )
    );
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
      if (isProtectedFolder(folderToOpen.name) || !folderToOpen.parentFolderId) {
        setIsRootSystemFolder(true);
      }
    }
  };
  let sharedUserIds = [];
  console.log('this is the folder path', folderPath);

  const lastFolder = folderPath[folderPath.length - 1];

  if (
    (lastFolder?.name === 'General' && folderPath.length > 1) ||
    (isProject && folderPath.length === 1 && folderPath?.[0].milestoneId) ||
    (isClient && !isClientView && folderPath.length === 1 && folderPath?.[0].contractId) ||
    (isClient && isClientView && folderPath.length === 1 && folderPath?.[0].leadId)
  ) {
    const lastFolderShares = lastFolder?.shares || [];
    sharedUserIds = lastFolderShares.map((s) => s.sharedWithUserId);
  }

  if (folderPath.length >= 1 && lastFolder?.name !== 'General') {
    const lastFolderShares = lastFolder?.shares || [];
    sharedUserIds = lastFolderShares.map((s) => s.sharedWithUserId);
  }

  console.log('this is the last folder sharedUserIds', sharedUserIds);

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
      if (isProtectedFolder(navigatedToFolder.name) || !navigatedToFolder.parentFolderId) {
        setIsRootSystemFolder(true);
      } else {
        setIsRootSystemFolder(false);
      }
    }
  };

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
    if (isSubmitting) return;

    if (!newItem.name && newItem.type === 'folder') {
      toast.error(t('files.toast.folder_name_is_required'));
      return;
    }

    setIsSubmitting(true);

    try {
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

          ...(selected === 'all' && {
            members:
              folderPath.length >= 1
                ? (() => {
                    const lastFolder = folderPath[folderPath.length - 1];

                    if (
                      (lastFolder?.name === 'General' && folderPath.length === 1) ||
                      (isProject && folderPath.length === 1 && folderPath?.[0].milestoneId) ||
                      (isClient &&
                        !isClientView &&
                        folderPath.length === 1 &&
                        folderPath?.[0].contractId) ||
                      (isClient &&
                        isClientView &&
                        folderPath.length === 1 &&
                        folderPath?.[0].leadId)
                    ) {
                      return usersList?.users.map((person) => ({
                        id: person.id,
                        folderSharePermissionLevel: 0,
                      }));
                    }
                    if (folderPath.length > 1) {
                      return usersList?.users
                        ?.filter((user) => sharedUserIds.includes(user.id))
                        .map((person) => ({
                          id: person.id,
                          folderSharePermissionLevel: 0,
                        }));
                    }

                    if (lastFolder?.name !== 'General') {
                      return usersList?.users
                        ?.filter((user) => sharedUserIds.includes(user.id))
                        .map((person) => ({
                          id: person.id,
                          folderSharePermissionLevel: 0,
                        }));
                    }

                    return [];
                  })()
                : usersList?.users
                    ?.filter(
                      (user) =>
                        !selectedRowMembers ||
                        !selectedRowMembers.some((member) => member.sharedWithUserId === user.id)
                    )
                    .map((person) => ({
                      id: person.id,
                      folderSharePermissionLevel: 0,
                    })),
          }),

          ...(selected === 'select' && {
            members: selectedPersons.map((person) => ({
              id: person.id,
              folderSharePermissionLevel: person.sharePermission ? 1 : 0,
            })),
          }),

          ...(selected === 'share' && {
            members: [
              {
                id: zetaUser?.id,
                folderSharePermissionLevel: 0,
              },
            ],
          }),
        };

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

        if (newItem?.type === 'file') {
          const files = Array.isArray(newItem.fileObject)
            ? newItem.fileObject
            : [newItem.fileObject].filter(Boolean);

          if (!files.length) {
            toast.error('Please choose at least one file.');
            return;
          }

          let uploadedCount = 0;

          for (const file of files) {
            const response = await addFile({
              ...payload,
              file,
              name: file.name,
            });

            if (response?.success) {
              uploadedCount++;
            } else {
              toast.error(response?.error || `Failed to upload ${file.name}`);
            }
          }

          if (uploadedCount > 0) {
            toast.success(`${uploadedCount} file(s) uploaded successfully`);
            await mutate();
          }
        } else {
          const response = await addFile(payload);

          if (response?.success) {
            toast.success('Folder created successfully');
            await mutate();
          } else {
            toast.error(response?.error || 'Failed to create folder');
          }
        }

        setVariant('General');
        setProjectName('');
        setClientName('');
        setMissionsName('');
        setVendorName('');
        setBusinessLead('');
        setContract('');
        setSelected('share');
      }
      setNewItem({
        name: '',
        type: 'folder',
        size: 0,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        members: '',
        projectName: '',
        clientName: '',
        fileObject: null,
        parentId: currentFolderId || null,
      });

      setSelectedPersons([]);
      setFileMode('view');
      setIsClientDisabled(false);
      setIsProjectDisabled(false);
    } catch (error) {
      console.error('Add file failed:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredUsers =
    selected === 'all'
      ? folderPath.length >= 1
        ? (() => {
            const lastFolder = folderPath[folderPath.length - 1];

            if (
              (lastFolder?.name === 'General' && folderPath.length === 1) ||
              (isProject && folderPath.length === 1 && folderPath?.[0].milestoneId) ||
              (isClient &&
                !isClientView &&
                folderPath.length === 1 &&
                folderPath?.[0].contractId) ||
              (isClient && isClientView && folderPath.length === 1 && folderPath?.[0].leadId)
            ) {
              return usersList?.users || [];
            }

            if (folderPath.length > 1 || lastFolder?.name !== 'General') {
              return usersList?.users?.filter((user) => sharedUserIds.includes(user.id)) || [];
            }

            return [];
          })()
        : usersList?.users?.filter(
            (user) =>
              user.id !== zetaUser?.id &&
              (!selectedRowMembers ||
                !selectedRowMembers.some((member) => member.sharedWithUserId === user.id))
          ) || []
      : [];
  const isApplicationRootView =
    currentFolderName === 'Application' &&
    folderPath.length === 1 &&
    dataFiltered.every((item) => !item.isFile);
  const renderView = (
    <>
      {!isProject && !isClient && !isLead && (
        <CustomBreadcrumbs
          heading={t('files.custombreads.title')}
          links={[
            { name: t('files.custombreads.dashboard'), href: paths.dashboard.root },
            { name: t('files.custombreads.title'), href: paths.dashboard.fileManager },
            { name: t('files.custombreads.list') },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      )}
      {(isRootFileManager || isApplicationRootView) && (
        <>
          {isApplicationRootView && (
            <Box>
              <Button
                onClick={() => {
                  handleNavigateBreadcrumb(null, -1);
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
            </Box>
          )}
          <Box sx={{ py: 2 }}>
            <Stack direction="column" spacing={1.5} flexWrap="wrap">
              {(isApplicationRootView ? dataFiltered : rootFolders).map((folder) => (
                <Box
                  key={folder.id}
                  onClick={() => {
                    handleOpenFolderInTable(folder);
                  }}
                  sx={{
                    minWidth: 150,
                    p: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      borderColor: '#006A67',
                      bgcolor: 'rgba(0,106,103,0.04)',
                    },
                  }}
                >
                  <FileThumbnail file={{ type: 'folder' }} sx={{ width: 24, height: 24 }} />

                  <Typography variant="subtitle2" noWrap>
                    {folder.name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </>
      )}
      {view === 'list' && !isRootFileManager && !isApplicationRootView && (
        <Card
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            if (bulkUploading) return;
            handleDropFiles(event);
          }}
          sx={{
            position: 'relative',
            border: isDragging ? '2px dashed #006A67' : 'none',
            bgcolor: isDragging ? 'rgba(0, 106, 103, 0.04)' : 'background.paper',
          }}
        >
          {' '}
          {bulkUploading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 20,
                bgcolor: 'rgba(255,255,255,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <CircularProgress size={32} sx={{ color: '#006A67' }} />

              <Typography variant="body2" sx={{ fontWeight: 600, color: '#006A67' }}>
                Uploading file(s), please wait...
              </Typography>
            </Box>
          )}
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
              dateError={dateError}
            />
          </Box>
          {canReset && (
            <FileManagerFiltersResult
              filters={filters}
              totalResults={displayData.length}
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
                {/* <Typography
                variant="body2"
                sx={{ cursor: 'pointer', fontWeight: 600, color: '#006A67' }}
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
              >
                {t('files.buttons.back')}
              </Typography> */}

                <Button
                  onClick={() => {
                    if (folderPath.length > 0) {
                      console.log('this is the folder path', folderPath);
                      const parentIndexInPath = folderPath.length - 2;
                      if (parentIndexInPath >= 0) {
                        handleNavigateBreadcrumb(
                          folderPath[parentIndexInPath].id,
                          parentIndexInPath
                        );
                      } else {
                        handleNavigateBreadcrumb(null, -1); // Back to root
                      }
                    }
                    setSelectedPersons([]);
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

                <div
                  style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}
                >
                  {folderPath.map((folder, idx) => (
                    <Fragment key={folder.id}>
                      {idx !== 0 && (
                        <Typography variant="body2" sx={{ mx: 0.5, color: 'text.secondary' }}>
                          /
                        </Typography>
                      )}

                      <Typography
                        variant="body2"
                        onClick={() => {
                          if (idx < folderPath.length - 1) {
                            handleNavigateBreadcrumb(folder.id, idx);
                          }
                        }}
                        sx={{
                          cursor: idx === folderPath.length - 1 ? 'default' : 'pointer',
                          fontWeight: idx === folderPath.length - 1 ? 'bold' : 500,
                          color: idx === folderPath.length - 1 ? 'text.primary' : '#006A67',
                          '&:hover': {
                            textDecoration: idx === folderPath.length - 1 ? 'none' : 'underline',
                          },
                        }}
                      >
                        {folder.name}
                      </Typography>
                    </Fragment>
                  ))}
                </div>
              </Stack>
            </Box>
          )}
          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={displayData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  displayData.map((row) => row.id)
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
                  rowCount={displayData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      displayData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {!isInsideProtectedFolder &&
                    !isInsideMySharesFolder &&
                    (folderPath.length > 0 || isProject || isClient || isLead) &&
                    zetaUser?.permissions?.includes('Folders.CreateFolder') && (
                      <TableRow>
                        {/* Sl No. */}
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
                            <TextField
                              select
                              fullWidth
                              // label="File Type"
                              value={newItem.type}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                  setNewItem((prev) => {
                                    const newState = { ...prev, type: value };

                                    if (value === 'folder') {
                                      newState.name = '';
                                    }
                                    return newState;
                                  });
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
                              <MenuItem value="folder">Folder</MenuItem>
                              <MenuItem value="file">File</MenuItem>
                            </TextField>
                          </Box>
                        </TableCell>
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
                                    onClick={() => setFileSourceOpen(true)}
                                    sx={{
                                      bgcolor: '#006A67',
                                      color: '#fff',
                                      width: 28,
                                      height: 28,
                                      '&:hover': { bgcolor: '#00574f' },
                                    }}
                                  >
                                    <Iconify
                                      icon={
                                        uploading ? 'line-md:loading-loop' : 'mingcute:add-line'
                                      }
                                    />
                                  </IconButton>
                                </Tooltip>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    flexWrap: 'wrap',
                                    minWidth: 0,
                                    flex: 1,
                                  }}
                                >
                                  {Array.isArray(newItem.fileObject) &&
                                  newItem.fileObject.length > 0 ? (
                                    newItem.fileObject.map((file, index) => (
                                      <Box
                                        key={`${file.name}-${index}`}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          px: 1,
                                          py: 0.3,
                                          borderRadius: 1,
                                          bgcolor: 'rgba(0,106,103,0.08)',
                                          maxWidth: 180,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          noWrap
                                          sx={{
                                            maxWidth: 120,
                                            color: 'text.primary',
                                          }}
                                        >
                                          {file.name}
                                        </Typography>

                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            const updatedFiles = newItem.fileObject.filter(
                                              (_, i) => i !== index
                                            );

                                            setNewItem((prev) => ({
                                              ...prev,
                                              fileObject: updatedFiles.length ? updatedFiles : null,
                                              name:
                                                updatedFiles.length === 1
                                                  ? updatedFiles[0].name
                                                  : updatedFiles.length > 1
                                                    ? `${updatedFiles.length} files selected`
                                                    : '',
                                              size: updatedFiles.reduce(
                                                (total, f) => total + f.size,
                                                0
                                              ),
                                            }));
                                          }}
                                          sx={{
                                            p: 0,
                                            color: 'error.main',
                                          }}
                                        >
                                          <Iconify icon="mdi:close-circle" width={14} />
                                        </IconButton>
                                      </Box>
                                    ))
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      {t('files.toast.no_file_chosen')}
                                    </Typography>
                                  )}
                                </Box>
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
                                    type: 'folder',
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

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1.2,
                                py: 0.6,
                                borderRadius: 1,
                                bgcolor: 'rgba(0,106,103,0.06)',
                                border: '1px dashed rgba(0,106,103,0.35)',
                                color: '#006A67',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Iconify icon="solar:clipboard-add-bold-duotone" width={18} />

                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Paste files/folders here
                              </Typography>

                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Ctrl + V
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Members */}
                        <TableCell
                          sx={{
                            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {selected === 'select' && (
                              <>
                                {selectedPersons.length > 0 && mode !== 'share' && (
                                  <AvatarGroup sx={{ cursor: 'pointer' }}>
                                    {selectedPersons.slice(0, 1).map((person) => (
                                      <Tooltip key={person?.id} title={`${person?.fullName}`} arrow>
                                        <Avatar
                                          key={person.id}
                                          alt={person.fullName}
                                          src={person?.profileImageFileUrl}
                                          sx={{ width: 25, height: 25 }}
                                        >
                                          {!person?.profileImageFileUrl &&
                                            person?.fullName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                      </Tooltip>
                                    ))}
                                    {selectedPersons.length > 1 && (
                                      <Avatar sx={{ width: 25, height: 25 }}>
                                        +{selectedPersons.length - 1}
                                      </Avatar>
                                    )}
                                  </AvatarGroup>
                                )}
                              </>
                            )}
                            {selected === 'all' && (
                              <>
                                {filteredUsers.length > 0 && mode !== 'share' && (
                                  <AvatarGroup sx={{ cursor: 'pointer' }}>
                                    {filteredUsers.slice(0, 1).map((person) => (
                                      <Tooltip key={person?.id} title={`${person?.fullName}`} arrow>
                                        <Avatar
                                          alt={person.fullName}
                                          src={person?.profileImageFileUrl}
                                          sx={{ width: 25, height: 25 }}
                                        >
                                          {!person?.profileImageFileUrl &&
                                            person?.fullName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                      </Tooltip>
                                    ))}
                                    {filteredUsers.length > 1 && (
                                      <Avatar sx={{ width: 25, height: 25 }}>
                                        +{filteredUsers.length - 1}
                                      </Avatar>
                                    )}
                                  </AvatarGroup>
                                )}
                              </>
                            )}

                            {selected === 'share' && (
                              <Avatar
                                sx={{ width: 25, height: 25 }}
                                key={zetaUser?.id}
                                alt={zetaUser.fullName}
                                src={zetaUser?.profileImageFileUrl}
                              >
                                {!zetaUser?.profileImageFileUrl &&
                                  zetaUser?.fullName?.charAt(0).toUpperCase()}
                              </Avatar>
                            )}

                            <Tooltip title={t('files.placeholder.add_members')}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setMode('add');
                                  setSelected('share');
                                  setMembers(true);
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

                          <FileManagerMembers
                            open={members}
                            shared={
                              folderPath.length >= 1
                                ? (() => {
                                    const lastFolder = folderPath[folderPath.length - 1];
                                    if (
                                      (lastFolder?.name === 'General' && folderPath.length === 1) ||
                                      (isProject &&
                                        folderPath.length === 1 &&
                                        folderPath?.[0].milestoneId) ||
                                      (isClient &&
                                        !isClientView &&
                                        folderPath.length === 1 &&
                                        folderPath?.[0].contractId) ||
                                      (isClient &&
                                        isClientView &&
                                        folderPath.length === 1 &&
                                        folderPath?.[0].leadId)
                                    ) {
                                      // return usersList?.users?.filter((user) =>
                                      //   sharedUserIds.includes(user.id)
                                      // );
                                      return usersList?.users?.filter(
                                        (user) => user.id !== zetaUser?.id
                                      );
                                    }
                                    if (lastFolder?.name !== 'General') {
                                      return usersList?.users?.filter((user) =>
                                        sharedUserIds.includes(user.id)
                                      );
                                    }
                                    return [];
                                  })()
                                : mode === 'share'
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
                            onToggleSharePermission={handleToggleSharePermission}
                            fileType={newItem.type}
                            mode={mode}
                            selectedRowId={selectedRowId}
                            mutateFiles={mutate}
                            selected={selected}
                            setSelected={setSelected}
                            selectedRowMembers={selectedRowMembers}
                          />
                        </TableCell>
                        {!isProject && !isClient && !isLead && !currentFolderId && (
                          <TableCell sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Tooltip title="Add Details" arrow>
                                <IconButton
                                  onClick={() => {
                                    setDetails(true);
                                  }}
                                >
                                  <Iconify
                                    icon="mdi:clipboard-text-outline"
                                    sx={{ color: '#006A67' }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <AddFileDetails
                              open={details}
                              onClick={handleOpenDetails}
                              handleClose={handleDetailsDialogClose}
                              mode={mode}
                              addNewDetails={addNewDetails}
                              variant={variant}
                              setVariant={setVariant}
                              projectName={projectName}
                              setProjectName={setProjectName}
                              clientName={clientName}
                              setClientName={setClientName}
                              vendorName={vendorName}
                              setVendorName={setVendorName}
                              missionName={missionName}
                              setMissionsName={setMissionsName}
                              businessLead={businessLead}
                              setBusinessLead={setBusinessLead}
                              contract={contract}
                              setContract={setContract}
                              setProjectParentFolderId={setProjectParentFolderId}
                              projectParentFolderId={projectParentFolderId}
                              clientParentFolderId={clientParentFolderId}
                              setClientParentFolderId={setClientParentFolderId}
                              leadParentFolderId={leadParentFolderId}
                              setLeadParentFolderId={setLeadParentFolderId}
                              vendorParentFolderId={vendorParentFolderId}
                              setVendorParentFolderId={setVendorParentFolderId}
                              contractParentFolderId={contractParentFolderId}
                              setContractParentFolderId={setContractParentFolderId}
                            />
                          </TableCell>
                        )}

                        {/* <TableCell sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="client-label">{t('files.labels.client')}</InputLabel>
                        <Select
                          labelId="client-label"
                          value={newItem.clientName || ''}
                          onChange={(e) => {
                            setNewItem({ ...newItem, clientName: e.target.value, projectName: '' });
                            setIsProjectDisabled(true);
                          }}
                          input={<OutlinedInput label={t('files.placeholder.search_clients')} />}
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                marginTop: 8,
                              },
                            },
                          }}
                          disabled={isClientDisabled}
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
                          <MenuItem disableRipple disableTouchRipple disableGutters>
                            <TextField
                              placeholder={t('files.placeholder.search_clients')}
                              size="small"
                              fullWidth
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </MenuItem>

                          {filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                              <MenuItem key={client} value={client}>
                                {client}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>{t('files.placeholder.no_results_found')}</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </TableCell> */}

                        {/* Size */}
                        <TableCell
                          sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                          align={storedLang === 'ar' ? 'right' : 'left'}
                        >
                          {newItem.size ? `${(newItem.size / 1024).toFixed(2)} KB` : '-'}
                        </TableCell>

                        {/* <TableCell sx={{ borderRight: '1px dotted rgba(200, 200, 200, 0.6)' }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FileThumbnail
                          file={
                            newItem.type === 'folder'
                              ? { type: 'folder' }
                              : newItem.fileObject || newItem.name
                          }
                          tooltip={false}
                          sx={{
                            width: 20,
                            height: 20,
                          }}
                        />
                        <Typography variant="body2" noWrap sx={{ textTransform: 'capitalize' }}>

                          {newItem.type === 'folder'
                            ? 'Folder'
                            : `File/${newItem.name.split('.').pop()?.toLowerCase()}`}{' '}

                        </Typography>
                      </Stack>
                    </TableCell> */}

                        {/* Modified Date */}
                        <TableCell
                          sx={{ borderRight: '1px dotted rgba(200,200,200,0.6)' }}
                          align={storedLang === 'ar' ? 'right' : 'left'}
                        >
                          {new Date(newItem.modifiedAt).toLocaleString()}
                        </TableCell>

                        {/* Actions */}
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
                                  if (!isSubmitting) {
                                    handleFileUpload();
                                  }
                                }}
                                disabled={isSubmitting}
                                size="small"
                                sx={{
                                  bgcolor: isSubmitting
                                    ? 'grey.500'
                                    : isSubmitting
                                      ? 'grey.500'
                                      : '#006A67',
                                  color: 'primary.contrastText',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                  textTransform: 'none',
                                  padding: '6px 12px',
                                  alignItems: 'center',
                                }}
                              >
                                {isSubmitting ? (
                                  <CircularProgress
                                    size={24}
                                    sx={{ color: 'primary.contrastText' }}
                                  />
                                ) : fileMode === 'edit' ? (
                                  t('files.buttons.update')
                                ) : (
                                  t('files.buttons.save')
                                )}
                              </Button>
                            </Tooltip>
                            <Tooltip title={t('files.tooltip.clear_all')} arrow>
                              <Iconify
                                icon="mdi:close-circle"
                                onClick={() => {
                                  setNewItem({
                                    name: '',
                                    type: 'folder',
                                    size: 0,
                                    createdAt: new Date().toISOString(),
                                    modifiedAt: new Date().toISOString(),
                                    members: '',
                                    projectName: '',
                                    clientName: '',
                                    fileObject: null,
                                    parentId: currentFolderId || null,
                                  });
                                  setSelectedPersons([]);
                                  setSelected(null);
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
                    )}
                  {/* {currentFolderName === 'Application' && !currentFolderParentId && (
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
                      isInsideProtectedFolder={isInsideProtectedFolder}
                      isProtectedFolder={isProtectedFolder}
                      selectedRowMembers={selectedRowMembers}
                    />
                  )} */}
                  {displayData.map((row, index) => (
                    <FileManagerTableRow
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
                      deletedFolder={deletedFolder}
                      setSelectedRowId={setSelectedRowId}
                      setSelectedRowMembers={setSelectedRowMembers}
                      allUsers={usersList?.users}
                      mutateFiles={mutate}
                      sharedUserIds={sharedUserIds}
                      selectedRowId={selectedRowId}
                      mode={mode}
                      selectedRowMembers={selectedRowMembers}
                      selected={selected}
                      setSelected={setSelected}
                      isClientView={isClientView}
                      isInsideProtectedFolder={isInsideProtectedFolder}
                      selectedPersons={selectedPersons}
                      setSelectedPersons={setSelectedPersons}
                      isInsideMySharesFolder={isInsideMySharesFolder}
                    />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>
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
        </Card>
      )}

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
      <Dialog
        open={fileSourceOpen}
        onClose={() => {
          setFileSourceOpen(false);
          setShowDeviceDrop(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Add File</DialogTitle>

        <Box sx={{ px: 3, pb: 2 }}>
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<Iconify icon="solar:upload-bold" />}
              // onClick={() => setShowDeviceDrop(true)}
              sx={{
                justifyContent: 'flex-start',
                py: 1.2,
                borderColor: '#006A67',
                color: '#006A67',
              }}
            >
              Upload from Device
              <input
                hidden
                type="file"
                multiple
                accept={allowedFileTypes.map((ext) => `.${ext}`).join(',')}
                onChange={(e) => {
                  handleDeviceFilesSelect(e.target.files);
                  e.target.value = '';
                }}
              />
            </Button>
            {/* {showDeviceDrop && ( */}
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeviceFilesSelect(e.dataTransfer.files);
              }}
              sx={{
                p: 2,
                border: '1.5px dashed #006A67',
                borderRadius: 1.5,
                textAlign: 'center',
                bgcolor: 'rgba(0,106,103,0.04)',
                cursor: 'pointer',
              }}
            >
              <Typography variant="caption" sx={{ color: '#006A67', fontWeight: 600 }}>
                You can also drag and drop files here
              </Typography>
            </Box>
            {/* )} */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="solar:folder-with-files-bold" />}
              // onClick={() => {
              //   setFileSourceOpen(false);
              //   setRepositoryDialogOpen(true);
              // }}
              sx={{
                justifyContent: 'flex-start',
                py: 1.2,
              }}
            >
              Choose from Repository
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="logos:microsoft-onedrive" />}
              onClick={() => {
                // toast.info('OneDrive picker integration pending');
                setFileSourceOpen(false);
              }}
              sx={{
                justifyContent: 'flex-start',
                py: 1.2,
              }}
            >
              Choose from OneDrive
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Iconify icon="logos:google-drive" />}
              onClick={() => {
                // toast.info('Google Drive picker integration pending');
                setFileSourceOpen(false);
              }}
              sx={{
                justifyContent: 'flex-start',
                py: 1.2,
              }}
            >
              Choose from Google Drive
            </Button>
          </Stack>
        </Box>
        <Box
          sx={{
            px: 3,
            pb: 1,
            mt: 1,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: 'warning.lighter',
              border: '1px dashed',
              borderColor: 'warning.main',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 700,
                color: 'warning.dark',
                mb: 0.5,
              }}
            >
              File Upload Restrictions
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
              }}
            >
              Maximum file size: {MAX_FILE_SIZE_MB} MB
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                mt: 0.5,
                wordBreak: 'break-word',
              }}
            >
              Allowed extensions: {allowedFileTypes.join(', ')}
            </Typography>
          </Box>
        </Box>
        <DialogActions>
          <Button onClick={() => setFileSourceOpen(false)}>Upload</Button>
        </DialogActions>
      </Dialog>
      <RepositoryFileDialog
        open={repositoryDialogOpen}
        onClose={() => setRepositoryDialogOpen(false)}
        onSelect={handleSelectRepositoryFiles}
      />
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
      {isProject || isClient || isLead ? (
        <>{renderView}</>
      ) : (
        <DashboardContent>{renderView}</DashboardContent>
      )}
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
  // const stabilizedThis = inputData.map((el, index) => [el, index]);

  // stabilizedThis.sort((a, b) => {
  //   const order = comparator(a[0], b[0]);
  //   if (order !== 0) return order;
  //   return a[1] - b[1];
  // });

  // inputData = stabilizedThis.map((el) => el[0]);

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

  // if (status && status !== 'all') {
  //   if (status === 'shared') {
  //     inputData = inputData.filter((file) => file.shared);
  //   } else if (status === 'starred') {
  //     inputData = inputData.filter((file) => file.starred);
  //   } else if (status === 'my') {
  //     inputData = inputData.filter((file) => file.owner === 'me');
  //   }
  // }

  return inputData;
}
