import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Image } from 'src/components/image';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { useAuthContext } from 'src/auth/hooks';

export function PostCommentItem({
  name,
  avatarUrl,
  message,
  tagUser,
  postedAt,
  hasReply,
  onReplySubmit,
  onDeleteComment,
  comment,
}) {
  const { t } = useTranslation('dashboard/documents');
  const reply = useBoolean();
  const [replyText, setReplyText] = useState('');
  const confirm = useBoolean();
  const { zetaUser } = useAuthContext();

  const handleReply = () => {
    if (!replyText.trim()) return;
    if (onReplySubmit) onReplySubmit(replyText);
    setReplyText('');
    reply.onFalse();
  };

  const handleDelete = () => {
    onDeleteComment();
    confirm.onFalse();
  };

  const checkFileType = (url) => {
    if (!url) return 'other';

    // Convert to lowercase for case-insensitive comparison
    const lowerUrl = url.toLowerCase();
    const extension = lowerUrl.split('.').pop();

    // Video extensions
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'm4v', 'mpg', 'mpeg'];
    // Image extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

    // Check if URL ends with any video extension
    if (videoExtensions.includes(extension)) {
      return 'video';
    }
    // Check if URL ends with any image extension
    else if (imageExtensions.includes(extension)) {
      return 'image';
    }
    return 'other';
  };

  return (
    <Box sx={{ pt: 3, display: 'flex', position: 'relative', ...(hasReply && { pl: 8 }) }}>
      <Avatar
        alt={comment?.sender?.fullName}
        src={comment?.sender?.profileImageUrl}
        sx={{ mr: 2, width: 48, height: 48 }}
      />

      <Stack flexGrow={1} sx={{ pb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {comment?.sender?.fullName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {fDate(postedAt)}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {tagUser && (
            <Box component="strong" sx={{ mr: 0.5 }}>
              @{tagUser}
            </Box>
          )}
          {comment?.files.length > 0 && (
            <Stack direction="column" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
              {comment.files.map((fileItem) => {
                const fileUrl = fileItem.file?.url;
                const fileName = fileItem.file?.name || 'attachment';

                const fileType = checkFileType(fileUrl);

                return (
                  <Box
                    key={fileItem.id}
                    sx={{
                      position: 'relative',
                      width: fileType === 'other' ? 'fit-content' : 100,
                      height: fileType === 'other' ? 'fit-content' : 100,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => {
                      window.open(fileUrl, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {fileType === 'image' && (
                      <Image
                        alt={fileName}
                        src={fileUrl}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}

                    {fileType === 'video' && (
                      <video width="100%" height="100%" controls>
                        <source src={fileUrl} type={fileType} />
                      </video>
                    )}

                    {fileType === 'other' && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FileThumbnail file={fileUrl} />

                        <Box
                          sx={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                            }}
                          >
                            {fileName}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
          {comment?.content}
        </Typography>

        {reply.value && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              autoFocus
              placeholder={t('documents.comment.write_comment')}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            />
          </Box>
        )}
      </Stack>
      <Stack sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {' '}
        {/* {!hasReply && (
          <Button
            size="small"
            color={reply.value ? 'primary' : 'inherit'}
            startIcon={<Iconify icon="solar:pen-bold" width={16} />}
            onClick={reply.onToggle}
            sx={{ right: 0, position: 'absolute' }}
          >
            {t('documents.comment.reply_button')}
          </Button>
        )} */}
        {comment?.sender?.id === zetaUser?.id && (
          <Iconify
            icon="solar:trash-bin-trash-bold"
            onClick={() => {
              confirm.onTrue();
            }}
            sx={{ color: 'error.main', cursor: 'pointer' }}
            width={15}
          />
        )}
      </Stack>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this comment"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </Box>
  );
}
