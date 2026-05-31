'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Grid,
  Paper
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import { Iconify } from 'src/components/iconify';
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
const getClientManagementNavigationItems = (t) => [
  {
    id: 'overview',
    title: t('clientManagement.navigation.overview.title'),
    icon: 'solar:home-bold',
    description: t('clientManagement.navigation.overview.description'),
    keywords: ['overview', 'client management', 'introduction', 'getting started']
  },
  
  {
    id: 'add-client',
    title: t('clientManagement.navigation.addClient.title'),
    icon: 'solar:user-plus-bold',
    description: t('clientManagement.navigation.addClient.description'),
    keywords: ['add client', 'create client', 'new client', 'client form']
  },
  {
    id: 'client-operations',
    title: t('clientManagement.navigation.clientOperations.title'),
    icon: 'solar:settings-bold',
    description: t('clientManagement.navigation.clientOperations.description'),
    keywords: ['edit client', 'delete client', 'update client', 'client operations', 'manage clients']
  },
  {
    id: 'leads-management',
    title: t('clientManagement.navigation.leadsManagement.title'),
    icon: 'solar:target-bold',
    description: t('clientManagement.navigation.leadsManagement.description'),
    keywords: ['leads', 'lead tracking', 'conversion', 'sales pipeline']
  },
  {
    id: 'lead-details-management',
    title: t('clientManagement.navigation.leadDetailsManagement.title'),
    icon: 'solar:checklist-bold',
    description: t('clientManagement.navigation.leadDetailsManagement.description'),
    keywords: ['lead details', 'lead tasks', 'task creation', 'lead files', 'lead documents', 'task management']
  },
  {
    id: 'client-details-management',
    title: t('clientManagement.navigation.clientDetailsManagement.title'),
    icon: 'solar:document-text-bold',
    description: t('clientManagement.navigation.clientDetailsManagement.description'),
    keywords: ['client details', 'client contacts', 'lead creation', 'client documents', 'client files', 'contact management']
  },
  {
    id: 'sales-groups',
    title: t('clientManagement.navigation.salesGroups.title'),
    icon: 'solar:users-group-two-rounded-bold',
    description: t('clientManagement.navigation.salesGroups.description'),
    keywords: ['sales groups', 'team organization', 'group management', 'sales team', 'targets', 'group creation']
  },
  {
    id: 'client-settings',
    title: t('clientManagement.navigation.clientSettings.title'),
    icon: 'solar:settings-bold',
    description: t('clientManagement.navigation.clientSettings.description'),
    keywords: ['client settings', 'configuration', 'lead source', 'sales status', 'reject reasons', 'permissions']
  }
];

// Main component that receives props from CommonSidebarLayout
function ClientManagementContent({ platform = 'web', selectedSection = 'overview' }) {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';

  const renderOverviewContent = () => (
    <Box>
      <BodyText>
        {t('clientManagement.content.overview.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src="/assets/support/clientsWeb.webp"
            alt={t('clientManagement.content.overview.web.imageAlt')}
            isArabic={isArabic}
          />

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('clientManagement.content.overview.whatYouCanDo.title')}
          </SubsectionTitle>

          <Grid container spacing={3}>
            {/* Client Operations */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

                  <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}>
                    {t('clientManagement.content.overview.whatYouCanDo.clientOperations.title')}
                  </Typography>
                </Box>
                <List dense>
                  {t('clientManagement.content.overview.whatYouCanDo.clientOperations.features', { returnObjects: true }).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </ListItem>
                  ))}
                </List>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

                  <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}>
                    {t('clientManagement.content.overview.whatYouCanDo.viewOptions.title')}
                  </Typography>
                </Box>
                <List dense>
                  {t('clientManagement.content.overview.whatYouCanDo.viewOptions.features', { returnObjects: true }).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Management Tools */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

                  <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}>
                    {t('clientManagement.content.overview.whatYouCanDo.managementTools.title')}
                  </Typography>
                </Box>
                <List dense>
                  {t('clientManagement.content.overview.whatYouCanDo.managementTools.features', { returnObjects: true }).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

       
 

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('clientManagement.content.overview.clientInterface.title')}
          </SubsectionTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.overview.clientInterface.description')}
          </BodyText>

          <BodyText sx={{ mb: 2, fontWeight: 'normal' }}>
            {t('clientManagement.content.overview.clientInterface.navigationTabs.title')}
          </BodyText>

          <List sx={{ mb: 2 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.navigationTabs.clients')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.navigationTabs.leads')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.navigationTabs.groups')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
          </List>

          <BodyText sx={{ mb: 2, fontWeight: 'normal' }}>
            {t('clientManagement.content.overview.clientInterface.controlOptions.title')}
          </BodyText>

          <List sx={{ mb: 2 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.controlOptions.viewToggle')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.controlOptions.searchFilter')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.controlOptions.addButtons')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.overview.clientInterface.controlOptions.exportOptions')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif' }}
              />
            </ListItem>
          </List>

          <InfoAlert sx={{ mt: 3 }}>
            {isArabic
              ? "أيقونة الإعدادات مرئية فقط للمستخدمين الذين لديهم الصلاحيات المناسبة للوصول إلى خيارات تكوين إدارة العملاء."
              : "The settings icon is only visible to users who have the appropriate permissions to access client management configuration options."
            }
          </InfoAlert>






          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {t('clientManagement.content.overview.clientDetailsView.title')}
          </SubsectionTitle>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.overview.clientDetailsView.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/ClientdetailsViewWeb.webp"
            alt={t('clientManagement.content.overview.clientDetailsView.imageAlt')}
            isArabic={isArabic}
          />

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Client Detail Tabs */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: 'rgba(0, 106, 103, 0.05)',
                  border: '1px solid rgba(0, 106, 103, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Iconify icon="solar:folder-bold" width={24} sx={{ color: SUPPORT_COLORS.iconBg }} />
                  <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}>
                    {isArabic ? "علامات تبويب إدارة تفاصيل العميل" : "Client Detail Management Tabs"}
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  {/* Leads Tab */}
                  <Grid item xs={12} md={6} lg={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Iconify icon="solar:target-bold" width={32} sx={{ color: SUPPORT_COLORS.iconBg, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'normal', mb: 1 }}>
                        {isArabic ? "العملاء المحتملون" : "Leads"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {isArabic ? "إدارة العملاء المحتملين مع تتبع الحالة وإدارة التحويل" : "Manage client leads with status tracking and conversion management"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Documents Tab */}
                  <Grid item xs={12} md={6} lg={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Iconify icon="solar:document-bold" width={32} sx={{ color: SUPPORT_COLORS.iconBg, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'normal', mb: 1 }}>
                        {isArabic ? "المستندات" : "Documents"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {isArabic ? "تخزين وإدارة المستندات المتعلقة بالعميل بأمان" : "Store and manage client-related documents securely"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Tasks Tab */}
                  <Grid item xs={12} md={6} lg={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Iconify icon="solar:checklist-bold" width={32} sx={{ color: SUPPORT_COLORS.iconBg, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'normal', mb: 1 }}>
                        {isArabic ? "المهام" : "Tasks"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {isArabic ? "إنشاء وتتبع المهام المتعلقة بهذا العميل المحدد" : "Create and track tasks related to this specific client"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Files Tab */}
                  <Grid item xs={12} md={6} lg={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Iconify icon="solar:file-bold" width={32} sx={{ color: SUPPORT_COLORS.iconBg, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'normal', mb: 1 }}>
                        {isArabic ? "الملفات" : "Files"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {isArabic ? "رفع وتنظيم ملفات العميل والمرفقات" : "Upload and organize client files and attachments"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Contacts Tab */}
                  <Grid item xs={12} md={6} lg={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Iconify icon="solar:phone-bold" width={32} sx={{ color: SUPPORT_COLORS.iconBg, mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'normal', mb: 1 }}>
                        {isArabic ? "جهات الاتصال" : "Contacts"}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {isArabic ? "إدارة معلومات الاتصال بالعميل وتاريخ التواصل" : "Manage client contact information and communication history"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
     <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "عرض إعدادات العميل" : "Client Settings View"}
          </SubsectionTitle>
          <BodyText sx={{ mb: 3 }}>
            {isArabic
              ? "يتيح لك عرض إعدادات العميل تكوين وإدارة الإعدادات المتعلقة بالعميل:"
              : "The client settings view allows you to configure and manage client-related settings:"
            }
          </BodyText>


           <SupportImage
            src="/assets/support/ClientSettingsViewWeb.webp"
            alt="Client Settings View"
            isArabic={isArabic}
            caption={isArabic ? "عرض إعدادات العميل - تكوين وإدارة الإعدادات المتعلقة بالعميل" : "Client Settings View - Configure and manage client-related settings"}
          />

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "خيارات تكوين الإعدادات" : "Settings Configuration Options"}
          </SubsectionTitle>

          <BodyText sx={{ mb: 2 }}>
            {isArabic
              ? "يوفر عرض الإعدادات خيارات التكوين لإدارة العملاء:"
              : "The settings view provides configuration options for client management:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "مصدر العميل المحتمل" : "Lead Source"}
                secondary={isArabic ? "تكوين مصادر العملاء المحتملين مثل الإعلان والإحالة والموقع الإلكتروني والأحداث ووسائل التواصل الاجتماعي" : "Configure lead sources like Advertisement, Referral, Website, Events, Social Media"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "حالات المبيعات" : "Sales Statuses"}
                secondary={isArabic ? "إدارة خيارات حالة المبيعات لتتبع العملاء المحتملين والتحويل" : "Manage sales status options for lead tracking and conversion"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "أسباب الرفض" : "Reject Reasons"}
                secondary={isArabic ? "إعداد أسباب الرفض للعملاء المحتملين والفرص المرفوضة" : "Set up rejection reasons for declined leads and opportunities"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "صلاحيات إنشاء المجموعة" : "Create Group Permissions"}
                secondary={isArabic ? "التحكم في من يمكنه إنشاء وإدارة مجموعات العملاء" : "Control who can create and manage client groups"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "صلاحية عرض جميع العملاء" : "View All Clients Permission"}
                secondary={isArabic ? "إدارة الصلاحيات لعرض جميع العملاء في النظام" : "Manage permissions for viewing all clients in the system"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <InfoAlert>
            {isArabic
              ? "خيارات تكوين الإعدادات متاحة فقط للمستخدمين الذين لديهم الصلاحيات الإدارية المناسبة."
              : "Settings configuration options are only accessible to users with appropriate administrative permissions."
            }
          </InfoAlert>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "عرض تفاصيل العميل المحتمل" : "Lead Details View"}
          </SubsectionTitle>

          <BodyText sx={{ mb: 3 }}>
            {isArabic
              ? "عند النقر على عميل محتمل محدد، تصل إلى واجهة إدارة العملاء المحتملين التفصيلية مع إمكانيات تتبع المهام:"
              : "When you click on a specific lead, you access the detailed lead management interface with task tracking capabilities:"
            }
          </BodyText>

          <SupportImage
            src="/assets/support/leaddetailsWeb.webp"
            alt={t('clientManagement.content.overview.leadDetailsView.imageAlt')}
            isArabic={isArabic}
          />

          <BodyText sx={{ mt: 3, mb: 2 }}>
            {isArabic
              ? "يتضمن عرض تفاصيل العميل المحتمل ثلاث علامات تبويب رئيسية لإدارة العملاء المحتملين الشاملة:"
              : "The lead details view includes three main tabs for comprehensive lead management:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب المهام" : "Tasks Tab"}
                secondary={isArabic ? "إنشاء وإدارة المهام المتعلقة بهذا العميل المحتمل المحدد مع تتبع الحالة" : "Create and manage tasks related to this specific lead with status tracking"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب الملفات" : "Files Tab"}
                secondary={isArabic ? "رفع وتنظيم الملفات والمرفقات المتعلقة بالعميل المحتمل" : "Upload and organize files and attachments related to the lead"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب المستندات" : "Documents Tab"}
                secondary={isArabic ? "تخزين وإدارة المستندات المهمة لمعالجة العميل المحتمل" : "Store and manage important documents for lead processing"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <BodyText sx={{ mb: 2 }}>
            {isArabic
              ? "الميزات الرئيسية المتاحة في عرض تفاصيل العميل المحتمل:"
              : "Key features available in the lead details view:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "إدارة المهام" : "Task Management"}
                secondary={isArabic ? "إنشاء وتعيين وتتبع المهام مع مؤشرات الحالة (تم الإنشاء، تم التعيين، قائمة الانتظار)" : "Create, assign, and track tasks with status indicators (Created, Assigned, Backlog)"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "خيارات العرض" : "View Options"}
                secondary={isArabic ? "التبديل بين عروض القائمة والشبكة والجدول الزمني لتنظيم أفضل للمهام" : "Switch between list, grid, and timeline views for better task organization"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "البحث والتصفية" : "Search & Filter"}
                secondary={isArabic ? "البحث في المهام والتصفية حسب الحالة والأعضاء والأولويات" : "Search tasks and filter by status, members, and priorities"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "تتبع التكلفة والمدة" : "Cost & Duration Tracking"}
                secondary={isArabic ? "مراقبة تكاليف المهام والمدة مع تتبع مفصل للوقت" : "Monitor task costs and duration with detailed time tracking"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "عرض تفاصيل المجموعة" : "Group Detail View"}
          </SubsectionTitle>

          <BodyText sx={{ mb: 3 }}>
            {isArabic
              ? "عند الوصول إلى مجموعة مبيعات، يمكنك عرض أداء الأعضاء التفصيلي وتحليلات المبيعات:"
              : "When you access a sales group, you can view detailed member performance and sales analytics:"
            }
          </BodyText>

          <SupportImage
            src="/assets/support/GroupdetailsviewWeb.webp"
            alt={t('clientManagement.content.overview.groupDetailsView.imageAlt')}
            isArabic={isArabic}
          />

          <BodyText sx={{ mt: 3, mb: 2 }}>
            {isArabic
              ? "يوفر عرض تفاصيل المجموعة تتبعاً شاملاً لمبيعات الأعضاء وتحليلات الأداء:"
              : "The group detail view provides comprehensive member sales tracking and performance analytics:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "معلومات ملف العضو" : "Member Profile Information"}
                secondary={isArabic ? "عرض تفاصيل العضو بما في ذلك الاسم والدور ومعلومات الاتصال وحالة الخدمة" : "View member details including name, role, contact information, and duty status"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامات تبويب تفاصيل المبيعات وتقرير الهدف" : "Sales Details & Target Report Tabs"}
                secondary={isArabic ? "التبديل بين تفاصيل أداء المبيعات وتقارير تحقيق الأهداف" : "Switch between sales performance details and target achievement reports"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "تتبع الهدف الإجمالي" : "Overall Target Tracking"}
                secondary={isArabic ? "مراقبة الهدف مقابل الأداء المحقق مع الرسوم البيانية المرئية ومؤشرات التقدم" : "Monitor target vs achieved performance with visual charts and progress indicators"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "معلومات العملاء المحتملين التجارية" : "Business Lead Information"}
                secondary={isArabic ? "تتبع عدد العملاء المحتملين والمبالغ وإحصائيات الممنوح/المرفوض ونشاط العملاء" : "Track lead counts, amounts, awarded/rejected statistics, and client activity"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <BodyText sx={{ mb: 2 }}>
            {isArabic
              ? "المقاييس الرئيسية المتاحة في عرض تفاصيل المجموعة:"
              : "Key metrics available in the group detail view:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "مقاييس أداء العملاء المحتملين" : "Lead Performance Metrics"}
                secondary={isArabic ? "عدد العملاء المحتملين، مبلغ العملاء المحتملين، عدد الممنوح، مبلغ الممنوح، إحصائيات المرفوض" : "Lead count, lead amount, awarded count, awarded amount, rejected statistics"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "تتبع نشاط العملاء" : "Client Activity Tracking"}
                secondary={isArabic ? "عدد العملاء النشطين ومراقبة العملاء غير النشطين" : "Active clients count and non-active clients monitoring"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "تحليلات الأداء" : "Performance Analytics"}
                secondary={isArabic ? "الرسوم البيانية المرئية التي تظهر اتجاهات الأداء وتحقيق الأهداف عبر الوقت" : "Visual charts showing performance trends and target achievement over time"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "مؤشرات حالة العمل" : "Work Status Indicators"}
                secondary={isArabic ? "أيام الإجازة، الأيام المبلغ عنها، تتبع أيام العمل مع مؤشرات الحالة" : "Days off, days reported, days work tracking with status indicators"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

        </Box>
      )}

      {platform === 'mobile' && (
        <Box>
          <SupportImage
            src="/assets/support/ClientViewMob.webp"
            alt={isArabic ? "واجهة إدارة العملاء عبر الهاتف المحمول" : "Mobile Client Management Interface"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "واجهة إدارة العملاء عبر الهاتف المحمول - تعرض علامات التبويب للعملاء والمجموعات والعملاء المحتملين مع وظائف البحث والتصفية" : "Mobile Client Management Interface - showing Clients, Groups, and Leads tabs with search and filter functionality"}
          />

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "علامات التبويب الرئيسية" : "Main Navigation Tabs"}
          </SubsectionTitle>

          <BodyText sx={{ mb: 2 }}>
            {isArabic
              ? "تحتوي واجهة إدارة العملاء عبر الهاتف المحمول على ثلاث علامات تبويب رئيسية:"
              : "The mobile client management interface contains three main navigation tabs:"
            }
          </BodyText>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب العملاء" : "Clients Tab"}
                secondary={isArabic ? "عرض قائمة العملاء مع معلومات الاتصال والبحث والتصفية" : "View client list with contact information, search, and filtering"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب المجموعات" : "Groups Tab"}
                secondary={isArabic ? "إدارة مجموعات المبيعات وعرض تفاصيل الأعضاء" : "Manage sales groups and view member details"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "علامة تبويب العملاء المحتملين" : "Leads Tab"}
                secondary={isArabic ? "تتبع العملاء المحتملين مع إحصائيات الحالة والمبالغ" : "Track leads with status statistics and amounts"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "واجهة مجموعات المبيعات عبر الهاتف المحمول" : "Mobile Sales Groups Interface"}
          </SubsectionTitle>

          <SupportImage
            src="/assets/support/SaleGroupMob.webp"
            alt={isArabic ? "واجهة مجموعات المبيعات عبر الهاتف المحمول" : "Mobile Sales Groups Interface"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "واجهة مجموعات المبيعات عبر الهاتف المحمول - تعرض قائمة المجموعات مع تفاصيل الأعضاء والمنشئ" : "Mobile Sales Groups Interface - showing groups list with member details and creator information"}
          />

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "واجهة العملاء المحتملين عبر الهاتف المحمول" : "Mobile Leads Management Interface"}
          </SubsectionTitle>

          <SupportImage
            src="/assets/support/leadViewMob.webp"
            alt={isArabic ? "واجهة العملاء المحتملين عبر الهاتف المحمول" : "Mobile Leads Management Interface"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "واجهة العملاء المحتملين عبر الهاتف المحمول - تعرض إحصائيات العملاء المحتملين مع المبالغ والحالات" : "Mobile Leads Management Interface - showing lead statistics with amounts and status information"}
          />

          <SubsectionTitle sx={{ mt: 4, mb: 3 }}>
            {isArabic ? "ميزات البحث والتصفية" : "Search and Filter Features"}
          </SubsectionTitle>

          <BodyText sx={{ mb: 2 }}>
            {isArabic
              ? "توفر الواجهة المحمولة خيارات بحث وتصفية شاملة:"
              : "The mobile interface provides comprehensive search and filter options:"
            }
          </BodyText>

          <SupportImage
            src="/assets/support/clientfilterMob.webp"
            alt={isArabic ? "واجهة تصفية العملاء عبر الهاتف المحمول" : "Mobile Client Filter Interface"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "واجهة تصفية العملاء - تعرض خيارات التصفية مثل 'عملائي' و 'جميع العملاء' مع إمكانية اختيار العضو" : "Client Filter Interface - showing filter options like 'My Clients' and 'All Clients' with member selection"}
          />

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "شريط البحث" : "Search Bar"}
                secondary={isArabic ? "البحث السريع في العملاء والمجموعات والعملاء المحتملين" : "Quick search across clients, groups, and leads"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "خيارات التصفية" : "Filter Options"}
                secondary={isArabic ? "تصفية حسب 'عملائي' أو 'جميع العملاء' مع خيار اختيار العضو" : "Filter by 'My Clients' or 'All Clients' with member selection option"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={isArabic ? "أزرار التحكم" : "Control Buttons"}
                secondary={isArabic ? "أزرار إعادة التعيين والتطبيق لإدارة المرشحات" : "Reset and Done buttons for filter management"}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>


        </Box>
      )}
    </Box>
  );



  const renderAddClientContent = () => (
    <Box>
      <BodyText>
        {t('clientManagement.content.addClient.description')}
      </BodyText>
      
      {platform === 'web' && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              <strong>{t('clientManagement.content.addClient.platformNotes.web.title')}</strong> {t('clientManagement.content.addClient.platformNotes.web.description')}
            </Typography>
          </Alert>
        </Box>
      )}

      {platform === 'web' && (
        <>
          <Box sx={{ my: 3 }}>
            <SupportImage
              src="/assets/support/addClient.webp"
              alt="Add Client Form"
              isArabic={isArabic}
              caption="Add Client Form - Create new client profiles with comprehensive information"
            />
          </Box>

          <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 3 }}>
            {t('clientManagement.content.addClient.stepByStepGuide')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('clientManagement.content.addClient.steps.step1')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {t('clientManagement.content.addClient.steps.step2')}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {t('clientManagement.content.addClient.steps.step3')}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.addClient.clientFormFields.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.addClient.clientFormFields.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.slNo.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.slNo.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.id.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.id.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.creator.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.creator.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.name.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.name.description')}
          </Typography>

          {/* Add Client Dialog Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src="/assets/support/addClientImage.webp"
              alt={isArabic ? "حوار إضافة العميل مع رفع الصورة" : "Add Client Dialog with Image Upload"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "حوار إضافة العميل مع خيارات رفع الصورة" : "Add Client Dialog with Image Upload Options"}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.clientNameField.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.clientNameField.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.addImage.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.addImage.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.email.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.email.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.emirates.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.emirates.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.details.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.details.description')}
          </Typography>

          {/* Add Client Details Dialog Image */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <SupportImage
              src="/assets/support/addClientdetailsWeb.webp"
              alt={isArabic ? "حوار تفاصيل العميل الإضافية" : "Add Client Details Dialog"}
              isArabic={isArabic}
              maxWidth="600px"
              caption={isArabic ? "حوار إضافة تفاصيل العميل" : "Add Client Details Dialog"}
            />
          </Box>



          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.leads.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.leads.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.sales.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.sales.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>{t('clientManagement.content.addClient.clientFormFields.actions.title')}</strong> {t('clientManagement.content.addClient.clientFormFields.actions.description')}
          </Typography>



    


          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.addClient.finalSteps.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.addClient.finalSteps.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.addClient.finalSteps.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.addClient.finalSteps.step3')}
          </Typography>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mt: 3 }}>
          <SubTitle sx={{ mb: 3 }}>
            {t('clientManagement.content.addClient.mobile.title')}
          </SubTitle>

          <SupportImage
            src="/assets/support/AddClientMob.webp"
            alt={t('clientManagement.content.addClient.mobile.altText')}
            isArabic={isArabic}
            maxWidth="400px"
            caption={t('clientManagement.content.addClient.mobile.caption')}
          />

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.addClient.mobile.description')}
          </BodyText>

          <SubsectionTitle sx={{ mt: 3, mb: 2 }}>
            {t('clientManagement.content.addClient.mobile.fields.title')}
          </SubsectionTitle>

          <List sx={{ mb: 3 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.logo.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.logo.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.clientName.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.clientName.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.clientId.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.clientId.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.email.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.email.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.phone.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.phone.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.website.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.website.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.city.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.city.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={t('clientManagement.content.addClient.mobile.fields.address.title')}
                secondary={t('clientManagement.content.addClient.mobile.fields.address.description')}
                primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
              />
            </ListItem>
          </List>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.addClient.mobile.saveNote')}
          </BodyText>

        
        </Box>
      )}
    </Box>
  );

  const renderLeadsContent = () => (
    <Box>
      {platform === 'web' && (
        <BodyText>
          {t('clientManagement.content.leadsManagement.description')}
        </BodyText>
      )}

      {platform === 'mobile' && (
        <BodyText>
          {isArabic
            ? "تعلم كيفية الوصول إلى العملاء المحتملين وإدارتهم على الجوال."
            : "Learn how to access and manage leads on mobile."
          }
        </BodyText>
      )}

      {platform === 'web' && (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.accessingLeads.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.accessingLeads.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.accessingLeads.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.accessingLeads.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.leadsManagement.accessingLeads.step3')}
          </Typography>

          {/* Client Details View Image */}
          <Box sx={{ mb: 3, ml: 2 }}>
            <SupportImage
              src="/assets/support/ClientdetailsViewWeb.webp"
              alt={isArabic ? "عرض تفاصيل العميل" : "Client Details View"}
              isArabic={isArabic}
              maxWidth="800px"
              caption={isArabic ? "واجهة تفاصيل العميل مع علامات التبويب للعملاء المحتملين والمستندات والمهام والملفات وجهات الاتصال" : "Client Details Interface with tabs for Leads, Documents, Tasks, Files, and Contacts"}
            />
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.creatingLeads.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.creatingLeads.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.creatingLeads.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.creatingLeads.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.creatingLeads.step3')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.creatingLeads.step4')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.leadsManagement.creatingLeads.step5')}
          </Typography>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.interfaceOverview.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.interfaceOverview.description')}
          </Typography>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.leadId')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.leadIdDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.creator')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.creatorDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.leadName')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.leadNameDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.value')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.valueDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.source')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.sourceDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.probability')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.probabilityDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.status')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.statusDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.awardReject')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.awardRejectDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{t('clientManagement.content.leadsManagement.interfaceOverview.actions')}</strong> - {t('clientManagement.content.leadsManagement.interfaceOverview.actionsDesc')}
          </Typography>

          {/* Leads Interface Image */}
          <Box sx={{ mb: 3, ml: 2 }}>
            <SupportImage
              src="/assets/support/LeadViewWeb.webp"
              alt={isArabic ? "واجهة عرض العملاء المحتملين" : "Leads View Interface"}
              isArabic={isArabic}
              maxWidth="800px"
              caption={isArabic ? "واجهة عرض العملاء المحتملين مع جميع الأعمدة والوظائف" : "Leads View Interface with all columns and functionality"}
            />
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.managingLeads.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.leadsManagement.managingLeads.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.managingLeads.editLead')}</strong> - {t('clientManagement.content.leadsManagement.managingLeads.editLeadDesc')}
          </Typography>
        </Box>
      )}
      
      
      {platform === 'web' && (
        <Box>
          {/* Edit Lead Image */}
          <Box sx={{ mb: 2, ml: 4 }}>
            <SupportImage
              src="/assets/support/EditLeadWeb.webp"
              alt={isArabic ? "تحرير العميل المحتمل" : "Edit Lead"}
              isArabic={isArabic}
              maxWidth="600px"
              caption={isArabic ? "واجهة تحرير العميل المحتمل مع جميع الحقول القابلة للتعديل" : "Edit Lead interface with all editable fields"}
            />
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.managingLeads.deleteLead')}</strong> - {t('clientManagement.content.leadsManagement.managingLeads.deleteLeadDesc')}
          </Typography>

          {/* Delete Lead Image */}
          <Box sx={{ mb: 2, ml: 4 }}>
            <SupportImage
              src="/assets/support/ClientDelete.webp"
              alt={isArabic ? "حذف العميل المحتمل" : "Delete Lead"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "رسالة تأكيد الحذف مع أزرار الحذف والإلغاء" : "Delete confirmation dialog with Delete and Cancel buttons"}
            />
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.managingLeads.awardLead')}</strong> - {t('clientManagement.content.leadsManagement.managingLeads.awardLeadDesc')}
          </Typography>

          {/* Award Lead Image */}
          <Box sx={{ mb: 2, ml: 4 }}>
            <SupportImage
              src="/assets/support/awardWeb.webp"
              alt={isArabic ? "منح العميل المحتمل" : "Award Lead"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "تأكيد منح العميل المحتمل مع أزرار المنح والإلغاء" : "Award Lead confirmation with Award and Cancel buttons"}
            />
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.leadsManagement.managingLeads.rejectLead')}</strong> - {t('clientManagement.content.leadsManagement.managingLeads.rejectLeadDesc')}
          </Typography>

          {/* Reject Lead Image */}
          <Box sx={{ mb: 3, ml: 4 }}>
            <SupportImage
              src="/assets/support/rejectWeb.webp"
              alt={isArabic ? "رفض العميل المحتمل" : "Reject Lead"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "تأكيد رفض العميل المحتمل مع أزرار الرفض والإلغاء" : "Reject Lead confirmation with Reject and Cancel buttons"}
            />
          </Box>
        </Box>
      )}

      {platform === 'web' && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              <strong>{t('clientManagement.content.leadsManagement.platformNotes.web.title')}</strong> {t('clientManagement.content.leadsManagement.platformNotes.web.description')}
            </Typography>
          </Alert>
        </Box>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mt: 3 }}>
          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.leadsManagement.mobileAccess.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.leadsManagement.mobileAccess.description')}
          </BodyText>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.mobileAccess.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadsManagement.mobileAccess.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "استخدم زر الإضافة (+) لإنشاء عملاء محتملين جدد مباشرة من قائمة العملاء المحتملين" : "Use the plus (+) button to create new leads directly from the lead list"}
          </Typography>

          {/* Mobile Add Lead Image */}
          <Box sx={{ mb: 3, ml: 4 }}>
            <SupportImage
              src="/assets/support/AddLeadMob.webp"
              alt={isArabic ? "إضافة عميل محتمل على الجوال" : "Add Lead on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة إضافة عميل محتمل على الجوال مع جميع الحقول المطلوبة" : "Mobile Add Lead interface with all required fields"}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "حقول إضافة العميل المحتمل:" : "Add Lead Fields:"}</strong>
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "عنوان العميل المحتمل" : "Lead Title"}</strong> - {isArabic ? "اسم أو عنوان العميل المحتمل" : "Name or title of the lead"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "معرف العميل المحتمل" : "Lead ID"}</strong> - {isArabic ? "معرف فريد للعميل المحتمل (يدخله المستخدم يدوياً)" : "Unique identifier for the lead (manually entered by user)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "الاحتمالية" : "Probability"}</strong> - {isArabic ? "نسبة احتمالية نجاح العميل المحتمل" : "Success probability percentage for the lead"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "المبلغ" : "Amount"}</strong> - {isArabic ? "القيمة المتوقعة للعميل المحتمل" : "Expected value of the lead"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "العملة" : "Currency"}</strong> - {isArabic ? "يدعم عملات متعددة (الافتراضي: درهم إماراتي)" : "Supports multiple currencies (default: AED)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "العميل" : "Client"}</strong> - {isArabic ? "اختيار العميل المرتبط بالعميل المحتمل" : "Select the client associated with the lead"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1, ml: 2 }}>
            • <strong>{isArabic ? "الحالة" : "Status"}</strong> - {isArabic ? "حالة العميل المحتمل (يتم تعيينها من الويب)" : "Lead status (configured from web)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3, ml: 2 }}>
            • <strong>{isArabic ? "المصدر" : "Source"}</strong> - {isArabic ? "مصدر العميل المحتمل (يتم تعيينه من الويب)" : "Lead source (configured from web)"}
          </Typography>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              <strong>{isArabic ? "ملاحظة:" : "Note:"}</strong> {isArabic ? "خيارات المصدر والعملة وحالة المبيعات يتم تعيينها من واجهة الويب. المستخدمون الذين لديهم أدوار وصلاحيات مناسبة يمكنهم تعديل إعدادات العميل من الويب." : "Source dropdown, currency, and sales status options are configured from the web interface. Users with appropriate roles and permissions can modify client settings from web."}
            </Typography>
          </Alert>

          <SubTitle sx={{ mb: 2 }}>
            {isArabic ? "تحرير وحذف العملاء المحتملين" : "Edit And Delete Leads"}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {isArabic ? "يمكن للمستخدمين تحرير وحذف العملاء المحتملين من خلال أزرار التحرير والحذف المنفصلة في واجهة الجوال:" : "Users can edit and delete leads through separate edit and delete buttons in the mobile interface:"}
          </Typography>

          {/* Edit Delete Lead Mobile Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/EditDeleteMob.webp"
              alt={isArabic ? "تحرير وحذف العميل المحتمل على الجوال" : "Edit Delete Lead on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة تحرير وحذف العميل المحتمل على الجوال مع أزرار التحرير والحذف" : "Edit Delete Lead Mobile Interface with edit and delete buttons"}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "تحرير العميل المحتمل:" : "Edit Lead:"}</strong> {isArabic ? "انقر على زر 'تحرير' لتعديل تفاصيل العميل المحتمل" : "Click the 'Edit' button to modify lead details"}
          </Typography>

          {/* Edit Lead Mobile Image */}
          <Box sx={{ mb: 3, ml: 4 }}>
            <SupportImage
              src="/assets/support/EditLeadMob.webp"
              alt={isArabic ? "تحرير العميل المحتمل على الجوال" : "Edit Lead on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة تحرير العميل المحتمل مع جميع الحقول القابلة للتعديل وزر الحفظ" : "Edit Lead interface with all editable fields and save button"}
            />
          </Box>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "حذف العميل المحتمل:" : "Delete Lead:"}</strong> {isArabic ? "انقر على زر 'حذف' لإزالة العميل المحتمل" : "Click the 'Delete' button to remove the lead"}
          </Typography>

          {/* Delete Lead Mobile Image */}
          <Box sx={{ mb: 3, ml: 4 }}>
            <SupportImage
              src="/assets/support/LeadDeleteMob.webp"
              alt={isArabic ? "حذف العميل المحتمل على الجوال" : "Delete Lead on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة حذف العميل المحتمل مع رسالة التأكيد وخيارات الإلغاء والحذف" : "Delete Lead interface with confirmation message and cancel/delete options"}
            />
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              <strong>{isArabic ? "تنبيه:" : "Important:"}</strong> {isArabic ? "عمليات التحرير والحذف تتطلب صلاحيات مناسبة. تأكد من أن لديك الصلاحيات اللازمة لتنفيذ هذه العمليات." : "Edit and delete operations require appropriate permissions. Make sure you have the necessary permissions to perform these actions."}
            </Typography>
          </Alert>




        </Box>
      )}
    </Box>
  );

  const renderClientSettingsContent = () => (
    <Box>
      {platform === 'web' && (
        <>
          <SubTitle>{t('clientManagement.content.clientSettings.title')}</SubTitle>
          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.clientSettings.description')}
          </BodyText>
        </>
      )}

      {platform === 'web' && (
        <>
          {/* Lead Source Settings */}
          <Box sx={{ mb: 4 }}>
            <SubTitle variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal }}>
              {t('clientManagement.content.clientSettings.leadSource.title')}
            </SubTitle>
            <BodyText sx={{ mb: 2 }}>
              {t('clientManagement.content.clientSettings.leadSource.description')}
            </BodyText>
            <SupportImage
              src="/assets/support/LeadSource.webp"
              alt={t('clientManagement.content.clientSettings.leadSource.imageAlt')}
              caption={t('clientManagement.content.clientSettings.leadSource.imageCaption')}
            />
            <BodyText sx={{ mt: 2 }}>
              {t('clientManagement.content.clientSettings.leadSource.functionality')}
            </BodyText>
          </Box>

          {/* Sales Statuses Settings */}
          <Box sx={{ mb: 4 }}>
            <SubTitle variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal }}>
              {t('clientManagement.content.clientSettings.salesStatuses.title')}
            </SubTitle>
            <BodyText sx={{ mb: 2 }}>
              {t('clientManagement.content.clientSettings.salesStatuses.description')}
            </BodyText>
            <SupportImage
              src="/assets/support/Salestatues.webp"
              alt={t('clientManagement.content.clientSettings.salesStatuses.imageAlt')}
              caption={t('clientManagement.content.clientSettings.salesStatuses.imageCaption')}
            />
            <BodyText sx={{ mt: 2 }}>
              {t('clientManagement.content.clientSettings.salesStatuses.functionality')}
            </BodyText>
          </Box>

          {/* Reject Reasons Settings */}
          <Box sx={{ mb: 4 }}>
            <SubTitle variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal }}>
              {t('clientManagement.content.clientSettings.rejectReasons.title')}
            </SubTitle>
            <BodyText sx={{ mb: 2 }}>
              {t('clientManagement.content.clientSettings.rejectReasons.description')}
            </BodyText>
            <SupportImage
              src="/assets/support/rejectReasons.webp"
              alt={t('clientManagement.content.clientSettings.rejectReasons.imageAlt')}
              caption={t('clientManagement.content.clientSettings.rejectReasons.imageCaption')}
            />
            <BodyText sx={{ mt: 2 }}>
              {t('clientManagement.content.clientSettings.rejectReasons.functionality')}
            </BodyText>
          </Box>

          {/* Create Group Permissions */}
          <Box sx={{ mb: 4 }}>
            <SubTitle variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal }}>
              {t('clientManagement.content.clientSettings.createGroupPermissions.title')}
            </SubTitle>
            <BodyText sx={{ mb: 2 }}>
              {t('clientManagement.content.clientSettings.createGroupPermissions.description')}
            </BodyText>
            <SupportImage
              src="/assets/support/createGroupPermission.webp"
              alt={t('clientManagement.content.clientSettings.createGroupPermissions.imageAlt')}
              caption={t('clientManagement.content.clientSettings.createGroupPermissions.imageCaption')}
            />
            <BodyText sx={{ mt: 2 }}>
              {t('clientManagement.content.clientSettings.createGroupPermissions.functionality')}
            </BodyText>
          </Box>

          {/* View All Clients Permission */}
          <Box sx={{ mb: 4 }}>
            <SubTitle variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal }}>
              {t('clientManagement.content.clientSettings.viewAllClientsPermission.title')}
            </SubTitle>
            <BodyText sx={{ mb: 2 }}>
              {t('clientManagement.content.clientSettings.viewAllClientsPermission.description')}
            </BodyText>
            <SupportImage
              src="/assets/support/viewallClient.webp"
              alt={t('clientManagement.content.clientSettings.viewAllClientsPermission.imageAlt')}
              caption={t('clientManagement.content.clientSettings.viewAllClientsPermission.imageCaption')}
            />
            <BodyText sx={{ mt: 2 }}>
              {t('clientManagement.content.clientSettings.viewAllClientsPermission.functionality')}
            </BodyText>
          </Box>
        </>
      )}

      {/* Mobile Section */}
      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.clientSettings.mobileSection.title')}
          </SubTitle>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.clientSettings.mobileSection.description')}
          </BodyText>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.clientSettings.mobileSection.functionality')}
          </BodyText>

          <InfoAlert>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {isArabic ? "ملاحظة مهمة" : "Important Note"}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.clientSettings.mobileSection.webOnlyNote')}
            </FeatureText>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  const renderGroupsContent = () => (
    <Box>
      <BodyText>
        {t('clientManagement.content.salesGroups.description')}
      </BodyText>

      {platform === 'web' && (
        <>
          <SupportImage
            src="/assets/support/SalesGroup.webp"
            alt="Sales Groups Interface Overview"
            isArabic={isArabic}
            caption={t('clientManagement.content.salesGroups.interfaceOverview.imageCaption')}
          />

          <SubTitle>
            {t('clientManagement.content.salesGroups.addingGroups.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.salesGroups.addingGroups.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/addSalesGroup.webp"
            alt="Add Sales Group Dialog"
            isArabic={isArabic}
            caption={t('clientManagement.content.salesGroups.addingGroups.dialogImageCaption')}
          />

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.salesGroups.addingGroups.steps', { returnObjects: true }).map((step, index) => (
              <FeatureText
                key={index}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          <SubTitle>
            {t('clientManagement.content.salesGroups.groupFields.title')}
          </SubTitle>

          <List sx={{ mb: 3 }}>
            {t('clientManagement.content.salesGroups.groupFields.fields', { returnObjects: true }).map((field, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={field.title}
                  secondary={field.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: SUPPORT_COLORS.teal
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          <SubTitle>
            {t('clientManagement.content.salesGroups.groupManagement.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.salesGroups.groupManagement.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/Grouplistview.webp"
            alt="Sales Groups List View"
            isArabic={isArabic}
            caption={t('clientManagement.content.salesGroups.groupManagement.listImageCaption')}
          />

          <SubTitle>
            {t('clientManagement.content.salesGroups.settingTargets.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.salesGroups.settingTargets.description')}
          </BodyText>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.salesGroups.settingTargets.steps', { returnObjects: true }).map((step, index) => (
              <FeatureText
                key={index}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          <SubTitle>
            {t('clientManagement.content.salesGroups.targetFeatures.title')}
          </SubTitle>

          <List sx={{ mb: 3 }}>
            {t('clientManagement.content.salesGroups.targetFeatures.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: SUPPORT_COLORS.teal
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Group Management Interface */}
          <SubTitle>
            {t('clientManagement.content.salesGroups.groupManagementInterface.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.salesGroups.groupManagementInterface.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/deletegroup.webp"
            alt="Group Management Interface with Edit and Delete Options"
            isArabic={isArabic}
            caption={t('clientManagement.content.salesGroups.groupManagementInterface.imageCaption')}
          />

          <BodyText sx={{ mt: 2, mb: 3 }}>
            {t('clientManagement.content.salesGroups.groupManagementInterface.functionality')}
          </BodyText>

          {/* Sales Member Details View */}
          <SubTitle>
            {t('clientManagement.content.salesGroups.memberDetailsView.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.salesGroups.memberDetailsView.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/GroupdetailsviewWeb.webp"
            alt="Sales Member Details View Interface"
            isArabic={isArabic}
            caption={t('clientManagement.content.salesGroups.memberDetailsView.imageCaption')}
          />

          <BodyText sx={{ mt: 2, mb: 3 }}>
            {t('clientManagement.content.salesGroups.memberDetailsView.functionality')}
          </BodyText>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <SubTitle>
            {t('clientManagement.content.salesGroups.mobileInterface.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.salesGroups.mobileInterface.description')}
          </BodyText>

          {/* Mobile Sales Groups Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/SaleGroupMob.webp"
              alt={isArabic ? "مجموعات المبيعات على الجوال" : "Mobile Sales Groups"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة مجموعات المبيعات على الجوال مع زر الإضافة وقائمة المجموعات" : "Mobile Sales Groups interface with plus button and groups list"}
            />
          </Box>

          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.salesGroups.mobileInterface.accessSteps.title')}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.accessSteps.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.accessSteps.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.accessSteps.step3')}
          </Typography>

          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.salesGroups.mobileInterface.creationProcess.title')}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.creationProcess.groupId')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.creationProcess.groupName')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.salesGroups.mobileInterface.creationProcess.addMembers')}
          </Typography>

          {/* Add Sales Group Mobile Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/AddSalesGroupMob.webp"
              alt={isArabic ? "إضافة مجموعة مبيعات على الجوال" : "Add Sales Group Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "نموذج إضافة مجموعة مبيعات على الجوال مع حقول اسم المجموعة ومعرف المجموعة وإضافة الأعضاء" : "Mobile Add Sales Group form with Group Name, Group ID fields and Add Members functionality"}
            />
          </Box>

          <SubTitle sx={{ mb: 2 }}>
            {isArabic ? "تحرير وحذف مجموعات المبيعات" : "Editing and Deleting Sales Groups"}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {isArabic ? "على الجوال، يمكنك تحرير وحذف مجموعات المبيعات من خلال النقر على النقاط الثلاث أو استخدام الإجراءات المتاحة:" : "On mobile, you can edit and delete sales groups by tapping the three dots or using available actions:"}
          </BodyText>

          {/* Edit Group Mobile Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/EditGroupMob.webp"
              alt={isArabic ? "تحرير مجموعة على الجوال" : "Edit Group Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة تحرير مجموعة المبيعات على الجوال مع عرض الأعضاء وخيارات التحرير" : "Mobile Edit Sales Group interface showing members and edit options"}
            />
          </Box>

          {/* Delete Group Mobile Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/deleteGroupMob.webp"
              alt={isArabic ? "حذف مجموعة على الجوال" : "Delete Group Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "تأكيد حذف مجموعة المبيعات على الجوال مع تحذير عدم إمكانية التراجع" : "Mobile Delete Sales Group confirmation with warning that action cannot be undone"}
            />
          </Box>

          <InfoAlert>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {t('clientManagement.content.salesGroups.mobileInterface.limitations.title')}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.salesGroups.mobileInterface.limitations.description')}
            </FeatureText>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  const renderLeadDetailsManagementContent = () => (
    <Box>
      <BodyText sx={{ mb: 3 }}>
        {t('clientManagement.content.leadDetailsManagement.description')}
      </BodyText>

      {platform === 'web' && (
        <>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal', mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.accessingTasks.title')}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.accessingTasks.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/leaddetailsWeb.webp"
            alt="Lead Details Tasks Interface"
            isArabic={isArabic}
            caption={t('clientManagement.content.leadDetailsManagement.accessingTasks.imageCaption')}
          />

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal', mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.creatingTasks.title')}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.creatingTasks.description')}
          </BodyText>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.leadDetailsManagement.creatingTasks.steps', { returnObjects: true }).map((step, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal', mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.taskInterface.title')}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.taskInterface.description')}
          </BodyText>

          <List sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.taskInterface.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal' }}
                  secondaryTypographyProps={{ fontSize: '0.8rem', fontFamily: 'Montserrat, sans-serif', color: 'text.primary' }}
                />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal', mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.leadFiles.title')}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.leadFiles.description')}
          </BodyText>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.leadDetailsManagement.leadFiles.steps', { returnObjects: true }).map((step, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'normal', mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.leadDocuments.title')}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {t('clientManagement.content.leadDetailsManagement.leadDocuments.description')}
          </BodyText>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.leadDetailsManagement.leadDocuments.steps', { returnObjects: true }).map((step, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.6,
                  mb: 0.5
                }}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <SubTitle>
            {t('clientManagement.content.leadDetailsManagement.mobileInterface.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.mobileInterface.description')}
          </BodyText>

          {/* Mobile Lead Details Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/LeaddetailsMob.webp"
              alt={isArabic ? "تفاصيل العميل المحتمل على الجوال" : "Mobile Lead Details"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة تفاصيل العميل المحتمل على الجوال مع قسم المهام (علامات التبويب + زر +) وأيقونات الملفات والمستندات مع أزرار +" : "Mobile Lead Details interface with Tasks section (tabs + button) and Files/Docs icons with + buttons"}
            />
          </Box>

          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.leadDetailsManagement.mobileInterface.availableFeatures.title')}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadDetailsManagement.mobileInterface.availableFeatures.tasks')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.leadDetailsManagement.mobileInterface.availableFeatures.files')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.leadDetailsManagement.mobileInterface.availableFeatures.documents')}
          </Typography>

          <InfoAlert>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {t('clientManagement.content.leadDetailsManagement.mobileInterface.limitations.title')}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.leadDetailsManagement.mobileInterface.limitations.description')}
            </FeatureText>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  const renderClientDetailsManagementContent = () => (
    <Box>
      <BodyText>
        {t('clientManagement.content.clientDetailsManagement.description')}
      </BodyText>

      {platform === 'web' && (
        <>
          <SupportImage
            src="/assets/support/ClientdetailsViewWeb.webp"
            alt="Client Details Interface Overview"
            isArabic={isArabic}
            caption={t('clientManagement.content.clientDetailsManagement.interfaceOverview.imageCaption')}
          />

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.interfaceOverview.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientDetailsManagement.interfaceOverview.description')}
          </BodyText>

          <List sx={{ mb: 3 }}>
            {t('clientManagement.content.clientDetailsManagement.interfaceOverview.tabs', { returnObjects: true }).map((tab, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={tab.title}
                  secondary={tab.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: SUPPORT_COLORS.teal
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.leadCreation.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientDetailsManagement.leadCreation.description')}
          </BodyText>

          <GridBox sx={{ mb: 3 }}>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {t('clientManagement.content.clientDetailsManagement.leadCreation.referenceNote.title')}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.clientDetailsManagement.leadCreation.referenceNote.description')}
            </FeatureText>
          </GridBox>

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.documentsFiles.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientDetailsManagement.documentsFiles.description')}
          </BodyText>

          <GridBox sx={{ mb: 3 }}>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {t('clientManagement.content.clientDetailsManagement.documentsFiles.referenceNote.title')}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.clientDetailsManagement.documentsFiles.referenceNote.description')}
            </FeatureText>
          </GridBox>

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/clientContactWeb.webp"
            alt="Client Contacts Management Interface"
            isArabic={isArabic}
            caption={t('clientManagement.content.clientDetailsManagement.clientContacts.imageCaption')}
          />

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.addingContacts.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.addingContacts.description')}
          </BodyText>

          <Box sx={{ ml: 2, mb: 4 }}>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.addingContacts.steps', { returnObjects: true }).map((step, index) => (
              <FeatureText
                key={index}
                dangerouslySetInnerHTML={{ __html: step }}
              />
            ))}
          </Box>

          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.contactFields.title')}
          </SubTitle>

          <List sx={{ mb: 3 }}>
            {t('clientManagement.content.clientDetailsManagement.clientContacts.contactFields.fields', { returnObjects: true }).map((field, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={field.title}
                  secondary={field.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: SUPPORT_COLORS.teal
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <SubTitle>
            {t('clientManagement.content.clientDetailsManagement.mobileInterface.title')}
          </SubTitle>

          <BodyText sx={{ mb: 2 }}>
            {t('clientManagement.content.clientDetailsManagement.mobileInterface.description')}
          </BodyText>

          {/* Mobile Client Details View Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/clientdetailsViewMob.webp"
              alt={isArabic ? "عرض تفاصيل العميل على الجوال" : "Mobile Client Details View"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "عرض تفاصيل العميل على الجوال مع معلومات العميل وبطاقات الحالة وأقسام الإدارة" : "Mobile Client Details View showing client information, status cards, and management sections"}
            />
          </Box>

          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.title')}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.tasks')}</strong> - {t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.tasksDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.files')}</strong> - {t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.filesDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.contacts')}</strong> - {t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.contactsDesc')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.leads')}</strong> - {t('clientManagement.content.clientDetailsManagement.mobileInterface.availableTabs.leadsDesc')}
          </Typography>

          <SubTitle sx={{ mb: 2 }}>
            {t('clientManagement.content.clientDetailsManagement.mobileInterface.functionality.title')}
          </SubTitle>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientDetailsManagement.mobileInterface.functionality.createLeads')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientDetailsManagement.mobileInterface.functionality.manageTasks')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientDetailsManagement.mobileInterface.functionality.accessFiles')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {t('clientManagement.content.clientDetailsManagement.mobileInterface.functionality.manageContacts')}
          </Typography>

          <InfoAlert>
            <FeatureText sx={{ mb: 1, fontWeight: 700 }}>
              {t('clientManagement.content.clientDetailsManagement.mobileInterface.documentsNote.title')}
            </FeatureText>
            <FeatureText sx={{ mb: 0 }}>
              {t('clientManagement.content.clientDetailsManagement.mobileInterface.documentsNote.description')}
            </FeatureText>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  const renderClientOperationsContent = () => (
    <Box>
      <BodyText>
        {t('clientManagement.content.clientOperations.description')}
      </BodyText>

      {/* Web Content */}
      {platform === 'web' && (
        <>
          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.clientOperations.editingClients.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.clientOperations.editingClients.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.editingClients.updateButton')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.editingClients.actionMenu')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.editingClients.editFields')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.editingClients.updateImage')}
          </Typography>

          {/* Client Edit Image */}
          <Box sx={{ mb: 3, ml: 2 }}>
            <SupportImage
              src="/assets/support/ClientEditWeb.webp"
              alt={isArabic ? "تحرير العميل" : "Client Edit"}
              isArabic={isArabic}
              maxWidth="600px"
              caption={isArabic ? "واجهة تحرير العميل مع خيارات التحديث" : "Client Edit Interface with Update Options"}
            />
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.clientOperations.deleteClient.title')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.clientOperations.deleteClient.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.deleteClient.step1')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.deleteClient.step2')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.deleteClient.step3')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.deleteClient.step4')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.deleteClient.note')}
          </Typography>

          {/* Client Delete Image */}
          <Box sx={{ mb: 3, ml: 2 }}>
            <SupportImage
              src="/assets/support/ClientDelete.webp"
              alt={isArabic ? "حذف العميل" : "Client Delete"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "حوار تأكيد حذف العميل" : "Client Delete Confirmation Dialog"}
            />
          </Box>
        </>
      )}

      {/* Mobile Content */}
      {platform === 'mobile' && (
        <>
          <SubTitle>
            {t('clientManagement.content.clientOperations.mobile.title')}
          </SubTitle>

          <BodyText>
            {t('clientManagement.content.clientOperations.mobile.description')}
          </BodyText>

          {/* Mobile Client Operations Overview Image */}
          <Box sx={{ mb: 3 }}>
            <SupportImage
              src="/assets/support/EditDeleteMob.webp"
              alt={isArabic ? "عمليات العملاء على الجوال" : "Mobile Client Operations"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "إدارة العملاء على الجوال مع إمكانيات التحرير الأساسية وخيارات العرض" : "Manage your clients on mobile with basic editing capabilities and viewing options"}
            />
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2 }}>
            {t('clientManagement.content.clientOperations.mobile.editingClients.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.clientOperations.mobile.editingClients.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.editingClients.tapClient')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.editingClients.editButton')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.editingClients.editFields')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.editingClients.saveChanges')}
          </Typography>

          {/* Update Client Mobile Image */}
          <Box sx={{ mb: 3, mt: 3 }}>
            <SupportImage
              src="/assets/support/UpdateClientMob.webp"
              alt={isArabic ? "تحديث العميل على الجوال" : "Update Client on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة تحديث العميل على الجوال مع خيارات التحرير والحفظ" : "Update Client Mobile Interface with editing and save options"}
            />
          </Box>

          <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 2, mt: 3 }}>
            {t('clientManagement.content.clientOperations.mobile.deletingClients.title')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            {t('clientManagement.content.clientOperations.mobile.deletingClients.description')}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.deletingClients.openClient')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.deletingClients.deleteButton')}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {t('clientManagement.content.clientOperations.mobile.deletingClients.confirmDelete')}
          </Typography>

          {/* Delete Client Mobile Image */}
          <Box sx={{ mb: 3, mt: 3 }}>
            <SupportImage
              src="/assets/support/deleteClientMob.webp"
              alt={isArabic ? "حذف العميل على الجوال" : "Delete Client on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "واجهة حذف العميل على الجوال مع خيارات التأكيد" : "Delete Client Mobile Interface with confirmation options"}
            />
          </Box>





        </>
      )}

     
    </Box>
  );

  // Render content based on selected section
  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent();
      case 'add-client':
        return renderAddClientContent();
      case 'client-operations':
        return renderClientOperationsContent();
      case 'leads-management':
        return renderLeadsContent();
      case 'lead-details-management':
        return renderLeadDetailsManagementContent();
      case 'client-details-management':
        return renderClientDetailsManagementContent();
      case 'sales-groups':
        return renderGroupsContent();
      case 'client-settings':
        return renderClientSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  return renderContent();
}

// Main exported component
export default function ClientManagementPage() {
  const { t } = useTranslation('support');
  const navigationItems = getClientManagementNavigationItems(t);

  return (
    <CommonSidebarLayout
      moduleKey="clientManagement"
      navigationItems={navigationItems}
      defaultSection="overview"
      backUrl="/support/getting-started"
      contentComponent={ClientManagementContent}
    />
  );
}
