import { useState } from 'react';
import { ChartAccountTableRow } from './chart-account-table-row';

export function TreeRow({
  row,
  selected,
  onDeleteRow,
  index,
  mutate,
  level = 0,
  accountList,
  mutateChartHierarchy,
  isEditing,
  onEditClick,
  editingCategoryId,
  setEditingCategoryId,
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = row.children && row.children.length > 0;

  return (
    <>
      <ChartAccountTableRow
        row={row}
        level={level}
        isOpen={open}
        hasChildren={hasChildren}
        onToggle={() => setOpen(!open)}
        accountList={accountList}
        onDeleteRow={() => onDeleteRow(row.id)}
        mutateChartHierarchy={mutateChartHierarchy}
        mutate={mutate}
        isEditing={isEditing}
        onEditClick={onEditClick}
        editingCategoryId={editingCategoryId}
        setEditingCategoryId={setEditingCategoryId}
      />
      {open &&
        hasChildren &&
        row.children.map((child) => (
          <TreeRow
            key={child.id}
            row={child}
            level={level + 1}
            accountList={accountList}
            onDeleteRow={onDeleteRow}
            mutateChartHierarchy={mutateChartHierarchy}
            mutate={mutate}
            isEditing={isEditing}
            onEditClick={onEditClick}
            editingCategoryId={editingCategoryId}
            setEditingCategoryId={setEditingCategoryId}
          />
        ))}
    </>
  );
}
