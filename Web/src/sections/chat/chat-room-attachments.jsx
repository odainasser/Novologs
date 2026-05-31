import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';

import { FileThumbnail } from 'src/components/file-thumbnail';

import { CollapseButton } from './styles';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function ChatRoomAttachments({ attachments }) {
  const { t } = useTranslation('dashboard/chat');

  const collapse = useBoolean(true);

  const downloadFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Download failed due to network error.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'downloaded_file';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const totalAttachments = attachments.length;

  const renderList = attachments?.map((attachment, index) => (
    <Stack key={attachment?.name + index} spacing={1.5} direction="row" alignItems="center">
      <FileThumbnail
        imageView
        file={attachment?.url}
        onDownload={() => downloadFile(attachment?.url)}
        slotProps={{ icon: { width: 24, height: 24 } }}
        sx={{
          width: 30,
          height: 30,
          bgcolor: 'background.neutral',
          borderRadius: '8px',
        }}
      />

      <ListItemText
        primary={attachment?.name}
        secondary={fDateTime(attachment?.createdAt)}
        primaryTypographyProps={{ noWrap: true, typography: 'body2' }}
        secondaryTypographyProps={{
          mt: 0.25,
          noWrap: true,
          component: 'span',
          typography: 'caption',
          color: 'text.disabled',
        }}
      />
    </Stack>
  ));

  return (
    <>
      <CollapseButton
        selected={collapse.value}
        disabled={!totalAttachments}
        onClick={collapse.onToggle}
      >
        {t('chat.attachments')} ({totalAttachments})
      </CollapseButton>

      {!!totalAttachments && (
        <Collapse in={collapse.value}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {renderList}
          </Stack>
        </Collapse>
      )}
    </>
  );
}
