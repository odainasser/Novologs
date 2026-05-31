import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Stack,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Iconify } from 'src/components/iconify';
import { KanbanMembers } from './kanban-members';
import { Field } from 'src/components/hook-form';
import { _members } from 'src/sections/kanban/kanban-mock-data';
import dayjs from 'dayjs';
import { toast } from 'src/components/snackbar';
import { fDate, fTime } from 'src/utils/format-time';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import AvatarGroup from '@mui/material/AvatarGroup';
import Tooltip from '@mui/material/Tooltip';
import { Scrollbar } from 'src/components/scrollbar';
import Switch from '@mui/material/Switch';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import { useForm, FormProvider } from 'react-hook-form'; // Import RHF hooks
import { useAuthContext } from 'src/auth/hooks';

import { getUser } from 'src/actions/user-manage/userManageActions';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { addTodoItem, getTodo, changeTodoStatus, deleteTodo } from 'src/actions/task/taskActions';
import { tasks } from 'src/theme/core';
import CircleIcon from '@mui/icons-material/Circle';

export function KanbanAddRemainder({
  open,
  handleClose,
  editorRef,
  addReminder,
  reminders,
  mainListMutate,
  taskId,
  isUser,
  userId,
  isMyTodo,
  getDayRangeISO,
  selectedDate,
}) {
  const getTodoParams = useMemo(() => {
    const { startOfDay, endOfDay } = isMyTodo
      ? getDayRangeISO(selectedDate)
      : { startOfDay: null, endOfDay: null };

    const subFilters = [];
    if (isMyTodo) {
      subFilters.push({
        fieldName: 'Created',
        operator: 4,
        fieldValue: endOfDay,
      });
    }

    return {
      search: {
        fieldName: taskId ? 'TaskId' : 'Created',
        fieldValue: taskId ? taskId : startOfDay,
        operator: taskId ? 0 : 3,
        logicOperator: 0,
        subFilters,
      },
      pagination: {
        pageNumber: 1,
        pageSize: 100,
      },
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
    };
  }, [selectedDate]);

  const {
    todoList,
    todoListLoading,
    todoListError,
    todoListValidating,
    todoListEmpty,
    mutate: mutateTodo,
  } = getTodo(getTodoParams);

  const confirm = useBoolean();

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

  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const [showStartDate, setShowStartDate] = useState(false);

  const [selectedPersons, setSelectedPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [mode, setMode] = useState('reminder');
  const [checkedReminders, setCheckedReminders] = useState({});
  const [selectedReminderId, setSelectedReminderId] = useState(null);

  const completeConfirm = useBoolean();
  const [reminderData, setReminderData] = useState([]);
  useEffect(() => {
    if (todoList?.todos) {
      const sortedTodos = [...todoList.todos].sort((a, b) => {
        const dateA = new Date(a.lastModified);
        const dateB = new Date(b.lastModified);
        return dateB - dateA;
      });
      setReminderData(sortedTodos);

      const initialCheckedState = {};
      sortedTodos.forEach((reminder, index) => {
        const member = reminder.members?.find((m) => m.memberId === zetaUser?.id);
        initialCheckedState[index] = member?.status === 2;
      });
      setCheckedReminders(initialCheckedState);
    } else {
      setReminderData([]);
      setCheckedReminders({});
    }
  }, [todoList]);

  const methods = useForm({
    defaultValues: {
      description: '',
      start: null,
    },
  });

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const [reminderToCompleteIndex, setReminderToCompleteIndex] = useState(null);

  const handleToggleChecked = (index) => {
    if (!checkedReminders[index]) {
      setReminderToCompleteIndex(index);
      completeConfirm.onTrue();
    } else {
      setCheckedReminders((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    }
  };

  const handleConfirmCompleteReminder = async () => {
    if (reminderToCompleteIndex !== null) {
      const reminderToComplete = reminderData[reminderToCompleteIndex];
      if (reminderToComplete) {
        console.log('Completing reminder with ID:', reminderToComplete.id);
        const payload = {
          id: reminderToComplete.id,
          status: 2,
        };
        try {
          const response = await changeTodoStatus(payload);

          if (response.success) {
            setLoading(false);
            setCheckedReminders((prev) => ({
              ...prev,
              [reminderToCompleteIndex]: true,
            }));
            completeConfirm.onFalse();
            setReminderToCompleteIndex(null);
            await mutateTodo();
            toast.success(t('tasks.reminder.activity_completed'));
          } else {
            toast.error(response.error);
          }
        } catch (error) {
          console.error(error);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleTogglePerson = (person) => {
    setSelectedPersons((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  };

  const handleDeselectPerson = (id) => {
    setSelectedPersons((prev) => prev.filter((person) => person.id !== id));
  };

  const handleDeleteReminder = async (id) => {
    if (id) {
      try {
        const response = await deleteTodo(id);
        if (response.success) {
          await mutateTodo();
          await mainListMutate();
          toast.success(t('tasks.reminder.deleted'));
        } else {
          toast.error(response.error || t('tasks.reminder.failed'));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t('tasks.reminder.error'));
      }
    }
  };

  const handleCancel = () => {
    setSelectedPersons([]);
    reset();
    if (handleClose) handleClose();
  };

  const handleSubmit = async (data) => {
    if (!data.description?.trim()) {
      toast.error(t('tasks.reminder.description_required'));
    }

    setLoading(true);
    const startDate = fDate(data.start || dayjs().format());
    const startTime = fTime(data.start || dayjs().format());
    console.log('this is the startDate', startDate);
    console.log('this is the startTime', startTime);
    const combined = `${startDate} ${startTime}`;

    const reminderDateTime = dayjs(combined, 'DD-MM-YYYY hh:mm a').toISOString();

    const newReminder = {
      content: data.description.trim(),
      reminderDateTime,
      memberIds: selectedPersons.map((person) => person.id),
      ...(!isMyTodo && { taskId }),
    };

    try {
      const response = await addTodoItem(newReminder);

      if (response.success) {
        setLoading(false);
        reset();
        setSelectedPersons([]);

        await mutateTodo();
        if (!isMyTodo) {
          await mainListMutate();
        }
        toast.success(t('tasks.reminder.success'));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const totalReminders = reminderData?.length || 0;
  const completedCount = reminderData?.filter((reminder) => reminder.status === 2).length || 0;
  // const completedCount =
  // reminderData?.filter((reminder) =>
  //   reminder?.members?.find((member) => member.memberId === zetaUser?.id)?.status === 2
  // ).length || 0;

  const progressValue = totalReminders > 0 ? (completedCount / totalReminders) * 100 : 0;
  return (
    <>
      {!isUser && (
        <FormProvider {...methods}>
          <form onSubmit={rhfHandleSubmit(handleSubmit)}>
            <Card>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2 }}
              >
                <Stack sx={{ width: '30%' }}>
                  <Field.Text
                    name="description"
                    label={t('tasks.todo.dialog_title')}
                    required
                    sx={{
                      '& .MuiInputBase-input': { padding: '9px 14px' },
                      '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                    }}
                  />
                </Stack>

                <Stack>
                  <Field.MobileDateTimePicker
                    name="start"
                    label={t('tasks.reminder.date')}
                    sx={{
                      '& .MuiInputBase-input': { padding: '9px 14px' },
                      '& .MuiInputLabel-root': { top: '-5px', fontSize: '10px' },
                    }}
                  />
                </Stack>

                {!zetaUser?.roles?.includes('External') && (
                  <Stack direction="row">
                    <Typography variant="subtitle2">{t('tasks.reminder.add_members')}</Typography>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => setMembersOpen(true)}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        ml: 2,
                        ...(storedLang === 'ar' && { mr: 1 }),
                      }}
                    >
                      <Iconify icon="mingcute:add-line" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>

              {/* Show selected persons below only if isMyTodo is true */}
              {selectedPersons?.length > 0 && (
                <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ px: 2, pb: 2 }}>
                  {selectedPersons.map((person) => (
                    <Chip
                      key={person.id}
                      sx={{ ...(storedLang === 'ar' && { p: 1.5 }) }}
                      avatar={
                        <Avatar
                          alt={person.fullName}
                          src={
                            person.profileImageFileUrl || person?.fullName?.charAt(0).toUpperCase()
                          }
                        />
                      }
                      label={person.fullName}
                      size="medium"
                      variant="outlined"
                      onDelete={() => handleDeselectPerson(person.id)}
                    />
                  ))}
                </Stack>
              )}

              <KanbanMembers
                open={membersOpen}
                shared={usersList?.users?.filter((user) => user.id !== zetaUser?.id)}
                selectedPersons={selectedPersons}
                handleClose={() => setMembersOpen(false)}
                onTogglePerson={handleTogglePerson}
                mode={mode}
              />
            </Card>
            <Box display="flex" justifyContent="flex-end" px={2} pt={1}>
              <LoadingButton
                variant="contained"
                loading={loading}
                type="submit"
                sx={{
                  bgcolor: !watch('description')?.trim() ? 'grey.400' : '#006A67',
                }}
              >
                {t('tasks.reminder.add')}
              </LoadingButton>
            </Box>
          </form>
        </FormProvider>
      )}

      {reminderData?.length > 0 ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box px={3}>
            <Typography variant="subtitle2" mb={0.5}>
              {completedCount} of {totalReminders} {t('tasks.members-a.completed')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
          <Scrollbar>
            <Box
              sx={{
                maxHeight: isMyTodo ? 450 : 535,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: '4px',
                  background: '#006A67',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#006A67 transparent', // For Firefox
              }}
            >
              {reminderData?.map((reminder, index) => (
                <>
                  <Paper
                    key={index}
                    sx={{
                      p: 1,
                      mb: 1,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box display="flex" alignItems="center" flexGrow={1}>
                      {!isUser &&
                        reminder?.members?.some((member) => member.memberId === zetaUser?.id) && (
                          <Checkbox
                            checked={!!checkedReminders[index]}
                            onChange={() => handleToggleChecked(index)}
                            disabled={
                              reminder?.members?.find((member) => member.memberId === zetaUser?.id)
                                ?.status === 2
                            }
                            style={{ marginRight: 8 }}
                          />
                        )}
                      <Box>
                        <Typography
                          sx={{
                            textDecoration: checkedReminders[index] ? 'line-through' : 'none',
                            color: checkedReminders[index] ? 'grey' : '',
                          }}
                        >
                          {reminder.content}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                          <>
                            {reminder?.members?.map((member) => {
                              const user = usersList?.users?.find((u) => u.id === member.memberId);

                              if (!user) return null;

                              return (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Tooltip title={user?.fullName} arrow key={user.id}>
                                    <Avatar
                                      alt={user?.fullName}
                                      src={
                                        user?.profileImageFileUrl ||
                                        user?.fullName?.charAt(0).toUpperCase()
                                      }
                                      sx={{ width: 30, height: 30 }}
                                    />
                                  </Tooltip>

                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500, lineHeight: 1.2 }}
                                    >
                                      {user?.fullName}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ lineHeight: 1.2 }}
                                    >
                                      {user?.email}
                                    </Typography>

                                    <Box display="flex" alignItems="center" gap={0.5} mt={0.2}>
                                      <CircleIcon
                                        sx={{
                                          fontSize: 10,
                                          color:
                                            member?.status === 2 ? 'success.main' : 'warning.main',
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                        {member?.status === 2 ? 'Completed' : 'Pending'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            })}
                          </>
                        </Stack>
                      </Box>
                    </Box>

                    <Box display="flex" gap={1} alignItems="center">
                      <Typography variant="body2">
                        {reminder.reminderDateTime
                          ? dayjs(reminder.reminderDateTime).isValid()
                            ? dayjs(reminder.reminderDateTime).format('DD-MM-YYYY hh:mm A')
                            : t('tasks.reminder.invalid_date')
                          : t('tasks.reminder.no_reminder')}
                      </Typography>
                      {!checkedReminders[index] &&
                        !isUser &&
                        !reminder?.members?.some((member) => member?.status === 2) &&
                        reminder?.members?.some(
                          (member) => member.memberId === zetaUser?.id && member?.isOwner
                        ) && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedReminderId(reminder?.id);
                              confirm.onTrue();
                            }}
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={15} />
                          </IconButton>
                        )}
                    </Box>
                  </Paper>
                </>
              ))}
            </Box>
          </Scrollbar>
        </Stack>
      ) : (
        <EmptyContent
          filled
          sx={{ py: 10, mt: 1 }}
          title={t('tasks.reminder.no_activities_available')}
        />
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.reminder.delete_activity')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedReminderId) {
                handleDeleteReminder(selectedReminderId);
                confirm.onFalse();
              }
            }}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('tasks.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <ConfirmDialog
        open={completeConfirm.value}
        onClose={() => {
          completeConfirm.onFalse();
          setReminderToCompleteIndex(null);
        }}
        title={t('tasks.reminder.title')}
        content={t('tasks.reminder.content')}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmCompleteReminder}
            sx={{ bgcolor: '#006A67', ...(storedLang === 'ar' && { ml: 1 }) }}
          >
            {t('tasks.reminder.complete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}
