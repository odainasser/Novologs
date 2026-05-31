import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function ProjectTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  STATUS_OPTIONS,
  departments,

  sx,
}) {
  const storedLang = localStorage.getItem('selectedLang');

  const getStatusLabel = (code) =>
    STATUS_OPTIONS.find((s) => s.code === code)?.[storedLang === 'ar' ? 'ar' : 'en'] || code;
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveType = useCallback(() => {
    onResetPage();
    filters.setState({ type: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(
    (inputValue) => {
      const newValue = filters.state.status.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemoveDepartment = useCallback(() => {
    onResetPage();
    filters.setState({ department: '' });
  }, [filters, onResetPage]);
  const handleReset = useCallback(() => {
    onResetPage();
    // filters.onResetState();
    filters.setState({ name: '', status: [], department: '' });
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      {/* <FiltersBlock label="Type:" isShow={filters.state.type !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.state.type}
          onDelete={handleRemoveType}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock> */}

      <FiltersBlock label="Status:" isShow={!!filters.state.status.length}>
        {filters.state.status.map((code) => (
          <Chip
            {...chipProps}
            key={code}
            label={getStatusLabel(code)}
            onDelete={() => handleRemoveStatus(code)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Department:" isShow={!!filters.state.department}>
        <Chip
          {...chipProps}
          label={
            departments?.departments?.find((d) => d.id === filters.state.department)?.name?.value ||
            'Unknown'
          }
          onDelete={handleRemoveDepartment}
        />
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
