'use client';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { ProjectModulesView } from './project-modules-view';
import { ProjectMilestoneView } from './project-milestones-view';
import { ProjectWorkflowView } from './project-workflow-view';

import { useTranslation } from 'react-i18next';

export function ProjectDetailSettingsView({ projectId, projectRootFolderId }) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const [currentTab, setCurrentTab] = useState('workflow');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabOptions = [
    {
      // value: 'goal', label: 'Goal',
      // value: 'workflow',
      // label: 'Work flow',
    },
  ];

  const renderTabs = (
    <CustomTabs
      value={currentTab}
      onChange={handleChangeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {tabOptions.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
      {renderTabs}
      {/* {currentTab === 'goal' && <ProjectModulesView projectId={projectId} />} */}
      {/* {currentTab === 'workflow' && (
        <ProjectWorkflowView projectId={projectId} projectRootFolderId={projectRootFolderId} />
      )} */}
    </Card>
  );
}
