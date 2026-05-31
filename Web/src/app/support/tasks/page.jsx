'use client';

import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import {
  CommonSidebarLayout,
  SupportImage,
  SubsectionTitle,
  SubTitle,
  BodyText,
  FeatureText,
  InfoAlert,
  GridBox,
  SUPPORT_COLORS
} from '../components/common-sidebar-layout';

// Using standardized components from CommonSidebarLayout

// ----------------------------------------------------------------------

// Navigation items function
const getTasksNavigationItems = (t) => [
  {
    id: 'overview',
    title: t('tasks.navigation.overview.title'),
    icon: 'solar:checklist-minimalistic-bold',
    description: t('tasks.navigation.overview.description'),
    keywords: ['tasks', 'overview', 'introduction', 'module', 'dashboard', 'interface', 'list view', 'grid view', 'gantt view', 'kanban', 'board', 'timeline', 'task management', 'workflow', 'project management', 'getting started']
  },


  {
    id: 'task-management',
    title: t('tasks.navigation.taskManagement.title'),
    icon: 'solar:document-add-bold',
    description: t('tasks.navigation.taskManagement.description'),
    keywords: ['create', 'add', 'edit', 'update', 'delete', 'remove', 'manage', 'task', 'tasks', 'form', 'details', 'description', 'assignment', 'members', 'dates', 'priority', 'status', 'category']
  },
  {
    id: 'status-management',
    title: t('tasks.navigation.statusManagement.title'),
    icon: 'solar:flag-bold',
    description: t('tasks.navigation.statusManagement.description'),
    keywords: ['status', 'workflow', 'progress', 'stages', 'columns', 'drag drop', 'change status', 'custom status', 'not started', 'in progress', 'completed', 'on hold', 'cancelled']
  },
  {
    id: 'task-details',
    title: t('tasks.navigation.taskDetails.title'),
    icon: 'solar:document-text-bold',
    description: t('tasks.navigation.taskDetails.description'),
    keywords: ['task details', 'task information', 'task drawer', 'task sidebar', 'task properties', 'task fields', 'task data', 'task view', 'task overview', 'task content']
  },
  {
    id: 'assignments',
    title: t('tasks.navigation.assignments.title'),
    icon: 'solar:users-group-two-rounded-bold',
    description: t('tasks.navigation.assignments.description'),
    keywords: ['assign', 'assignment', 'members', 'team', 'users', 'responsibility', 'ownership', 'collaboration', 'multi-user', 'delegation', 'workload', 'distribution', 'forward', 'forwarding', 'delegate', 'transfer', 'reassign', 'redirect', 'handover', 'pass', 'route', 'workflow', 'approval', 'review']
  },
  {
    id: 'backlog',
    title: t('tasks.navigation.backlog.title'),
    icon: 'solar:clipboard-list-bold',
    description: t('tasks.navigation.backlog.description'),
    keywords: ['backlog', 'unassigned', 'pending', 'queue', 'waiting', 'task management', 'organization', 'workflow', 'task queue', 'pending tasks']
  },
  {
    id: 'subtasks',
    title: t('tasks.navigation.subtasks.title'),
    icon: 'solar:list-arrow-down-bold',
    description: t('tasks.navigation.subtasks.description'),
    keywords: ['subtasks', 'sub-tasks', 'hierarchy', 'parent', 'child', 'breakdown', 'structure', 'nested', 'dependencies', 'organization', 'detailed', 'components']
  },
  {
    id: 'timeline',
    title: t('tasks.navigation.timeline.title'),
    icon: 'solar:history-bold',
    description: t('tasks.navigation.timeline.description'),
    keywords: ['timeline', 'history', 'tracking', 'progress', 'chronological', 'activities', 'events', 'audit', 'log', 'changes', 'updates', 'monitoring', 'automatic', 'record']
  },
  {
    id: 'attachments',
    title: t('tasks.navigation.attachments.title'),
    icon: 'solar:paperclip-bold',
    description: t('tasks.navigation.attachments.description'),
    keywords: ['attachments', 'files', 'documents', 'upload', 'download', 'media', 'resources', 'references', 'supporting', 'materials', 'documentation']
  },
  {
    id: 'comments-todo',
    title: t('tasks.navigation.commentsTodo.title'),
    icon: 'solar:chat-round-dots-bold',
      description: t('tasks.navigation.commentsTodo.description'),
      keywords: ['comments', 'todo', 'notes', 'communication', 'discussion', 'feedback', 'collaboration', 'checklist', 'activities', 'updates', 'messages']
    },
    {
      id: 'task-settings',
      title: t('tasks.navigation.taskSettings.title'),
      icon: 'solar:settings-bold',
      description: t('tasks.navigation.taskSettings.description'),
      keywords: ['settings', 'configuration', 'preferences', 'sources', 'priorities', 'status', 'workflow', 'customization', 'admin', 'management', 'system', 'setup']
    }
];

// Main component that receives props from CommonSidebarLayout
function TasksContent({ platform = 'web', selectedSection = 'overview' }) {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';



  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent();
      case 'task-management':
        return renderTaskManagementContent();
      case 'status-management':
        return renderStatusManagementContent();
      case 'task-details':
        return renderTaskDetailsContent();
      case 'assignments':
        return renderAssignmentsContent();
      case 'backlog':
        return renderBacklogContent();
      case 'subtasks':
        return renderSubtasksContent();
      case 'timeline':
        return renderTimelineContent();
      case 'attachments':
        return renderAttachmentsContent();
      case 'comments-todo':
        return renderCommentsTodoContent();
      case 'task-settings':
        return renderTaskSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 4
        }}
      >
        {t('tasks.content.overview.introduction')}
      </Typography>

      {platform === 'web' && (
        // Web Tasks Overview
        <Box>
          {/* Web Tasks Screenshot */}
          <SupportImage
            src={isArabic ? "/assets/support/tasksWebdashboard-ar.webp" : "/assets/support/tasksWebdashboard.webp"}
            alt={t('tasks.content.overview.altTexts.webTasksDashboard')}
            isArabic={isArabic}
          />

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.overview.web.description')}
          </Typography>

          {/* Cross-Module Task Integration */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.overview.web.crossModuleIntegration.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.overview.web.crossModuleIntegration.description')}
            </Typography>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.overview.web.crossModuleIntegration.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'primary-main',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* What You Can Do in Tasks Management */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('tasks.content.overview.web.whatYouCanDo.title')}
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
              gap: 3,
              mb: 4
            }}>
              {/* Task Operations */}
              <Box sx={{
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(0, 106, 103, 0.1)'
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: SUPPORT_COLORS.teal,
                    mb: 2
                  }}
                >
                  {t('tasks.content.overview.web.whatYouCanDo.categories.taskOperations.title')}
                </Typography>
                {t('tasks.content.overview.web.whatYouCanDo.categories.taskOperations.items', { returnObjects: true }).map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 0.5
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              {/* View Options */}
              <Box sx={{
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(0, 106, 103, 0.1)'
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: SUPPORT_COLORS.teal,
                    mb: 2
                  }}
                >
                  {t('tasks.content.overview.web.whatYouCanDo.categories.viewOptions.title')}
                </Typography>
                {t('tasks.content.overview.web.whatYouCanDo.categories.viewOptions.items', { returnObjects: true }).map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 0.5
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              {/* Organizational Tools */}
              <Box sx={{
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(0, 106, 103, 0.1)'
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: SUPPORT_COLORS.teal,
                    mb: 2
                  }}
                >
                  {t('tasks.content.overview.web.whatYouCanDo.categories.organizationalTools.title')}
                </Typography>
                {t('tasks.content.overview.web.whatYouCanDo.categories.organizationalTools.items', { returnObjects: true }).map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 0.5
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              {/* Settings & Configuration */}
              <Box sx={{
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(0, 106, 103, 0.1)'
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: SUPPORT_COLORS.teal,
                    mb: 2
                  }}
                >
                  {t('tasks.content.overview.web.whatYouCanDo.categories.settingsConfiguration.title')}
                </Typography>
                {t('tasks.content.overview.web.whatYouCanDo.categories.settingsConfiguration.items', { returnObjects: true }).map((item, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 0.5
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Tab Navigation System */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.overview.web.tabNavigation.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2
              }}
            >
              {t('tasks.content.overview.web.tabNavigation.description')}
            </Typography>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.overview.web.tabNavigation.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Task Member Permissions and Status */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.overview.web.taskMemberPermissions.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2
              }}
            >
              {t('tasks.content.overview.web.taskMemberPermissions.description')}
            </Typography>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.overview.web.taskMemberPermissions.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

        
        </Box>
      )}

      {platform === 'mobile' && (
        // Mobile Tasks Overview
        <Box>
          {/* Mobile Tasks Screenshot */}
          <SupportImage
            src={isArabic ? "/assets/support/TaskOverviewMob-ar.webp" : "/assets/support/TaskOverviewMob.webp"}
          
            alt={t('tasks.content.overview.altTexts.mobileTasksDashboard')}
            isArabic={isArabic}
            maxWidth="400px"
          />

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.overview.mobile.description')}
          </Typography>

          {/* Mobile Interface Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.overview.mobile.mobileInterface.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.overview.mobile.mobileInterface.description')}
            </Typography>

            <Box sx={{ ml: 2, mb: 3 }}>
              {Array.isArray(t('tasks.content.overview.mobile.mobileInterface.features', { returnObjects: true }))
                ? t('tasks.content.overview.mobile.mobileInterface.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
                : null}
            </Box>
          </Box>

          {/* Task Filter System */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.overview.mobile.taskFilterSystem.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.overview.mobile.taskFilterSystem.description')}
            </Typography>

            {/* Task Filter Screenshot */}
            <SupportImage
              src={isArabic ? "/assets/support/TaskfilterMob-ar.webp" : "/assets/support/TaskfilterMob.webp"}
              alt={t('tasks.content.overview.altTexts.taskFilterMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 3 }}>
              {Array.isArray(t('tasks.content.overview.mobile.taskFilterSystem.features', { returnObjects: true }))
                ? t('tasks.content.overview.mobile.taskFilterSystem.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
                : null}
            </Box>
          </Box>

          {/* Roles and Permissions */}
          <GridBox sx={{ mb: 4 }}>
            <SubsectionTitle>
              {t('tasks.content.overview.mobile.rolesPermissions.title')}
            </SubsectionTitle>

            <BodyText>
              {t('tasks.content.overview.mobile.rolesPermissions.description')}
            </BodyText>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.overview.mobile.rolesPermissions.features', { returnObjects: true }).map((feature, index) => (
                <FeatureText
                  key={index}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </GridBox>

          {/* Mobile vs Web Differences */}
          <GridBox sx={{ mb: 4 }}>
            <SubsectionTitle>
              {t('tasks.content.overview.mobile.platformDifferences.title')}
            </SubsectionTitle>

            <BodyText>
              {t('tasks.content.overview.mobile.platformDifferences.description')}
            </BodyText>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.overview.mobile.platformDifferences.features', { returnObjects: true }).map((feature, index) => (
                <FeatureText
                  key={index}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </GridBox>
        </Box>
      )}

      {/* Interface Views Section - Web Only */}
      {platform === 'web' && (
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('tasks.content.overview.interfaceViews.title')}
          </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 4
          }}
        >
          {t('tasks.content.overview.interfaceViews.description')}
        </Typography>

        {/* List View */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.listView.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.listView.description')}
          </Typography>

          {/* List View Image */}
          <SupportImage
            src={isArabic ? "/assets/support/tasklistview-ar.webp" : "/assets/support/tasklistview.webp"}
            alt={t('tasks.content.overview.interfaceViews.listView.title')}
            isArabic={isArabic}
          />

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.overview.interfaceViews.listView.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>

        {/* Grid View */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.gridView.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.gridView.description')}
          </Typography>

          {/* Kanban View Image */}
          <SupportImage
            src={isArabic ? "/assets/support/KanbanViewWeb-ar.webp" : "/assets/support/KanbanViewWeb.webp"}
            alt={t('tasks.content.overview.interfaceViews.gridView.title')}
            isArabic={isArabic}
          />

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.overview.interfaceViews.gridView.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>

        {/* Gantt View */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.ganttView.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.ganttView.description')}
          </Typography>

          {/* Gantt Chart Image */}
          <SupportImage
            src={isArabic ? "/assets/support/ganttchart-ar.webp" : "/assets/support/ganttchart.webp"}
            alt={t('tasks.content.overview.interfaceViews.ganttView.title')}
            isArabic={isArabic}
          />

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.overview.interfaceViews.ganttView.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>

        {/* Task Details Drawer */}
        <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.gridView.taskDetailsDrawer.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.overview.interfaceViews.gridView.taskDetailsDrawer.description')}
          </Typography>

          {/* Task Details Drawer Image */}
          <SupportImage
            src={isArabic ? "/assets/support/taskdetails-ar.webp" : "/assets/support/taskdetails.webp"}
            alt={t('tasks.content.overview.interfaceViews.gridView.taskDetailsDrawer.title')}
            isArabic={isArabic}
          />

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.overview.interfaceViews.gridView.taskDetailsDrawer.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>

        {/* Task Settings & Configuration */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.overview.interfaceViews.taskSettings.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.overview.interfaceViews.taskSettings.description')}
          </Typography>

          {/* Task Settings Image */}
          <SupportImage
            src={isArabic ? "/assets/support/Tasksettings-ar.webp" : "/assets/support/Tasksettings.webp"}
            alt={t('tasks.content.overview.interfaceViews.taskSettings.title')}
            isArabic={isArabic}
          />

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.overview.interfaceViews.taskSettings.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>
        </Box>
      )}
    </Box>
  );


  const renderTaskManagementContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2
        }}
      >
        {t('tasks.content.taskManagement.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 4
        }}
      >
        {t('tasks.content.taskManagement.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box>
          {/* Mobile Task Creation */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.creatingTasks.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.creatingTasks.description')}
            </Typography>

            {/* Add Task Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/AddTaskMob-ar.webp" : "/assets/support/AddTaskMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.addTaskMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.mobile.creatingTasks.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Member Selection */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.memberSelection.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.memberSelection.description')}
            </Typography>

            {/* Select Members Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/selectMemberMob-ar.webp" : "/assets/support/selectMemberMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.selectMembersMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.mobile.memberSelection.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Mobile Task Creation in Projects */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.projectTaskCreation.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.projectTaskCreation.description')}
            </Typography>

            {/* Task Creation Access */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('tasks.content.taskManagement.mobile.projectTaskCreation.howToAccess.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2,
                  mb: 2
                }}
              >
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.howToAccess.step1')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.howToAccess.step2')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.howToAccess.step3')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.howToAccess.step4')}
              </Typography>
            </Box>

            {/* Task Creation Form Image */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <SupportImage
                src={isArabic ? '/assets/support/addprojecttaskMob-ar.webp' : '/assets/support/addprojecttaskMob.webp'}
                alt={t('tasks.content.taskManagement.mobile.projectTaskCreation.imageAlt')}
                isArabic={isArabic}
                maxWidth="300px"
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'gray',
                  display: 'block',
                  textAlign: 'center',
                  mt: 1
                }}
              >
                {t('tasks.content.taskManagement.mobile.projectTaskCreation.imageCaption')}
              </Typography>
            </Box>

            {/* Task Creation Features */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: SUPPORT_COLORS.teal,
                  pl: 2
                }}
              >
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature1')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature2')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature3')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature4')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature5')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature6')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature7')}<br />
                • {t('tasks.content.taskManagement.mobile.projectTaskCreation.features.feature8')}
              </Typography>
            </Box>

            {/* Permission Note */}
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#FF8F00',
                  mb: 1
                }}
              >
                {t('tasks.content.taskManagement.mobile.projectTaskCreation.permission.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: '#FF8F00'
                }}
              >
                {t('tasks.content.taskManagement.mobile.projectTaskCreation.permission.description')}
              </Typography>
            </Box>
          </Box>

          {/* Task Details and Editing */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.taskDetailsEditing.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.taskDetailsEditing.description')}
            </Typography>

            {/* Task Details Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/EditDeleteMob-ar.webp" : "/assets/support/EditDeleteMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.taskDetailsMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.mobile.taskDetailsEditing.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Task Editing */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.editingTasks.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.editingTasks.description')}
            </Typography>

            {/* Edit Task Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/EditTaskMob-ar.webp" : "/assets/support/EditTaskMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.editTaskMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.mobile.editingTasks.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Task Deletion */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.deletingTasks.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.mobile.deletingTasks.description')}
            </Typography>

            {/* Delete Task Confirmation Image */}
            <SupportImage
              src={isArabic ? "/assets/support/TaskDeleteMob-ar.webp" : "/assets/support/TaskDeleteMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.deleteTaskMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.mobile.deletingTasks.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Mobile vs Web Differences */}
          <Box sx={{
            p: 3,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(0, 106, 103, 0.2)',
            mb: 4
          }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#f57c00',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.interfaceDifferences.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.mobile.interfaceDifferences.description')}
            </Typography>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.taskManagement.mobile.interfaceDifferences.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          {/* Add Task Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.addTask.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.addTask.description')}
        </Typography>

        {/* Task Add Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/taskAddWeb-ar.webp" : "/assets/support/taskAddWeb.webp"}
          alt={t('tasks.content.taskManagement.addTask.title')}
          isArabic={isArabic}
        />

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.addTask.steps', { returnObjects: true }).map((step, index) => (
            <React.Fragment key={index}>
              {(() => {
                const stepText = step.toString();
                // Extract step number/title and description
                const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
                if (stepMatch) {
                  const [, stepTitle, description] = stepMatch;
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Montserrat, sans-serif',
                        lineHeight: 1.6,
                        mb: 0.5
                      }}
                    >
                      <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                      {description && <span style={{ color: 'black' }}> {description}</span>}
                    </Typography>
                  );
                }
                return (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 0.5
                    }}
                    dangerouslySetInnerHTML={{ __html: step }}
                  />
                );
              })()}
              {/* Add Members Assignment image after Members Assignment section */}
              {index === 33 && (
                <Box
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(0, 106, 103, 0.05)',
                    p: 2
                  }}
                >
                  <img
                    src={isArabic ? "/assets/support/TaskmembersAddWeb-ar.webp" : "/assets/support/TaskmembersAddWeb.webp"}
                    alt={t('tasks.content.altTexts.membersAssignmentDialog')}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
              {/* Add Actions image after Actions section */}
              {index === 89 && (
                <Box
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(0, 106, 103, 0.05)',
                    p: 2
                  }}
                >
                  <img
                    src={isArabic ? "/assets/support/actions-ar.webp" : "/assets/support/actions.webp"}
                    alt={t('tasks.content.altTexts.taskActionsMenu')}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '8px'
                    }}
                  />
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>

       

        {/* Form Fields */}
        <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.addTask.formFields.title')}
          </Typography>

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.taskManagement.addTask.formFields.fields', { returnObjects: true }).map((field, index) => (
              <React.Fragment key={index}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: field }}
                />
                {/* Add image after Source Field section */}
                {index === 16 && (
                  <SupportImage
                    src={isArabic ? "/assets/support/taskdetail1-ar.webp" : "/assets/support/taskdetail1.webp"}
                    alt={t('tasks.content.taskManagement.altTexts.sourceFieldTaskDetails')}
                    isArabic={isArabic}
                    maxWidth="700px"
                  />
                )}
                {/* Add description images after Description Field section */}
                {index === 25 && (
                  <Box sx={{ my: 3 }}>
                    {/* First Description Image */}
                    <SupportImage
                      src={isArabic ? "/assets/support/desc1-ar.webp" : "/assets/support/desc1.webp"}
                      alt={t('tasks.content.altTexts.descriptionField')}
                      isArabic={isArabic}
                      maxWidth="700px"
                    />

                    {/* Second Description Image */}
                    <SupportImage
                      src={isArabic ? "/assets/support/desc2-ar.webp" : "/assets/support/desc2.webp"}
                      alt={t('tasks.content.altTexts.voiceRecordingTranscripts')}
                      isArabic={isArabic}
                      maxWidth="700px"
                    />
                  </Box>
                )}
                   {index === 42 && (
                    <SupportImage
                      src={isArabic ? "/assets/support/TaskmembersAddWeb-ar.webp" : "/assets/support/TaskmembersAddWeb.webp"}
                      alt={t('tasks.content.altTexts.membersAssignmentDialog')}
                      isArabic={isArabic}
                      maxWidth="700px"
                    />
                )}
                 {index === 102 && (
                    <SupportImage
                      src={isArabic ? "/assets/support/actions-ar.webp" : "/assets/support/actions.webp"}
                      alt={t('tasks.content.altTexts.taskActionsMenu')}
                      isArabic={isArabic}
                      maxWidth="700px"
                    />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>

      
      
      </Box>

      {/* Edit Task Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.editTask.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.editTask.description')}
        </Typography>
        <SupportImage
          src={isArabic ? "/assets/support/edittaskWeb-ar.webp" : "/assets/support/edittaskWeb.webp"}
          alt={t('tasks.content.altTexts.editTaskInterface')}
          isArabic={isArabic}
          maxWidth="700px"
        />

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.editTask.steps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 0.5
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Editable Fields */}
        <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.editTask.editableFields.title')}
          </Typography>

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.taskManagement.editTask.editableFields.fields', { returnObjects: true }).map((field, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: field }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Delete Task Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.deleteTask.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.deleteTask.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.deleteTask.steps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 0.5
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Important Considerations */}
        <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#E65100',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.deleteTask.considerations.title')}
          </Typography>

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.taskManagement.deleteTask.considerations.points', { returnObjects: true }).map((point, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: point }}
              />
            ))}

            {/* Additional Note about Ticket Tasks */}
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5,
                mt: 2,
                fontWeight: 600,
                bgcolor: 'rgba(0, 106, 103, 0.1)',
                p: 1.5,
                borderRadius: 1,
                border: '1px solid rgba(0, 106, 103, 0.2)'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('tasks.content.taskManagement.deleteTask.ticketTasksNote') }} />
            </Typography>
          </Box>
        </Box>
      </Box>
        </Box>
      )}
    </Box>
  );
 
  const renderStatusManagementContent = () => (
    <Box sx={{ p: 4 }}>
      {/* Status Management Header */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2
        }}
      >
        {t('tasks.content.taskManagement.statusManagement.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 4
        }}
      >
        {t('tasks.content.taskManagement.statusManagement.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box>
          {/* Mobile Status Updates */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.updatingStatus.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.updatingStatus.description')}
            </Typography>

            {/* Status Dropdown Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/TaskstatusMob-ar.webp" : "/assets/support/TaskstatusMob.webp"}
              alt={t('tasks.content.taskManagement.altTexts.taskStatusMobile')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.statusManagement.mobile.updatingStatus.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Status Options Explanation */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.availableStatusOptions.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.availableStatusOptions.description')}
            </Typography>

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.statusManagement.mobile.availableStatusOptions.statuses', { returnObjects: true }).map((status, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: status }}
                />
              ))}
            </Box>
          </Box>

          {/* Status Filtering */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.filteringByStatus.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.filteringByStatus.description')}
            </Typography>

            <Box sx={{ ml: 2, mb: 4 }}>
              {t('tasks.content.taskManagement.statusManagement.mobile.filteringByStatus.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>

          {/* Mobile Status Management Notes */}
          <Box sx={{
            p: 3,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(0, 106, 103, 0.2)',
            mb: 4
          }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#4caf50',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.statusManagementNotes.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.statusManagement.mobile.statusManagementNotes.description')}
            </Typography>

            <Box sx={{ ml: 2 }}>
              {t('tasks.content.taskManagement.statusManagement.mobile.statusManagementNotes.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>

      {/* Overview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.overview.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.overview.description')}
        </Typography>

        {/* Status Management Image */}
        <SupportImage
          src={isArabic ? "/assets/support/taskstatusWeb-ar.webp" : "/assets/support/taskstatusWeb.webp"}
          alt={t('tasks.content.altTexts.taskStatusDialog')}
          isArabic={isArabic}
          maxWidth="600px"
        />

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.statusManagement.overview.features', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>

      {/* Methods Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.methods.title')}
        </Typography>

        {/* Method 1: Actions Menu */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.statusManagement.methods.actionMenu.title')}
          </Typography>

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.taskManagement.statusManagement.methods.actionMenu.steps', { returnObjects: true }).map((step, index) => {
              const stepText = step.toString();
              // Extract step number/title and description
              const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
              if (stepMatch) {
                const [, stepTitle, description] = stepMatch;
                return (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      mb: 0.5
                    }}
                  >
                    <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                    {description && <span style={{ color: 'black' }}> {description}</span>}
                  </Typography>
                );
              }
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Method 2: Direct Click */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.statusManagement.methods.directClick.title')}
          </Typography>

          <Box sx={{ ml: 2 }}>
            {t('tasks.content.taskManagement.statusManagement.methods.directClick.steps', { returnObjects: true }).map((step, index) => {
              const stepText = step.toString();
              // Extract step number/title and description
              const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
              if (stepMatch) {
                const [, stepTitle, description] = stepMatch;
                return (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      mb: 0.5
                    }}
                  >
                    <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                    {description && <span style={{ color: 'black' }}> {description}</span>}
                  </Typography>
                );
              }
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Status Dialog Features */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.statusDialog.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.statusDialog.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.statusManagement.statusDialog.features', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>

      {/* Available Statuses */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.availableStatuses.title')}
        </Typography>

        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.taskManagement.statusManagement.availableStatuses.defaultStatuses', { returnObjects: true }).map((status, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: status }}
            />
          ))}
        </Box>
      </Box>

      {/* Best Practices */}
      <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: '#006A67',
            mb: 2
          }}
        >
          {t('tasks.content.taskManagement.statusManagement.bestPractices.title')}
        </Typography>

        <Box sx={{ ml: 2 }}>
          {t('tasks.content.taskManagement.statusManagement.bestPractices.tips', { returnObjects: true }).map((tip, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: tip }}
            />
          ))}
        </Box>
      </Box>
        </Box>
      )}
    </Box>
  );
  const renderTaskDetailsContent = () => (
    <Box sx={{ p: 3 }}>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box>
          {/* Mobile Task Details Overview */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              {t('tasks.content.taskManagement.taskDetails.mobile.overview.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3
              }}
            >
              {t('tasks.content.taskManagement.taskDetails.mobile.overview.description')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
              <SupportImage
                src={isArabic ? "/assets/support/taskoverviewMob1-ar.webp" : "/assets/support/taskoverviewMob1.webp"}
                alt={t('tasks.content.altTexts.mobileTaskOverview1')}
                isArabic={isArabic}
                maxWidth="300px"
              />
              <SupportImage
                src={isArabic ? "/assets/support/taskoverviewMob2-ar.webp" : "/assets/support/taskoverviewMob2.webp"}
                alt={t('tasks.content.altTexts.mobileTaskOverview2')}
                isArabic={isArabic}
                maxWidth="300px"
              />
            </Box>

            <Box sx={{ ml: 2, mb: 3, mt: 2 }}>
              {Array.isArray(t('tasks.content.taskManagement.taskDetails.mobile.overview.features', { returnObjects: true }))
                ? t('tasks.content.taskManagement.taskDetails.mobile.overview.features', { returnObjects: true }).map((feature, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                    dangerouslySetInnerHTML={{ __html: feature }}
                  />
                ))
                : null}
            </Box>


          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          {/* Web Task Details Tabs */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('tasks.content.taskManagement.taskDetails.web.tabs.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {t('tasks.content.taskManagement.taskDetails.web.tabs.description')}
            </Typography>

            {/* Overview Tab */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
                {t('tasks.content.taskManagement.taskDetails.web.tabs.overview.title')}
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary', mb: 2 }}>
                {t('tasks.content.taskManagement.taskDetails.web.tabs.overview.description')}
              </Typography>

              {/* Document-Style Editing Feature */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#006A67', mb: 1 }}>
                  {t('tasks.content.taskManagement.taskDetails.web.tabs.overview.documentEditing.title')}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.primary', mb: 3 }}>
                  {t('tasks.content.taskManagement.taskDetails.web.tabs.overview.documentEditing.description')}
                </Typography>

                {/* Overview Document Interface Image */}
                <SupportImage
                  src={isArabic ? "/assets/support/overviewdocumentWeb-ar.webp" : "/assets/support/overviewdocumentWeb.webp"}
                  alt={t('tasks.content.altTexts.overviewDocument')}
                  isArabic={isArabic}
                  caption={t('tasks.content.imageCaptions.overviewDocument')}
                />

                {/* Document Add Form Interface Image */}
                <Box sx={{ mt: 3 }}>
                  <SupportImage
                    src={isArabic ? "/assets/support/documentaddformWeb-ar.webp" : "/assets/support/documentaddformWeb.webp"}
                    alt={t('tasks.content.altTexts.documentAddForm')}
                    isArabic={isArabic}
                    caption={t('tasks.content.imageCaptions.documentAddForm')}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

    </Box>
  );

  const renderAssignmentsContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2
        }}
      >
        {t('tasks.content.assignments.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 4
        }}
      >
        {t('tasks.content.assignments.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box
          sx={{
            bgcolor: 'rgba(0, 106, 103, 0.1)',
            p: 3,
            borderRadius: 2,
            border: '1px solid rgba(0, 106, 103, 0.2)',
            mb: 4
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'black',
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.description')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
            <SupportImage
              src={isArabic ? "/assets/support/AssignetaskMob1-ar.webp" : "/assets/support/AssignetaskMob1.webp"}
              alt={t('tasks.content.altTexts.mobileTaskAssignment1')}
              isArabic={isArabic}
              maxWidth="300px"
              backgroundColor="transparent"
              sx={{ p: 0, border: 'none', boxShadow: 'none' }}
            />
            <SupportImage
              src={isArabic ? "/assets/support/AssignetaskMob2-ar.webp" : "/assets/support/AssignetaskMob2.webp"}
              alt={t('tasks.content.altTexts.mobileTaskAssignment2')}
              isArabic={isArabic}
              maxWidth="300px"
              backgroundColor="transparent"
              sx={{ p: 0, border: 'none', boxShadow: 'none' }}
            />
          </Box>

          <Box sx={{ ml: 2 }}>
            {Array.isArray(t('tasks.content.taskManagement.assignments.mobile.features', { returnObjects: true }))
              ? t('tasks.content.taskManagement.assignments.mobile.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
              : null}
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>

      {/* Assigned Tasks Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.assignments.assignedTasks.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('tasks.content.assignments.assignedTasks.description')}
        </Typography>

        {/* Assigned Tasks Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/assigneelistWeb-ar.webp" : "/assets/support/assigneelistWeb.webp"}
          alt={t('tasks.content.assignments.altTexts.assigneeListWeb')}
          isArabic={isArabic}
          caption={t('tasks.content.assignments.altTexts.assigneeListWeb')}
        />


        {/* Assigned Tasks Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.assignments.assignedTasks.overview.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 2
            }}
          >
            {t('tasks.content.assignments.assignedTasks.overview.description')}
          </Typography>


          <Box sx={{ ml: 2, mb: 4 }}>
            {t('tasks.content.assignments.assignedTasks.overview.features', { returnObjects: true }).map((feature, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: feature }}
              />
            ))}
          </Box>
        </Box>

        {/* Status Updates */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.assignments.assignedTasks.statusUpdates.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.assignments.assignedTasks.statusUpdates.description')}
          </Typography>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('tasks.content.assignments.assignedTasks.statusUpdates.steps', { returnObjects: true }).map((step, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          {/* Status Update Actions Image */}
          <SupportImage
            src={isArabic ? "/assets/support/actionforward-ar.webp" : "/assets/support/actionforward.webp"}
            alt={t('tasks.content.assignments.altTexts.actionForward')}
            isArabic={isArabic}
            caption={t('tasks.content.imageCaptions.taskActionsChangeStatus')}
          />
        </Box>
      </Box>

      {/* Task Forwarding Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('tasks.content.assignments.taskForwarding.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 4
          }}
        >
          {t('tasks.content.assignments.taskForwarding.description')}
        </Typography>

        {/* Forwarding Rules */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.assignments.taskForwarding.forwardingRules.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.assignments.taskForwarding.forwardingRules.description')}
          </Typography>
        </Box>

        {/* How to Forward */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('tasks.content.assignments.taskForwarding.howToForward.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.assignments.taskForwarding.howToForward.description')}
          </Typography>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('tasks.content.assignments.taskForwarding.howToForward.steps', { returnObjects: true }).map((step, index) => {
              const stepText = step.toString();

              // Add actionforward image after Step 4
              if (stepText.includes('Step 4') && stepText.includes('Forward Task')) {
                return (
                  <Box key={index}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Montserrat, sans-serif',
                        lineHeight: 1.6,
                        color: 'black',
                        mb: 2
                      }}
                      dangerouslySetInnerHTML={{ __html: step }}
                    />

                    {/* Action Forward Image after Step 4 */}
                    <Box sx={{ maxWidth: '400px', mx: 'auto', my: 2 }}>
                      <SupportImage
                        src={isArabic ? "/assets/support/actionforward-ar.webp" : "/assets/support/actionforward.webp"}
                        alt={t('tasks.content.altTexts.taskActionsForward')}
                        isArabic={isArabic}
                        caption={t('tasks.content.imageCaptions.taskActionsForward')}
                        sx={{
                          width: '100%',
                          maxWidth: '350px',
                          height: 'auto'
                        }}
                      />
                    </Box>
                     {/* { Forward Task Interface Image} */}
            <SupportImage
              src={isArabic ? "/assets/support/forwardTaskWeb-ar.webp" : "/assets/support/forwardTaskWeb.webp"}
              alt={t('tasks.content.altTexts.forwardTaskInterface')}
              isArabic={isArabic}
              caption={t('tasks.content.imageCaptions.forwardTaskInterface')}
            />
                  </Box>
                );
              }

              // Handle any remaining image spaces (if any)
              if (typeof step === 'string' && step.includes('<strong>Image Space:</strong>')) {
                return (
                  <Box key={index} sx={{ my: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        mb: 1
                      }}
                      dangerouslySetInnerHTML={{ __html: step }}
                    />
                  </Box>
                );
              }

              // Regular step text
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 1
                  }}
                  dangerouslySetInnerHTML={{ __html: step }}
                />
              );
            })}

           
          </Box>

         

         



        </Box>
      </Box>
        </Box>
      )}
    </Box>
  );


  const renderBacklogContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.content.assignments.taskBacklog.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.content.assignments.taskBacklog.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box
          sx={{
            mb: 4
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              mb: 2
            }}
          >
            {t('tasks.content.assignments.mobile.backlog.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.assignments.mobile.backlog.description')}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/backlogMob-ar.webp" : "/assets/support/backlogMob.webp"}
            alt={t('tasks.content.altTexts.mobileBacklog')}
            isArabic={isArabic}
            maxWidth="400px"
            caption={t('tasks.content.imageCaptions.mobileBacklog')}
          />

          <Box sx={{ ml: 2, mt: 3 }}>
            {Array.isArray(t('tasks.content.taskManagement.assignments.mobile.backlog.features', { returnObjects: true }))
              ? t('tasks.content.taskManagement.assignments.mobile.backlog.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
              : null}
          </Box>
        </Box>
      )}

      {/* What is Backlog Section */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('tasks.content.assignments.taskBacklog.whatIsBacklog.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskBacklog.whatIsBacklog.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskBacklog.whatIsBacklog.characteristics', { returnObjects: true }).map((characteristic, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: characteristic }}
            />
          ))}
        </Box>
      </Box>
      )}

      {/* Backlog Actions Section */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('tasks.content.assignments.taskBacklog.backlogActions.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskBacklog.backlogActions.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskBacklog.backlogActions.availableActions', { returnObjects: true }).map((action, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: action }}
            />
          ))}
        </Box>

        {/* Backlog Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/BacklogWeb-ar.webp" : "/assets/support/BacklogWeb.webp"}
          alt={t('tasks.content.assignments.altTexts.backlogWeb')}
          isArabic={isArabic}
          caption={t('tasks.content.assignments.altTexts.backlogWeb')}
        />
      </Box>
      )}

      {/* How Tasks Enter Backlog Section */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('tasks.content.assignments.taskBacklog.howTasksEnterBacklog.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskBacklog.howTasksEnterBacklog.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskBacklog.howTasksEnterBacklog.scenarios', { returnObjects: true }).map((scenario, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: scenario }}
            />
          ))}
        </Box>
      </Box>
      )}

      {/* Managing Backlog Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('tasks.content.assignments.taskBacklog.managingBacklog.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskBacklog.managingBacklog.description')}
        </Typography>

        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskBacklog.managingBacklog.bestPractices', { returnObjects: true }).map((practice, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: practice }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderSubtasksContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.navigation.subtasks.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.navigation.subtasks.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              mb: 2
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.subtasks.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.subtasks.description')}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/subtasksMob-ar.webp" : "/assets/support/subtasksMob.webp"}
            alt={t('tasks.content.altTexts.mobileSubtasks')}
            isArabic={isArabic}
            maxWidth="400px"
            caption={t('tasks.content.imageCaptions.mobileSubtasks')}
          />

          <Box sx={{ ml: 2, mt: 3 }}>
            {Array.isArray(t('tasks.content.taskManagement.assignments.mobile.subtasks.features', { returnObjects: true }))
              ? t('tasks.content.taskManagement.assignments.mobile.subtasks.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
              : null}
          </Box>
        </Box>
      )}

      {/* Subtasks Overview */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.overview.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.overview.description')}
        </Typography>

        {/* Key Features */}
        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.assignments.subtasks.overview.keyFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>

        {/* Subtasks Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/subtasksWeb-ar.webp" : "/assets/support/subtasksWeb.webp"}
          alt={t('tasks.content.altTexts.subtasksInterface')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.subtasksInterface')}
        />
      </Box>
      )}

      {/* Creating Subtasks */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.creatingSubtasks.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.creatingSubtasks.description')}
        </Typography>

        {/* Creation Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.subtasks.creatingSubtasks.steps', { returnObjects: true }).map((step, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: step }}
            />
          ))}
        </Box>
      </Box>

      {/* Subtask Interface Features */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.subtaskInterface.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.subtaskInterface.description')}
        </Typography>

        {/* Interface Elements */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.subtasks.subtaskInterface.interfaceElements', { returnObjects: true }).map((element, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: element }}
            />
          ))}
        </Box>
      </Box>

      {/* Subtask Permissions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.subtaskPermissions.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.subtaskPermissions.description')}
        </Typography>

        {/* Permission Structure */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.subtasks.subtaskPermissions.permissionStructure', { returnObjects: true }).map((permission, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: permission }}
            />
          ))}
        </Box>
      </Box>

      {/* Subtask Forwarding */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.subtaskForwarding.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.subtaskForwarding.description')}
        </Typography>

        {/* Forwarding Rules */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.subtasks.subtaskForwarding.forwardingRules', { returnObjects: true }).map((rule, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: rule }}
            />
          ))}
        </Box>
      </Box>

      {/* Nested Subtasks */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.subtasks.nestedSubtasks.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.subtasks.nestedSubtasks.description')}
        </Typography>

        {/* Nested Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.subtasks.nestedSubtasks.nestedFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>
      
    </Box>
  );

  const renderTimelineContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.navigation.timeline.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.navigation.timeline.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              mb: 2
            }}
          >
            {t('tasks.content.assignments.mobile.timeline.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.assignments.mobile.timeline.description')}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/timelineMob-ar.webp" : "/assets/support/timelineMob.webp"}
            alt={t('tasks.content.altTexts.mobileTimeline')}
            isArabic={isArabic}
            maxWidth="400px"
            caption={t('tasks.content.imageCaptions.mobileTimeline')}
          />

          <Box sx={{ ml: 2, mt: 3 }}>
            {Array.isArray(t('tasks.content.taskManagement.assignments.mobile.timeline.features', { returnObjects: true }))
              ? t('tasks.content.taskManagement.assignments.mobile.timeline.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
              : null}
          </Box>
        </Box>
      )}

      {/* Timeline Overview */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.timeline.overview.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.timeline.overview.description')}
        </Typography>

        {/* Key Features */}
        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.assignments.timeline.overview.keyFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>

        {/* Timeline Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/timelineWeb-ar.webp" : "/assets/support/timelineWeb.webp"}
          alt={t('tasks.content.altTexts.taskTimeline')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.taskTimeline')}
        />
      </Box>
      )}

      {/* Automatic Tracking */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.timeline.automaticTracking.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.timeline.automaticTracking.description')}
        </Typography>

        {/* Tracked Activities */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.timeline.automaticTracking.trackedActivities', { returnObjects: true }).map((activity, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: activity }}
            />
          ))}
        </Box>
      </Box>

   
     
    </Box>
  );

  const renderAttachmentsContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.navigation.attachments.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.navigation.attachments.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              mb: 2,
              color: 'black'
            }}
          >
{t('tasks.content.taskManagement.assignments.mobile.attachments.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
{t('tasks.content.taskManagement.assignments.mobile.attachments.description')}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/taskcommentsMob-ar.webp" : "/assets/support/taskcommentsMob.webp "}
            alt={t('tasks.content.taskManagement.altTexts.mobileTaskAttachments')}
            isArabic={isArabic}
            maxWidth="300px"
            caption={t('tasks.content.taskManagement.imageCaptions.mobileTaskAttachments')}
          />

          <Box sx={{ ml: 2, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
              {t('tasks.content.taskManagement.assignments.mobile.attachments.optionsTitle')}
            </Typography>
{(() => {
              const options = t('tasks.content.taskManagement.assignments.mobile.attachments.options', { returnObjects: true });
              if (Array.isArray(options)) {
                return options.map((option, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black',
                      mb: 1
                    }}
                    dangerouslySetInnerHTML={{ __html: option }}
                  />
                ));
              } else {
                return (
                  <>
                    <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                      • <strong>Document:</strong> Upload files and documents from device storage
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                      • <strong>Camera:</strong> Take photos directly and attach them to tasks
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                      • <strong>Gallery:</strong> Select photos and media from device gallery
                    </Typography>
                  </>
                );
              }
            })()}
              
            
          </Box>
        </Box>
      )}

      {/* Attachments Overview */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.attachments.overview.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.attachments.overview.description')}
        </Typography>

        {/* Key Features */}
        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.assignments.attachments.overview.keyFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>

        {/* Comments Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/CommentWeb-ar.webp" : "/assets/support/CommentWeb.webp"}
          alt={t('tasks.content.altTexts.taskComments')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.taskComments')}
        />
      </Box>
      )}

      {/* Adding Attachments */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.attachments.addingAttachments.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.attachments.addingAttachments.description')}
        </Typography>

        {/* Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.attachments.addingAttachments.steps', { returnObjects: true }).map((step, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: step }}
            />
          ))}
        </Box>
      </Box>
      )}



      {/* Comment Management */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.attachments.commentManagement.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.attachments.commentManagement.description')}
        </Typography>

        {/* Management Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.attachments.commentManagement.managementFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>
      )}


    </Box>
  );
  const renderCommentsTodoContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.navigation.commentsTodo.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.navigation.commentsTodo.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              mb: 2,
              mt: 4
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.todoActivities.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('tasks.content.taskManagement.assignments.mobile.todoActivities.description')}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <SupportImage
              src={isArabic ? "/assets/support/todoMob1-ar.webp" : "/assets/support/todoMob1.webp"}
              alt={t('tasks.content.altTexts.mobileTodoActivities')}
              isArabic={isArabic}
              maxWidth="300px"
              caption={t('tasks.content.taskManagement.imageCaptions.todoTabActivities')}
            />
            <SupportImage
              src={isArabic ? "/assets/support/todoMob2-ar.webp" : "/assets/support/todoMob2.webp"}
              alt={t('tasks.content.altTexts.mobileAddActivity')}
              isArabic={isArabic}
              maxWidth="300px"
              caption={t('tasks.content.taskManagement.imageCaptions.addActivityForm')}
            />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <SupportImage
              src={isArabic ? "/assets/support/todoMob3-ar.webp" : "/assets/support/todoMob3.webp"}
              alt={t('tasks.content.altTexts.mobileActivityManagement')}
              isArabic={isArabic}
              maxWidth="300px"
              caption={t('tasks.content.taskManagement.imageCaptions.activityManagement')}
            />
          </Box>

          <Box sx={{ ml: 2, mt: 3 }}>
            {Array.isArray(t('tasks.content.taskManagement.assignments.mobile.todoActivities.features', { returnObjects: true }))
              ? t('tasks.content.taskManagement.assignments.mobile.todoActivities.features', { returnObjects: true }).map((feature, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              ))
              : null}
          </Box>
        </Box>
      )}

      {/* Web Todo Activities Overview */}
      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.assignments.commentsTodo.overview.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {t('tasks.content.assignments.commentsTodo.overview.description')}
          </Typography>

        {/* Key Features */}
        <Box sx={{ ml: 2, mb: 4 }}>
          {t('tasks.content.assignments.commentsTodo.overview.keyFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>

        {/* Activities Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/todoWeb-ar.webp" : "/assets/support/todoWeb.webp"}
          alt={t('tasks.content.altTexts.taskActivitiesTodo')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.taskActivitiesTodo')}
        />

        {/* Adding Todos */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.assignments.commentsTodo.addingTodos.title')}
          </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.commentsTodo.addingTodos.description')}
        </Typography>

        {/* Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.commentsTodo.addingTodos.steps', { returnObjects: true }).map((step, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: step }}
            />
          ))}
        </Box>
      </Box>

      {/* Reminder System */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.commentsTodo.reminderSystem.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.commentsTodo.reminderSystem.description')}
        </Typography>

        {/* Reminder Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.commentsTodo.reminderSystem.reminderFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>

      {/* Team Member Management */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.commentsTodo.teamMemberManagement.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.commentsTodo.teamMemberManagement.description')}
        </Typography>

        {/* Member Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.commentsTodo.teamMemberManagement.memberFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>

      {/* Completion Tracking */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.commentsTodo.completionTracking.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.commentsTodo.completionTracking.description')}
        </Typography>

        {/* Tracking Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.commentsTodo.completionTracking.trackingFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>

      {/* Todo Management */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.commentsTodo.todoManagement.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.commentsTodo.todoManagement.description')}
        </Typography>

        {/* Management Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.commentsTodo.todoManagement.managementFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>
        </Box>
      )}










    </Box>
  );
  const renderTaskSettingsContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'black' }}>
        {t('tasks.navigation.taskSettings.title')}
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
        {t('tasks.navigation.taskSettings.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <InfoAlert>
          <SubsectionTitle>
            {t('tasks.content.taskManagement.mobileSettingsLimitation.title')}
          </SubsectionTitle>
          <BodyText>
            {t('tasks.content.taskManagement.mobileSettingsLimitation.description')}
          </BodyText>
          <FeatureText
            dangerouslySetInnerHTML={{ __html: t('tasks.content.taskManagement.mobileSettingsLimitation.note') }}
          />
        </InfoAlert>
      )}

      {/* Task Settings Overview */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.overview.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.overview.description')}
        </Typography>

        {/* Key Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskSettings.overview.keyFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>

        {/* Task Labels Interface Image */}
        <SupportImage
          src={isArabic ? "/assets/support/tasklabelsWeb-ar.webp" : "/assets/support/tasklabelsWeb.webp"}
          alt={t('tasks.content.altTexts.taskLabelsStatus')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.taskLabelsInterface')}
        />
      </Box>
      )}

      {/* Task Labels and Statuses */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.taskLabelsStatuses.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.taskLabelsStatuses.description')}
        </Typography>

        {/* Creation Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.stepByStepInstructions')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskLabelsStatuses.addingSteps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 1
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Status Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.keyFeatures')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskLabelsStatuses.statusFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>
      )}

      {/* Task Categories */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.taskCategories.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.taskCategories.description')}
        </Typography>

        {/* Creation Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.stepByStepInstructions')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskCategories.creationSteps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 1
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Creation Tips */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.creationTips')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskCategories.creationTips', { returnObjects: true }).map((tip, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: tip }}
            />
          ))}
        </Box>

        {/* Task Categories Image */}
        <SupportImage
          src={isArabic ? "/assets/support/TaskCatWeb-ar.webp" : "/assets/support/TaskCatWeb.webp"}
          alt={t('tasks.content.altTexts.taskCategories')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.taskCategories')}
        />
      </Box>
      )}

      {/* Task Priorities */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.taskPriorities.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.taskPriorities.description')}
        </Typography>

        {/* Creation Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.stepByStepInstructions')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskPriorities.creationSteps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 1
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Creation Tips */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.creationTips')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.taskPriorities.creationTips', { returnObjects: true }).map((tip, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: tip }}
            />
          ))}
        </Box>
      </Box>
      )}

      {/* Exempted Assignees */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.exemptedAssignees.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.exemptedAssignees.description')}
        </Typography>

        {/* Adding Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.stepByStepInstructions')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.exemptedAssignees.addingSteps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 1
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Exemption Effects */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.exemptionEffects')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.exemptedAssignees.exemptionEffects', { returnObjects: true }).map((effect, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: effect }}
            />
          ))}
        </Box>

        {/* Exempted Assignees Image */}
        <SupportImage
          src={isArabic ? "/assets/support/exemptedAssigneWeb-ar.webp" : "/assets/support/exemptedAssigneWeb.webp"}
          alt={t('tasks.content.altTexts.exemptedAssignees')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.exemptedAssignees')}
        />
      </Box>
      )}

      {/* Create AI Permission */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.createAIPermission.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.createAIPermission.description')}
        </Typography>

        {/* Adding Steps */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.stepByStepInstructions')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.createAIPermission.addingSteps', { returnObjects: true }).map((step, index) => {
            const stepText = step.toString();
            // Extract step number/title and description
            const stepMatch = stepText.match(/^(Step \d+[^:]*:?)\s*(.*)$/);
            if (stepMatch) {
              const [, stepTitle, description] = stepMatch;
              return (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    mb: 1
                  }}
                >
                  <span style={{ color: SUPPORT_COLORS.teal, fontWeight: 600 }}>{stepTitle}</span>
                  {description && <span style={{ color: 'black' }}> {description}</span>}
                </Typography>
              );
            }
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            );
          })}
        </Box>

        {/* Permission Benefits */}
        <Box sx={{ ml: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
            {t('tasks.content.taskManagement.sectionTitles.permissionBenefits')}
          </Typography>
          {t('tasks.content.assignments.taskSettings.createAIPermission.permissionBenefits', { returnObjects: true }).map((benefit, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: benefit }}
            />
          ))}
        </Box>

        {/* Create AI Permission Image */}
        <SupportImage
          src={isArabic ? "/assets/support/createaipermission-ar.webp" : "/assets/support/createaipermission.webp"}
          alt={t('tasks.content.altTexts.createAIPermission')}
          isArabic={isArabic}
          caption={t('tasks.content.imageCaptions.createAIPermission')}
        />
      </Box>
      )}


      {/* Access Permissions */}
      {platform === 'web' && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'black' }}>
          {t('tasks.content.assignments.taskSettings.accessPermissions.title')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
          {t('tasks.content.assignments.taskSettings.accessPermissions.description')}
        </Typography>

        {/* Permission Features */}
        <Box sx={{ ml: 2, mb: 3 }}>
          {t('tasks.content.assignments.taskSettings.accessPermissions.permissionFeatures', { returnObjects: true }).map((feature, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 1
              }}
              dangerouslySetInnerHTML={{ __html: feature }}
            />
          ))}
        </Box>
      </Box>
      )}


    </Box>
  );

  return renderContent();
}

// Main exported component
export default function TasksPage() {
  const { t } = useTranslation('support');
  const navigationItems = getTasksNavigationItems(t);

  return (
    <CommonSidebarLayout
      moduleKey="tasks"
      navigationItems={navigationItems}
      defaultSection="overview"
      backUrl="/support/getting-started"
      contentComponent={TasksContent}
    />
  );
}
