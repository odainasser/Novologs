'use client';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';
import { useAuthContext } from 'src/auth/hooks';
import { getSettings } from 'src/actions/settings/settingActions';
import Avatar from '@mui/material/Avatar';
import { ProfileHome } from 'src/sections/user/profile-home';
import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';
// ----------------------------------------------------------------------

export function OverviewAppView({ isAdmin }) {
  const {
    settingsList,
    settingsListLoading,
    settingsListError,
    settingsListValidating,
    settingsListEmpty,
    mutate,
  } = getSettings();
  const { user } = useMockedUser();
  const { t, i18n } = useTranslation('dashboard/home');

  const theme = useTheme();
  const { zetaUser } = useAuthContext();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [newNotice, setNewNotice] = useState('');
  const [newNoticeAr, setNewNoticeAr] = useState('');

  const [currency, setCurrency] = useState('');
  const storedLang = localStorage.getItem('selectedLang');
  useEffect(() => {
    localStorage.removeItem('editorContentDocs');
  }, []);

  useEffect(() => {
    if (settingsList?.settings) {
      const companyLogoSetting = settingsList.settings.find(
        (setting) => setting.key === 'companyLogo'
      );

      const url = companyLogoSetting?.value || `${CONFIG.assetsDir}/logo/novo.svg`;
      setAvatarUrl(url);

      // If it's an svg, fetch it and convert to data URL so it renders reliably
      if (url && url.toLowerCase().endsWith('.svg')) {
        setAvatarDataUrl(null);

        // fetch and convert to data URL
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error('SVG fetch failed');
            return res.text();
          })
          .then((svgText) => {
            const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
            setAvatarDataUrl(dataUrl);
          })
          .catch((err) => {
            // if fetch fails (CORS or network), fallback to raw URL
            console.warn('Could not inline SVG, falling back to src URL:', err);
            setAvatarDataUrl(null);
          });
      } else {
        setAvatarDataUrl(null);
      }
      const TeamNoticeSetting = settingsList.settings.find(
        (setting) => setting.key === 'teamNotice'
      );
      if (TeamNoticeSetting?.value) {
        let parsedValue = {};
        try {
          parsedValue = JSON.parse(TeamNoticeSetting.value);
        } catch (e) {
          console.error('Invalid JSON in TeamNoticeSetting.value:', TeamNoticeSetting.value);
        }

        const arabicValue = parsedValue?.name?.localizedStrings?.find(
          (item) => item.language === 'ar'
        )?.value;

        setNewNotice(parsedValue?.name?.value || '');
        setNewNoticeAr(arabicValue || '');
      }

      const currencySetting = settingsList.settings.find(
        (setting) => setting.key === 'defaultCurrency'
      );
      if (currencySetting) {
        setCurrency(currencySetting.value);
      }
    }
  }, [settingsList]);
  const finalSrc = avatarDataUrl || avatarUrl;
  const renderView = (
    <>
      <Grid container spacing={3}>
        {!zetaUser?.roles?.includes('External') && !isAdmin && (
          <>
            <Grid xs={12} md={6} sx={{ mt: 1, ...(storedLang === 'ar' ? { pr: 1 } : { pl: 1 }) }}>
              <AppWelcome
                title={newNotice || t('home.new_notice')}
                titleAr={newNoticeAr || t('home.no_notice')}
                description={`${t('home.welcome_back')} 👋`}
                name={zetaUser?.fullName}
                img={zetaUser?.profileImageFileUrl}
              />
            </Grid>

            <Grid xs={12} md={6} sx={{ mt: 1, ...(storedLang === 'ar' ? { pl: 1 } : { pr: 1 }) }}>
              {/* <AppFeatured list={_appFeatured} /> */}
              <Box
                sx={{
                  p: 2,

                  borderRadius: 2,
                  display: 'flex',
                  height: { md: 1 },
                  position: 'relative',
                  alignItems: 'center',
                  textAlign: { xs: 'center', md: 'left' },
                  flexDirection: { xs: 'column', md: 'row' },
                  boxShadow:
                    '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                }}
              >
                <Avatar
                  src={finalSrc}
                  variant="square"
                  sx={{
                    width: '100%',
                    height: 185,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    // remove cropping, keep aspect ratio
                    overflow: 'hidden',
                  }}
                  imgProps={{
                    style: {
                      objectFit: 'contain', // 'contain' preserves svg aspect ratio
                      width: '100%',
                      height: '100%',
                    },
                  }}
                  alt="Company logo"
                />
              </Box>
            </Grid>
          </>
        )}

        <ProfileHome userId={zetaUser?.id} currency={currency} isAdmin={isAdmin} />
        {/* <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total active users"
            percent={2.6}
            total={18765}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total installed"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total downloads"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.vars.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Current download"
            subheader="Downloaded by operating system"
            chart={{
              series: [
                { label: 'Mac', value: 12244 },
                { label: 'Window', value: 53345 },
                { label: 'iOS', value: 44313 },
                { label: 'Android', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Area installed"
            subheader="(+43%) than last year"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                {
                  name: '2022',
                  data: [
                    { name: 'Asia', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Europe', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Americas', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: '2023',
                  data: [
                    { name: 'Asia', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                    { name: 'Europe', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                    { name: 'Americas', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  ],
                },
                {
                  name: '2024',
                  data: [
                    { name: 'Asia', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                    { name: 'Europe', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                    { name: 'Americas', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="New invoice"
            tableData={_appInvoices}
            headLabel={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopRelated title="Related applications" list={_appRelated} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopInstalledCountries title="Top installed countries" list={_appInstalled} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopAuthors title="Top authors" list={_appAuthors} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 48 }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="fluent:mail-24-filled"
              chart={{
                series: 75,
                colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
              }}
              sx={{ bgcolor: 'info.dark', [`& .${svgColorClasses.root}`]: { color: 'info.light' } }}
            />
          </Box>
        </Grid> */}
      </Grid>
    </>
  );

  return (
    <>
      {isAdmin ? (
        <>{renderView}</>
      ) : (
        <DashboardContent maxWidth="xl">{renderView}</DashboardContent>
      )}
    </>
  );
}
