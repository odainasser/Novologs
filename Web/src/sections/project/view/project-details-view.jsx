'use client';
import { useState } from 'react';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userAbout, _userFeeds, _userFriends, _userGallery, _userFollowers } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProjectHome } from '../project-home';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { KanbanListView } from 'src/sections/kanban/view/kanban-list-view';

import { ProjectDocument } from '../project-document';
import { Label } from 'src/components/label';
import { ProjectMembers } from '../project-members';
import { mock_projectData } from '../project-mock-data';
import { useTranslation } from 'react-i18next';
import { FileManagerView } from 'src/sections/file-manager/view/file-manager-view';
import { ProjectDetailSettingsView } from 'src/sections/project/view/project-detail-setting-view';
import { getProjectStatistics, getProjects } from 'src/actions/project/projectActions';
import DocumentView from 'src/sections/documents/view/documents-view';
import { ProjectWorkflowView } from './project-workflow-view';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export function ProjectDetailsView({ projectId, isTicket }) {
  const getProjectParams = {
    pagination: {
      pageNumber: 1,
      pageSize: 1,
    },
    search: {
      logicOperator: 0,
      fieldName: 'Id',
      operator: 0,
      fieldValue: projectId,
    },
  };
  const { projectList, mutate: mutateProjects } = getProjects(getProjectParams);

  const {
    projectStatistics,
    projectStatisticsLoading,
    projectStatisticsError,
    taskStatisticsEmpty,
    usersStatisticsEmpty,
    mutate,
  } = getProjectStatistics(projectId);
  const projectDetails = projectList?.projects.find((p) => p.id === projectId);

  const { t, i18n } = useTranslation('dashboard/projects');
  const storedLang = localStorage.getItem('selectedLang');

  const tabs = useTabs(isTicket ? 'tasks' : 'profile');

  const nonMemberCount =
    projectStatistics?.usersStatistics.filter((userStat) =>
      projectDetails?.projectMembers.every((task) => task.memberId !== userStat.user.id)
    )?.length || 0;

  const fullMemberList = projectDetails?.projectMembers?.map((memberTask) => {
    const matchedUser = projectStatistics?.usersStatistics?.find(
      (stat) => stat.user.id === memberTask.memberId
    );

    return {
      ...matchedUser,
      user: matchedUser?.user || memberTask.member,
      taskStatistics: matchedUser?.taskStatistics || [],
      totalTaskCount: matchedUser?.totalTaskCount || 0,
      isOwner: memberTask.isOwner,
      memberId: memberTask.memberId,
    };
  });

  const TABS = [
    ...(!isTicket
      ? [
          {
            value: 'profile',
            label: t('projects.project_details.tabs.profile'),
            icon: (
              <Iconify
                icon="solar:user-id-bold"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'overview',
            label: t('projects.project_details.tabs.overview'),
            icon: (
              <Iconify
                icon="mdi:file-document"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),

    {
      value: 'tasks',
      label: isTicket
        ? t('projects.project_details.tabs.tickets')
        : t('projects.project_details.tabs.tasks'),
      icon: (
        <Iconify
          icon="solar:checklist-bold"
          width={16}
          sx={{
            ...(storedLang === 'ar' && { ml: 1 }),
          }}
        />
      ),
    },
    ...(!isTicket
      ? [
          {
            value: 'projectCategory',
            label: t('projects.project_details.tabs.category'),
            icon: (
              <Iconify
                icon="solar:checklist-bold"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'milestone',
            label: t('projects.project_details.tabs.milestone'),
            icon: (
              <Iconify
                icon="solar:checklist-bold"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'files',
            label: t('projects.project_details.tabs.files'),
            icon: (
              <Iconify
                icon="mdi:folder"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'documents',
            label: t('projects.project_details.tabs.documents'),
            icon: (
              <Iconify
                icon="mdi:file-document"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'members',
            label: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Iconify
                  icon="mdi:account-group"
                  width={16}
                  style={{ marginRight: '4px' }}
                  sx={{
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
                {t('projects.project_details.tabs.members')}
                <Label
                  variant="filled"
                  style={{ marginLeft: '4px' }}
                  size="small"
                  sx={{
                    ...(storedLang === 'ar' && { mr: 1 }),
                  }}
                >
                  {projectDetails?.projectMembers?.length || 0}
                </Label>
              </div>
            ),
          },
        ]
      : []),
    ...(!isTicket
      ? [
          {
            value: 'nonMembers',
            label: (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Iconify
                  icon="mdi:account-off"
                  width={16}
                  style={{ marginRight: '4px' }}
                  sx={{
                    ...(storedLang === 'ar' && { ml: 1 }),
                  }}
                />
                {t('projects.project_details.tabs.nonMembers')}

                <Label
                  variant="filled"
                  style={{ marginLeft: '4px' }}
                  size="small"
                  sx={{
                    ...(storedLang === 'ar' && { mr: 1 }),
                  }}
                >
                  {nonMemberCount}
                </Label>
              </div>
            ),
          },
        ]
      : []),

    // {
    //   value: 'report',
    //   label: t('projects.project_details.tabs.report'),

    //   icon: <Iconify icon="mdi:clipboard-list" width={16} />,
    // },
    ...(!isTicket
      ? [
          {
            value: 'closure',
            label: t('projects.project_details.tabs.closure'),

            icon: (
              <Iconify
                icon="mdi:folder-lock"
                width={16}
                sx={{
                  ...(storedLang === 'ar' && { ml: 1 }),
                }}
              />
            ),
          },
        ]
      : []),

    // {
    //   value: 'workflow',
    //   label: 'Workflow',
    //   icon: (
    //     <Iconify
    //       icon="mdi:cog"
    //       width={16}
    //       sx={{
    //         ...(storedLang === 'ar' && { ml: 1 }),
    //       }}
    //     />
    //   ),
    // },
    // {
    //   value: 'settings',
    //   label: t('projects.project_settings.tabs.settings'),
    //   icon: (
    //     <Iconify
    //       icon="mdi:cog"
    //       width={16}
    //       sx={{
    //         ...(storedLang === 'ar' && { ml: 1 }),
    //       }}
    //     />
    //   ),
    // },
  ];

  const isProject = true;
  const isMilestone = true;
  const isMission = Boolean(projectDetails?.type === 0);
  return (
    <DashboardContent>
      {!isTicket && (
        <CustomBreadcrumbs
          heading={
            isMission ? t('projects.missions.mission_details') : t('projects.project_detail')
          }
          links={[
            { name: t('projects.dashboard'), href: paths.dashboard.root },
            {
              name: isMission ? t('projects.missions.mission') : t('projects.projects'),
              href: `${paths.dashboard.project.list}?isMission=${isMission ? 'true' : 'false'}`,
            },
            { name: projectDetails?.name },
          ]}
          sx={{ mb: 1 }}
        />
      )}
      {isTicket && (
        <CustomBreadcrumbs
          heading={t('projects.project_details.tabs.ticket_details')}
          links={[
            { name: t('projects.dashboard'), href: paths.dashboard.root },
            {
              name: t('projects.project_details.tabs.ticketing'),
              href: paths.dashboard.ticketing.list,
            },
            { name: projectDetails?.name },
          ]}
          sx={{ mb: 1 }}
        />
      )}

      <Tabs value={tabs.value} onChange={tabs.onChange}>
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </Tabs>
      {tabs.value === 'profile' && (
        <ProjectHome
          info={_userAbout}
          posts={_userFeeds}
          projectDetails={projectDetails}
          taskStatistics={projectStatistics?.taskStatistics}
          usersStatistics={projectStatistics?.usersStatistics}
        />
      )}
      {tabs.value === 'overview' && (
        <ProjectDocument
          projectDetails={projectDetails}
          mutateProjects={mutateProjects}
          projectMembers={projectDetails?.projectMembers}
        />
      )}
      {tabs.value === 'tasks' && (
        <KanbanListView
          isProject={isProject}
          projectId={projectId}
          isTaskCategory={false}
          isTicket={isTicket}
          projectMembers={projectDetails?.projectMembers}
        />
      )}
      {tabs.value === 'projectCategory' && (
        <KanbanListView
          isProject={isProject}
          projectId={projectId}
          isTaskCategory={true}
          projectMembers={projectDetails?.projectMembers}
        />
      )}

      {tabs.value === 'milestone' && (
        <KanbanListView
          isProject={isProject}
          projectId={projectId}
          isMilestone={isMilestone}
          projectMembers={projectDetails?.projectMembers}
        />
      )}
      {tabs.value === 'files' && (
        <FileManagerView
          isProject={isProject}
          projectId={projectId}
          projectRootFolderId={projectDetails?.rootFolderId}
        />
      )}
      {tabs.value === 'documents' && <DocumentView isProject={isProject} projectId={projectId} />}
      {tabs.value === 'members' && (
        <ProjectMembers
          memberTasks={projectDetails?.projectMembers}
          filteredMembers={fullMemberList}
        />
      )}
      {tabs.value === 'nonMembers' && (
        <ProjectMembers
          memberTasks={projectDetails?.projectMembers}
          filteredMembers={projectStatistics?.usersStatistics.filter((userStat) =>
            projectDetails?.projectMembers.every((task) => task.memberId !== userStat.user.id)
          )}
        />
      )}
      {tabs.value === 'workflow' && (
        <ProjectWorkflowView
          projectId={projectId}
          projectRootFolderId={projectDetails?.rootFolderId}
        />
      )}
      {tabs.value === 'settings' && (
        <ProjectDetailSettingsView
          projectId={projectId}
          projectRootFolderId={projectDetails?.rootFolderId}
        />
      )}
      {tabs.value === 'report'}
      {tabs.value === 'closure'}
    </DashboardContent>
  );
}
