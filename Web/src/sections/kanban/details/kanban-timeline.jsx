import { useTheme } from '@mui/material/styles';
import { ComponentBlock } from 'src/components/component-block';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { CircularProgress, Box, Typography, Avatar, ListItemText } from '@mui/material';
import { fDateTime } from 'src/utils/format-time';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function KanbanTimeline({ taskDetails, taskDetailsLoading, taskDetailsError }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const theme = useTheme();
  const isRTL = i18n.language === 'ar';

  // If still loading, show loader
  if (taskDetailsLoading) {
    return (
      <ComponentBlock dir={isRTL ? 'rtl' : 'ltr'}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          <CircularProgress />
        </Box>
      </ComponentBlock>
    );
  }

  if (taskDetailsError) {
    return (
      <ComponentBlock dir={isRTL ? 'rtl' : 'ltr'}>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
        >
          {t('tasks.kanban_details.error_loading_timeline')}
        </Box>
      </ComponentBlock>
    );
  }

  const sortedTimeLines = taskDetails?.details?.timeLines
    ? [...taskDetails.details.timeLines].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      })
    : [];
  const swapDirection = (value) => {
    if (i18n.language === 'ar') {
      return value === 'flex-start' ? 'flex-end' : 'flex-start';
    }
    return value;
  };

  return (
    <ComponentBlock dir={isRTL ? 'rtl' : 'ltr'}>
      <Timeline position="alternate">
        {sortedTimeLines.map((item, index) => {
          const isLeftSide = isRTL ? index % 2 !== 0 : index % 2 === 0;

          return (
            <TimelineItem key={`${item?.id}-${item?.date}`}>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: '#006A67' }} />
                {sortedTimeLines.length > 1 && index < sortedTimeLines.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ padding: 2 }}>
                <Box
                  display="flex"
                  gap={1}
                  alignItems="center"
                  justifyContent={swapDirection(isLeftSide ? 'flex-start' : 'flex-end')}
                  textAlign={isLeftSide ? 'left' : 'right'}
                >
                  <Avatar sx={{ width: 30, height: 30 }}>
                    {item?.creatorProfileImageFileUrl ? (
                      <img
                        src={item.creatorProfileImageFileUrl}
                        alt={item.creatorName}
                        width="30"
                        height="30"
                      />
                    ) : (
                      item?.creatorName?.charAt(0).toUpperCase()
                    )}
                  </Avatar>

                  <Box>
                    <ListItemText
                      primary={item?.creatorName}
                      primaryTypographyProps={{
                        typography: 'subtitle1',
                        sx: { color: '#006A67' },
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{ textAlign: isLeftSide ? 'left' : 'right', mt: 1 }}
                >
                  {item?.description}
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: isLeftSide ? 'left' : 'right' }}
                >
                  {fDateTime(item?.date)}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </ComponentBlock>
  );
}
