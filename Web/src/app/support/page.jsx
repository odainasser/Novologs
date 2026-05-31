'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';





import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LanguagePopover } from 'src/layouts/components/language-popover';


// ----------------------------------------------------------------------

const getGuideData = (t) => [
  {
    id: 'welcome',
    title: '1. Welcome',
    description: '👋 Welcome to NovoTak! I\'ll guide you step by step to help you get started. You can follow along on Web or Mobile.',
    icon: 'solar:hand-heart-bold',
    category: 'basics',
    hasVideo: true,
    hasScreenshots: true,
    content: "Welcome to NovoTak! I'll guide you step by step to help you get started. You can follow along on Web or Mobile.",
    webSteps: [
      'Welcome to NovoTak web platform',
      'Follow this comprehensive guide',
      'Access all features from your browser',
      'Get familiar with the interface'
    ],
    mobileSteps: [
      'Welcome to NovoTak mobile app',
      'Follow this step-by-step guide',
      'Access core features on the go',
      'Get familiar with mobile interface'
    ]
  },
  {
    id: 'registration',
    title: '2. Registration & Login',
    description: 'Get started by creating your account and logging in securely on both web and mobile platforms.',
    icon: 'solar:user-plus-bold',
    category: 'basics',
    hasVideo: true,
    hasScreenshots: true,
    registrationUrl: 'https://novotak.sa/reg/',
    content: "Web: Go to the website → click Register → fill in your details → confirm via email.\n\nMobile: Open the app → tap Sign Up → enter details → verify with your email/phone.\n\nAlready registered? Just enter your username and password to Log In.\n\nTip: Use 'Forgot Password' if you need to reset your account.",
    webSteps: [
      'Go to the website',
      'Click Register button',
      'Fill in your details',
      'Confirm via email',
      'Log in with username and password',
      'Use "Forgot Password" if needed'
    ],
    mobileSteps: [
      'Open the NovoTak app',
      'Tap Sign Up',
      'Enter your details',
      'Verify with email/phone',
      'Log in with credentials',
      'Use password reset if needed'
    ]
  },
  {
    id: 'dashboard',
    title: '3. Dashboard',
    description: 'After login, you\'ll land on the Dashboard with navigation menu, quick stats, and notifications.',
    icon: 'solar:home-angle-bold',
    category: 'basics',
    hasVideo: true,
    hasScreenshots: true,
    content: "After login, you'll land on the Dashboard.\nHere you'll see:\n\n📂 Navigation menu (Tasks, Projects, Clients, Invoices, Reports)\n📊 Quick stats & recent activity\n🔔 Notifications & reminders\n\nOn mobile, the menu is collapsible at the bottom or side.",
    webSteps: [
      'View navigation menu with all modules',
      'Check quick stats and recent activity',
      'Review notifications and reminders',
      'Customize dashboard widgets',
      'Navigate between different modules'
    ],
    mobileSteps: [
      'Access collapsible menu at bottom/side',
      'Swipe through dashboard cards',
      'Tap notifications to view details',
      'Use bottom navigation to switch modules',
      'Pull to refresh dashboard data'
    ]
  },
  {
    id: 'teams',
    title: '4. Teams',
    description: 'Manage your team members, roles, permissions, and organizational structure with the comprehensive Teams module.',
    icon: 'solar:users-group-two-rounded-bold',
    category: 'core',
    hasVideo: true,
    hasScreenshots: true,
    supportUrl: '/support/teams',
    content: "The Teams module is your central hub for managing your organization:\n\nAdd and manage team members\nSet roles and permissions\nOrganize by departments\nView organizational chart\nSend team notices\n\nWeb: Full management capabilities\nMobile: Essential team viewing and basic operations",
    webSteps: [
      'Navigate to Teams module',
      'Add your first team members',
      'Set user types (Internal/External)',
      'Assign departments and roles',
      'Configure permissions and access',
      'Set up organizational chart structure',
      'Configure team communication system',
      'Set up reporting and export options'
    ],
    mobileSteps: [
      'Access Teams module on mobile',
      'View team member information',
      'Check member status and roles',
      'Access basic member details',
      'View organizational structure',
      'Receive team notifications'
    ]
  },
  {
    id: 'clients',
    title: '5. Clients',
    description: 'Manage your clients by adding details, viewing linked tasks, projects, and invoices from their profile.',
    icon: 'solar:user-bold',
    category: 'core',
    hasVideo: true,
    hasScreenshots: true,
    content: "To manage clients:\n\nGo to Clients.\nTap Add Client.\nEnter details and Save.\n\nYou can edit, view linked tasks, projects, and invoices from the client's profile.",
    webSteps: [
      'Go to Clients module',
      'Click Add Client',
      'Enter client details and contact information',
      'Save client profile',
      'View linked tasks, projects, and invoices',
      'Edit client information as needed'
    ],
    mobileSteps: [
      'Navigate to Clients',
      'Tap Add Client',
      'Fill in essential client details',
      'Save client profile',
      'Access client information on the go'
    ]
  },
  {
    id: 'tasks',
    title: '6. Tasks',
    description: 'Add tasks, assign members, attach files, add comments, and use filters to manage your workflow efficiently.',
    icon: 'solar:checklist-minimalistic-bold',
    category: 'core',
    hasVideo: true,
    hasScreenshots: true,
    supportUrl: '/support/tasks',
    content: "To add a task:\n\nWeb: Click + Add Task, fill in details, assign members → Save.\nMobile: Tap + Task, fill details, assign → Save.\n\nYou can also:\n✅ Mark tasks complete\n📎 Attach files\n💬 Add comments\n🔍 Use filters to find tasks quickly",
    webSteps: [
      'Click + Add Task',
      'Fill in task details and description',
      'Assign team members',
      'Set deadlines and priority',
      'Attach files and add comments',
      'Use filters to organize tasks'
    ],
    mobileSteps: [
      'Tap + Task',
      'Fill in task details',
      'Assign to team members',
      'Set due date and priority',
      'Mark tasks complete',
      'Add quick comments'
    ]
  },
  {
    id: 'projects',
    title: '7. Projects & Milestones',
    description: 'Organize tasks with projects, create milestones, and track progress visually with timelines.',
    icon: 'solar:folder-with-files-bold',
    category: 'core',
    hasVideo: true,
    hasScreenshots: true,
    content: "Projects help you organize tasks:\n\nAdd a project with start & end dates.\nCreate Milestones.\nAssign tasks under milestones.\n\nOn Web: Track visually with Timeline or Gantt chart.\nOn Mobile: Simplified milestone view.",
    webSteps: [
      'Add project with start & end dates',
      'Create milestones for key deliverables',
      'Assign tasks under milestones',
      'Track progress with Timeline view',
      'Use Gantt chart for visual planning',
      'Monitor project completion status'
    ],
    mobileSteps: [
      'Create project with essential details',
      'Add key milestones',
      'Assign tasks to milestones',
      'View simplified milestone progress',
      'Update project status on the go'
    ]
  },
  {
    id: 'invoices',
    title: '8. Invoices & Payments',
    description: 'Create invoices by selecting clients, adding items, applying taxes, and tracking payments.',
    icon: 'solar:bill-list-bold',
    category: 'financial',
    hasVideo: true,
    hasScreenshots: true,
    webOnly: true,
    content: "To create an invoice:\n\nSelect a Client.\nAdd items/services.\nApply discounts/taxes.\nSave and Send or Print.\n\nWeb: Best for detailed invoice creation & reports.\nMobile: Quick invoices & payment tracking.",
    webSteps: [
      'Select a client',
      'Add items/services with quantities',
      'Apply discounts and taxes',
      'Save and send or print invoice',
      'Track payment status',
      'Generate detailed invoice reports'
    ],
    mobileSteps: [
      'Quick invoice creation',
      'Basic payment tracking',
      'View invoice status updates'
    ]
  },
  {
    id: 'reports',
    title: '9. Reports & Analytics',
    description: 'Web provides full graphs and export options, while mobile shows summaries and quick stats.',
    icon: 'solar:chart-2-bold',
    category: 'analytics',
    hasVideo: true,
    hasScreenshots: true,
    content: "Web gives you full graphs, reports, and export options.\nMobile shows summaries and quick stats.\nUse filters to drill down by date, client, or project.",
    webSteps: [
      'Access full graphs and detailed reports',
      'Use advanced filtering options',
      'Export data in multiple formats',
      'Generate custom report views',
      'Analyze trends and performance',
      'Schedule automated reports'
    ],
    mobileSteps: [
      'View summary reports',
      'Check quick stats and KPIs',
      'Use basic filtering by date/client',
      'Access key performance indicators'
    ]
  },
  {
    id: 'notifications',
    title: '10. Notifications & Reminders',
    description: 'Receive task deadlines, project updates, and invoice reminders with push notifications on mobile.',
    icon: 'solar:bell-bold',
    category: 'productivity',
    hasVideo: true,
    hasScreenshots: true,
    content: "You'll receive:\n\n⏰ Task deadlines\n📢 Project updates\n💳 Invoice reminders\n\nOn mobile, enable push notifications for instant alerts.",
    webSteps: [
      'Configure notification preferences',
      'Set up task deadline alerts',
      'Manage project update notifications',
      'Set invoice reminder schedules',
      'View notification history',
      'Customize email notification frequency'
    ],
    mobileSteps: [
      'Enable push notifications',
      'Set up instant alerts',
      'Configure notification sounds',
      'Manage vibration settings',
      'Customize alert preferences'
    ]
  },
  {
    id: 'profile',
    title: '11. Profile & Settings',
    description: 'Change your picture, name, email, password, language, theme, and manage roles & permissions.',
    icon: 'solar:user-circle-bold',
    category: 'account',
    hasVideo: true,
    hasScreenshots: true,
    content: "Manage your profile:\n\nChange your picture, name, email\nUpdate password\nLanguage, theme, and notification preferences\n\nAdmins can manage roles & permissions (best done on Web).",
    webSteps: [
      'Change profile picture, name, email',
      'Update password and security settings',
      'Set language and theme preferences',
      'Configure notification preferences',
      'Manage roles and permissions (Admin)',
      'Set up workspace preferences'
    ],
    mobileSteps: [
      'Update basic profile information',
      'Change profile picture',
      'Set app preferences and themes',
      'Manage mobile-specific settings',
      'Update notification preferences'
    ]
  },
  {
    id: 'tips',
    title: '12. Tips for Efficient Use',
    description: 'Always save changes, use search & filters, attach files, check notifications, and use mobile for quick updates.',
    icon: 'solar:lightbulb-bolt-bold',
    category: 'productivity',
    hasVideo: true,
    hasScreenshots: false,
    content: "Always Save changes\nUse Search & Filters\nAttach supporting files for clarity\nRegularly check notifications\nUse Mobile for quick updates & Web for full management",
    webSteps: [
      'Always save changes before navigating',
      'Use search and filters effectively',
      'Attach supporting files for clarity',
      'Regularly check notifications',
      'Use keyboard shortcuts',
      'Leverage full management features'
    ],
    mobileSteps: [
      'Use mobile for quick updates',
      'Regularly sync with web platform',
      'Utilize swipe gestures',
      'Enable offline mode when needed',
      'Use voice-to-text for efficiency'
    ]
  },
  {
    id: 'help',
    title: '13. Need Help?',
    description: 'Open Help/FAQ in the app, contact support via chat or email, and check troubleshooting for common issues.',
    icon: 'solar:help-bold',
    category: 'support',
    hasVideo: true,
    hasScreenshots: true,
    content: "If you get stuck:\n\nOpen Help/FAQ in the app\nContact Support via chat or email\nCheck our Troubleshooting section for login, upload, and notification issues.",
    webSteps: [
      'Open Help/FAQ from main menu',
      'Search knowledge base',
      'Contact support via chat or email',
      'Check troubleshooting section',
      'Submit detailed support tickets',
      'Access community forums'
    ],
    mobileSteps: [
      'Access Help/FAQ from settings',
      'Use in-app chat support',
      'Report issues directly',
      'Check mobile troubleshooting',
      'Contact support team'
    ]
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: 'solar:list-bold' },
  { id: 'basics', name: 'Getting Started', icon: 'solar:play-circle-bold' },
  { id: 'core', name: 'Core Features', icon: 'solar:widget-bold' },
  { id: 'financial', name: 'Financial', icon: 'solar:dollar-minimalistic-bold' },
  { id: 'analytics', name: 'Reports & Analytics', icon: 'solar:chart-2-bold' },
  { id: 'productivity', name: 'Productivity', icon: 'solar:lightbulb-bolt-bold' },
  { id: 'account', name: 'Account & Settings', icon: 'solar:user-circle-bold' },
  { id: 'support', name: 'Support', icon: 'solar:help-bold' }
];

export default function SupportPage() {
  const router = useRouter();
  const { t } = useTranslation('support');
  const [selectedPlatform, setSelectedPlatform] = useState('web');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handlePlatformChange = (newValue) => {
    setSelectedPlatform(newValue);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getFilteredGuides = () => {
    let guides = getGuideData(t);

    // Filter by category
    if (selectedCategory !== 'all') {
      guides = guides.filter(guide => guide.category === selectedCategory);
    }

    // Filter by platform (some features are web-only)
    if (selectedPlatform === 'mobile') {
      guides = guides.filter(guide => !guide.webOnly);
    }



    return guides;
  };

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      <Container maxWidth="lg">


        {/* Help & Support Center Header */}
        <Box sx={{ textAlign: 'center', mb: 6, pt: 2 }}>
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: 'text.primary',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            {t('title')}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500
            }}
          >
            {t('subtitle')}
          </Typography>
        </Box>



        {/* Welcome Section with Video */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Left Side - Welcome Text */}
            <Grid xs={12} md={6}>
              <Box sx={{ pr: { md: 4 } }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 4,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary',
                    lineHeight: 1.2
                  }}
                >
                  {t('welcome.title')}
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{
                    mb: 4,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}
                >
                  {t('welcome.subtitle')}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mb: 0,
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500
                  }}
                >
                  <Link
                    href="https://www.youtube.com/watch?v=9OEvaUMOwdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.primary',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {t('welcome.watchVideo')}
                  </Link>
                  {' '}{t('welcome.and')}{' '}
                  <Link
                    href="https://novotak.sa"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.primary',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {t('welcome.visitWebsite')}
                  </Link>
                </Typography>
              </Box>
            </Grid>

            {/* Right Side - Video */}
            <Grid xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  '&::before': {
                    content: '""',
                    display: 'block',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    bgcolor: 'grey.100',
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/9OEvaUMOwdk?autoplay=1&mute=1&loop=1&playlist=9OEvaUMOwdk&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1"
                    title={t('welcome.videoTitle')}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '16px' }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Quick Links Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'text.primary',
              fontFamily: 'Montserrat, sans-serif',
              textAlign: 'center',
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover::after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '3px',
                bgcolor: '#006A67',
                borderRadius: '2px',
              },
            }}
          >
            {t('quickLinks.title')}
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white',
                  '&:hover': {
                    borderColor: 'text.primary',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={() => router.push('/support/getting-started?section=registration')}
              >
                <Iconify
                  icon="solar:user-plus-bold"
                  sx={{
                    width: 48,
                    height: 48,
                    color: '#006A67',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary',
                  }}
                >
                  {t('quickLinks.registerCompany.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {t('quickLinks.registerCompany.description')}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white',
                  position: 'relative',
                  '&:hover': {
                    borderColor: 'text.primary',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      bgcolor: '#006A67',
                      borderRadius: '0 0 4px 4px',
                    },
                  },
                }}
                onClick={() => router.push('/support/tasks?section=task-management')}
              >
                <Iconify
                  icon="solar:checklist-bold"
                  sx={{
                    width: 48,
                    height: 48,
                    color: '#006A67',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary',
                  }}
                >
                  {t('quickLinks.createTasks.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {t('quickLinks.createTasks.description')}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white',
                  '&:hover': {
                    borderColor: 'text.primary',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={() => router.push('/support/project-management?section=project-management')}
              >
                <Iconify
                  icon="solar:folder-bold"
                  sx={{
                    width: 48,
                    height: 48,
                    color: '#006A67',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary',
                  }}
                >
                  {t('quickLinks.manageProjects.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {t('quickLinks.manageProjects.description')}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'white',
                  '&:hover': {
                    borderColor: 'text.primary',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
                onClick={() => router.push('/support/client-management?section=overview')}
              >
                <Iconify
                  icon="solar:users-group-rounded-bold"
                  sx={{
                    width: 48,
                    height: 48,
                    color: '#006A67',
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontFamily: 'Montserrat, sans-serif',
                    color: 'text.primary',
                  }}
                >
                  {t('quickLinks.manageClients.title')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {t('quickLinks.manageClients.description')}
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Get Started Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
         

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              href="/support/getting-started"
              startIcon={<Iconify icon="solar:rocket-bold" width={24} />}
              sx={{
                borderColor: 'text.primary',
                color: 'text.primary',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                py: 3,
                px: 6,
                borderRadius: 4,
                fontSize: '1.3rem',
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'text.primary',
                  bgcolor: 'grey.50',
                  borderWidth: 2,
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                },
              }}
            >
              {t('getStarted.button')}
            </Button>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}

