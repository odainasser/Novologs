import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';

import { Image } from '../image';
import { Iconify } from '../iconify';
import { uploadClasses } from './classes';
import { RejectionFiles } from './components/rejection-files';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function UploadAvatar({
  sx,
  error,
  value,
  disabled,
  helperText,
  className,
  customWidth,
  customHeight,
  customBorderRadius,
  hideBorder,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });
  const { t, i18n } = useTranslation('dashboard/upload');
  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = hasFile && (
    <Image
      alt="avatar"
      src={preview}
      sx={{
        width: 1,
        height: 1,
        borderRadius: customBorderRadius !== undefined ? customBorderRadius : '50%',
        objectFit: 'cover', // Ensure image covers the area
      }}
    />
  );

  const renderPlaceholder = (
    <Box
      className="upload-placeholder"
      sx={{
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: customBorderRadius !== undefined ? customBorderRadius : '50%',
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
        }),
      }}
    >
      <Iconify icon="solar:camera-add-bold" width={32} />

      <Typography variant="caption">
        {hasFile ? t('upload.update_photo') : t('upload.upload_photo')}
      </Typography>
    </Box>
  );

  const renderContent = (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: customBorderRadius !== undefined ? customBorderRadius : '50%',
        position: 'relative',
      }}
    >
      {renderPreview}
      {renderPlaceholder}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        className={uploadClasses.uploadBox.concat(className ? ` ${className}` : '')}
        sx={{
          p: 1,
          m: 'auto',
          width: customWidth || 144,
          height: customHeight || 144,
          cursor: 'pointer',
          overflow: 'hidden',
          borderRadius: customBorderRadius !== undefined ? customBorderRadius : '50%',
          border: hideBorder
            ? 'none'
            : (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          ...(isDragActive && { opacity: 0.72 }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...(hasError && !hideBorder && { borderColor: 'error.main' }),
          ...(hasFile && {
            ...(hasError && {
              bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
            }),
            '&:hover .upload-placeholder': { opacity: 1 },
          }),
          ...sx,
        }}
      >
        <input {...getInputProps()} />

        {renderContent}
      </Box>

      {helperText && helperText}

      <RejectionFiles files={fileRejections} />
    </>
  );
}
