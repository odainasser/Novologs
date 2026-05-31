'use client';
import Box from '@mui/material/Box';

import { useState, useRef, useMemo, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import CkEditorComponent from 'src/components/html-editor/ck-editor-component';
import { Scrollbar } from 'src/components/scrollbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTranslation } from 'react-i18next';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
} from 'src/actions/document/documentActions';
import Stack from '@mui/material/Stack';
import { updateProject } from 'src/actions/project/projectActions';
import CkEditorPreview from 'src/components/html-editor/ck-editor-preview';
import Button from '@mui/material/Button';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuthContext } from 'src/auth/hooks';
import { EmptyContent } from 'src/components/empty-content';
import { getUser } from 'src/actions/user-manage/userManageActions';

export function ProjectDocument({ projectDetails, mutateProjects, projectMembers }) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const getDocParams = useMemo(() => {
    if (projectDetails?.overviewDocumentId) {
      return {
        search: {
          fieldName: 'Id',
          fieldValue: projectDetails.overviewDocumentId,
          operator: 0,
          logicOperator: 0,
        },
        pagination: {
          pageNumber: 1,
          pageSize: 2,
        },
      };
    }
    return null;
  }, [projectDetails?.overviewDocumentId]);
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

  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);
  const confirm = useBoolean();
  const { zetaUser } = useAuthContext();

  const docItem = documentList?.documents[0]?.documentVersionList[0];

  const documentId = documentList?.documents[0]?.id;
  const documentVersionId = documentList?.documents[0]?.documentVersionList[0]?.id;

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  const isProjectOwner = projectMembers?.some(
    (m) => m.memberId === zetaUser?.id && m.isOwner === true
  );
  const [documentLoading, setDocumentLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditorViewMode, setIsEditorViewMode] = useState(false);

  const [editorContent, setEditorContent] = useState(
    localStorage.getItem('editorContentProject') || ''
  );
  const editorRef = useRef(null);

  useEffect(() => {
    if (projectDetails?.overviewDocumentId) {
      if (docItem) {
        setEditorContent(docItem.content || '');
        setIsEditorViewMode(false);
        setIsEditing(false);
      } else {
        setEditorContent('');
        setIsEditing(false);
        setIsEditorViewMode(false); // Not in editor view mode
      }
    }
  }, [projectDetails?.overviewDocumentId, docItem, projectDetails?.id]);

  const addNewDocument = async () => {
    setDocumentLoading(true);
    const savedContent = localStorage.getItem('editorContentProject');
    if (!savedContent) {
      toast.error(t('projects.toast.no_contents'));
      setDocumentLoading(false);
      return;
    }

    const payload = {
      type: 5,
      documentContent: {
        content: savedContent,
      },
    };

    const updatePayload = {
      id: documentId,
      type: 5,
      documentContent: {
        id: documentVersionId,
        content: savedContent,
      },
    };

    try {
      let response;
      let docId;

      if (docItem) {
        console.log('this is the updated payload', updatePayload);
        response = await updateDocument(updatePayload);
        docId = response?.response?.data?.successStatus?.id ?? docItem.id;
        if (response?.success) {
          setEditorContent('');
          localStorage.removeItem('editorContentProject');
          await mutateDocument();
          await mutateProjects();

          toast.success(t('projects.toast.project_overview_added'));
        } else {
          toast.error(t('projects.toastproject_overview_failed'));
        }
      } else {
        response = await addDocument(payload);
        docId = response?.response?.data?.successStatus?.id;

        if (!docId) {
          toast.error(t('projects.toast.adding_failed'));
          setDocumentLoading(false);
          return;
        }

        const projectPayload = {
          id: projectDetails?.id,
          name: projectDetails?.name,
          isMission: projectDetails?.isMission,
          code: projectDetails?.code,
          description: projectDetails?.description,
          color: projectDetails?.color,
          startDate: projectDetails?.startDate,
          endDate: projectDetails?.endDate,
          departmentId: projectDetails?.departmentId,
          goalId: projectDetails?.goalId,
          initiativeId: projectDetails?.initiativeId,
          clientId: projectDetails?.clientId,
          memberList: projectDetails?.projectMembers,
          overviewDocumentId: docId,
          type: projectDetails?.type,
        };

        const projectUpdateResponse = await updateProject(projectPayload);

        if (response.success && projectUpdateResponse?.success !== false) {
          setEditorContent('');
          localStorage.removeItem('editorContentProject');
          await mutateDocument();
          await mutateProjects();

          toast.success(t('projects.toast.project_overview_linked'));
        } else {
          toast.error(t('projects.toast.project_link'));
        }
      }
    } catch (error) {
      console.error('Document operation failed:', error);
      toast.error(t('projects.toast.failed'));
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (id) {
      try {
        const response = await deleteDocument(id);
        if (response.success) {
          await mutateDocument();
          await mutateProjects();
          toast.success(t('projects.toast.project_overview_deleted'));
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <Scrollbar fillContent sx={{ py: 1 }}>
      <Box sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        <div ref={editorRef}>
          {(projectDetails?.creatorId === zetaUser?.id || isProjectOwner) && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2, gap: 1 }}>
              {docItem && isEditorViewMode && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setIsEditorViewMode(false);
                    setEditorContent(docItem.content);
                  }}
                >
                  {t('projects.cancel')}
                </Button>
              )}

              {docItem && !isEditorViewMode && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setEditorContent(docItem.content);
                      setIsEditorViewMode(true);
                    }}
                  >
                    {t('projects.edit')}
                  </Button>
                  {/* <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    confirm.onTrue();
                  }}
                >
                  Delete
                </Button> */}
                </>
              )}
              {(!docItem || (docItem && isEditorViewMode)) && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => {
                    addNewDocument();
                    if (docItem) setIsEditorViewMode(false);
                  }}
                  disabled={documentLoading}
                  sx={{
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    textTransform: 'none',
                    padding: '4px 25px',
                    bgcolor: '#006A67',
                  }}
                >
                  {documentLoading ? (
                    <CircularProgress size={24} sx={{ color: 'primary.contrastText' }} />
                  ) : docItem ? (
                    t('projects.save')
                  ) : (
                    t('projects.add')
                  )}
                </Button>
              )}
            </Stack>
          )}
          {!docItem && (
            <>
              {projectDetails?.creatorId === zetaUser?.id || isProjectOwner ? (
                <>
                  {!isEditing && !stripHtml(editorContent) ? (
                    <TextField
                      placeholder={t('projects.start_typing')}
                      onClick={() => setIsEditing(true)}
                      value={stripHtml(editorContent)}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  ) : (
                    <CkEditorComponent
                      data={editorContent}
                      employeesData={usersList?.users}
                      onChange={(data) => {
                        setEditorContent(data);
                        localStorage.setItem('editorContentProject', data);
                      }}
                    />
                  )}
                </>
              ) : (
                <EmptyContent
                  filled
                  sx={{ py: 10 }}
                  title={t('projects.no_overview_found')}
                  description={t('projects.no_overview_available')}
                />
              )}
            </>
          )}

          {docItem && (
            <>
              {isEditorViewMode ? (
                <CkEditorComponent
                  data={editorContent}
                  employeesData={usersList?.users}
                  onChange={(data) => {
                    setEditorContent(data);
                    localStorage.setItem('editorContentProject', data);
                  }}
                />
              ) : (
                <CkEditorPreview content={docItem?.content} />
              )}
            </>
          )}
        </div>
      </Box>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('projects.delete')}
        content={t('projects.are_you_deleted_overview')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (documentId) {
                handleDeleteDocument(documentId);
                confirm.onFalse();
              }
            }}
          >
            {t('projects.delete')}
          </Button>
        }
      />
    </Scrollbar>
  );
}
