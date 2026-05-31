'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { RouterLink } from 'src/routes/components';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Card,
  Stack,
  Divider,
  CardHeader,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Form } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { _fmMembers, _documentCategories } from 'src/sections/documents/documents-mock-data';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslation } from 'react-i18next';
import { addDocument, updateDocument } from 'src/actions/document/documentActions';
import { getUser } from 'src/actions/user-manage/userManageActions';
import { EditorView } from 'src/sections/editor/view/editor-view';
import { getDocument } from 'src/actions/document/documentActions';
export default function AddMyNotes({
  isEdit: isEditProp = false,

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

  const NewDocSchema = zod.object({
    title: zod.string().min(1, t('documents.validation.title_required')),
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
          }
        }
      } catch (error) {
        console.error('Error while finding docDetails:', error);
        if (isMounted) {
          setCurrentPost(null);
        }
      }
    } else if (isMounted && !isEditProp) {
      setCurrentPost(null);
    }

    return () => {
      isMounted = false;
    };
  }, [isEditProp, documentList, docId]);

  const docItem = currentPost?.documentVersionList[0];
  const documentId = currentPost?.id;
  const documentVersionId = currentPost?.documentVersionList[0]?.id;

  const [editorContent, setEditorContent] = useState(
    localStorage.getItem('editorContentDocs') || ''
  );

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.documentVersionList?.[0]?.title || '',
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
    }
    setIsLoadingPost(false);
  }, [currentPost, defaultValues, reset, isEditProp]);

  const onSubmit = async (data) => {
    console.log('Form submitted with:', data);

    const newDoc = {
      ...data,
      id: isEditProp && currentPost ? currentPost.id : Date.now().toString(),
      content: editorContent,
      createdAt: currentPost?.createdAt || new Date().toISOString(),
      createdBy: 'Demo User',
    };

    const payload = {
      type: 1,
      documentContent: {
        content: editorContent || docItem?.content || '',
        title: data.title || '',

        filesIds: [],
      },
    };

    if (docItem) {
      payload.id = documentId;
      payload.documentContent.id = documentVersionId;
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
              return paths.dashboard.timesheet.root;
            })()
          );
        } else {
          toast.error('Failed to update note');
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
              return paths.dashboard.timesheet.root;
            })()
          );

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
      console.error('Note operation failed:', error);
      toast.error(t('documents.toast.document_error'));
    }
  };

  const renderEditor = (
    <Card>
      <CardHeader title={t('documents.add.content')} subheader="Write your notes content here..." />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        <TextField
          name="title"
          label={
            <span>
              Note Title <span style={{ color: 'red' }}>*</span>
            </span>
          }
          value={watch('title')}
          onChange={(e) => setValue('title', e.target.value, { shouldValidate: true })}
          fullWidth
          error={!!errors.title}
          helperText={errors.title ? errors.title.message : ''}
        />
        <EditorView
          docItem={docItem}
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          employeesData={usersList?.users}
        />
      </Stack>
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
                return paths.dashboard.timesheet.root;
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
          <CustomBreadcrumbs
            heading={isEditProp ? 'Edit Note' : 'Create New Note'}
            links={[
              { name: t('documents.add.dashboard'), href: paths.dashboard.root },
              { name: 'My Notes', href: paths.dashboard.timesheet.root },
              { name: isEditProp ? t('documents.actions.edit') : t('documents.actions.new') },
            ]}
          />
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

          <Box textAlign={storedLang === 'ar' ? 'left' : 'right'}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {isEditProp ? 'Update Note' : 'Create Note'}
            </LoadingButton>
          </Box>
        </Stack>
      </Form>
    </DashboardContent>
  );
}
