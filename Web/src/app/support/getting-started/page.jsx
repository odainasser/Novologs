'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import { useTranslation } from 'react-i18next';
import { SUPPORT_COLORS } from '../components/common-sidebar-layout';
import {
  CommonSidebarLayout,
  SupportImage,
  SectionTitle,
  SubsectionTitle,
  SubTitle,
  BodyText,
  FeatureText,
  InfoAlert,
  GridBox,
  SupportIcon,
  
} from '../components/common-sidebar-layout';

// ----------------------------------------------------------------------

export default function GettingStartedPage() {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';
  const getNavigationItems = (t) => [
  {
    id: 'registration',
    title: t('gettingStarted.navigation.registration.title'),
    icon: 'solar:buildings-bold',
    description: t('gettingStarted.navigation.registration.description'),
    webOnly: true
  },
  {
    id: 'first-login',
    title: t('gettingStarted.navigation.firstLogin.title'),
    icon: 'solar:login-3-bold',
    description: t('gettingStarted.navigation.firstLogin.description')
  },
  {
    id: 'overview',
    title: t('gettingStarted.navigation.overview.title'),
    icon: 'solar:home-bold',
    description: t('gettingStarted.navigation.overview.description')
  },
  {
    id: 'teams',
    title: t('gettingStarted.navigation.team.title'),
    icon: 'solar:users-group-two-rounded-bold',
    description: t('gettingStarted.navigation.team.description'),
    isExternal: true,
    url: '/support/teams'
  },
  {
    id: 'tasks',
    title: t('gettingStarted.navigation.tasks.title'),
    icon: 'solar:checklist-bold',
    description: t('gettingStarted.navigation.tasks.description'),
    isExternal: true,
    url: '/support/tasks'
  },
  {
    id: 'project-management',
    title: t('gettingStarted.navigation.projectManagement.title'),
    icon: 'solar:folder-with-files-bold',
    description: t('gettingStarted.navigation.projectManagement.description'),
    isExternal: true,
    url: '/support/project-management'
  },
  {
    id: 'ticketing',
    title: t('gettingStarted.navigation.ticketing.title'),
    icon: 'solar:ticket-bold',
    description: t('gettingStarted.navigation.ticketing.description'),
    isExternal: true,
    url: '/support/ticketing'
  },
  {
    id:'client-management',
    title: t('gettingStarted.navigation.clients.title'),
    icon: 'solar:users-group-rounded-bold',
    description: t('gettingStarted.navigation.clients.description'),
    isExternal: true,
    url: '/support/client-management'
  },
   {
    id:'vendor-management',
    title: t('gettingStarted.navigation.vendor.title'),
    icon: 'solar:users-group-rounded-bold',
    description: t('gettingStarted.navigation.vendor.description'),
    isExternal: true,
    url: '/support/vendor-management'
  },
  {
    id: 'files-management',
    title: t('gettingStarted.navigation.filesManagement.title'),
    icon: 'solar:folder-with-files-bold',
    description: t('gettingStarted.navigation.filesManagement.description'),
    isExternal: true,
    url: '/support/files-management'
  }


];
  const navigationItems = getNavigationItems(t);

  const renderRegistrationContent = (platform) => {
    const registrationSteps = t('gettingStarted.content.registration.steps', { returnObjects: true });

    return (
      <Box>
  {platform === 'mobile' && (
    <InfoAlert>
      {t('gettingStarted.content.registration.mobileWarning')}
    </InfoAlert>
  )}


        <InfoAlert>
          {t('gettingStarted.content.registration.companyNote')}
        </InfoAlert>


        {/* Process Steps Box */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#006A67',
              mb: 3,
            }}
          >
            {t('gettingStarted.content.registration.stepsTitle')}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2,
                '& a': {
                  color: '#006A67',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
            >
              1. {t('gettingStarted.content.registration.websiteStep')} <a href = "https://novotak.com">official website</a><br/>
              2. {t('gettingStarted.content.registration.getStartedStep')}<br/>
              3. {t('gettingStarted.content.registration.fillFormsStep')}
            </Typography>

            <Stepper orientation="vertical" sx={{ ml: 3, mb: 3 }}>
              {registrationSteps.map((step, index) => (
                <Step key={index} active>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 500,
                        color: 'black'
                      }
                    }}
                  >
                    {t('gettingStarted.content.registration.stepLabel')} {index + 1}: {step}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* <Typography
              variant="body1"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black'
              }}
            >
              4. You will receive a confirmation email with a login link and see the welcome screen.<br/>
              5. Click the link and set your password to complete registration.
            </Typography> */}
          </Box>
        </Paper>

        {/* Screenshots Section */}
        <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#006A67',
              mb: 3
            }}
          >
            {t('gettingStarted.content.registration.stepsTitle')}
          </Typography>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('gettingStarted.content.registration.screenshots.step1Title')}
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: SUPPORT_COLORS.imageBg,
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  zIndex: 10
                }
              }}
            >
              <SupportImage
                src="/assets/support/1.webp"
                alt={t('gettingStarted.content.registration.screenshots.step1Alt')}
                isArabic={false}
                maxWidth="600px"
                sx={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  p: 0
                }}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('gettingStarted.content.registration.screenshots.step2Title')}
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: SUPPORT_COLORS.imageBg,
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  zIndex: 10
                }
              }}
            >
              <SupportImage
                src="/assets/support/2.webp"
                alt={t('gettingStarted.content.registration.screenshots.step2Alt')}
                isArabic={false}
                maxWidth="600px"
                sx={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  p: 0
                }}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('gettingStarted.content.registration.screenshots.step3Title')}
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(0, 106, 103, 0.05)',
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  zIndex: 10
                }
              }}
            >
              <SupportImage
                src="/assets/support/3.webp"
                alt={t('gettingStarted.content.registration.screenshots.step3Alt')}
                isArabic={false}
                maxWidth="600px"
                sx={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  p: 0
                }}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                color: '#006A67',
                mb: 2
              }}
            >
              {t('gettingStarted.content.registration.successScreenTitle')}
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.200',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: SUPPORT_COLORS.imageBg,
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  zIndex: 10
                }
              }}
            >
              <SupportImage
                src="/assets/support/4.webp"
                alt={t('gettingStarted.content.registration.screenshots.step4Alt')}
                isArabic={false}
                maxWidth="600px"
                sx={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  p: 0
                }}
              />
            </Box>
          </Card>
          </Box>
        </Paper>



        {/* Step 5: Set Password - Final Section */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
           <Typography
              variant="body1"
              component="div"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black',
                mb: 2
              }}
            >
              {t('gettingStarted.content.registration.finalSteps')}

            </Typography>

        

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ p: 2, maxWidth: 400 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  color: '#006A67',
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                {t('gettingStarted.content.registration.screenshots.step5Title')}
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'rgba(0, 106, 103, 0.05)',
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    zIndex: 10
                  }
                }}
              >
                <SupportImage
                  src="/assets/support/5.webp"
                  alt={t('gettingStarted.content.registration.screenshots.step5Alt')}
                  isArabic={false}
                  maxWidth="600px"
                  sx={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    p: 0
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderFirstLoginContent = (platform) => {
    return (
      <Box>
        {platform === 'mobile' && (
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
              {t('gettingStarted.content.login.mobileNote')}
            </Typography>
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('gettingStarted.content.login.description')}
        </Typography>

        {/* Process Steps Box */}
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
            {t('gettingStarted.content.login.stepsTitle')}
          </Typography>

          {platform === 'web' ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.7,
                  color: 'black',
                  mb: 3
                }}
              >
                <strong>{t('gettingStarted.content.login.web.title')}</strong><br/>
                {t('gettingStarted.content.login.web.steps', { returnObjects: true }).map((step, index) => (
                  <span key={index}>{index + 1}. {step}<br/></span>
                ))}
              </Typography>

              {/* Web Login Image */}
              <SupportImage
                src={isArabic ? "/assets/support/logWeb-ar.webp" : "/assets/support/logWeb.webp"}
                alt={t('gettingStarted.content.login.web.title')}
                isArabic={isArabic}
                maxWidth="500px"
              />
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.7,
                  color: 'black',
                  mb: 3
                }}
              >
                <strong>{t('gettingStarted.content.login.mobile.title')}</strong><br/>
                {t('gettingStarted.content.login.mobile.steps', { returnObjects: true }).map((step, index) => (
                  <span key={index}>{index + 1}. {step}<br/></span>
                ))}
              </Typography>

              {/* Mobile Login Image */}
              <SupportImage
                src={isArabic ? "/assets/support/logmob-ar.webp" : "/assets/support/logmob.webp"}
                alt={t('gettingStarted.content.login.mobile.title')}
                isArabic={isArabic}
                maxWidth="300px"
              />
            </Box>
          )}
        </Paper>


      </Box>
    );
  };




  const renderOverviewContent = (platform) => {
    return (
      <Box>
        {platform === 'mobile' && (
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
              {t('gettingStarted.content.overview.mobileNote')}
            </Typography>
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            lineHeight: 1.7,
            color: 'black',
            mb: 3
          }}
        >
          {t('gettingStarted.content.overview.description')}
        </Typography>

        {/* Dashboard Components */}
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
            {t('gettingStarted.content.overview.componentsTitle')}
          </Typography>

          {platform === 'web' ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.7,
                  color: 'black',
                  mb: 3
                }}
              >
                <strong>{t('gettingStarted.content.overview.web.title')}</strong><br/>
                {t('gettingStarted.content.overview.web.features', { returnObjects: true }).map((feature, index) => (
                  <span key={index}>• {feature}<br/></span>
                ))}
              </Typography>

              {/* Web Dashboard Image */}
              <SupportImage
                src={isArabic ? "/assets/support/dashboardweb-ar.webp" : "/assets/support/dashboardweb.webp"}
                alt={t('gettingStarted.content.overview.web.title')}
                isArabic={isArabic}
                maxWidth="800px"
              />
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.7,
                  color: 'black',
                  mb: 3
                }}
              >
                <strong>{t('gettingStarted.content.overview.mobile.title')}</strong><br/>
                {t('gettingStarted.content.overview.mobile.features', { returnObjects: true }).map((feature, index) => (
                  <span key={index}>• {feature}<br/></span>
                ))}
              </Typography>

              {/* Mobile Dashboard Image */}
              <SupportImage
                src={isArabic ? "/assets/support/dashboardmob-ar.webp" : "/assets/support/dashboardmob.webp"}
                alt={t('gettingStarted.content.overview.mobile.title')}
                isArabic={isArabic}
                maxWidth="300px"
              />
            </Box>
          )}
        </Paper>

        {/* Navigation Guide */}
        <Paper sx={{ p: 3, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#006A67',
              mb: 3
            }}
          >
            {t('gettingStarted.content.navigationTips.title')}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                lineHeight: 1.7,
                color: 'black'
              }}
            >
              {platform === 'web' ? (
                <>
                  {t('gettingStarted.content.navigationTips.web', { returnObjects: true }).map((tip, index) => (
                    <span key={index}>• {tip}<br/></span>
                  ))}
                </>
              ) : (
                <>
                  {t('gettingStarted.content.navigationTips.mobile', { returnObjects: true }).map((tip, index) => (
                    <span key={index}>• {tip}<br/></span>
                  ))}
                </>
              )}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  // Content component that receives props from CommonSidebarLayout
  const GettingStartedContent = ({ platform, selectedSection }) => {
    switch (selectedSection) {
      case 'registration':
        return platform === 'mobile' ? (
          <Box sx={{ py: 4 }}>
            <InfoAlert sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                {t('gettingStarted.content.registration.mobileNotAvailable.title')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: 1.7,
                  mb: 2
                }}
              >
                {t('gettingStarted.content.registration.mobileNotAvailable.description')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#006A67',
                  fontWeight: 600
                }}
              >
                {t('gettingStarted.content.registration.switchToWeb')}
              </Typography>
            </InfoAlert>
          </Box>
        ) : renderRegistrationContent(platform);

      case 'first-login':
        return renderFirstLoginContent(platform);

      case 'overview':
        return renderOverviewContent(platform);

      default:
        return (
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: 1.7,
              color: 'black'
            }}
          >
            {t('gettingStarted.content.placeholder', { title: navigationItems.find(item => item.id === selectedSection)?.title })}
          </Typography>
        );
    }
  };

  return (
    <CommonSidebarLayout
      moduleKey="gettingStarted"
      navigationItems={navigationItems}
      defaultSection="registration"
      backUrl="/support"
      contentComponent={GettingStartedContent}
    />
  );
}

