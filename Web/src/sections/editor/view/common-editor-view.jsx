'use client';
import Box from '@mui/material/Box';

import { useState, useRef, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import CkEditorComponent from 'src/components/htmlEditor/CkEditorComponent';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';
import CkEditorPreview from 'src/components/htmlEditor/CkEditorPreview';
import { Stack, Button } from '@mui/material';
import { getDocument } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';
import { addDocument, updateDocument, deleteDocument } from 'src/actions/document/documentActions';
import { updateTask } from 'src/actions/task/taskActions';

export function CommonEditorView({ mainListMutate, task }) {
  console.log('this is the task', task);
  const shouldFetchDocument = !!task?.documentId;

  const getDocParams = shouldFetchDocument
    ? {
        search: {
          fieldName: 'Id',
          fieldValue: task.documentId,
          operator: 0,
          logicOperator: 0,
        },
        pagination: {
          pageNumber: 1,
          pageSize: 100,
        },
      }
    : null;

  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);

  const { t, i18n } = useTranslation('dashboard/documents');
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  const docItem = documentList?.documents[0]?.documentVersionList[0];

  const documentId = documentList?.documents[0]?.id;
  const documentVersionId = documentList?.documents[0]?.documentVersionList[0]?.id;

  const [isEditorViewMode, setIsEditorViewMode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(localStorage.getItem('editorContent') || '');
  const editorRef = useRef(null);

  const addNewDocument = async () => {
    const savedContent = localStorage.getItem('editorContent');
    if (!savedContent) {
      toast.error(t('documents.actions.no_content'));
      return;
    }

    const payload = {
      type: 4,
      documentContent: {
        content: savedContent,
      },
    };

    const updatePayload = {
      id: documentId,
      type: 4,
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
          localStorage.removeItem('editorContent');
          await mutateDocument();
          await mainListMutate();
          toast.success(t('documents.toast.document_update'));
        } else {
          toast.error(t('documents.toast.failed_document'));
        }
      } else {
        response = await addDocument(payload);
        docId = response?.response?.data?.successStatus?.id;

        if (!docId) {
          toast.error(t('documents.toast.failed_add'));
          return;
        }

        const taskPayload = {
          id: task?.id,
          code: task?.code,
          description: task?.description,
          projectId: task?.projectId,
          categoryId: task?.categoryId,
          priorityId: task?.priorityId,
          startDate: task?.startDate,
          endDate: task?.endDate,
          isAssignedToMe:
            task?.members.length === 1 && task.creatorId === task.members[0]?.memberId
              ? true
              : false,
          membersIds: task?.members?.map((person) => person.memberId),
          isConfidential: task?.isConfidential,
          clientId: task?.clientId,
          clientLeadId: task?.clientLeadId,
          vendorId: task?.vendorId,
          vendorContractId: task?.vendorContractId,
          documentId: docId,
        };

        const taskUpdateResponse = await updateTask(taskPayload);

        if (response.success && taskUpdateResponse?.success !== false) {
          setEditorContent('');
          localStorage.removeItem('editorContent');
          await mutateDocument();
          await mainListMutate();
          toast.success(t('documents.toast.document_link'));
        } else {
          toast.error(t('documents.toast.document_add_fail'));
        }
      }
    } catch (error) {
      console.error('Document operation failed:', error);
      toast.error(t('documents.toast.unexpected_error_delete'));
    }
  };

  return (
    <Scrollbar fillContent sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <div ref={editorRef}>
          {!docItem && (
            <>
              {!isEditing && !stripHtml(editorContent) ? (
                <TextField
                  placeholder={t('tasks.kanban_details.start_typing')}
                  onClick={() => setIsEditing(true)}
                  value={stripHtml(editorContent)}
                  multiline
                  minRows={3}
                  fullWidth
                />
              ) : (
                <CkEditorComponent
                  data={editorContent}
                  onChange={(data) => {
                    setEditorContent(data);
                    localStorage.setItem('editorContent', data);
                  }}
                />
              )}
            </>
          )}

          {docItem && (
            <>
              {isEditorViewMode ? (
                <CkEditorComponent
                  data={editorContent}
                  onChange={(data) => {
                    setEditorContent(data);
                    localStorage.setItem('editorContent', data);
                  }}
                />
              ) : (
                <CkEditorPreview content={docItem?.content} />
              )}
            </>
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, gap: 1 }}>
            {docItem && isEditorViewMode && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setIsEditorViewMode(false);
                  setEditorContent(docItem.content);
                }}
              >
                {t('documents.actions.cancel')}
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
                 {t('documents.actions.edit')}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    confirm.onTrue();
                  }}
                >
                   {t('documents.actions.delete')}
                </Button>
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
                sx={{
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  textTransform: 'none',
                  padding: '4px 25px',
                  bgcolor: '#006A67',
                }}
              >
                {docItem ? t('documents.actions.save') :  t('documents.actions.delete')}
              </Button>
            )}
          </Stack>
        </div>
      </Box>
    </Scrollbar>
  );
}
