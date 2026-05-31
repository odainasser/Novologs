'use client';

import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { Button, Box, Typography } from '@mui/material';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';
import { Iconify } from 'src/components/iconify';
import Tooltip from '@mui/material/Tooltip';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { addFile } from 'src/actions/file/fileActions';

export function PostCommentForm({ onSubmit, attachedFiles, setAttachedFiles, documentId }) {
  const { t } = useTranslation('dashboard/documents'); // Use the 'documents' namespace

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileRef = useRef(null);

  const handlePost = () => {
    const trimmed = message.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    if (onSubmit) {
      onSubmit(trimmed, attachedFiles);
    }

    setMessage('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
  };
  const [isUploading, setIsUploading] = useState(false);

  const handleAttach = () => {
    fileRef.current?.click();
  };

  // const handleFileChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   setAttachedFiles((prev) => [...prev, ...files]);
  //   e.target.value = null;
  // };
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      const newFileObjects = [];
      for (const file of files) {
        try {
          const filePayload = {
            name: `DocumentCommentFile_${Date.now()}_${file.name}`,
            file: file,
            // entityType: 12,
            // entityId: documentId,
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
              toast.error(`Failed to get details for file: ${file.name}`);
            }
          } else {
            toast.error(result.error || `Failed to upload file: ${file.name}`);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(`Error uploading file: ${file.name}`);
        }
      }
      setAttachedFiles((prevFiles) => [...prevFiles, ...newFileObjects]);
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, []);

  console.log('this is the file attachedFiles', attachedFiles);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder={t('documents.comment.placeholder')}
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {attachedFiles.length > 0 && (
        <Stack spacing={1}>
          {attachedFiles.map((file, idx) => (
            // <Box key={idx} display="flex" alignItems="center" justifyContent="space-between">
            //   <Typography variant="body2">{file.name}</Typography>
            //   <IconButton onClick={() => handleRemoveFile(idx)} size="small">
            //     <Iconify icon="eva:close-fill" />
            //   </IconButton>
            // </Box>
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
                  alt={file.name || 'uploaded file'}
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
                onClick={() => handleRemoveFile(idx)}
                sx={{
                  position: 'absolute',
                  top: -8,
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

      <Stack direction="row" alignItems="center">
        <Stack direction="row" alignItems="center" flexGrow={1} spacing={1}>
          <Tooltip title={t('documents.comment.select_file')}>
            <IconButton onClick={handleAttach} disabled={isUploading}>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('documents.comment.select_file')}>
            <IconButton onClick={handleAttach} disabled={isUploading}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('documents.comment.emoji_picker')}>
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Iconify icon="eva:smiling-face-fill" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Button variant="contained" onClick={handlePost} disabled={isUploading}>
          {t('documents.comment.post_comment')}
        </Button>
      </Stack>

      {showEmojiPicker && (
        <Box sx={{ zIndex: 99 }}>
          {/* <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" /> */}
        </Box>
      )}

      <input
        type="file"
        ref={fileRef}
        hidden
        multiple
        onChange={handleFileChange}
        // accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      />
    </Stack>
  );
}
