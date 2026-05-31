import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { toast } from 'src/components/snackbar';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import { Divider } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import Switch from '@mui/material/Switch';
import { useTranslation } from 'react-i18next';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Iconify } from 'src/components/iconify';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { fDate } from 'src/utils/format-time';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { updateTask, changeStatus } from 'src/actions/task/taskActions';
import { EmptyContent } from 'src/components/empty-content';
import CircularProgress from '@mui/material/CircularProgress';
import { ChangeTaskStatus } from './change-task-status';
import { getLocalizedValue } from 'src/utils/localization';

// ----------------------------------------------------------------------

export function KanbanMembers({
  open,
  shared = [],
  selectedPersons,
  setSelectedPersons,
  onClose,
  handleClose,
  onTogglePerson,
  mode,
  creatorName,
  creatorAvatar,
  creatorDesignation,
  assignToMe,
  setAssignToMe,
  isConfidential,
  setIsConfidential,
  handleUpdateTask,
  task,
  mutateTasks,
  statusList,
  reporterStatus,
  isTicket,
  taskCreator,
  ...other
}) {
  console.log('this is the mode', mode);
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const rangeInputPicker = useDateRangePicker(dayjs(), dayjs());
  const forward = useBoolean();

  console.log('this is the shared', shared);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredShared = shared.filter(
    (member) =>
      member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseMemberDialog = () => {
    setSearchQuery('');
    setRepeat(false);
    handleClose();
    // if (mode === 'forward') {
    //   forward.onFalse();
    // }
  };

  const { user } = useMockedUser();
  const [repeat, setRepeat] = useState(false);
  const [days, setDays] = useState({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: true,
  });

  const handleDayChange = (day) => (event) => {
    setDays({
      ...days,
      [day]: event.target.checked,
    });
  };
  const handleRepeatChange = (event) => {
    const isChecked = event.target.checked;
    setRepeat(isChecked);
    if (isChecked) {
      setDays({
        Mon: true,
        Tue: true,
        Wed: true,
        Thu: true,
        Fri: true,
        Sat: true,
        Sun: true,
      });
    }
  };

  const handleUpdateMembers = async () => {
    if (isSubmitting) return;
    let descriptionToSet = task.description;
    setIsSubmitting(true);

    try {
      const parsedDesc = JSON.parse(task.description);
      if (parsedDesc?.TranscriptStr) {
        descriptionToSet = parsedDesc.TranscriptStr;
      }
    } catch (e) {}
    const payload = {
      ...task,
      description: descriptionToSet,
      membersIds: assignToMe ? [] : selectedPersons.map((person) => person.id),
      isAssignedToMe: assignToMe,
    };

    console.log('this is the payload', payload);

    try {
      const response = await updateTask(payload);

      if (response.success) {
        toast.success(t('tasks.toast.members_added_successfully'));

        setAssignToMe(false);
        setSelectedPersons([]);

        await mutateTasks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Add update failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth={
          mode === 'reminder'
            ? 'xs'
            : mode === 'add' || mode === 'edit' || mode === 'forward' || mode === 'backlog'
              ? 'sm'
              : 'md'
        }
        open={open}
        sx={{
          '& .MuiDialog-paper': {
            height: mode === 'view' ? '60vh' : 'inherit',
            // maxHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
        onClose={handleCloseMemberDialog}
        {...other}
      >
        <DialogTitle>
          {!isTicket && (
            <>
              {mode === 'add' || mode === 'reminder' || mode === 'backlog'
                ? t('tasks.add_members')
                : mode === 'edit'
                  ? t('tasks.edit_members')
                  : mode === 'view'
                    ? t('tasks.members')
                    : t('tasks.members')}
            </>
          )}
          {isTicket && <>Add Members</>}
        </DialogTitle>

        {(mode === 'add' || mode === 'edit' || mode === 'backlog') && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
              sx={{ px: 3, pb: 1 }}
            >
              {!isTicket && (
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t('tasks.members-a.assign_to_me')}
                  </Typography>
                  <Switch
                    checked={assignToMe}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      setAssignToMe(isChecked);
                      if (isChecked) {
                        setSelectedPersons([]);
                      }
                    }}
                  />
                </Box>
              )}

              {/* {mode !== 'backlog' && !isTicket && (
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {t('tasks.members-a.confidential')}
                  </Typography>
                  <Switch
                    checked={isConfidential}
                    onChange={(event) => {
                      const isChecked = event.target.checked;
                      setIsConfidential(isChecked);
                    }}
                  />
                </Box>
              )} */}

              {/* <Box display="flex" alignItems="center">
                <Typography variant="body2" color="text.secondary" noWrap>
                  {t('tasks.repeat')}
                </Typography>
                <Switch checked={repeat} onChange={handleRepeatChange} />
              </Box> */}
            </Box>

            {repeat && (
              <>
                <Box display="flex" flexWrap="wrap" sx={{ px: 4, pb: 1 }}>
                  {Object.keys(days).map((day) => (
                    <FormControlLabel
                      key={day}
                      control={<Checkbox checked={days[day]} onChange={handleDayChange(day)} />}
                      label={day}
                    />
                  ))}
                </Box>
                <Box display="flex" flexWrap="wrap" sx={{ px: 4, pb: 1 }}>
                  <Button variant="contained" onClick={rangeInputPicker.onOpen} sx={{ px: 4 }}>
                    {t('tasks.select_data_range')}
                  </Button>
                </Box>

                <Box
                  sx={{ typography: 'body2', px: 4, mb: 2 }}
                  display="flex"
                  justifyContent="space-between"
                >
                  <div>
                    {' '}
                    {t('tasks.start_date')}: {fDate(rangeInputPicker.startDate)}
                  </div>
                  <div>
                    {t('tasks.end_date')}: {fDate(rangeInputPicker.endDate)}
                  </div>
                </Box>

                <CustomDateRangePicker
                  open={rangeInputPicker.open}
                  startDate={rangeInputPicker.startDate}
                  endDate={rangeInputPicker.endDate}
                  onChangeStartDate={rangeInputPicker.onChangeStartDate}
                  onChangeEndDate={rangeInputPicker.onChangeEndDate}
                  onClose={rangeInputPicker.onClose}
                  error={rangeInputPicker.error}
                />
              </>
            )}
          </>
        )}
        {(mode === 'add' ||
          mode === 'edit' ||
          mode === 'reminder' ||
          mode === 'forward' ||
          mode === 'backlog') &&
          !assignToMe && (
            <Box sx={{ px: 3 }}>
              <TextField
                fullWidth
                placeholder={t('tasks.members-a.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  mb: 1,
                  '& .MuiInputBase-input': {
                    padding: '10px 14px',
                  },
                  '& .MuiInputLabel-root': {
                    top: '-7px',
                  },
                }}
              />
            </Box>
          )}

        {filteredShared.length > 0 ? (
          <Scrollbar sx={{ height: 70 * 5, px: 3 }}>
            {mode === 'add' ||
            mode === 'edit' ||
            mode === 'reminder' ||
            mode === 'forward' ||
            mode === 'backlog' ? (
              !assignToMe && (
                <Box component="ul">
                  {filteredShared.map((member) => (
                    <SelectMember
                      key={member?.id}
                      employee={member}
                      isSelected={selectedPersons?.some((p) => p.id === member?.id)}
                      onTogglePerson={() => onTogglePerson(member)}
                      mode={mode}
                      assignToMe={assignToMe}
                    />
                  ))}
                </Box>
              )
            ) : (
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
                    alt={creatorName}
                    src={creatorAvatar}
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
                    {creatorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {t('tasks.forward.designation')} {creatorDesignation}
                  </Typography>

                  <Typography variant="caption" color="#006A67" noWrap>
                    {reporterStatus}
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
                  {filteredShared.map((member) => (
                    <ViewMember
                      key={member?.id}
                      employee={member}
                      statusList={statusList}
                      mutateTasks={mutateTasks}
                      task={task}
                      taskCreator={taskCreator}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Scrollbar>
        ) : (
          <EmptyContent
            filled
            title={t('tasks.no_members_found')}
            description={t('tasks.there_no_members_available')}
          />
        )}

        <DialogActions>
          {(mode === 'add' || mode === 'edit' || mode === 'reminder' || mode === 'forward') && (
            <Button
              variant="contained"
              onClick={handleCloseMemberDialog}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('tasks.cancel')}
            </Button>
          )}

          <Button
            variant="contained"
            onClick={(event) => {
              mode === 'backlog' ? handleUpdateMembers() : handleCloseMemberDialog();
            }}
            disabled={isSubmitting}
            sx={{
              ...(mode === 'backlog' ||
              mode === 'add' ||
              mode === 'edit' ||
              mode === 'reminder' ||
              mode === 'forward'
                ? { bgcolor: '#006A67' }
                : {}),
              bgcolor: isSubmitting ? 'grey.500' : '#006A67',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <>
                {mode === 'add' || mode === 'reminder'
                  ? t('tasks.add')
                  : mode === 'edit' || mode === 'backlog'
                    ? t('tasks.save')
                    : mode === 'forward'
                      ? t('tasks.add')
                      : t('tasks.close')}
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={forward.value}
        onClose={forward.onFalse}
        title={t('tasks.forward.forward')}
        content={t('tasks.forward.are_you_sure_want_forward')}
        action={
          <Button
            variant="contained"
            onClick={() => {
              handleUpdateTask();
              forward.onFalse();
            }}
          >
            {t('tasks.forward.send')}
          </Button>
        }
      />
    </>
  );
}

export function SelectMember({ employee, isSelected, onTogglePerson, mode, assignToMe }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  return (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
      <Tooltip title={employee?.email} arrow>
        <Avatar alt={employee?.fullName} src={employee?.profileImageFileUrl} sx={{ mr: 2 }}>
          {!employee?.profileImageFileUrl && employee?.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      </Tooltip>

      <ListItemText
        secondary={
          <>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{employee?.fullName}</span>

              <br />
              <span style={{ fontSize: '0.75rem' }}>
                Id : {String(employee?.serial).padStart(4, '0') || 'Not available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>

              <span style={{ fontSize: '0.75rem' }}>
                Code : {employee?.code || 'Not available'}
              </span>
              <br />

              <span style={{ fontSize: '0.75rem' }}>
                {t('tasks.designation')}:{' '}
                {employee?.designationName?.localizedStrings?.find(
                  (ls) => ls.language.toLowerCase() === storedLang
                )?.value ||
                  employee?.designationName?.value ||
                  'Not Available'}
              </span>
              <br />
              <span style={{ fontSize: '0.7rem' }}>
                {t('tasks.department')}:
                {employee?.departmentName?.localizedStrings?.find(
                  (ls) => ls.language.toLowerCase() === storedLang
                )?.value ||
                  employee?.departmentName?.value ||
                  'Not Available'}
              </span>
              <span style={{ margin: '0 2px' }}> , </span>
              <span
                style={{ fontSize: '0.7rem', color: employee?.lastWorkStatus?.workStatus?.color }}
              >
                {t('tasks.status')} :{' '}
                {employee?.lastWorkStatus?.workStatus?.name?.value || 'Not available'}
              </span>
            </div>
          </>
        }
        primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
        secondaryTypographyProps={{ noWrap: true, component: 'span' }}
        sx={{ flexGrow: 1, pr: 1 }}
      />

      {(mode === 'add' ||
        mode === 'edit' ||
        mode === 'reminder' ||
        mode === 'forward' ||
        mode === 'backlog') && <Checkbox checked={isSelected} onChange={onTogglePerson} />}
    </Box>
  );
}

export function ViewMember({ employee, task, statusList, mutateTasks, taskCreator }) {
  const { t } = useTranslation('dashboard/tasks');
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const storedLang = localStorage.getItem('selectedLang');

  const handleToggleStatus = (statusId) => {
    setSelectedStatus(statusId);
  };
  const handleOpenStatusDialog = () => {
    setOpenStatus(true);
  };

  const handleStatusDialogClose = () => {
    setTimeout(() => {
      setOpenStatus(false);
    }, 100);
  };

  const changeMemberStatus = async () => {
    const payload = {
      taskId: task?.id,
      statusId: selectedStatus,
      userId: employee?.memberId,
    };
    console.log('this is the payload', payload);

    try {
      const response = await changeStatus(payload);
      if (response.success) {
        toast.success('Status changed successfully');
        setSelectedStatus([]);
        await mutateTasks();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Change Status failed:', error);
    }
  };
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        borderRadius: 2,
        width: '100%',
        maxWidth: 160,
      }}
    >
      <Avatar
        alt={employee?.memberName}
        src={employee?.profileImageFileUrl || employee?.memberName?.charAt(0).toUpperCase()}
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
        {employee?.memberName}
      </Typography>

      <Typography variant="caption" color="text.secondary" noWrap>
        {employee?.email}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {employee?.designation?.localizedStrings?.find(
          (ls) => ls.language.toLowerCase() === storedLang
        )?.value ||
          employee?.designation?.value ||
          t('tasks.not_available')}
      </Typography>

      <Typography variant="caption" color="text.secondary" noWrap>
        {t('tasks.members-a.assignee')}
      </Typography>
      <Divider sx={{ width: '100%', my: 1 }} />

      <Typography
        variant="caption"
        noWrap
        color="#003161"
        fontWeight="600"
        fontSize="0.875rem"
        sx={{
          cursor: taskCreator ? 'pointer' : 'default',
        }}
        onClick={
          taskCreator
            ? () => {
                setSelectedStatus(employee?.statusId);
                setOpenStatus(true);
              }
            : undefined
        }
      >
        {employee?.statusName?.localizedStrings?.find(
          (ls) => ls.language.toLowerCase() === storedLang
        )?.value ||
          employee?.statusName?.value ||
          t('tasks.kanban_details.statuses')}
      </Typography>

      <ChangeTaskStatus
        open={openStatus}
        shared={statusList}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onClick={handleOpenStatusDialog}
        handleClose={handleStatusDialogClose}
        onToggleStatus={handleToggleStatus}
        addStatus={changeMemberStatus}
      />
    </Card>
  );
}
