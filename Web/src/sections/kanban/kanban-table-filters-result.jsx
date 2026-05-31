import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import { fDateRangeShortLabel } from 'src/utils/format-time';
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

export function KanbanTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  sx,
  view,
  memberOptions,
}) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ name: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveRole = useCallback(
    (inputValue) => {
      const newValue = filters.state.role.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ role: newValue });
    },
    [filters, onResetPage]
  );
  const handleRemoveVariant = useCallback(
    (inputValue) => {
      const newValue = filters.state.taskVariant.filter((item) => item !== inputValue);
      onResetPage();
      filters.setState({ taskVariant: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemoveMember = useCallback(() => {
    onResetPage();
    filters.setState({ member: '' });
  }, [filters, onResetPage]);
  const handleRemoveAssignedFrom = useCallback(
    (inputValue) => {
      const newValue = filters.state.assignedFrom.filter((item) => item.id !== inputValue.id);

      onResetPage();
      filters.setState({ assignedFrom: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemoveAssignedTo = useCallback(
    (inputValue) => {
      const newValue = filters.state.assignedTo.filter((item) => item.id !== inputValue.id);

      onResetPage();
      filters.setState({ assignedTo: newValue });
    },
    [filters, onResetPage]
  );

  const handleRemovePriority = useCallback(
    (inputValue) => {
      const newValue = filters.state.priority.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ priority: newValue });
    },
    [filters, onResetPage]
  );
  const handleRemoveTaskStatus = useCallback(
    (inputValue) => {
      const newValue = filters.state.taskStatus.filter((item) => item !== inputValue);

      onResetPage();
      filters.setState({ taskStatus: newValue });
    },
    [filters, onResetPage]
  );
  const handleRemoveDate = useCallback(() => {
    onResetPage();
    filters.setState({ startDate: null, endDate: null });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    // filters.onResetState();
    filters.setState({
      name: '',
      role: [],
      member: '',
      taskStatus: [],
      taskVariant: [],
      priority: [],
      assignedFrom: [],
      assignedTo: [],
      startDate: null,
      endDate: null,
    });
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      {/* <FiltersBlock label="Status:" isShow={filters.state.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.state.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock> */}
      <FiltersBlock label="Status:" isShow={!!filters.state.role.length}>
        {filters.state.role.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveRole(item)} />
        ))}
      </FiltersBlock>
      <FiltersBlock label="Task Type:" isShow={!!filters.state.taskVariant.length}>
        {filters.state.taskVariant.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveVariant(item)} />
        ))}
      </FiltersBlock>
      {view === 'grid' && (
        <FiltersBlock label="Status:" isShow={!!filters.state.taskStatus.length}>
          {filters.state.taskStatus.map((item) => (
            <Chip
              {...chipProps}
              key={item}
              label={item}
              onDelete={() => handleRemoveTaskStatus(item)}
            />
          ))}
        </FiltersBlock>
      )}
      <FiltersBlock label="Members:" isShow={!!filters.state.member}>
        <Chip
          {...chipProps}
          label={
            memberOptions?.members?.find((user) => user.id === filters.state.member)?.fullName ||
            'Unknown'
          }
          onDelete={handleRemoveMember}
        />
      </FiltersBlock>
      <FiltersBlock label="Created By:" isShow={!!filters.state.assignedFrom.length}>
        {filters.state.assignedFrom.map((item) => (
          <Chip
            {...chipProps}
            key={item.id}
            label={item.fullName}
            onDelete={() => handleRemoveAssignedFrom(item)}
          />
        ))}
      </FiltersBlock>
      <FiltersBlock label="Assigned To:" isShow={!!filters.state.assignedTo.length}>
        {filters.state.assignedTo.map((item) => (
          <Chip
            {...chipProps}
            key={item.id}
            label={item.fullName}
            onDelete={() => handleRemoveAssignedTo(item)}
          />
        ))}
      </FiltersBlock>
      <FiltersBlock label="Priority:" isShow={!!filters.state.priority.length}>
        {filters.state.priority.map((item) => (
          <Chip
            {...chipProps}
            key={item}
            label={item}
            onDelete={() => handleRemovePriority(item)}
          />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.state.name}>
        <Chip {...chipProps} label={filters.state.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
      <FiltersBlock
        label="Date:"
        isShow={Boolean(filters.state.startDate && filters.state.endDate)}
      >
        <Chip
          {...chipProps}
          label={`${dayjs(filters.state.startDate).format('DD-MM-YYYY')} - ${dayjs(
            filters.state.endDate
          ).format('DD-MM-YYYY')}`}
          onDelete={handleRemoveDate}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
