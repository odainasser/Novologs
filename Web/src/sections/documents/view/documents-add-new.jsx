'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { RouterLink } from 'src/routes/components';
import { zodResolver } from '@hookform/resolvers/zod';

import MenuItem from '@mui/material/MenuItem';
import {
  Box,
  Card,
  Stack,
  Divider,
  CardHeader,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Form, Field, RHFUpload } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import CkEditorComponent from 'src/components/htmlEditor/CkEditorComponent';
import { _fmMembers, _documentCategories } from '../documents-mock-data';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { addDocument, updateDocument } from 'src/actions/document/documentActions';
import { addFile } from 'src/actions/file/fileActions';
import { getUser } from 'src/actions/userManage/userManageActions';
import { AddMemberDetails } from 'src/sections/project/add-member-details';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import { EditorView } from 'src/sections/editor/view/editor-view';
import { getDocument } from 'src/actions/document/documentActions';
export default function DocumentsAddNewPage({
  isEdit: isEditProp = false,
  isProject,
  projectId,
  isClient,
  clientId,
  isLead,
  leadId,
  isVendor,
  vendorId,
  isContract,
  contractId,
  docId,
}) {
  const { t, i18n } = useTranslation('dashboard/documents');
  const storedLang = localStorage.getItem('selectedLang');

  const getDocParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1,
    },
    search: {
      logicOperator: 0,
      fieldName: 'Id',
      operator: 0,
      fieldValue: docId,
    },
  };
  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);

  // Zod Schema for validation
  const NewDocSchema = zod.object({
    title: zod.string().min(1, t('documents.validation.title_required')),
    description: zod.string().min(1, t('documents.validation.description_required')),
    category: zod.string().min(1, t('documents.validation.category_required')).optional(),
    coverUrl: zod.string().nullable().optional(),
    viewers: zod.array(zod.string()).optional().default([]),
    editors: zod.array(zod.string()).optional().default([]),
    nodeType: zod.string().optional(),
    publish: zod.boolean().default(false),
  });
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
  const { usersList } = getUser(getUsersParams);

  const router = useRouter();

  const [currentPost, setCurrentPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [selectedViewers, setSelectedViewers] = useState([]);

  const [selectedEditors, setSelectedEditors] = useState([]);

  const isDocFile = true;
  useEffect(() => {
    let isMounted = true;

    if (isEditProp && documentList?.documents?.length) {
      try {
        const docDetails = documentList.documents.find((doc) => doc.id === docId);

        console.log('this is the document details', docDetails);

        if (isMounted) {
          if (docDetails) {
            setCurrentPost(docDetails);
          } else {
            setCurrentPost(null);
            setSelectedViewers([]);
            setSelectedEditors([]);
          }
        }
      } catch (error) {
        console.error('Error while finding docDetails:', error);
        if (isMounted) {
          setCurrentPost(null);
          setSelectedViewers([]);
          setSelectedEditors([]);
        }
      }
    } else if (isMounted && !isEditProp) {
      setCurrentPost(null);
      setSelectedViewers([]);
      setSelectedEditors([]);
    }

    return () => {
      isMounted = false;
    };
  }, [isEditProp, documentList, docId]);

  useEffect(() => {
    if (isEditProp && currentPost && usersList?.users) {
      const members = currentPost.members || [];
      const initialViewers = members
        .filter((docMember) => docMember.role === 0)
        .map((docMember) => {
          const user = usersList.users.find((u) => u.id === docMember.memberId);
          if (user) {
            // Store the original document member entry ID
            return { ...user, docMemberId: docMember.id };
          }
          return null;
        })
        .filter(Boolean);
      setSelectedViewers(initialViewers);

      const initialEditors = members
        .filter((docMember) => docMember.role === 1)
        .map((docMember) => {
          const user = usersList.users.find((u) => u.id === docMember.memberId);
          if (user) {
            return { ...user, docMemberId: docMember.id };
          }
          return null;
        })
        .filter(Boolean);
      setSelectedEditors(initialEditors);
    } else if (!isEditProp || !currentPost) {
      setSelectedViewers([]);
      setSelectedEditors([]);
    }
  }, [isEditProp, currentPost, usersList, setSelectedViewers, setSelectedEditors]);

  const docItem = currentPost?.documentVersionList[0];
  const documentId = currentPost?.id;
  const documentVersionId = currentPost?.documentVersionList[0]?.id;

  const [editorContent, setEditorContent] = useState(
    localStorage.getItem('editorContentDocs') || ''
  );

  const [categoryList, setCategoryList] = useState(
    _documentCategories.map((cat) => ({ label: cat, value: cat }))
  );
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [uploadingCoverId, setUploadingCoverId] = useState('');

  const [mode, setMode] = useState('add');

  const [isViewer, setIsViewer] = useState(false);

  const isDocMember = true;

  const [owners, setOwners] = useState(false);

  const [members, setMembers] = useState(false);

  const handleToggleEditor = (person) => {
    setSelectedEditors((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };
  const handleToggleViewer = (person) => {
    setSelectedViewers((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === person.id);
      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== person.id);
      }
      return [...prevSelected, person];
    });
  };
  const handleOpenEditors = () => {
    setMembers(true);
  };
  const handleEditorDialogClose = () => {
    setTimeout(() => {
      setMembers(false);
    }, 100);
  };
  const handleOpenViewers = () => {
    setOwners(true);
  };
  const handleViewerDialogClose = () => {
    setTimeout(() => {
      setOwners(false);
    }, 100);
  };
  const filteredEditors = usersList?.users?.filter(
    (member) => !selectedViewers.some((owner) => owner.id === member.id)
  );

  const filteredViewers = usersList?.users?.filter(
    (member) => !selectedEditors.some((person) => person.id === member.id)
  );

  const handleDeselectViewer = (id) => {
    setSelectedViewers((prev) => prev.filter((person) => person.id !== id));
  };
  const handleDeselectEditor = (id) => {
    setSelectedEditors((prev) => prev.filter((person) => person.id !== id));
  };

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.documentVersionList?.[0]?.title || '',
      description: currentPost?.documentVersionList?.[0]?.description || '',
      category: currentPost?.category || 'Proposal',
      coverUrl: currentPost?.documentVersionList?.[0]?.headerImgFile?.url || null,
      nodeType: currentPost?.type?.toString() || undefined,
    }),
    [currentPost]
  );

  const methods = useForm({
    ...(!docItem && { resolver: zodResolver(NewDocSchema) }),
    defaultValues,
  });
  const {
    reset,
    watch,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  useEffect(() => {
    setIsLoadingPost(true);
    if (currentPost || !isEditProp) {
      reset(defaultValues);
      setCoverImagePreview(currentPost?.coverUrl || '');
    }
    setIsLoadingPost(false);
  }, [currentPost, defaultValues, reset, isEditProp]);

  // Form submission handler
  const onSubmit = async (data) => {
    console.log('Form submitted with:', data);

    const newDoc = {
      ...data,
      id: isEditProp && currentPost ? currentPost.id : Date.now().toString(),
      content: editorContent,
      createdAt: currentPost?.createdAt || new Date().toISOString(),
      createdBy: 'Demo User',
    };

    // Ensure members arrays are properly initialized
    const viewersList = selectedViewers || [];
    const editorsList = selectedEditors || [];

    const finalMembersPayload = [
      ...viewersList.map((viewerUser) => ({
        id: viewerUser.docMemberId,
        memberId: viewerUser.id,
        role: 0,
      })),
      ...editorsList.map((editorUser) => ({
        id: editorUser.docMemberId,
        memberId: editorUser.id,
        role: 1,
      })),
    ].map((member) => {
      if (member.id === undefined) {
        const { id, ...rest } = member;
        return rest;
      }
      return member;
    });

    const payload = {
      type: data.nodeType ? parseInt(data.nodeType, 10) : currentPost?.type || 0,
      members: finalMembersPayload || [],
      documentContent: {
        content: editorContent || docItem?.content || '',
        title: data.title || '',
        description: data.description || '',
        headerImgFileId: uploadingCoverId || docItem?.headerImgFileId,
        filesIds: [],
      },
    };

    if (docItem) {
      payload.id = documentId;
      payload.documentContent.id = documentVersionId;
    }
    if (isProject) {
      payload.type = 5;
      payload.projectId = projectId;
    }
    if (isClient) {
      payload.type = 7;
      payload.clientId = clientId;
    }

    if (isVendor) {
      payload.type = 9;
      payload.vendorId = vendorId;
    }

    if (isLead) {
      payload.type = 8;
      payload.clientLeadId = leadId;
    }

    if (isContract) {
      payload.type = 10;
      payload.vendorContractId = contractId;
    }

    try {
      let response;
      if (docItem) {
        console.log('this is the updated payload', payload);
        response = await updateDocument(payload);

        if (response?.success) {
          setEditorContent('');
          localStorage.removeItem('editorContentDocs');
          localStorage.removeItem('docDetails');
          await mutateDocument();
          toast.success(t('documents.toast.document_update'));
          router.push(
            (() => {
              if (isProject) return paths.dashboard.project.details(projectId);
              if (isClient) return paths.dashboard.clientDetails.details(clientId);
              if (isVendor) return paths.dashboard.vendorDetails.details(vendorId);
              if (isLead) return paths.dashboard.leadDetails.details(leadId);
              if (isContract) return paths.dashboard.contractDetails.details(contractId);
              return paths.dashboard.documents.root;
            })()
          );
        } else {
          toast.error('Failed to update document');
        }
      } else {
        response = await addDocument(payload);
        console.log('this is the response', response);

        if (response.success) {
          setEditorContent('');
          localStorage.removeItem('editorContentDocs');
          localStorage.removeItem('docDetails');
          router.push(
            (() => {
              if (isProject) return paths.dashboard.project.details(projectId);
              if (isClient) return paths.dashboard.clientDetails.details(clientId);
              if (isVendor) return paths.dashboard.vendorDetails.details(vendorId);
              if (isLead) return paths.dashboard.leadDetails.details(leadId);
              if (isContract) return paths.dashboard.contractDetails.details(contractId);
              return paths.dashboard.documents.root;
            })()
          );

          // This part is for optimistic updates on the list page.
          // Ensure it uses isEditProp to determine the correct key.
          localStorage.setItem(
            isEditProp ? 'updatedDocument' : 'newDocument',
            JSON.stringify(newDoc)
          );

          toast.success(
            isEditProp ? t('documents.add.toast_update') : t('documents.add.toast_create')
          );
        } else {
          console.error('API error:', response.error);
          toast.error(response.error || 'Operation failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Document operation failed:', error);
      toast.error(t('documents.toast.document_error'));
    }
  };
  const handleFileUpload = async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadingCover(true);

      try {
        // const fileReader = new FileReader();
        // fileReader.onloadend = () => {
        //   setCoverImagePreview(fileReader.result);
        // };
        // fileReader.readAsDataURL(file);
        console.log('this is the file', file);

        const filePayload = {
          name: file.name,
          file: file,
          // entityType: 12,
        };
        console.log('this is the file payload', filePayload);

        const result = await addFile(filePayload);
        const fileResponse = result?.response?.data?.successStatus;
        console.log('this is the result', result);
        if (fileResponse) {
          setValue('coverUrl', fileResponse?.url, { shouldValidate: true });
          setCoverImagePreview(fileResponse?.url);
          setUploadingCoverId(fileResponse?.id);
        }

        // Simulate file upload process (e.g., uploading to a server)
        // Replace with your actual upload logic
        // const uploadResult = await new Promise((resolve) => {
        //   setTimeout(() => resolve({ fileUrl: fileReader.result }), 2000);
        // });

        // setValue('coverUrl', uploadResult.fileUrl, { shouldValidate: true });
        toast.success(t('documents.add.cover_upload_success'));
      } catch (error) {
        toast.error(t('documents.add.cover_upload_error'));
      } finally {
        setUploadingCover(false); // Stop the loading state once upload is done
      }
    }
  };
  const renderEditor = (
    <Card>
      <CardHeader
        title={t('documents.add.content')}
        subheader={t('documents.add.editor_subtitle')}
      />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <EditorView
          docItem={docItem}
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          employeesData={usersList?.users}
          isDocFile={isDocFile}
        />
        {/* Title Field */}
        <TextField
          name="title"
          label={
            <span>
              {t('documents.add.form.title')} <span style={{ color: 'red' }}>*</span>
            </span>
          }
          value={watch('title')}
          onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
          fullWidth
          error={!!errors.title}
          helperText={errors.title ? errors.title.message : ''}
        />

        {/* Description Field */}
        <TextField
          name="description"
          label={
            <span>
              {t('documents.add.form.description')} <span style={{ color: 'red' }}>*</span>
            </span>
          }
          value={watch('description')} // Bind field value to form state
          onChange={(e) => setValue('description', e.target.value, { shouldValidate: true })}
          multiline
          rows={3}
          fullWidth
          error={!!errors.description}
          helperText={errors.description ? errors.description.message : ''}
        />
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">{t('documents.add.form.cover')}</Typography>
          <RHFUpload
            name="coverUrl"
            maxSize={3145728}
            loading={uploadingCover}
            value={watch('coverUrl')} // ✅ Force value to be passed down
            helperText={t('documents.add.form.cover_upload')}
            onDrop={async (acceptedFiles) => {
              await handleFileUpload(acceptedFiles); // Upload the file
            }}
            onDelete={() => setValue('coverUrl', null)}
          />

          {errors.coverUrl && <Typography color="error">{errors.coverUrl.message}</Typography>}
        </Stack>
      </Stack>
    </Card>
  );

  const renderPermissions = (
    <Card>
      <CardHeader
        title={t('documents.add.form.card_header')}
        subheader={t('documents.add.form.subheader')}
      />
      <Divider />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="grayText">
            {t('documents.add.form.viewers_name')}
          </Typography>
          <Tooltip
            title={
              selectedViewers.length > 0
                ? t('documents.add.form.Change_Viewers')
                : t('documents.add.form.Add_viewers')
            }
            arrow
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setOwners(true);
                setIsViewer(true);
              }}
              sx={{
                width: 20,
                height: 20,
                ml: 2,
                bgcolor: '#006A67',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                cursor: 'pointer',
              }}
            >
              <Iconify
                icon={selectedViewers.length > 0 ? 'mdi:account-edit-outline' : 'mingcute:add-line'}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {selectedViewers.length > 0 && (
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {selectedViewers?.map((person) => (
              <Chip
                key={person.id}
                avatar={
                  <Avatar
                    alt={person?.fullName}
                    src={person?.profileImageFileUrl || person?.fullName?.charAt(0).toUpperCase()}
                  />
                }
                label={person?.fullName}
                size="medium"
                variant="outlined"
                onDelete={() => handleDeselectViewer(person.id)}
                sx={{
                  ...(storedLang === 'ar' && { p: 1.5 }),
                }}
              />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" color="grayText">
            {t('documents.add.form.editor_name')}
          </Typography>
          <Tooltip
            title={
              selectedEditors.length > 0
                ? t('documents.add.form.change_Editors')
                : t('documents.add.form.Add_Editors')
            }
            arrow
          >
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setMembers(true);
              }}
              sx={{
                width: 20,
                height: 20,
                ml: 2,
                bgcolor: '#006A67',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                cursor: 'pointer',
              }}
            >
              <Iconify
                icon={selectedEditors.length > 0 ? 'mdi:account-edit-outline' : 'mingcute:add-line'}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {selectedEditors.length > 0 && (
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {selectedEditors?.map((person) => (
              <Chip
                key={person.id}
                avatar={
                  <Avatar
                    alt={person?.fullName}
                    src={person?.profileImageFileUrl || person?.fullName?.charAt(0).toUpperCase()}
                  />
                }
                label={person?.fullName}
                size="medium"
                variant="outlined"
                onDelete={() => handleDeselectEditor(person.id)}
                sx={{
                  ...(storedLang === 'ar' && { p: 1.5 }),
                }}
              />
            ))}
          </Stack>
        )}

        <Typography variant="body2" color="grayText">
          {t('documents.add.form.no_viewers_note')}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
            <TextField
              select
              fullWidth
              label={t('documents.add.form.category')}
              {...methods.register('category')}
              sx={{ flex: 1 }}
              value={watch('category') || ''} // Ensure it defaults to an empty string if undefined
            >
              {categoryList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <IconButton
              color="inherit"
              onClick={() => setOpenCategoryDialog(true)}
              sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                width: 48,
                height: 48,
                alignSelf: 'center',
                mt: { xs: 1, sm: 0 },
              }}
            >
              <Add />
            </IconButton>
          </Box> */}
          {!isProject && !isClient && !isLead && !isVendor && !isContract && (
            <TextField
              select
              fullWidth
              label={t('documents.add.form.node_type')}
              {...methods.register('nodeType')}
              sx={{ flex: 1 }}
              value={watch('nodeType') ?? currentPost?.type?.toString() ?? ''}
            >
              {[
                { label: 'Book', value: '0' },
                // { label: 'Wiki', value: '1' },
                { label: 'Post', value: '2' },
                { label: 'Story', value: '3' },
                { label: 'Task', value: '4' },
                { label: 'Project', value: '5' },
                { label: 'Milestone', value: '6' },
                { label: 'Client', value: '7' },
                { label: 'Lead', value: '8' },
                { label: 'Vendor', value: '9' },
                { label: 'Contract', value: '10' },
              ].map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </Stack>
      <AddMemberDetails
        open={owners}
        shared={filteredViewers}
        selectedPersons={selectedViewers}
        setSelectedPersons={setSelectedViewers}
        onClick={handleOpenViewers}
        handleClose={handleViewerDialogClose}
        onTogglePerson={handleToggleViewer}
        mode={mode}
        isOwner={isViewer}
        isDocMember={isDocMember}
      />

      <AddMemberDetails
        open={members}
        shared={filteredEditors}
        selectedPersons={selectedEditors}
        setSelectedPersons={setSelectedEditors}
        onClick={handleOpenEditors}
        handleClose={handleEditorDialogClose}
        onTogglePerson={handleToggleEditor}
        mode={mode}
        isDocMember={isDocMember}
      />
    </Card>
  );

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box display="flex" gap={1}>
          <Stack direction="row" alignItems="center">
            <Button
              component={RouterLink}
              href={(() => {
                if (isProject) return paths.dashboard.project.details(projectId);
                if (isClient) return paths.dashboard.clientDetails.details(clientId);
                if (isVendor) return paths.dashboard.vendorDetails.details(vendorId);
                if (isLead) return paths.dashboard.leadDetails.details(leadId);
                if (isContract) return paths.dashboard.contractDetails.details(contractId);
                return paths.dashboard.documents.root;
              })()}
              onClick={() => localStorage.removeItem('editorContentDocs')}
              variant="outlined"
              startIcon={
                <Iconify
                  icon="eva:arrow-back-fill"
                  sx={{
                    transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
              }
              sx={{ mt: 1 }}
            >
              {t('documents.add.back')}
            </Button>
          </Stack>
          {!isProject && !isClient && !isLead && !isVendor && !isContract && (
            <CustomBreadcrumbs
              heading={
                isEditProp ? t('documents.add.edit_heading') : t('documents.add.new_heading')
              }
              links={[
                { name: t('documents.add.dashboard'), href: paths.dashboard.root },
                { name: t('documents.add.documents'), href: paths.dashboard.documents.root },
                { name: isEditProp ? t('documents.actions.edit') : t('documents.actions.new') },
              ]}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">{t('documents.add.details_title')}</Typography>
        <Typography variant="h6" color="text.secondary">
          {t('documents.add.details_subtitle')}
        </Typography>
      </Box>

      <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          {renderEditor}
          {renderPermissions}

          <Box textAlign={storedLang === 'ar' ? 'left' : 'right'}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {isEditProp ? t('documents.add.submit_update') : t('documents.add.new_heading')}
            </LoadingButton>
          </Box>
        </Stack>
      </Form>

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>{t('documents.add.form.add_category')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('documents.add.form.category_name')}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={() => setOpenCategoryDialog(false)}>
            {t('documents.actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const trimmed = newCategory.trim();
              if (trimmed) {
                const newCat = { label: trimmed, value: trimmed };
                setCategoryList((prev) =>
                  [...prev, newCat].sort((a, b) => a.label.localeCompare(b.label))
                );
                setValue('category', trimmed, { shouldValidate: true });
                setNewCategory('');
                setOpenCategoryDialog(false);
              }
            }}
          >
            {t('documents.actions.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
