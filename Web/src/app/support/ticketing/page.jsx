'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import { Icon } from '@iconify/react';
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
const getTicketingNavigationItems = (t) => [
  {
    id: 'overview',
    title: t('ticketing.navigation.overview.title'),
    icon: 'solar:home-bold',
    description: t('ticketing.navigation.overview.description'),
    keywords: ['overview', 'ticketing', 'introduction', 'getting started']
  },
  {
    id: 'ticketing-projects',
    title: t('ticketing.navigation.ticketingProjects.title'),
    icon: 'solar:folder-bold',
    description: t('ticketing.navigation.ticketingProjects.description'),
    keywords: ['ticketing projects', 'create project', 'project setup', 'owners', 'members']
  },
  {
    id: 'ticket-creation',
    title: t('ticketing.navigation.ticketCreation.title'),
    icon: 'solar:add-circle-bold',
    description: t('ticketing.navigation.ticketCreation.description'),
    keywords: ['create ticket', 'ticket creation', 'raise ticket', 'issue reporting']
  },
  {
    id: 'ticket-assignment',
    title: t('ticketing.navigation.ticketAssignment.title'),
    icon: 'solar:user-plus-bold',
    description: t('ticketing.navigation.ticketAssignment.description'),
    keywords: ['assign ticket', 'ticket assignment', 'resolver', 'task assignment']
  },
  {
    id: 'ticket-management',
    title: t('ticketing.navigation.ticketManagement.title'),
    icon: 'solar:settings-bold',
    description: t('ticketing.navigation.ticketManagement.description'),
    keywords: ['ticket management', 'status tracking', 'ticket resolution', 'workflow']
  },

 
];

// Main component that receives props from CommonSidebarLayout
function TicketingContent({ platform = 'web', selectedSection = 'overview' }) {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';



  const renderOverviewContent = () => (
    <Box>
      <BodyText>
        {t('ticketing.content.overview.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src="/assets/support/Ticketingdashboard.webp"
            alt={t('ticketing.content.overview.web.imageAlt')}
            isArabic={isArabic}
          />
          
          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.overview.web.features.title')}
          </SubsectionTitle>

          <Grid container spacing={3}>
            {/* Ticket Operations */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: 'rgba(0, 106, 103, 0.05)',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#006A67' }}>
                  {t('ticketing.content.overview.web.categories.ticketOperations.title')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.ticketOperations.feature1')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.ticketOperations.feature2')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.ticketOperations.feature3')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.ticketOperations.feature4')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.ticketOperations.feature5')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* View Options */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: 'rgba(0, 106, 103, 0.05)',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#006A67' }}>
                  {t('ticketing.content.overview.web.categories.viewOptions.title')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.viewOptions.feature1')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.viewOptions.feature2')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.viewOptions.feature3')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.viewOptions.feature4')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Organizational Tools */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: 'rgba(0, 106, 103, 0.05)',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#006A67' }}>
                  {t('ticketing.content.overview.web.categories.organizationalTools.title')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.organizationalTools.feature1')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.organizationalTools.feature2')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.organizationalTools.feature3')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('ticketing.content.overview.web.categories.organizationalTools.feature4')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

         
        </Box>
      )}

      {platform === 'mobile' && (
        <Box>
          <SubsectionTitle>
            {t('ticketing.content.overview.mobile.features.title')}
          </SubsectionTitle>
          <GridBox sx={{ gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('ticketing.content.overview.mobile.features.feature1')}</FeatureText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('ticketing.content.overview.mobile.features.feature2')}</FeatureText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('ticketing.content.overview.mobile.features.feature3')}</FeatureText>
            </Box>
          </GridBox>
          <br></br>
          <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)'}}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'black',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon icon="solar:info-circle-bold" />
              {t('ticketing.content.overview.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'black',
                mt: 2
              }}
            >
              {t('ticketing.content.overview.mobile.limitations.description')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderTicketingProjectsContent = () => (
    <Box>
     
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4 }}>
        {t('ticketing.content.ticketingProjects.description')}
      </Typography>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          {/* Project Creation */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: SUPPORT_COLORS.teal,
                mb: 2
              }}
            >
              {t('ticketing.content.ticketingProjects.web.creation.title')}
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3 }}>
              {t('ticketing.content.ticketingProjects.web.creation.description')}
            </Typography>

            <SupportImage
              src="/assets/support/ticketcreate.webp"
              alt={t('ticketing.content.ticketingProjects.web.creation.imageAlt')}
              isArabic={isArabic}
            />

            {/* Permission Notice */}
            <InfoAlert sx={{
              mb: 4,
              backgroundColor: '#fff3cd !important',
              borderLeft: '4px solid #006A67 !important',
              '& .MuiAlert-icon': {
                color: '#006A67 !important'
              }
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                {t('ticketing.content.ticketingProjects.web.creation.permissionNotice.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' }}>
                {t('ticketing.content.ticketingProjects.web.creation.permissionNotice.description')}
              </Typography>
            </InfoAlert>

            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
              {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.title')}
            </Typography>

            {/* Step 1: Navigate and Create */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="1" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step1.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step1.description')}
              </Typography>
            </Box>

            {/* Step 2: Fill Basic Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="2" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step2.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step2.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 5, fontStyle: 'italic', color: 'text.secondary' }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step2.note')}
              </Typography>
            </Box>

            {/* Step 3: Select Category */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="3" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step3.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step3.description')}
              </Typography>
            </Box>

            {/* Step 4: Select Department */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="4" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step4.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step4.description')}
              </Typography>

              <SupportImage
                src={isArabic ? "/assets/support/DepartmentDropWeb-ar.webp" : "/assets/support/DepartmentDropWeb.webp"}
                alt={t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step4.imageAlt')}
                isArabic={isArabic}
                maxWidth="600px"
              />
            </Box>

            {/* Step 5: Add Project Owners */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="5" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step5.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step5.description')}
              </Typography>

              <SupportImage
                src={isArabic ? "/assets/support/AddOwnerWeb-ar.webp" : "/assets/support/AddOwnerWeb.webp"}
                alt={t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step5.imageAlt')}
                isArabic={isArabic}
                maxWidth="600px"
              />
            </Box>

            {/* Step 6: Add Project Members */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="6" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step6.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step6.description')}
              </Typography>

              <SupportImage
                src={isArabic ? "/assets/support/AddMemberWeb-ar.webp" : "/assets/support/AddMemberWeb.webp"}
                alt={t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step6.imageAlt')}
                isArabic={isArabic}
                maxWidth="600px"
              />
            </Box>

            {/* Step 7: Save Project */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                <Chip label="7" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px', mr: 2 }} />
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step7.title')}
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 5 }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step7.description')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 5, fontStyle: 'italic', color: 'text.secondary' }}>
                {t('ticketing.content.ticketingProjects.web.creation.detailedSteps.step7.note')}
              </Typography>
            </Box>
          </Box>



          {/* Project Editing Section */}
          <Box sx={{ mt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: SUPPORT_COLORS.teal,
                mb: 3
              }}
            >
              {t('ticketing.content.ticketingProjects.web.editing.title')}
            </Typography>

            {/* Editing Permission Notice */}
            <InfoAlert sx={{
              mb: 4,
              backgroundColor: '#fff3cd !important',
              borderLeft: '4px solid #006A67 !important',
              '& .MuiAlert-icon': {
                color: '#006A67 !important'
              }
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
                {t('ticketing.content.ticketingProjects.web.editing.permissionNotice.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' }}>
                {t('ticketing.content.ticketingProjects.web.editing.permissionNotice.description')}
              </Typography>
            </InfoAlert>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', mb: 3 }}>
              {t('ticketing.content.ticketingProjects.web.editing.description')}
            </Typography>

            <SupportImage
              src={isArabic ? "/assets/support/editticketproject-ar.webp" : "/assets/support/editticketproject.webp"}
              alt={t('ticketing.content.ticketingProjects.web.editing.imageAlt')}
              isArabic={isArabic}
              maxWidth="800px"
            />

            {/* Project Editing Process - Moved after image */}
            <Paper
              sx={{
                p: 3,
                mb: 4,
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                border: '1px solid rgba(0, 106, 103, 0.1)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                {t('ticketing.content.ticketingProjects.web.editing.process.title')}
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="1" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('ticketing.content.ticketingProjects.web.editing.process.step1')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="2" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('ticketing.content.ticketingProjects.web.editing.process.step2')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="3" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('ticketing.content.ticketingProjects.web.editing.process.step3')} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Chip label="4" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('ticketing.content.ticketingProjects.web.editing.process.step4')} />
                </ListItem>
              </List>
            </Paper>

            <Grid container spacing={3}>
              {/* Who Can Edit */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'rgba(0, 106, 103, 0.05)',
                    border: '1px solid rgba(0, 106, 103, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                    {t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.title')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:crown-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.projectOwners')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.projectOwnersDesc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:shield-user-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.adminUsers')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.adminUsersDesc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:key-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.permissionUsers')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whoCanEdit.permissionUsersDesc')}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* What Can Be Edited */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'rgba(0, 106, 103, 0.05)',
                    border: '1px solid rgba(0, 106, 103, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                    {t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.title')}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:document-text-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.projectDetails')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.projectDetailsDesc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:users-group-two-rounded-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.teamAssignments')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.teamAssignmentsDesc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:widget-4-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.allFields')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.allFieldsDesc')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Icon icon="solar:settings-bold" width={20} style={{ color: '#006A67' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.projectSettings')}
                        secondary={t('ticketing.content.ticketingProjects.web.editing.whatCanBeEdited.projectSettingsDesc')}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>


            </Grid>
          </Box>

        </Box>
      )}

      {platform === 'mobile' && (
           <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)'}}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'black',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon icon="solar:info-circle-bold" />
              {t('ticketing.content.overview.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'black',
                mt: 2
              }}
            >
              {t('ticketing.content.overview.mobile.limitations.description')}
            </Typography>
          </Box>
      )}
    </Box>
  );

  const renderTicketCreationContent = () => (
    <Box>
      <BodyText>
        {t('ticketing.content.ticketCreation.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.process.title')}
          </SubsectionTitle>

          <BodyText sx={{ mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.process.description')}
          </BodyText>

          <SupportImage
            src={isArabic ? "/assets/support/tickettask-ar.webp" : "/assets/support/tickettask.webp"}
            alt={t('ticketing.content.ticketCreation.web.process.imageAlt')}
            isArabic={isArabic}
          />

          <InfoAlert sx={{
            mt: 3,
            backgroundColor: '#fff3cd !important',
            borderLeft: '4px solid #006A67 !important',
            '& .MuiAlert-icon': {
              color: '#006A67 !important'
            }
          }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t('ticketing.content.ticketCreation.web.whoCanCreate.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' }}>
              {t('ticketing.content.ticketCreation.web.whoCanCreate.description')}
            </Typography>
          </InfoAlert>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.steps.title')}
          </SubsectionTitle>

          <List>
            <ListItem>
              <ListItemIcon>
                <Chip label="1" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
              </ListItemIcon>
              <ListItemText primary={t('ticketing.content.ticketCreation.web.steps.step1')} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="2" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
              </ListItemIcon>
              <ListItemText primary={t('ticketing.content.ticketCreation.web.steps.step2')} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="3" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
              </ListItemIcon>
              <ListItemText primary={t('ticketing.content.ticketCreation.web.steps.step3')} />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Chip label="4" sx={{ bgcolor: '#006A67', color: 'white', minWidth: '24px', height: '24px' }} />
              </ListItemIcon>
              <ListItemText primary={t('ticketing.content.ticketCreation.web.steps.step4')} />
            </ListItem>
          </List>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.formFields.title')}
          </SubsectionTitle>

          <Grid container spacing={3}>
            {/* Available Fields */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.formFields.availableFields.title')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.formFields.availableFields.ticketId')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.formFields.availableFields.description')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.formFields.availableFields.priority')} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            </Grid>


          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.creatorActions.title')}
          </SubsectionTitle>
         

            {/* Creator Actions */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={t('ticketing.content.ticketCreation.web.creatorActions.delete')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={t('ticketing.content.ticketCreation.web.creatorActions.view')}
                  />
                </ListItem>
              </List>
              </Paper>
          
          </Grid>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.ticketDetails.title')}
          </SubsectionTitle>

          <BodyText sx={{ mb: 3 }}>
            {t('ticketing.content.ticketCreation.web.ticketDetails.description')}
          </BodyText>

          {/* Support Image */}
          <SupportImage
            src={isArabic ? "/assets/support/ticketdetailsoverview-ar.webp" : "/assets/support/ticketdetailsoverview.webp"}
            alt={t('ticketing.content.ticketCreation.web.ticketDetails.overview.imageAlt')}
            sx={{ mb: 4 }}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.overview.title')}
                </Typography>

               
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.overview.description')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.overview.ticketDescription')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.overview.additionalDetails')} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.comments.title')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.comments.description')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.comments.addComments')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.comments.teamResponses')} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.attachments.title')}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2 }}>
                  {t('ticketing.content.ticketCreation.web.ticketDetails.attachments.description')}
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.attachments.uploadFiles')} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('ticketing.content.ticketCreation.web.ticketDetails.attachments.shareImages')} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
             
          </Grid>
     

        </Box>
      )}

      {platform === 'mobile' && (
          <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)'}}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'black',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Icon icon="solar:info-circle-bold" />
              {t('ticketing.content.overview.mobile.limitations.title')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'black',
                mt: 2
              }}
            >
              {t('ticketing.content.overview.mobile.limitations.description')}
            </Typography>
          </Box>
      )}
    </Box>
  );
  const renderTicketAssignmentContent = () => (
    <Box>
      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
      <BodyText>
        {t('ticketing.content.ticketAssignment.description')}
      </BodyText>

      <SupportImage
        src={isArabic ? "/assets/support/ticketassigne-ar.webp" : "/assets/support/ticketassigne.webp"}
        alt={t('ticketing.content.ticketAssignment.imageAlt')}
        isArabic={isArabic}
      />

      <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
        {t('ticketing.content.ticketAssignment.navigation.title')}
      </SubsectionTitle>

      <BodyText sx={{ mb: 3 }}>
        {t('ticketing.content.ticketAssignment.navigation.description')}
      </BodyText>

      <Grid container spacing={3}>
        {/* Navigation Steps */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketAssignment.navigation.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.navigation.step1')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.navigation.step2')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.navigation.step3')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.navigation.step4')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Who Can Assign */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketAssignment.whoCanAssign.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.whoCanAssign.projectOwners')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.whoCanAssign.projectMembers')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Ticket Creator Limitations */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketAssignment.ticketCreator.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.ticketCreator.cannotAssign')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.ticketCreator.canBeAssigned')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.ticketCreator.canViewStatus')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Viewing Assigned Tickets */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketAssignment.viewingTickets.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.viewingTickets.ticketsTab')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.viewingTickets.allocatedTab')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Ticket Task Actions */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketAssignment.ticketTaskActions.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketAssignment.ticketTaskActions.assignAction')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* External Users Note */}
        <Grid item xs={12}>
          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t('ticketing.content.ticketAssignment.externalUsersNote.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' }}>
              {t('ticketing.content.ticketAssignment.externalUsersNote.description')}
            </Typography>
          </InfoAlert>
        </Grid>
      </Grid>
        </Box>
      )}
      {platform === 'mobile' && (
    <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)'}}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          color: 'black',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Icon icon="solar:info-circle-bold" />
        {t('ticketing.content.overview.mobile.limitations.title')}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          color: 'black',
          mt: 2
        }}
      >
        {t('ticketing.content.overview.mobile.limitations.description')}
      </Typography>
        </Box>
      )}
    </Box>
  );


  const renderTicketManagementContent = () => (
    <Box>
      <BodyText>
        {t('ticketing.content.ticketManagement.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src={isArabic ? "/assets/support/ticketassigne-ar.webp" : "/assets/support/ticketassigne.webp"}
            alt={t('ticketing.content.ticketManagement.imageAlt')}
            isArabic={isArabic}
          />

          <Grid container spacing={3}>
        {/* How to Complete Ticket Task */}
        <Grid item xs={12}>
          <SubsectionTitle title={t('ticketing.content.ticketManagement.howToComplete.title')} />
          <BodyText text={t('ticketing.content.ticketManagement.howToComplete.description')} />

          <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2, mt: 3 }}>
            {t('ticketing.content.ticketManagement.howToComplete.steps.title')}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToComplete.steps.step1')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToComplete.steps.step2')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToComplete.steps.step3')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToComplete.steps.step4')} />
            </ListItem>
          </List>
        </Grid>

        {/* How to Change Status */}
        <Grid item xs={12}>
          <SubsectionTitle title={t('ticketing.content.ticketManagement.howToChangeStatus.title')} />
          <BodyText text={t('ticketing.content.ticketManagement.howToChangeStatus.description')} />

          <SupportImage
            src={isArabic ? "/assets/support/ProjectStatusWeb-ar.webp" : "/assets/support/ProjectStatusWeb.webp"}
            alt={t('ticketing.content.ticketManagement.howToChangeStatus.imageAlt')}
          />

          <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2, mt: 3 }}>
            {t('ticketing.content.ticketManagement.howToChangeStatus.process.title')}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.process.step1')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.process.step2')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.process.step3')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.process.step4')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.process.step5')} />
            </ListItem>
          </List>

          <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2, mt: 3 }}>
            {t('ticketing.content.ticketManagement.howToChangeStatus.statusFlow.title')}
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.statusFlow.notStarted')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.statusFlow.inProgress')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.statusFlow.completed')} />
            </ListItem>
            <ListItem>
              <ListItemText primary={t('ticketing.content.ticketManagement.howToChangeStatus.statusFlow.visibility')} />
            </ListItem>
          </List>
        </Grid>

    

        {/* Ticket Overview Access */}
        <Grid item xs={12}>
          <SubsectionTitle title={t('ticketing.content.ticketManagement.ticketOverview.title')} />
          <BodyText text={t('ticketing.content.ticketManagement.ticketOverview.description')} />

          <Paper
            sx={{
              p: 3,
              mt: 2,
              backgroundColor: '#f8f9fa',
              border: '1px solid rgba(0, 106, 103, 0.1)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2 }}>
              {t('ticketing.content.ticketManagement.ticketOverview.viewableInfo.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.viewableInfo.issuerDetails')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.viewableInfo.ticketDescription')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.viewableInfo.attachments')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.viewableInfo.timeline')} />
              </ListItem>
            </List>

            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A67', mb: 2, mt: 3 }}>
              {t('ticketing.content.ticketManagement.ticketOverview.permissions.title')}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.permissions.viewOnly')} />
              </ListItem>
              <ListItem>
                <ListItemText primary={t('ticketing.content.ticketManagement.ticketOverview.permissions.canAddDocuments')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>

   
        {/* Automatic Completion */}
        <Grid item xs={12}>
          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t('ticketing.content.ticketManagement.automaticCompletion.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' }}>
              {t('ticketing.content.ticketManagement.automaticCompletion.description')}
            </Typography>
          </InfoAlert>
          </Grid>
          </Grid>
        </Box>
      )}
      {platform === 'mobile' && (
        <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid rgba(33, 150, 243, 0.2)'}}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'black',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Icon icon="solar:info-circle-bold" />
            {t('ticketing.content.overview.mobile.limitations.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'black',
              mt: 2
            }}
          >
            {t('ticketing.content.overview.mobile.limitations.description')}
          </Typography>
        </Box>
      )}
    </Box>
  );

 

 

  // Render content based on selected section
  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent();
      case 'ticketing-projects':
        return renderTicketingProjectsContent();
      case 'ticket-creation':
        return renderTicketCreationContent();
      case 'ticket-assignment':
        return renderTicketAssignmentContent();
      case 'ticket-management':
        return renderTicketManagementContent();
     
    
      default:
        return renderOverviewContent();
    }
  };

  return renderContent();
}

// Main exported component
export default function TicketingPage() {
  const { t } = useTranslation('support');
  const navigationItems = getTicketingNavigationItems(t);

  return (
    <CommonSidebarLayout
      moduleKey="ticketing"
      navigationItems={navigationItems}
      defaultSection="overview"
      backUrl="/support/getting-started"
      contentComponent={TicketingContent}
    />
  );
}

