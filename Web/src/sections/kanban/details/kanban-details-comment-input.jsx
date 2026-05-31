'use client';

import { useState, useRef, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { Typography } from '@mui/material';
import { useMockedUser } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';
import { addDocumentComments } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { addFile } from 'src/actions/file/fileActions';
import { Box } from '@mui/material';
import { FileThumbnail } from 'src/components/file-thumbnail';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput({
  mutateDocumentComment,
  threadId,
  mutateDetails,
  taskId,
}) {
  const { zetaUser } = useAuthContext();
  const fileRef = useRef(null);
  const { t, i18n } = useTranslation('dashboard/tasks');
  const [message, setMessage] = useState('');

  const [fileObjects, setFileObjects] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      const newFileObjects = [];
      for (const file of files) {
        try {
          const filePayload = {
            name: file.name,
            file: file,
            entityType: 8,
            entityId: taskId,
          };

          const result = await addFile(filePayload);
          if (result.success) {
            const fileResponse = result?.response?.data?.successStatus;
            if (fileResponse && fileResponse.id && fileResponse.url) {
              newFileObjects.push({
                id: fileResponse.id,
                url: fileResponse.url,
                name: file.name,
                mimeType: fileResponse.mimeType || file.type,
              });
            } else {
              toast.error(`${t('tasks.comment_input.failed_attach')}: ${file.name}`);
            }
          } else {
            toast.error(result.error || t('tasks.comment_input.failed_upload'));
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(t('tasks.comment_input.error_upload'));
        }
      }
      setFileObjects((prevFiles) => [...prevFiles, ...newFileObjects]);
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, []);

  const handleRemoveFile = (fileIdToRemove) => {
    setFileObjects((prevFiles) => prevFiles.filter((file) => file.id !== fileIdToRemove));
  };

  const handleAddComment = async () => {
    const trimmed = message.trim();
    if (!trimmed && fileObjects.length === 0) {
      toast.info(t('tasks.comment_input.please_enter'));
      return;
    }

    const payload = {
      content: trimmed,
      threadId: threadId,
      filesIds: fileObjects.map((file) => file.id),
    };
    try {
      let response;

      response = await addDocumentComments(payload);
      if (response.success) {
        toast.success(t('tasks.comment_input.comment_added'));
        await mutateDocumentComment();
        await mutateDetails();
        setMessage('');
        setFileObjects([]);
      } else {
        console.error(response.error);
        toast.error(response.error || t('tasks.comment_input.operation_failed'));
      }
    } catch (error) {
      console.error('Document operation failed:', error);
    }
  };
  console.log('this is the fileObjects', fileObjects);
  return (
    <Stack direction="row" spacing={2} sx={{ py: 3, px: 2.5 }}>
      <Avatar src={zetaUser?.profileImageFileUrl} alt={zetaUser?.fullName}>
        {zetaUser?.fullName?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        {fileObjects.length > 0 && (
          <Stack
            spacing={1}
            sx={{ mb: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}
          >
            {fileObjects.map((file) => (
              <Box
                key={file.id}
                sx={{
                  position: 'relative',
                  // border: (theme) => `1px solid ${theme.palette.divider}`,
                  // borderRadius: 1,
                  p: 0.5,
                }}
              >
                {file?.mimeType?.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name || t('tasks.comment_input.upload_file')}
                    style={{
                      height: 80,
                      width: 80,
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                ) : file?.mimeType?.startsWith('video/') ? (
                  <video width="100" height="60" controls>
                    <source src={file.url} type={file.mimeType} />
                  </video>
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FileThumbnail file={file.url} />

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
                        {file.name}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(file.id)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -10,
                    bgcolor: 'rgba(255,255,255,0.7)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                >
                  <Iconify icon="mingcute:close-fill" width={14} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <InputBase
          fullWidth
          multiline
          rows={4}
          placeholder={t('tasks.comment_input.placeholder')}
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <IconButton>
              <Iconify
                icon="solar:gallery-add-bold"
                onClick={handleAttach}
                disabled={isUploading}
              />
            </IconButton>

            <IconButton>
              <Iconify icon="eva:attach-2-fill" onClick={handleAttach} disabled={isUploading} />
            </IconButton>
          </Stack>
          <Button onClick={handleAddComment} variant="contained" disabled={isUploading}>
            {t('tasks.comment_input.comment')}
          </Button>
        </Stack>
      </Paper>
      <input
        type="file"
        ref={fileRef}
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
        // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" // Optional: specify accepted file types
      />
    </Stack>
  );
}
