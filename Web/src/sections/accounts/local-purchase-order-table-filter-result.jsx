import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { fDateRangeShortLabel } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function LocalPurchaseOrderTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  searchText,
  setSearchText,
  sx,
}) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    setSearchText('');
    filters.setState({ name: '' });
  }, [filters, onResetPage, setSearchText]);
  const handleRemoveVendor = useCallback(() => {
    onResetPage();
    filters.setState({ vendor: null });
  }, [filters, onResetPage]);
  const handleRemoveDate = useCallback(() => {
    onResetPage();
    filters.setState({ startDate: null, endDate: null });
  }, [filters, onResetPage]);
  const handleReset = useCallback(() => {
    onResetPage();
    setSearchText('');
    filters.setState({ name: '', vendor: null, startDate: null, endDate: null });
  }, [filters, onResetPage, setSearchText]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Keyword:" isShow={!!searchText}>
        <Chip {...chipProps} label={searchText} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
      <FiltersBlock label="Vendor:" isShow={!!filters.state.vendor}>
        <Chip
          {...chipProps}
          key={filters.state.vendor?.id}
          label={filters.state.vendor?.name || ''}
          onDelete={handleRemoveVendor}
        />
      </FiltersBlock>
      <FiltersBlock
        label="Date:"
        isShow={Boolean(filters.state.startDate && filters.state.endDate)}
      >
        <Chip
          {...chipProps}
          label={fDateRangeShortLabel(filters.state.startDate, filters.state.endDate)}
          onDelete={handleRemoveDate}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
