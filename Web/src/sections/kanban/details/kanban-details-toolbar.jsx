import { useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useTranslation } from 'react-i18next';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { getStatus } from 'src/actions/task/taskActions';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { toast } from 'src/components/snackbar';
import Typography from '@mui/material/Typography';
import ReactPlayer from 'react-player';
import { useAuthContext } from 'src/auth/hooks';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate, fTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------
function AudioPlayer({ src, onDelete, audioFile, height = '30px', width = '150px' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ReactPlayer
        url={src}
        playing={isPlaying}
        controls
        width={width}
        height={height}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        config={{
          file: {
            forceAudio: true,
          },
        }}
      />
    </Box>
  );
}
export function KanbanDetailsToolbar({
  liked,
  onLike,
  task,
  taskName,
  taskId,
  onDelete,
  taskStatus,
  onCloseDetails,
  toggleFullscreen,
  isFullscreen,
  activeTab,
  subTaskCount,
  onCopyLink,
  taskCost,
  taskDuration,
  forShare = false,
  handleWhatsAppShare,
  startDate,
  endDate,
  actualStartDate,
  actualEndDate,
}) {
  const { statusList, statusListEmpty } = getStatus();

  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const smUp = useResponsive('up', 'sm');

  const confirm = useBoolean();

  const popover = usePopover();
  const router = useRouter();

  const [status, setStatus] = useState(taskStatus);
  const [expanded, setExpanded] = useState(false);

  const { zetaUser } = useAuthContext();

  const handleChangeStatus = useCallback(
    (newValue) => {
      popover.onClose();
      setStatus(newValue);
    },
    [popover]
  );
  const taskStatusOptions = statusList?.status.map((s) => s.name.value);

  const handleBack = useCallback(() => {
    router.push(paths.dashboard.kanban.list);
  }, [router]);
  const formatDateTime = (date) => (date ? `${fDate(date)}, ${fTime(date)}` : 'Not available');
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: (theme) => theme.spacing(2.5, 1, 0, 2.5),
        }}
      >
        <Tooltip title={t('tasks.kanban_details.back')}>
          <IconButton onClick={forShare ? handleBack : onCloseDetails} sx={{ mr: 1 }}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>
        </Tooltip>

        <Box
          sx={{
            gap: 1,
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="caption"
            sx={{ whiteSpace: 'nowrap', color: '#006A67', fontWeight: 600 }}
          >
            {String(taskId).padStart(5, '0')}
          </Typography>

          {!task?.audioFileId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  whiteSpace: expanded ? 'normal' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: expanded ? 'unset' : 'ellipsis',

                  flex: 1,
                }}
              >
                {taskName}
              </Typography>

              {taskName?.length > 50 && (
                <IconButton
                  size="small"
                  onClick={() => setExpanded((prev) => !prev)}
                  sx={{ color: '#006A67' }}
                >
                  <Iconify
                    icon={expanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                    width={20}
                    height={20}
                  />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box width="100%">
              <AudioPlayer src={task?.audioFileUrl} audioFile={task?.audioFileId} />
            </Box>
          )}
        </Box>

        <Tooltip title="Copy task link">
          <IconButton onClick={onCopyLink} sx={{ mr: 1 }}>
            {' '}
            <Iconify icon="mdi:content-copy" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share via WhatsApp">
          <IconButton onClick={handleWhatsAppShare} sx={{ mr: 1 }}>
            <Iconify icon="ic:baseline-whatsapp" color="#25D366" />
          </IconButton>
        </Tooltip>

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
          {zetaUser?.permissions?.includes('Project.ViewCost') && (
            <Stack direction="row" alignItems="center" gap={1}>
              <Chip
                icon={<Iconify icon="mdi:cash" />}
                label={`${t('tasks.cost', t('tasks.cost'))}: ${taskCost || 0} AED`}
                size="small"
                variant="soft"
                color="default"
                sx={{
                  ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                  '& .MuiChip-icon': {
                    ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                  },
                }}
              />

              {task?.duration !== undefined && task?.duration !== null && (
                <Chip
                  icon={<Iconify icon="mdi:timer-outline" />}
                  label={`${t('tasks.duration', t('tasks.duration'))}: ${taskDuration} ${t('tasks.days', 'hrs')}`}
                  size="small"
                  variant="soft"
                  sx={{
                    ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
                    '& .MuiChip-icon': {
                      ...(storedLang === 'ar' ? { marginLeft: 0, marginRight: 0.5 } : ''),
                    },
                  }}
                />
              )}
            </Stack>
          )}

          {!forShare && (
            <Button onClick={toggleFullscreen} variant="text">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </Button>
          )}

          {/* )} */}

          {/* <Tooltip title={t('tasks.kanban_details.like')}>
            <IconButton color={liked ? 'default' : 'primary'} onClick={onLike} sx={{ mr: 2 }}>
              <Iconify icon="ic:round-thumb-up" />
            </IconButton>
          </Tooltip> */}

          {/* <Tooltip title={t('tasks.kanban_details.delete_task')}>
            <IconButton onClick={confirm.onTrue}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip> */}

          {/* <IconButton>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
          {/* <Button
            size="small"
            variant="soft"
            endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: -0.5 }} />}
            onClick={popover.onOpen}
          >
            {status}
          </Button> */}
        </Stack>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: (theme) => theme.spacing(1, 1, 2.5, 2.5),
          borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <Box
          sx={{
            gap: 1,
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Chip
            icon={<Iconify icon="solar:calendar-date-bold" />}
            label={`Start Date: ${formatDateTime(startDate)}`}
            size="small"
            variant="soft"
            sx={{
              ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
            }}
          />

          <Chip
            icon={<Iconify icon="solar:calendar-date-bold" />}
            label={`End Date: ${formatDateTime(endDate)}`}
            size="small"
            variant="soft"
            sx={{
              ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
            }}
          />

          <Chip
            icon={<Iconify icon="solar:calendar-mark-bold" />}
            label={`Actual Start Date: ${formatDateTime(actualStartDate)}`}
            size="small"
            variant="soft"
            sx={{
              ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
            }}
          />

          <Chip
            icon={<Iconify icon="solar:calendar-mark-bold" />}
            label={`Actual End Date: ${formatDateTime(actualEndDate)}`}
            size="small"
            variant="soft"
            sx={{
              ...(storedLang === 'ar' ? { ml: 1 } : { mr: 1 }),
            }}
          />
        </Box>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-right' } }}
      >
        <MenuList>
          {taskStatusOptions.map((statusKey) => (
            <MenuItem
              key={statusKey}
              selected={status === statusKey}
              onClick={() => handleChangeStatus(statusKey)}
            >
              {statusKey}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.kanban_details.delete')}
        content={
          <>
            {t('tasks.kanban_details.confirm_delete')} <strong> {taskName} </strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            {t('tasks.kanban_details.delete')}
          </Button>
        }
      />
    </>
  );
}
