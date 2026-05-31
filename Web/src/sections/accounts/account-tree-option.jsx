import { useState } from 'react';
import { Box, TextField, Popover, Typography, IconButton, InputAdornment } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { getHierarchyChart } from 'src/actions/accounts/accountActions';

function AccountTreeOption({
  node,
  level = 0,
  expanded,
  toggleExpand,
  onSelect,
  selectedId,
  searchValue,
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

  return (
    <>
      <Box
        onClick={() => {
          if (isLeaf) onSelect(node);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: `${level * 24}px`,
          pr: 1,
          py: 0.75,
          cursor: isLeaf ? 'pointer' : 'default',
          bgcolor: selectedId === node.id ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: isLeaf ? 'action.hover' : 'transparent',
          },
          opacity: isLeaf ? 1 : 0.9,
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
          <AccountTreeOption
            key={child.id}
            node={child}
            level={level + 1}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onSelect={onSelect}
            selectedId={selectedId}
            searchValue={searchValue}
          />
        ))}
    </>
  );
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

export function AccountTreeSelector({ value, onChange, placeholder = 'Select account' }) {
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

  const selectedNode = findNodeById(treeData, value);

  return (
    <>
      <TextField
        fullWidth
        size="small"
        value={selectedNode ? `${selectedNode.code} - ${selectedNode.name}` : ''}
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
            <AccountTreeOption
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedId={value}
              searchValue={searchValue}
              onSelect={(selected) => {
                onChange(selected.id);
                setAnchorEl(null);
              }}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
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
