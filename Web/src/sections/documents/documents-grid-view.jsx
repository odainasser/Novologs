'use client';

import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  MenuItem,
  MenuList,
  Button,
} from '@mui/material';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Image } from 'src/components/image';
import { CustomPopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useTranslation } from 'react-i18next';
import { Label } from 'src/components/label';
import { CONFIG } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';

export default function DocumentGridView({ documents, onView, onEdit, onDelete, isTimeSheetView }) {
  const { t } = useTranslation('dashboard/documents');
  const storedLang = localStorage.getItem('selectedLang');
  const { zetaUser } = useAuthContext();

  const [popover, setPopover] = useState({ anchorEl: null, doc: null });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleOpenPopover = (event, doc) => {
    setPopover({ anchorEl: event.currentTarget, doc });
  };

  const handleClosePopover = () => {
    setPopover({ anchorEl: null, doc: null });
  };

  const handleDelete = () => {
    if (selectedDoc) onDelete(selectedDoc);
    setConfirmOpen(false);
  };
  const itemsPerRow = 4;
  const rows = Array.from({ length: Math.ceil(documents.length / itemsPerRow) }, (_, i) =>
    documents.slice(i * itemsPerRow, i * itemsPerRow + itemsPerRow)
  );

  return (
    <>
      <Box sx={{ px: 2.5, pt: 2 }}>
        {rows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            onView
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
              gap: 2,
              pb: 2,
              mb: 2,
              borderBottom:
                rowIndex !== rows.length - 1 ? '1px dotted rgba(200,200,200,0.6)' : 'none',
            }}
          >
            {row.map((doc, i) => {
              const type = doc?.type;

              const typeLabelMap = {
                0: 'Book',
                1: 'Wiki',
                2: 'Post',
                3: 'Story',
                4: 'Task',
                5: 'Project',
                6: 'Milestone',
                7: 'Client',
                8: 'Lead',
                9: 'Vendor',
                10: 'Contract',
              };

              const typeColorMap = {
                0: 'info',
                1: 'secondary',
                2: 'primary',
                3: 'warning',
                4: 'error',
                5: 'success',
                6: 'warning',
                7: 'info',
                8: 'secondary',
                9: 'primary',
                10: 'success',
              };

              const typeLabel = typeLabelMap[type] || 'General';
              const typeColor = typeColorMap[type] || 'default';

              return (
                <Card
                  key={doc?.id}
                  onClick={() => onView?.(doc)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer', // Optional: add visual cue
                    '&:hover': {
                      boxShadow: 4, // Optional: add hover effect
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {fDate(doc?.lastModified || new Date())}
                    </Typography>

                    <Avatar
                      key={doc?.id}
                      alt={doc?.creator?.fullName}
                      src={doc?.creator?.profileImageUrl}
                    >
                      {!doc?.creator?.profileImageUrl &&
                        doc?.creator?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {doc?.documentVersionList?.[0]?.title || 'No Title'}
                      </Typography>
                      {!isTimeSheetView && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {doc?.documentVersionList?.[0]?.description || 'No Description'}
                        </Typography>
                      )}
                    </Box>{' '}
                    {!isTimeSheetView && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Label variant="soft" color={typeColor}>
                          <Typography variant="caption" component="span">
                            {typeLabel}
                          </Typography>
                        </Label>
                      </Box>
                    )}
                  </Box>
                  {!isTimeSheetView && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Image
                        src={
                          doc?.documentVersionList?.[0]?.headerImgFile?.url ||
                          `${CONFIG.assetsDir}/logo/novo.svg`
                        }
                        alt={doc?.documentVersionList?.[0]?.title || 'No Title'}
                        objectFit={
                          doc?.documentVersionList?.[0]?.headerImgFile?.url ? 'cover' : 'contain'
                        }
                        sx={{
                          width: '100%',
                          height: 120,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'end', gap: 1, mt: 'auto' }}>
                    <Tooltip title={t('documents.add.actions')}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click
                          handleOpenPopover(e, doc);
                        }}
                      >
                        <Iconify icon="eva:more-horizontal-fill" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Popover Menu */}
      <CustomPopover
        open={Boolean(popover.anchorEl)}
        anchorEl={popover.anchorEl}
        onClose={handleClosePopover}
        slotProps={{
          arrow: {
            placement: storedLang === 'ar' ? 'left-top' : 'right-top',
          },
        }}
        sx={{
          ...(storedLang === 'ar' && {
            direction: 'rtl',
            textAlign: 'right',
          }),
        }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              onView?.(popover.doc);
              handleClosePopover();
            }}
          >
            <Iconify icon="carbon:view" sx={{ mr: 1 }} />
            {t('documents.actions.view')}
          </MenuItem>
          {zetaUser?.permissions?.includes('Documents.Update') && (
            <MenuItem
              onClick={() => {
                onEdit?.(popover.doc);
                handleClosePopover();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
              {t('documents.actions.edit')}
            </MenuItem>
          )}
          {zetaUser?.permissions?.includes('Documents.Delete') && (
            <MenuItem
              onClick={() => {
                setSelectedDoc(popover.doc);
                setConfirmOpen(true);
                handleClosePopover();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
              {t('documents.actions.delete')}
            </MenuItem>
          )}
        </MenuList>
      </CustomPopover>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('documents.actions.delete')}
        content={t('documents.actions.delete_confirm')}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            {t('documents.actions.delete')}
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
    </>
  );
}

DocumentGridView.propTypes = {
  documents: PropTypes.array.isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
