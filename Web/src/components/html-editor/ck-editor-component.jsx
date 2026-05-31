import React, { useState, useEffect, useRef, useMemo } from 'react';
import './module.css';
import { toast } from 'src/components/snackbar';
import { ZETA_STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/config-global';
import { apiEndpoints } from 'src/utils/api-endpoints';
import LinearProgress from '@mui/material/LinearProgress';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { addFile } from 'src/actions/file/fileActions';
// import JoditEditor from 'jodit-pro-react';
import dynamic from 'next/dynamic';
const JoditEditor = dynamic(() => import('jodit-pro-react'), {
  ssr: false,
});

let employeeAutoCompleteList = [];
export default function CkEditorComponent5({
  data = '',
  employeesData = [],
  onChange,
  isTaskFile,
  taskId,
  isDocFile,
}) {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [editorData, setEditorData] = useState(data);
  const editorRef = useRef(null);
  const joditInstanceRef = useRef(null);
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

  let placeholder = null;
  const [content, setContent] = useState(data);

  useEffect(() => {
    setContent(data);
  }, [data]);
  const [uploading, setUploading] = useState(false);
  //TODO dotnot use localStorage directly, use a context or a state management library
  const employeeId = Number(localStorage.getItem('EMPLOYEE_ID_KEY'));
  const accessToken = String(localStorage.getItem(ZETA_STORAGE_KEY));
  const baseURL = CONFIG.zetaApiUrl;
  // Utility function to check URL type
  const checkUrlType = (url) => {
    // Convert to lowercase for case-insensitive comparison
    const lowerUrl = url.toLowerCase();

    // Video extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
    // Image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

    // Check if URL ends with any video extension
    if (videoExtensions.some((ext) => lowerUrl.endsWith(ext))) {
      return 1; // Video
    }
    // Check if URL ends with any image extension
    else if (imageExtensions.some((ext) => lowerUrl.endsWith(ext))) {
      return 2; // Image
    }
    return 3; // Other files
  };
  // Utility function to get file icon based on extension
  const getFileIcon = (url) => {
    const extension = url.split('.').pop().toLowerCase();

    // Map of file extensions to Font Awesome icons
    const iconMap = {
      // Documents
      pdf: 'far fa-file-pdf',
      doc: 'far fa-file-word',
      docx: 'far fa-file-word',
      xls: 'far fa-file-excel',
      xlsx: 'far fa-file-excel',
      ppt: 'far fa-file-powerpoint',
      pptx: 'far fa-file-powerpoint',
      txt: 'far fa-file-alt',

      // Archives
      zip: 'far fa-file-archive',
      rar: 'far fa-file-archive',
      '7z': 'far fa-file-archive',

      // Audio
      mp3: 'far fa-file-audio',
      wav: 'far fa-file-audio',

      // Default
      default: 'far fa-file',
    };

    return iconMap[extension] || iconMap.default;
  };

  employeeAutoCompleteList = useMemo(() => {
    if (!employeesData) return [];

    return employeesData.map((employee) => {
      let username = employee.email.split('@')[0];
      return {
        id: `@${username}`,
        userId: employee.id,
        name: `${employee.fullName}`,
        designation: employee?.designationName?.value ?? '',
        link: `/dashboard/user/${employee.id}/details/`,
        photoPath: employee.profileImageFileUrl || employee?.fullName?.charAt(0).toUpperCase(),
      };
    });
  }, [employeesData]);

  const config = useMemo(
    () => ({
      license: CONFIG.joditEditorKey || process.env.NEXT_PUBLIC_JODIT_EDITOR_KEY || '',

      readonly: false,
      saveHeightInStorage: true,

      toolbarSticky: true,
      toolbarDisableStickyForMobile: false,

      height: '75vh',
      width: '100%',
      minWidth: 200,
      minHeight: 500,

      toolbarAdaptive: false,

      buttons: [
        {
          name: 'customDropdown',
          iconURL: 'https://cdn-icons-png.flaticon.com/512/748/748113.png',
          popup: (editor, current, close) => {
            const wrapper = editor.create.div();
            wrapper.classList.add('jodit-ui-dropdown-menu');

            const options = [
              {
                text: 'Insert Date',
                exec: () => {
                  try {
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString();

                    editor.selection.insertHTML(formattedDate);

                    close();
                  } catch (error) {
                    console.error('Failed to insert date:', error);
                  }
                },
              },
            ];

            options.forEach((option) => {
              const optionDiv = editor.create.div({ className: 'jodit-ui-dropdown-menu-item' });
              optionDiv.style.cursor = 'pointer';

              const contentWrapper = editor.create.div({
                className: 'content-wrapper',
                style: 'display: flex; align-items: center; gap: 8px;',
              });

              contentWrapper.appendChild(editor.create.text(option.text));
              optionDiv.appendChild(contentWrapper);

              optionDiv.addEventListener('click', option.exec);
              wrapper.appendChild(optionDiv);
            });

            return wrapper;
          },
        },
        'bold',
        'italic',
        'underline',
        '|',
        'strikethrough',
        'eraser',
        'ul',
        'ol',
        '|',
        'font',
        'fontsize',
        'paragraph',
        'lineHeight',
        '|',
        'superscript',
        'subscript',
        'indent',
        'outdent',
        'align',
        'brush',
        // '\n',
        '|',
        {
          name: 'uploadFile',
          icon: 'upload',
          tooltip: 'Upload file/image/video',
          exec: async () => {
            const input = document.createElement('input');

            input.type = 'file';
            input.accept = '*/*';
            input.multiple = true;

            input.onchange = async () => {
              const selectedFiles = Array.from(input.files || []);

              if (!selectedFiles.length) {
                toast.error('No files selected');
                return;
              }

              try {
                setUploading(true);

                const jodit = joditInstanceRef.current;

                if (!jodit) {
                  toast.error('Editor is not ready');
                  return;
                }

                for (const selectedFile of selectedFiles) {
                  const payload = {
                    path: '',
                    source: 'default',
                    name: selectedFile.name,
                    file: selectedFile,
                    ...(isTaskFile && {
                      entityType: 8,
                      entityId: taskId,
                    }),
                  };

                  try {
                    const response = await addFile(payload);

                    if (!response.success) {
                      toast.error(`Failed: ${selectedFile.name}`);
                      continue;
                    }

                    const uploadedFile = response.response?.data?.successStatus;

                    if (!uploadedFile?.url) {
                      toast.error(`Missing URL: ${selectedFile.name}`);
                      continue;
                    }

                    const type = checkUrlType(uploadedFile.url);

                    if (type === 1) {
                      jodit.execCommand(
                        'insertHTML',
                        false,
                        `<iframe
                  width="370px"
                  height="132px"
                  src="${uploadedFile.url}"
                  frameborder="0"
                  allowfullscreen=""
                ></iframe><br/>`
                      );
                    } else if (type === 2) {
                      jodit.execCommand('insertImage', false, uploadedFile.url);

                      jodit.execCommand('insertHTML', false, '<br/>');
                    } else {
                      const fileIcon = getFileIcon(uploadedFile.url);

                      jodit.execCommand(
                        'insertHTML',
                        false,
                        `
                <a
                  href="${uploadedFile.url}"
                  target="_blank"
                  style="text-decoration:none;color:inherit;"
                >
                  <strong class="${fileIcon}"></strong>
                  ${uploadedFile.name || selectedFile.name}
                </a>
                <br/>
                `
                      );
                    }
                  } catch (error) {
                    console.error('Upload failed:', error);
                    toast.error(`Upload failed: ${selectedFile.name}`);
                  }
                }

                toast.success('Files uploaded successfully');
              } finally {
                setUploading(false);
              }
            };

            input.click();
          },
        },
        'link',

        // 'image',
        // 'video',
        '|',
        'table',
        'symbols',
        'undo',
        'redo',
        'find',
        '|',
        'spellcheck',
        // 'speechRecognize',
        'cut',
        'copy',
        'paste',
        // 'copyformat',
        'print',
        '|',
        'emoji',
        // 'mobileView',
        // 'ai-commands',
      ],
      i18n: {
        en: {
          'Insert file': 'Insert file/image/video',
        },
      },

      placeholder: placeholder || 'Start Typing...',
      toolbarAdaptive: false,

      events: {
        afterInit: (jodit) => {
          joditInstanceRef.current = jodit;

          const originalSend = XMLHttpRequest.prototype.send;

          XMLHttpRequest.prototype.send = function (body) {
            try {
              const isUploadRequest = body instanceof FormData && [...body.keys()].includes('file');

              if (isUploadRequest) {
                setUploading(true);

                this.addEventListener('loadend', () => {
                  setUploading(false);
                });
              }
            } catch (e) {
              console.error('XHR Intercept Error:', e);
            }

            return originalSend.apply(this, arguments);
          };
        },
      },

      autocomplete: {
        sources: [
          {
            feed: (query) => {
              query = query.trimStart();
              if (!query.startsWith('@')) return [];

              query = query.toLowerCase();
              const cleanQuery = query.replace('@', '').toLowerCase();
              return employeeAutoCompleteList.filter(
                (value) =>
                  value.id.toLowerCase().includes(query) ||
                  value.name.toLowerCase().includes(cleanQuery)
              );
            },
            itemRenderer: (item) => {
              const placeholder = '/assets/icons/navbar/ic-user.svg';
              let mentionItem = `<div class="mention-item"> `;
              var img = '';
              img += `<img
                        src="${item.photoPath}"
                        alt="${item.name}'s avatar"
                        class="mention-avatar"
                        onerror="this.src = '${placeholder}';"
                      />`;
              mentionItem += img;
              mentionItem += `<div class="mention-info">
                                <span class="mention-email">${item.id}</span>
                                <span class="mention-full-name">${item.name}, ${item.designation}</span>
                              </div>`;
              mentionItem += `</div>`;
              //return `<div class="mention-item">${img} ${item.id} (${item.name})</div>`;

              return mentionItem;
            },
            insertValueRenderer: ({ id, userId, name, link, photoPath }) => {
              return `<a class="mention"  target="_blank" data-mention="${id}" data-user-id="${userId}" href="${link}">@${name}</a>`;
            },
          },
        ],
      },
    }),
    [placeholder, editorRef?.current?.jodit]
  );
  return (
    <div class="sticky-wrapper">
      {uploading && <LinearProgress sx={{ width: '100%', mb: 1 }} />}

      <div className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar">
        <div className="editor-container__editor ck-editor__editable_inline">
          {isLayoutReady && (
            <JoditEditor
              value={content}
              config={config}
              tabIndex={1}
              onBlur={(newContent) => {
                setContent(newContent);
                onChange(newContent);
              }}
              onChange={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
