import { useCallback } from 'react';

import Chip from '@mui/material/Chip';
import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function DocumentsTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveCategory = useCallback(
    (inputValue) => {
      const newValue = filters.state.category.filter((item) => item !== inputValue);
      onResetPage();
      filters.setState({ category: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemoveSort = useCallback(() => {
    onResetPage();
    filters.setState({ sortBy: 'latest' }); // reset to default
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.setState({ name: '', category: [], sortBy: 'latest', type: [] });
  }, [filters, onResetPage]);

  const handleRemoveType = useCallback(
    (inputValue) => {
      const newValue = filters.state.type.filter((item) => item !== inputValue);
      onResetPage();
      filters.setState({ type: newValue });
    },
    [filters, onResetPage]
  );

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>

      <FiltersBlock label="Type:" isShow={!!filters.state.type.length}>
        {filters.state.type.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveType(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Category:" isShow={!!filters.state.category?.length}>
        {filters.state.category.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={item}
            onDelete={() => handleRemoveCategory(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Sort by:" isShow={filters.state.sortBy !== 'latest'}>
        <Chip
          {...chipProps}
          label={filters.state.sortBy}
          onDelete={handleRemoveSort}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
