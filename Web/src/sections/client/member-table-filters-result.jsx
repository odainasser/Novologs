import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function MemberTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);



  const handleRemoveMember = useCallback(
    (inputValue) => {
      const newValue = filters.state.member.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ member: newValue });
    },
    [filters, onResetPage]
  );

  const handleReset = useCallback(() => {
    onResetPage();

    filters.setState({ name: '', member: [] });
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>

      <FiltersBlock label="Members:" isShow={!!filters.state.member.length}>
        {filters.state.member.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveMember(item)} />
        ))}
      </FiltersBlock>
      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
