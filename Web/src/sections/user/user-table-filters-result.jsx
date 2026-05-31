import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function UserTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  searchText,
  setSearchText,
  departments,
  designations,
  branches,
  sx,
}) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    setSearchText('');
    filters.setState({ name: '' });
  }, [filters, onResetPage, setSearchText]);

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
  const handleRemoveDesignation = useCallback(() => {
    onResetPage();
    filters.setState({ designation: '' });
  }, [filters, onResetPage]);

  const handleRemoveBranch = useCallback(() => {
    onResetPage();
    filters.setState({ branch: '' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    setSearchText('');
    filters.setState({ name: '', status: [], department: '', designation: '', branch: '' });
  }, [filters, onResetPage, setSearchText]);

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
      <FiltersBlock label="Designation:" isShow={!!filters.state.designation}>
        <Chip
          {...chipProps}
          label={
            designations?.designations?.find((d) => d.id === filters.state.designation)?.name
              ?.value || 'Unknown'
          }
          onDelete={handleRemoveDesignation}
        />
      </FiltersBlock>

      <FiltersBlock label="Branch:" isShow={!!filters.state.branch}>
        <Chip
          {...chipProps}
          label={branches?.branches?.find((b) => b.id === filters.state.branch)?.name || 'Unknown'}
          onDelete={handleRemoveBranch}
        />
      </FiltersBlock>
      <FiltersBlock label="Keyword:" isShow={!!searchText}>
        <Chip {...chipProps} label={searchText} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
