'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import { PostCommentItem } from './post-comment-item';
import Stack from '@mui/material/Stack';
import { deleteDocumentComments } from 'src/actions/document/documentActions';
import { toast } from 'src/components/snackbar';

export function PostCommentList({ comments = [], mutateDocumentComment }) {
  console.log('this is the comments', comments);
  const handleReplySubmit = (commentId, replyText) => {
    console.log('this is the commentId', commentId);
    const newReply = {
      id: `r${Date.now()}`,
      userId: 999,
      tagUser: 'You',
      message: replyText,
      postedAt: new Date().toISOString(),
    };

    // setComments((prev) =>
    //   prev.map((comment) =>
    //     comment.id === commentId
    //       ? {
    //           ...comment,
    //           replyComment: [...(comment.replyComment || []), newReply],
    //           users: [...(comment.users || []), { id: 999, name: 'You', avatarUrl: '' }],
    //         }
    //       : comment
    //   )
    // );
  };
  const handleDeleteComment = async (id) => {
    if (id) {
      try {
        const response = await deleteDocumentComments(id);
        if (response.success) {
          await mutateDocumentComment();
          toast.success('Comment deleted successfully');
        } else {
          toast.error(response.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <>
      {comments.map((comment) => (
        <Box key={comment.id}>
          <PostCommentItem
            comment={comment}
            onReplySubmit={(text) => handleReplySubmit(comment.id, text)}
            onDeleteComment={() => handleDeleteComment(comment.id)}
          />

          {comment.replyComment?.map((reply) => {
            const user = comment.users?.find((u) => u.id === reply.userId);
            return (
              <PostCommentItem
                key={reply.id}
                name={user?.name || ''}
                avatarUrl={user?.avatarUrl}
                message={reply.message}
                postedAt={reply.postedAt}
                tagUser={reply.tagUser}
                hasReply
              />
            );
          })}
        </Box>
      ))}
      {/* <Stack sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination count={comments?.length} sx={{ my: 5, mx: 'auto' }} />
      </Stack> */}
    </>
  );
}
