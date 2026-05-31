'use client';
import { useState, useEffect } from 'react';
import { DashboardContent } from 'src/layouts/dashboard';
import { PostDetailsHero } from '../post-details-hero';
import { PostDetailsToolbar } from '../post-details-toolbar';
import { PostCommentForm } from '../post-comment-form';
import { PostCommentList } from '../post-comment-list';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import {
  getDocument,
  getDocumentCommentThread,
  addDocumentComments,
} from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';
import { CONFIG } from 'src/config-global';

export default function DocumentsDetails({ documentId, isTimeSheetView }) {
  const [attachedFiles, setAttachedFiles] = useState([]);

  const getDocParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1,
    },
    search: {
      logicOperator: 0,
      fieldName: 'Id',
      operator: 0,
      fieldValue: documentId,
    },
  };
  const {
    documentList,
    documentListLoading,
    documentListError,
    mutate: mutateDocument,
  } = getDocument(getDocParams);

  const { t } = useTranslation('dashboard/documents');
  if (!documentId) {
    return null;
  }
  const document = documentList?.documents.find((doc) => doc.id === documentId);

  const shouldFetchComments = Boolean(document?.commentThreadId);
  const getDocCommentParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 50,
    },
  };
  if (document?.commentThreadId) {
    getDocCommentParams.threadId = document?.commentThreadId;
  }

  const {
    documentCommentList,
    documentCommentListLoading,
    documentCommentListError,
    mutate: mutateDocumentComment,
  } = getDocumentCommentThread(shouldFetchComments ? getDocCommentParams : null);
  const [comments, setComments] = useState([]);
  console.log('this is the comments', comments);

  useEffect(() => {
    if (documentCommentList?.totalDocumentComments > 0) {
      setComments(documentCommentList.documentComments?.[0]?.items);
    }
  }, [documentCommentList]);

  const handleAddComment = async (text) => {
    const newComment = {
      id: `c${Date.now()}`,
      name: 'You',
      avatarUrl: '', // or use logged-in user avatar
      message: text,
      postedAt: new Date().toISOString(),
      replyComment: [],
      users: [],
    };

    const payload = {
      content: text,
      threadId: document?.commentThreadId,
      filesIds: attachedFiles.map((file) => file.id),
    };
    console.log('this is the new payload', document);

    try {
      let response;

      response = await addDocumentComments(payload);
      if (response.success) {
        toast.success('Comment added successfully');
        // setComments((prev) => [...prev, newComment]);
        await mutateDocumentComment();
      } else {
        console.error(response.error);
        toast.error(response.error || 'Operation failed. Please try again.');
      }
    } catch (error) {
      console.error('Document operation failed:', error);
    }
  };

  // if (!document) {
  //   return (
  //     <DashboardContent>
  //       <Typography variant="h5">{t('documents.details.not_found')}</Typography>
  //     </DashboardContent>
  //   );
  // }

  return (
    <DashboardContent>
      {/* Toolbar */}
      <Container maxWidth="fullWidth" sx={{ mt: 4 }}>
        <PostDetailsToolbar
          backLink={isTimeSheetView ? '/dashboard/timesheet' : '/dashboard/documents'}
          isEditor
          isOwner
          editLink={
            isTimeSheetView
              ? `/dashboard/notes/edit/${document?.id}`
              : `/dashboard/documents/edit/${document?.id}`
          }
          documentId={document?.id}
          document={document}
          mutateDocument={mutateDocument}
          isTimeSheetView={isTimeSheetView}
        />
      </Container>

      {/* Hero Section */}
      <PostDetailsHero
        title={document?.documentVersionList[0]?.title || 'No Title'}
        author={document?.creator}
        createdAt={document?.lastModified}
        coverUrl={
          document?.documentVersionList[0]?.headerImgFile?.url ||
          `${CONFIG.assetsDir}/logo/novo.svg`
        }
      />

      {/* Document Content */}
      <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
        <Stack spacing={3}>
          <Typography variant="h6">
            {document?.documentVersionList[0]?.description || 'No Description'}
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: document?.documentVersionList[0]?.content }} />
        </Stack>

        <Stack direction="row" alignItems="center" sx={{ mt: 6, mb: 3 }}>
          <Typography variant="h4">{t('documents.details.comments')}</Typography>
          <Typography variant="subtitle2" sx={{ color: 'text.disabled', ml: 1 }}>
            ({documentCommentList.totalDocumentComments})
          </Typography>
        </Stack>

        <PostCommentForm
          onSubmit={handleAddComment}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          documentId={documentId}
        />

        {comments.length > 0 ? (
          <>
            {/* <Divider sx={{ mt: 4, mb: 2 }} /> */}

            <PostCommentList comments={comments} mutateDocumentComment={mutateDocumentComment} />
          </>
        ) : (
          <Typography sx={{ mt: 4 }} variant="body2" color="text.secondary">
            {t('documents.add.no_comments_yet')}
          </Typography>
        )}
      </Container>
    </DashboardContent>
  );
}
