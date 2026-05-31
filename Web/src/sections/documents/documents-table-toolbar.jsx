'use client';

import { useState, useCallback } from 'react';
import {
  Stack,
  TextField,
  InputLabel,
  FormControl,
  OutlinedInput,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Divider,
  InputAdornment,
  MenuList,
  Button,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useTranslation } from 'react-i18next';

export function DocumentsTableToolbar({
  filters,
  options,
  onResetPage,
  typeOptions,
  isProject,
  isClient,
  isLead,
  isTimeSheetView,
}) {
  const { t, i18n } = useTranslation('dashboard/documents');

  const router = useRouter();
  const popover = usePopover();

  const [searchCategory, setSearchCategory] = useState('');

  const filteredCategories = options.categories.filter((cat) =>
    cat.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleCategoryChange = useCallback(
    (event) => {
      const value =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
      filters.setState({ category: value });
      onResetPage();
    },
    [filters, onResetPage]
  );

  const handleSortBy = useCallback(
    (event) => {
      filters.setState({ sortBy: event.target.value });
      onResetPage();
    },
    [filters, onResetPage]
  );

  const handleFilterType = useCallback(
    (event) => {
      const newValue =
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;

      onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ my: 1 }}
      >
        {/* 🔍 Keyword Search */}
        <TextField
          fullWidth
          value={filters.state.name}
          onChange={handleFilterName}
          placeholder={
            !isTimeSheetView ? t('documents.list.toolbar.search_placeholder') : 'Search notes...'
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xl: '600px' },
            '& .MuiInputBase-input': {
              padding: '10px 14px',
            },
            '& .MuiInputLabel-root': {
              top: '-7px',
            },
          }}
        />

        {!isProject && !isClient && !isLead && !isTimeSheetView && (
          <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
            <InputLabel htmlFor="doc-filter-type-select-label" sx={{ top: '-6px' }}>
              {t('documents.list.toolbar.doc_type')}
            </InputLabel>
            <Select
              multiple
              value={filters.state.type}
              onChange={handleFilterType}
              input={<OutlinedInput label={t('documents.type')} />}
              renderValue={(selected) => selected.map((value) => value).join(', ')}
              inputProps={{ id: 'doc-filter-type-select-label' }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-6px',
                },
              }}
            >
              {typeOptions?.docType?.map((option) => (
                <MenuItem key={option} value={option.label}>
                  <Checkbox
                    disableRipple
                    size="small"
                    checked={filters.state.type.includes(option.label)}
                  />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel id="category-label" sx={{ top: '-6px' }}>
            {t('documents.list.toolbar.category_all')}
          </InputLabel>{' '}
          <Select
            labelId="category-label"
            multiple
            value={filters.state.category}
            onChange={handleCategoryChange}
            input={<OutlinedInput label={t('documents.list.toolbar.category_all')} />}
            renderValue={(selected) =>
              selected.length === 0 ? (
                <span style={{ opacity: 0.5 }}>{t('documents.list.toolbar.none_selected')}</span>
              ) : (
                selected.join(', ')
              )
            }
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 320 },
              },
            }}
            sx={{
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              },
              '& .MuiInputLabel-root': {
                top: '-6px',
              },
            }}
          >
            <MenuItem disableRipple disableTouchRipple>
              <TextField
                fullWidth
                placeholder={t('documents.add.placeholder_category')}
                size="small"
                onChange={(e) => setSearchCategory(e.target.value)}
              />
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            {filteredCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                <Checkbox checked={filters.state.category.includes(cat)} />
                <ListItemText primary={cat} />
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}

        {/* ⬇️ Sort By */}
        {/* {!isTimeSheetView && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="sortby-label">{t('documents.list.toolbar.sort_by')}</InputLabel>
            <Select
              labelId="sortby-label"
              value={filters.state.sortBy}
              onChange={handleSortBy}
              input={<OutlinedInput label={t('documents.list.toolbar.sort_by')} />}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  top: '-6px',
                },
              }}
            >
              <MenuItem value="latest">{t('documents.list.toolbar.sort_latest')}</MenuItem>
              <MenuItem value="oldest">{t('documents.list.toolbar.sort_oldest')}</MenuItem>
            </Select>
          </FormControl>
        )} */}
      </Stack>

      {/* 📎 Popover Actions */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:printer-minimalistic-bold" />
            {t('documents.actions.print')}
          </MenuItem>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:import-bold" />
            {t('documents.actions.import')}
          </MenuItem>
          <MenuItem onClick={popover.onClose}>
            <Iconify icon="solar:export-bold" />
            {t('documents.actions.export')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
