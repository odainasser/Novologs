import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function SalesMemberTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveDepartment = useCallback(
    (inputValue) => {
      const newValue = filters.state.department.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ department: newValue });
    },
    [filters, onResetPage]
  );
  const handleReset = useCallback(() => {
    onResetPage();
    filters.setState({ name: '', department: [] });
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Department:" isShow={!!filters.state.department.length}>
        {filters.state.department.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={item}
            onDelete={() => handleRemoveDepartment(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
