'use client';
import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { fToNow } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Lightbox, useLightBox } from 'src/components/lightbox';
import {
  getDocumentCommentThread,
  deleteDocumentComments,
} from 'src/actions/document/documentActions';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Box from '@mui/material/Box';
import { useBoolean } from 'src/hooks/use-boolean';
import Button from '@mui/material/Button';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentList({ task, isUser, userId, mutateDetails }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const confirm = useBoolean();
  const { zetaUser } = useAuthContext();

  const shouldFetchComments = Boolean(task?.commentThreadId);
  const getDocCommentParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 50,
    },
  };
  if (task?.commentThreadId) {
    getDocCommentParams.threadId = task?.commentThreadId;
  }
  const {
    documentCommentList,
    documentCommentListLoading,
    documentCommentListError,
    mutate: mutateDocumentComment,
  } = getDocumentCommentThread(shouldFetchComments ? getDocCommentParams : null);
  const [comments, setComments] = useState([]);
  const [commentId, setCommentId] = useState('');

  useEffect(() => {
    if (documentCommentList?.totalDocumentComments > 0) {
      setComments(documentCommentList.documentComments?.[0].items);
    }
  }, [documentCommentList]);

  console.log('this is the comments', comments);

  const slides = comments
    .filter((comment) => comment?.files?.length > 0)
    .map((slide) => ({ src: slide.message }));

  const lightbox = useLightBox(slides);

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

  const getFileIcon = (url) => {
    if (!url) return 'eva:file-outline';

    const extension = url.split('.').pop().toLowerCase();

    // Map of file extensions to Iconify icons
    const iconMap = {
      // Documents
      pdf: 'eva:file-text-outline',
      doc: 'eva:file-text-outline',
      docx: 'eva:file-text-outline',
      xls: 'eva:file-text-outline',
      xlsx: 'eva:file-text-outline',
      ppt: 'eva:file-text-outline',
      pptx: 'eva:file-text-outline',
      txt: 'eva:file-text-outline',

      // Images
      svg: 'eva:image-outline',

      // Archives
      zip: 'eva:archive-outline',
      rar: 'eva:archive-outline',
      '7z': 'eva:archive-outline',

      // Audio
      mp3: 'eva:music-outline',
      wav: 'eva:music-outline',

      // Default
      default: 'eva:file-outline',
    };

    return iconMap[extension] || iconMap.default;
  };

  const handleDeleteComment = async (commentIdToDelete) => {
    console.log('this is the comment id to delete', commentIdToDelete);
    if (commentIdToDelete) {
      try {
        const response = await deleteDocumentComments(commentIdToDelete);
        if (response.success) {
          confirm.onFalse();
          await mutateDocumentComment();
          toast.success('Comment deleted successfully');
        } else {
          toast.error(response.error || 'Failed to delete comment.');
        }
      } catch (error) {
        console.error('Unexpected error while deleting comment:', error);
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleImageDownload = (url, filename) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'downloaded-image');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      {comments.length > 0 ? (
        <Stack component="ul" spacing={3}>
          {comments.map((comment) => (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Stack component="li" key={comment.id} direction="row" spacing={2}>
                  <Avatar alt={comment?.sender?.fullName} src={comment?.sender?.profileImageUrl} />

                  <Stack spacing={comment?.files?.length > 0 ? 1 : 0.5} flexGrow={1}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle2"> {comment?.sender?.fullName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {fToNow(comment.createdAt)}
                      </Typography>
                    </Stack>

                    {comment?.files?.length > 0 && (
                      <Stack direction="column" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                        {comment.files?.map((fileItem) => {
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
                                // border: '1px solid #eee',
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
                                // <Box sx={{
                                //   width: '100%',
                                //   height: '100%',
                                //   display: 'flex',
                                //   alignItems: 'center',
                                //   justifyContent: 'center',
                                //   bgcolor: 'rgba(0,0,0,0.05)',
                                //   flexDirection: 'column'
                                // }}>
                                //   <Iconify icon="eva:video-fill" sx={{ fontSize: 32, color: 'primary.main' }} />
                                //   <Typography variant="caption" sx={{ mt: 0.5, textTransform: 'uppercase' }}>
                                //     {fileName.split('.').pop() || 'video'}
                                //   </Typography>
                                // </Box>
                                <video width="100%" height="100%" controls>
                                  <source src={fileUrl} type={fileType} />
                                </video>
                              )}

                              {fileType === 'other' && (
                                // <Box
                                //   sx={{
                                //     width: '100%',
                                //     height: '100%',
                                //     display: 'flex',
                                //     alignItems: 'center',
                                //     justifyContent: 'center',
                                //     bgcolor: 'rgba(0,0,0,0.05)',
                                //     flexDirection: 'column',
                                //   }}
                                // >
                                //   <Iconify
                                //     icon={getFileIcon(fileUrl)}
                                //     sx={{ fontSize: 32, color: 'text.secondary' }}
                                //     fallback={
                                //       <Box
                                //         sx={{
                                //           width: 32,
                                //           height: 32,
                                //           bgcolor: 'text.disabled',
                                //           borderRadius: '4px',
                                //         }}
                                //       />
                                //     }
                                //   />
                                //   <Typography
                                //     variant="caption"
                                //     sx={{ mt: 0.5, textTransform: 'uppercase' }}
                                //   >
                                //     {fileName.split('.').pop() || 'file'}
                                //   </Typography>
                                // </Box>
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
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {comment?.content}
                    </Typography>
                  </Stack>
                </Stack>
                {!isUser && (
                  <>
                    {(comment?.senderId === zetaUser?.id ||
                      comment?.sender?.id === zetaUser?.id) && (
                      <Iconify
                        icon="solar:trash-bin-trash-bold"
                        onClick={() => {
                          setCommentId(comment?.id);
                          confirm.onTrue();
                        }}
                        sx={{ color: 'error.main', cursor: 'pointer' }}
                        width={15}
                      />
                    )}
                  </>
                )}
              </Box>
            </>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ mt: 4 }} variant="body2" color="text.secondary">
          {t('tasks.comments_yet')}
        </Typography>
      )}

      {/* <Lightbox
        index={lightbox.selected}
        slides={slides}
        open={lightbox.open}
        close={lightbox.onClose}
      /> */}
      {!isUser && (
        <KanbanDetailsCommentInput
          mutateDocumentComment={mutateDocumentComment}
          threadId={task?.commentThreadId}
          mutateDetails={mutateDetails}
          taskId={task?.id}
        />
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={t('tasks.delete')}
        content={t('tasks.toast.are_you_sure')}
        action={
          <Button variant="contained" color="error" onClick={() => handleDeleteComment(commentId)}>
            {t('tasks.delete')}
          </Button>
        }
      />
    </>
  );
}
