'use client';
import Box from '@mui/material/Box';

import { useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import CkEditorComponent from 'src/components/html-editor/ck-editor-component';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';

export function LeadDocument({ isClientView }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(
    localStorage.getItem('editorContentClient') || ''
  );
  const editorRef = useRef(null);
  return (
    <Scrollbar fillContent sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <div ref={editorRef}>
          {!isEditing && !stripHtml(editorContent) ? (
            <TextField
              placeholder={t('leaddetails.editor.placeholder')}
              onClick={() => setIsEditing(true)}
              value={stripHtml(editorContent)}
              multiline
              minRows={3}
              fullWidth
              sx={{ mt: 2 }}
            />
          ) : (
            <CkEditorComponent
              data={editorContent}
              onChange={(data) => {
                setEditorContent(data);
                if (isClientView) {
                  localStorage.setItem('editorContentLead', data);
                } else {
                  localStorage.setItem('editorContentContract', data);
                }
              }}
              sx={{ mt: 2 }}
            />
          )}
        </div>
      </Box>
    </Scrollbar>
  );
}
