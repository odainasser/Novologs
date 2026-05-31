'use client';

import { useState } from 'react';
import { CustomTabs } from 'src/components/custom-tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import { KanbanStatusView } from './kanban-status-view';
import { KanbanCategoriesView } from './kanban-categories-view';
import { KanbanPrioritiesView } from './kanban-priorities-view';
import { useTranslation } from 'react-i18next';
import { TaskExemptedView } from 'src/sections/user/view/task-exempted-view';

export function KanbanSettingsView({ mutateAvailableUsers }) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const [currentTab, setCurrentTab] = useState('status');
  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderTabs = (
    <CustomTabs
      value={currentTab}
      onChange={handleChangeTab}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
    >
      {[
        { value: 'status', label: t('tasks.task_labels') },
        { value: 'categories', label: t('tasks.task_categories') },
        { value: 'priorities', label: t('tasks.filters.task_pirority') },
        { value: 'exempted', label: t('tasks.exempted') },
        // { value: 'ai', label: t('tasks.create_ai') },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );
  return (
    <Card sx={{ flexGrow: 1, overflow: 'auto' }}>
      {renderTabs}
      {currentTab === 'status' && <KanbanStatusView />}
      {currentTab === 'categories' && <KanbanCategoriesView />}
      {currentTab === 'priorities' && <KanbanPrioritiesView />}
      {currentTab === 'exempted' && (
        <TaskExemptedView isTaskExempt={true} mutateAvailableUsers={mutateAvailableUsers} />
      )}
      {currentTab === 'ai' && <TaskExemptedView isAI={true} />}
    </Card>
  );
}
