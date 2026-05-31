'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { SUPPORT_COLORS } from '../components/common-sidebar-layout';
import {
  CommonSidebarLayout,
  SupportImage,
  SectionTitle,
  SubsectionTitle,
  BodyText,
  InfoAlert,
  FeatureText,
  GridBox,
  SupportIcon,
} from '../components/common-sidebar-layout';

// ----------------------------------------------------------------------

export default function FilesManagementPage() {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';

  const getNavigationItems = (t) => [
    {
      id: 'overview',
      title: t('filesManagement.navigation.overview.title'),
      icon: 'solar:folder-bold',
      description: t('filesManagement.navigation.overview.description')
    },
    {
      id: 'file-operations',
      title: t('filesManagement.navigation.fileOperations.title'),
      icon: 'solar:file-text-bold',
      description: t('filesManagement.navigation.fileOperations.description')
    },
    {
      id: 'folder-management',
      title: t('filesManagement.navigation.folderManagement.title'),
      icon: 'solar:folder-with-files-bold',
      description: t('filesManagement.navigation.folderManagement.description')
    },
    {
      id: 'sharing-permissions',
      title: t('filesManagement.navigation.sharingPermissions.title'),
      icon: 'solar:share-bold',
      description: t('filesManagement.navigation.sharingPermissions.description')
    },
    {
      id: 'search-filter',
      title: t('filesManagement.navigation.searchFilter.title'),
      icon: 'solar:magnifer-bold',
      description: t('filesManagement.navigation.searchFilter.description')
    }
  ];

  const navigationItems = getNavigationItems(t);

  // Overview Content
  const renderOverviewContent = (platform) => (
    <Box>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4, color: 'text.secondary' }}>
        {t('filesManagement.content.webContent.overview.description')}
      </Typography>

      {platform === 'web' && (

        <Box sx={{ mb: 4 }}>
            <SupportImage
            src="/assets/support/filesMangementWeb.webp"
            alt={isArabic ? "واجهة إدارة الملفات - عرض شامل لنظام إدارة الملفات في نوفوتاك" : "Files Management Interface - Comprehensive view of NovoTak's file management system"}
            caption={isArabic ? "واجهة إدارة الملفات - عرض شامل لنظام إدارة الملفات مع المجلدات المنظمة وضوابط المشاركة" : "Files Management Interface - Comprehensive view of file management system with organized folders and sharing controls"}
            isArabic={isArabic}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: SUPPORT_COLORS.teal,
                  mb: 2
                }}
              >
                {t('filesManagement.content.webContent.folderStructure.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: SUPPORT_COLORS.teal }}>
                    {t('filesManagement.content.webContent.folderStructure.systemFolder.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 1, mt: 0.5, color: 'text.primary' }}>
                    {t('filesManagement.content.webContent.folderStructure.systemFolder.description')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: SUPPORT_COLORS.teal }}>
                    {t('filesManagement.content.webContent.folderStructure.generalFolder.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 1, mt: 0.5, color: 'text.primary' }}>
                    {t('filesManagement.content.webContent.folderStructure.generalFolder.description')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: SUPPORT_COLORS.teal,
                  mb: 2
                }}
              >
                {t('filesManagement.content.webContent.folderStructure.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: SUPPORT_COLORS.teal }}>
                    {t('filesManagement.content.webContent.searchCapabilities.advancedFiltering.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 1, mt: 0.5, color: 'text.primary' }}>
                    {t('filesManagement.content.webContent.searchCapabilities.advancedFiltering.description')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: SUPPORT_COLORS.teal }}>
                    {t('filesManagement.content.webContent.searchCapabilities.dateRangeSelection.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 1, mt: 0.5, color: 'text.primary' }}>
                    {t('filesManagement.content.webContent.searchCapabilities.dateRangeSelection.description')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* File Manager Dashboard Structure Section */}
          <Box sx={{ mt: 5, mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              {t('filesManagement.content.webContent.dashboardStructure.systemFolders.title')}
            </Typography>

            <SupportImage
              src="/assets/support/SystemWebFolder.webp"
              alt={isArabic ? "هيكل لوحة تحكم مدير الملفات - عرض المجلدات النظامية والعامة" : "File Manager Dashboard Structure - System and General folders view"}
              caption={isArabic ? "هيكل لوحة تحكم مدير الملفات مع المجلدات النظامية المنشأة تلقائياً والمجلدات العامة" : "File Manager Dashboard Structure with automatically created System folders and General folders"}
              isArabic={isArabic}
            />

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.dashboardStructure.description')}
            </Typography>

            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
              {t('filesManagement.content.webContent.dashboardStructure.systemFolders.title')}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
                {t('filesManagement.content.webContent.dashboardStructure.systemFolders.automaticallyCreated')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
                • {t('filesManagement.content.webContent.dashboardStructure.systemFolders.myShared')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
                • {t('filesManagement.content.webContent.dashboardStructure.systemFolders.clients')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
                • {t('filesManagement.content.webContent.dashboardStructure.systemFolders.projects')}
              </Typography>

              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
                <strong style={{ color: 'text.primary' }}>{t('filesManagement.content.webContent.dashboardStructure.systemFolders.additionalFolders')}</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, color: 'text.primary' }}>
                {t('filesManagement.content.webContent.dashboardStructure.systemFolders.additionalDescription')}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
              {t('filesManagement.content.webContent.dashboardStructure.generalFolders.title')}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
                {t('filesManagement.content.webContent.dashboardStructure.generalFolders.userCreated')}
              </Typography>
              {(() => {
                const features = t('filesManagement.content.webContent.dashboardStructure.generalFolders.features', { returnObjects: true });
                return Array.isArray(features) ? features.map((feature, index) => (
                  <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
                    • {feature}
                  </Typography>
                )) : null;
              })()}
            </Box>



            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
                <Icon icon="solar:info-circle-bold" style={{ color: SUPPORT_COLORS.teal, marginRight: '8px' }} />
                {t('filesManagement.content.webContent.dashboardStructure.infoAlert.title')}:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
                {t('filesManagement.content.webContent.dashboardStructure.infoAlert.description')}
              </Typography>
            </Box>
          </Box>

        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('filesManagement.content.overview.mobile.features.title')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/FileManagerMob-ar.webp"
              alt={isArabic ? "واجهة مدير الملفات على الهاتف المحمول - عرض شامل لنظام إدارة الملفات" : "Mobile File Manager Interface - Comprehensive view of file management system"}
              caption={isArabic ? "واجهة مدير الملفات على الهاتف المحمول مع خيارات الوصول السريع والتنقل المبسط" : "Mobile File Manager interface with quick access options and simplified navigation"}
              isArabic={isArabic}
              style={{ maxWidth: '250px', height: 'auto' }}
            />
          </Box>

          <GridBox sx={{ gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('filesManagement.content.webContent.overview.features.0')}</FeatureText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('filesManagement.content.webContent.overview.features.1')}</FeatureText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('filesManagement.content.webContent.overview.features.2')}</FeatureText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Icon icon="solar:check-circle-bold" style={{ color: SUPPORT_COLORS.teal, fontSize: '20px' }} />
              <FeatureText>{t('filesManagement.content.webContent.overview.features.3')}</FeatureText>
            </Box>
          </GridBox>

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mt: 4,
              mb: 2
            }}
          >
            {t('filesManagement.content.mobileContent.navigation.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'text.primary',
              mt: 2,
              mb: 3
            }}
          >
            {t('filesManagement.content.mobileContent.overview.description')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mt: 3,
              mb: 2
            }}
          >
            {t('filesManagement.content.mobileContent.fileOrganization.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.mobileContent.fileOrganization.systemFolders.title')}</strong>
            </Typography>

            <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
              <SupportImage
                src="/assets/support/SystemFolderViewMob.webp"
                alt={isArabic ? "عرض المجلدات النظامية على الهاتف المحمول - واجهة تنظيم الملفات" : "Mobile System Folders View - File organization interface"}
                caption={isArabic ? "عرض المجلدات النظامية على الهاتف المحمول مع التنقل المبسط وخيارات الوصول السريع" : "Mobile System Folders view with simplified navigation and quick access options"}
                isArabic={isArabic}
                style={{ maxWidth: '250px', height: 'auto' }}
              />
            </Box>

            {(() => {
              const items = t('filesManagement.content.mobileContent.fileOrganization.systemFolders.items', { returnObjects: true });
              return Array.isArray(items) ? items.map((item, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
                  • {item}
                </Typography>
              )) : null;
            })()}

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.mobileContent.fileOrganization.generalFolders.title')}</strong>
            </Typography>

            <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
              <SupportImage
                src="/assets/support/GeneralfolderViewMob.webp"
                alt={isArabic ? "عرض المجلدات العامة على الهاتف المحمول - واجهة إدارة المجلدات المخصصة" : "Mobile General Folders View - Custom folder management interface"}
                caption={isArabic ? "عرض المجلدات العامة على الهاتف المحمول مع إمكانيات إنشاء وتنظيم المجلدات المخصصة" : "Mobile General Folders view with custom folder creation and organization capabilities"}
                isArabic={isArabic}
                style={{ maxWidth: '250px', height: 'auto' }}
              />
            </Box>

            {(() => {
              const items = t('filesManagement.content.mobileContent.fileOrganization.generalFolders.items', { returnObjects: true });
              return Array.isArray(items) ? items.map((item, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === 1 ? 2 : 1, color: 'text.primary' }}>
                  • {item}
                </Typography>
              )) : null;
            })()}
          </Box>
        </Box>
      )}
    </Box>
  );

  // File Operations Content
  const renderFileOperationsContent = (platform) => (
    <Box>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4, color: 'text.secondary' }}>
        {t('filesManagement.content.webContent.fileOperations.description')}
      </Typography>

      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.fileOperations.creatingFiles.title')}
          </Typography>

          <SupportImage
            src="/assets/support/FileManagerWeb.webp"
            alt={isArabic ? "واجهة مدير الملفات - عرض شامل لعمليات إدارة الملفات" : "File Manager Interface - Comprehensive view of file operations"}
            caption={isArabic ? "واجهة مدير الملفات مع خيارات إنشاء وإدارة الملفات والمجلدات" : "File Manager interface with file and folder creation and management options"}
            isArabic={isArabic}
          />

          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, mt: 2, color: 'text.primary' }}>
            {t('filesManagement.content.webContent.fileOperations.accessDescription')}
          </Typography>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.fileOperations.dashboardStructure.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.dashboardStructure.systemFolder.title')}
            </Typography>
            {t('filesManagement.content.webContent.fileOperations.dashboardStructure.systemFolder.features', { returnObjects: true }).map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            ))}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.dashboardStructure.generalFolder.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.dashboardStructure.generalFolder.description')}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.fileOperations.creatingFiles.title')}
          </Typography>

          <SupportImage
            src="/assets/support/AddgeneralFolderFile.webp"
            alt={isArabic ? "نموذج إضافة المستندات - واجهة إنشاء الملفات والمجلدات" : "Document Add Form - File and folder creation interface"}
            caption={isArabic ? "نموذج إضافة المستندات مع جميع الحقول المطلوبة لإنشاء الملفات والمجلدات" : "Document add form with all required fields for creating files and folders"}
            isArabic={isArabic}
          />

          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.slNo')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.creator')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.type')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.name')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.addMembers')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.size')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.modified')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.creatingFiles.formFields.save')}
            </Typography>
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              {t('filesManagement.content.webContent.fileOperations.memberSelectionAlert.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.memberSelectionAlert.description')}
            </Typography>
          </InfoAlert>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.fileOperations.mobile.quickActions.title')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/FileFolderMob.webp"
              alt={isArabic ? "واجهة الملفات والمجلدات على الهاتف المحمول" : "Mobile File and Folder Interface"}
              caption={isArabic ? "واجهة إدارة الملفات والمجلدات على الهاتف المحمول مع خيارات الإنشاء والمشاركة" : "Mobile file and folder management interface with creation and sharing options"}
              isArabic={isArabic}
              style={{ maxWidth: '250px', height: 'auto' }}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, mt: 2 }}>
            <strong>{t('filesManagement.content.webContent.mobileFileOperations.creatingFolders.title')}</strong>
          </Typography>
          {(() => {
            const steps = t('filesManagement.content.webContent.mobileFileOperations.creatingFolders.steps', { returnObjects: true });
            return Array.isArray(steps) ? steps.map((step, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === steps.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • {step}
              </Typography>
            )) : null;
          })()}

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
            <strong>{t('filesManagement.content.webContent.mobileFileOperations.uploadingFiles.title')}</strong>
          </Typography>
          {(() => {
            const steps = t('filesManagement.content.webContent.mobileFileOperations.uploadingFiles.steps', { returnObjects: true });
            return Array.isArray(steps) ? steps.map((step, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === steps.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • {step}
              </Typography>
            )) : null;
          })()}

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
            <strong>{t('filesManagement.content.webContent.mobileFileOperations.sharingOptions.title')}</strong>
          </Typography>
          {(() => {
            const options = t('filesManagement.content.webContent.mobileFileOperations.sharingOptions.options', { returnObjects: true });
            return Array.isArray(options) ? options.map((option, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === options.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • <strong>{option.type}</strong> {option.description}
              </Typography>
            )) : null;
          })()}

          {/* Dialog Interactions & File Management */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, mt: 3 }}>
            <strong>{t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.title')}</strong>
          </Typography>

          {/* Folder Creation Dialog */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', mb: 2, ml: 4, fontWeight: 600, color: 'text.primary' }}>
            {t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.folderCreationDialog.title')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/FolderCreateMob.webp"
              alt={isArabic ? "حوار إنشاء المجلد على الهاتف المحمول - واجهة إعداد المجلد مع خيارات المشاركة" : "Mobile Create Folder Dialog - Folder setup interface with sharing options"}
              caption={isArabic ? "حوار إنشاء المجلد مع حقل الاسم وخيارات المشاركة الشاملة" : "Create Folder dialog with name field and comprehensive sharing options"}
              isArabic={isArabic}
              style={{ maxWidth: '250px', height: 'auto' }}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', mb: 2, ml: 4, color: 'text.secondary' }}>
            {t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.folderCreationDialog.description')}
          </Typography>
          {(() => {
            const features = t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.folderCreationDialog.features', { returnObjects: true });
            return Array.isArray(features) ? features.map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 6, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            )) : null;
          })()}

          {/* File Attachment Options */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', mb: 2, ml: 4, fontWeight: 600, color: 'text.primary' }}>
            {t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.fileAttachment.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', mb: 2, ml: 4, color: 'text.secondary' }}>
            {t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.fileAttachment.description')}
          </Typography>
          {(() => {
            const features = t('filesManagement.content.webContent.mobileFileOperations.dialogInteractions.fileAttachment.features', { returnObjects: true });
            return Array.isArray(features) ? features.map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 6, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            )) : null;
          })()}

          {/* Sharing Dialog & Access Control Section */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: SUPPORT_COLORS.teal,
                mb: 2
              }}
            >
              {t('filesManagement.content.webContent.fileOperations.mobile.sharingDialog.title')}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.mobile.sharingDialog.description')}
            </Typography>
          </Box>

          {/* File/Folder Actions Section */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: SUPPORT_COLORS.teal,
                mb: 2
              }}
            >
              {t('filesManagement.content.webContent.fileOperations.mobile.fileFolderActions.title')}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.mobile.fileFolderActions.description')}
            </Typography>

            <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
              <SupportImage
                src="/assets/support/fileactionsMob.webp"
                alt={isArabic ? "إجراءات الملفات على الهاتف المحمول - خيارات التحرير وعرض الأعضاء والحذف والإلغاء" : "Mobile File Actions - Edit, View members, Delete, and Cancel options"}
                caption={isArabic ? "لوحة إجراءات الملفات على الهاتف المحمول مع خيارات التحرير وعرض الأعضاء والحذف والإلغاء" : "Mobile file actions panel with Edit, View members, Delete, and Cancel options"}
                isArabic={isArabic}
                style={{ maxWidth: '250px', height: 'auto' }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <>
          {/* File Actions Section - Edit, Share, Delete */}
          <Box sx={{ mt: 5, mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: SUPPORT_COLORS.teal,
                mb: 3
              }}
            >
              {t('filesManagement.content.webContent.fileOperations.fileActionsMenu.title')}
            </Typography>

        <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.secondary' }}>
          {t('filesManagement.content.webContent.fileOperations.fileActionsMenu.description')}
        </Typography>

        <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 2 }}>
          <SupportImage
            src="/assets/support/fileactions.webp"
            alt={isArabic ? "قائمة إجراءات الملفات - خيارات التحرير والمشاركة والحذف" : "File Actions Menu - Edit, Share, and Delete options"}
            caption={isArabic ? "قائمة إجراءات الملفات مع خيارات التحرير والمشاركة والحذف المتاحة" : "File actions menu with available edit, share, and delete options"}
            isArabic={isArabic}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2 }}>
            {t('filesManagement.content.webContent.fileOperations.availableActions.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.availableActions.edit.title')}</strong>
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.fileOperations.availableActions.edit.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === 2 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.availableActions.share.title')}</strong>
            </Typography>
            {t('filesManagement.content.webContent.fileOperations.availableActions.share.features', { returnObjects: true }).map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === 3 ? 2 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            ))}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.availableActions.delete.title')}</strong>
            </Typography>
            {t('filesManagement.content.webContent.fileOperations.availableActions.delete.features', { returnObjects: true }).map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === 2 ? 2 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            ))}
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
              <Icon icon="solar:info-circle-bold" style={{ color: SUPPORT_COLORS.teal, marginRight: '8px' }} />
              {t('filesManagement.content.webContent.fileOperations.fileActionPermissions.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              {t('filesManagement.content.webContent.fileOperations.fileActionPermissions.description')}
            </Typography>
          </InfoAlert>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 4 }}>
            {t('filesManagement.content.webContent.fileOperations.sharingDialog.title')}
          </Typography>

          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.secondary' }}>
            {t('filesManagement.content.webContent.fileOperations.sharingDialog.description')}
          </Typography>

          <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/ShareDialogueWeb.webp"
              alt={isArabic ? "حوار المشاركة - خيارات التحكم في الوصول للملفات والمجلدات" : "Share Dialog - File and folder access control options"}
              caption={isArabic ? "واجهة حوار المشاركة مع خيارات اختيار الأعضاء والتحكم في الوصول" : "Share dialog interface with member selection and access control options"}
              isArabic={isArabic}
            />
          </Box>

          <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/ShareDialogue1.webp"
              alt={isArabic ? "تفاصيل حوار المشاركة - قائمة الأعضاء وخيارات التحديد" : "Share Dialog Details - Member list and selection options"}
              caption={isArabic ? "عرض تفصيلي لحوار المشاركة مع قائمة الأعضاء المتاحين للاختيار" : "Detailed view of share dialog with available member list for selection"}
              isArabic={isArabic}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareForAll.title')}</strong> - {t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareForAll.subtitle')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareForAll.description')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareWithMe.title')}</strong> - {t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareWithMe.subtitle')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.shareWithMe.description')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.selectMembers.title')}</strong> - {t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.selectMembers.subtitle')}
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.fileOperations.sharingDialog.memberSelection.selectMembers.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}
          </Box>

          <InfoAlert sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              <strong>Visibility Control:</strong> {t('filesManagement.content.webContent.fileOperations.sharingDialog.visibilityControl')}
            </Typography>
          </InfoAlert>
        </Box>
      </Box>
        </>
      )}
    </Box>
  );

  // Folder Management Content
  const renderFolderManagementContent = (platform) => (
    <Box>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4, color: 'text.secondary' }}>
        {t('filesManagement.content.webContent.folderManagement.description')}
      </Typography>

      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.folderManagement.fileAndFolderActions.title')}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.primary' }}>
            {t('filesManagement.content.webContent.folderManagement.fileAndFolderActions.description')}
          </Typography>

          <SupportImage
            src="/assets/support/filesMangementWeb.webp"
            alt={isArabic ? "قائمة إدارة المجلدات - خيارات التحرير والمشاركة والحذف" : "Folder Management Menu - Edit, Share, and Delete options"}
            caption={isArabic ? "قائمة إدارة المجلدات مع خيارات التحرير والمشاركة والحذف المتاحة" : "Folder management menu with available edit, share, and delete options"}
            isArabic={isArabic}
          />

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.folderManagement.folderStructure.title')}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.folderStructure.unlimitedNested.title')}</strong>
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.folderManagement.folderStructure.unlimitedNested.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.folderStructure.sharingControls.title')}</strong>
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.folderManagement.folderStructure.sharingControls.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.folderManagement.fileInfoPanel.title')}
          </Typography>



          <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/fileinfoWeb.webp"
              alt={isArabic ? "واجهة معلومات الملف على الويب - عرض شامل لتفاصيل الملف" : "Web File Info Interface - Comprehensive file details view"}
              caption={isArabic ? "واجهة معلومات الملف على الويب مع عرض شامل للبيانات الوصفية والخيارات" : "Web file info interface with comprehensive metadata and options display"}
              isArabic={isArabic}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.folderManagement.fileInfoPanel.description')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.fileInfoPanel.fileDetails.title')}</strong>
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.folderManagement.fileInfoPanel.fileDetails.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.fileInfoPanel.actionButtons.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.folderManagement.fileInfoPanel.actionButtons.open')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.folderManagement.fileInfoPanel.actionButtons.download')}</strong>
            </Typography>

            <InfoAlert>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
                <Icon icon="solar:info-circle-bold" style={{ color: SUPPORT_COLORS.teal, marginRight: '8px' }} />
                {t('filesManagement.content.webContent.folderManagement.fileInfoPanel.infoAlert.title')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
                {t('filesManagement.content.webContent.folderManagement.fileInfoPanel.infoAlert.description')}
              </Typography>
            </InfoAlert>
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.folderManagement.availableActions.title')}
          </Typography>

          <Box sx={{ maxWidth: '200px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/fileactions.webp"
              alt={isArabic ? "قائمة إجراءات الملفات - خيارات التحرير والمشاركة والحذف" : "File Actions Menu - Edit, Share, and Delete options"}
              caption={isArabic ? "قائمة إجراءات الملفات مع خيارات التحرير والمشاركة والحذف المتاحة" : "File actions menu with available edit, share, and delete options"}
              isArabic={isArabic}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.edit')}</strong> - {t('filesManagement.content.webContent.folderManagement.availableActions.editDescription')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.folderManagement.availableActions.editFeatures.updateFolderOrFileName')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.folderManagement.availableActions.editFeatures.modifyMemberAccessAndPermissions')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.share')}</strong> - {t('filesManagement.content.webContent.folderManagement.availableActions.shareDescription')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.shareFeatures.allMembers')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 1, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.shareFeatures.shareWithMe')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.shareFeatures.selectMembers')}</strong>
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.folderManagement.availableActions.delete')}</strong> - {t('filesManagement.content.webContent.folderManagement.availableActions.deleteDescription')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              • {t('filesManagement.content.webContent.folderManagement.availableActions.deleteFeatures.permanentlyDeleteFilesOrFoldersFromTheSystem')}
            </Typography>
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.folderManagement.sharingLimits.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              {t('filesManagement.content.webContent.folderManagement.sharingLimits.description')}
            </Typography>
          </InfoAlert>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('filesManagement.content.mobileContent.folderManagement.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
            <strong>{t('filesManagement.content.mobileContent.folderManagement.availableActions.title')}</strong>
          </Typography>
          {(() => {
            const actions = t('filesManagement.content.mobileContent.folderManagement.availableActions.actions', { returnObjects: true });
            return Array.isArray(actions) ? actions.map((action, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === actions.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • <strong>{action.split(':')[0]}:</strong> {action.split(':')[1]}
              </Typography>
            )) : null;
          })()}

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3,
              mt: 4
            }}
          >
            {t('filesManagement.content.mobileContent.folderManagement.folderFileManagementMenu.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, color: 'text.primary' }}>
            {t('filesManagement.content.mobileContent.folderManagement.folderFileManagementMenu.description')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/fileactionsMob.webp"
              alt={isArabic ? "قائمة إدارة الملفات والمجلدات على الهاتف المحمول" : "Mobile Folder File Management Menu"}
              caption={isArabic ? "قائمة إدارة الملفات والمجلدات على الهاتف المحمول مع خيارات التحكم السريع" : "Mobile folder file management menu with quick control options"}
              isArabic={isArabic}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3,
              mt: 4
            }}
          >
            {t('filesManagement.content.mobileContent.folderManagement.fileViewing.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 3, color: 'text.primary' }}>
            {t('filesManagement.content.mobileContent.folderManagement.fileViewing.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
            <strong>Key Features:</strong>
          </Typography>
          {(() => {
            const features = t('filesManagement.content.mobileContent.folderManagement.fileViewing.features', { returnObjects: true });
            return Array.isArray(features) ? features.map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 3 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            )) : null;
          })()}

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
            <strong>{t('filesManagement.content.mobileContent.folderManagement.searchNavigation.title')}</strong>
          </Typography>
          {(() => {
            const features = t('filesManagement.content.mobileContent.folderManagement.searchNavigation.features', { returnObjects: true });
            return Array.isArray(features) ? features.map((feature, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                • {feature}
              </Typography>
            )) : null;
          })()}
        </Box>
      )}
    </Box>
  );

  // Sharing & Permissions Content
  const renderSharingPermissionsContent = (platform) => (
    <Box>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4, color: 'text.secondary' }}>
        {t('filesManagement.content.webContent.sharingPermissions.description')}
      </Typography>

      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.sharingPermissions.memberSelection.title')}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3 }}>
            {t('filesManagement.content.webContent.sharingPermissions.memberSelection.description')}
          </Typography>

          <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/ShareDialogue1.webp"
              alt={isArabic ? "تفاصيل حوار المشاركة - قائمة الأعضاء وخيارات التحديد" : "Share Dialog Details - Member list and selection options"}
              caption={isArabic ? "عرض تفصيلي لحوار المشاركة مع قائمة الأعضاء المتاحين للاختيار" : "Detailed view of share dialog with available member list for selection"}
              isArabic={isArabic}
            />
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.allMembers.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.allMembers.features')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.shareWithMe.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.shareWithMe.features')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.selectMembers.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.sharingPermissions.sharingDialogOptions.selectMembers.features')}
            </Typography>
          </Box>
          <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
            <SupportImage
              src="/assets/support/ShareDialogue1.webp"
              alt={isArabic ? "حوار مشاركة الملفات - خيارات اختيار الأعضاء والتحكم في الوصول" : "File Sharing Dialog - Member selection and access control options"}
              caption={isArabic ? "واجهة حوار مشاركة الملفات مع خيارات اختيار الأعضاء المتعددة" : "File sharing dialog interface with multiple member selection options"}
              isArabic={isArabic}
            />
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 1, ml: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.dynamicPermissions.title')}:</strong> {t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.dynamicPermissions.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 1, ml: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.unlimitedSharing.title')}:</strong> {t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.unlimitedSharing.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 1, ml: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.crossModuleIntegration.title')}:</strong> {t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.crossModuleIntegration.description')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              • <strong>{t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.auditTrail.title')}:</strong> {t('filesManagement.content.webContent.sharingPermissions.accessManagementFeatures.auditTrail.description')}
            </Typography>
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.sharingPermissions.securityBestPractices.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              {t('filesManagement.content.webContent.sharingPermissions.securityBestPractices.description')}
            </Typography>
          </InfoAlert>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.sharingPermissions.mobileSharingControls.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'text.primary',
              mt: 2
            }}
          >
            {t('filesManagement.content.webContent.sharingPermissions.mobileSharingControls.description')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/FolderCreateMob.webp"
              alt={isArabic ? "حوار إنشاء المجلد على الهاتف المحمول مع خيارات المشاركة والأذونات" : "Mobile Create Folder Dialog with Sharing and Permissions Options"}
              caption={isArabic ? "واجهة إنشاء المجلد على الهاتف المحمول مع إعدادات المشاركة والتحكم في الأذونات" : "Mobile folder creation interface with sharing settings and permission controls"}
              isArabic={isArabic}
              style={{ maxWidth: '250px', height: 'auto' }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  // Search & Filter Content
  const renderSearchFilterContent = (platform) => (
    <Box>
      <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 4, color: 'text.secondary' }}>
        {t('filesManagement.content.webContent.searchFilter.description')}
      </Typography>

      {platform === 'web' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: SUPPORT_COLORS.teal,
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.searchFilter.searchAndFilterOptions.title')}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3 }}>
            {t('filesManagement.content.webContent.searchFilter.searchAndFilterOptions.description')}
          </Typography>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.searchFilter.availableFilterOptions.title')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.availableFilterOptions.dateSelection.title')}</strong>
            </Typography>

            <Box sx={{ maxWidth: '400px', mx: 'auto', mb: 2 }}>
              <SupportImage
                src="/assets/support/SerachFilterbyDate.webp"
                alt={isArabic ? "تصفية البحث بالتاريخ - خيارات تحديد نطاق التاريخ" : "Search Filter by Date - Date range selection options"}
                caption={isArabic ? "واجهة تصفية الملفات بالتاريخ مع خيارات تحديد النطاق الزمني" : "Date filter interface with date range selection options"}
                isArabic={isArabic}
              />
            </Box>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.availableFilterOptions.dateSelection.features')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.availableFilterOptions.fileTypeFilters.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.availableFilterOptions.fileTypeFilters.features')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.availableFilterOptions.locationBasedSearch.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.availableFilterOptions.locationBasedSearch.features')}
            </Typography>

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2 }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.availableFilterOptions.sharingStatus.title')}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: 2, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.availableFilterOptions.sharingStatus.features')}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, color: SUPPORT_COLORS.teal, mb: 2, mt: 3 }}>
            {t('filesManagement.content.webContent.searchFilter.globalSearchFunctionality.title')}
          </Typography>

          <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, mb: 3, color: 'text.primary' }}>
            {t('filesManagement.content.webContent.searchFilter.globalSearchFunctionality.description')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchCapabilities.title')}</strong> - {t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchCapabilities.subtitle')}
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchCapabilities.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}

            <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', mb: 2, ml: 2, color: 'text.primary' }}>
              <strong>{t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchBehavior.title')}</strong> - {t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchBehavior.subtitle')}
            </Typography>
            {(() => {
              const features = t('filesManagement.content.webContent.searchFilter.globalSearch.globalSearchBehavior.features', { returnObjects: true });
              return Array.isArray(features) ? features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', ml: 4, mb: index === features.length - 1 ? 2 : 1, color: 'text.primary' }}>
                  • {feature}
                </Typography>
              )) : null;
            })()}
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, mb: 1, color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.globalSearch.searchTips.title')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', color: 'text.primary' }}>
              {t('filesManagement.content.webContent.searchFilter.globalSearch.searchTips.description')}
            </Typography>
          </InfoAlert>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: 'text.primary',
              mb: 3
            }}
          >
            {t('filesManagement.content.webContent.searchFilter.mobile.title')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'text.primary',
              mt: 2
            }}
          >
            {t('filesManagement.content.webContent.searchFilter.mobile.description')}
          </Typography>

          <Box sx={{ maxWidth: '300px', mx: 'auto', mb: 2 }}>
            <SupportImage
              src="/assets/support/folderSearchMob.webp"
              alt={isArabic ? "البحث في المجلدات على الهاتف المحمول - واجهة البحث والتصفية" : "Mobile Folder Search - Search and Filter Interface"}
              caption={isArabic ? "واجهة البحث في المجلدات على الهاتف المحمول مع خيارات التصفية المتقدمة" : "Mobile folder search interface with advanced filtering options"}
              isArabic={isArabic}
              style={{ maxWidth: '250px', height: 'auto' }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  // Content component that receives props from CommonSidebarLayout
  const FilesManagementContent = ({ platform, selectedSection }) => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent(platform);
      case 'file-operations':
        return renderFileOperationsContent(platform);
      case 'folder-management':
        return renderFolderManagementContent(platform);
      case 'sharing-permissions':
        return renderSharingPermissionsContent(platform);
      case 'search-filter':
        return renderSearchFilterContent(platform);
      default:
        return (
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              color: 'text.primary'
            }}
          >
            {t('filesManagement.content.placeholder', { title: navigationItems.find(item => item.id === selectedSection)?.title })}
          </Typography>
        );
    }
  };

  return (
    <CommonSidebarLayout
      moduleKey="filesManagement"
      navigationItems={navigationItems}
      defaultSection="overview"
      backUrl="/support"
      contentComponent={FilesManagementContent}
    />
  );
}

