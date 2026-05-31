'use client';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { allLangs } from 'src/locales';
import { _contacts, _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';
import { useTranslation } from 'react-i18next';

import { Main } from './main';
import { NavMobile } from './nav-mobile';
import { layoutClasses } from '../classes';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../config-nav-account';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { StyledDivider, useNavColorVars } from './styles';
import { AccountDrawer } from '../components/account-drawer';
import { SettingsButton } from '../components/settings-button';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';
import { ContactUs } from '../components/contact-us';

import { navData as dashboardNavData } from '../config-nav-dashboard';
import { NotificationsDrawer } from '../components/notifications-drawer';
import ChatBot from 'src/components/chat-bot/chat-bot';
import { useAuthContext } from 'src/auth/hooks';
import Button from '@mui/material/Button';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import { usePathname } from 'next/navigation';
// ----------------------------------------------------------------------

export function cleanKey(key) {
  return key?.toLowerCase().trim().replace(/\s+/g, ''); // Trim, convert to lowercase, and remove spaces
}
export function DashboardLayout({ sx, children, header, data }) {
  const { t, i18n } = useTranslation('navbar');
  const { zetaUser } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const storedLang = localStorage.getItem('selectedLang');
  const isSettings = pathname.startsWith(paths.dashboard.settings.root);
  const isAdmin = pathname.startsWith(paths.dashboard.admin.root);
  const isCalendar = pathname.startsWith(paths.dashboard.timesheet.root);
  const theme = useTheme();
  const navData = (data?.nav ?? dashboardNavData).map((navSection) => ({
    ...navSection,
    subheader: navSection.subheader ? t(`navbar:${cleanKey(navSection.subheader)}`) : undefined,
    items: navSection.items
      .filter((item) => {
        if (item.id === 14) {
          return zetaUser?.permissions?.includes('General.Settings');
        }
        return true;
      })
      .filter((item) => {
        if (item.id === 17) {
          return zetaUser?.permissions?.includes('General.ViewAll');
        }
        return true;
      })
      .map((item) => ({
        ...item,
        title: t(`navbar:${cleanKey(item.title)}`),
      })),
  }));

  const mobileNavOpen = useBoolean();

  const settings = useSettingsContext();

  const navColorVars = useNavColorVars(theme, settings);

  const layoutQuery = 'lg';

  const isNavMini = settings.navLayout === 'mini';
  const isNavHorizontal = settings.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.navLayout === 'vertical';

  return (
    <LayoutSection
      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          disableElevation={isNavVertical}
          slotProps={{
            toolbar: {
              sx: {
                ...(isNavHorizontal && {
                  bgcolor: 'var(--layout-nav-bg)',
                  [`& .${iconButtonClasses.root}`]: {
                    color: 'var(--layout-nav-text-secondary-color)',
                  },
                  [theme.breakpoints.up(layoutQuery)]: {
                    height: 'var(--layout-nav-horizontal-height)',
                  },
                }),
              },
            },
            container: {
              maxWidth: false,
              sx: {
                ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
              },
            },
          }}
          sx={header?.sx}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            bottomArea: isNavHorizontal ? (
              <NavHorizontal
                data={navData}
                layoutQuery={layoutQuery}
                cssVars={navColorVars.section}
              />
            ) : null,

            leftArea: (
              <>
                {/* -- Nav mobile -- */}
                <MenuButton
                  onClick={mobileNavOpen.onTrue}
                  sx={{
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navData}
                  open={mobileNavOpen.value}
                  onClose={mobileNavOpen.onFalse}
                  cssVars={navColorVars.section}
                />
                {/* -- Logo -- */}
                {isNavHorizontal && (
                  <Logo
                    sx={{
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    }}
                  />
                )}
                {/* -- Divider -- */}
                {isNavHorizontal && (
                  <StyledDivider
                    sx={{
                      [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
                    }}
                  />
                )}
                {/* -- Workspace popover -- */}
                {/* <WorkspacesPopover
                  data={_workspaces}
                  sx={{ color: 'var(--layout-nav-text-primary-color)' }}
                /> */}
              </>
            ),

            // centerArea: <Searchbar data={navData} />,

            rightArea: (
              <>
                {zetaUser?.permissions?.includes('General.Settings') && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify width={16} icon="eva:settings-2-fill" />}
                    onClick={() => router.push(paths.dashboard.settings.root)}
                    sx={{
                      mr: 1,
                      display: { xs: 'none', sm: 'inline-flex' },
                      bgcolor: isSettings ? '#000' : '#fff',
                      bgcolor: isSettings ? '#000' : '#fff',
                      color: isSettings ? '#fff' : 'text.primary',
                      '&:hover': {
                        bgcolor: isSettings ? '#000' : '#fff',
                      },
                    }}
                  >
                    Admin Settings
                  </Button>
                )}
                {zetaUser?.permissions?.includes('General.Settings') && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Iconify width={16} icon="eva:shield-fill" />}
                    onClick={() => router.push(paths.dashboard.admin.root)}
                    sx={{
                      mr: 1,
                      bgcolor: isAdmin ? '#000' : '#fff',
                      color: isAdmin ? '#fff' : 'text.primary',
                      '&:hover': {
                        bgcolor: isAdmin ? '#000' : '#fff',
                      },
                    }}
                  >
                    Admin Panel
                  </Button>
                )}

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify width={16} icon="eva:calendar-fill" />}
                  onClick={() => router.push(paths.dashboard.timesheet.root)}
                  sx={{
                    mr: 1,
                    bgcolor: isCalendar ? '#000' : '#fff',
                    color: isCalendar ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: isCalendar ? '#000' : '#fff',
                    },
                  }}
                >
                  Calender
                </Button>
                <Box display="flex" alignItems="center" gap={{ xs: 0, sm: 0.75 }}>
                  {/* -- Language popover -- */}
                  <LanguagePopover data={allLangs} />
                  {/* -- Notifications popover -- */}
                  <NotificationsDrawer
                    data={_notifications}
                    anchor={storedLang === 'ar' ? 'left' : 'right'}
                  />
                  {/* -- Contacts popover -- */}
                  {/* <ContactsPopover data={_contacts} /> */}
                  <ContactUs />

                  {/* -- Settings button -- */}
                  <SettingsButton />
                  {/* -- Account drawer -- */}
                  <AccountDrawer data={_account} anchor={storedLang === 'ar' ? 'left' : 'right'} />
                </Box>
              </>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        isNavHorizontal ? null : (
          <NavVertical
            data={navData}
            isNavMini={isNavMini}
            layoutQuery={layoutQuery}
            cssVars={navColorVars.section}
            onToggleNav={() =>
              settings.onUpdateField(
                'navLayout',
                settings.navLayout === 'vertical' ? 'mini' : 'vertical'
              )
            }
          />
        )
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        ...navColorVars.layout,
        '--layout-transition-easing': 'linear',
        '--layout-transition-duration': '120ms',
        '--layout-nav-mini-width': '88px',
        '--layout-nav-vertical-width': '300px',
        '--layout-nav-horizontal-height': '64px',
        '--layout-dashboard-content-pt': theme.spacing(1),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(5),
      }}
      sx={{
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            transition: theme.transitions.create(['padding-left', 'padding-right'], {
              easing: 'var(--layout-transition-easing)',
              duration: 'var(--layout-transition-duration)',
            }),
            ...(i18n.language === 'ar'
              ? {
                  pr: isNavMini
                    ? 'var(--layout-nav-mini-width)'
                    : 'var(--layout-nav-vertical-width)',
                  pl: 0,
                }
              : {
                  pl: isNavMini
                    ? 'var(--layout-nav-mini-width)'
                    : 'var(--layout-nav-vertical-width)',
                  pr: 0,
                }),
          },
        },

        ...sx,
      }}
    >
      <Main isNavHorizontal={isNavHorizontal}>{children}</Main>
    </LayoutSection>
  );
}
