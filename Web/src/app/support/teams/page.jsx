'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Iconify } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';
import { SUPPORT_COLORS } from '../components/common-sidebar-layout';

// ----------------------------------------------------------------------

const SIDEBAR_WIDTH = 280;



// ----------------------------------------------------------------------

export default function TeamsPage() {
  const { t,i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';
  const getTeamsNavigationItems = (t) => [
  {
    id: 'overview',
    title: t('teams.navigation.overview.title'),
    icon: 'solar:users-group-two-rounded-bold',
    description: t('teams.navigation.overview.description'),
    keywords: ['teams', 'overview', 'introduction', 'module', 'dashboard', 'interface', 'list view', 'grid view', 'search', 'filter', 'export', 'reports', 'team management', 'user management', 'employee management', 'staff', 'members', 'organization', 'organizational chart', 'hierarchy', 'structure', 'controls', 'navigation', 'getting started']
  },

  {
    id: 'add-member',
    title: t('teams.navigation.addMember.title'),
    icon: 'solar:user-plus-bold',
    description: t('teams.navigation.addMember.description'),
    keywords: ['add', 'adding', 'new', 'team', 'members', 'users', 'employees', 'staff', 'create', 'register', 'signup', 'onboard', 'onboarding', 'user details', 'personal information', 'contact', 'phone', 'email', 'branch', 'department', 'role', 'permissions', 'organizational chart', 'hierarchy', 'plus icon', 'dialog box', 'form', 'fields', 'blank field', 'existing users', 'general members']
  },
  {
    id: 'edit-member',
    title: t('teams.navigation.editMember.title'),
    icon: 'solar:settings-bold',
    description: t('teams.navigation.editMember.description'),
    keywords: ['edit', 'editing', 'manage', 'managing', 'modify', 'update', 'change', 'deactivate', 'delete', 'remove', 'actions', 'menu', 'three dots', 'user management', 'employee management', 'staff management', 'profile', 'details', 'information', 'status', 'active', 'inactive', 'external', 'list view', 'grid view', 'bulk operations', 'hierarchy', 'organizational chart']
  },
  {
    id: 'user-types',
    title: t('teams.navigation.userTypes.title'),
    icon: 'solar:users-group-rounded-bold',
    description: t('teams.navigation.userTypes.description'),
    keywords: ['user', 'types', 'internal', 'external', 'employee', 'staff', 'contractor', 'vendor', 'guest', 'temporary', 'permanent', 'classification', 'category', 'access', 'permissions', 'roles', 'status', 'membership', 'organization', 'team structure']
  },
  {
    id: 'permissions',
    title: t('teams.navigation.permissions.title'),
    icon: 'solar:shield-user-bold',
    description: t('teams.navigation.permissions.description'),
    keywords: ['roles', 'permissions', 'role', 'permission', 'access', 'control', 'security', 'assign', 'unassign', 'edit', 'delete', 'manage', 'custom', 'new role', 'create', 'modify', 'update', 'bulk', 'select all', 'individual', 'categories', 'modules', 'accounting', 'task', 'search', 'filter', 'authorization', 'privileges', 'access levels', 'hradmin', 'admin', 'manager', 'employee', 'settings', 'tab']
  },
  {
    id: 'profiles',
    title: t('teams.navigation.profiles.title'),
    icon: 'solar:user-id-bold',
    description: t('teams.navigation.profiles.description'),
    keywords: ['profile', 'profiles', 'user profile', 'team profiles', 'personal information', 'view profile', 'my profile', 'subordinates', 'reporting', 'team members', 'hierarchy', 'dashboard', 'statistics', 'performance', 'tasks', 'projects', 'individual', 'details', 'contact', 'information', 'role', 'department', 'status', 'analytics', 'metrics', 'overview', 'navigation', 'tabs']
  },
  {
    id: 'departments',
    title: t('teams.navigation.departments.title'),
    icon: 'solar:buildings-bold',
    description: t('teams.navigation.departments.description'),
    keywords: ['departments', 'department', 'manage', 'organizing', 'organization', 'structure', 'branches', 'branch', 'locations', 'add', 'create', 'edit', 'delete', 'modify', 'update', 'IT', 'procurement', 'production', 'sales', 'finance', 'HR', 'human resources', 'default', 'custom', 'bilingual', 'english', 'arabic', 'filter', 'conditional', 'settings', 'tab']
  },
  {
    id: 'designations',
    title: t('teams.navigation.designations.title'),
    icon: 'solar:user-id-bold',
    description: t('teams.navigation.designations.description'),
    keywords: ['designations', 'designation', 'job', 'titles', 'positions', 'roles', 'manage', 'add', 'create', 'edit', 'delete', 'modify', 'update', 'CEO', 'manager', 'director', 'admin', 'employee', 'technician', 'receptionist', 'accountant', 'secretary', 'HR manager', 'finance manager', 'general manager', 'super admin', 'managing director', 'quality control specialist', 'bilingual', 'english', 'arabic', 'employee count', 'settings', 'tab']
  },
  {
    id: 'employee-statuses',
    title: t('teams.navigation.employeeStatuses.title'),
    icon: 'solar:user-check-bold',
    description: t('teams.navigation.employeeStatuses.description'),
    keywords: ['employee', 'statuses', 'status', 'work', 'availability', 'manage', 'add', 'create', 'edit', 'delete', 'modify', 'update', 'break', 'available', 'vacation', 'offline', 'on duty', 'busy', 'away', 'online', 'color', 'coding', 'bilingual', 'english', 'arabic', 'dropdown', 'selection', 'team coordination', 'communication', 'settings', 'tab', 'استراحة', 'متاح', 'في إجازة', 'غير متصل']
  },
  {
    id: 'team-notices',
    title: t('teams.navigation.teamNotices.title'),
    icon: 'solar:notification-unread-bold',
    description: t('teams.navigation.teamNotices.description'),
    keywords: ['team', 'notices', 'notice', 'communication', 'announcements', 'messages', 'dashboard', 'welcome', 'create', 'add', 'edit', 'delete', 'modify', 'update', 'bilingual', 'english', 'arabic', 'motivational', 'important', 'policy', 'updates', 'celebrations', 'seasonal', 'greetings', 'dialog', 'save', 'cancel', 'permissions', 'settings', 'tab', 'notification', 'alert', 'broadcast']
  }
];
  const [selectedSection, setSelectedSection] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [platform, setPlatform] = useState('web');
  const router = useRouter();

  // Filter navigation items based on platform
  const teamsNavigationItems = getTeamsNavigationItems(t);
  const filteredNavigationItems = teamsNavigationItems
    .filter(item => !item.webOnly || platform === 'web');

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setDrawerOpen(false);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };



  const currentItem = teamsNavigationItems.find(item => item.id === selectedSection);

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
          {t('teams.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {t('teams.subtitle')}
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
          {t('teams.selectPlatform')}
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
            {t('teams.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 1 }} />
            {t('teams.mobile')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Navigation List */}
      <List sx={{ p: 2 }}>
        {filteredNavigationItems.map((item) => (
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
        ))}
      </List>
    </Box>
  );

  const renderOverviewContent = () => (
    <Box>
      {platform === 'mobile' ? (
        // Mobile Teams Overview
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
            {t('teams.content.overview.mobile.title')}
          </Typography>

       
        
               {/* Mobile Teams Screenshot */}
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: SUPPORT_COLORS.imageBg,
                p: 2,
                mb: 3,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <img
               src={isArabic ? "/assets/support/teamsdasboardMob-ar.webp" : "/assets/support/teamsdasboardMob.webp"}

               
                alt={t('teams.content.overview.altTexts.mobileTeamsDashboard')}
                style={{
                  maxWidth: '300px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block'
                }}
              />
            </Box>

          {/* Mobile Teams Dashboard Interface */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: '#006A67',
                mb: 3
              }}
            >
               {t('teams.content.overview.mobile.dashboardInterface.title')}
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
              {t('teams.content.overview.mobile.dashboardInterface.description')}
            </Typography>

            {/* Grid Layout for Interface Components */}
            <Box sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                lg: '1fr 1fr'
              }
            }}>
              {/* Top Navigation Bar */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                   {t('teams.content.interface.topNavigationBar.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.interface.topNavigationBar.profilePicture')}</strong> {t('teams.content.interface.topNavigationBar.profilePictureDesc')}<br/>
                  • <strong>{t('teams.content.interface.topNavigationBar.navigationIcons')}</strong> {t('teams.content.interface.topNavigationBar.navigationIconsDesc')}<br/>
                  • <strong>{t('teams.content.interface.topNavigationBar.statusIndicator')}</strong> {t('teams.content.interface.topNavigationBar.statusIndicatorDesc')}
                </Typography>
              </Card>

              {/* Search and Filter Section */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                   {t('teams.content.interface.searchFilterSection.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.interface.searchFilterSection.searchEmployee')}</strong> {t('teams.content.interface.searchFilterSection.searchEmployeeDesc')}<br/>
                  • <strong>{t('teams.content.interface.searchFilterSection.filterIcons')}</strong> {t('teams.content.interface.searchFilterSection.filterIconsDesc')}<br/>
                  • <strong>{t('teams.content.interface.searchFilterSection.statusDisplay')}</strong> {t('teams.content.interface.searchFilterSection.statusDisplayDesc')}
                </Typography>
              </Card>

              {/* Team Members List */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                   {t('teams.content.interface.teamMembersList.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.interface.teamMembersList.profileAvatars')}</strong> {t('teams.content.interface.teamMembersList.profileAvatarsDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.employeeNames')}</strong> {t('teams.content.interface.teamMembersList.employeeNamesDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.jobTitles')}</strong> {t('teams.content.interface.teamMembersList.jobTitlesDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.contactInfo')}</strong> {t('teams.content.interface.teamMembersList.contactInfoDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.employeeNumbers')}</strong> {t('teams.content.interface.teamMembersList.employeeNumbersDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.deviceInfo')}</strong> {t('teams.content.interface.teamMembersList.deviceInfoDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.statusBadges')}</strong> {t('teams.content.interface.teamMembersList.statusBadgesDesc')}<br/>
                  • <strong>{t('teams.content.interface.teamMembersList.adminIndicators')}</strong> {t('teams.content.interface.teamMembersList.adminIndicatorsDesc')}
                </Typography>
              </Card>

              {/* Bottom Navigation */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                   {t('teams.content.interface.bottomNavigationBar.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.interface.bottomNavigationBar.tasks')}</strong> {t('teams.content.interface.bottomNavigationBar.tasksDesc')}<br/>
                  • <strong>{t('teams.content.interface.bottomNavigationBar.team')}</strong> {t('teams.content.interface.bottomNavigationBar.teamDesc')}<br/>
                  • <strong>{t('teams.content.interface.bottomNavigationBar.projects')}</strong> {t('teams.content.interface.bottomNavigationBar.projectsDesc')}<br/>
                  • <strong>{t('teams.content.interface.bottomNavigationBar.clients')}</strong> {t('teams.content.interface.bottomNavigationBar.clientsDesc')}<br/>
                  • <strong>{t('teams.content.interface.bottomNavigationBar.vendors')}</strong> {t('teams.content.interface.bottomNavigationBar.vendorsDesc')}
                </Typography>
              </Card>
            </Box>
          </Paper>

          {/* Mobile Team Filter Interface */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: '#006A67',
                mb: 3
              }}
            >
              {t('teams.content.overview.mobile.filterInterface.title')}
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
              {t('teams.content.overview.mobile.filterInterface.description')}
            </Typography>

            {/* Mobile Team Filter Image */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                p: 2,
                bgcolor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box
                component="img"
                src={isArabic ? "/assets/support/teamfilterMob-ar.webp" : "/assets/support/teamfilterMob.webp"}
               
                alt={t('teams.content.overview.altTexts.mobileTeamFilter')}
                sx={{
                  maxWidth: '400px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            {/* Filter Interface Components */}
            <Box sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                lg: '1fr 1fr'
              }
            }}>
              {/* Filter Modal Header */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.filterInterface.filterModalHeader.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.filterInterface.filterModalHeader.resetButton')}</strong> {t('teams.content.filterInterface.filterModalHeader.resetButtonDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterModalHeader.titleDisplay')}</strong> {t('teams.content.filterInterface.filterModalHeader.titleDisplayDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterModalHeader.doneButton')}</strong> {t('teams.content.filterInterface.filterModalHeader.doneButtonDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterModalHeader.modalDesign')}</strong> {t('teams.content.filterInterface.filterModalHeader.modalDesignDesc')}
                </Typography>
              </Card>

              {/* Department Filter Section */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.filterInterface.departmentFilterOptions.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.itDepartment')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.itDepartmentDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.procurement')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.procurementDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.production')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.productionDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.sales')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.salesDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.finance')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.financeDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.departmentFilterOptions.multipleSelection')}</strong> {t('teams.content.filterInterface.departmentFilterOptions.multipleSelectionDesc')}
                </Typography>
              </Card>

              {/* Filter Functionality */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.filterInterface.filterFunctionality.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.filterInterface.filterFunctionality.realTimeFiltering')}</strong> {t('teams.content.filterInterface.filterFunctionality.realTimeFilteringDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterFunctionality.visualFeedback')}</strong> {t('teams.content.filterInterface.filterFunctionality.visualFeedbackDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterFunctionality.countDisplay')}</strong> {t('teams.content.filterInterface.filterFunctionality.countDisplayDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.filterFunctionality.easyReset')}</strong> {t('teams.content.filterInterface.filterFunctionality.easyResetDesc')}
                </Typography>
              </Card>

              {/* User Experience */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.filterInterface.userExperience.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.filterInterface.userExperience.touchFriendly')}</strong> {t('teams.content.filterInterface.userExperience.touchFriendlyDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.userExperience.smoothAnimation')}</strong> {t('teams.content.filterInterface.userExperience.smoothAnimationDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.userExperience.backgroundOverlay')}</strong> {t('teams.content.filterInterface.userExperience.backgroundOverlayDesc')}<br/>
                  • <strong>{t('teams.content.filterInterface.userExperience.quickAccess')}</strong> {t('teams.content.filterInterface.userExperience.quickAccessDesc')}
                </Typography>
              </Card>
            </Box>

            <Box
              sx={{
                bgcolor: 'rgba(0, 106, 103, 0.1)',
                p: 2,
                borderRadius: 1,
                border: '1px solid rgba(0, 106, 103, 0.2)',
                mt: 3
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'black'
                }}
              >
                <strong>{t('teams.content.filterInterface.howToUse.teamFilter')}</strong> {t('teams.content.filterInterface.howToUse.teamFilterInstructions')}
              </Typography>
            </Box>
          </Paper>

          {/* Mobile Organization Tree Structure */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: '#006A67',
                mb: 3
              }}
            >
              {t('teams.content.overview.mobile.organizationTree.title')}
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
              {t('teams.content.overview.mobile.organizationTree.description')}
            </Typography>

            {/* Mobile Organization Tree Image */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                p: 2,
                bgcolor: 'rgba(0, 106, 103, 0.05)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box
                component="img"
                src="/assets/support/organisationMob.webp"
                alt={t('teams.content.overview.altTexts.mobileOrganizationTree')}
                sx={{
                  maxWidth: '400px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            {/* Organization Tree Components */}
            <Box sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                lg: '1fr 1fr'
              }
            }}>
              {/* Header and Navigation */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.mobileInterface.headerNavigation.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.mobileInterface.headerNavigation.backArrow')}</strong> {t('teams.content.mobileInterface.headerNavigation.backArrowDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.headerNavigation.titleDisplay')}</strong> {t('teams.content.mobileInterface.headerNavigation.titleDisplayDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.headerNavigation.searchBar')}</strong> {t('teams.content.mobileInterface.headerNavigation.searchBarDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.headerNavigation.actionIcons')}</strong> {t('teams.content.mobileInterface.headerNavigation.actionIconsDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.headerNavigation.permissionBased')}</strong> {t('teams.content.mobileInterface.headerNavigation.permissionBasedDesc')}
                </Typography>
              </Card>

              {/* Level-Based Hierarchy */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.mobileInterface.levelHierarchy.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.mobileInterface.levelHierarchy.topLevel')}</strong> {t('teams.content.mobileInterface.levelHierarchy.topLevelDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.levelHierarchy.level1')}</strong> {t('teams.content.mobileInterface.levelHierarchy.level1Desc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.levelHierarchy.level2')}</strong> {t('teams.content.mobileInterface.levelHierarchy.level2Desc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.levelHierarchy.level3Plus')}</strong> {t('teams.content.mobileInterface.levelHierarchy.level3PlusDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.levelHierarchy.visualCards')}</strong> {t('teams.content.mobileInterface.levelHierarchy.visualCardsDesc')}
                </Typography>
              </Card>

              {/* Department Filtering */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.organizationTree.departmentFiltering.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.mobileInterface.departmentFiltering.departmentButtons')}</strong> {t('teams.content.mobileInterface.departmentFiltering.departmentButtonsDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.departmentFiltering.activeSelection')}</strong> {t('teams.content.mobileInterface.departmentFiltering.activeSelectionDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.departmentFiltering.filterResults')}</strong> {t('teams.content.mobileInterface.departmentFiltering.filterResultsDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.departmentFiltering.quickSwitch')}</strong> {t('teams.content.mobileInterface.departmentFiltering.quickSwitchDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.departmentFiltering.allDepartments')}</strong> {t('teams.content.mobileInterface.departmentFiltering.allDepartmentsDesc')}
                </Typography>
              </Card>

              {/* Employee Cards and Interaction */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.organizationTree.employeeCardsInteraction.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.organizationTree.employeeCardsInteraction.profilePhotos')}</strong> {t('teams.content.organizationTree.employeeCardsInteraction.profilePhotosDesc')}<br/>
                  • <strong>{t('teams.content.organizationTree.employeeCardsInteraction.employeeNames')}</strong> {t('teams.content.organizationTree.employeeCardsInteraction.employeeNamesDesc')}<br/>
                  • <strong>{t('teams.content.organizationTree.employeeCardsInteraction.cardLayout')}</strong> {t('teams.content.organizationTree.employeeCardsInteraction.cardLayoutDesc')}<br/>
                  • <strong>{t('teams.content.organizationTree.employeeCardsInteraction.tapInteraction')}</strong> {t('teams.content.organizationTree.employeeCardsInteraction.tapInteractionDesc')}<br/>
                  • <strong>{t('teams.content.organizationTree.employeeCardsInteraction.hierarchicalNavigation')}</strong> {t('teams.content.organizationTree.employeeCardsInteraction.hierarchicalNavigationDesc')}
                </Typography>
              </Card>

              {/* Subordinates Modal */}
              <Card sx={{ p: 3, height: 'fit-content', bgcolor: 'rgba(0, 106, 103, 0.05)' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.mobileInterface.subordinatesModal.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  • <strong>{t('teams.content.mobileInterface.subordinatesModal.modalHeader')}</strong> {t('teams.content.mobileInterface.subordinatesModal.modalHeaderDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.subordinatesModal.managerDisplay')}</strong> {t('teams.content.mobileInterface.subordinatesModal.managerDisplayDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.subordinatesModal.subordinateList')}</strong> {t('teams.content.mobileInterface.subordinatesModal.subordinateListDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.subordinatesModal.roleInformation')}</strong> {t('teams.content.mobileInterface.subordinatesModal.roleInformationDesc')}<br/>
                  • <strong>{t('teams.content.mobileInterface.subordinatesModal.cleanInterface')}</strong> {t('teams.content.mobileInterface.subordinatesModal.cleanInterfaceDesc')}
                </Typography>
              </Card>

              {/* Add Members Functionality */}
              <Card sx={{ p: 3, height: 'fit-content' }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.mobileInterface.addMembersFunctionality.title')}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.7,
                    color: 'black'
                  }}
                >
                  {(() => {
                    const features = t('teams.content.mobileInterface.addMembersFunctionality.features', { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                      ));
                    }
                    return <span>• {t('teams.content.mobileInterface.addMembersFunctionality.features')}<br/></span>;
                  })()}
                </Typography>
              </Card>
            </Box>

            <Box
              sx={{
                bgcolor: SUPPORT_COLORS.gridBg,
                p: 2,
                borderRadius: 1,
                border: `1px solid ${SUPPORT_COLORS.gridBorder}`,
                mt: 3
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'black'
                }}
              >
                {t('teams.content.overview.mobile.organizationTree.keyDifferences')}
              </Typography>
            </Box>
          </Paper>
        </Box>
      ) : (
        // Web Teams Overview
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.title')}
          </Typography>

          {/* Teams Dashboard Screenshot */}
          <Box
            sx={{
              mb: 4,
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
             src={isArabic ? "/assets/support/Teamsdashboardweb-ar.webp" : "/assets/support/Teamsdashboardweb.webp"}

             
              alt={t('teams.content.overview.altTexts.webTeamsDashboard')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 4
            }}
          >
            {t('teams.content.overview.altTexts.teamsDashboardCaption')}
          </Typography>
        </Box>
      )}

      {platform === 'web' && (
        <Box>

      {/* What You Can Do */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.managementCapabilities.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* User Management */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                {t('teams.content.overview.web.managementCapabilities.userManagement.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.managementCapabilities.userManagement.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• {feature}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.managementCapabilities.userManagement.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* View Options */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                {t('teams.content.overview.web.managementCapabilities.viewOptions.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.managementCapabilities.viewOptions.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• {feature}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.managementCapabilities.viewOptions.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* Organizational Tools */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                {t('teams.content.overview.web.managementCapabilities.organizationalTools.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.managementCapabilities.organizationalTools.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• {feature}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.managementCapabilities.organizationalTools.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* Settings & Configuration */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2,
                  fontSize: '1rem'
                }}
              >
                {t('teams.content.overview.web.managementCapabilities.settingsConfiguration.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.managementCapabilities.settingsConfiguration.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• {feature}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.managementCapabilities.settingsConfiguration.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Interface Views */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.title')}
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
          {t('teams.content.overview.web.interfaceViews.description')}
        </Typography>

        <Grid container spacing={3}>
          {/* List View */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.listView.title')}
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: SUPPORT_COLORS.imageBg,
                  p: 2
                }}
              >
                <img
                   src={isArabic ? "/assets/support/Teamsdashboardweb-ar.webp" : "/assets/support/Teamsdashboardweb.webp"}

                  alt={t('teams.content.overview.altTexts.webTeamsListView')}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'black',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  mb: 3
                }}
              >
                {t('teams.content.overview.web.interfaceViews.listView.caption')}
              </Typography>


            </Box>
          </Grid>

          {/* Grid View */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.gridView.title')}
              </Typography>

              <Box
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: SUPPORT_COLORS.imageBg,
                  p: 2
                }}
              >
                <img
                 

                  src={isArabic ? "/assets/support/gridwebteams-ar.webp":"/assets/support/gridwebteams.webp"}
                  alt={t('teams.content.overview.altTexts.webTeamsGridView')}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'black',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  mb: 3
                }}
              >
                {t('teams.content.overview.web.interfaceViews.gridView.caption')}
              </Typography>


            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Interface Controls */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: '#006A67',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.interfaceControls.title')}
        </Typography>

       
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* View Toggle */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.interfaceControls.viewToggle.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  {(() => {
                    const features = t('teams.content.overview.web.interfaceViews.interfaceControls.viewToggle.features', { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                      ));
                    }
                    return <span>• {t('teams.content.overview.web.interfaceViews.interfaceControls.viewToggle.features')}<br/></span>;
                  })()}
                </Typography>
              </Box>
            </Grid>

            {/* Search & Filter */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.interfaceControls.searchFilter.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  {(() => {
                    const features = t('teams.content.overview.web.interfaceViews.interfaceControls.searchFilter.features', { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                      ));
                    }
                    return <span>• {t('teams.content.overview.web.interfaceViews.interfaceControls.searchFilter.features')}<br/></span>;
                  })()}
                </Typography>
              </Box>
            </Grid>

            {/* Additional Controls */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.interfaceControls.additionalControls.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  {(() => {
                    const features = t('teams.content.overview.web.interfaceViews.interfaceControls.additionalControls.features', { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                      ));
                    }
                    return <span>• {t('teams.content.overview.web.interfaceViews.interfaceControls.additionalControls.features')}<br/></span>;
                  })()}
                </Typography>
              </Box>
            </Grid>

            {/* Status Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.interfaceControls.statusInformation.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  {(() => {
                    const features = t('teams.content.overview.web.interfaceViews.interfaceControls.statusInformation.features', { returnObjects: true });
                    if (Array.isArray(features)) {
                      return features.map((feature, index) => (
                        <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                      ));
                    }
                    return <span>• {t('teams.content.overview.web.interfaceViews.interfaceControls.statusInformation.features')}<br/></span>;
                  })()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
      </Paper>

      {/* Organizational Structure Overview */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.title')}
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
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.description')}
        </Typography>

        {/* Organizational Chart Screenshot */}
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
           src={isArabic ? "/assets/support/hierarchyWeb-ar.webp" : "/assets/support/hierarchyWeb.webp"}


            
            alt={t('teams.content.overview.altTexts.organizationalStructureChart')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartCaption')}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: '#006A67',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.title')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Executive Level */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.executiveLevel.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.executiveLevel.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.executiveLevel.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* Department Structure */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.departmentStructure.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const departments = t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.departmentStructure.departments', { returnObjects: true });
                  if (Array.isArray(departments)) {
                    return departments.map((dept, index) => (
                      <span key={index}>• <strong>{dept.split(':')[0]}:</strong> {dept.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.departmentStructure.departments')}<br/></span>;
                })()}
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(0, 106, 103, 0.1)',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid rgba(0, 106, 103, 0.2)',
                  mt: 2
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: 'black'
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.departmentStructure.note')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Employee Representation */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.employeeRepresentation.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.employeeRepresentation.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.chartComponents.employeeRepresentation.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.title')}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Add New Members */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.addNewMembers.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.addNewMembers.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.addNewMembers.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* Department Management */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.departmentManagement.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.departmentManagement.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.departmentManagement.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>

          {/* Navigation Controls */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.navigationControls.title')}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  color: 'black'
                }}
              >
                {(() => {
                  const features = t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.navigationControls.features', { returnObjects: true });
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                    ));
                  }
                  return <span>• {t('teams.content.overview.web.interfaceViews.organizationalStructure.interactiveFeatures.navigationControls.features')}<br/></span>;
                })()}
              </Typography>
            </Box>
          </Grid>
        </Grid>


      </Paper>

      {/* Key Features */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.title')}
        </Typography>

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
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.description')}
          </Typography>

          {/* Settings Interface Screenshot */}
          <Box
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: SUPPORT_COLORS.imageBg,
              ml: 2,
              p: 2
            }}
          >
            <img
             src={isArabic ? "/assets/support/settingsteamweb-ar.webp" :  "/assets/support/settingsteamweb.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsInterfaceAlt')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3,
              ml: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsCaption')}
          </Typography>

          <Typography
            variant="body1"
            component="div"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.title')}</strong><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.departments') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.designations') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.employeeStatuses') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.teamNotice') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.settingsConfiguration.settingsTabs.rolesPermissions') }} />
          </Typography>



          {/* User Profile Views Section */}
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.title')}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Profile Information */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2,
                    fontSize: '1rem'
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileInformation.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileInformation.personalDetails') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileInformation.roleStatus') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileInformation.departmentAssignment') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileInformation.contactInformation') }} />
                </Typography>
              </Box>
            </Grid>

            {/* Dashboard Analytics */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2,
                    fontSize: '1rem'
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.dashboardAnalytics.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.dashboardAnalytics.taskStatistics') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.dashboardAnalytics.projectOverview') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.dashboardAnalytics.salesMetrics') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.dashboardAnalytics.performanceCharts') }} />
                </Typography>
              </Box>
            </Grid>

            {/* Navigation Tabs */}
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, bgcolor: 'rgba(0, 106, 103, 0.05)', borderRadius: 2, height: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    color: '#006A67',
                    mb: 2,
                    fontSize: '1rem'
                  }}
                >
                  {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.navigationTabs.title')}
                </Typography>
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black'
                  }}
                >
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.navigationTabs.profileTab') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.navigationTabs.tasksTab') }} /><br/>
                  • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.navigationTabs.timesheetTab') }} />
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Profile Screenshot */}
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
              src={isArabic ? "/assets/support/profileWeb-ar.webp" : "/assets/support/profileWeb.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileImageAlt')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.userProfileViews.profileCaption')}
          </Typography>

         


        </Box>


      </Paper>
        </Box>
      )}
    </Box>
  );

  const renderAddMemberContent = () => (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 3
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.description')}
      </Typography>

      {/* Web Content */}
      {platform === 'web' && (
        <>
          {/* Prerequisites */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.title')}
        </Typography>

        <Typography
          variant="body1"
          component="div"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black'
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.description')}<br/>
          - {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.requirements.0')}<br/>
          - {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.requirements.1')}<br/>
          - {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.requirements.2')}<br/>
          - {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addMemberContent.prerequisites.requirements.3')}
        </Typography>
      </Paper>

      {/* Step-by-Step Process */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.title')}
        </Typography>

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
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step1.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            {(() => {
              const instructions = t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step1.instructions', { returnObjects: true });
              if (Array.isArray(instructions)) {
                return instructions.map((instruction, index) => (
                  <span key={index}>{index + 1}. {instruction}<br/></span>
                ));
              }
              return <span>1. {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step1.instructions')}<br/></span>;
            })()}
          </Typography>
          </Box>

          {/* List View Screenshot */}
          <Box
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: SUPPORT_COLORS.imageBg,
              p: 2,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            <img
            src={isArabic ? "/assets/support/Teamsdashboardweb-ar.webp" : "/assets/support/Teamsdashboardweb.webp"}
             
              alt={t('teams.altTexts.webTeamsListView')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step1.listViewCaption')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            {(() => {
              const instructions = t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.instructions', { returnObjects: true });
              if (Array.isArray(instructions)) {
                return instructions.map((instruction, index) => (
                  <span key={index}>{index + 1}. {instruction}<br/></span>
                ));
              }
              return <span>1. {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.instructions')}<br/></span>;
            })()}<br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.title')}</strong><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.formLayout') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.realTimeValidation') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.autoSave') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.fieldNavigation') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.errorHandling') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.duplicatePrevention') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.userFormDetails.formCompletion') }} />
          </Typography>

          {/* User Form Screenshot */}
          <Box
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: SUPPORT_COLORS.imageBg,
              p: 2,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            <img
            src={isArabic ? "/assets/support/adduserWeb-ar.webp" : "/assets/support/adduserWeb.webp"}


              
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.addUserImageAlt')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.addUserCaption')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.description')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.title')}</strong><br/>
            1. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.slNo') }} /><br/>
            2. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.id') }} /><br/>
            3. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.name') }} /><br/>
            4. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.username') }} /><br/>
            5. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.designation') }} /><br/>
            6. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.department') }} /><br/>
            7. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.details') }} /><br/>
            8. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.level') }} /><br/>
            9. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.status') }} /><br/>
            10. <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.formFields.actions') }} /><br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.requiredFields.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.requiredFields.name')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.requiredFields.username')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.optionalFields.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.optionalFields.designation')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.optionalFields.department')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step3.optionalFields.note')}
          </Typography>

        

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserFormCaption')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.nameField.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.nameField.clickName')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.nameField.required')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.usernameField.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.usernameField.enterEmail')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.usernameField.validFormat')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.usernameField.unique')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.designationDropdown.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.designationDropdown.clickDropdown')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.designationDropdown.defaultOptions')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.designationDropdown.canBeLeft')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.designationDropdown.permissions')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.departmentDropdown.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.departmentDropdown.clickView')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.departmentDropdown.defaultDepts')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.departmentDropdown.canBeLeftUnselected')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.departmentDropdown.assigns')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.title')}</strong><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.branchAvailability') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.dynamicDisplay') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.noBranches') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.departmentSpecific') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.branchSelection.optionalAssignment') }} />
          </Typography>

          <Typography>
            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.detailsIcon.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.detailsIcon.clickAccess')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.detailsIcon.configure')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.detailsIcon.setContact')}<br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.title')}</strong><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.hourlyRate') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.enterAddress') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.phoneNumber') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.chooseCountry') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.branch') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.addUserDetailsForm.searchUserRoles') }} /><br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.title')}</strong><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.hrAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.taskAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.projectAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.clientAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.vendorAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.generalAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.selectAll') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userRoleAssignments.individualSelection') }} /><br/><br/>

            <strong>{t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.title')}</strong><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.multipleRoles')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.rolesPermissions')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.externalUsers')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.internalUsers')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.selectAllSuper')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.roleConfigurationTips.clickAdd')}<br/><br/>
          </Typography>

          {/* User Details Form Screenshot */}
          <Box
            sx={{
              mb: 3,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: SUPPORT_COLORS.imageBg,
              p: 2,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            <img
             src={isArabic ? "/assets/support/userdetailsweb-ar.webp" : "/assets/support/userdetailsweb.webp"}


              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step2.addUserImageAlt')}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '8px'
              }}
            />
          </Box>
<Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.userDetailsFormCaption')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.clickAction') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.interactiveSelection') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.defaultSetting') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.customAssignment') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.visualPlacement') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.hierarchyManagement') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.levelIcon.realTimeUpdates') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.defaultStatus') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.statusOptions') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.userControl') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.permissionBased') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.teamSettingsAccess') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.statusConfiguration.branchAvailability') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.activeTag') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.nonActiveTag') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.confirmationProcess') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.userActionRequired') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.statusUpdates') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step4.accountActivationStatus.departmentDisplay') }} />
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#006A67',
              mb: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.requiredFields') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.emailValidation') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.optionalFields') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.additionalDetails') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.finalReviewChecklist.workStatus') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.saveNewUser.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.saveNewUser.clickSave') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.saveNewUser.systemValidation') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.saveNewUser.successfulAdd') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.saveNewUser.emailConfirmation') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.formValidation.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.formValidation.redIndicators') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.formValidation.emailFormat') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.formValidation.uniqueUsername') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.formValidation.minimalInfo') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.accountActivation.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.accountActivation.automaticEmail') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.accountActivation.nonActiveStatus') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.accountActivation.activeStatus') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.stepByStepProcess.step5.accountActivation.statusModification') }} />
          </Typography>




        </Box>
      </Paper>

      {/* Adding Members to Organization Tree */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.title')}
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
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.description')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.step1.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.step1.navigate') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.step1.superAdmin') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.step1.plusIcons') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.addingMembersToTree.step1.iconDescription') }} />
        </Typography>

        {/* Organization Chart Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/hierarchyWeb-ar.webp" : "/assets/support/hierarchyWeb.webp"}
            alt={t('teams.content.overview.altTexts.organizationChartPlusIcons')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step2.imageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step2.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • {t('teams.content.organizationTree.addMemberProcess.step2.steps.0')}<br/>
          • {t('teams.content.organizationTree.addMemberProcess.step2.steps.1' )}<br/>
          • {t('teams.content.organizationTree.addMemberProcess.step2.steps.2')}<br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step2.steps.3') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step2.steps.4') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step2.steps.5') }} />
        </Typography>

        {/* Add Organization Member Dialog Screenshot */}
        <Box
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
            src= "/assets/support/addOrganWeb.webp"
            alt={t('teams.content.organizationTree.addMemberProcess.step2.imageAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step2.imageCaption')}
        </Typography>

      
       

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step3.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step3.steps.0') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step3.steps.1') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step3.steps.2') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step3.steps.3') }} />
        </Typography>
          {/* General Members List Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/generalmembersweb-ar.webp" : "/assets/support/generalmembersweb.webp"}
           
            alt={t('teams.content.overview.altTexts.generalMembersListDialog')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>
     <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step3.imageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step4.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step4.steps.0') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step4.steps.1') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step4.steps.2') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step4.steps.3') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.organizationTree.addMemberProcess.step5.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • {t('teams.content.organizationTree.addMemberProcess.step5.steps.0')}<br/>
          • {t('teams.content.organizationTree.addMemberProcess.step5.steps.1')}<br/>
          • {t('teams.content.organizationTree.addMemberProcess.step5.steps.2')}<br/>
          • {t('teams.content.organizationTree.addMemberProcess.step5.steps.3')}<br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.addMemberProcess.step5.steps.4') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
            mt: 4
          }}
        >
          {t('teams.content.organizationTree.controlButtons.title')}
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
          {t('teams.content.organizationTree.controlButtons.description')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.controlButtons.generalMembersList.title') }} /><br/>
          • {t('teams.content.organizationTree.controlButtons.generalMembersList.countBadge')}<br/>
          • {t('teams.content.organizationTree.controlButtons.generalMembersList.clickToView')}<br/>
          • {t('teams.content.organizationTree.controlButtons.generalMembersList.unassignedUsers')}<br/>
          • {t('teams.content.organizationTree.controlButtons.generalMembersList.trackingPurpose')}<br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.organizationTree.controlButtons.exportToPdf.title') }} /><br/>
          • {t('teams.content.organizationTree.controlButtons.exportToPdf.generatePdf')}<br/>
          • {t('teams.content.organizationTree.controlButtons.exportToPdf.printableDocument')}<br/>
          • {t('teams.content.organizationTree.controlButtons.exportToPdf.includesAll')}<br/>
          • {t('teams.content.organizationTree.controlButtons.exportToPdf.sharingPurpose')}<br/>
          • {t('teams.content.organizationTree.controlButtons.exportToPdf.currentState')}
        </Typography>

        {/* Export Buttons Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
           src={isArabic ? "/assets/support/exportWeb-ar.webp" : "/assets/support/exportWeb.webp"}

           
            alt={t('teams.content.organizationTree.controlButtons.imageAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.organizationTree.controlButtons.imageCaption')}
        </Typography>
      </Paper>
        </>
      )}

      {/* Mobile Add Team Member Process */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.title')}
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
            {t('teams.content.overview.addingMembers.mobileMultipleWays')}
          </Typography>

          {/* Method 1: Profile Menu Access */}
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.addingMembers.method1.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step1.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step1.tapProfile')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step1.menuSlide')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step1.lookForOption')}<br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step1.permissionRequired') }} />
          </Typography>

          {/* Profile Menu Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/profileaddMob-ar.webp" : "/assets/support/profileaddMob.webp"}
              
              alt={t('teams.content.overview.addingMembers.method1.imageAlt')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.method1.imageCaption')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step2.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step2.tapAddEmployee')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step2.formScreen')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step2.cleanInterface')}
          </Typography>

          {/* Add Employee Form Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addempMob-ar.webp" : "/assets/support/addempMob.webp"}
             
              alt={t('teams.content.overview.addingMembers.method1.addEmployeeFormAlt')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.addingMembers.method1.step3.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.profilePhoto.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step3.profilePhoto.tapPlaceholder')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step3.profilePhoto.greenPlus')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step3.profilePhoto.identification')}<br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.requiredFields.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.requiredFields.name') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.requiredFields.employeeId') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.requiredFields.email') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.optionalAssignments.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.optionalAssignments.department') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.optionalAssignments.designation') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step3.optionalAssignments.canBeLeft')}<br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.userRoles.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step3.userRoles.multipleToggles')}<br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.userRoles.superAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.userRoles.generalAdmin') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method1.step3.userRoles.specializedRoles') }} /><br/>
            • {t('teams.content.overview.addingMembers.method1.step3.userRoles.toggleSwitches')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step3.userRoles.rolesPermissions')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.addingMembers.method1.step4.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 4,
              pl: 2
            }}
          >
            • {t('teams.content.overview.addingMembers.method1.step4.reviewInfo')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step4.tapSave')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step4.systemValidate')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step4.addedToDatabase')}<br/>
            • {t('teams.content.overview.addingMembers.method1.step4.assignToHierarchy')}
          </Typography>
        </Paper>
      )}

      {/* Mobile Organization Tree Management */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.method2.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.accessOrgLevels.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.accessOrgLevels.navigate')}<br/>
            • {t('teams.content.overview.addingMembers.method2.accessOrgLevels.tapView')}<br/>
            • {t('teams.content.overview.addingMembers.method2.accessOrgLevels.hierarchical')}<br/>
            • {t('teams.content.overview.addingMembers.method2.accessOrgLevels.topLevel')}<br/>
            • {t('teams.content.overview.addingMembers.method2.accessOrgLevels.departmentButtons')}
          </Typography>

          {/* Organization Levels Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/organisationaddMob-ar.webp" : "/assets/support/organisationaddMob.webp"}
            
              alt={t('teams.content.overview.addingMembers.method2.imageAlts.orgLevels')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.method2.imageCaptions.orgLevels')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.addMembersProcess.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.addMembersProcess.lookForPlus')}<br/>
            • {t('teams.content.overview.addingMembers.method2.addMembersProcess.tapAddMembers')}<br/>
            • {t('teams.content.overview.addingMembers.method2.addMembersProcess.plusIcons')}<br/>
            • {t('teams.content.overview.addingMembers.method2.addMembersProcess.tapIcon')}<br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.addMembersProcess.permissionRequired') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.addMembersProcess.openDialog')}
          </Typography>

          {/* Select Member Dialog Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/selectMemberMob-ar.webp" :
              "/assets/support/selectMemberMob.webp"}
              alt={t('teams.content.overview.addingMembers.method2.imageAlts.selectMember')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.method2.imageCaptions.selectMember')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.selectMembers.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.dialogShows')}<br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.memberDisplays')}<br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.examples')}<br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.searchBar')}<br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.selectEmployee')}<br/>
            • {t('teams.content.overview.addingMembers.method2.selectMembers.tapDone')}
          </Typography>

          {/* Subordinates Management */}
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.addingMembers.method2.subordinatesManagement.title')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.viewSubordinates.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.viewSubordinates.tapEmployee')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.viewSubordinates.hasSubordinates')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.viewSubordinates.noSubordinates')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.viewSubordinates.modalDisplays')}
          </Typography>

          {/* Subordinates Modal Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/subordinatesMob-ar.webp" : "/assets/support/subordinatesMob.webp"}
            
              alt={t('teams.content.overview.addingMembers.method2.imageAlts.subordinates')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.addingMembers.method2.imageCaptions.subordinates')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.title') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.managerDisplay') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.directReports') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.employeeInfo') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.profileAvatars') }} /><br/>
            • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.subordinatesModalDetails.closeOption') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.title') }} /><br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.usePlusIcon')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.selectAvailable')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.createsRelationships')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.appearUnder')}<br/>
            • {t('teams.content.overview.addingMembers.method2.subordinatesManagement.addSubordinates.modalUpdated')}
          </Typography>

          <Box
            sx={{
              bgcolor: 'rgba(0, 106, 103, 0.1)',
              p: 2,
              borderRadius: 1,
              border: '1px solid rgba(0, 106, 103, 0.2)',
              mt: 3
            }}
          >
            <Typography
              variant="body2"
              component="div"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'black'
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.addingMembers.method2.subordinatesManagement.mobileWorkflow') }} />
            </Typography>
          </Box>
        </Paper>
      )}

    </Box>
  );

  const renderDepartmentsContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.overview.sections.departmentManagement.title')}
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
        {t('teams.content.descriptions.departmentSetupDescription')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.sections.departmentManagement.platformDifferencesTitle')}
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
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.webPlatform') }} />
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.mobilePlatform') }} />
          </Typography>
        </Box>
      )}

      {/* Web Department Management */}
      {platform === 'web' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.descriptions.departmentSetupWebOnly')}
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
            {t('teams.content.overview.sections.departmentManagement.webManagementDescription')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.accessTeamSettings') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.createDepartments') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.manageHierarchy') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.editDepartments') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.permissionRequired') }} />
          </Typography>

          {/* Department Settings Interface Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/settingsteamweb-ar.webp" : "/assets/support/settingsteamweb.webp"}
              alt={t('teams.content.overview.sections.departmentManagement.imageAlt')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.sections.departmentManagement.imageCaption')}
          </Typography>



          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.defaultDepartments') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.customDepartments') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.departmentListing') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.editFunctionality') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.deleteFunctionality') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.bilingualSupport') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.divisionManagement') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.sectionManagement') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.hierarchicalStructure') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.addButtons') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.filteringOptions') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.realTimeUpdates') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.webDepartmentDetails.permissionBased') }} />
          </Typography>
        </Paper>
      )}

      {/* Mobile Department Selection */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.title')}
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
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.description')}
          </Typography>

          {/* Department Dropdown Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/departmentmob-ar.webp" : "/assets/support/departmentmob.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.imageAlt')}
              sx={{
                maxWidth: '300px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.imageCaption')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.dropdownSelection') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.userAssignment') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.formIntegration') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.mobileDepartmentSelection.existingDepartments') }} />
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const renderOrgChartContent_REMOVED = () => (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 3
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.description')}
      </Typography>

      {/* Organizational Chart Screenshot */}
      <Box
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: SUPPORT_COLORS.imageBg,
          p: 2
        }}
      >
        <img
          src={isArabic ? "/assets/support/hierarchyWeb-ar.webp" : "/assets/support/hierarchyWeb.webp"}
          alt={t('teams.content.overview.altTexts.organizationalChartInterface')}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '8px'
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          color: 'black',
          fontStyle: 'italic',
          textAlign: 'center',
          mb: 4
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.imageCaption')}
      </Typography>

      {/* Chart Features */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.featuresTitle')}
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
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.title') }} /><br/>
          • <strong>{t('teams.content.organizationTree.structure.topLevel')}</strong> {t('teams.content.organizationTree.structure.topLevelDesc')}<br/>
          • <strong>{t('teams.content.organizationTree.structure.departmentBoxes')}</strong> {t('teams.organizationTree.structure.departmentBoxesDesc')}<br/>
          • <strong>{t('teams.organizationTree.structure.employeeCards')}</strong> {t('teams.organizationTree.structure.employeeCardsDesc')}<br/>
          • <strong>{t('teams.organizationTree.structure.reportingLines')}</strong> {t('teams.organizationTree.structure.reportingLinesDesc')}<br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.departmentInformation') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.departmentNames') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.memberCount') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.colorCoding') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.emptyDepartments') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.employeeDetails') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.profileAvatars') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.fullNames') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.jobTitles') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.contactInformation') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.hierarchyStructure.hierarchyPosition') }} />
        </Typography>
      </Paper>

      {/* Interactive Features */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.title')}
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
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.addMembersTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.plusIcons') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.dialogBox') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.userSelection') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.searchFunctionality') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.departmentAssignment') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.reportingLevel') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.permissionRequired') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.superAdminDefault') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.automaticPositioning') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.editMembersTitle') }} /><br/>
          • <strong>{t('teams.organizationTree.editing.clickEmployeeCards')}</strong> {t('teams.organizationTree.editing.clickEmployeeCardsDesc')}<br/>
          • <strong>{t('teams.organizationTree.editing.updateInformation')}</strong> {t('teams.organizationTree.editing.updateInformationDesc')}<br/>
          • <strong>{t('teams.organizationTree.editing.moveBetweenDepartments')}</strong> {t('teams.organizationTree.editing.moveBetweenDepartmentsDesc')}<br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.expandCollapseTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.departmentExpansion') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.memberCountIndicators') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.selectiveViewing') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.exportOptionsTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.exportToPdf') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.generalMembersList') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.interactiveFeatures.backToEmployeeList') }} />
        </Typography>
      </Paper>



      {/* Navigation and Controls */}
      <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.navigationOptionsTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.backToEmployeeListNav') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.breadcrumbNavigation') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.zoomControls') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.chartControlsTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.viewToggle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.filterOptions') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.searchFunctionalityChart') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.managementActionsTitle') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.bulkOperations') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.reportingStructure') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.departmentRestructuring') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.organizationalChart.navigationControls.realTimeUpdates') }} />
        </Typography>
      </Paper>
    </Box>
  );

  const renderSettingsContent_REMOVED = () => (
    <Box>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: 1.7,
          color: 'black',
          mb: 3
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.description')}
      </Typography>

      {/* Settings Interface Screenshot */}
      <Box
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: SUPPORT_COLORS.imageBg,
          p: 2
        }}
      >
        <img
         src={isArabic ? "/assets/support/settingsteamweb-ar.webp" :  "/assets/support/settingsteamweb.webp"}
          alt={t('teams.content.overview.altTexts.teamsSettingsInterface')}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '8px'
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          color: 'black',
          fontStyle: 'italic',
          textAlign: 'center',
          mb: 4
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.imageCaption')}
      </Typography>

      {/* Settings Tabs */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.title')}
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
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.departmentsTab') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.departmentList') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.memberCount') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.addNewDepartments') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.bilingualSupport') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.editDelete') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.designationsTab') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.jobTitles') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.customDesignations') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.hierarchyLevels') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.employeeStatusesTab') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.workStatus') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.customStatuses') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.statusManagement') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.teamNoticeTab') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.announcements') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.multilingualNotices') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.targetedMessaging') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.rolesPermissionsTab') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.accessControl') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.roleManagement') }} /><br/>
          • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.teamsSettings.settingsTabsOverview.moduleAccess') }} />
        </Typography>
      </Paper>

      {/* Department Management */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.departmentManagement.detailedManagement.title')}
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
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step1') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step2') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step3') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step4') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step5') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.addingNewDepartments.step6') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.editingExistingDepartments.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.editingExistingDepartments.editIcon') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.editingExistingDepartments.updateNames') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.editingExistingDepartments.saveChanges') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.deletingDepartments.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.deletingDepartments.deleteIcon') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.deletingDepartments.confirmationRequired') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.deletingDepartments.dataProtection') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.departmentInformation.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.departmentInformation.memberCount') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.departmentInformation.departmentStatus') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.departmentInformation.organizationalChart') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.departmentInformation.departmentDisplay') }} />
        </Typography>
      </Paper>

      {/* Permission Requirements */}
      <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.title')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.requiredPermissions.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.requiredPermissions.generalSettings') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.requiredPermissions.generalUserSettings') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.requiredPermissions.adminRole') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.accessRestrictions.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.accessRestrictions.limitedUsers') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.accessRestrictions.readOnlyAccess') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.accessRestrictions.departmentRestrictions') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.bestPractices.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.bestPractices.regularReview') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.bestPractices.consistentNaming') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.bestPractices.bilingualSupport') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.departmentManagement.detailedManagement.permissionRequirements.bestPractices.changeManagement') }} />
        </Typography>
      </Paper>
    </Box>
  );

  const renderDesignationsContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.title')}
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
        {t('teams.content.descriptions.designationSetupDescription')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.sections.designationManagement.mobileDesignationSelection.platformDifferencesDesignations')}
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
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.webPlatform') }} />
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobilePlatform') }} />
          </Typography>
        </Box>
      )}

      {/* Web Designation Management */}
      {platform === 'web' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.descriptions.designationSetupWebOnly')}
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
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.designationCreationProcess.title') }} /><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.designationCreationProcess.navigate')}<br/>
                <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/adddesig1-ar.webp" : "/assets/support/adddesig1.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageAlts.existingDesignations')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
             <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
             {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageCaptions.existingDesignations')}
          </Typography>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.designationManagement.mobileDesignationSelection.viewExistingDesignations') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.designationManagement.mobileDesignationSelection.enterDesignationName') }} /><br/>
               {/* Step 2: Add New Designation Interface */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
          

         
          
              <Box
              component="img"
              src={isArabic ? "/assets/support/desig2-ar.webp" : "/assets/support/desig2.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageAlts.addNewDesignation')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
             {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageCaptions.addNewDesignation')}
          </Typography>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.designationManagement.mobileDesignationSelection.saveDesignation') }} />
          </Typography>

          
      
       

       
          {/* Step 3: Designation Creation Form */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/desig3-ar.webp" : "/assets/support/desig3.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageAlts.bilingualForm')}
              sx={{
                maxWidth: '600px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.imageCaptions.bilingualForm')}
          </Typography>
        </Paper>
      )}

      {/* Mobile Designation Selection - Only show on mobile */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDesignationSelection.title')}
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
          {platform === 'mobile'
            ? t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDescription')
            : t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.webDescription')
          }
        </Typography>

        {/* Designation Dropdown Screenshot */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box
            component="img"
            src={isArabic ? "/assets/support/designationMob-ar.webp" : "/assets/support/designationMob.webp"}
           
            alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.designationImageAlt')}
            sx={{
              maxWidth: '300px',
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.designationCaption')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDesignationSelection.dropdownSelection') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDesignationSelection.userAssignment') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDesignationSelection.formIntegration') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.departmentManagement.designationManagement.mobileDesignationSelection.existingDesignationsDetail') }} />
        </Typography>
        </Paper>
      )}
    </Box>
  );




  const renderEmployeeStatusesContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.title')}
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
        {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.description')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.platformDifferencesTitle')}
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
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webPlatform') }} />
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobilePlatform') }} />
          </Typography>
        </Box>
      )}

      {/* Web Employee Status Management */}
      {platform === 'web' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.descriptions.employeeStatusSetupWebOnly')}
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
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.description')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 4,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.title') }} /><br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.navigate')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.viewDefault')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.clickAdd')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.enterName')}<br/>
            • {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.webStatusManagement.creationProcess.saveStatus')}
          </Typography>

          {/* Step 1: Employee Status Tab Interface */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/offline1-ar.webp" : "/assets/support/offline1.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageAlts.defaultStatuses')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageCaptions.defaultStatuses')}
          </Typography>

          {/* Step 2: Add New Status Interface */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/offline2-ar.webp" : "/assets/support/offline2.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageAlts.addNewStatus')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageCaptions.addNewStatus')}
          </Typography>

          {/* Step 3: Status Creation Form */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/offline3-ar.webp" : "/assets/support/offline3.webp"}
              alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageAlts.bilingualForm')}
              sx={{
                maxWidth: '600px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.imageCaptions.bilingualForm')}
          </Typography>


        </Paper>
      )}

      {/* Mobile Employee Status Selection - Only show on mobile */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.title')}
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
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.description')}
        </Typography>

        {/* Employee Status Mobile Screenshot */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box
            component="img"
            src={isArabic ? "/assets/support/EmpStatusMob-ar.webp" : "/assets/support/EmpStatusMob.webp"}
           
            alt={t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.imageAlt')}
            sx={{
              maxWidth: '300px',
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 3
          }}
        >
          {t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.imageCaption')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.editStatusAccess') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.statusDropdown') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.dateOptions') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.defaultStatuses') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.web.interfaceViews.organizationalStructure.keyFeatures.employeeStatus.mobileStatusSelection.customStatuses') }} />
        </Typography>
        </Paper>
      )}
    </Box>
  );




  const renderTeamNoticesContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.teamNoticesManagement.title')}
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
        {t('teams.content.descriptions.teamNoticesDescription')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.sections.teamNotices.platformDifferencesWeb')}
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
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.webPlatformNotices') }} />
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.mobilePlatformNotices') }} />
          </Typography>
        </Box>
      )}

      {/* Web Team Notices Management */}
      {platform === 'web' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.teamNoticesManagement.webOnlyTitle')}
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
            {t('teams.content.teamNoticesManagement.webOnlyDescription')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <strong>{t('teams.content.teamNoticesManagement.webInstructions.accessTeamSettings')}</strong> {t('teams.content.teamNoticesManagement.webInstructions.accessTeamSettingsDesc')}<br/>
            <strong>{t('teams.content.teamNoticesManagement.webInstructions.createNotices')}</strong> {t('teams.content.teamNoticesManagement.webInstructions.createNoticesDesc')}<br/>
            <strong>{t('teams.content.teamNoticesManagement.webInstructions.manageContent')}</strong> {t('teams.content.teamNoticesManagement.webInstructions.manageContentDesc')}<br/>
            <strong>{t('teams.content.teamNoticesManagement.webInstructions.visibilityControl')}</strong> {t('teams.content.teamNoticesManagement.webInstructions.visibilityControlDesc')}<br/>
            <strong>{t('teams.content.teamNoticesManagement.webInstructions.permissionRequired')}</strong> {t('teams.content.teamNoticesManagement.webInstructions.permissionRequiredDesc')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 4,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.navigate') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.clickAdd') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.savePublish') }} />
          </Typography>

          {/* Team Notice Tab Interface Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addteam1-ar.webp" : "/assets/support/addteam1.webp"}
              alt={t('teams.content.overview.altTexts.teamNoticeTabButton')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.sections.editingMembers.imageCaption1')}
          </Typography>

          {/* Add Team Notice Dialog Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addteam2-ar.webp" : "/assets/support/addteam2.webp"}
              alt={t('teams.content.overview.altTexts.addTeamNoticeDialog')}
              sx={{
                maxWidth: '600px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.sections.editingMembers.imageCaption2')}
          </Typography>

          {/* Team Notice Creation Form Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addteam3-ar.webp" : "/assets/support/addteam3.webp"}
              alt={t('teams.content.overview.altTexts.teamNoticeCreationForm')}
              sx={{
                maxWidth: '600px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.sections.editingMembers.imageCaption3')}
          </Typography>

          {/* Dashboard Notice Display Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addteam4-ar.webp" : "/assets/support/addteam4.webp"}
              alt={t('teams.content.overview.altTexts.dashboardNoticeDisplay')}
              sx={{
                maxWidth: '800px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.overview.sections.editingMembers.imageCaption4')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.navigate') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.clickAdd') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.enterContent') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.teamNotices.noticeCreationProcess.savePublish') }} /><br/><br/>



            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.editingMembers.managementFeatures.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.editingMembers.managementFeatures.editNotices') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.editingMembers.managementFeatures.deleteAnnouncements') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.editingMembers.managementFeatures.controlVisibility') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.editingMembers.managementFeatures.trackEngagement') }} />
          </Typography>
        </Paper>
      )}

      {/* Mobile Team Notices - Only show on mobile */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {platform === 'mobile' ? t('teams.content.teamNoticesManagement.mobileNotices.addTeamNoticeTitle') : t('teams.content.teamNoticesManagement.mobileNotices.mobileCreationTitle')}
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
          {platform === 'mobile'
            ? t('teams.content.teamNoticesManagement.mobileNotices.mobilePermissionDesc')
            : t('teams.content.teamNoticesManagement.mobileNotices.mobilePermissionDescFull')
          }
        </Typography>

        {/* Team Notice Mobile Screenshot */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Box
            component="img"
            src={isArabic ? "/assets/support/teamnoticeMob-ar.webp" : "/assets/support/teamnoticeMob.webp"}
          
            alt={t('teams.content.overview.altTexts.mobileTeamNoticeInterface')}
            sx={{
              maxWidth: '300px',
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 3
          }}
        >
          {t('teams.content.teamNoticesManagement.mobileInterface.interfaceDescription')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <strong>{t('teams.content.teamNoticesManagement.mobileInterface.profileMenuAccess')}</strong> {t('teams.content.teamNoticesManagement.mobileInterface.profileMenuAccessDesc')}<br/>
          <strong>{t('teams.content.teamNoticesManagement.mobileInterface.noticeCreation')}</strong> {t('teams.content.teamNoticesManagement.mobileInterface.noticeCreationDesc')}<br/>
          <strong>{t('teams.content.teamNoticesManagement.mobileInterface.permissionBased')}</strong> {t('teams.content.teamNoticesManagement.mobileInterface.permissionBasedDesc')}<br/>
          <strong>{t('teams.content.teamNoticesManagement.mobileInterface.quickAccess')}</strong> {t('teams.content.teamNoticesManagement.mobileInterface.quickAccessDesc')}
        </Typography>
        </Paper>
      )}
    </Box>
  );










  const renderEditMemberContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.editingMembers.title')}
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
        {t('teams.content.editingMembers.description')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.editingMembers.platformAvailabilityNotice')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
           <strong>{t('teams.content.overview.sections.editingMembers.webVersionOnly')}</strong> {t('teams.content.overview.sections.editingMembers.webOnlyDescription')}<br/><br/>

            <strong>{t('teams.content.overview.sections.editingMembers.mobileLimitations')}</strong><br/>
            • {t('teams.content.overview.sections.editingMembers.mobileLimitationsList.0')}<br/>
            • {t('teams.content.overview.sections.editingMembers.mobileLimitationsList.1')}<br/>
            • {t('teams.content.overview.sections.editingMembers.mobileLimitationsList.2')}<br/>
            • {t('teams.content.overview.sections.editingMembers.mobileLimitationsList.3')}<br/>

            <strong>{t('teams.content.overview.sections.editingMembers.toEditDelete')}</strong> {t('teams.content.editingMembers.useWebVersion')}
          </Typography>
        </Box>
      )}

      {/* Edit Team Members from List - Web Only */}
      {platform === 'web' && (
        <>
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.editingMembers.editFromListTitle')}
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
          {t('teams.content.editingMembers.editFromListDescription')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.step1Title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • {t('teams.content.editingMembers.step1Instructions.0')}<br/>
          • {t('teams.content.editingMembers.step1Instructions.1')}<br/>
          • {t('teams.content.editingMembers.step1Instructions.2')}<br/>
          • {t('teams.content.editingMembers.step1Instructions.3')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.availableActionsTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <strong>{t('teams.content.editingMembers.actionsList.permissions')}</strong> {t('teams.content.editingMembers.actionsList.permissionsDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.actionsList.edit')}</strong> {t('teams.content.editingMembers.actionsList.editDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.actionsList.deactivate')}</strong> {t('teams.content.editingMembers.actionsList.deactivateDesc')}
        </Typography>

        {/* Actions Menu Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
            src={isArabic ? "/assets/support/actionsweb-ar.webp" : "/assets/support/actionsweb.webp"}
            
            alt={t('teams.content.editingMembers.actionsMenuAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.editingMembers.actionsMenuCaption')}
        </Typography>
      </Paper>

      {/* User Permissions Management */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.editingMembers.userPermissions.title')}
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
          {t('teams.content.editingMembers.userPermissions.description')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.userPermissions.accessingTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {(() => {
            const steps = t('teams.content.editingMembers.userPermissions.accessingSteps', { returnObjects: true });
            if (Array.isArray(steps)) {
              return steps.map((step, index) => (
                <span key={index}>• {step.includes('Permission Required:') ? <><strong>{t('teams.content.overview.permissionRequired')}</strong> {step.split('Permission Required: ')[1]}</> : step}<br/></span>
              ));
            }
            // Fallback if not an array
            return (
              <>
                • {t('teams.content.editingMembers.userPermissions.accessingSteps.0', 'Click the three dots (⋮) in the Actions column for any team member')}<br/>
                • {t('teams.content.editingMembers.userPermissions.accessingSteps.1', 'Select "Permissions" from the dropdown menu')}<br/>
                • {t('teams.content.editingMembers.userPermissions.accessingSteps.2', 'The User Permissions interface will open showing all available permissions')}<br/>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.userPermissions.permissionRequired') }} /> {t('teams.content.editingMembers.userPermissions.accessingSteps.3', 'Must have appropriate permissions to view/modify user permissions').replace('Permission Required: ', '')}<br/>
              </>
            );
          })()}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.userPermissions.interfaceTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {t('teams.content.editingMembers.userPermissions.interfaceDescription')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.siNo')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.siNoDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.permissionName')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.permissionNameDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.description')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.descriptionDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.category')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.categoryDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.roleName')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.roleNameDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.tableColumns.actions')}</strong> {t('teams.content.editingMembers.userPermissions.tableColumns.actionsDesc')}
        </Typography>

        {/* User Permissions Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <img
         src= {isArabic ? "/assets/support/userper1-ar.webp" : "/assets/support/userper1.webp"}
           
            alt={t('teams.content.overview.altTexts.userPermissionsManagementInterface')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.editingMembers.userPermissions.interfaceCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.userPermissions.assigningTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.individualAssignment')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.individualAssignmentDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.bulkAssignment')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.bulkAssignmentDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.confirmationDialog')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.confirmationDialogDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.roleBasedAssignment')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.roleBasedAssignmentDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.searchFunction')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.searchFunctionDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.assigningSteps.categoryFilter')}</strong> {t('teams.content.editingMembers.userPermissions.assigningSteps.categoryFilterDesc')}
        </Typography>

        {/* Assign Permissions Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/userper2-ar.webp" : "/assets/support/userper2.webp"}
            
            alt={t('teams.content.editingMembers.userPermissions.assignPermissionsAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.editingMembers.userPermissions.assignPermissionsCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.userPermissions.bestPracticesTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • <strong>{t('teams.content.editingMembers.userPermissions.bestPractices.roleBasedApproach')}</strong> {t('teams.content.editingMembers.userPermissions.bestPractices.roleBasedApproachDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.bestPractices.leastPrivilege')}</strong> {t('teams.content.editingMembers.userPermissions.bestPractices.leastPrivilegeDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.bestPractices.regularReview')}</strong> {t('teams.content.editingMembers.userPermissions.bestPractices.regularReviewDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.bestPractices.documentation')}</strong> {t('teams.content.editingMembers.userPermissions.bestPractices.documentationDesc')}<br/>
          • <strong>{t('teams.content.editingMembers.userPermissions.bestPractices.securityConsideration')}</strong> {t('teams.content.editingMembers.userPermissions.bestPractices.securityConsiderationDesc')}
        </Typography>
      </Paper>

      {/* Deactivate Members */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.editingMembers.deactivateMembers.title')}
        </Typography>

        <Box
          sx={{
            bgcolor: 'rgba(0, 106, 103, 0.1)',
            p: 2,
            borderRadius: 1,
            border: '1px solid rgba(0, 106, 103, 0.2)',
            mb: 3
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'black'
            }}
          >
            <strong>{t('teams.content.editingMembers.deactivateMembers.importantNotice')}</strong> {t('teams.content.editingMembers.deactivateMembers.importantNoticeDesc')}
          </Typography>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.deactivateMembers.processTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • {t('teams.content.editingMembers.deactivateMembers.processSteps.0')}<br/>
          • {t('teams.content.editingMembers.deactivateMembers.processSteps.1')}<br/>
          • {t('teams.content.editingMembers.deactivateMembers.processSteps.2')}<br/>
          • {t('teams.content.editingMembers.deactivateMembers.processSteps.3')}
        </Typography>
      </Paper>

      {/* Delete from Organizational Hierarchy */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.editingMembers.removeFromHierarchy.title')}
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
          {t('teams.content.editingMembers.removeFromHierarchy.description')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.editingMembers.removeFromHierarchy.processTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.0')}<br/>
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.1')}<br/>
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.2')}<br/>
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.3')}<br/>
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.4')}<br/>
          • {t('teams.content.editingMembers.removeFromHierarchy.processSteps.5')}
        </Typography>

        {/* Delete Confirmation Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
            src={isArabic ? "/assets/support/deleteteammember-ar.webp" : "/assets/support/deleteteammember.webp"}
          
            alt={t('teams.content.editingMembers.removeFromHierarchy.deleteConfirmationAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.editingMembers.removeFromHierarchy.deleteConfirmationCaption')}
        </Typography>
      </Paper>
        </>
      )}
    </Box>
  );

  const renderUserTypesContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.userTypes.title')}
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
        {t('teams.content.userTypes.description')}
      </Typography>

      {/* Platform Differences Notice - Only show on mobile */}
      {platform === 'mobile' && (
        <Box
          sx={{
            bgcolor: SUPPORT_COLORS.gridBg,
            p: 3,
            borderRadius: 2,
            border: `1px solid ${SUPPORT_COLORS.gridBorder}`,
            mb: 4
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.sections.rolesPermissions.platformDifferencesRoles')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webVersionRoles.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webVersionRoles.createCustomTypes') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webVersionRoles.fullRoleManagement') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webVersionRoles.addEditDelete') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webVersionRoles.configurePermissions') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.mobileVersionRoles.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.mobileVersionRoles.selectExisting') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.mobileVersionRoles.showsPredefined') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.mobileVersionRoles.displaysCustom') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.workflowRoles') }} />
          </Typography>
        </Box>
      )}

      {/* Mobile User Roles Selection */}
      {platform === 'mobile' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.userTypes.mobileRolesTitle')}
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
            {t('teams.content.userTypes.mobileRolesDescription')}
          </Typography>

          {/* Mobile Add Employee Screenshot */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200'
            }}
          >
            <Box
              component="img"
              src={isArabic ? "/assets/support/addempMob-ar.webp" : "/assets/support/addempMob.webp"}
            
              alt={t('teams.content.userTypes.mobileAddEmployeeAlt')}
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              fontStyle: 'italic',
              textAlign: 'center',
              mb: 3
            }}
          >
            {t('teams.content.userTypes.mobileAddEmployeeCaption')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            <strong>{t('teams.content.userTypes.availableRolesTitle')}</strong><br/>
            • <strong>{t('teams.content.userTypes.availableRoles.hrAdmin')}</strong> {t('teams.content.userTypes.availableRoles.hrAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.taskAdmin')}</strong> {t('teams.content.userTypes.availableRoles.taskAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.projectAdmin')}</strong> {t('teams.content.userTypes.availableRoles.projectAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.clientAdmin')}</strong> {t('teams.content.userTypes.availableRoles.clientAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.vendorAdmin')}</strong> {t('teams.content.userTypes.availableRoles.vendorAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.generalAdmin')}</strong> {t('teams.content.userTypes.availableRoles.generalAdminDesc')}<br/>
            • <strong>{t('teams.content.userTypes.availableRoles.superAdmin')}</strong> {t('teams.content.userTypes.availableRoles.superAdminDesc')}<br/><br/>

            <strong>{t('teams.content.userTypes.roleAssignmentTitle')}</strong><br/>
            {(() => {
              const steps = t('teams.content.userTypes.roleAssignmentSteps', { returnObjects: true });
              if (Array.isArray(steps)) {
                return steps.map((step, index) => (
                  <span key={index}>• {step}<br/></span>
                ));
              }
              return <span>• {t('teams.content.userTypes.roleAssignmentSteps')}<br/></span>;
            })()}
            • {t('teams.content.overview.sections.rolesPermissions.customRolesNote')}
          </Typography>
        </Paper>
      )}

      {/* Assigning Roles During User Creation - Web Only */}
      {platform === 'web' && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.userTypes.webRolesTitle')}
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
          {t('teams.content.userTypes.webRolesDescription')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.userTypes.step1Title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {(() => {
            const instructions = t('teams.content.userTypes.step1Instructions', { returnObjects: true });
            if (Array.isArray(instructions)) {
              return instructions.map((instruction, index) => (
                <span key={index}>• {instruction.includes('Permission Required:') ? <><strong>الصلاحية مطلوبة:</strong> {instruction.split('Permission Required: ')[1]}</> : instruction}<br/></span>
              ));
            }
            // Fallback if not an array
            return (
              <>
                • {t('teams.content.userTypes.step1Instructions.0', 'Navigate to Teams → Settings → Roles and Permissions')}<br/>
                • {t('teams.content.userTypes.step1Instructions.1', 'Click on the "Roles" tab')}<br/>
                • {t('teams.content.userTypes.step1Instructions.2', 'Click the "New Role" button to create a custom role')}<br/>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.permissionRequired') }} /> {t('teams.content.userTypes.step1Instructions.3', 'Must have administrative permissions to create roles').replace('Permission Required: ', '')}<br/>
              </>
            );
          })()}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.userTypes.step2Title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {t('teams.content.userTypes.step2Description')}<br/><br/>

          <strong>{t('teams.content.userTypes.availableDefaultRoles')}</strong><br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.hrAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.hrAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.taskAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.taskAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.projectAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.projectAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.clientAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.clientAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.vendorAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.vendorAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.generalAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.generalAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.superAdmin')}</strong> {t('teams.content.userTypes.defaultRoles.superAdminDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.external')}</strong> {t('teams.content.userTypes.defaultRoles.externalDesc')}<br/>
          • <strong>{t('teams.content.userTypes.defaultRoles.internal')}</strong> {t('teams.content.userTypes.defaultRoles.internalDesc')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.userTypes.step3Title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {(() => {
            const instructions = t('teams.content.userTypes.step3Instructions', { returnObjects: true });
            if (Array.isArray(instructions)) {
              return instructions.map((instruction, index) => (
                <span key={index}>• <strong>{instruction.split(':')[0]}:</strong> {instruction.split(': ')[1]}<br/></span>
              ));
            }
            // Fallback if not an array
            return (
              <>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.userTypes.step3Instructions.0', '<strong>Role Name:</strong> Enter a descriptive name for the role') }} /><br/>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.userTypes.step3Instructions.1', '<strong>Description:</strong> Add details about the role responsibilities') }} /><br/>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.userTypes.step3Instructions.2', '<strong>Permissions:</strong> Select specific permissions for this role') }} /><br/>
                • <span dangerouslySetInnerHTML={{ __html: t('teams.content.userTypes.step3Instructions.3', '<strong>Save Role:</strong> Click Save to create the new role') }} /><br/>
              </>
            );
          })()}
        </Typography>

        {/* User Details Form Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
              src={isArabic ? "/assets/support/userdetailsweb-ar.webp" : "/assets/support/userdetailsweb.webp"}
            alt={t('teams.content.userTypes.userDetailsFormAlt')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.userTypes.userDetailsFormCaption')}
        </Typography>

        {/* Custom Roles Reference */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('teams.content.userTypes.customRolesTitle')}
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
            {t('teams.content.userTypes.customRolesDescription')}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              pl: 2
            }}
          >
            {(() => {
              const features = t('teams.content.userTypes.customRolesFeatures', { returnObjects: true });
              if (Array.isArray(features)) {
                return features.map((feature, index) => (
                  <span key={index}>• <strong>{feature.split(':')[0]}:</strong> {feature.split(': ')[1]}<br/></span>
                ));
              }
              return <span>• {t('teams.content.userTypes.customRolesFeatures')}<br/></span>;
            })()}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              mb: 3,
              fontWeight: 600,
              bgcolor: 'rgba(0, 106, 103, 0.1)',
              p: 2,
              borderRadius: 1,
              border: '1px solid rgba(0, 106, 103, 0.2)'
            }}
          >
            {t('teams.content.userTypes.customRolesReference')}
          </Typography>
        </Paper>
      </Paper>
      )}
    </Box>
  );

  const renderPermissionsContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.permissions.title')}
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
        {t('teams.content.overview.sections.rolesPermissions.description')}
      </Typography>

      {/* Platform Availability Notice - Only show on mobile */}
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
              color: 'text.primary',
              mb: 2
            }}
          >
            {t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.allManagement') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.createCustomRoles') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.editPermissions') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.deleteRoles') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.webVersionOnly.fullControl') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.mobileVersionLimited.title') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.mobileVersionLimited.cannotCreate') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.mobileVersionLimited.cannotManage') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.mobileVersionLimited.onlyAssign') }} /><br/>
            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.mobileVersionLimited.showsRoles') }} /><br/><br/>

            <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.webOnlyManagement.workflowDescription') }} />
          </Typography>
        </Box>
      )}

      {/* Roles and Permissions Management - Web Only */}
      {platform === 'web' && (
        <>
          {/* Accessing Roles and Permissions */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.accessingSettings.title')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.goToTeams') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.lookForSettings') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.clickSettings') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.permissionRequired') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step1.accessControl') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.navigateTabs') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.clickTab') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.twoSubTabs') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.rolesPermissionsTab') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.rolesTab') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.accessingSettings.step2.clickRolesTab') }} />
        </Typography>

        {/* Roles Tab Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/roletabWeb-ar.webp" : "/assets/support/roletabWeb.webp"}
            
            alt={t('teams.content.overview.altTexts.rolesPermissionsTabInterface')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.rolesTabDescription')}
        </Typography>
      </Paper>

      {/* Creating New Roles */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.title')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.description')}<br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.hrAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.taskAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.projectAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.clientAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.vendorAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.generalAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.superAdmin') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.external') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.defaultSystemRoles.internal') }} />
        </Typography>

        {/* Roles and Permissions Interface Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/rolespermissions-ar.webp" : "/assets/support/rolespermissions.webp"}
          
            alt={t('teams.content.overview.altTexts.rolesPermissionsManagementInterface')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.interfaceCaption')}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.addNewRole') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.deleteRole') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.editPermissions') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.unassignAll') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.viewPermissions') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleManagementOptions.roleAssignment') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.permissionManagement.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.permissionManagement.individualControl') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.permissionManagement.bulkRemoval') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.permissionManagement.categories') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.permissionManagement.searchFilter') }} />
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            fontWeight: 600,
            bgcolor: 'rgba(0, 106, 103, 0.1)',
            p: 2,
            borderRadius: 1,
            border: '1px solid rgba(0, 106, 103, 0.2)'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.helpNotice.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.helpNotice.description') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.lookForButton') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.permissionCheck') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.clickButton') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.dialogAppears') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.enterName') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.clickAdd') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.step3.success') }} />
        </Typography>

        {/* Add New Role Dialog Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/addrole-ar.webp" : "/assets/support/addrole.webp"}
           
            alt={t('teams.content.overview.altTexts.addNewRoleDialog')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.imageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.description')}<br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.availableInAddMember.title') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.availableInAddMember.addMemberProcess') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.availableInAddMember.userDetailsForm') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.customRoleAvailability.availableInAddMember.selectionProcess') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.availableInUserTypes') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.customRolesListed') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.availableForSelection') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.canBeAssigned') }} /><br/><br/>

          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.systemIntegration') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.integrateSeamlessly') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.appearInInterfaces') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.roleAvailability.assignToUsers') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.descriptiveNames') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.purposeBased') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.permissionPlanning') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.avoidDuplication') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.creatingCustomRoles.bestPractices.futureAssignment') }} />
        </Typography>
      </Paper>

      {/* Managing Role Permissions */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.title')}
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
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.description')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.rolePermissionInterface.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.rolePermissionInterface.roleSelection') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.rolePermissionInterface.permissionCategories') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.rolePermissionInterface.visualIndicators') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.rolePermissionInterface.managementButtons') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.clickEditButton') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.permissionsDialog') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.permissionCategories') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.individualSelection') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.selectAllOption') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.searchFunction') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editRolePermissions.saveCancel') }} />
        </Typography>

        {/* Edit Permissions Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/permissionsedit-ar.webp" : "/assets/support/permissionsedit.webp"}
           
            alt={t('teams.content.overview.altTexts.editRolePermissionsDialog')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.editPermissionsImageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.clickUnassignButton') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.confirmationDialog') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.confirmUnassign') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.cancelOperation') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignAllPermissions.warning') }} />
        </Typography>

        {/* Unassign Permissions Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          <img
         src= {isArabic ? "/assets/support/unassign-ar.webp" : "/assets/support/unassign.webp"}
           
            alt={t('teams.content.overview.altTexts.unassignAllPermissionsConfirmation')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.unassignImageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.permissionRequirements.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2,
            bgcolor: 'rgba(0, 106, 103, 0.1)',
            p: 2,
            borderRadius: 1,
            border: '1px solid rgba(0, 106, 103, 0.2)'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.managingRolePermissions.permissionRequirements.importantNote') }} />
        </Typography>
      </Paper>

      {/* Roles and Permissions Tab Interface */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            color: 'text.primary',
            mb: 3
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.rolesPermissionsTabInterface.title')}
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
          {t('teams.content.overview.sections.rolesPermissions.rolesPermissionsTabInterface.description')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.permissionsTable.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          {t('teams.content.overview.sections.permissionsTable.description')}<br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.siNo') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.permissionName') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.description') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.category') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.roleName') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.permissionsTable.tableStructure.actions') }} />
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.permissionManagement.title')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.permissionManagement.editDescription') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.permissionManagement.deleteClear') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.permissionManagement.update') }} /><br/>
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.permissionManagement.roleAssignment') }} />
        </Typography>

        {/* Edit Role and Permissions Screenshot */}
        <Box
          sx={{
            mb: 4,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: SUPPORT_COLORS.imageBg,
            p: 2,
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          <img
          src={isArabic ? "/assets/support/editroleandpermissions-ar.webp" : "/assets/support/editroleandpermissions.webp"}
           
            alt={t('teams.content.overview.altTexts.editRoleAndPermissionsInterface')}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'black',
            fontStyle: 'italic',
            textAlign: 'center',
            mb: 4
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.rolesPermissionsTabInterface.imageCaption')}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          {t('teams.content.overview.sections.rolesPermissions.rolesPermissionsTabInterface.permissionRequirementsTitle')}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3,
            pl: 2,
            bgcolor: 'rgba(0, 106, 103, 0.1)',
            p: 2,
            borderRadius: 1,
            border: '1px solid rgba(0, 106, 103, 0.2)'
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.rolesPermissions.rolesPermissionsTabInterface.roleAssignmentAccess') }} />
        </Typography>
      </Paper>
        </>
      )}
    </Box>
  );

  const renderProfilesContent = () => (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: 'text.primary',
          mb: 4
        }}
      >
        {t('teams.content.overview.sections.profileManagement.title')}
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
        {t('teams.content.overview.sections.profileManagement.description')}
      </Typography>

      {/* Web Profile Management */}
      {platform === 'web' && (
        <>
          {/* Profile Interface */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('teams.content.overview.sections.profileManagement.webProfile.title')}
            </Typography>

            {/* Profile Screenshot */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box
                component="img"
                src={isArabic ? "/assets/support/profileWeb-ar.webp" : "/assets/support/profileWeb.webp"}
                alt={t('teams.content.overview.altTexts.webTeamMemberProfileInterface')}
                sx={{
                  maxWidth: '400px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'black',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 4
              }}
            >
              {t('teams.content.overview.sections.profileManagement.webProfile.imageCaption')}
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
              {t('teams.content.overview.sections.profileManagement.webProfile.description')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3,
                pl: 2
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.personalInformation') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.taskDetails') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.performanceMetrics') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.navigationTabs') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.fullDashboard') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfile.administrativeAccess') }} />
            </Typography>
          </Paper>

          {/* Profile Access */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('teams.content.overview.sections.profileManagement.webProfileAccess.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3,
                pl: 2
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.permissionBasedAccess') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.teamMemberProfiles') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.personalProfile') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.hierarchyBased') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.fullManagement') }} />
            </Typography>

            <Box
              sx={{
                bgcolor: 'rgba(0, 106, 103, 0.1)',
                p: 2,
                borderRadius: 1,
                border: '1px solid rgba(0, 106, 103, 0.2)'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'black'
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.webProfileAccess.webAccessControl') }} />
              </Typography>
            </Box>
          </Paper>
        </>
      )}

      {/* Mobile Profile Management */}
      {platform === 'mobile' && (
        <>
          {/* Mobile Profile Interface */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('teams.content.overview.sections.profileManagement.mobileProfile.title')}
            </Typography>

            {/* Mobile Profile Screenshot */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box
                component="img"
                src={isArabic ? "/assets/support/profileviewMob-ar.webp" : "/assets/support/profileviewMob.webp"}
                alt={t('teams.content.overview.altTexts.mobileTeamMemberProfileInterface')}
                sx={{
                  maxWidth: '300px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'black',
                fontStyle: 'italic',
                textAlign: 'center',
                mb: 4
              }}
            >
              {t('teams.content.overview.sections.profileManagement.mobileProfile.imageCaption')}
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
              {t('teams.content.overview.sections.profileManagement.mobileProfile.description')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3,
                pl: 2
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfile.basicProfileInfo') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfile.limitedEditing') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfile.navigationTabs') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfile.simplifiedInterface') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfile.permissionBased') }} />
            </Typography>
          </Paper>

          {/* Mobile Profile Access */}
          <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('teams.content.overview.sections.profileManagement.mobileProfileAccess.title')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 3,
                pl: 2
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.personalProfile') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.teamMemberProfiles') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.limitedEditing') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.viewOnly') }} /><br/>
              <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.permissionBased') }} />
            </Typography>

            <Box
              sx={{
                bgcolor: 'rgba(0, 106, 103, 0.1)',
                p: 2,
                borderRadius: 1,
                border: '1px solid rgba(0, 106, 103, 0.2)'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: 'black'
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: t('teams.content.overview.sections.profileManagement.mobileProfileAccess.mobileLimitations') }} />
              </Typography>
            </Box>
          </Paper>
        </>
      )}

    </Box>
  );



  const renderContent = () => (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#006A67',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: isArabic ? 0 : 2,
            ml: isArabic ? 2 : 0
          }}
        >
          <Iconify icon={currentItem?.icon} width={24} sx={{ color: 'white' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontFamily: 'Montserrat, sans-serif',
              mb: 0.5,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {isArabic ? currentItem?.titleAr : currentItem?.title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {isArabic ? currentItem?.descriptionAr : currentItem?.description}
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
        {selectedSection === 'overview' ? renderOverviewContent() :
         selectedSection === 'add-member' ? renderAddMemberContent() :
         selectedSection === 'edit-member' ? renderEditMemberContent() :
         selectedSection === 'user-types' ? renderUserTypesContent() :
         selectedSection === 'permissions' ? renderPermissionsContent() :
         selectedSection === 'profiles' ? renderProfilesContent() :
         selectedSection === 'departments' ? renderDepartmentsContent() :
         selectedSection === 'designations' ? renderDesignationsContent() :
         selectedSection === 'employee-statuses' ? renderEmployeeStatusesContent() :
         selectedSection === 'team-notices' ? renderTeamNoticesContent() : (
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black',
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {isArabic
              ? t('teams.content.placeholderContent.arabic', { title: currentItem?.titleAr })
              : t('teams.content.placeholderContent.english', { title: currentItem?.title })
            }
          </Typography>
        )}
      </Paper>
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
      {t('teams.title2')}
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
            {t('teams.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 0.5 }} />
            {t('teams.mobile')}
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
            {t('teams.breadcrumb.support')}
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
            {t('teams.title2')}
          </Typography>
          {teamsNavigationItems.find(item => item.id === selectedSection) && (
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
                {teamsNavigationItems.find(item => item.id === selectedSection)?.title}
              </Typography>
            </>
          )}
        </Box>

        {renderContent()}
      </Container>
    </Box>
  );
}


