import dynamic from 'next/dynamic';
import { cloneElement } from 'react';

import { useTheme } from '@mui/material/styles';

import { flattenArray } from 'src/utils/helper';
import { Iconify } from 'src/components/iconify';

import { IconButton } from '@mui/material';
import { useState } from 'react';
import { AddHierarchyMembers } from './add-heirarchy-members';
import { addUserToHierarchy, swapUserInHierarchy } from 'src/actions/hierarchy/hierarchyActions';
import { toast } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const Tree = dynamic(() => import('react-organizational-chart').then((mod) => mod.Tree), {
  ssr: false,
});

const TreeNode = dynamic(() => import('react-organizational-chart').then((mod) => mod.TreeNode), {
  ssr: false,
});

// ----------------------------------------------------------------------

export function OrganizationalChart({
  newEmployee,
  data,
  nodeItem,
  onAddEmployee,
  matchingChildren,
  userDepartments,
  userDesignations,
  addBeforeSave,
  mutate,
  setHierarchyParentId,
  setNodeDepth,
  nodeDepth,
  setReporter,
  reporter,
  ...other
}) {
  console.log('Matching Children of General Department:', matchingChildren);

  const theme = useTheme();

  const cloneNode = (props) => cloneElement(nodeItem(props));

  const label = cloneNode({
    ...data,
  });

  return (
    <Tree
      lineWidth="1.5px"
      nodePadding="4px"
      lineBorderRadius="24px"
      lineColor={theme.vars.palette.divider}
      label={label}
      {...other}
    >
      {data?.children?.map((list, index) => (
        <TreeList
          key={index}
          depth={1}
          data={list}
          nodeItem={nodeItem}
          onAddEmployee={onAddEmployee}
          setNodeDepth={setNodeDepth}
          setReporter={setReporter}
          reporter={reporter}
          nodeDepth={nodeDepth}
          setHierarchyParentId={setHierarchyParentId}
          newEmployee={newEmployee}
          matchingChildren={matchingChildren}
          userDepartments={userDepartments}
          userDesignations={userDesignations}
          addBeforeSave={addBeforeSave}
          mutate={mutate}
        />
      ))}
    </Tree>
  );
}

// ----------------------------------------------------------------------

export function TreeList({
  data,
  depth,
  nodeItem,
  onAddEmployee,
  setNodeDepth,
  nodeDepth,
  setReporter,
  reporter,
  setHierarchyParentId,
  newEmployee,
  matchingChildren,
  userDepartments,
  userDesignations,
  addBeforeSave,
  mutate,
}) {
  const { zetaUser } = useAuthContext();
  const { t } = useTranslation('dashboard/teams');
  const [isCollapsed, setIsCollapsed] = useState(data.collapsed || false);

  const theme = useTheme();

  const [openMembers, setOpenMembers] = useState(false);
  const handleOpenMembers = () => {
    setOpenMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setOpenMembers(false);
    }, 100);
  };

  const childs = data.children;
  console.log('this is the children', data);
  const hasChildren = childs && childs.length > 0;

  const cloneNode = (props) => cloneElement(nodeItem(props));

  const handleClick = () => {
    if (newEmployee.fullName && newEmployee.email && addBeforeSave) {
      console.log('onClick', data);
      setHierarchyParentId(data?.id);
      setNodeDepth(depth);
      if (depth === 1) {
        setReporter(data?.rootName);
      } else {
        if (data?.name) {
          setReporter(data?.name);
        } else {
          if (data?.parentName) {
            setReporter(data?.parentName);
          } else {
            setReporter(data?.rootName);
          }
        }
      }

      onAddEmployee(data);
    } else {
      console.log('onClick', data);
      setOpenMembers(true);
      setDestinationParentNodeId(data?.id);
    }
  };

  const handleToggleCollapse = (event) => {
    event.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  const [destinationParentNodeId, setDestinationParentNodeId] = useState('');
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [nodeToInsertId, setNodeToInsertId] = useState('');
  const [isVacant, setIsVacant] = useState('');

  const label = cloneNode({
    ...data,
    depth,
    totalChildren: hasChildren
      ? flattenArray(childs)?.filter((child) => child.name !== undefined)?.length
      : 0,
    newEmployee: newEmployee,
    onAddEmployee: onAddEmployee,
    setNodeDepth: setNodeDepth,
    setHierarchyParentId: setHierarchyParentId,
    setOpenMembers: setOpenMembers,
    setDestinationParentNodeId: setDestinationParentNodeId,
    addBeforeSave: addBeforeSave,
    data: data,
    setIsVacant: setIsVacant,
    isVacant: isVacant,
    userDepartments: userDepartments,
    mutate: mutate,
    isCollapsed,
    handleToggleCollapse,
  });

  console.log('this is the nodeToInsertId', nodeToInsertId);

  console.log('this is the selected person', selectedPersons);

  const handleTogglePerson = (person) => {
    setSelectedPersons(person);
  };

  const addEmployee = async (data) => {
    console.log('this is the data', data);

    try {
      let response;

      if (isVacant === 'vacant') {
        response = await swapUserInHierarchy(data);
      } else {
        response = await addUserToHierarchy(data);
      }

      if (response?.success) {
        await mutate();
        toast.success(t('hierarchy.toast.user_added_hierarchy'));
      } else {
        toast.error(response?.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Add user failed:', error);
      toast.error(t('hierarchy.toast.user_error'));
    }
  };

  return (
    <>
      <TreeNode label={label}>
        {hasChildren && !isCollapsed && (
          <TreeSubList
            data={childs}
            depth={depth}
            nodeItem={nodeItem}
            onAddEmployee={onAddEmployee}
            setNodeDepth={setNodeDepth}
            nodeDepth={nodeDepth}
            setReporter={setReporter}
            reporter={reporter}
            setHierarchyParentId={setHierarchyParentId}
            newEmployee={newEmployee}
            matchingChildren={matchingChildren}
            userDepartments={userDepartments}
            userDesignations={userDesignations}
            addBeforeSave={addBeforeSave}
            mutate={mutate}
          />
        )}
        {zetaUser?.permissions?.includes('Users.AddEmployee') && (
          <TreeNode
            label={
              <IconButton
                size="small"
                color="primary"
                onClick={handleClick}
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: '#006A67',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                  cursor: 'pointer',
                }}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            }
          />
        )}
      </TreeNode>

      <AddHierarchyMembers
        open={openMembers}
        shared={matchingChildren}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        onClick={handleOpenMembers}
        handleClose={handleMemberDialogClose}
        onTogglePerson={handleTogglePerson}
        userDepartments={userDepartments}
        userDesignations={userDesignations}
        setNodeToInsertId={setNodeToInsertId}
        addEmployee={addEmployee}
        destinationParentNodeId={destinationParentNodeId}
        isVacant={isVacant}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function TreeSubList({
  data,
  depth,
  nodeItem,
  onAddEmployee,
  setNodeDepth,
  nodeDepth,
  setReporter,
  reporter,
  setHierarchyParentId,
  newEmployee,
  matchingChildren,
  userDepartments,
  userDesignations,
  addBeforeSave,
  mutate,
}) {
  return (
    <>
      {data.map((list, index) => (
        <TreeList
          key={index}
          data={list}
          depth={depth + 1}
          nodeItem={nodeItem}
          onAddEmployee={onAddEmployee}
          setNodeDepth={setNodeDepth}
          nodeDepth={nodeDepth}
          setReporter={setReporter}
          reporter={reporter}
          setHierarchyParentId={setHierarchyParentId}
          addBeforeSave={addBeforeSave}
          newEmployee={newEmployee}
          matchingChildren={matchingChildren}
          userDepartments={userDepartments}
          userDesignations={userDesignations}
          mutate={mutate}
        />
      ))}
    </>
  );
}
