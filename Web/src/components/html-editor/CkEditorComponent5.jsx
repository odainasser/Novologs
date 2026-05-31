import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import './module.css';
import editorConfig from './ck-editor-config';

export default function CkEditorComponent5({ data = '', onChange }) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [editorData, setEditorData] = useState(data);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
    if (onChange) {
      onChange(data);
    }
  };

  editorConfig.initialData = data;

  return (
    <div>
      <div
        className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar"
        ref={editorContainerRef}
      >
        <div
          ref={editorRef}
          className="editor-container__editor ck-editor__editable_inline"
        >
          {isLayoutReady && (
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              data={editorData}
              onChange={handleEditorChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
