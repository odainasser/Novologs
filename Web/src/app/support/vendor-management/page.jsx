'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CommonSidebarLayout,
  SupportImage,
  BodyText,
  InfoAlert,
  SUPPORT_COLORS
} from '../components/common-sidebar-layout';

// Navigation items function
const getVendorManagementNavigationItems = (t) => [
  {
    id: 'overview',
    title: t('vendorManagement.navigation.overview.title'),
    icon: 'solar:home-bold',
    description: t('vendorManagement.navigation.overview.description'),
    keywords: ['overview', 'vendor management', 'introduction', 'getting started']
  },
  {
    id: 'vendor-management',
    title: t('vendorManagement.navigation.vendorManagement.title'),
    icon: 'solar:buildings-2-bold',
    description: t('vendorManagement.navigation.vendorManagement.description'),
    keywords: ['vendor management', 'add vendor', 'vendor profile', 'vendor details']
  },
  {
    id: 'vendor-detail-overview',
    title: t('vendorManagement.navigation.vendorDetailOverview.title'),
    icon: 'solar:eye-bold',
    description: t('vendorManagement.navigation.vendorDetailOverview.description'),
    keywords: ['vendor details', 'vendor overview', 'contracts tab', 'documents tab', 'tasks tab', 'contacts tab', 'files tab']
  },
  {
    id: 'contract-management',
    title: t('vendorManagement.navigation.contractManagement.title'),
    icon: 'solar:document-text-bold',
    description: t('vendorManagement.navigation.contractManagement.description'),
    keywords: ['contract creation', 'add contract', 'contract fields', 'contract form', 'contract management', 'edit contract', 'delete contract', 'contract details']
  },
 
  {
    id: 'vendor-settings',
    title: t('vendorManagement.navigation.vendorSettings.title'),
    icon: 'solar:settings-bold',
    description: t('vendorManagement.navigation.vendorSettings.description'),
    keywords: ['vendor settings', 'contract types', 'contract status', 'permissions']
  }
];

// Content component that receives props from CommonSidebarLayout
function VendorManagementContent({ platform = 'web', selectedSection = 'overview' }) {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';

  const renderOverviewContent = () => (
    <Box>
      <BodyText>
        {t('vendorManagement.content.overview.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src="/assets/support/Vendordashboard.webp"
            alt="Vendor Management Dashboard Interface"
            isArabic={isArabic}
          />

          {/* Grid Layout for Vendor Management Features - 4 columns */}
          <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
            {/* Key Features Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                border: `1px solid ${SUPPORT_COLORS.teal}30`,
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: SUPPORT_COLORS.teal,
                    fontWeight: 600 
                  }}>
                    {t('vendorManagement.content.overview.keyFeatures.title')}
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {t('vendorManagement.content.overview.keyFeatures.features', { returnObjects: true }).map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${feature}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Getting Started Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                border: `1px solid ${SUPPORT_COLORS.teal}30`,
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: SUPPORT_COLORS.teal,
                    fontWeight: 600
                  }}>
                    {t('vendorManagement.content.overview.gettingStarted.title')}
                  </Typography>
                  <BodyText sx={{ mb: 2, fontSize: '0.85rem' }}>
                    {t('vendorManagement.content.overview.gettingStarted.description')}
                  </BodyText>
                  <List sx={{ p: 0 }}>
                    {t('vendorManagement.content.overview.gettingStarted.views', { returnObjects: true }).map((view, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${view}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Filters Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                border: `1px solid ${SUPPORT_COLORS.teal}30`,
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: SUPPORT_COLORS.teal,
                    fontWeight: 600
                  }}>
                    {isArabic ? "المرشحات المتاحة" : "Available Filters"}
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {t('vendorManagement.content.overview.gettingStarted.filters', { returnObjects: true }).map((filter, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${filter}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Web Features Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                border: `1px solid ${SUPPORT_COLORS.teal}30`,
                borderRadius: 2
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    color: SUPPORT_COLORS.teal,
                    fontWeight: 600
                  }}>
                    {t('vendorManagement.content.overview.web.features.title')}
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {t('vendorManagement.content.overview.web.features.items', { returnObjects: true }).map((item, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={`• ${item}`}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Vendor Details Section */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{
              mb: 3,
              color: SUPPORT_COLORS.teal,
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {t('vendorManagement.content.overview.vendorDetails.title')}
            </Typography>

            <BodyText sx={{ mb: 3 }}>
              {t('vendorManagement.content.overview.vendorDetails.description')}
            </BodyText>

            <SupportImage
              src="/assets/support/VendorDetailsWeb.webp"
              alt={t('vendorManagement.content.overview.vendorDetails.imageAlt')}
              isArabic={isArabic}
            />

            {/* Vendor Details Features */}
            <Grid container spacing={3} sx={{ mt: 3, mb: 4 }}>
              {/* Contracts Tab */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                  border: `1px solid ${SUPPORT_COLORS.teal}30`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{
                      mb: 2,
                      color: SUPPORT_COLORS.teal,
                      fontWeight: 600
                    }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.contracts.title')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.contracts.items', { returnObjects: true }).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents Tab */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                  border: `1px solid ${SUPPORT_COLORS.teal}30`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{
                      mb: 2,
                      color: SUPPORT_COLORS.teal,
                      fontWeight: 600
                    }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.documents.title')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.documents.items', { returnObjects: true }).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tasks & Contacts */}
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${SUPPORT_COLORS.teal}15 0%, ${SUPPORT_COLORS.teal}25 100%)`,
                  border: `1px solid ${SUPPORT_COLORS.teal}30`,
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{
                      mb: 2,
                      color: SUPPORT_COLORS.teal,
                      fontWeight: 600
                    }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.tasksContacts.title')}
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {t('vendorManagement.content.overview.vendorDetails.features.tasksContacts.items', { returnObjects: true }).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemText
                            primary={item}
                            primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Vendor Settings Section */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{
              mb: 3,
              color: SUPPORT_COLORS.teal,
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {t('vendorManagement.content.overview.vendorSettings.title')}
            </Typography>

            <BodyText sx={{ mb: 3 }}>
              {t('vendorManagement.content.overview.vendorSettings.description')}
            </BodyText>

            <SupportImage
              src="/assets/support/Vendorsettings.webp"
              alt={t('vendorManagement.content.overview.vendorSettings.imageAlt')}
              isArabic={isArabic}
            />

            {/* Permission Alert */}
            <InfoAlert severity="warning" sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                <strong>
                  {t('vendorManagement.content.overview.vendorSettings.permissionNotice.title')}
                </strong>{" "}
                {t('vendorManagement.content.overview.vendorSettings.permissionNotice.description')}
              </Typography>
            </InfoAlert>



          </Box>
        </Box>
      )}

      {/* Mobile Platform Content */}
      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{
            mb: 3,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600,
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {isArabic ? "إدارة الموردين على الجوال" : "Mobile Vendor Management"}
          </Typography>

          {/* Mobile Vendor Dashboard */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "لوحة تحكم الموردين" : "Vendor Dashboard"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "على الجوال، يمكنك الوصول إلى جميع الموردين من خلال علامة تبويب الموردين في التنقل السفلي:" : "On mobile, you can access all vendors through the Vendors tab in the bottom navigation:"}
            </BodyText>

            <SupportImage
              src="/assets/support/VendorDashboardMob.webp"
              alt={isArabic ? "لوحة تحكم الموردين على الجوال" : "Mobile Vendor Dashboard"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "لوحة تحكم الموردين على الجوال مع البحث والفلترة وقائمة الموردين" : "Mobile Vendor Dashboard with search, filtering, and vendor list"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 1 }}>
              <strong>{isArabic ? "الميزات المتاحة:" : "Available Features:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "البحث عن الموردين باستخدام شريط البحث" : "Search for vendors using the search bar"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "فلترة الموردين (موردي، جميع الموردين)" : "Filter vendors (My Vendors, All Vendors)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "عرض معلومات المورد الأساسية (الاسم، الهاتف، البريد الإلكتروني)" : "View basic vendor information (name, phone, email)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {isArabic ? "إنشاء موردين جدد باستخدام زر الإضافة (+)" : "Create new vendors using the plus (+) button"}
            </Typography>



            {/* Vendor Filter Image */}
            <Box sx={{ mt: 3, mb: 3 }}>
              <SupportImage
                src="/assets/support/MobileVendorFilterMob.webp"
                alt={isArabic ? "فلترة الموردين على الجوال" : "Mobile Vendor Filter"}
                isArabic={isArabic}
                maxWidth="400px"
                caption={isArabic ? "خيارات فلترة الموردين على الجوال مع إعدادات الفلترة المتقدمة" : "Mobile vendor filter options with advanced filtering settings"}
              />
            </Box>
          </Box>

          {/* Mobile Vendor Detail View */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "عرض تفاصيل المورد" : "Vendor Detail View"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "اضغط على أي مورد لعرض تفاصيله الكاملة وإدارة المعلومات المرتبطة:" : "Tap on any vendor to view their complete details and manage associated information:"}
            </BodyText>

            <SupportImage
              src="/assets/support/VendorDetailsMob.webp"
              alt={isArabic ? "تفاصيل المورد على الجوال" : "Mobile Vendor Detail"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "عرض تفاصيل المورد على الجوال مع معلومات الاتصال وأزرار التحرير والحذف" : "Mobile Vendor Detail view with contact information and edit/delete buttons"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 1 }}>
              <strong>{isArabic ? "معلومات المورد:" : "Vendor Information:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "معرف المورد ومعلومات الملف الشخصي" : "Vendor ID and profile information"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "تفاصيل الاتصال (الهاتف، البريد الإلكتروني، الموقع الإلكتروني)" : "Contact details (phone, email, website)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "أزرار التحرير والحذف (حسب الصلاحيات)" : "Edit and delete buttons (based on permissions)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {isArabic ? "علامات تبويب للمهام والملفات وجهات الاتصال" : "Tabs for Tasks, Files, and Contacts"}
            </Typography>
          </Box>

          {/* Mobile Contract Management */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "إدارة العقود على الجوال" : "Mobile Contract Management"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "يمكنك إنشاء وإدارة عقود الموردين مباشرة من تفاصيل المورد:" : "You can create and manage vendor contracts directly from the vendor details:"}
            </BodyText>

            <SupportImage
              src="/assets/support/ContractViewMob.webp"
              alt={isArabic ? "عقود المورد على الجوال" : "Mobile Vendor Contracts"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "قسم العقود في تفاصيل المورد مع إنشاء عقود جديدة وعرض العقود الموجودة" : "Contracts section in vendor details with new contract creation and existing contracts view"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 1 }}>
              <strong>{isArabic ? "إدارة العقود:" : "Contract Management:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "إنشاء عقود جديدة باستخدام زر الإضافة (+)" : "Create new contracts using the plus (+) button"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "عرض تفاصيل العقد (المعرف، العنوان، القيمة، تاريخ التسليم)" : "View contract details (ID, title, value, delivery date)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "تتبع حالة العقد وتواريخ التسليم" : "Track contract status and delivery dates"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {isArabic ? "الوصول إلى المستندات والملفات المرتبطة بالعقد" : "Access contract-related documents and files"}
            </Typography>
          </Box>

          <InfoAlert>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, mb: 1 }}>
              {isArabic ? "الوظائف المتاحة على الجوال" : "Mobile Functionality"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isArabic ? "تطبيق الجوال يوفر جميع الوظائف الأساسية لإدارة الموردين بما في ذلك إنشاء الموردين وإدارة العقود وتتبع المهام. الميزات المتقدمة مثل الإعدادات التفصيلية والتقارير الشاملة متاحة على واجهة الويب." : "The mobile app provides all essential vendor management functionality including vendor creation, contract management, and task tracking. Advanced features like detailed settings and comprehensive reporting are available on the web interface."}
            </Typography>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  const renderVendorDetailOverviewContent = () => (
    <Box>
      <BodyText>
        {t('vendorManagement.content.vendorDetailOverview.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <SupportImage
          src="/assets/support/VendorDetailsWeb.webp"
          alt={t('vendorManagement.content.vendorDetailOverview.imageAlt')}
          isArabic={isArabic}
        />
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <SupportImage
            src="/assets/support/VendorDetailsMob.webp"
            alt={isArabic ? "تفاصيل المورد على الجوال" : "Mobile Vendor Details"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "واجهة تفاصيل المورد على الجوال مع معلومات الاتصال والتبويبات" : "Mobile vendor details interface with contact information and tabs"}
          />
        </Box>
      )}

      {/* Vendor Details Interface Overview */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.interfaceOverview.title')}
      </Typography>

      <BodyText sx={{ mb: 3 }}>
        {t('vendorManagement.content.vendorDetailOverview.interfaceOverview.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.interfaceOverview.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Contracts Tab */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.contractsTab.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.vendorDetailOverview.contractsTab.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.contractsTab.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Documents Tab */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.documentsTab.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.vendorDetailOverview.documentsTab.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.documentsTab.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Tasks Tab */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.tasksTab.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.vendorDetailOverview.tasksTab.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.tasksTab.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Files Tab */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.filesTab.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.vendorDetailOverview.filesTab.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.filesTab.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Contacts Tab */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.vendorDetailOverview.contactsTab.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.vendorDetailOverview.contactsTab.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.vendorDetailOverview.contactsTab.features', { returnObjects: true }).map((feature, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={feature}
              primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Mobile Vendor Detail Interface */}
      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {isArabic ? "واجهة تفاصيل المورد على الجوال" : "Mobile Vendor Detail Interface"}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {isArabic ? "واجهة تفاصيل المورد على الجوال توفر عرضاً شاملاً لمعلومات المورد مع إمكانية الوصول السريع للوظائف الأساسية:" : "The mobile vendor detail interface provides a comprehensive view of vendor information with quick access to essential functions:"}
          </BodyText>

          {/* Vendor Profile Section */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "قسم الملف الشخصي:" : "Profile Section:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "صورة المورد الشخصية أو الشعار" : "Vendor profile picture or logo"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "معرف المورد (ID) واسم المورد" : "Vendor ID and vendor name"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "معلومات الاتصال: العنوان، الهاتف، الموقع الإلكتروني، البريد الإلكتروني" : "Contact information: Address, phone, website, email"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {isArabic ? "أزرار التحرير والحذف في الأعلى" : "Edit and delete buttons at the top"}
          </Typography>

          {/* Tab Navigation */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "التبويبات السفلية:" : "Bottom Tabs:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "المهام (Tasks)" : "Tasks"}</strong> - {isArabic ? "إدارة المهام المرتبطة بالمورد" : "Manage vendor-related tasks"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "الملفات (Files)" : "Files"}</strong> - {isArabic ? "إدارة الملفات والمستندات" : "Manage files and documents"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{isArabic ? "جهات الاتصال (Contacts)" : "Contacts"}</strong> - {isArabic ? "إدارة جهات اتصال المورد" : "Manage vendor contacts"}
          </Typography>

          {/* Contracts Section */}
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "قسم العقود:" : "Contracts Section:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "عرض قائمة العقود المرتبطة بالمورد" : "Display list of contracts associated with the vendor"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "معرف العقد وعنوان العقد" : "Contract ID and contract title"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "تفاصيل العقد: اسم المورد، القيمة، تاريخ التسليم" : "Contract details: Vendor name, value, delivery date"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {isArabic ? "زر (+) لإضافة عقود جديدة" : "Plus (+) button to add new contracts"}
          </Typography>

          <InfoAlert severity="info">
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isArabic ? "تفاصيل إنشاء وإدارة العقود متوفرة في قسم إدارة العقود. إنشاء المهام والملفات تم شرحه في وحدة إدارة المهام." : "Contract creation and management details are available in the Contract Management section. Task and file creation were described in the Task Management module."}
            </Typography>
          </InfoAlert>
        </Box>
      )}

      {/* Contract Reference */}
      {platform === 'web' && (
        <Box sx={{ mt: 4 }}>
          <InfoAlert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('vendorManagement.content.vendorDetailOverview.contractReference')}
            </Typography>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

  // Render contract management content
  const renderContractManagementContent = () => (
    <Box>
      <BodyText>
        {t('vendorManagement.content.contractManagement.description')}
      </BodyText>

      {/* Platform-specific images */}
      {platform === 'web' && (
        <SupportImage
          src="/assets/support/ContractDetailsWeb.webp"
          alt={t('vendorManagement.content.contractManagement.imageAlt')}
          isArabic={isArabic}
        />
      )}

      {platform === 'mobile' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {isArabic ? "إدارة العقود على الجوال" : "Mobile Contract Management"}
          </Typography>

          <BodyText sx={{ mb: 3 }}>
            {isArabic ? "إدارة العقود على الجوال توفر جميع الوظائف الأساسية لإنشاء وتحرير وحذف العقود مع واجهة مبسطة ومحسنة للأجهزة المحمولة." : "Mobile contract management provides all essential functions for creating, editing, and deleting contracts with a simplified interface optimized for mobile devices."}
          </BodyText>

          {/* Contract List View */}
          <SupportImage
            src={isArabic ? "/assets/support/AddContractMob-ar.webp" : "/assets/support/AddContractMob.webp"}
            alt={isArabic ? "قائمة العقود على الجوال" : "Mobile Contract List"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "عرض قائمة العقود مع تبويبات الموردين والعقود" : "Contract list view with Vendors and Contracts tabs"}
          />

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 3 }}>
            {isArabic ? "يمكن الوصول إلى العقود من خلال تبويب 'العقود' في الشاشة الرئيسية، حيث يتم عرض جميع العقود مع التفاصيل الأساسية مثل معرف العقد، العنوان، اسم المورد، والقيمة." : "Contracts can be accessed through the 'Contracts' tab in the main screen, displaying all contracts with essential details like contract ID, title, vendor name, and value."}
          </Typography>
        </Box>
      )}

      {/* Web Platform Content */}
      {platform === 'web' && (
        <Box>
          {/* Contract Access */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {t('vendorManagement.content.contractManagement.contractAccess.title')}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {t('vendorManagement.content.contractManagement.contractAccess.description')}
          </BodyText>

          <List sx={{ mb: 4 }}>
            {t('vendorManagement.content.contractManagement.contractAccess.steps', { returnObjects: true }).map((step, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItem>
            ))}
          </List>

      {/* Add Contract */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.contractManagement.addContract.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.addContract.description')}
      </BodyText>

      {/* Contract Fields */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.blue,
        fontWeight: 600,
        fontSize: '1rem'
      }}>
        {t('vendorManagement.content.contractManagement.contractFields.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.contractFields.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.contractManagement.contractFields.fields', { returnObjects: true }).map((field, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: field }}
            />
          </ListItem>
        ))}
      </List>

      {/* Contract Actions */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.blue,
        fontWeight: 600,
        fontSize: '1rem'
      }}>
        {t('vendorManagement.content.contractManagement.contractActions.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.contractActions.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.contractManagement.contractActions.actions', { returnObjects: true }).map((action, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: action }}
            />
          </ListItem>
        ))}
      </List>

      {/* Contract Details */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.contractManagement.contractDetails.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.contractDetails.description')}
      </BodyText>

      <SupportImage
        src="/assets/support/ContractDetailsWeb.webp"
        alt={t('vendorManagement.content.contractManagement.contractDetailsImageAlt')}
        isArabic={isArabic}
      />

      {/* Contract Tabs */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.blue,
        fontWeight: 600,
        fontSize: '1rem'
      }}>
        {t('vendorManagement.content.contractManagement.contractTabs.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.contractTabs.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.contractManagement.contractTabs.tabs', { returnObjects: true }).map((tab, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.6,
                color: 'black',
                mb: 0.5
              }}
              dangerouslySetInnerHTML={{ __html: tab }}
            />
          </ListItem>
        ))}
      </List>

      {/* Edit Contract */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.contractManagement.editContract.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.editContract.description')}
      </BodyText>

      <SupportImage
        src="/assets/support/EditContractWeb.webp"
        alt={t('vendorManagement.content.contractManagement.editContractImageAlt')}
        isArabic={isArabic}
      />

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.contractManagement.editContract.steps', { returnObjects: true }).map((step, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={step}
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Delete Contract */}
      <Typography variant="h6" sx={{
        mb: 2,
        color: SUPPORT_COLORS.teal,
        fontWeight: 600
      }}>
        {t('vendorManagement.content.contractManagement.deleteContract.title')}
      </Typography>

      <BodyText sx={{ mb: 2 }}>
        {t('vendorManagement.content.contractManagement.deleteContract.description')}
      </BodyText>

      <List sx={{ mb: 4 }}>
        {t('vendorManagement.content.contractManagement.deleteContract.steps', { returnObjects: true }).map((step, index) => (
          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={step}
              primaryTypographyProps={{ fontSize: '0.85rem' }}
            />
          </ListItem>
        ))}
      </List>

      {/* Mobile Contract Management Features */}
      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          {/* Contract Creation on Mobile */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.blue,
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {isArabic ? "إنشاء العقود على الجوال" : "Creating Contracts on Mobile"}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {isArabic ? "يمكن إنشاء العقود الجديدة بطريقتين:" : "New contracts can be created in two ways:"}
          </BodyText>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            <strong>1. {isArabic ? "من تبويب العقود:" : "From Contracts Tab:"}</strong> {isArabic ? "استخدم زر (+) في قائمة العقود الرئيسية" : "Use the (+) button in the main contracts list"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            <strong>2. {isArabic ? "من داخل المورد:" : "Inside Vendor:"}</strong> {isArabic ? "من صفحة تفاصيل المورد، استخدم زر (+) في قسم العقود" : "From vendor details page, use the (+) button in the contracts section"}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/AddContractMob-ar.webp" : "/assets/support/AddContractMob.webp"}
            alt={isArabic ? "إضافة عقد جديد على الجوال" : "Add New Contract on Mobile"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "نموذج إضافة عقد جديد مع جميع الحقول المطلوبة" : "Add contract form with all required fields"}
          />

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
            <strong>{isArabic ? "حقول العقد المطلوبة:" : "Required Contract Fields:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "معرف العقد*" : "Contract ID*"}</strong> - {isArabic ? "معرف فريد للعقد" : "Unique identifier for the contract"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "المبلغ" : "Amount"}</strong> - {isArabic ? "القيمة المالية للعقد" : "Financial value of the contract"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "العملة" : "Currency"}</strong> - {isArabic ? "نوع العملة (درهم، ريال، إلخ)" : "Currency type (AED, KWD, etc.)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "عنوان العقد" : "Contract Title"}</strong> - {isArabic ? "اسم وصفي للعقد" : "Descriptive name for the contract"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "المورد" : "Vendor"}</strong> - {isArabic ? "اختيار المورد المرتبط بالعقد" : "Select vendor associated with the contract"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "الحالة" : "Status"}</strong> - {isArabic ? "حالة العقد (معلق، نشط، مكتمل)" : "Contract status (Pending, Active, Completed)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "النوع" : "Type"}</strong> - {isArabic ? "نوع العقد (أمان، خدمات، إلخ)" : "Contract type (Safety, Services, etc.)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{isArabic ? "تاريخ التسليم" : "Delivery Date"}</strong> - {isArabic ? "الموعد المحدد لإنجاز العقد" : "Scheduled completion date"}
          </Typography>

          {/* Contract Details and Management */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.blue,
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {isArabic ? "تفاصيل العقد وإدارته" : "Contract Details and Management"}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {isArabic ? "يمكن عرض وإدارة تفاصيل العقد من خلال النقر على العقد في القائمة:" : "Contract details can be viewed and managed by clicking on a contract in the list:"}
          </BodyText>

          <SupportImage
            src={isArabic ? "/assets/support/ContractDetailsviewMob-ar.webp" : "/assets/support/ContractDetailsviewMob.webp"}
            alt={isArabic ? "تفاصيل العقد على الجوال" : "Contract Details on Mobile"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "صفحة تفاصيل العقد مع المعلومات الأساسية وإدارة المهام" : "Contract details page with basic information and task management"}
          />

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
            <strong>{isArabic ? "معلومات العقد المعروضة:" : "Contract Information Displayed:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "معرف العقد" : "Contract ID"}</strong> - {isArabic ? "المعرف الفريد للعقد (مثال: 008)" : "Unique contract identifier (e.g., 008)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "عنوان العقد" : "Contract Title"}</strong> - {isArabic ? "اسم العقد الوصفي" : "Descriptive contract name"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "اسم المورد" : "Vendor Name"}</strong> - {isArabic ? "المورد المرتبط بالعقد" : "Associated vendor name"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "القيمة والعملة" : "Value & Currency"}</strong> - {isArabic ? "المبلغ المالي ونوع العملة (مثال: KWD 456789.0)" : "Financial amount and currency type (e.g., KWD 456789.0)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "النوع والحالة" : "Type & Status"}</strong> - {isArabic ? "نوع العقد (أمان، خدمات) وحالته (معلق، نشط)" : "Contract type (Safety, Services) and status (Pending, Active)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "تاريخ التسليم" : "Delivery Date"}</strong> - {isArabic ? "الموعد المحدد لإنجاز العقد" : "Scheduled completion date"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "إدارة المهام" : "Task Management"}</strong> - {isArabic ? "قسم المهام مع زر الإضافة (+) وزر التحديث" : "Tasks section with add (+) button and refresh functionality"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "الملفات والمستندات" : "Files & Documents"}</strong> - {isArabic ? "أيقونة الوصول السريع للملفات" : "Quick access icon for files"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{isArabic ? "أدوات التحرير والحذف" : "Edit & Delete Tools"}</strong> - {isArabic ? "أيقونات التحرير (قلم) والحذف (سلة المهملات) في الشريط العلوي" : "Edit (pencil) and delete (trash) icons in the top bar"}
          </Typography>

          {/* Contract Editing on Mobile */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.blue,
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {isArabic ? "تحرير العقود على الجوال" : "Editing Contracts on Mobile"}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {isArabic ? "يمكن تحرير العقود الموجودة من خلال النقر على أيقونة التحرير (القلم) في الشريط العلوي لصفحة تفاصيل العقد:" : "Existing contracts can be edited by tapping the edit icon (pencil) in the top bar of the contract details page:"}
          </BodyText>

          <SupportImage
            src={isArabic ? "/assets/support/UpdateContractMob-ar.webp" : "/assets/support/UpdateContractMob.webp"}
            alt={isArabic ? "تحديث العقد على الجوال" : "Update Contract on Mobile"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "نموذج تحديث العقد مع جميع الحقول القابلة للتعديل" : "Update contract form with all editable fields"}
          />

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
            <strong>{isArabic ? "الحقول القابلة للتحرير:" : "Editable Fields:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "معرف العقد*" : "Contract ID*"}</strong> - {isArabic ? "يمكن تعديل المعرف الفريد للعقد" : "Unique contract identifier can be modified"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "المبلغ والعملة" : "Amount & Currency"}</strong> - {isArabic ? "تحديث القيمة المالية ونوع العملة" : "Update financial value and currency type"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "عنوان العقد" : "Contract Title"}</strong> - {isArabic ? "تعديل الاسم الوصفي للعقد" : "Modify descriptive contract name"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "الحالة" : "Status"}</strong> - {isArabic ? "تغيير حالة العقد (معلق، نشط، مكتمل)" : "Change contract status (Pending, Active, Completed)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong>{isArabic ? "النوع" : "Type"}</strong> - {isArabic ? "تحديد نوع العقد (أمان، خدمات، إلخ)" : "Select contract type (Safety, Services, etc.)"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong>{isArabic ? "تاريخ التسليم" : "Delivery Date"}</strong> - {isArabic ? "تحديث الموعد المحدد لإنجاز العقد" : "Update scheduled completion date"}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3, fontWeight: 500 }}>
            💡 {isArabic ? "نصيحة: اضغط على زر 'حفظ' الأخضر في الزاوية العلوية اليمنى لتأكيد جميع التغييرات." : "Tip: Tap the green 'Save' button in the top right corner to confirm all changes."}
          </Typography>

          {/* Contract Deletion Warning */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.red || '#d32f2f',
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {isArabic ? "حذف العقود - تحذير مهم" : "Contract Deletion - Important Warning"}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {isArabic ? "يمكن حذف العقود من خلال النقر على أيقونة الحذف (سلة المهملات) في الشريط العلوي لصفحة تفاصيل العقد:" : "Contracts can be deleted by tapping the delete icon (trash can) in the top bar of the contract details page:"}
          </BodyText>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "خطوات حذف العقد:" : "Contract Deletion Steps:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            1. {isArabic ? "افتح صفحة تفاصيل العقد المراد حذفه" : "Open the contract details page you want to delete"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            2. {isArabic ? "اضغط على أيقونة سلة المهملات في الشريط العلوي" : "Tap the trash can icon in the top bar"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            3. {isArabic ? "أكد الحذف في رسالة التأكيد التي ستظهر" : "Confirm deletion in the confirmation dialog that appears"}
          </Typography>

          <SupportImage
            src={isArabic ? "/assets/support/ContractDeleteMob-ar.webp" : "/assets/support/ContractDeleteMob.webp"}
            alt={isArabic ? "حذف العقد على الجوال" : "Delete Contract on Mobile"}
            isArabic={isArabic}
            maxWidth="400px"
            caption={isArabic ? "رسالة تأكيد حذف العقد مع خيارات الإلغاء والحذف" : "Contract deletion confirmation dialog with Cancel and Delete options"}
          />

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
            <strong>{isArabic ? "خيارات رسالة التأكيد:" : "Confirmation Dialog Options:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • <strong style={{ color: '#1976d2' }}>{isArabic ? "إلغاء (Cancel)" : "Cancel"}</strong> - {isArabic ? "إلغاء عملية الحذف والعودة لصفحة تفاصيل العقد" : "Cancel deletion and return to contract details"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • <strong style={{ color: '#d32f2f' }}>{isArabic ? "حذف (Delete)" : "Delete"}</strong> - {isArabic ? "تأكيد حذف العقد نهائياً" : "Confirm permanent contract deletion"}
          </Typography>

          <InfoAlert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              <strong>{isArabic ? "⚠️ تحذير مهم:" : "⚠️ Important Warning:"}</strong> {isArabic ? "حذف العقد عملية دائمة ولا يمكن التراجع عنها. سيتم حذف جميع البيانات المرتبطة بالعقد بما في ذلك المهام والملفات والمستندات." : "Contract deletion is permanent and cannot be undone. All associated data including tasks, files, and documents will be deleted."}
            </Typography>
          </InfoAlert>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
            <strong>{isArabic ? "خطوات الحذف الآمن:" : "Safe Deletion Steps:"}</strong>
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            1. {isArabic ? "راجع جميع تفاصيل العقد والمستندات المرتبطة" : "Review all contract details and associated documents"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            2. {isArabic ? "احفظ نسخة احتياطية من المعلومات المهمة" : "Save a backup copy of important information"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            3. {isArabic ? "تأكد من عدم وجود مهام أو ملفات مرتبطة بالعقد" : "Ensure no tasks or files are linked to the contract"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            4. {isArabic ? "قم بالحذف فقط عند التأكد التام" : "Proceed with deletion only when completely certain"}
          </Typography>

          {/* Mobile Contract Features */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.blue,
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {isArabic ? "ميزات العقود على الجوال" : "Mobile Contract Features"}
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "عرض قائمة العقود مع التفاصيل الأساسية" : "Display contract list with essential details"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "إنشاء عقود جديدة بواجهة مبسطة" : "Create new contracts with simplified interface"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "تحرير العقود الموجودة" : "Edit existing contracts"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
            • {isArabic ? "ربط العقود بالموردين" : "Link contracts to vendors"}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
            • {isArabic ? "إدارة تواريخ التسليم والقيم المالية" : "Manage delivery dates and financial values"}
          </Typography>

          <InfoAlert severity="info">
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isArabic ? "تفاصيل إنشاء المهام والملفات المرتبطة بالعقود متوفرة في وحدة إدارة المهام. الميزات المتقدمة لإدارة العقود متاحة على واجهة الويب." : "Details for creating tasks and files related to contracts are available in the Task Management module. Advanced contract management features are available on the web interface."}
            </Typography>
          </InfoAlert>
        </Box>
      )}

          {/* Warning Alert */}
          <Box sx={{ mt: 4 }}>
            <InfoAlert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('vendorManagement.content.contractManagement.deleteContract.warning')}
              </Typography>
            </InfoAlert>
          </Box>

          {/* Reference Alert */}
          <Box sx={{ mt: 2 }}>
            <InfoAlert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('vendorManagement.content.contractManagement.tabsReference')}
              </Typography>
            </InfoAlert>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderVendorSettingsContent = () => (
    <Box>
      <BodyText>
        {t('vendorManagement.content.vendorSettings.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src="/assets/support/Vendorsettings.webp"
            alt={t('vendorManagement.content.vendorSettings.imageAlt')}
            isArabic={isArabic}
          />

          {/* Contract Types Section */}
          <Typography variant="h6" sx={{
            mb: 2,
            mt: 4,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {t('vendorManagement.content.vendorSettings.contractTypes.title')}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {t('vendorManagement.content.vendorSettings.contractTypes.description')}
          </BodyText>

          <List sx={{ mb: 4 }}>
            {t('vendorManagement.content.vendorSettings.contractTypes.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </ListItem>
            ))}
          </List>

        

          {/* Contract Status Section */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {t('vendorManagement.content.vendorSettings.contractStatus.title')}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {t('vendorManagement.content.vendorSettings.contractStatus.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/ContractstatusWeb.webp"
            alt={t('vendorManagement.content.vendorSettings.contractStatusImageAlt')}
            isArabic={isArabic}
          />

          <List sx={{ mb: 4, mt: 2 }}>
            {t('vendorManagement.content.vendorSettings.contractStatus.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </ListItem>
            ))}
          </List>

         

          {/* View All Contracts Permission Section */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {t('vendorManagement.content.vendorSettings.viewAllContracts.title')}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {t('vendorManagement.content.vendorSettings.viewAllContracts.description')}
          </BodyText>

          <SupportImage
            src="/assets/support/viewallvendorWeb.webp"
            alt={t('vendorManagement.content.vendorSettings.viewAllContractsImageAlt')}
            isArabic={isArabic}
          />

          <List sx={{ mb: 4, mt: 2 }}>
            {t('vendorManagement.content.vendorSettings.viewAllContracts.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </ListItem>
            ))}
          </List>

        

          {/* Settings Icons and Permissions */}
          <Typography variant="h6" sx={{
            mb: 2,
            color: SUPPORT_COLORS.teal,
            fontWeight: 600
          }}>
            {t('vendorManagement.content.vendorSettings.settingsIcons.title')}
          </Typography>

          <BodyText sx={{ mb: 2 }}>
            {t('vendorManagement.content.vendorSettings.settingsIcons.description')}
          </BodyText>

          <List sx={{ mb: 4 }}>
            {t('vendorManagement.content.vendorSettings.settingsIcons.features', { returnObjects: true }).map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: 1.6,
                    color: 'black',
                    mb: 0.5
                  }}
                  dangerouslySetInnerHTML={{ __html: feature }}
                />
              </ListItem>
            ))}
          </List>

        

         

          {/* Settings Management Features */}
          <Box sx={{ mt: 4 }}>
          

          
              
              <Grid item xs={12} sm={6}>
                <InfoAlert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {isArabic
                      ? "تتطلب إدارة الإعدادات صلاحيات إدارية مناسبة."
                      : "Settings management requires appropriate administrative permissions."
                    }
                  </Typography>
                </InfoAlert>
            
            </Grid>
          </Box>
        </Box>
      )}

      {/* Mobile Platform Alert */}
      {platform === 'mobile' && (
        <InfoAlert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('vendorManagement.content.vendorSettings.mobileAlert')}
          </Typography>
        </InfoAlert>
      )}
    </Box>
  );

  const renderVendorManagementContent = () => (
    <Box>
      <BodyText>
        {t('vendorManagement.content.vendorManagement.description')}
      </BodyText>

      {/* Platform-specific content */}
      {platform === 'web' && (
        <Box>
          <SupportImage
            src="/assets/support/AddVendorWeb.webp"
            alt={t('vendorManagement.content.vendorManagement.imageAlt')}
            isArabic={isArabic}
          />

          {/* How to Add Vendor Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{
              mb: 3,
              color: SUPPORT_COLORS.teal,
              fontWeight: 600,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {t('vendorManagement.content.vendorManagement.addVendor.title')}
            </Typography>

            <BodyText sx={{ mb: 3 }}>
              {t('vendorManagement.content.vendorManagement.addVendor.description')}
            </BodyText>

            {/* Vendor Form Structure */}
            <Box sx={{ mt: 2, mb: 4 }}>
              {/* Form Fields */}
              <Typography variant="h6" sx={{
                mb: 3,
                color: SUPPORT_COLORS.teal,
                fontWeight: 600
              }}>
                {t('vendorManagement.content.vendorManagement.vendorForm.title')}
              </Typography>

              <List sx={{ p: 0, mb: 4 }}>
                {t('vendorManagement.content.vendorManagement.vendorForm.fields', { returnObjects: true }).map((field, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 500,
                          color: SUPPORT_COLORS.teal
                        }}>
                          {field.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '0.85rem',
                          mt: 0.5
                        }}>
                          {field.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {/* Actions */}
              <Typography variant="h6" sx={{
                mb: 3,
                color: SUPPORT_COLORS.teal,
                fontWeight: 600
              }}>
                {t('vendorManagement.content.vendorManagement.actions.title')}
              </Typography>

              <List sx={{ p: 0 }}>
                {t('vendorManagement.content.vendorManagement.actions.items', { returnObjects: true }).map((action, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={action}
                      primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* How to Edit Vendor */}
              <Typography variant="h6" sx={{
                mb: 3,
                mt: 4,
                color: SUPPORT_COLORS.teal,
                fontWeight: 600
              }}>
                {t('vendorManagement.content.vendorManagement.editVendor.title')}
              </Typography>

              <BodyText sx={{ mb: 3 }}>
                {t('vendorManagement.content.vendorManagement.editVendor.description')}
              </BodyText>

              <SupportImage
                src="/assets/support/UpdateVendorweb.webp"
                alt={t('vendorManagement.content.vendorManagement.editVendor.imageAlt')}
                isArabic={isArabic}
              />

              <List sx={{ p: 0, mb: 4 }}>
                {t('vendorManagement.content.vendorManagement.editVendor.steps', { returnObjects: true }).map((step, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Permission Notice for Edit */}
              <InfoAlert severity="warning" sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <strong>
                    {t('vendorManagement.content.vendorManagement.editVendor.permissionNotice.title')}
                  </strong>{" "}
                  {t('vendorManagement.content.vendorManagement.editVendor.permissionNotice.description')}
                </Typography>
              </InfoAlert>

              {/* How to Delete Vendor */}
              <Typography variant="h6" sx={{
                mb: 3,
                color: SUPPORT_COLORS.teal,
                fontWeight: 600
              }}>
                {t('vendorManagement.content.vendorManagement.deleteVendor.title')}
              </Typography>

              <BodyText sx={{ mb: 3 }}>
                {t('vendorManagement.content.vendorManagement.deleteVendor.description')}
              </BodyText>

              <List sx={{ p: 0, mb: 4 }}>
                {t('vendorManagement.content.vendorManagement.deleteVendor.steps', { returnObjects: true }).map((step, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{ fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Permission Notice for Delete */}
              <InfoAlert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <strong>
                    {t('vendorManagement.content.vendorManagement.deleteVendor.permissionNotice.title')}
                  </strong>{" "}
                  {t('vendorManagement.content.vendorManagement.deleteVendor.permissionNotice.description')}
                </Typography>
              </InfoAlert>
            </Box>
          </Box>

        </Box>
      )}

      {/* Mobile Platform Content */}
      {platform === 'mobile' && (
        <Box sx={{ mt: 4 }}>
          {/* How to Add Vendor on Mobile */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "كيفية إضافة مورد جديد" : "How to Add a New Vendor"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "لإنشاء مورد جديد على الجوال، اضغط على زر الإضافة (+) في لوحة تحكم الموردين:" : "To create a new vendor on mobile, tap the plus (+) button in the vendor dashboard:"}
            </BodyText>

            <SupportImage
              src="/assets/support/AddVendorMob.webp"
              alt={isArabic ? "إضافة مورد جديد على الجوال" : "Add New Vendor on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "نموذج إضافة مورد جديد مع جميع الحقول المطلوبة" : "Add new vendor form with all required fields"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 1 }}>
              <strong>{isArabic ? "الحقول المطلوبة:" : "Required Fields:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "اسم المورد - الاسم الكامل للمورد أو الشركة" : "Vendor Name - Full name of the vendor or company"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "معرف المورد - معرف فريد للمورد" : "Vendor ID - Unique identifier for the vendor"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "البريد الإلكتروني - عنوان البريد الإلكتروني للتواصل" : "Email - Contact email address"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "الهاتف - رقم الهاتف للتواصل" : "Phone - Contact phone number"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "الموقع الإلكتروني - موقع الشركة (اختياري)" : "Website - Company website (optional)"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "المدينة - اختيار المدينة من القائمة المنسدلة" : "City - Select city from dropdown menu"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {isArabic ? "العنوان - العنوان الكامل للمورد" : "Address - Full address of the vendor"}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 2 }}>
              <strong>{isArabic ? "خطوات الإضافة:" : "Steps to Add:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              1. {isArabic ? "اضغط على زر (+) في لوحة تحكم الموردين" : "Tap the (+) button in the vendor dashboard"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              2. {isArabic ? "املأ جميع الحقول المطلوبة في النموذج" : "Fill in all required fields in the form"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              3. {isArabic ? "اختر صورة للمورد (اختياري) بالضغط على أيقونة الكاميرا" : "Choose a vendor image (optional) by tapping the camera icon"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              4. {isArabic ? "اضغط على زر 'حفظ' لإنشاء المورد الجديد" : "Tap the 'Save' button to create the new vendor"}
            </Typography>
          </Box>

          {/* How to Edit Vendor on Mobile */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "كيفية تحرير مورد موجود" : "How to Edit an Existing Vendor"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "لتحرير معلومات مورد موجود، انتقل إلى تفاصيل المورد واضغط على زر التحرير:" : "To edit an existing vendor's information, navigate to the vendor details and tap the edit button:"}
            </BodyText>

            <SupportImage
              src="/assets/support/EditVendorMob.webp"
              alt={isArabic ? "تحرير مورد على الجوال" : "Edit Vendor on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "نموذج تحديث المورد مع جميع الحقول القابلة للتحرير" : "Update vendor form with all editable fields"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
              <strong>{isArabic ? "خطوات التحرير:" : "Steps to Edit:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              1. {isArabic ? "انتقل إلى قائمة الموردين واختر المورد المطلوب" : "Navigate to the vendor list and select the desired vendor"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              2. {isArabic ? "في صفحة تفاصيل المورد، اضغط على أيقونة التحرير (قلم) في الأعلى" : "In the vendor details page, tap the edit icon (pencil) at the top"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              3. {isArabic ? "قم بتحديث الحقول المطلوبة في نموذج 'تحديث المورد'" : "Update the required fields in the 'Update Vendor' form"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              4. {isArabic ? "يمكنك تغيير صورة المورد بالضغط على أيقونة الكاميرا" : "You can change the vendor image by tapping the camera icon"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              5. {isArabic ? "اضغط على زر 'حفظ' لتأكيد التغييرات" : "Tap the 'Save' button to confirm the changes"}
            </Typography>

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              <strong>{isArabic ? "الحقول القابلة للتحرير:" : "Editable Fields:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "اسم المورد - تحديث اسم المورد أو الشركة" : "Vendor Name - Update vendor or company name"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "معرف المورد - تعديل المعرف الفريد" : "Vendor ID - Modify unique identifier"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "معلومات الاتصال - البريد الإلكتروني والهاتف والموقع" : "Contact Information - Email, phone, and website"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              • {isArabic ? "الموقع - المدينة والعنوان الكامل" : "Location - City and full address"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              • {isArabic ? "صورة المورد - تحديث الصورة الشخصية أو الشعار" : "Vendor Image - Update profile picture or logo"}
            </Typography>
          </Box>

          {/* How to Delete Vendor on Mobile */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: SUPPORT_COLORS.teal, fontWeight: 600 }}>
              {isArabic ? "كيفية حذف مورد" : "How to Delete a Vendor"}
            </Typography>

            <BodyText sx={{ mb: 2 }}>
              {isArabic ? "لحذف مورد من النظام، انتقل إلى تفاصيل المورد واستخدم خيار الحذف:" : "To delete a vendor from the system, navigate to the vendor details and use the delete option:"}
            </BodyText>

            <SupportImage
              src={isArabic ? "/assets/support/DeleteVendorMob-ar.webp" : "/assets/support/DeleteVendorMob.webp"}
              alt={isArabic ? "حذف مورد على الجوال" : "Delete Vendor on Mobile"}
              isArabic={isArabic}
              maxWidth="400px"
              caption={isArabic ? "مربع حوار تأكيد حذف المورد" : "Vendor deletion confirmation dialog"}
            />

            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mt: 2, mb: 2 }}>
              <strong>{isArabic ? "خطوات الحذف:" : "Steps to Delete:"}</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              1. {isArabic ? "انتقل إلى قائمة الموردين واختر المورد المطلوب حذفه" : "Navigate to the vendor list and select the vendor you want to delete"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              2. {isArabic ? "في صفحة تفاصيل المورد، اضغط على أيقونة الحذف (سلة المهملات) في الأعلى" : "In the vendor details page, tap the delete icon (trash can) at the top"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              3. {isArabic ? "سيظهر مربع حوار تأكيد يسأل 'هل أنت متأكد أنك تريد حذف هذا المورد؟'" : "A confirmation dialog will appear asking 'Are you sure you want to delete this vendor?'"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 1 }}>
              4. {isArabic ? "اضغط على 'حذف' لتأكيد الحذف أو 'إلغاء' للعودة" : "Tap 'Delete' to confirm deletion or 'Cancel' to go back"}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif', lineHeight: 1.6, mb: 3 }}>
              5. {isArabic ? "سيتم حذف المورد نهائياً من النظام" : "The vendor will be permanently removed from the system"}
            </Typography>

            <InfoAlert severity="warning">
              <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                <strong>{isArabic ? "تحذير:" : "Warning:"}</strong> {isArabic ? "حذف المورد عملية لا يمكن التراجع عنها. تأكد من أن المورد لا يحتوي على عقود أو مهام مرتبطة قبل الحذف." : "Deleting a vendor is irreversible. Make sure the vendor has no associated contracts or tasks before deletion."}
              </Typography>
            </InfoAlert>
          </Box>

          <InfoAlert severity="info">
            <Typography variant="body2" sx={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isArabic ? "تطبيق الجوال يوفر جميع الوظائف الأساسية لإدارة الموردين. الميزات المتقدمة متاحة على واجهة الويب." : "The mobile app provides all essential vendor management functionality. Advanced features are available on the web interface."}
            </Typography>
          </InfoAlert>
        </Box>
      )}
    </Box>
  );

 
  // Render content based on selected section
  const renderContent = () => {
    switch (selectedSection) {
      case 'overview':
        return renderOverviewContent();
      case 'vendor-management':
        return renderVendorManagementContent();
      case 'vendor-detail-overview':
        return renderVendorDetailOverviewContent();
      case 'contract-management':
        return renderContractManagementContent();
      
      case 'vendor-settings':
        return renderVendorSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  return renderContent();
}

// Main exported component
export default function VendorManagementPage() {
  const { t } = useTranslation('support');
  const navigationItems = getVendorManagementNavigationItems(t);

  return (
    <CommonSidebarLayout
      moduleKey="vendorManagement"
      navigationItems={navigationItems}
      defaultSection="overview"
      backUrl="/support/getting-started"
      contentComponent={VendorManagementContent}
    />
  );
}
