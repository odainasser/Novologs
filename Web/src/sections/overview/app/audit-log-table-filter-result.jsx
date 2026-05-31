import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { fDateRangeShortLabel } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function AuditLogTableFiltersResult({
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
  const handleRemoveMember = useCallback(() => {
    onResetPage();
    filters.setState({ members: null });
  }, [filters, onResetPage]);
  const handleRemoveDate = useCallback(() => {
    onResetPage();
    filters.setState({ startDate: null, endDate: null });
  }, [filters, onResetPage]);
  const handleReset = useCallback(() => {
    onResetPage();
    setSearchText('');
    filters.setState({ name: '', members: null, startDate: null, endDate: null });
  }, [filters, onResetPage, setSearchText]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Keyword:" isShow={!!searchText}>
        <Chip {...chipProps} label={searchText} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
      <FiltersBlock label="Members:" isShow={!!filters.state.members}>
        <Chip
          {...chipProps}
          key={filters.state.members?.id}
          label={filters.state.members?.fullName || ''}
          onDelete={handleRemoveMember}
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
