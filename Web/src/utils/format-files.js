export function getFileType(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    return 'Folder';
  }

  const splittedArray = filePath.split('.');
  return splittedArray[splittedArray.length - 1].toUpperCase();
}

export const getFileExtension = (fullPath) => {
  if (!fullPath || typeof fullPath !== 'string') {
    return '';
  }
  const parts = fullPath.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};
