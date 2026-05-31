'use client';
import Button from '@mui/material/Button';

import { useState, useEffect, useRef } from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { OrganizationalChart } from '../organization-chart';

import { UserGroupNode } from './user-group-node';
import { Iconify } from 'src/components/iconify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { GROUP_DATA, SIMPLE_DATA } from './organizational-chart-data';

import Chip from '@mui/material/Chip';
import { AddHierarchyMembers } from '../add-heirarchy-members';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export function OrganizationalChartView({
  newEmployee,
  avatarUrl,
  userDepartments,
  userDesignations,
  addBeforeSave,
  setSelectedButton,
  setHierarchyParentId,
  setNodeDepth,
  nodeDepth,
  setReporter,
  reporter,
  hierarchyList,
  mutate,
}) {
  const { t } = useTranslation('dashboard/teams');
  const storedLang = localStorage.getItem('selectedLang');
  const chartRef = useRef(null);

  const handleExportPDF = async () => {
    if (!chartRef.current) return;

    // Capture the full chart, even if it's outside scroll
    const canvas = await html2canvas(chartRef.current, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: chartRef.current.scrollWidth, // full width
      windowHeight: chartRef.current.scrollHeight, // full height
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Scale to fit
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

    const x = (pageWidth - imgWidth * ratio) / 2;
    const y = 20;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth * ratio, imgHeight * ratio);
    pdf.save('organizational_chart.pdf');
  };

  const [groupData, setGroupData] = useState();
  const [matchingChildren, setMatchingChildren] = useState([]);
  function buildOrgTree(data) {
    console.log('this is the data', data);
    const rootItem = data.find((item) => item.parentStructureId === null && item.employee);

    const root = {
      name: rootItem?.employee?.fullName || 'Admin',
      role:
        userDesignations?.find((des) => des.id === rootItem?.employee?.designationId)?.name
          ?.value || 'Admin',
      email: rootItem?.employee?.email || '',
      emailConfirmed: rootItem?.employee?.emailConfirmed || false,
      group: 'root',
      avatarUrl: rootItem?.employee?.profileImageFileUrl,
      children: [],
      collapsed: false,
    };

    const departmentMap = {}; // Maps department name to employee nodes
    const employeeMap = {}; // Maps structure item id to node
    const pendingChildren = {}; // Temporarily holds children until parent is processed

    const generalDept = userDepartments?.find((dep) => dep.name?.value === 'General');
    const generalDeptId = generalDept?.id;

    const adminDept = userDepartments?.find((dep) => dep.name?.value === 'Admin');
    const adminDeptId = adminDept?.id;

    const matchingChildren = [];

    const getDepartmentName = (departmentId) => {
      return (
        userDepartments?.find((dep) => dep.id === departmentId)?.name?.value || 'Unknown Group'
      );
    };

    data
      .filter((item) => item.parentStructureId !== null)
      .forEach((item) => {
        if (item.departmentId === generalDeptId) {
          const children = data.filter(
            (child) => child.parentStructureId === item.id && child.employeeId
          );
          matchingChildren.push(...children);
        }

        const emp = item.employee;
        // if (!emp) return;

        const parentStructure = data.find((d) => d.id === item.parentStructureId);
        const parentItem = data.find((d) => d.id === item.parentStructureId);
        console.log('this is the parentItem', parentItem);

        const departmentName = parentItem
          ? getDepartmentName(parentItem.departmentId)
          : t('hierarachy.unknown_group');

        if (
          parentStructure?.departmentId === adminDeptId ||
          parentStructure?.departmentId === generalDeptId
        )
          return;

        const getRoleName = () => {
          const designation = userDesignations?.find((des) => des.id === emp?.designationId);

          if (!designation) return storedLang === 'ar' ? 'هذه الوظيفة' : 'This position';

          // Arabic
          if (storedLang === 'ar') {
            return (
              designation.name?.localizedStrings?.find((ls) => ls.language.toLowerCase() === 'ar')
                ?.value ||
              designation.name?.value ||
              'هذه الوظيفة'
            );
          }

          // English
          return designation.name?.value || 'This position';
        };
        const getEmailValue = () => {
          return emp?.email || (storedLang === 'ar' ? 'شاغر' : 'is vacant');
        };

        const employeeNode = {
          id: item.id,
          name: emp?.fullName,
          role: getRoleName(),
          email: getEmailValue(),
          emailConfirmed: emp?.emailConfirmed || false,
          avatarUrl: emp?.profileImageFileUrl,
          group: departmentName,
          children: [],
          parentItemId: item?.parentStructureId,
          parentName: parentStructure?.employee?.fullName,
          rootName: rootItem?.employee?.fullName || 'Admin',
          collapsed: false,
        };

        employeeMap[item.id] = employeeNode;

        if (item.parentStructureId) {
          if (!pendingChildren[item.parentStructureId]) {
            pendingChildren[item.parentStructureId] = [];
          }
          pendingChildren[item.parentStructureId].push(employeeNode);
        }

        if (!departmentMap[departmentName]) {
          departmentMap[departmentName] = {
            name: departmentName,
            group: departmentName,
            children: [],
            id: parentItem?.id,
            rootName: rootItem?.employee?.fullName || 'Admin',
          };
        }

        departmentMap[departmentName]?.children.push(employeeNode);
      });

    userDepartments?.forEach((dep) => {
      const departmentName = dep?.name?.value;
      const matchingDept = (data || []).find((item) => item.departmentId === dep.id);
      const rootItem = data.find((item) => item.parentStructureId === null && item.employee);

      if (
        departmentName &&
        matchingDept &&
        departmentName !== 'Admin' &&
        departmentName !== 'General' &&
        !departmentMap[departmentName]
      ) {
        departmentMap[departmentName] = {
          name: departmentName,
          group: departmentName,
          children: [],
          id: matchingDept?.id,
          rootName: rootItem?.employee?.fullName || 'Admin',
        };
      }
    });

    // Attach pending children
    Object.entries(pendingChildren).forEach(([parentId, children]) => {
      const parent = employeeMap[parentId];
      if (parent) {
        parent.children = parent.children.concat(children);
      }
    });

    // ✅ Now attach all department nodes to root
    root.children = Object.values(departmentMap)
      .filter((dept) => dept.name !== 'Unknown Group')
      .map((dept) => ({ ...dept, collapsed: false }));

    const validMatchingChildren = matchingChildren.filter(
      (child) => child?.employee && child.employee.isActive
    );

    setMatchingChildren(validMatchingChildren);
    console.log('this is the matching children', validMatchingChildren);
    return root;
  }

  useEffect(() => {
    if (hierarchyList?.hierarchyObject?.items?.length) {
      let dataLoadedFromStorage = false;
      if (addBeforeSave) {
        const storedDataString = localStorage.getItem('tempOrgChartData');
        if (storedDataString) {
          try {
            const storedData = JSON.parse(storedDataString);
            // Basic validation: check if it looks like a root node
            if (
              storedData &&
              typeof storedData.name === 'string' &&
              Array.isArray(storedData.children)
            ) {
              setGroupData(storedData);
              dataLoadedFromStorage = true;
            } else {
              console.error('Invalid tempOrgChartData structure from localStorage', storedData);
              localStorage.removeItem('tempOrgChartData'); // Clear corrupted data
            }
          } catch (error) {
            console.error('Failed to parse tempOrgChartData from localStorage', error);
            localStorage.removeItem('tempOrgChartData'); // Clear corrupted data
          }
        }
      }

      if (!dataLoadedFromStorage) {
        const transformed = buildOrgTree(hierarchyList.hierarchyObject.items);
        setGroupData(transformed);
      }
    } else if (!addBeforeSave) {
      // If not in addBeforeSave mode and no hierarchy, ensure clean state
      setGroupData(buildOrgTree([])); // Or your default empty state for the chart
    }
  }, [hierarchyList, addBeforeSave, userDepartments, userDesignations]); // Added addBeforeSave and other deps

  console.log('this is the group data', groupData);

  const handleAddEmployee = (targetNode) => {
    const updatedData = structuredClone(groupData); // deep clone

    // First, remove the employee from wherever they are in the tree
    const removeEmployeeRecursively = (node) => {
      if (node.children) {
        node.children = node.children.filter((child) => child.id !== newEmployee.code);
        node.children.forEach(removeEmployeeRecursively);
      }
    };

    // Then, add employee under the selected node
    const addEmployeeRecursively = (currentNode) => {
      // Match the target node using its unique ID for robustness
      if (currentNode.id === targetNode.id) {
        currentNode.children = currentNode.children || [];
        currentNode.children.push({
          id: newEmployee.code,
          name: newEmployee.fullName,
          role:
            userDesignations?.find((des) => des.id === newEmployee.designationId)?.name?.value ||
            'Employee',
          email: newEmployee.email,
          emailConfirmed: newEmployee.emailConfirmed || false,
          avatarUrl: avatarUrl,
          group: currentNode.group, // New employee belongs to the parent's group
          children: [],
        });
        return true;
      }
      if (currentNode.children) {
        for (const child of currentNode.children) {
          if (addEmployeeRecursively(child)) return true; // Propagate success
        }
      }
      return false;
    };

    removeEmployeeRecursively(updatedData);
    addEmployeeRecursively(updatedData);
    setGroupData(updatedData); // trigger re-render
    if (addBeforeSave) {
      localStorage.setItem('tempOrgChartData', JSON.stringify(updatedData));
    }
  };

  const [mode, setMode] = useState('');
  const [openMembers, setOpenMembers] = useState(false);
  const handleOpenMembers = () => {
    setOpenMembers(true);
  };
  const handleMemberDialogClose = () => {
    setTimeout(() => {
      setOpenMembers(false);
    }, 100);
  };

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1; // scroll-fast factor
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <>
      <>
        <Stack sx={{ height: '100%', display: 'flex' }}>
          <>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedButton('userList');
                }}
                startIcon={
                  <Iconify
                    icon="eva:arrow-back-fill"
                    sx={{
                      transform: storedLang === 'ar' ? 'rotate(180deg)' : 'none',
                      ...(storedLang === 'ar' ? { ml: 1 } : { ml: 0 }),
                    }}
                  />
                }
              >
                {t('hierarchy.back_to_employee')}
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenMembers(true);
                    setMode('view');
                  }}
                >
                  {t('hierarchy.general_member_list')}
                  <Chip
                    label={matchingChildren.length}
                    size="small"
                    sx={{ bgcolor: '#006A67', ...(storedLang === 'ar' ? { mr: 1 } : { ml: 1 }) }}
                  />
                </Button>

                <Button variant="contained" onClick={handleExportPDF}>
                  {t('teams.export')}
                </Button>
              </Stack>
            </Stack>
            <Stack
              sx={{
                flex: 1,
                overflow: 'auto', // both x and y
                py: 4,
                direction: 'ltr',
                cursor: 'grab', // indicate drag
                '&::-webkit-scrollbar': {
                  height: '6px', // horizontal scrollbar
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: '4px',
                  background: '#006A67',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                scrollbarWidth: 'thin', // Firefox
                scrollbarColor: '#006A67 transparent', // Firefox
              }}
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <div ref={chartRef}>
                <OrganizationalChart
                  newEmployee={newEmployee}
                  avatarUrl={avatarUrl}
                  lineHeight="40px"
                  data={groupData}
                  userDepartments={userDepartments}
                  userDesignations={userDesignations}
                  addBeforeSave={addBeforeSave}
                  setHierarchyParentId={setHierarchyParentId}
                  mutate={mutate}
                  setNodeDepth={setNodeDepth}
                  nodeDepth={nodeDepth}
                  setReporter={setReporter}
                  reporter={reporter}
                  nodeItem={(props) => <UserGroupNode {...props} />}
                  onAddEmployee={handleAddEmployee}
                  matchingChildren={matchingChildren}
                />
              </div>
            </Stack>

            {nodeDepth && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  bgcolor: 'background.paper',
                  py: 1,
                  zIndex: 10,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedButton('userList');
                  }}
                  sx={{ bgcolor: '#006A67' }}
                >
                  Done
                </Button>
              </Stack>
            )}
          </>
        </Stack>
        <AddHierarchyMembers
          open={openMembers}
          shared={matchingChildren}
          onClick={handleOpenMembers}
          handleClose={handleMemberDialogClose}
          userDepartments={userDepartments}
          userDesignations={userDesignations}
          mode={mode}
        />
      </>
    </>
  );
}
