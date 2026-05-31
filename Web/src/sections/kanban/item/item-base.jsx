import { memo, useEffect, forwardRef, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';

import { varAlpha, stylesMode } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { imageClasses } from 'src/components/image';

import { kanbanClasses } from '../classes';
import ListItemText from '@mui/material/ListItemText';
import { fDate, fTime } from 'src/utils/format-time';
import Tooltip from '@mui/material/Tooltip';
import { Label } from 'src/components/label';
import ReactPlayer from 'react-player';

// ----------------------------------------------------------------------

export const StyledItemWrap = styled(ListItem)(() => ({
  '@keyframes fadeIn': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
  transform:
    'translate3d(var(--translate-x, 0), var(--translate-y, 0), 0) scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1))',
  transformOrigin: '0 0',
  touchAction: 'manipulation',
  [`&.${kanbanClasses.state.fadeIn}`]: { animation: 'fadeIn 500ms ease' },
  [`&.${kanbanClasses.state.dragOverlay}`]: { zIndex: 999 },
}));

export const StyledItem = styled(Stack)(({ theme }) => ({
  width: '100%',
  cursor: 'grab',
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  transformOrigin: '50% 50%',
  touchAction: 'manipulation',
  boxShadow: theme.customShadows.z1,
  borderRadius: 'var(--item-radius)',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: theme.vars.palette.common.white,
  transition: theme.transitions.create(['box-shadow']),
  [stylesMode.dark]: { backgroundColor: theme.vars.palette.grey[900] },
  [`&.${kanbanClasses.state.disabled}`]: {},
  [`&.${kanbanClasses.state.sorting}`]: {},
  [`&.${kanbanClasses.state.dragOverlay}`]: {
    backdropFilter: `blur(6px)`,
    boxShadow: theme.customShadows.z20,
    backgroundColor: varAlpha(theme.vars.palette.common.whiteChannel, 0.48),
    [stylesMode.dark]: {
      backgroundColor: varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
    },
  },
  [`&.${kanbanClasses.state.dragging}`]: {
    opacity: 0.2,
    filter: 'grayscale(1)',
  },
}));

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
const ItemBase = forwardRef(({ task, stateProps, sx, ...other }, ref) => {
  console.log('this is the task from item base', task);
  useEffect(() => {
    if (!stateProps?.dragOverlay) {
      return;
    }

    document.body.style.cursor = 'grabbing';

    // eslint-disable-next-line consistent-return
    return () => {
      document.body.style.cursor = '';
    };
  }, [stateProps?.dragOverlay]);

  const itemWrapClassName = kanbanClasses.itemWrap.concat(
    (stateProps?.fadeIn && ` ${kanbanClasses.state.fadeIn}`) ||
      (stateProps?.dragOverlay && ` ${kanbanClasses.state.dragOverlay}`) ||
      ''
  );

  const itemClassName = kanbanClasses.item.concat(
    (stateProps?.dragging && ` ${kanbanClasses.state.dragging}`) ||
      (stateProps?.disabled && ` ${kanbanClasses.state.disabled}`) ||
      (stateProps?.sorting && ` ${kanbanClasses.state.sorting}`) ||
      (stateProps?.dragOverlay && ` ${kanbanClasses.state.dragOverlay}`) ||
      ''
  );

  const { primaryDescription, secondaryDescription, descriptionStr } = useMemo(() => {
    let fullDescription = task?.description || '';
    try {
      const parsedDescription = JSON.parse(task?.description);
      if (parsedDescription && parsedDescription.TranscriptStr) {
        fullDescription = parsedDescription.TranscriptStr;
      }
    } catch (e) {}
    const descriptionStr = fullDescription;
    const words = fullDescription.split(' ');

    return {
      primaryDescription: words.slice(0, 8).join(' '),
      secondaryDescription: words.slice(4).join(' '),
      descriptionStr,
    };
  }, [task?.description]);

  const renderPriority = (
    <Iconify
      icon={
        (task.priority === 'Low' && 'solar:double-alt-arrow-down-bold-duotone') ||
        (task.priority === 'Medium' && 'solar:double-alt-arrow-right-bold-duotone') ||
        (task.priority === 'High' && 'solar:double-alt-arrow-up-bold-duotone') ||
        'solar:double-alt-arrow-down-bold-duotone'
      }
      sx={{
        top: 4,
        right: 4,
        position: 'absolute',
        ...((task.priority === 'Low' || !task.priority) && { color: 'info.main' }),
        ...(task.priority === 'Medium' && { color: 'warning.main' }),
        ...(task.priority === 'High' && { color: 'error.main' }),
      }}
    />
  );

  const renderImg = !!task?.attachments?.length && (
    <Box
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      <Box
        component="img"
        className={imageClasses.root}
        alt={task?.attachments?.[0]}
        src={task?.attachments?.[0]}
        sx={{
          width: 320,
          height: 'auto',
          borderRadius: 1.5,
          aspectRatio: '4/3',
          objectFit: 'cover',
        }}
      />
    </Box>
  );

  const renderInfo = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        sx={{ typography: 'caption', color: 'text.disabled' }}
      >
        {/* <Iconify width={16} icon="solar:chat-round-dots-bold" sx={{ mr: 0.25 }} />

        <Box component="span" sx={{ mr: 1 }}>
          {task?.comments?.length}
        </Box>

        <Iconify width={16} icon="eva:attach-2-fill" sx={{ mr: 0.25 }} />
        <Box component="span">{task?.attachments?.length}</Box> */}
        {/* <AvatarGroup sx={{ [`& .${avatarGroupClasses.avatar}`]: { width: 24, height: 24 } }}>
          {task?.members?.map((user) => (
            <Avatar key={user.id} alt={user.memberName} src={user.avatarUrl} />
          ))}
        </AvatarGroup> */}
        {task?.members.length === 1 && task.creatorId === task.members[0]?.memberId ? (
          <Label variant="soft" color="warning">
            <Typography
              variant="caption"
              component="span"
              sx={{
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              Assigned to me
            </Typography>
          </Label>
        ) : (
          <AvatarGroup sx={{ cursor: 'pointer' }}>
            {task?.members.slice(0, 1).map((person) => (
              <Tooltip key={person?.id} title={`${person?.memberName}`} arrow>
                <Avatar
                  key={person.id}
                  alt={person.memberName}
                  src={person?.photoPath}
                  sx={{ width: 24, height: 24 }}
                >
                  {!person?.photoPath && person?.memberName?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            ))}
            {task?.members.length > 1 && (
              <Avatar sx={{ width: 24, height: 24 }}>+{task?.members.length - 1}</Avatar>
            )}
          </AvatarGroup>
        )}
      </Stack>

      <Typography variant="caption" component="span" sx={{ mb: 2, mt: 1 }}>
        {task?.startDate
          ? `${fDate(task.startDate)}, ${fTime(task.startDate)}`
          : 'Start date not available'}
      </Typography>
    </Stack>
  );

  return (
    <StyledItemWrap
      ref={ref}
      disablePadding
      className={itemWrapClassName}
      sx={{
        ...(!!stateProps?.transition && { transition: stateProps.transition }),
        ...(!!stateProps?.transform && {
          '--translate-x': `${Math.round(stateProps.transform.x)}px`,
          '--translate-y': `${Math.round(stateProps.transform.y)}px`,
          '--scale-x': `${stateProps.transform.scaleX}`,
          '--scale-y': `${stateProps.transform.scaleY}`,
        }),
      }}
    >
      <StyledItem
        className={itemClassName}
        data-cypress="draggable-item"
        sx={sx}
        tabIndex={0}
        {...stateProps?.listeners}
        {...other}
      >
        {/* {renderImg} */}

        <Box sx={{ px: 2, py: 2.5, position: 'relative' }}>
          {renderPriority}
          <Box display="flex" alignItems="center" justifyContent="flex-start" gap={1}>
            {task?.isConfidential && (
              <Tooltip title="This is a confidential task" arrow>
                <Iconify icon="mdi:lock" sx={{ width: 15, color: 'grey' }} />
              </Tooltip>
            )}

            <Typography variant="caption" color="#006A67">
              {task.code}
            </Typography>
          </Box>
          {!task?.audioFileId ? (
            <ListItemText
              primary={primaryDescription}
              secondary={secondaryDescription}
              primaryTypographyProps={{
                typography: 'body2',
                sx: {
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                },
              }}
              secondaryTypographyProps={{
                component: 'span',
                typography: 'caption',
                sx: {
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                },
              }}
            />
          ) : (
            <Box width="100%">
              <AudioPlayer src={task?.audioFileUrl} audioFile={task?.audioFileId} />
            </Box>
          )}

          {renderInfo}
        </Box>
      </StyledItem>
    </StyledItemWrap>
  );
});

export default memo(ItemBase);
