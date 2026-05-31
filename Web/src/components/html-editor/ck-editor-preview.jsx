import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './module.css';
import editorConfig from './ck-editor-config';
import DOMPurify from 'dompurify';
import '@fortawesome/fontawesome-svg-core/styles.css';

export default function CkEditorPreview({ content }) {
  const [parsedContent, setParsedContent] = useState(content);

  useEffect(() => {
    // Replace <oembed> tags with appropriate <iframe> tags
    const transformedContent = content?.replace(
      /<oembed\s+url="([^"]+)"><\/oembed>/g,
      (match, url) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          // Format YouTube URL for embedding
          const youtubeIdMatch = url.match(
            /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&]+)/
          );
          const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;
          return youtubeId
            ? `<iframe width="100%" height="515" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
            : match; // Return the original tag if not a valid YouTube URL
        } else {
          // Generic iframe for other URLs
          return `<iframe width="100%" height="515" src="${url}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }
      }
    );

    setParsedContent(transformedContent);
  }, [content]);

  const purify = DOMPurify();
  //const clean = purify.sanitize(parsedContent);
  const clean = parsedContent;
  return <div className="ck-content editor-preview" dangerouslySetInnerHTML={{ __html: clean }} />;
}
