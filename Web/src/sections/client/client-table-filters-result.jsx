import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function ClientTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
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

  const handleRemoveMyClient = useCallback(
    (inputValue) => {
      const newValue = filters.state.myClient.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ myClient: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemoveMembers = useCallback(
    (inputValue) => {
      const newValue = filters.state.members.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ members: newValue });
    },
    [filters, onResetPage]
  );
  const handleReset = useCallback(() => {
    onResetPage();
    // filters.onResetState();
    filters.setState({ name: '', status: [], myClient: [], members: [] });
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
        {filters.state.status.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveStatus(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Clients:" isShow={!!filters.state.myClient.length}>
        {filters.state.myClient.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={item}
            onDelete={() => handleRemoveMyClient(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Members:" isShow={!!filters.state.members.length}>
        {filters.state.members.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveMembers(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
