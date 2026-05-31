import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Define more types here
const FORMAT_PDF = ['pdf'];
const FORMAT_TEXT = ['txt'];
const FORMAT_HTML = ['html'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_ZIP = ['zip', 'rar', 'iso'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_AUDIO = ['wav', 'aif', 'mp3', 'aac', 'm4a'];
const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'svg', 'webp', 'PNG', 'JPG'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];

const iconUrl = (icon) => `${CONFIG.assetsDir}/assets/icons/files/${icon}.svg`;

// ----------------------------------------------------------------------

export function fileFormat(fileUrl) {
  let format;

  if (!fileUrl) {
    return 'Folder';
  }

  const fileByUrl = fileTypeByUrl(fileUrl);

  if (FORMAT_TEXT.includes(fileByUrl)) {
    format = 'txt';
  } else if (FORMAT_HTML.includes(fileByUrl)) {
    format = 'html';
  } else if (FORMAT_ZIP.includes(fileByUrl)) {
    format = 'zip';
  } else if (FORMAT_AUDIO.includes(fileByUrl)) {
    format = 'audio';
  } else if (FORMAT_IMG.includes(fileByUrl)) {
    format = 'image';
  } else if (FORMAT_VIDEO.includes(fileByUrl)) {
    format = 'video';
  } else if (FORMAT_WORD.includes(fileByUrl)) {
    format = 'word';
  } else if (FORMAT_EXCEL.includes(fileByUrl)) {
    format = 'excel';
  } else if (FORMAT_POWERPOINT.includes(fileByUrl)) {
    format = 'powerpoint';
  } else if (FORMAT_PDF.includes(fileByUrl)) {
    format = 'pdf';
  } else if (FORMAT_PHOTOSHOP.includes(fileByUrl)) {
    format = 'photoshop';
  } else if (FORMAT_ILLUSTRATOR.includes(fileByUrl)) {
    format = 'illustrator';
  } else {
    format = fileTypeByUrl(fileUrl);
  }

  return format;
}

// ----------------------------------------------------------------------

export function fileThumb(fileUrl) {
  let thumb;

  switch (fileFormat(fileUrl)) {
    case 'folder':
      thumb = iconUrl('ic-folder');
      break;
    case 'html':
      thumb = iconUrl('ic-document');
      break;
    case 'txt':
      thumb = iconUrl('ic-txt');
      break;
    case 'zip':
      thumb = iconUrl('ic-zip');
      break;
    case 'audio':
      thumb = iconUrl('ic-audio');
      break;
    case 'video':
      thumb = iconUrl('ic-video');
      break;
    case 'word':
      thumb = iconUrl('ic-word');
      break;
    case 'excel':
      thumb = iconUrl('ic-excel');
      break;
    case 'powerpoint':
      thumb = iconUrl('ic-power_point');
      break;
    case 'pdf':
      thumb = iconUrl('ic-pdf');
      break;
    case 'photoshop':
      thumb = iconUrl('ic-pts');
      break;
    case 'illustrator':
      thumb = iconUrl('ic-ai');
      break;
    case 'image':
      thumb = iconUrl('ic-img');
      break;
    default:
      thumb = iconUrl('ic-folder');
  }
  return thumb;
}

// ----------------------------------------------------------------------

export function fileTypeByUrl(fileUrl) {
  return (fileUrl && fileUrl.split('.').pop()) || '';
}

// ----------------------------------------------------------------------

export function fileNameByUrl(fileUrl) {
  return fileUrl.split('/').pop();
}

// ----------------------------------------------------------------------

export function fileData(file) {
  if (typeof file === 'string') {
    return {
      preview: file,
      name: fileNameByUrl(file),
      type: fileTypeByUrl(file),
      size: undefined,
      path: file,
      lastModified: undefined,
      lastModifiedDate: undefined,
    };
  }

  if (file && typeof file === 'object') {
    return {
      name: file.name || 'Unknown',
      size: file.size || 0,
      path: file.path || file.preview || '',
      type: file.type || 'unknown',
      preview: file.preview || file.path || '',
      lastModified: file.lastModified || 'Not Available',
      lastModifiedDate: file.lastModified || 'Not Available',
    };
  }

  return {
    name: 'Unknown',
    size: 0,
    path: '',
    type: 'unknown',
    preview: '',
    lastModified: undefined,
    lastModifiedDate: undefined,
  };
}
