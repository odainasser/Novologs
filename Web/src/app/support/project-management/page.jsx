'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';
import { SUPPORT_COLORS } from '../components/common-sidebar-layout';

// Standardized Support Image Component - Use standard teal background
const SupportImage = ({ src, alt, isArabic, maxWidth = '800px', backgroundColor = SUPPORT_COLORS.imageBg }) => (
  <Box
    sx={{
      mb: 3,
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor,
      p: 2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth,
      mx: 'auto'
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '8px',
        maxWidth: '100%'
      }}
    />
  </Box>
);

// ----------------------------------------------------------------------

const SIDEBAR_WIDTH = 280;

// ----------------------------------------------------------------------

export default function ProjectManagementPage() {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';

  const getProjectManagementNavigationItems = (t) => [
    {
      id: 'overview',
      title: t('projectManagement.navigation.overview.title'),
      icon: 'solar:folder-with-files-bold',
      description: t('projectManagement.navigation.overview.description'),
      keywords: ['project', 'overview', 'introduction', 'module', 'dashboard', 'interface', 'getting started', 'project management', 'workflow']
    },
    {
      id: 'project-detail-overview',
      title: t('projectManagement.navigation.projectDetailOverview.title'),
      icon: 'solar:eye-bold',
      description: t('projectManagement.navigation.projectDetailOverview.description'),
      keywords: ['project detail overview', 'project overview', 'project documentation', 'rich text editor', 'project information', 'overview tab']
    },
    {
      id: 'project-tasks',
      title: t('projectManagement.navigation.projectTasks.title'),
      icon: 'solar:checklist-minimalistic-bold',
      description: t('projectManagement.navigation.projectTasks.description'),
      keywords: ['project tasks', 'task management', 'create tasks', 'edit tasks', 'delete tasks', 'task details', 'timesheet', 'activities', 'subtasks', 'task permissions']
    },
    {
      id: 'task-category',
      title: t('projectManagement.navigation.taskCategory.title'),
      icon: 'solar:folder-with-files-bold',
      description: t('projectManagement.navigation.taskCategory.description'),
      keywords: ['task category', 'task classification', 'task settings', 'create category', 'task organization', 'category management']
    },
    {
      id: 'milestone',
      title: t('projectManagement.navigation.milestone.title'),
      icon: 'solar:flag-bold',
      description: t('projectManagement.navigation.milestone.description'),
      keywords: ['milestone', 'project milestone', 'add milestone', 'milestone tasks', 'project tracking', 'milestone management']
    },
    {
      id: 'create-project',
      title: t('projectManagement.navigation.createProject.title'),
      icon: 'solar:add-square-bold',
      description: t('projectManagement.navigation.createProject.description'),
      keywords: ['create', 'add', 'new', 'project', 'setup', 'initialize', 'start', 'form', 'details']
    },
    {
      id: 'mission-management',
      title: t('projectManagement.navigation.missionManagement.title'),
      icon: 'solar:target-bold',
      description: t('projectManagement.navigation.missionManagement.description'),
      keywords: ['mission', 'mission management', 'short term', 'quick tasks', 'mission creation', 'time-bound', 'urgent tasks']
    },
    {
      id: 'project-actions',
      title: t('projectManagement.navigation.projectActions.title'),
      icon: 'solar:menu-dots-bold',
      description: t('projectManagement.navigation.projectActions.description'),
      keywords: ['actions', 'edit', 'archive', 'status', 'change', 'manage', 'update', 'modify', 'project management']
    },
   
    {
      id: 'files-documents',
      title: t('projectManagement.navigation.filesDocuments.title'),
      icon: 'solar:folder-bold',
      description: t('projectManagement.navigation.filesDocuments.description'),
      keywords: ['files', 'documents', 'folders', 'storage', 'attachments', 'uploads', 'file management']
    },
    {
      id: 'project-settings',
      title: t('projectManagement.navigation.projectSettings.title'),
      icon: 'solar:settings-bold',
      description: t('projectManagement.navigation.projectSettings.description'),
      keywords: ['settings', 'goals', 'initiatives', 'permissions', 'configuration', 'setup', 'access control']
    }

  ];

  const [selectedSection, setSelectedSection] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [platform, setPlatform] = useState('web');
  const router = useRouter();

  // Filter navigation items based on platform
  const projectManagementNavigationItems = getProjectManagementNavigationItems(t);
  const filteredNavigationItems = projectManagementNavigationItems
    .filter(item => !item.webOnly || platform === 'web');

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setDrawerOpen(false);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };



  const currentItem = projectManagementNavigationItems.find(item => item.id === selectedSection);

  const renderSidebar = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <IconButton
          onClick={() => router.push('/support/getting-started')}
          sx={{
            mb: 2,
            color: '#006A67',
            '&:hover': { bgcolor: 'rgba(0, 106, 103, 0.1)' }
          }}
        >
          <Iconify icon={isArabic ? "solar:arrow-right-bold" : "solar:arrow-left-bold"} width={20} />
        </IconButton>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontFamily: 'Montserrat, sans-serif',
            mb: 1
          }}
        >
          {t('projectManagement.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {t('projectManagement.subtitle')}
        </Typography>
      </Box>

      {/* Platform Toggle */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'black'
          }}
        >
          {t('projectManagement.selectPlatform')}
        </Typography>
        <ToggleButtonGroup
          value={platform}
          exclusive
          onChange={(_, newPlatform) => {
            if (newPlatform !== null) {
              setPlatform(newPlatform);
            }
          }}
          size="small"
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem',
              '&.Mui-selected': {
                bgcolor: '#006A67',
                color: 'white',
                '&:hover': {
                  bgcolor: '#005A57',
                },
              },
            },
          }}
        >
          <ToggleButton value="web">
            <Iconify icon="solar:monitor-bold" width={16} sx={{ mr: 1 }} />
            {t('projectManagement.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 1 }} />
            {t('projectManagement.mobile')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Navigation List */}
      <List sx={{ p: 2 }}>
        {filteredNavigationItems.length > 0 ? filteredNavigationItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedSection === item.id}
              onClick={() => handleSectionChange(item.id)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: '#006A67',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#005A57',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: selectedSection === item.id ? 'white' : '#006A67',
                }}
              >
                <Iconify icon={item.icon} width={24} />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={selectedSection === item.id ? item.description : ''}
                primaryTypographyProps={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
                secondaryTypographyProps={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.8rem',
                  color: selectedSection === item.id ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                }}
              />
            </ListItemButton>
          </ListItem>
        )) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('projectManagement.noResults', { searchTerm })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontFamily: 'Montserrat, sans-serif' }}>
              {t('projectManagement.searchSuggestions')}
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent();
      case 'project-detail-overview':
        return renderProjectDetailOverviewContent();
      case 'project-tasks':
        return renderProjectTasksContent();
      case 'task-category':
        return renderTaskCategoryContent();
      case 'milestone':
        return renderMilestoneContent();
      case 'files-documents':
        return renderFilesDocumentsContent();
      case 'project-settings':
        return renderProjectSettingsContent();
      case 'create-project':
        return renderCreateProjectContent();
      case 'mission-management':
        return renderMissionManagementContent();
      case 'project-actions':
        return renderProjectActionsContent();
      case 'project-details':
        return renderProjectDetailsContent();

      case 'reports':
        return renderReportsContent();
      case 'archive':
        return renderArchiveContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  const renderOverviewContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.overview.title')}
      </Typography>

      {platform === 'web' && (
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
            {t('projectManagement.content.overview.introduction')}
          </Typography>
        </Box>
      )}

      {platform === 'mobile' && (
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
            {t('projectManagement.content.overview.mobile.description')}
          </Typography>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          {/* Web Project Dashboard Image */}
          <SupportImage
            src={isArabic ? "/assets/support/projectWebDashboard-ar.webp" : "/assets/support/projectWebDashboard.webp"}
            alt={t('projectManagement.content.overview.webDashboard.imageAlt')}
            isArabic={isArabic}
          />
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.overview.whatYouCanDo')}
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 3,
            mb: 4
          }}>
            {/* Project Planning */}
            <Box sx={{
              backgroundColor: 'rgba(0, 106, 103, 0.05)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 106, 103, 0.1)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.features.planning.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.overview.features.planning.item1')}<br />
                • {t('projectManagement.content.overview.features.planning.item2')}<br />
                • {t('projectManagement.content.overview.features.planning.item3')}
              </Typography>
            </Box>

            {/* Team Collaboration */}
            <Box sx={{
              backgroundColor: 'rgba(0, 106, 103, 0.05)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 106, 103, 0.1)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.features.collaboration.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.overview.features.collaboration.item1')}<br />
                • {t('projectManagement.content.overview.features.collaboration.item2')}<br />
                • {t('projectManagement.content.overview.features.collaboration.item3')}
              </Typography>
            </Box>

            {/* Progress Tracking */}
            <Box sx={{
              backgroundColor: 'rgba(0, 106, 103, 0.05)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 106, 103, 0.1)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.features.tracking.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.overview.features.tracking.item1')}<br />
                • {t('projectManagement.content.overview.features.tracking.item2')}<br />
                • {t('projectManagement.content.overview.features.tracking.item3')}
              </Typography>
            </Box>


          </Box>

          {/* Interface Views Section */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.interfaceViews.title')}
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
              {t('projectManagement.content.overview.interfaceViews.description')}
            </Typography>

            {/* List View */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.interfaceViews.listView.title')}
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
                {t('projectManagement.content.overview.interfaceViews.listView.description')}
              </Typography>

              {/* List View Image */}
              <SupportImage
                src={isArabic ? '/assets/support/projectWebDashboard-ar.webp' : '/assets/support/projectWebDashboard.webp'}
                alt={t('projectManagement.content.overview.interfaceViews.listView.imageAlt')}
                isArabic={isArabic}
              />

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
              >
                <strong>{t('projectManagement.content.overview.interfaceViews.listView.bestFor')}:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.overview.interfaceViews.listView.benefit1')}<br />
                • {t('projectManagement.content.overview.interfaceViews.listView.benefit2')}<br />
                • {t('projectManagement.content.overview.interfaceViews.listView.benefit3')}<br />
                • {t('projectManagement.content.overview.interfaceViews.listView.benefit4')}
              </Typography>
            </Box>

            {/* Grid View */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,

                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.interfaceViews.gridView.title')}
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
                {t('projectManagement.content.overview.interfaceViews.gridView.description')}
              </Typography>

              {/* Grid View Image */}
              <SupportImage
                src={isArabic ? '/assets/support/ProjectGridview-ar.webp' : '/assets/support/ProjectGridview.webp'}
                alt={t('projectManagement.content.overview.interfaceViews.gridView.imageAlt')}
                isArabic={isArabic}
              />

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 1
                }}
              >
                <strong>{t('projectManagement.content.overview.interfaceViews.gridView.bestFor')}:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.overview.interfaceViews.gridView.benefit1')}<br />
                • {t('projectManagement.content.overview.interfaceViews.gridView.benefit2')}<br />
                • {t('projectManagement.content.overview.interfaceViews.gridView.benefit3')}<br />
                • {t('projectManagement.content.overview.interfaceViews.gridView.benefit4')}
              </Typography>
            </Box>

            {/* How to Switch Views */}
            <Box
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(0, 106, 103, 0.2)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,

                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.interfaceViews.switchViews.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {t('projectManagement.content.overview.interfaceViews.switchViews.description')}
              </Typography>
            </Box>
          </Box>

          {/* Navigation, Filters & Search Section */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.navigation.title')}
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
              {t('projectManagement.content.overview.navigation.description')}
            </Typography>

            {/* Tabs Navigation */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,

                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.tabs.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.tabs.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.overview.navigation.tabs.dashboard')}:</strong> {t('projectManagement.content.overview.navigation.tabs.dashboardDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.tabs.projects')}:</strong> {t('projectManagement.content.overview.navigation.tabs.projectsDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.tabs.list')}:</strong> {t('projectManagement.content.overview.navigation.tabs.listDesc')}
                </Typography>
              </Box>
            </Box>

            {/* View Toggle */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,

                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.viewToggle.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.viewToggle.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.overview.navigation.viewToggle.list')}:</strong> {t('projectManagement.content.overview.navigation.viewToggle.listDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.viewToggle.grid')}:</strong> {t('projectManagement.content.overview.navigation.viewToggle.gridDesc')}
                </Typography>
              </Box>
            </Box>

            {/* Search Functionality */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.search.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.search.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.overview.navigation.search.feature1')}<br />
                  • {t('projectManagement.content.overview.navigation.search.feature2')}<br />
                  • {t('projectManagement.content.overview.navigation.search.feature3')}<br />
                  • {t('projectManagement.content.overview.navigation.search.feature4')}
                </Typography>
              </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.filters.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.filters.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.overview.navigation.filters.status')}:</strong> {t('projectManagement.content.overview.navigation.filters.statusDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.filters.department')}:</strong> {t('projectManagement.content.overview.navigation.filters.departmentDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.filters.multiple')}:</strong> {t('projectManagement.content.overview.navigation.filters.multipleDesc')}<br />
                  • <strong>{t('projectManagement.content.overview.navigation.filters.clear')}:</strong> {t('projectManagement.content.overview.navigation.filters.clearDesc')}
                </Typography>
              </Box>
            </Box>

            {/* Tips Box */}
            <Box
              sx={{
                p: 3,
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(0, 106, 103, 0.2)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.navigation.tips.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.overview.navigation.tips.tip1')}<br />
                • {t('projectManagement.content.overview.navigation.tips.tip2')}<br />
                • {t('projectManagement.content.overview.navigation.tips.tip3')}<br />
                • {t('projectManagement.content.overview.navigation.tips.tip4')}
              </Typography>
            </Box>
          </Box>

          {/* Project Details Overview Section */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.projectDetails.title')}
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
              {t('projectManagement.content.overview.projectDetails.description')}
            </Typography>

            {/* Project Detail View Image */}
            <SupportImage
              src={isArabic ? '/assets/support/ProjectDetailView-ar.webp' : '/assets/support/ProjectDetailView.webp'}
              alt={t('projectManagement.content.overview.projectDetails.imageAlt')}
              isArabic={isArabic}
            />

            {/* Key Features */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.projectDetails.features.title')}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                {/* Project Information */}
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.info.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.info.description')}
                  </Typography>
                </Box>

                {/* Task Statistics */}
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.tasks.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.tasks.description')}
                  </Typography>
                </Box>

                {/* My Tasks */}
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.myTasks.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.myTasks.description')}
                  </Typography>
                </Box>

                {/* Quick Actions */}
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.actions.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.overview.projectDetails.features.actions.description')}
                  </Typography>
                </Box>
              </Box>

              {/* Learn More */}
              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 106, 103, 0.2)'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    fontWeight: 600
                  }}
                >
                  {t('projectManagement.content.overview.projectDetails.learnMore')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Additional Features Section */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.additionalFeatures.title')}
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
              {t('projectManagement.content.overview.additionalFeatures.description')}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
              {/* Archive Projects */}
              <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: '#006A67',
                      color: 'white'
                    }}
                  >
                    <Iconify icon="mdi:archive-outline" width={20} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67'
                    }}
                  >
                    {t('projectManagement.content.overview.additionalFeatures.archive.title')}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  {t('projectManagement.content.overview.additionalFeatures.archive.description')}
                </Typography>
              </Box>

              {/* Project Settings */}
              <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: '#006A67',
                      color: 'white'
                    }}
                  >
                    <Iconify icon="solar:settings-bold" width={20} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67'
                    }}
                  >
                    {t('projectManagement.content.overview.additionalFeatures.settings.title')}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.overview.additionalFeatures.settings.description')}
                </Typography>

                {/* Project Settings Image */}
                <SupportImage
                  src={isArabic ? '/assets/support/projectSettingsWeb-ar.webp' : '/assets/support/projectSettingsWeb.webp'}
                  alt={t('projectManagement.content.overview.additionalFeatures.settings.imageAlt')}
                  isArabic={isArabic}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box>
          {/* Mobile Project Dashboard Image */}
          <SupportImage
            src={isArabic ? '/assets/support/projectdashboardMob-ar.webp' : '/assets/support/projectdashboardMob.webp'}
            alt={t('projectManagement.content.overview.mobile.imageAlt')}
            isArabic={isArabic}
            maxWidth="400px"
          />

          {/* What You Can Do on Mobile */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.overview.mobile.whatYouCanDo')}
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            mb: 4
          }}>
            {/* Mobile Project Access */}
            <Box sx={{
              backgroundColor: 'rgba(0, 106, 103, 0.05)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 106, 103, 0.1)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.mobile.features.access.title')}
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                  • {t('projectManagement.content.overview.mobile.features.access.item1')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                  • {t('projectManagement.content.overview.mobile.features.access.item2')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black' }}>
                  • {t('projectManagement.content.overview.mobile.features.access.item3')}
                </Typography>
              </Box>
            </Box>

            {/* Mobile Collaboration */}
            <Box sx={{
              backgroundColor: 'rgba(0, 106, 103, 0.05)',
              borderRadius: 2,
              p: 3,
              border: '1px solid rgba(0, 106, 103, 0.1)'
            }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.overview.mobile.features.collaboration.title')}
              </Typography>
              <Box sx={{ pl: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                  • {t('projectManagement.content.overview.mobile.features.collaboration.item1')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
                  • {t('projectManagement.content.overview.mobile.features.collaboration.item2')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black' }}>
                  • {t('projectManagement.content.overview.mobile.features.collaboration.item3')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Mobile Project Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.filter.title')}
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
              {t('projectManagement.content.overview.mobile.filter.description')}
            </Typography>

            <SupportImage
              src={isArabic ? '/assets/support/projectfiltermob-ar.webp' : '/assets/support/projectfiltermob.webp'}
              alt={t('projectManagement.content.overview.mobile.filter.imageAlt')}
              isArabic={isArabic}
              maxWidth="400px"
            />

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mt: 2,
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.filter.feature1')}<br />
              • {t('projectManagement.content.overview.mobile.filter.feature2')}<br />
              • {t('projectManagement.content.overview.mobile.filter.feature3')}<br />
              • {t('projectManagement.content.overview.mobile.filter.feature4')}
            </Typography>
          </Box>


          {/* Mobile Navigation */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.navigation.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.navigation.description')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.navigation.tab1')}<br />
              • {t('projectManagement.content.overview.mobile.navigation.tab2')}<br />
              • {t('projectManagement.content.overview.mobile.navigation.tab3')}<br />
              • {t('projectManagement.content.overview.mobile.navigation.tab4')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderProjectDetailOverviewContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.projectDetailOverview.title')}
      </Typography>

      {platform === 'web' && (
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'text.secondary',
            mb: 4
          }}
        >
          {t('projectManagement.content.projectDetailOverview.web.description')}
        </Typography>
      )}

      {platform === 'mobile' && (
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'text.secondary',
            mb: 4
          }}
        >
          {t('projectManagement.content.projectDetailOverview.mobile.description')}
        </Typography>
      )}

      {/* Web Platform Content */}
      {platform === 'web' && (
        <Box>
          {/* Web Project Detail View Screenshot */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <SupportImage
              src={isArabic ? '/assets/support/ProjectDetailView-ar.webp' : '/assets/support/ProjectDetailView.webp'}
              alt={t('projectManagement.content.projectDetailOverview.web.imageAlt')}
              isArabic={isArabic}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'text.secondary',
                fontStyle: 'italic',
                display: 'block',
                textAlign: 'center',
                mt: 1
              }}
            >
              {t('projectManagement.content.projectDetailOverview.web.imageCaption')}
            </Typography>
          </Box>

          {/* Web Project Detail Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.projectDetailOverview.web.overview.title')}
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
              {t('projectManagement.content.projectDetailOverview.web.overview.description')}
            </Typography>

            {/* Project Header Information */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetailOverview.web.header.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.projectDetailOverview.web.header.projectName')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.description')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.creator')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.owners')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.members')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.initiative')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.goal')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.header.dates')}
              </Typography>
            </Box>

            {/* Dashboard Metrics */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetailOverview.web.metrics.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.projectDetailOverview.web.metrics.taskStats')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.metrics.charts')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.metrics.progress')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.metrics.timeline')}
              </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetailOverview.web.tabs.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.projectDetailOverview.web.tabs.overview')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.tasks')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.category')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.milestone')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.members')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.documents')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.workflow')}<br />
                • {t('projectManagement.content.projectDetailOverview.web.tabs.settings')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Mobile Platform Content */}
      {platform === 'mobile' && (
        <Box>
          {/* Mobile Project Detail View Screenshot */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <SupportImage
              src={isArabic ? '/assets/support/projectdetailviewMob-ar.webp' : '/assets/support/projectdetailviewMob.webp'}
              alt={t('projectManagement.content.overview.mobile.imageAlt')}
              isArabic={isArabic}
              maxWidth="300px"
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'text.secondary',
                fontStyle: 'italic',
                display: 'block',
                textAlign: 'center',
                mt: 1
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.imageCaption')}
            </Typography>
          </Box>

          {/* How to Access Mobile Project Detail */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.mobile.howToAccess.title')}
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
              {t('projectManagement.content.overview.mobile.howToAccess.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.overview.mobile.howToAccess.step1')}<br />
                2. {t('projectManagement.content.overview.mobile.howToAccess.step2')}<br />
                3. {t('projectManagement.content.overview.mobile.howToAccess.step3')}<br />
                4. {t('projectManagement.content.overview.mobile.howToAccess.step4')}
              </Typography>
            </Box>
          </Box>

          {/* Mobile Project Detail Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.title')}
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
              {t('projectManagement.content.overview.mobile.projectDetailView.description')}
            </Typography>

        {/* Grid Layout for Mobile Project Detail View Sections */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 3
        }}>
          {/* Project Information Section */}
          <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.feature1')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.feature2')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.feature3')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.feature4')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.projectInfo.feature5')}
            </Typography>
          </Box>

          {/* Navigation Tabs Section */}
          <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.navigationTabs.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.projectDetailView.navigationTabs.feature1')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.navigationTabs.feature2')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.navigationTabs.feature3')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.navigationTabs.feature4')}
            </Typography>
          </Box>

          {/* Team Information Section */}
          <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.teamInfo.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.projectDetailView.teamInfo.feature1')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.teamInfo.feature2')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.teamInfo.feature3')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.teamInfo.feature4')}
            </Typography>
          </Box>

          {/* Tasks Management Section */}
          <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.overview.mobile.projectDetailView.tasksManagement.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.overview.mobile.projectDetailView.tasksManagement.feature1')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.tasksManagement.feature2')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.tasksManagement.feature3')}<br />
              • {t('projectManagement.content.overview.mobile.projectDetailView.tasksManagement.feature4')}
            </Typography>
          </Box>
        </Box>

        {/* Mobile-Optimized Features - Full Width */}
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.3)' }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black',
              pl: 2
            }}
          >
            • {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.feature1')}<br />
            • {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.feature2')}<br />
            • {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.feature3')}<br />
            • {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.feature4')}<br />
            • {t('projectManagement.content.overview.mobile.projectDetailView.mobileFeatures.feature5')}
          </Typography>
        </Box>
      </Box>

      {/* Mobile Interface Features */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.overview.mobile.interfaceFeatures.title')}
        </Typography>

        {/* Interface Layout */}
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              mb: 2
            }}
          >
            {t('projectManagement.content.overview.mobile.interfaceFeatures.layout.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.layout.feature1')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.layout.feature2')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.layout.feature3')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.layout.feature4')}
          </Typography>
        </Box>

        {/* Project Status Management */}
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              mb: 2
            }}
          >
            {t('projectManagement.content.overview.mobile.interfaceFeatures.statusManagement.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.statusManagement.feature1')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.statusManagement.feature2')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.statusManagement.feature3')}<br />
            • {t('projectManagement.content.overview.mobile.interfaceFeatures.statusManagement.feature4')}
          </Typography>
        </Box>

        {/* Overview Tab Content */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.projectDetailOverview.mobile.overviewTab.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              mb: 3
            }}
          >
            {t('projectManagement.content.projectDetailOverview.mobile.overviewTab.description')}
          </Typography>

          {/* Overview Content Image */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <SupportImage
              src={isArabic ? '/assets/support/Overviewcommentmob-ar.webp' : '/assets/support/Overviewcommentmob.webp'}
              alt={t('projectManagement.content.projectDetailOverview.mobile.overviewTab.imageAlt')}
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
              {t('projectManagement.content.projectDetailOverview.mobile.overviewTab.imageCaption')}
            </Typography>
          </Box>

          {/* Mobile Limitation Note */}
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
              {t('projectManagement.content.projectDetailOverview.mobile.overviewTab.limitation.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: '#FF8F00'
              }}
            >
              {t('projectManagement.content.projectDetailOverview.mobile.overviewTab.limitation.description')}
            </Typography>
          </Box>
        </Box>

      </Box>
        </Box>
      )}

    </Box>
  );

  const renderProjectTasksContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.projectTasks.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'text.secondary',
          mb: 4
        }}
      >
        {t('projectManagement.content.projectTasks.introduction')}
      </Typography>

      {/* Web Platform Content */}
      {platform === 'web' && (
        <>
          {/* Project Tasks Interface Images */}
          <SupportImage
            src={isArabic ? "/assets/support/ProjectTaskWeb-ar.webp" : "/assets/support/ProjectTaskWeb.webp"}
            alt={t('projectManagement.content.projectTasks.imageAlt')}
            isArabic={isArabic}
          />

          {/* What are Project Tasks */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.projectTasks.whatAre.title')}
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
              {t('projectManagement.content.projectTasks.whatAre.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.projectTasks.whatAre.feature1')}<br />
                • {t('projectManagement.content.projectTasks.whatAre.feature2')}<br />
                • {t('projectManagement.content.projectTasks.whatAre.feature3')}<br />
                • {t('projectManagement.content.projectTasks.whatAre.feature4')}<br />
                • {t('projectManagement.content.projectTasks.whatAre.feature5')}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Web Platform Content Continued */}
      {platform === 'web' && (
        <>
          {/* Permission Requirements */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.projectTasks.permissions.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              {t('projectManagement.content.projectTasks.permissions.description')}
            </Typography>
          </Box>

          {/* How to Access Project Tasks */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.projectTasks.access.title')}
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
              {t('projectManagement.content.projectTasks.access.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.projectTasks.access.step1')}<br />
                2. {t('projectManagement.content.projectTasks.access.step2')}<br />
                3. {t('projectManagement.content.projectTasks.access.step3')}<br />
                4. {t('projectManagement.content.projectTasks.access.step4')}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Web Platform Content - Task Management Features */}
      {platform === 'web' && (
        <>
          {/* Task Management Features */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.projectTasks.features.title')}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Create Tasks */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.features.create.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.features.create.item1')}<br />
                  • {t('projectManagement.content.projectTasks.features.create.item2')}<br />
                  • {t('projectManagement.content.projectTasks.features.create.item3')}
                </Typography>
              </Box>

              {/* Edit & Update */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.features.edit.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.features.edit.item1')}<br />
                  • {t('projectManagement.content.projectTasks.features.edit.item2')}<br />
                  • {t('projectManagement.content.projectTasks.features.edit.item3')}
                </Typography>
              </Box>

              {/* Task Details */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.features.details.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.features.details.item1')}<br />
                  • {t('projectManagement.content.projectTasks.features.details.item2')}<br />
                  • {t('projectManagement.content.projectTasks.features.details.item3')}
                </Typography>
              </Box>

              {/* Advanced Features */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.features.advanced.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.features.advanced.item1')}<br />
                  • {t('projectManagement.content.projectTasks.features.advanced.item2')}<br />
                  • {t('projectManagement.content.projectTasks.features.advanced.item3')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Link to Main Task Creation Guide */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.projectTasks.taskGuide.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.projectTasks.taskGuide.description')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/support/tasks#task-management')}
            >
              {t('projectManagement.content.projectTasks.taskGuide.linkText')}
            </Typography>
          </Box>
        </>
      )}

      {/* Platform Support */}
      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.projectTasks.platform.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            {t('projectManagement.content.projectTasks.platform.description')}
          </Typography>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.projectTasks.mobile.title')}
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
            {t('projectManagement.content.projectTasks.mobile.description')}
          </Typography>

          {/* Mobile Project Tasks Interface Image */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <SupportImage
              src={isArabic ? '/assets/support/addprojecttaskMob-ar.webp' : '/assets/support/addprojecttaskMob.webp'}
              alt={t('projectManagement.content.projectTasks.mobile.imageAlt')}
              isArabic={isArabic}
              maxWidth="300px"
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'text.secondary',
                fontStyle: 'italic',
                display: 'block',
                textAlign: 'center',
                mt: 1
              }}
            >
              {t('projectManagement.content.projectTasks.mobile.imageCaption')}
            </Typography>
          </Box>

          {/* Mobile Task Management Features */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.projectTasks.mobile.features.title')}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Task Access */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.mobile.features.access.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.mobile.features.access.item1')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.access.item2')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.access.item3')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.access.item4')}
                </Typography>
              </Box>

              {/* Task Creation */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.mobile.features.creation.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.mobile.features.creation.item1')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.creation.item2')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.creation.item3')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.creation.item4')}
                </Typography>
              </Box>

              {/* Task Management */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.mobile.features.management.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.mobile.features.management.item1')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.management.item2')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.management.item3')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.management.item4')}
                </Typography>
              </Box>

              {/* Mobile Interface */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectTasks.mobile.features.interface.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.projectTasks.mobile.features.interface.item1')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.interface.item2')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.interface.item3')}<br />
                  • {t('projectManagement.content.projectTasks.mobile.features.interface.item4')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Complete Task Management Guide */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.projectTasks.mobile.completeGuide.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.projectTasks.mobile.completeGuide.description')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: '#006A67',
                textDecoration: 'underline',
                cursor: 'pointer',
                mb: 2
              }}
              onClick={() => router.push('/support/tasks#task-management')}
            >
              {t('projectManagement.content.projectTasks.mobile.completeGuide.linkText')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: '#006A67',
                fontWeight: 600
              }}
            >
              {t('projectManagement.content.projectTasks.mobile.completeGuide.permission')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderTaskCategoryContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.taskCategory.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'text.secondary',
          mb: 4
        }}
      >
        {t('projectManagement.content.taskCategory.introduction')}
      </Typography>

      {/* Web Platform Content */}
      {platform === 'web' && (
        <>
          {/* Task Category Interface Image */}
          <SupportImage
            src={isArabic ? "/assets/support/taskdetail1-ar.webp" : "/assets/support/taskdetail1.webp"}
            alt={t('projectManagement.content.taskCategory.imageAlt')}
            isArabic={isArabic}
          />

          {/* What is Task Category */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.taskCategory.whatIs.title')}
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
              {t('projectManagement.content.taskCategory.whatIs.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.taskCategory.whatIs.feature1')}<br />
                • {t('projectManagement.content.taskCategory.whatIs.feature2')}<br />
                • {t('projectManagement.content.taskCategory.whatIs.feature3')}<br />
                • {t('projectManagement.content.taskCategory.whatIs.feature4')}<br />
                • {t('projectManagement.content.taskCategory.whatIs.feature5')}
              </Typography>
            </Box>
          </Box>

          {/* How to Select Task Category */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.taskCategory.select.title')}
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
              {t('projectManagement.content.taskCategory.select.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.taskCategory.select.step1')}<br />
                2. {t('projectManagement.content.taskCategory.select.step2')}<br />
                3. {t('projectManagement.content.taskCategory.select.step3')}<br />
                4. {t('projectManagement.content.taskCategory.select.step4')}
              </Typography>
            </Box>
          </Box>

          {/* How to Create New Task Category */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.taskCategory.create.title')}
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
              {t('projectManagement.content.taskCategory.create.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.taskCategory.create.step1')}<br />
                2. {t('projectManagement.content.taskCategory.create.step2')}<br />
                3. {t('projectManagement.content.taskCategory.create.step3')}<br />
                4. {t('projectManagement.content.taskCategory.create.step4')}<br />
                5. {t('projectManagement.content.taskCategory.create.step5')}
              </Typography>
            </Box>
          </Box>

          {/* Task Settings Access */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.taskCategory.settings.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              {t('projectManagement.content.taskCategory.settings.description')}
            </Typography>
          </Box>

          {/* Category Management Features */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.taskCategory.management.title')}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Default Categories */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.taskCategory.management.default.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.taskCategory.management.default.item1')}<br />
                  • {t('projectManagement.content.taskCategory.management.default.item2')}<br />
                  • {t('projectManagement.content.taskCategory.management.default.item3')}
                </Typography>
              </Box>

              {/* Custom Categories */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.taskCategory.management.custom.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • {t('projectManagement.content.taskCategory.management.custom.item1')}<br />
                  • {t('projectManagement.content.taskCategory.management.custom.item2')}<br />
                  • {t('projectManagement.content.taskCategory.management.custom.item3')}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Platform Support */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.taskCategory.platform.title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black'
              }}
            >
              {t('projectManagement.content.taskCategory.platform.description')}
            </Typography>
          </Box>
        </>
      )}



      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.taskCategory.mobile.title')}
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
            {t('projectManagement.content.taskCategory.mobile.description')}
          </Typography>

          {/* Mobile Task Category Interface */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <SupportImage
              src={isArabic ? '/assets/support/projecttaskcateogry-ar.webp' : '/assets/support/projecttaskcateogry.webp'}
              alt={t('projectManagement.content.taskCategory.mobile.imageAlt')}
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
              {t('projectManagement.content.taskCategory.mobile.imageCaption')}
            </Typography>
          </Box>

          {/* Mobile Category Selection */}
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
              {t('projectManagement.content.taskCategory.mobile.selection.title')}
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
              {t('projectManagement.content.taskCategory.mobile.selection.description')}
            </Typography>

            {/* Mobile Selection Steps */}
            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.taskCategory.mobile.selection.process.step1')}<br />
                2. {t('projectManagement.content.taskCategory.mobile.selection.process.step2')}<br />
                3. {t('projectManagement.content.taskCategory.mobile.selection.process.step3')}<br />
                4. {t('projectManagement.content.taskCategory.mobile.selection.process.step4')}<br />
                5. {t('projectManagement.content.taskCategory.mobile.selection.process.step5')}
              </Typography>
            </Box>
          </Box>



          {/* Mobile Limitations */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.3)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#1976D2',
                mb: 1
              }}
            >
              {t('projectManagement.content.taskCategory.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: '#1976D2'
              }}
            >
              {t('projectManagement.content.taskCategory.mobile.limitations.description')}
            </Typography>
          </Box>


        </Box>
      )}
    </Box>
  );

  const renderMilestoneContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.milestone.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'text.secondary',
          mb: 4
        }}
      >
        {t('projectManagement.content.milestone.introduction')}
      </Typography>

      {/* Web Platform Content */}
      {platform === 'web' && (
        <>
          {/* Milestone Interface Overview Image */}
          <SupportImage
            src={isArabic ? "/assets/support/addtaskmilestoneWebinterface-ar.webp" : "/assets/support/addtaskmilestoneWebinterface.webp"}
            alt={t('projectManagement.content.milestone.interfaceImageAlt')}
            isArabic={isArabic}
          />

          {/* What are Milestones */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.milestone.whatAre.title')}
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
              {t('projectManagement.content.milestone.whatAre.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.milestone.whatAre.feature1')}<br />
                • {t('projectManagement.content.milestone.whatAre.feature2')}<br />
                • {t('projectManagement.content.milestone.whatAre.feature3')}<br />
                • {t('projectManagement.content.milestone.whatAre.feature4')}<br />
                • {t('projectManagement.content.milestone.whatAre.feature5')}
              </Typography>
            </Box>
          </Box>

          {/* How to Add Milestone */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.milestone.addMilestone.title')}
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
              {t('projectManagement.content.milestone.addMilestone.description')}
            </Typography>

            <Box sx={{ pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                1. {t('projectManagement.content.milestone.addMilestone.step1')}<br />
                2. {t('projectManagement.content.milestone.addMilestone.step2')}<br />
                3. {t('projectManagement.content.milestone.addMilestone.step3')}<br />
                4. {t('projectManagement.content.milestone.addMilestone.step4')}<br />
                5. {t('projectManagement.content.milestone.addMilestone.step5')}<br />
                6. {t('projectManagement.content.milestone.addMilestone.step6')}
              </Typography>
            </Box>
            {/* Milestone Interface Image */}
            <SupportImage
              src={isArabic ? "/assets/support/addmilestoneWeb-ar.webp" : "/assets/support/addmilestoneWeb.webp"}
              alt={t('projectManagement.content.milestone.imageAlt')}
              isArabic={isArabic}
            />

            {/* Add Milestone Form Image */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3,
                p: 2,
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                borderRadius: 2
              }}
            >
              <img
                src={isArabic ? "/assets/support/addmilestoneform-ar.webp" : "/assets/support/addmilestoneform.webp"}
                alt={t('projectManagement.content.milestone.addFormImageAlt')}
                style={{
                  width: '500px',
                  height: 'auto',
                  borderRadius: '8px'
                }}
              />
            </Box>
          </Box>


      {/* How to Add Tasks to Milestone */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.milestone.addTasks.title')}
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
          {t('projectManagement.content.milestone.addTasks.description')}
        </Typography>

        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            1. {t('projectManagement.content.milestone.addTasks.step1')}<br />
            2. {t('projectManagement.content.milestone.addTasks.step2')}<br />
            3. {t('projectManagement.content.milestone.addTasks.step3')}<br />
            4. {t('projectManagement.content.milestone.addTasks.step4')}<br />
            5. {t('projectManagement.content.milestone.addTasks.step5')}
          </Typography>
        </Box>
      </Box>

      {/* Add Tasks to Milestone Image */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          p: 2,
          backgroundColor: 'rgba(0, 106, 103, 0.1)',
          borderRadius: 2
        }}
      >
        <img
          src={isArabic ? "/assets/support/addtaskmilestoneWeb1-ar.webp" : "/assets/support/addtaskmilestoneWeb1.webp"}
          alt={t('projectManagement.content.milestone.addTasksImageAlt')}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px'
          }}
        />
      </Box>

      {/* Task Selection Interface */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          p: 2,
          backgroundColor: 'rgba(0, 106, 103, 0.1)',
          borderRadius: 2
        }}
      >
        <img
          src={isArabic ? "/assets/support/addtaskmilestoneWeb3-ar.webp" : "/assets/support/addtaskmilestoneWeb3.webp"}
          alt={t('projectManagement.content.milestone.taskSelectionImageAlt')}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px'
          }}
        />
      </Box>

      {/* How to Delete Tasks from Milestone */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.milestone.deleteTasks.title')}
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
          {t('projectManagement.content.milestone.deleteTasks.description')}
        </Typography>

        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            1. {t('projectManagement.content.milestone.deleteTasks.step1')}<br />
            2. {t('projectManagement.content.milestone.deleteTasks.step2')}<br />
            3. {t('projectManagement.content.milestone.deleteTasks.step3')}<br />
            4. {t('projectManagement.content.milestone.deleteTasks.step4')}
          </Typography>
        </Box>

        {/* Delete Task from Milestone Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
            p: 2,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2
          }}
        >
          <img
            src={isArabic ? "/assets/support/deletetaskmilestone-ar.webp" : "/assets/support/deletetaskmilestone.webp"}
            alt={t('projectManagement.content.milestone.deleteTaskImageAlt')}
            style={{
              maxWidth: '300px',
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
        </Box>
      </Box>

      {/* How to Delete Milestone */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.milestone.deleteMilestone.title')}
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
          {t('projectManagement.content.milestone.deleteMilestone.description')}
        </Typography>

        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            1. {t('projectManagement.content.milestone.deleteMilestone.step1')}<br />
            2. {t('projectManagement.content.milestone.deleteMilestone.step2')}<br />
            3. {t('projectManagement.content.milestone.deleteMilestone.step3')}<br />
            4. {t('projectManagement.content.milestone.deleteMilestone.step4')}<br />
            5. {t('projectManagement.content.milestone.deleteMilestone.step5')}
          </Typography>
        </Box>

        {/* Delete Milestone Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
            p: 2,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2
          }}
        >
          <img
            src={isArabic ? "/assets/support/deletemilestone-ar.webp" : "/assets/support/deletemilestone.webp"}
            alt={t('projectManagement.content.milestone.deleteMilestoneImageAlt')}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
        </Box>
      </Box>

      {/* Milestone Management Features */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.milestone.management.title')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Milestone Creation */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.milestone.management.creation.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              • {t('projectManagement.content.milestone.management.creation.item1')}<br />
              • {t('projectManagement.content.milestone.management.creation.item2')}<br />
              • {t('projectManagement.content.milestone.management.creation.item3')}
            </Typography>
          </Box>

          {/* Task Management */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.milestone.management.tasks.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              • {t('projectManagement.content.milestone.management.tasks.item1')}<br />
              • {t('projectManagement.content.milestone.management.tasks.item2')}<br />
              • {t('projectManagement.content.milestone.management.tasks.item3')}
            </Typography>
          </Box>
        </Box>
      </Box>

          {/* Milestone Access Requirements */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.milestone.access.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              {t('projectManagement.content.milestone.access.description')}
            </Typography>
          </Box>

          {/* Platform Support */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.milestone.platform.title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black'
              }}
            >
              {t('projectManagement.content.milestone.platform.description')}
            </Typography>
          </Box>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#D32F2F',
              mb: 3
            }}
          >
            {t('projectManagement.content.milestone.mobile.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: '#D32F2F',
              mb: 2
            }}
          >
            {t('projectManagement.content.milestone.mobile.description')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: '#D32F2F',
              fontWeight: 600
            }}
          >
            {t('projectManagement.content.milestone.mobile.webOnly')}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderFilesDocumentsContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 3
        }}
      >
        {t('projectManagement.content.filesDocuments.title')}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'text.secondary',
          mb: 4
        }}
      >
        {t('projectManagement.content.filesDocuments.introduction')}
      </Typography>

      {/* Web Platform Content */}
      {platform === 'web' && (
        <>
          {/* Project Files Tab Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('projectManagement.content.filesDocuments.filesTab.title')}
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
          {t('projectManagement.content.filesDocuments.filesTab.description')}
        </Typography>

        {/* Files Interface Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            p: 2,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2
          }}
        >
          <img
            src={isArabic ? "/assets/support/projectfolder-ar.webp" : "/assets/support/projectfolder.webp"}
            alt={t('projectManagement.content.filesDocuments.filesImageAlt')}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            • {t('projectManagement.content.filesDocuments.filesTab.feature1')}<br />
            • {t('projectManagement.content.filesDocuments.filesTab.feature2')}<br />
            • {t('projectManagement.content.filesDocuments.filesTab.feature3')}<br />
            • {t('projectManagement.content.filesDocuments.filesTab.feature4')}<br />
            • {t('projectManagement.content.filesDocuments.filesTab.feature5')}
          </Typography>
        </Box>
      </Box>

      {/* Project Documents Tab Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.filesDocuments.documentsTab.title')}
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
          {t('projectManagement.content.filesDocuments.documentsTab.description')}
        </Typography>

        {/* Documents Interface Image */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            p: 2,
            backgroundColor: 'rgba(0, 106, 103, 0.1)',
            borderRadius: 2
          }}
        >
          <img
            src={isArabic ? "/assets/support/projectdocuments-ar.webp" : "/assets/support/projectdocuments.webp"}
            alt={t('projectManagement.content.filesDocuments.documentsImageAlt')}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.6,
              color: 'black'
            }}
          >
            • {t('projectManagement.content.filesDocuments.documentsTab.feature1')}<br />
            • {t('projectManagement.content.filesDocuments.documentsTab.feature2')}<br />
            • {t('projectManagement.content.filesDocuments.documentsTab.feature3')}<br />
            • {t('projectManagement.content.filesDocuments.documentsTab.feature4')}<br />
            • {t('projectManagement.content.filesDocuments.documentsTab.feature5')}
          </Typography>
        </Box>
      </Box>

      {/* Key Differences */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('projectManagement.content.filesDocuments.differences.title')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Files Tab */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.filesDocuments.differences.files.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              • {t('projectManagement.content.filesDocuments.differences.files.item1')}<br />
              • {t('projectManagement.content.filesDocuments.differences.files.item2')}<br />
              • {t('projectManagement.content.filesDocuments.differences.files.item3')}<br />
              • {t('projectManagement.content.filesDocuments.differences.files.item4')}
            </Typography>
          </Box>

          {/* Documents Tab */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                mb: 2
              }}
            >
              {t('projectManagement.content.filesDocuments.differences.documents.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              • {t('projectManagement.content.filesDocuments.differences.documents.item1')}<br />
              • {t('projectManagement.content.filesDocuments.differences.documents.item2')}<br />
              • {t('projectManagement.content.filesDocuments.differences.documents.item3')}<br />
              • {t('projectManagement.content.filesDocuments.differences.documents.item4')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Detailed Documentation Reference */}
      <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            mb: 2
          }}
        >
          {t('projectManagement.content.filesDocuments.detailedDocs.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.6,
            color: 'black',
            mb: 2
          }}
        >
          {t('projectManagement.content.filesDocuments.detailedDocs.description')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.6,
            color: 'black'
          }}
        >
          • {t('projectManagement.content.filesDocuments.detailedDocs.fileManagement')}<br />
          • {t('projectManagement.content.filesDocuments.detailedDocs.documentManagement')}
        </Typography>
      </Box>
        </>
      )}

      {/* Platform Support */}
      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.filesDocuments.platform.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            {t('projectManagement.content.filesDocuments.platform.description')}
          </Typography>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('projectManagement.content.filesDocuments.mobile.title')}
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
            {t('projectManagement.content.filesDocuments.mobile.description')}
          </Typography>

          {/* Project Detail View with Files Tab */}
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
              {t('projectManagement.content.filesDocuments.mobile.projectDetail.title')}
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
              {t('projectManagement.content.filesDocuments.mobile.projectDetail.description')}
            </Typography>

            {/* Project Detail View Image */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <SupportImage
                src={isArabic ? '/assets/support/projectdetailviewMob-ar.webp' : '/assets/support/projectdetailviewMob.webp'}
                alt={t('projectManagement.content.filesDocuments.mobile.projectDetail.imageAlt')}
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
                {t('projectManagement.content.filesDocuments.mobile.projectDetail.imageCaption')}
              </Typography>
            </Box>

            {/* Navigation Steps */}
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
                {t('projectManagement.content.filesDocuments.mobile.projectDetail.steps.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                1. {t('projectManagement.content.filesDocuments.mobile.projectDetail.steps.step1')}<br />
                2. {t('projectManagement.content.filesDocuments.mobile.projectDetail.steps.step2')}<br />
                3. {t('projectManagement.content.filesDocuments.mobile.projectDetail.steps.step3')}
              </Typography>
            </Box>
          </Box>

          {/* File Access & Viewing */}
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
              {t('projectManagement.content.filesDocuments.mobile.fileAccess.title')}
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
              {t('projectManagement.content.filesDocuments.mobile.fileAccess.description')}
            </Typography>

            {/* File Viewing Image */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <SupportImage
                src={isArabic ? '/assets/support/FileFolderMob-ar.webp' : '/assets/support/FileFolderMob.webp'}
                alt={t('projectManagement.content.filesDocuments.mobile.fileAccess.imageAlt')}
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
                {t('projectManagement.content.filesDocuments.mobile.fileAccess.imageCaption')}
              </Typography>
            </Box>

            {/* Mobile File Features */}
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
                {t('projectManagement.content.filesDocuments.mobile.fileAccess.features.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.filesDocuments.mobile.fileAccess.features.viewFiles')}<br />
                • {t('projectManagement.content.filesDocuments.mobile.fileAccess.features.folderNavigation')}<br />
                • {t('projectManagement.content.filesDocuments.mobile.fileAccess.features.fileDetails')}<br />
                • {t('projectManagement.content.filesDocuments.mobile.fileAccess.features.downloadFiles')}
              </Typography>
            </Box>
          </Box>

          {/* Mobile Limitations */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.3)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#1976D2',
                mb: 1
              }}
            >
              {t('projectManagement.content.filesDocuments.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: '#1976D2'
              }}
            >
              {t('projectManagement.content.filesDocuments.mobile.limitations.description')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderCreateProjectContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
        {t('projectManagement.content.createProject.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.createProject.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('projectManagement.content.createProject.mobile.creation.title')}
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
            {t('projectManagement.content.createProject.mobile.creation.description')}
          </Typography>

          {/* Mobile Creation Steps */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.steps.title')}
            </Typography>

            {/* Step 1 */}
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.steps.step1.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.steps.step1.description')}
              </Typography>
            </Box>

            {/* Step 2 */}
            <Box sx={{ mb: 3, pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.steps.step2.title')}
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
                {t('projectManagement.content.createProject.mobile.creation.steps.step2.description')}
              </Typography>

              {/* Project Form Screen 1 */}
              <Box sx={{ mb: 2, pl: 2 }}>
                <SupportImage
                  src={isArabic ? '/assets/support/createprojectmob1-ar.webp' : '/assets/support/createprojectmob1.webp'}
                  alt={t('projectManagement.content.createProject.mobile.creation.steps.step2.image1Alt')}
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
                  {t('projectManagement.content.createProject.mobile.creation.steps.step2.image1Caption')}
                </Typography>
              </Box>

              {/* Project Form Screen 2 */}
              <Box sx={{ mb: 2, pl: 2 }}>
                <SupportImage
                  src={isArabic ? '/assets/support/createprojectmob2-ar.webp' : '/assets/support/createprojectmob2.webp'}
                  alt={t('projectManagement.content.createProject.mobile.creation.steps.step2.image2Alt')}
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
                  {t('projectManagement.content.createProject.mobile.creation.steps.step2.image2Caption')}
                </Typography>
              </Box>
            </Box>

            {/* Step 3 */}
            <Box sx={{ mb: 3, pl: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.steps.step3.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.steps.step3.description')}
              </Typography>
            </Box>
          </Box>

          {/* Department, Goal & Initiative Configuration */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.configuration.title')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.configuration.description')}
            </Typography>

            {/* Department Selection */}
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
                {t('projectManagement.content.createProject.mobile.creation.configuration.department.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.createProject.mobile.creation.configuration.department.defaultValues')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.configuration.department.customCreation')}
              </Typography>
            </Box>

            {/* Goal/Initiative Selection */}
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
                {t('projectManagement.content.createProject.mobile.creation.configuration.goalInitiative.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.createProject.mobile.creation.configuration.goalInitiative.defaultValues')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.configuration.goalInitiative.customCreation')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.configuration.goalInitiative.permissionRequired')}
              </Typography>
            </Box>

            {/* Platform Limitation Note */}
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
                {t('projectManagement.content.createProject.mobile.creation.configuration.platformNote.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: '#FF8F00'
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.configuration.platformNote.description')}
              </Typography>
            </Box>
          </Box>

          {/* Project Color Setup */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: SUPPORT_COLORS.gridBg, borderRadius: 2, border: `1px solid ${SUPPORT_COLORS.gridBorder}` }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.colorSetup.title')}
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
              {t('projectManagement.content.createProject.mobile.creation.colorSetup.description')}
            </Typography>

            {/* Mobile Color Selection Screenshot */}
            <Box sx={{ mb: 3 }}>
              <SupportImage
                src={isArabic ? '/assets/support/projectcolorMob-ar.webp' : '/assets/support/projectcolorMob.webp'}
                alt={t('projectManagement.content.createProject.mobile.creation.colorSetup.mobileImageAlt')}
                isArabic={isArabic}
                maxWidth="300px"
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  display: 'block',
                  textAlign: 'center',
                  mt: 1
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.colorSetup.mobileImageCaption')}
              </Typography>
            </Box>



            {/* Color Selection Features */}
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
                {t('projectManagement.content.createProject.mobile.creation.colorSetup.features.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.createProject.mobile.creation.colorSetup.features.feature1')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.colorSetup.features.feature2')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.colorSetup.features.feature3')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.colorSetup.features.feature4')}
              </Typography>
            </Box>
          </Box>

          {/* Members and Owners Selection */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.membersOwners.title')}
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
              {t('projectManagement.content.createProject.mobile.creation.membersOwners.description')}
            </Typography>

            {/* Select Owners and Members Image */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <SupportImage
                src={isArabic ? '/assets/support/selectOwnersMob-ar.webp' : '/assets/support/selectOwnersMob.webp'}
                alt={t('projectManagement.content.createProject.mobile.selectOwnersImageAlt')}
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
                Mobile interface showing owner and member selection dialog boxes
              </Typography>
            </Box>

            {/* Project Owners Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.membersOwners.owners.title')}
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
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.owners.feature1')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.owners.feature2')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.owners.feature3')}
              </Typography>
            </Box>

            {/* Project Members Section */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.membersOwners.members.title')}
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
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.members.feature1')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.members.feature2')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.members.feature3')}
              </Typography>

              {/* Select Members Image */}
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <SupportImage
                  src={isArabic ? '/assets/support/selectMemberMob-ar.webp' : '/assets/support/selectMemberMob.webp'}
                  alt={t('projectManagement.content.createProject.mobile.creation.selectMembersImageAlt')}
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
                  Mobile interface showing member selection dialog box
                </Typography>
              </Box>
            </Box>

            {/* Dialog Box Features */}
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 1, border: '1px solid rgba(0, 106, 103, 0.3)' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 1
                }}
              >
                {t('projectManagement.content.createProject.mobile.creation.membersOwners.dialogFeatures.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  pl: 2
                }}
              >
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.dialogFeatures.feature1')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.dialogFeatures.feature2')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.dialogFeatures.feature3')}<br />
                • {t('projectManagement.content.createProject.mobile.creation.membersOwners.dialogFeatures.feature4')}
              </Typography>
            </Box>
          </Box>

          {/* Required Fields */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.required.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                pl: 2
              }}
            >
              • {t('projectManagement.content.createProject.mobile.creation.required.field1')}<br />
              • {t('projectManagement.content.createProject.mobile.creation.required.field2')}<br />
              • {t('projectManagement.content.createProject.mobile.creation.required.field3')}<br />
              • {t('projectManagement.content.createProject.mobile.creation.required.field4')}
            </Typography>
          </Box>

          {/* Dropdown Configuration Note */}
          <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#FF8F00',
                mb: 2
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.note.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              {t('projectManagement.content.createProject.mobile.creation.note.description')}
            </Typography>
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <>



          {/* Step-by-Step Guide */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.createProject.steps.title')}
            </Typography>

        {/* Step 1 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.createProject.steps.step1.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
            • {t('projectManagement.content.createProject.steps.step1.item1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 1 }}>
            • {t('projectManagement.content.createProject.steps.step1.item2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 3 }}>
            • {t('projectManagement.content.createProject.steps.step1.item3')}
          </Typography>
          <SupportImage
            src={isArabic ? "/assets/support/ProjectAddWeb-ar.webp" : "/assets/support/ProjectAddWeb.webp"}
            alt={t('projectManagement.content.imageCaptions.projectAddForm')}
            isArabic={isArabic}
            maxWidth="800px"
            caption={t('projectManagement.content.imageCaptions.projectAddForm')}
          />
        </Box>


        {/* Step 2 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.createProject.steps.step2.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.createProject.steps.step2.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.slNo')}:</strong> {t('projectManagement.content.createProject.steps.step2.slNoDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.id')}:</strong> {t('projectManagement.content.createProject.steps.step2.idDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.creator')}:</strong> {t('projectManagement.content.createProject.steps.step2.creatorDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.name')}:</strong> {t('projectManagement.content.createProject.steps.step2.nameDesc')} <strong>({t('projectManagement.content.createProject.steps.step2.required')})</strong>
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.colorCode')}:</strong> {t('projectManagement.content.createProject.steps.step2.colorCodeDesc')}
          </Typography>

          {/* Color Selection Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src={isArabic ? "/assets/support/ProjectColorWeb-ar.webp" : "/assets/support/ProjectColorWeb.webp"}
              alt={t('projectManagement.content.imageCaptions.projectColorSelection')}
              isArabic={isArabic}
              maxWidth="400px"
              caption={t('projectManagement.content.imageCaptions.projectColorSelection')}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.department')}:</strong> {t('projectManagement.content.createProject.steps.step2.departmentDesc')}
          </Typography>

          {/* Department Dropdown Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src={isArabic ? "/assets/support/DepartmentDropWeb-ar.webp" : "/assets/support/DepartmentDropWeb.webp"}
              alt={t('projectManagement.content.imageCaptions.departmentDropdown')}
              isArabic={isArabic}
              maxWidth="300px"
              caption={t('projectManagement.content.imageCaptions.departmentDropdown')}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.dates')}:</strong> {t('projectManagement.content.createProject.steps.step2.datesDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.owners')}:</strong> {t('projectManagement.content.createProject.steps.step2.ownersDesc')}
          </Typography>

          {/* Owners Selection Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src={isArabic ? "/assets/support/AddOwnerWeb-ar.webp" : "/assets/support/AddOwnerWeb.webp"}
              alt={t('projectManagement.content.imageCaptions.addOwners')}
              isArabic={isArabic}
              maxWidth="500px"
              caption={t('projectManagement.content.imageCaptions.addOwners')}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.members')}:</strong> {t('projectManagement.content.createProject.steps.step2.membersDesc')}
          </Typography>

          {/* Members Selection Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src={isArabic ? "/assets/support/AddMemberWeb-ar.webp" : "/assets/support/AddMemberWeb.webp"}
              alt={t('projectManagement.content.imageCaptions.addMembers')}
              isArabic={isArabic}
              maxWidth="500px"
              caption={t('projectManagement.content.imageCaptions.addMembers')}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, fontStyle: 'italic', color: '#666' }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.notification')}:</strong> {t('projectManagement.content.createProject.steps.step2.notificationDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.details')}:</strong> {t('projectManagement.content.createProject.steps.step2.detailsDesc')}
          </Typography>

          {/* Details Configuration Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src={isArabic ? "/assets/support/ProjectDetailWeb-ar.webp" : "/assets/support/ProjectDetailWeb.webp"}
              alt={t('projectManagement.content.imageCaptions.projectDetails')}
              isArabic={isArabic}
              maxWidth="600px"
              caption={t('projectManagement.content.imageCaptions.projectDetails')}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.status')}:</strong> {t('projectManagement.content.createProject.steps.step2.statusDesc')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('projectManagement.content.createProject.steps.step2.actions')}:</strong> {t('projectManagement.content.createProject.steps.step2.actionsDesc')}
          </Typography>

         
        </Box>



        {/* Step 3 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.createProject.steps.step3.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('projectManagement.content.createProject.steps.step5.item1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('projectManagement.content.createProject.steps.step5.item2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
            • {t('projectManagement.content.createProject.steps.step5.item3')}
          </Typography>
        </Box>

        {/* Department, Goal & Initiative Configuration */}
        <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.createProject.configuration.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.createProject.configuration.description')}
          </Typography>

          {/* Department Selection */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.createProject.configuration.department.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, ml: 2 }}>
              • {t('projectManagement.content.createProject.configuration.department.defaultValues')}<br />
              • {t('projectManagement.content.createProject.configuration.department.customCreation')}<br />
              • {t('projectManagement.content.createProject.configuration.department.webOnly')}
            </Typography>
          </Box>

    

         
        </Box>
      </Box>

      


        </>
      )}
    </Box>
  );

  const renderMissionManagementContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
        {t('projectManagement.content.missionManagement.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.missionManagement.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          {/* Mission Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.overview.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                mb: 3
              }}
            >
              {t('projectManagement.content.missionManagement.web.overview.description')}
            </Typography>

            <SupportImage
              src="/assets/support/missionweb.webp"
              alt={t('projectManagement.content.missionManagement.web.overview.imageAlt')}
              isArabic={isArabic}
            />
          </Box>

          {/* Mission vs Project Differences */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.differences.title')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.differences.description')}
            </Typography>

            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.missionManagement.web.differences.duration')}<br />
                • {t('projectManagement.content.missionManagement.web.differences.timeframe')}<br />
                • {t('projectManagement.content.missionManagement.web.differences.urgency')}<br />
                • {t('projectManagement.content.missionManagement.web.differences.scope')}<br />
                • {t('projectManagement.content.missionManagement.web.differences.tracking')}
              </Typography>
            </Box>
          </Box>

          {/* Mission Creation Process */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.creation.title')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.creation.description')}
            </Typography>

            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.missionManagement.web.creation.step1')}<br />
                • {t('projectManagement.content.missionManagement.web.creation.step2')}<br />
                • {t('projectManagement.content.missionManagement.web.creation.step3')}<br />
                • {t('projectManagement.content.missionManagement.web.creation.step4')}<br />
                • {t('projectManagement.content.missionManagement.web.creation.step5')}
              </Typography>
            </Box>
          </Box>

          {/* Mission Management Features */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.features.title')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.web.features.description')}
            </Typography>

            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.missionManagement.web.features.timeTracking')}<br />
                • {t('projectManagement.content.missionManagement.web.features.statusUpdates')}<br />
                • {t('projectManagement.content.missionManagement.web.features.teamAssignment')}<br />
                • {t('projectManagement.content.missionManagement.web.features.progressMonitoring')}<br />
                • {t('projectManagement.content.missionManagement.web.features.reporting')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box>
          {/* Mobile Mission Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.overview.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                mb: 3
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.overview.description')}
            </Typography>

            <SupportImage
              src="/assets/support/mobilemission.webp"
              alt={t('projectManagement.content.missionManagement.mobile.overview.imageAlt')}
              isArabic={isArabic}
              sx={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </Box>

          {/* Mobile Mission Features */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.features.title')}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 2
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.features.description')}
            </Typography>

            <Box sx={{ pl: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                • {t('projectManagement.content.missionManagement.mobile.features.viewMissions')}<br />
                • {t('projectManagement.content.missionManagement.mobile.features.updateStatus')}<br />
                • {t('projectManagement.content.missionManagement.mobile.features.timeTracking')}<br />
                • {t('projectManagement.content.missionManagement.mobile.features.teamView')}<br />
                • {t('projectManagement.content.missionManagement.mobile.features.notifications')}
              </Typography>
            </Box>
          </Box>

          {/* Mobile Limitations */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)', mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'black',
                mb: 1
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black'
              }}
            >
              {t('projectManagement.content.missionManagement.mobile.limitations.description')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderProjectActionsContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
        {t('projectManagement.content.projectActions.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.projectActions.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <>
          {/* Project Actions Menu */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: 'black' }}>
              {t('projectManagement.content.projectActions.actionsMenu.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.actionsMenu.description')}
            </Typography>

            {/* Actions Menu Image */}
            <Box sx={{ mb: 3 }}>
              <SupportImage
                src={isArabic ? "/assets/support/actionActiveWeb-ar.webp" : "/assets/support/actionActiveWeb.webp"}
                alt={t('projectManagement.content.imageCaptions.activeProjectActionsMenu')}
                isArabic={isArabic}
                maxWidth="300px"
                caption={t('projectManagement.content.imageCaptions.activeProjectActionsMenu')}
              />
            </Box>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              <strong>{t('projectManagement.content.projectActions.actionsMenu.edit')}:</strong> {t('projectManagement.content.projectActions.actionsMenu.editDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              <strong>{t('projectManagement.content.projectActions.actionsMenu.archive')}:</strong> {t('projectManagement.content.projectActions.actionsMenu.archiveDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              <strong>{t('projectManagement.content.projectActions.actionsMenu.changeStatus')}:</strong> {t('projectManagement.content.projectActions.actionsMenu.changeStatusDesc')}
            </Typography>
          </Box>

          {/* Edit Project */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: 'black' }}>
              {t('projectManagement.content.projectActions.edit.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.edit.description')}
            </Typography>

            {/* Edit Project Image */}
            <Box sx={{ mb: 3 }}>
              <SupportImage
                src={isArabic ? "/assets/support/projectEditWeb-ar.webp" : "/assets/support/projectEditWeb.webp"}
                alt={t('projectManagement.content.imageCaptions.projectEdit')}
                isArabic={isArabic}
                maxWidth="800px"
                caption={t('projectManagement.content.imageCaptions.projectEdit')}
              />
            </Box>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{t('projectManagement.content.projectActions.edit.howToEdit')}:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.edit.step1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.edit.step2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.edit.step3')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.edit.step4')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {t('projectManagement.content.projectActions.edit.step5')}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{t('projectManagement.content.projectActions.edit.editableFields')}:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field3')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field4')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field5')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field6')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3, ml: 2 }}>
              • {t('projectManagement.content.projectActions.edit.field7')}
            </Typography>

            {/* Permission Note */}
            <Box sx={{ p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 152, 0, 0.2)', mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontWeight: 600, mb: 1, color: '#f57c00' }}>
                {t('projectManagement.content.projectActions.edit.permissionNote.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
                {t('projectManagement.content.projectActions.edit.permissionNote.description')}
              </Typography>
            </Box>
          </Box>

          {/* Archive Project */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: 'black' }}>
              {t('projectManagement.content.projectActions.archive.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.archive.description')}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{t('projectManagement.content.projectActions.archive.howToArchive')}:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.archive.step1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.archive.step2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.archive.step3')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {t('projectManagement.content.projectActions.archive.step4')}
            </Typography>



            {/* Archive Process Images */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2, fontWeight: 600 }}>
                {t('projectManagement.content.projectActions.archive.viewTabs')}:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box>
                  <SupportImage
                    src={isArabic ? "/assets/support/ArchiveWeb1-ar.webp" : "/assets/support/ArchiveWeb1.webp"}
                    alt={t('projectManagement.content.imageCaptions.archiveStep1')}
                    isArabic={isArabic}
                    maxWidth="250px"
                    caption={t('projectManagement.content.imageCaptions.archiveStep1')}
                  />
                </Box>
                <Box>
                  <SupportImage
                    src={isArabic ? "/assets/support/ArchiveWeb2-ar.webp" : "/assets/support/ArchiveWeb2 .webp"}
                    alt={t('projectManagement.content.imageCaptions.archiveStep2')}
                    isArabic={isArabic}
                    maxWidth="300px"
                    caption={t('projectManagement.content.imageCaptions.archiveStep2')}
                  />
                </Box>
              </Box>
            </Box>

            {/* Archived Projects View */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2, fontWeight: 600 }}>
                {t('projectManagement.content.projectActions.archive.archivedView')}:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
                {t('projectManagement.content.projectActions.archive.archivedViewDesc')}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <SupportImage
                  src={isArabic ? "/assets/support/ArchiveViewWeb -ar.webp" : "/assets/support/ArchiveViewWeb .webp"}
                  alt={t('projectManagement.content.imageCaptions.archiveView')}
                  isArabic={isArabic}
                  maxWidth="300px"
                  caption={t('projectManagement.content.imageCaptions.archiveView')}
                />
              </Box>

              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.archive.viewFeature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.archive.viewFeature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.archive.viewFeature3')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
                • {t('projectManagement.content.projectActions.archive.viewFeature4')}
              </Typography>
            </Box>

          </Box>

          {/* Activate Project */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: 'black' }}>
              {t('projectManagement.content.projectActions.activate.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.activate.description')}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{t('projectManagement.content.projectActions.activate.howToActivate')}:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.activate.step1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.activate.step2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.activate.step3')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectActions.activate.step4')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {t('projectManagement.content.projectActions.activate.step5')}
            </Typography>

            {/* Activate Process Images */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2, fontWeight: 600 }}>
                {t('projectManagement.content.projectActions.activate.activateProcess')}:
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Box>
                  <SupportImage
                    src={isArabic ? "/assets/support/actionActiveWeb-ar.webp" : "/assets/support/actionActiveWeb.webp"}
                    alt={t('projectManagement.content.imageCaptions.activateStep1')}
                    isArabic={isArabic}
                    maxWidth="300px"
                    caption={t('projectManagement.content.imageCaptions.activateStep1')}
                  />
                </Box>
                <Box>
                  <SupportImage
                    src={isArabic ? "/assets/support/actionActiveWeb1-ar.webp" : "/assets/support/actionActiveWeb1.webp"}
                    alt={t('projectManagement.content.imageCaptions.activateStep2')}
                    isArabic={isArabic}
                    maxWidth="300px"
                    caption={t('projectManagement.content.imageCaptions.activateStep2')}
                  />
                </Box>
              </Box>
            </Box>

            {/* Active View Tab */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2, fontWeight: 600 }}>
                {t('projectManagement.content.projectActions.activate.activeViewTab')}:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
                {t('projectManagement.content.projectActions.activate.activeViewTabDesc')}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <SupportImage
                  src={isArabic ? "/assets/support/ViewActiveWeb-ar.webp" : "/assets/support/ViewActiveWeb.webp"}
                  alt={t('projectManagement.content.imageCaptions.activeViewTab')}
                  isArabic={isArabic}
                  maxWidth="300px"
                  caption={t('projectManagement.content.imageCaptions.activeViewTab')}
                />
              </Box>

              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.activate.tabFeature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.activate.tabFeature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectActions.activate.tabFeature3')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
                • {t('projectManagement.content.projectActions.activate.tabFeature4')}
              </Typography>
            </Box>

            {/* Archive/Activate Workflow Note */}
            <Box sx={{ p: 3, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.2)', mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontWeight: 600, mb: 2, color: '#388e3c' }}>
                {t('projectManagement.content.projectActions.workflow.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
                {t('projectManagement.content.projectActions.workflow.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                <strong>{t('projectManagement.content.projectActions.workflow.archive')}:</strong> {t('projectManagement.content.projectActions.workflow.archiveDesc')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                <strong>{t('projectManagement.content.projectActions.workflow.activate')}:</strong> {t('projectManagement.content.projectActions.workflow.activateDesc')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
                <strong>{t('projectManagement.content.projectActions.workflow.switching')}:</strong> {t('projectManagement.content.projectActions.workflow.switchingDesc')}
              </Typography>
            </Box>
          </Box>

          {/* Change Status */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: 'black' }}>
              {t('projectManagement.content.projectActions.changeStatus.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.changeStatus.description')}
            </Typography>

            {/* Project Status Interface Image */}
            <Box sx={{ mb: 3 }}>
              <SupportImage
                src={isArabic ? "/assets/support/ProjectStatusWeb-ar.webp" : "/assets/support/ProjectStatusWeb.webp"}
                alt={t('projectManagement.content.imageCaptions.projectStatus')}
                isArabic={isArabic}
                maxWidth="500px"
                caption={t('projectManagement.content.imageCaptions.projectStatus')}
              />
            </Box>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{t('projectManagement.content.projectActions.changeStatus.availableStatuses')}:</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • <strong style={{ color: '#4CAF50' }}>{t('projectManagement.content.projectActions.changeStatus.created')}</strong> - {t('projectManagement.content.projectActions.changeStatus.createdDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • <strong style={{ color: '#2196F3' }}>{t('projectManagement.content.projectActions.changeStatus.started')}</strong> - {t('projectManagement.content.projectActions.changeStatus.startedDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • <strong style={{ color: '#FF9800' }}>{t('projectManagement.content.projectActions.changeStatus.inProgress')}</strong> - {t('projectManagement.content.projectActions.changeStatus.inProgressDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • <strong style={{ color: '#9C27B0' }}>{t('projectManagement.content.projectActions.changeStatus.postpone')}</strong> - {t('projectManagement.content.projectActions.changeStatus.postponeDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
              • <strong style={{ color: '#F44336' }}>{t('projectManagement.content.projectActions.changeStatus.cancelled')}</strong> - {t('projectManagement.content.projectActions.changeStatus.cancelledDesc')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3, ml: 2 }}>
              • <strong style={{ color: '#607D8B' }}>{t('projectManagement.content.projectActions.changeStatus.closed')}</strong> - {t('projectManagement.content.projectActions.changeStatus.closedDesc')}
            </Typography>
          </Box>


        </>
      )}

      {platform === 'mobile' && (
        <Box>
          {/* Mobile Project Actions Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectActions.mobile.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectActions.mobile.description')}
            </Typography>

            {/* Mobile Project Detail Actions Image */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <SupportImage
                src={isArabic ? '/assets/support/projectdetailviewMob-ar.webp' : '/assets/support/projectdetailviewMob.webp'}
                alt={t('projectManagement.content.projectActions.mobile.imageAlt')}
                isArabic={isArabic}
                maxWidth="300px"
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  display: 'block',
                  textAlign: 'center',
                  mt: 1
                }}
              >
                {t('projectManagement.content.projectActions.mobile.imageCaption')}
              </Typography>
            </Box>
          </Box>

          {/* Available Actions */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectActions.mobile.availableActions.title')}
            </Typography>

            {/* Edit Project */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#006A67', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.edit.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.edit.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', pl: 2 }}>
                • {t('projectManagement.content.projectActions.mobile.edit.feature1')}<br />
                • {t('projectManagement.content.projectActions.mobile.edit.feature2')}<br />
                • {t('projectManagement.content.projectActions.mobile.edit.feature3')}<br />
                • {t('projectManagement.content.projectActions.mobile.edit.feature4')}
              </Typography>

              {/* Edit Project Image */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <SupportImage
                  src={isArabic ? '/assets/support/EditProjectMob-ar.webp' : '/assets/support/EditProjectMob.webp'}
                  alt={t('projectManagement.content.projectActions.mobile.edit.imageAlt')}
                  isArabic={isArabic}
                  maxWidth="300px"
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    display: 'block',
                    textAlign: 'center',
                    mt: 1
                  }}
                >
                  {t('projectManagement.content.projectActions.mobile.edit.imageCaption')}
                </Typography>
              </Box>
            </Box>

            {/* Archive Project */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#006A67', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.archive.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.archive.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', pl: 2 }}>
                • {t('projectManagement.content.projectActions.mobile.archive.feature1')}<br />
                • {t('projectManagement.content.projectActions.mobile.archive.feature2')}<br />
                • {t('projectManagement.content.projectActions.mobile.archive.feature3')}
              </Typography>

              {/* Archive Confirmation Image Space */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <SupportImage
                  src={isArabic ? '/assets/support/Archivemob-ar.webp' : '/assets/support/Archivemob.webp'}
                  alt={t('projectManagement.content.projectActions.mobile.archive.confirmationImageAlt')}
                  isArabic={isArabic}
                  maxWidth="250px"
                />
              </Box>
            </Box>

            {/* Status Change */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#006A67', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.statusChange.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', mb: 2 }}>
                {t('projectManagement.content.projectActions.mobile.statusChange.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: 'black', pl: 2 }}>
                • {t('projectManagement.content.projectActions.mobile.statusChange.feature1')}<br />
                • {t('projectManagement.content.projectActions.mobile.statusChange.feature2')}<br />
                • {t('projectManagement.content.projectActions.mobile.statusChange.feature3')}<br />
                • {t('projectManagement.content.projectActions.mobile.statusChange.feature4')}
              </Typography>

              {/* Status Dropdown Image Space */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <SupportImage
                  src={isArabic ? '/assets/support/statusMobProject-ar.webp' : '/assets/support/statusMobProject.webp'}
                  alt={t('projectManagement.content.projectActions.mobile.statusChange.dropdownImageAlt')}
                  isArabic={isArabic}
                  maxWidth="250px"
                />
              </Box>
            </Box>
          </Box>

          {/* Access Instructions */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#FF8F00' }}>
              {t('projectManagement.content.projectActions.mobile.access.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: '#FF8F00', mb: 2 }}>
              {t('projectManagement.content.projectActions.mobile.access.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: '#FF8F00', pl: 2 }}>
              1. {t('projectManagement.content.projectActions.mobile.access.step1')}<br />
              2. {t('projectManagement.content.projectActions.mobile.access.step2')}<br />
              3. {t('projectManagement.content.projectActions.mobile.access.step3')}<br />
              4. {t('projectManagement.content.projectActions.mobile.access.step4')}
            </Typography>
          </Box>

          {/* Permission Note */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: '#D32F2F', mb: 1 }}>
              {t('projectManagement.content.projectActions.mobile.permissions.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, color: '#D32F2F' }}>
              {t('projectManagement.content.projectActions.mobile.permissions.description')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderProjectDetailsContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
        {t('projectManagement.content.projectDetails.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.projectDetails.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box>
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.mobile.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              {t('projectManagement.content.projectDetails.mobile.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectDetails.mobile.feature1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectDetails.mobile.feature2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('projectManagement.content.projectDetails.mobile.feature3')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              • {t('projectManagement.content.projectDetails.mobile.feature4')}
            </Typography>
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <>
          {/* Viewing Project Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
              {t('projectManagement.content.projectDetails.viewing.title')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 2 }}>
              {t('projectManagement.content.projectDetails.viewing.description')}
            </Typography>

            <Box sx={{ ml: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectDetails.viewing.step1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectDetails.viewing.step2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
                • {t('projectManagement.content.projectDetails.viewing.step3')}
              </Typography>
            </Box>
          </Box>

          {/* Dashboard Tab - Detailed View */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
              {t('projectManagement.content.projectDetails.dashboard.title')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectDetails.dashboard.description')}
            </Typography>

            {/* Project Detail View Image */}
            <Box
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                p: 2
              }}
            >
              <img
                src={isArabic ? '/assets/support/ProjectDetailView-ar.webp' : '/assets/support/ProjectDetailView.webp'}
                alt={t('projectManagement.content.projectDetails.dashboard.imageAlt')}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
            </Box>

            {/* Project Header Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.header.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.header.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.name')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.nameDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.projectDescription')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.projectDescriptionDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.it')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.itDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.creator')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.creatorDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.owners')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.ownersDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.header.members')}:</strong> {t('projectManagement.content.projectDetails.dashboard.header.membersDesc')}
                </Typography>
              </Box>
            </Box>

            {/* Key Metrics Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.metrics.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.metrics.description')}
              </Typography>

              <Box sx={{ pl: 2, mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.initiative')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.initiativeDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.goal')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.goalDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.client')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.clientDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.milestone')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.milestoneDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.startDate')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.startDateDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.metrics.endDate')}:</strong> {t('projectManagement.content.projectDetails.dashboard.metrics.endDateDesc')}
                </Typography>
              </Box>
            </Box>



            {/* Task Statistics */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.taskStats.title')}
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
                {t('projectManagement.content.projectDetails.dashboard.taskStats.description')}
              </Typography>



              {/* Task Count Cards */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.description')}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    • <strong>{t('projectManagement.content.projectDetails.dashboard.taskStats.cards.inProgress')}:</strong> {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.inProgressDesc')}<br />
                    • <strong>{t('projectManagement.content.projectDetails.dashboard.taskStats.cards.completed')}:</strong> {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.completedDesc')}<br />
                    • <strong>{t('projectManagement.content.projectDetails.dashboard.taskStats.cards.submitted')}:</strong> {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.submittedDesc')}<br />
                    • <strong>{t('projectManagement.content.projectDetails.dashboard.taskStats.cards.onHold')}:</strong> {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.onHoldDesc')}<br />
                    • <strong>{t('projectManagement.content.projectDetails.dashboard.taskStats.cards.notStarted')}:</strong> {t('projectManagement.content.projectDetails.dashboard.taskStats.cards.notStartedDesc')}
                  </Typography>
                </Box>
              </Box>

              {/* Task Chart */}
              <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.title')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 2
                  }}
                >
                  {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.description')}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    • {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.feature1')}<br />
                    • {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.feature2')}<br />
                    • {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.feature3')}<br />
                    • {t('projectManagement.content.projectDetails.dashboard.taskStats.chart.feature4')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* My Project Tasks Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.myTasks.title')}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.myTasks.description')}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.projectDetails.dashboard.myTasks.list.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.projectDetails.dashboard.myTasks.list.description')}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 600,
                      color: '#006A67',
                      mb: 1
                    }}
                  >
                    {t('projectManagement.content.projectDetails.dashboard.myTasks.chart.title')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'Montserrat, sans-serif',
                      lineHeight: 1.6,
                      color: 'black'
                    }}
                  >
                    {t('projectManagement.content.projectDetails.dashboard.myTasks.chart.description')}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Additional Metrics */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('projectManagement.content.projectDetails.dashboard.additionalMetrics.title')}
              </Typography>

              <Box sx={{ pl: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.additionalMetrics.totalCost')}:</strong> {t('projectManagement.content.projectDetails.dashboard.additionalMetrics.totalCostDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.additionalMetrics.duration')}:</strong> {t('projectManagement.content.projectDetails.dashboard.additionalMetrics.durationDesc')}<br />
                  • <strong>{t('projectManagement.content.projectDetails.dashboard.additionalMetrics.closure')}:</strong> {t('projectManagement.content.projectDetails.dashboard.additionalMetrics.closureDesc')}
                </Typography>
              </Box>
            </Box>


          </Box>

      {/* Project Details Tabs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
          {t('projectManagement.content.projectDetails.tabs.title')}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {/* Profile Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.profile.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.profile.description')}
            </Typography>
          </Box>

          {/* Tasks Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.tasks.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.tasks.description')}
            </Typography>
          </Box>

          {/* Category Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.category.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.category.description')}
            </Typography>
          </Box>

          {/* Milestone Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.milestone.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.milestone.description')}
            </Typography>
          </Box>

          {/* Members Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.members.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.members.description')}
            </Typography>
          </Box>

          {/* Documents Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.documents.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.documents.description')}
            </Typography>
          </Box>

          {/* Workflow Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.workflow.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.workflow.description')}
            </Typography>
          </Box>

          {/* Settings Tab */}
          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.settings.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
              {t('projectManagement.content.projectDetails.tabs.settings.description')}
            </Typography>
          </Box>

          {/* Overview Tab */}
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1, color: '#006A67' }}>
              {t('projectManagement.content.projectDetails.tabs.overview.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              {t('projectManagement.content.projectDetails.tabs.overview.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, pl: 2 }}>
              • {t('projectManagement.content.projectDetails.tabs.overview.feature1')}<br />
              • {t('projectManagement.content.projectDetails.tabs.overview.feature2')}<br />
              • {t('projectManagement.content.projectDetails.tabs.overview.feature3')}<br />
              • {t('projectManagement.content.projectDetails.tabs.overview.feature4')}<br />
              • {t('projectManagement.content.projectDetails.tabs.overview.reference')}
            </Typography>
          </Box>
        </Box>
      </Box>
        </>
      )}
    </Box>
  );


  const renderProjectSettingsContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
        {t('projectManagement.content.projectSettings.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.projectSettings.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <>
          {/* Project Goals Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectSettings.goals.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectSettings.goals.description')}
            </Typography>

            <Box
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                p: 2
              }}
            >
              <img
                src={isArabic ? '/assets/support/projectgoalWeb-ar.webp' : '/assets/support/projectgoalWeb.webp'}
                alt={t('projectManagement.content.projectSettings.goals.imageAlt')}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.goals.feature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.goals.feature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.goals.feature3')}
              </Typography>
            </Box>
          </Box>

          {/* Project Initiative Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectSettings.initiatives.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectSettings.initiatives.description')}
            </Typography>

            <Box
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                p: 2
              }}
            >
              <img
                src={isArabic ? '/assets/support/projectintiative-ar.webp' : '/assets/support/projectintiative.webp'}
                alt={t('projectManagement.content.projectSettings.initiatives.imageAlt')}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.initiatives.feature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.initiatives.feature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.initiatives.feature3')}
              </Typography>
            </Box>
          </Box>

          {/* View All Project Permission Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectSettings.viewPermission.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectSettings.viewPermission.description')}
            </Typography>

            <Box
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                p: 2
              }}
            >
              <img
                src={isArabic ? '/assets/support/viewproject-ar.webp' : '/assets/support/viewproject.webp'}
                alt={t('projectManagement.content.projectSettings.viewPermission.imageAlt')}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.viewPermission.feature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.viewPermission.feature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.viewPermission.feature3')}
              </Typography>
            </Box>
          </Box>

          {/* Create Project Permission Tab */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3, color: '#006A67' }}>
              {t('projectManagement.content.projectSettings.createPermission.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 3 }}>
              {t('projectManagement.content.projectSettings.createPermission.description')}
            </Typography>

            <Box
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.1)',
                p: 2
              }}
            >
              <img
                src={isArabic ? '/assets/support/projectaipermission-ar.webp' : '/assets/support/projectaipermission.webp'}
                alt={t('projectManagement.content.projectSettings.createPermission.imageAlt')}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.createPermission.feature1')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.createPermission.feature2')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
                • {t('projectManagement.content.projectSettings.createPermission.feature3')}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.projectSettings.mobile.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
            {t('projectManagement.content.projectSettings.mobile.description')}
          </Typography>
        </Box>
      )}
    </Box>
  );









  const renderSettingsContent = () => (
    <Box>
      <Typography variant="h4" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
        {t('projectManagement.content.settings.title')}
      </Typography>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.7, mb: 4 }}>
        {t('projectManagement.content.settings.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'mobile' && (
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.mobile.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.mobile.description')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
            • {t('projectManagement.content.settings.mobile.feature1')}
          </Typography>
        </Box>
      )}

      {platform === 'web' && (
        <>
          {/* Accessing Settings */}
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.1)' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
          {t('projectManagement.content.settings.accessing.title')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.accessing.step1')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.accessing.step2')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
          • {t('projectManagement.content.settings.accessing.step3')}
        </Typography>
      </Box>

      {/* Settings Tabs */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
          {t('projectManagement.content.settings.tabs.title')}
        </Typography>

        {/* Goals Tab */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.tabs.goals.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.tabs.goals.description')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.goals.actions.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2, mb: 2 }}>
            • {t('projectManagement.content.settings.tabs.goals.actions.create')}<br />
            • {t('projectManagement.content.settings.tabs.goals.actions.edit')}<br />
            • {t('projectManagement.content.settings.tabs.goals.actions.delete')}<br />
            • {t('projectManagement.content.settings.tabs.goals.actions.view')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.goals.howTo.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2 }}>
            1. {t('projectManagement.content.settings.tabs.goals.howTo.step1')}<br />
            2. {t('projectManagement.content.settings.tabs.goals.howTo.step2')}<br />
            3. {t('projectManagement.content.settings.tabs.goals.howTo.step3')}<br />
            4. {t('projectManagement.content.settings.tabs.goals.howTo.step4')}
          </Typography>
        </Box>

        {/* Initiatives Tab */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.tabs.initiatives.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.tabs.initiatives.description')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.initiatives.actions.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2, mb: 2 }}>
            • {t('projectManagement.content.settings.tabs.initiatives.actions.create')}<br />
            • {t('projectManagement.content.settings.tabs.initiatives.actions.edit')}<br />
            • {t('projectManagement.content.settings.tabs.initiatives.actions.delete')}<br />
            • {t('projectManagement.content.settings.tabs.initiatives.actions.view')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.initiatives.howTo.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2 }}>
            1. {t('projectManagement.content.settings.tabs.initiatives.howTo.step1')}<br />
            2. {t('projectManagement.content.settings.tabs.initiatives.howTo.step2')}<br />
            3. {t('projectManagement.content.settings.tabs.initiatives.howTo.step3')}<br />
            4. {t('projectManagement.content.settings.tabs.initiatives.howTo.step4')}
          </Typography>
        </Box>

        {/* Task Types Tab */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.tabs.taskTypes.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.tabs.taskTypes.description')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.taskTypes.actions.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2, mb: 2 }}>
            • {t('projectManagement.content.settings.tabs.taskTypes.actions.create')}<br />
            • {t('projectManagement.content.settings.tabs.taskTypes.actions.edit')}<br />
            • {t('projectManagement.content.settings.tabs.taskTypes.actions.delete')}<br />
            • {t('projectManagement.content.settings.tabs.taskTypes.actions.assign')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.taskTypes.examples.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2 }}>
            • {t('projectManagement.content.settings.tabs.taskTypes.examples.ex1')}<br />
            • {t('projectManagement.content.settings.tabs.taskTypes.examples.ex2')}<br />
            • {t('projectManagement.content.settings.tabs.taskTypes.examples.ex3')}
          </Typography>
        </Box>

        {/* View All Tab */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.tabs.viewAll.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.tabs.viewAll.description')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.viewAll.actions.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2, mb: 2 }}>
            • {t('projectManagement.content.settings.tabs.viewAll.actions.grant')}<br />
            • {t('projectManagement.content.settings.tabs.viewAll.actions.revoke')}<br />
            • {t('projectManagement.content.settings.tabs.viewAll.actions.view')}<br />
            • {t('projectManagement.content.settings.tabs.viewAll.actions.search')}
          </Typography>

          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 1, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>{t('projectManagement.content.settings.tabs.viewAll.note.title')}:</strong> {t('projectManagement.content.settings.tabs.viewAll.note.description')}
            </Typography>
          </Box>
        </Box>

        {/* Create Project Tab */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 106, 103, 0.03)', borderRadius: 2, borderLeft: '4px solid #006A67' }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
            {t('projectManagement.content.settings.tabs.createProject.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('projectManagement.content.settings.tabs.createProject.description')}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 1 }}>
            {t('projectManagement.content.settings.tabs.createProject.actions.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem', ml: 2, mb: 2 }}>
            • {t('projectManagement.content.settings.tabs.createProject.actions.grant')}<br />
            • {t('projectManagement.content.settings.tabs.createProject.actions.revoke')}<br />
            • {t('projectManagement.content.settings.tabs.createProject.actions.view')}<br />
            • {t('projectManagement.content.settings.tabs.createProject.actions.manage')}
          </Typography>

          <Box sx={{ p: 2, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 1, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, fontSize: '0.9rem' }}>
              <strong>{t('projectManagement.content.settings.tabs.createProject.tip.title')}:</strong> {t('projectManagement.content.settings.tabs.createProject.tip.description')}
            </Typography>
          </Box>
        </Box>
      </Box>



      {/* Best Practices */}
      <Box sx={{ p: 3, backgroundColor: 'rgba(0, 106, 103, 0.1)', borderRadius: 2, border: '1px solid rgba(0, 106, 103, 0.2)' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, color: '#006A67' }}>
          {t('projectManagement.content.settings.bestPractices.title')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.bestPractices.tip1')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.bestPractices.tip2')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.bestPractices.tip3')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.bestPractices.tip4')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
          • {t('projectManagement.content.settings.bestPractices.tip5')}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6 }}>
          • {t('projectManagement.content.settings.bestPractices.tip6')}
        </Typography>
      </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: '#006A67',
            '&:hover': { bgcolor: 'rgba(0, 106, 103, 0.1)' }
          }}
        >
          <Iconify icon="solar:hamburger-menu-bold" width={24} />
        </IconButton>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontFamily: 'Montserrat, sans-serif',
            flex: 1
          }}
        >
          {currentItem?.title || t('projectManagement.title')}
        </Typography>

        {/* Platform Toggle */}
        <ToggleButtonGroup
          value={platform}
          exclusive
          onChange={(_, newPlatform) => {
            if (newPlatform !== null) {
              setPlatform(newPlatform);
            }
          }}
          size="small"
          sx={{
            display: { xs: 'none', sm: 'flex' },
            '& .MuiToggleButton-root': {
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: '0.75rem',
              px: 2,
              '&.Mui-selected': {
                bgcolor: '#006A67',
                color: 'white',
                '&:hover': {
                  bgcolor: '#005A57',
                },
              },
            },
          }}
        >
          <ToggleButton value="web">
            <Iconify icon="solar:monitor-bold" width={16} sx={{ mr: 0.5 }} />
            {t('projectManagement.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 0.5 }} />
            {t('projectManagement.mobile')}
          </ToggleButton>
        </ToggleButtonGroup>


      </Box>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        anchor={isArabic ? 'right' : 'left'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {renderSidebar}
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumb */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: '#006A67' }
            }}
            onClick={() => router.push('/support/getting-started')}
          >
            {t('projectManagement.breadcrumb.support')}
          </Typography>
          <Iconify icon={isArabic ? "solar:alt-arrow-left-bold" : "solar:alt-arrow-right-bold"} width={16} />
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#006A67',
              fontWeight: 600
            }}
          >
            {t('projectManagement.title')}
          </Typography>
          {currentItem && (
            <>
              <Iconify icon={isArabic ? "solar:alt-arrow-left-bold" : "solar:alt-arrow-right-bold"} width={16} />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                {currentItem.title}
              </Typography>
            </>
          )}
        </Box>

        {/* Content */}
        {renderContent()}
      </Container>
    </Box>
  );
}
