// components/CkEditorConfig.ts
import { toast } from 'src/components/snackbar';
import { useState, useEffect } from 'react';

import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  SimpleUploadAdapter,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Markdown,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  Title,
  TodoList,
  Underline,
  Undo,
} from 'ckeditor5';
import { CONFIG } from 'src/config-global';

import 'ckeditor5/ckeditor5.css';

class MyUploadAdapter {
  loader: any;
  abortController: AbortController;

  constructor(loader: any) {
    this.loader = loader;
    this.abortController = new AbortController();
  }

  // Starts the upload process.
  upload(): Promise<{ default: string }> {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve) => {
          const fileURL = URL.createObjectURL(file);
          resolve({ default: fileURL });
        })
    );
  }

  // Aborts the upload process if it's canceled.
  abort() {
    this.abortController.abort();
  }
}

function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new MyUploadAdapter(loader);
  };
}

const editorConfig = {
  toolbar: {
    items: [
      // Undo and Redo actions
      'undo',
      'redo',
      '|',

      // Clipboard actions
      'findAndReplace',
      '|',

      // Font and text styling
      'fontFamily',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      '|',

      // Text formatting
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',

      // Paragraph formatting
      'alignment',
      'heading',
      'style',
      '|',

      // Lists and indentation
      'bulletedList',
      'numberedList',
      'todoList',
      'outdent',
      'indent',
      '|',

      // Insert media and elements
      'link',
      'insertImage',
      'insertImageViaUrl',
      'mediaEmbed',
      'insertTable',
      '|',

      // Advanced editing and source view
      {
        label: 'Advanced',
        icon: 'plus',
        items: [
          'subscript',
          'superscript',
          'removeFormat',
          '|',
          'horizontalLine',
          'pageBreak',
          '|',
          'blockQuote',
          'codeBlock',
          'htmlEmbed',
          'specialCharacters',
          'highlight',
          '|',
          'sourceEditing',
          'showBlocks',
        ],
      },
    ],
    shouldNotGroupWhenFull: true,
    shouldGroupWhenFull: false,
  },
  extraPlugins: [MyCustomUploadAdapterPlugin],

  plugins: [
    AccessibilityHelp,
    Alignment,
    Autoformat,
    AutoImage,
    AutoLink,
    Autosave,
    BalloonToolbar,
    BlockQuote,
    BlockToolbar,
    Bold,
    CloudServices,
    Code,
    CodeBlock,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    FullPage,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    HtmlComment,
    HtmlEmbed,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    Markdown,
    MediaEmbed,
    PageBreak,
    Paragraph,
    PasteFromMarkdownExperimental,
    PasteFromOffice,
    RemoveFormat,
    SelectAll,
    ShowBlocks,
    SourceEditing,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    Title,
    TodoList,
    Underline,
    Undo,
  ],

  balloonToolbar: [
    'bold',
    'italic',
    '|',
    'link',
    'insertImage',
    '|',
    'bulletedList',
    'numberedList',
  ],
  blockToolbar: [
    'fontSize',
    'fontColor',
    'fontBackgroundColor',
    '|',
    'bold',
    'italic',
    '|',
    'link',
    'insertImage',
    'insertTable',
    '|',
    'bulletedList',
    'numberedList',
    'outdent',
    'indent',
  ],
  fontFamily: {
    supportAllValues: true,
  },
  fontSize: {
    options: [10, 12, 14, 'default', 18, 20, 22],
    supportAllValues: true,
  },
  heading: {
    options: [
      {
        model: 'paragraph',
        title: 'Paragraph',
        class: 'ck-heading_paragraph',
      },
      {
        model: 'heading1',
        view: 'h1',
        title: 'Heading 1',
        class: 'ck-heading_heading1',
      },
      {
        model: 'heading2',
        view: 'h2',
        title: 'Heading 2',
        class: 'ck-heading_heading2',
      },
      {
        model: 'heading3',
        view: 'h3',
        title: 'Heading 3',
        class: 'ck-heading_heading3',
      },
      {
        model: 'heading4',
        view: 'h4',
        title: 'Heading 4',
        class: 'ck-heading_heading4',
      },
      {
        model: 'heading5',
        view: 'h5',
        title: 'Heading 5',
        class: 'ck-heading_heading5',
      },
      {
        model: 'heading6',
        view: 'h6',
        title: 'Heading 6',
        class: 'ck-heading_heading6',
      },
    ],
  },
  htmlSupport: {
    allow: [
      {
        name: /^.*$/,
        styles: true,
        attributes: true,
        classes: true,
      },
    ],
  },
  image: {
    toolbar: [
      'toggleImageCaption',
      'imageTextAlternative',
      '|',
      'imageStyle:inline',
      'imageStyle:wrapText',
      'imageStyle:breakText',
      '|',
      'resizeImage',
    ],
  },
  initialData: '',
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
    decorators: {
      toggleDownloadable: {
        mode: 'manual',
        label: 'Downloadable',
        attributes: {
          download: 'file',
        },
      },
    },
  },
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true,
    },
  },
  menuBar: {
    isVisible: false,
  },
  placeholder: 'Type or paste your content here!',
  style: {
    definitions: [
      {
        name: 'Article category',
        element: 'h3',
        classes: ['category'],
      },
      {
        name: 'Title',
        element: 'h2',
        classes: ['document-title'],
      },
      {
        name: 'Subtitle',
        element: 'h3',
        classes: ['document-subtitle'],
      },
      {
        name: 'Info box',
        element: 'p',
        classes: ['info-box'],
      },
      {
        name: 'Side quote',
        element: 'blockquote',
        classes: ['side-quote'],
      },
      {
        name: 'Marker',
        element: 'span',
        classes: ['marker'],
      },
      {
        name: 'Spoiler',
        element: 'span',
        classes: ['spoiler'],
      },
      {
        name: 'Code (dark)',
        element: 'pre',
        classes: ['fancy-code', 'fancy-code-dark'],
      },
      {
        name: 'Code (bright)',
        element: 'pre',
        classes: ['fancy-code', 'fancy-code-bright'],
      },
    ],
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableProperties',
      'tableCellProperties',
    ],
  },
};

export default editorConfig;
