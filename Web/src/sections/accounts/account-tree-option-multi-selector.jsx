import { useState } from 'react';
import {
  Box,
  TextField,
  Popover,
  Typography,
  IconButton,
  InputAdornment,
  Checkbox,
  Chip,
  Stack,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { getHierarchyChart } from 'src/actions/accounts/accountActions';

function AccountTreeOptionMultiSelector({
  node,
  level = 0,
  expanded,
  toggleExpand,
  onSelect,
  selectedIds = [],
  searchValue,
  multiple = false,
  showCheckbox = false,
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = !hasChildren;

  const matchesSearch =
    !searchValue ||
    node.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    node.code?.toLowerCase().includes(searchValue.toLowerCase());

  const childMatches =
    hasChildren && node.children.some((child) => checkTreeMatch(child, searchValue));

  if (!matchesSearch && !childMatches) return null;

  const isOpen = expanded[node.id] ?? true;
  const isChecked = selectedIds.includes(node.id);

  return (
    <>
      <Box
        onClick={() => {
          if (hasChildren) {
            toggleExpand(node.id);
          } else {
            onSelect(node);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: `${level * 24}px`,
          pr: 1,
          py: 0.75,
          cursor: 'pointer',
          bgcolor: isChecked ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          borderRadius: 1,
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.id);
            }}
          >
            <Iconify icon={isOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} width={16} />
          </IconButton>
        ) : (
          <Box sx={{ width: 32 }} />
        )}

        {showCheckbox && isLeaf && (
          <Checkbox
            size="small"
            checked={isChecked}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node);
            }}
            sx={{ p: 0.5, mr: 1 }}
          />
        )}

        <Typography
          variant="body2"
          sx={{
            fontWeight: isLeaf ? 400 : 600,
            color: isLeaf ? 'text.primary' : 'text.secondary',
          }}
        >
          {node.code} - {node.name}
        </Typography>
      </Box>

      {hasChildren &&
        isOpen &&
        node.children.map((child) => (
          <AccountTreeOptionMultiSelector
            key={child.id}
            node={child}
            level={level + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onSelect={onSelect}
            selectedIds={selectedIds}
            searchValue={searchValue}
            multiple={multiple}
            showCheckbox={showCheckbox}
          />
        ))}
    </>
  );
}

export function AccountTreeSelector({
  value,
  onChange,
  placeholder = 'Select account',
  label,
  multiple = false,
  showCheckbox = false,
}) {
  const { allCategories } = getHierarchyChart();
  const treeData = allCategories?.categories || [];

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [expanded, setExpanded] = useState({});

  const open = Boolean(anchorEl);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedIds = multiple ? value || [] : value ? [value] : [];

  const selectedNodes = multiple
    ? findNodesByIds(treeData, selectedIds)
    : selectedIds.length
      ? [findNodeById(treeData, selectedIds[0])].filter(Boolean)
      : [];

  const handleSelect = (selected) => {
    if (multiple) {
      const alreadySelected = selectedIds.includes(selected.id);

      const updated = alreadySelected
        ? selectedIds.filter((id) => id !== selected.id)
        : [...selectedIds, selected.id];

      onChange(updated);
    } else {
      onChange(selected.id);
      setAnchorEl(null);
    }
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={
          multiple
            ? selectedNodes.map((item) => `${item.code} - ${item.name}`).join(', ')
            : selectedNodes[0]
              ? `${selectedNodes[0].code} - ${selectedNodes[0].name}`
              : ''
        }
        placeholder={placeholder}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Iconify icon="eva:arrow-down-fill" width={18} />
            </InputAdornment>
          ),
        }}
      />

      {multiple && selectedNodes.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
          {selectedNodes.map((item) => (
            <Chip
              key={item.id}
              size="small"
              variant="soft"
              label={`${item.code} - ${item.name}`}
              onDelete={() => {
                onChange(selectedIds.filter((id) => id !== item.id));
              }}
            />
          ))}
        </Stack>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: anchorEl?.clientWidth || 400,
            maxHeight: 400,
            p: 1,
          },
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by account code or name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ mb: 1 }}
        />

        <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {treeData.map((node) => (
            <AccountTreeOptionMultiSelector
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onSelect={handleSelect}
              selectedIds={selectedIds}
              searchValue={searchValue}
              multiple={multiple}
              showCheckbox={showCheckbox}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
}

function findNodesByIds(nodes, ids) {
  const result = [];

  function traverse(items) {
    for (const node of items) {
      if (ids.includes(node.id)) {
        result.push(node);
      }
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return result;
}

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function checkTreeMatch(node, searchValue) {
  if (!searchValue) return true;

  const selfMatch =
    node.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    node.code?.toLowerCase().includes(searchValue.toLowerCase());

  if (selfMatch) return true;

  if (node.children?.length) {
    return node.children.some((child) => checkTreeMatch(child, searchValue));
  }

  return false;
}
