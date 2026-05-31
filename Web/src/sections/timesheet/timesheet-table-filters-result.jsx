import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function TimesheetTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'All Timesheets' }); // 👈 Default
  }, [filters, onResetPage]);

  const handleRemoveProject = useCallback(() => {
    onResetPage();
    filters.setState({ project: 'All Projects' }); // 👈 Optional dropdown default
  }, [filters, onResetPage]);

  const handleRemoveTask = useCallback(() => {
    onResetPage();
    filters.setState({ task: 'All Tasks' });
  }, [filters, onResetPage]);

  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);
  const handleRemoveVariant = useCallback(
    (inputValue) => {
      const newValue = filters.state.taskVariant.filter((item) => item !== inputValue);
      onResetPage();
      filters.setState({ taskVariant: newValue });
    },
    [filters, onResetPage]
  );
  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Status:" isShow={filters.state.status !== 'All Timesheets'}>
        <Chip
          {...chipProps}
          label={filters.state.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Project:" isShow={filters.state.project !== 'All Projects'}>
        <Chip
          {...chipProps}
          label={filters.state.project}
          onDelete={handleRemoveProject}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>
      <FiltersBlock label="Task:" isShow={filters.state.task !== 'All Tasks'}>
        <Chip
          {...chipProps}
          label={filters.state.task}
          onDelete={handleRemoveTask}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Task Type:" isShow={!!filters.state.taskVariant.length}>
        {filters.state.taskVariant.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveVariant(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
