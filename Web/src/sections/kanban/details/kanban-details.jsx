import dayjs from 'dayjs';
import { useState, useCallback, useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanDetailsToolbar } from './kanban-details-toolbar';
import { KanbanInputName } from '../components/kanban-input-name';
import { KanbanDetailsPriority } from './kanban-details-priority';
import { KanbanDetailsAttachments } from './kanban-details-attachments';
import { KanbanDetailsCommentList } from './kanban-details-comment-list';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';
import { KanbanListView } from '../view/kanban-list-view';
import CkEditorComponent from 'src/components/htmlEditor/CkEditorComponent';
import { KanbanAddRemainder } from 'src/sections/kanban/kanban-add-reminder';
import { KanbanTodo } from 'src/sections/kanban/kanban-todo';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { Grid } from '@mui/material';
import AvatarGroup from '@mui/material/AvatarGroup';
import { useTranslation } from 'react-i18next';
import { updateTask } from 'src/actions/task/taskActions';
import { toast } from 'src/components/snackbar';
import { addDocument, updateDocument, deleteDocument } from 'src/actions/document/documentActions';
import CkEditorPreview from 'src/components/htmlEditor/CkEditorPreview';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { KanbanTimeline } from './kanban-timeline';
import { getTaskDetail } from 'src/actions/task/taskActions';
import { useAuthContext } from 'src/auth/hooks';
import { EmptyContent } from 'src/components/empty-content';
import CircularProgress from '@mui/material/CircularProgress';

// ----------------------------------------------------------------------

const SUBTASKS = [
  'Complete project proposal',
  'Conduct market research',
  'Design user interface mockups',
  'Develop backend api',
  'Implement authentication system',
];

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

export function KanbanDetails({
  task,
  openDetails,
  onUpdateTask,
  onDeleteTask,
  onCloseDetails,
  mainListMutate,
  documentList,
  documentListLoading,
  documentListError,
  mutateDocument,
  onCopyLink,
  taskDescriptionStr,
  isUser,
  userId,
  allUsers,
  isTicket,
  anchor = 'right',
  publicLink,
  handleWhatsAppShare,
}) {
  const { taskDetails, taskDetailsLoading, taskDetailsError, mutate } = getTaskDetail(
    task?.id,
    openDetails
  );
  const { zetaUser } = useAuthContext();

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

  const docItem = documentList?.documents[0]?.documentVersionList[0];

  const documentId = documentList?.documents[0]?.id;
  const documentVersionId = documentList?.documents[0]?.documentVersionList[0]?.id;
  const confirm = useBoolean();

  console.log('this is the kanban details', task);

  const { t, i18n } = useTranslation('dashboard/tasks');
  const tabs = useTabs('overview');
  const isSubTask = true;
  const [priority, setPriority] = useState(task?.priority);

  const [taskName, setTaskName] = useState(taskDescriptionStr);

  const [subtaskCompleted, setSubtaskCompleted] = useState(SUBTASKS.slice(0, 2));

  const like = useBoolean();

  const contacts = useBoolean();

  const [taskDescription, setTaskDescription] = useState(taskDescriptionStr);

  const [remainder, setRemainder] = useState(false);

  const [reminders, setReminders] = useState([]);

  const [showAllReminders, setShowAllReminders] = useState(false);

  const displayedReminders = showAllReminders ? reminders : reminders.slice(0, 3);

  const handleOpenRemainder = () => {
    setRemainder(true);
  };
  const handleRemainderDialogClose = () => {
    setTimeout(() => {
      setRemainder(false);
    }, 100);
  };

  const handleDeleteReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  const [todo, setTodo] = useState(false);
  const [todos, setTodos] = useState([]);

  const [showAllTodo, setShowAllTodo] = useState(false);
  const isTaskFile = true;

  const allTodosFlat = todos?.flatMap((group, groupIndex) =>
    group?.todos?.map((todo, index) => ({
      todo,
      groupIndex,
      index,
    }))
  );

  const displayedTodo = showAllTodo ? allTodosFlat : allTodosFlat.slice(0, 3);

  const handleOpenTodo = () => {
    setTodo(true);
  };
  const handleTodoDialogClose = () => {
    setTimeout(() => {
      setTodo(false);
    }, 100);
  };

  const addTodo = (newTodo) => {
    setTodos((prev) => [...prev, newTodo]);
  };

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

  console.log('this is the todos', todos);
  const rangePicker =
    task?.due && task?.due.length === 2
      ? useDateRangePicker(dayjs(task?.due[0]), dayjs(task?.due[1]))
      : null;

  const handleChangeTaskName = useCallback((event) => {
    setTaskName(event.target.value);
  }, []);

  const handleUpdateTask = useCallback(
    (event) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({ ...task, name: taskName });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleDeleteDocument = async (id) => {
    if (id) {
      try {
        const response = await deleteDocument(id);
        if (response.success) {
          await mutateDocument();
          await mainListMutate();
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

  const handleChangeTaskDescription = useCallback((event) => {
    setTaskDescription(event.target.value);
  }, []);

  const handleChangePriority = useCallback((newValue) => {
    setPriority(newValue);
  }, []);

  const handleClickSubtaskComplete = (taskId) => {
    const selected = subtaskCompleted.includes(taskId)
      ? subtaskCompleted.filter((value) => value !== taskId)
      : [...subtaskCompleted, taskId];

    setSubtaskCompleted(selected);
  };
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isEditorViewMode, setIsEditorViewMode] = useState(false); // NEW state

  const [editorContent, setEditorContent] = useState(localStorage.getItem('editorContent') || '');
  const editorRef = useRef(null);

  const [documentLoading, setDocumentLoading] = useState(false);

  useEffect(() => {
    if (openDetails) {
      if (docItem) {
        setEditorContent(docItem.content || '');
        setIsEditorViewMode(false); // Start in preview mode for existing document
        setIsEditing(false); // Not in "new doc textfield" mode
      } else {
        // No document item, so this is for a new document for the current task
        setEditorContent(''); // Start with empty content
        setIsEditing(false); // Show placeholder for new document initially
        setIsEditorViewMode(false); // Not in editor view mode
      }
    }
    // Note: This effect handles the *initialization* of editorContent for the current task.
    // The CkEditor's onChange will still update localStorage['editorContent'],
    // and addNewDocument will read from it, which seems to be the intended temporary persistence mechanism.
  }, [openDetails, docItem, task?.id]); // task.id ensures effect re-runs if the task itself changes

  const renderToolbar = (
    <>
      <KanbanDetailsToolbar
        liked={like.value}
        taskName={taskDescriptionStr}
        taskId={task?.serial}
        onLike={like.onToggle}
        onDelete={onDeleteTask}
        taskStatus={task?.statusName?.value}
        onCloseDetails={onCloseDetails}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        activeTab={tabs.value}
        subTaskCount={task?.subTasks?.length}
        onCopyLink={handleCopyLink}
        task={task}
        taskCost={taskDetails?.details?.cost}
        taskDuration={taskDetails?.details?.duration}
        publicLink={publicLink}
        handleWhatsAppShare={handleWhatsAppShare}
        startDate={taskDetails?.details?.startDate}
        endDate={taskDetails?.details?.endDate}
        actualStartDate={taskDetails?.details?.actualStartDate}
        actualEndDate={taskDetails?.details?.actualEndDate}
      />
    </>
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
                label: `${t('tasks.kanban_details.subtasks_label')} (${task?.childTaskCount})`,
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
                label: `${t('tasks.kanban_details.activities')} (${task?.todoCount || 0})`,
              },
            ]
          : []),
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

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
      taskId: task?.id,
    };

    const updatePayload = {
      id: documentId,
      type: 4,
      documentContent: {
        id: documentVersionId,
        content: savedContent,
      },
      taskId: task?.id,
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
          id: task?.id,
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
          await mainListMutate();
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

  const renderTabOverview = (
    <Box sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
      <div ref={editorRef}>
        {task?.creatorId === zetaUser?.id && (
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
            {task?.creatorId === zetaUser?.id ? (
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
                    employeesData={allUsers}
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
                    isTaskFile={isTaskFile}
                    taskId={task?.id}
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
                employeesData={allUsers}
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
                isTaskFile={isTaskFile}
                taskId={task?.id}
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
    <Box>
      <Box sx={{ pb: 2 }}>
        <KanbanAddRemainder
          open={remainder}
          handleClose={handleRemainderDialogClose}
          reminders={reminders}
          handleDeleteReminder={handleDeleteReminder}
          mainListMutate={mainListMutate}
          taskId={task?.id}
          userId={userId}
          isUser={isUser}
        />
        {/* <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography> {t('tasks.kanban_details.add_activities')} </Typography>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleOpenTodo}
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: '#006A67',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    cursor: 'pointer',
                  }}
                >
                  <Iconify icon="mingcute:add-line" />
                </IconButton>
                <KanbanTodo
                  open={todo}
                  handleClose={handleTodoDialogClose}
                  addTodo={addTodo}
                  todosList={todos}
                  displayedTodo={displayedTodo}
                  handleDeleteTodo={handleDeleteTodo}
                />
              </Box>
            </Box>

            {todos.length > 0 && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {displayedTodo.map(({ todo, groupIndex, index }) => (
                  <Paper
                    key={`${groupIndex}-${index}`}
                    sx={{
                      p: 1,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox />
                      <Typography>{todo}</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTodo(groupIndex, index)}
                      sx={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Paper>
                ))}

                {allTodosFlat.length > 3 && (
                  <Box textAlign="end">
                    <Button
                      size="small"
                      sx={{ cursor: 'pointer', mt: 1 }}
                      variant="contained"
                      onClick={handleOpenTodo}
                    >
                      View More
                    </Button>
                  </Box>
                )}
              </Stack>
            )}
          </Grid> */}
      </Box>
    </Box>
  );

  const renderTabSubtasks = (
    <KanbanListView
      subTask={task?.subTasks}
      taskMembers={task?.members}
      isSubTask={isSubTask}
      parentTaskId={task?.id}
      parentTask={task}
      passedMainListMutate={mainListMutate}
      userId={userId}
      isUser={isUser}
    />
  );

  const renderTabComments = (
    <>
      <KanbanDetailsCommentList
        comments={task?.comments}
        task={task}
        userId={userId}
        isUser={isUser}
        mutateDetails={mutate}
      />
    </>
  );

  return (
    <>
      <Drawer
        open={openDetails}
        onClose={onCloseDetails}
        anchor={anchor}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{
          sx: {
            width: isFullscreen ? '100%' : { xs: '100%', sm: 480, md: '85%', lg: '85%', xl: '85%' },
            boxShadow: '-1px 0px 8px rgb(142 142 142 / 50%)',
          },
        }}
      >
        {renderToolbar}

        {renderTabs}

        <Scrollbar fillContent sx={{ py: 1, px: 2.5 }}>
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
        </Scrollbar>

        {/* {tabs.value === 'comments' && <KanbanDetailsCommentInput task={task} />} */}
      </Drawer>
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
    </>
  );
}
