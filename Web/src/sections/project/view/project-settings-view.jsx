'use client';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { GoalView } from './goals-view';
import { InitiativeView } from './initiative-view';
import { TaskTypeView } from './task-type-view';

import { useTranslation } from 'react-i18next';

import { ProjectCreatePermissionView } from './project-create-permission-view';
import { TaskExemptedView } from 'src/sections/user/view/task-exempted-view';

export function ProjectSettingsView({ isMission }) {
  const { t, i18n } = useTranslation('dashboard/projects');
  const [currentTab, setCurrentTab] = useState(isMission ? 'tasktypes' : 'goal');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const tabOptions = isMission
    ? [{ value: 'tasktypes', label: t('projects.project_settings.tabs.tasktypes') }]
    : [
        { value: 'goal', label: t('projects.project_settings.tabs.goal') },
        { value: 'initiative', label: t('projects.project_settings.tabs.initiative') },
        { value: 'viewAll', label: t('projects.project_settings.tabs.view_all') },
        { value: 'create', label: t('projects.project_settings.tabs.create_project') },

        // { value: 'tasktypes', label: t('projects.project_settings.tabs.tasktypes') },
        // { value: 'viewProjects', label: t('projects.project_settings.tabs.viewProjects') },
        // { value: 'costViewProjects', label: t('projects.project_settings.tabs.project-cost-view') },
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
      {currentTab === 'createProjects' && <ProjectCreatePermissionView />}
      {currentTab === 'viewProjects' && <ProjectCreatePermissionView />}
      {currentTab === 'costViewProjects' && <ProjectCreatePermissionView />}

      {currentTab === 'goal' && <GoalView />}
      {currentTab === 'initiative' && <InitiativeView />}
      {currentTab === 'tasktypes' && <TaskTypeView />}
      {currentTab === 'viewAll' && <TaskExemptedView isProjectViewAll={true} />}
      {currentTab === 'create' && <TaskExemptedView isProjectCreate={true} />}
    </Card>
  );
}
