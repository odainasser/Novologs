'use client';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import Tab from '@mui/material/Tab';

import { DashboardContent } from 'src/layouts/dashboard';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { KanbanDetailsToolbar } from './kanban-details-toolbar';

import { CustomTabs } from 'src/components/custom-tabs';
import CkEditorComponent from 'src/components/html-editor/ck-editor-component';

import CkEditorPreview from 'src/components/html-editor/ck-editor-preview';

import { KanbanAddRemainder } from 'src/sections/kanban/kanban-add-reminder';

import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';
import { KanbanDetailsCommentList } from './kanban-details-comment-list';

import { KanbanTimeline } from './kanban-timeline';

import { EmptyContent } from 'src/components/empty-content';

import { getTaskDetail } from 'src/actions/task/taskActions';
import { getDocument } from 'src/actions/document/documentActions';

import { useAuthContext } from 'src/auth/hooks';
import { addDocument, updateDocument, deleteDocument } from 'src/actions/document/documentActions';
import { updateTask } from 'src/actions/task/taskActions';
import { toast } from 'src/components/snackbar';
import TextField from '@mui/material/TextField';
import { getAvailableUser } from 'src/actions/task/taskActions';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CONFIG } from 'src/config-global';

export function TaskDetails({ taskId }) {
  const { t } = useTranslation('dashboard/tasks');
  const { zetaUser } = useAuthContext();
  const isUser = false;
  const isTicket = false;
  const forShare = true;
  const isSubTask = true;
  const confirm = useBoolean();
  const [publicLink, setPublicLink] = useState('');
  useEffect(() => {
    if (taskId) {
      setPublicLink(`${CONFIG.zetaApiUrl}/dashboard/kanban/${taskId}/details`);
      console.log('Public link set to:', `${CONFIG.zetaApiUrl}dashboard/kanban/${taskId}/details`);
    }
  }, [taskId]);
  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    if (!navigator?.clipboard) {
      fallbackCopyText(publicLink);
      return;
    }

    try {
      await navigator.clipboard.writeText(publicLink);
      toast.success(t('tasks.toast.link_copied'));
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      fallbackCopyText(publicLink);
    }
  };
  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // avoid scrolling
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };
  const { taskDetails, taskDetailsLoading, taskDetailsError, mutate } = getTaskDetail(taskId, true);
  const getAvailableUsersParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
    employeeId: zetaUser?.id,
  };

  const { availableUsersList, mutate: mutateAvailableUsers } =
    getAvailableUser(getAvailableUsersParams);
  const getDocParams = useMemo(() => {
    if (taskDetails?.details?.documentId) {
      return {
        search: {
          fieldName: 'Id',
          fieldValue: taskDetails?.details.documentId,
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
  }, [taskDetails?.details?.documentId]);

  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);

  const docItem = documentList?.documents[0]?.documentVersionList[0];
  const documentId = documentList?.documents[0]?.id;
  const documentVersionId = documentList?.documents[0]?.documentVersionList[0]?.id;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const tabs = useTabs('overview');
  const like = useBoolean();
  const contacts = useBoolean();
  const {
    primaryDescription,
    secondaryDescription,
    descriptionStr,
    descriptionEng,
    descriptionArabic,
  } = useMemo(() => {
    let fullDescription = '';
    let englishDescription = '';
    let arabicDescription = '';

    try {
      const parsedDescription = JSON.parse(taskDetails?.details?.description);

      if (parsedDescription?.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }

      if (parsedDescription?.TranscriptEnglishStr) {
        englishDescription = parsedDescription.TranscriptEnglishStr;
      }

      if (parsedDescription?.TranscriptArabicStr) {
        arabicDescription = parsedDescription.TranscriptArabicStr;
      }
    } catch (e) {
      fullDescription = taskDetails?.details?.description || '';
    }

    const descriptionStr = fullDescription;
    const words = fullDescription.split(' ');
    const descriptionEng = englishDescription;
    const descriptionArabic = arabicDescription;

    return {
      primaryDescription: words.slice(0, 5).join(' '),
      secondaryDescription: words.slice(5).join(' '),
      descriptionStr,
      descriptionEng,
      descriptionArabic,
    };
  }, [taskDetails?.details?.description]);

  const [editorContent, setEditorContent] = useState(localStorage.getItem('editorContent') || '');
  const [isEditorViewMode, setIsEditorViewMode] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const editorRef = useRef(null);

  const [todo, setTodo] = useState(false);
  const [todos, setTodos] = useState([]);
  const [showAllTodo, setShowAllTodo] = useState(false);
  const [remainder, setRemainder] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [showAllReminders, setShowAllReminders] = useState(false);
  const [taskName, setTaskName] = useState(descriptionStr);
  const [taskDescription, setTaskDescription] = useState(descriptionStr);
  const handleWhatsAppShare = () => {
    const message = `*${descriptionStr || 'Task'}*\n${publicLink}`;
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const displayedReminders = showAllReminders ? reminders : reminders.slice(0, 3);
  const handleDeleteReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };
  const allTodosFlat = todos?.flatMap((group, groupIndex) =>
    group?.todos?.map((todo, index) => ({ todo, groupIndex, index }))
  );

  const displayedTodo = showAllTodo ? allTodosFlat : allTodosFlat.slice(0, 3);

  const handleOpenRemainder = () => setRemainder(true);
  const handleRemainderDialogClose = () => setTimeout(() => setRemainder(false), 100);
  const handleOpenTodo = () => setTodo(true);
  const handleTodoDialogClose = () => setTimeout(() => setTodo(false), 100);

  const addTodo = (newTodo) => setTodos((prev) => [...prev, newTodo]);
  const handleDeleteTodo = (groupIndex, todoIndex) => {
    setTodos((prevTodos) => {
      const updatedTodos = [...prevTodos];
      updatedTodos[groupIndex] = {
        ...updatedTodos[groupIndex],
        todos: updatedTodos[groupIndex].todos.filter((_, i) => i !== todoIndex),
      };
      return updatedTodos.filter((group) => group.todos.length > 0);
    });
  };

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  const [isEditing, setIsEditing] = useState(false);
  const addNewDocument = async () => {
    setDocumentLoading(true);

    const savedContent = localStorage.getItem('editorContent');
    if (!savedContent) {
      toast.error(t('tasks.toast.no_content_save'));
      setDocumentLoading(false);
      return;
    }

    const payload = {
      type: 4,
      documentContent: {
        content: savedContent,
      },
      taskId: taskId,
    };

    const updatePayload = {
      id: documentId,
      type: 4,
      documentContent: {
        id: documentVersionId,
        content: savedContent,
      },
      taskId: taskId,
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
          // await mainListMutate();
          toast.success(t('tasks.toast.document_updated'));
        } else {
          toast.error(t('tasks.toast.failed_update_document'));
        }
      } else {
        response = await addDocument(payload);
        docId = response?.response?.data?.successStatus?.id;

        if (!docId) {
          toast.error(t('tasks.toast.failed_add_document'));
          setDocumentLoading(false);
          return;
        }

        const taskPayload = {
          id: taskId,
          code: task?.code,
          description: taskDescriptionStr,
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
          parentTaskId: task?.parentTaskId,
        };

        const taskUpdateResponse = await updateTask(taskPayload);

        if (response.success && taskUpdateResponse?.success !== false) {
          setEditorContent('');
          localStorage.removeItem('editorContent');
          await mutateDocument();
          // await mainListMutate();
          toast.success(t('tasks.toast.document_added_link'));
        } else {
          toast.error(response.error || t('tasks.toast.document_failed'));
        }
      }
    } catch (error) {
      console.error('Document operation failed:', error);
      toast.error(t('tasks.toast.document_error'));
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
          // await mainListMutate();
          toast.success(t('tasks.toast.document_deleted'));
        } else {
          toast.error(response.error || t('tasks.toast.failed_document'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('tasks.toast.unexpected_error'));
      }
    }
  };
  // ---------------- RENDER UI ----------------
  const renderToolbar = (
    <KanbanDetailsToolbar
      liked={like.value}
      taskName={descriptionStr}
      taskId={taskDetails?.details?.serial}
      onLike={like.onToggle}
      taskStatus={taskDetails?.details?.statusName?.value}
      toggleFullscreen={toggleFullscreen}
      isFullscreen={isFullscreen}
      activeTab={tabs.value}
      subTaskCount={taskDetails?.details?.subTasks?.length}
      onCopyLink={handleCopyLink}
      task={taskDetails?.details}
      taskCost={taskDetails?.details?.cost}
      taskDuration={taskDetails?.details?.duration}
      forShare={forShare}
      handleWhatsAppShare={handleWhatsAppShare}
    />
  );

  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {[
        { value: 'overview', label: t('tasks.kanban_details.overview') },

        ...(!isTicket
          ? [
              {
                value: 'subTasks',
                label: `${t('tasks.kanban_details.subtasks_label')} (${taskDetails?.details?.childTaskCount})`,
              },
            ]
          : []),

        ...(!zetaUser?.roles?.includes('External') && !isTicket
          ? [
              {
                value: 'timeline',
                label: t('tasks.kanban_details.timeline'),
              },
            ]
          : []),

        {
          value: 'comments',
          label: `${t('tasks.kanban_details.comments_label')} (${taskDetails?.details?.commentCount || 0})`,
        },
        ...(!isTicket
          ? [
              {
                value: 'activities',
                label: `${t('tasks.kanban_details.activities')} (${taskDetails?.details?.todoCount || 0})`,
              },
            ]
          : []),
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabOverview = (
    <Box sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
      <div ref={editorRef}>
        {taskDetails?.details?.creatorId === zetaUser?.id && (
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
                {t('tasks.reminder.cancel')}
              </Button>
            )}

            {!isUser && (
              <>
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
                      {t('tasks.edit')}
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
                      t('tasks.save')
                    ) : (
                      t('tasks.add')
                    )}
                  </Button>
                )}
              </>
            )}
          </Stack>
        )}

        {!docItem && (
          <>
            {taskDetails?.details?.creatorId === zetaUser?.id ? (
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
                    employeesData={availableUsersList?.users}
                    onChange={(data) => {
                      console.log('Saving to localStorage:', data);
                      setEditorContent(data);
                      if (typeof window !== 'undefined') {
                        try {
                          localStorage.setItem('editorContent', data);
                        } catch (error) {
                          console.error('localStorage error:', error);
                        }
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <EmptyContent
                filled
                sx={{ py: 10 }}
                title="No Overview Found"
                description="No overview available for this task."
              />
            )}
          </>
        )}

        {docItem && (
          <>
            {isEditorViewMode ? (
              <CkEditorComponent
                data={editorContent}
                employeesData={availableUsersList?.users}
                onChange={(data) => {
                  console.log('Saving to localStorage:', data);
                  setEditorContent(data);
                  if (typeof window !== 'undefined') {
                    try {
                      localStorage.setItem('editorContent', data);
                    } catch (error) {
                      console.error('localStorage error:', error);
                    }
                  }
                }}
              />
            ) : (
              <CkEditorPreview content={docItem?.content} />
            )}
          </>
        )}
      </div>
    </Box>
  );

  const renderActivities = (
    <KanbanAddRemainder
      open={remainder}
      handleClose={handleRemainderDialogClose}
      reminders={reminders}
      handleDeleteReminder={handleDeleteReminder}
      // mainListMutate={mainListMutate}
      taskId={taskDetails?.detail?.id}
      // userId={userId}
      isUser={isUser}
    />
  );

  const renderTabSubtasks = (
    <KanbanListView
      subTask={taskDetails?.details?.subTasks}
      taskMembers={taskDetails?.details?.members}
      isSubTask={isSubTask}
      parentTaskId={taskDetails?.details?.id}
      parentTask={taskDetails?.details}
      // passedMainListMutate={mainListMutate}
      // userId={userId}
      isUser={isUser}
    />
  );

  const renderTabComments = (
    <>
      <KanbanDetailsCommentList
        comments={taskDetails?.details?.comments}
        task={taskDetails?.details}
        // userId={userId}
        isUser={isUser}
        mutateDetails={mutate}
      />
    </>
  );

  return (
    <DashboardContent>
      {renderToolbar}
      {renderTabs}

      <Box sx={{ py: 1, px: 2.5 }}>
        {tabs.value === 'overview' && renderTabOverview}
        {tabs.value === 'subTasks' && renderTabSubtasks}
        {tabs.value === 'timeline' && (
          <KanbanTimeline
            taskDetails={taskDetails}
            taskDetailsLoading={taskDetailsLoading}
            taskDetailsError={taskDetailsError}
          />
        )}
        {tabs.value === 'comments' && renderTabComments}
        {tabs.value === 'activities' && renderActivities}
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.toast.document_confirm')}
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
            {t('tasks.delete')}
          </Button>
        }
      />
    </DashboardContent>
  );
}
