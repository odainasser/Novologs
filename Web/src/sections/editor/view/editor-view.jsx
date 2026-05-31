'use client';
import Box from '@mui/material/Box';

import { useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import CkEditorComponent from 'src/components/htmlEditor/CkEditorComponent';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslation } from 'react-i18next';
import CkEditorPreview from 'src/components/htmlEditor/CkEditorPreview';
import { Stack, Button } from '@mui/material';
export function EditorView({ docItem, editorContent, setEditorContent, employeesData, isDocFile }) {
  const { t, i18n } = useTranslation('dashboard/documents');
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  const [isEditorViewMode, setIsEditorViewMode] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const editorRef = useRef(null);
  return (
    <Scrollbar fillContent sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <div ref={editorRef}>
          {!docItem && (
            <>
              {!isEditing && !stripHtml(editorContent) ? (
                <TextField
                  placeholder={t('documents.add.placeholder')}
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
                    localStorage.setItem('editorContentDocs', data);
                  }}
                  employeesData={employeesData}
                  sx={{ mt: 2 }}
                  isDocFile={isDocFile}
                />
              )}
            </>
          )}

          {docItem && (
            <>
              {isEditorViewMode ? (
                <CkEditorComponent
                  data={editorContent}
                  onChange={(data) => {
                    setEditorContent(data);
                    localStorage.setItem('editorContent', data);
                  }}
                  employeesData={employeesData}
                />
              ) : (
                <CkEditorPreview content={docItem?.content} />
              )}
            </>
          )}

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, gap: 1 }}>
            {docItem && isEditorViewMode && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setIsEditorViewMode(false);
                  setEditorContent(docItem.content);
                }}
              >
                {t('documents.actions.cancel')}
              </Button>
            )}

            {docItem && !isEditorViewMode && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setEditorContent(docItem.content);
                    setIsEditorViewMode(true);
                  }}
                >
                  {t('documents.add.edit_content')}
                </Button>
              </>
            )}
          </Stack>
        </div>
      </Box>
    </Scrollbar>
  );
}
