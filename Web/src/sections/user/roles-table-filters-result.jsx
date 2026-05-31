import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function RolesTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveRoles = useCallback(
    (inputValue) => {
      const newValue = filters.state.roles.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ roles: newValue });
    },
    [filters, onResetPage]
  );
  const handleReset = useCallback(() => {
    onResetPage();
    filters.setState({ name: '', roles: [] });
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Roles:" isShow={!!filters.state.roles.length}>
        {filters.state.roles.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveRoles(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
