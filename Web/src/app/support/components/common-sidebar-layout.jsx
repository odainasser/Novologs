'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const SIDEBAR_WIDTH = 280;

// Standardized color scheme
export const SUPPORT_COLORS = {
  // Image backgrounds - ONLY light teal
  imageBg: 'rgba(0, 106, 103, 0.05)',  // Light teal for ALL images

  // Text colors
  teal: '#006A67',                      // Teal for subtitles (h5, h6, subtitle1, subtitle2)
  black: 'text.primary',               // Black for main headings (h1, h2)

  // Alert/Info colors
  infoYellow: '#fff3cd',               // Light yellow for info alerts

  // Grid/Box colors - Match Tasks module exactly
  gridBg: 'rgba(0, 106, 103, 0.05)',   // Light teal background (matches Tasks)
  gridBorder: 'rgba(0, 106, 103, 0.1)', // Light teal border (matches Tasks)

  // Icon colors - ALL icons use teal
  iconBg: '#006A67',                   // Teal background for ALL icons
  iconColor: 'white',                  // White icon color on teal background
};

// Standardized Support Image Component - ONLY light teal background
export const SupportImage = ({
  src,
  alt,
  isArabic,
  maxWidth = '800px',
  backgroundColor = SUPPORT_COLORS.imageBg, // ONLY light teal allowed
  caption,
  sx
}) => (
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
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth,
      mx: 'auto',
      ...sx
    }}
  >
    <img
      src={isArabic ? src.replace('.webp', '-ar.webp').replace('.png', '-ar.png') : src}
      alt={alt}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        borderRadius: '8px',
        maxWidth: '100%'
      }}
    />
    {caption && (
      <Typography
        variant="caption"
        sx={{
          mt: 1,
          textAlign: 'center',
          color: 'text.secondary',
          fontStyle: 'italic',
          fontSize: '0.75rem',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {caption}
      </Typography>
    )}
  </Box>
);

// Standardized Text Styles - EXACT match with Tasks module
export const supportTextStyles = {
  // Main section titles (h4) - EXACT Tasks module pattern
  mainTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    color: 'text.primary',
    mb: 2
  },
  // Subsection titles (h5) - TEAL color for subtitles
  subsectionTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    color: SUPPORT_COLORS.teal,
    mb: 2
  },
  // Sub-subsection titles (h6) - TEAL color for subtitles
  subTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    color: SUPPORT_COLORS.teal,
    mb: 2
  },
  // Body text - Use grey text color everywhere
  bodyText: {
    fontFamily: 'Montserrat, sans-serif',
    lineHeight: 1.7,
    color: 'text.primary',  // Grey color instead of black
    mb: 4
  },
  // Feature/list text - Use grey text color
  featureText: {
    fontFamily: 'Montserrat, sans-serif',
    lineHeight: 1.6,
    color: 'text.primary',  // Grey color instead of black
    mb: 1
  },
  // Caption text - SECONDARY, italic, centered
  captionText: {
    fontFamily: 'Montserrat, sans-serif',
    color: 'text.secondary',
    fontStyle: 'italic',
    textAlign: 'center',
    mb: 2
  }
};

// Utility Components following color guidelines
export const MainTitle = ({ children, variant = 'h1', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.mainTitle} {...props}>
    {children}
  </Typography>
);

export const SectionTitle = ({ children, variant = 'h2', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.mainTitle} {...props}>
    {children}
  </Typography>
);

export const SubsectionTitle = ({ children, variant = 'h5', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.subsectionTitle} {...props}>
    {children}
  </Typography>
);

export const SubTitle = ({ children, variant = 'h6', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.subTitle} {...props}>
    {children}
  </Typography>
);

export const BodyText = ({ children, variant = 'body1', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.bodyText} {...props}>
    {children}
  </Typography>
);

export const FeatureText = ({ children, variant = 'body2', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.featureText} {...props}>
    {children}
  </Typography>
);

export const CaptionText = ({ children, variant = 'body2', ...props }) => (
  <Typography variant={variant} sx={supportTextStyles.captionText} {...props}>
    {children}
  </Typography>
);

// Info Alert Component - ONLY light yellow for info
export const InfoAlert = ({ children, ...props }) => (
  <Alert
    severity="warning"
    sx={{
      mb: 3,
      backgroundColor: SUPPORT_COLORS.infoYellow,
      borderLeft: `4px solid #ffc107`,
      '& .MuiAlert-icon': {
        color: '#ffc107'
      },
      fontFamily: 'Montserrat, sans-serif'
    }}
    {...props}
  >
    {children}
  </Alert>
);

// Grid-type Box Component - Match Tasks module styling exactly
export const GridBox = ({ children, sx, ...props }) => (
  <Box
    sx={{
      backgroundColor: 'rgba(0, 106, 103, 0.05)',  // Light teal background like Tasks
      borderRadius: 2,
      p: 2,  // Match Tasks padding
      border: '1px solid rgba(0, 106, 103, 0.1)',  // Light teal border like Tasks
      height: '100%',  // Full height for grid layout
      ...sx
    }}
    {...props}
  >
    {children}
  </Box>
);

// Standardized Icon Component - ALL icons use teal background
export const SupportIcon = ({ icon, size = 20, sx, ...props }) => (
  <Box
    sx={{
      width: 32,
      height: 32,
      borderRadius: 1,
      backgroundColor: SUPPORT_COLORS.iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...sx
    }}
    {...props}
  >
    <Iconify
      icon={icon}
      width={size}
      height={size}
      sx={{ color: SUPPORT_COLORS.iconColor }}
    />
  </Box>
);

// ----------------------------------------------------------------------

export function CommonSidebarLayout({
  children,
  contentComponent: ContentComponent,
  moduleKey, // 'tasks', 'teams', 'project-management', 'ticketing'
  navigationItems,
  defaultSection = 'overview',
  backUrl = '/support/getting-started'
}) {
  const { t, i18n } = useTranslation('support');
  const isArabic = i18n.language === 'ar';
  const router = useRouter();
  
  const [selectedSection, setSelectedSection] = useState(defaultSection);
  const [platform, setPlatform] = useState('web');
  const [drawerOpen, setDrawerOpen] = useState(false);



  const handleSectionChange = (sectionId) => {
    // Find the navigation item
    const item = navigationItems.find(nav => nav.id === sectionId);

    // Handle external links
    if (item && item.isExternal && item.url) {
      router.push(item.url);
      return;
    }

    // Handle internal sections
    setSelectedSection(sectionId);
    setDrawerOpen(false);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };



  const renderSidebar = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <IconButton
          onClick={() => router.push(backUrl)}
          sx={{
            mb: 2,
            width: 40,
            height: 40,
            backgroundColor: SUPPORT_COLORS.iconBg,
            color: 'white',
            '&:hover': {
              backgroundColor: '#005A57',
              color: 'white'
            }
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
          {t(`${moduleKey}.title`)}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {t(`${moduleKey}.subtitle`)}
        </Typography>
      </Box>

      {/* Platform Toggle */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          {t('platform.title')}
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
              fontSize: '0.75rem',
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
            {t('platform.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 0.5 }} />
            {t('platform.mobile')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Navigation List */}
      <List sx={{ p: 2 }}>
        {navigationItems
          .filter(item => !item.webOnly || platform === 'web')
          .map((item) => (
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
                  minWidth: 48,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: selectedSection === item.id ? 'white' : SUPPORT_COLORS.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify
                    icon={item.icon}
                    width={20}
                    sx={{
                      color: selectedSection === item.id ? SUPPORT_COLORS.iconBg : 'white'
                    }}
                  />
                </Box>
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
            width: 40,
            height: 40,
            backgroundColor: SUPPORT_COLORS.iconBg,
            color: 'white',
            '&:hover': {
              backgroundColor: '#005A57',
              color: 'white'
            }
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
          {navigationItems.find(item => item.id === selectedSection)?.title || t(`${moduleKey}.title`)}
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
            {t('platform.web')}
          </ToggleButton>
          <ToggleButton value="mobile">
            <Iconify icon="solar:smartphone-bold" width={16} sx={{ mr: 0.5 }} />
            {t('platform.mobile')}
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
            {t('breadcrumb.support')}
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
            {t(`${moduleKey}.title`)}
          </Typography>
          {navigationItems.find(item => item.id === selectedSection) && (
            <>
              <Iconify icon={isArabic ? "solar:alt-arrow-left-bold" : "solar:alt-arrow-right-bold"} width={16} />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: 'text.primary',
                  fontWeight: 500
                }}
              >
                {navigationItems.find(item => item.id === selectedSection)?.title}
              </Typography>
            </>
          )}
        </Box>

        {/* Section Header - Match Tasks module with icon */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: SUPPORT_COLORS.iconBg,  // Teal background
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify
              icon={(() => {
                const currentItem = navigationItems.find(item => item.id === selectedSection);
                return currentItem?.icon || 'solar:document-text-bold';
              })()}
              width={24}
              sx={{ color: 'white' }}
            />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {(() => {
                const currentItem = navigationItems.find(item => item.id === selectedSection);
                return currentItem?.title || t(`${moduleKey}.title`);
              })()}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'text.secondary'
              }}
            >
              {(() => {
                const currentItem = navigationItems.find(item => item.id === selectedSection);
                return currentItem?.description || t(`${moduleKey}.subtitle`);
              })()}
            </Typography>
          </Box>
        </Box>

        {/* Content Wrapper - Match Tasks module layout exactly */}
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          {/* Render content component or children */}
          {ContentComponent ? (
            <ContentComponent
              platform={platform}
              selectedSection={selectedSection}
              setSelectedSection={handleSectionChange}
              navigationItems={navigationItems.filter(item => !item.webOnly || platform === 'web')}
            />
          ) : children ? (
            React.cloneElement(children, {
              platform,
              selectedSection,
              setSelectedSection: handleSectionChange,
              navigationItems: navigationItems.filter(item => !item.webOnly || platform === 'web')
            })
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
}

