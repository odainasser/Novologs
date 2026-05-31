import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';

import { Label } from 'src/components/label';

import { TargetSales } from './target-sales';
import { getUserStatistics } from 'src/actions/userManage/userManageActions';
import LinearProgress from '@mui/material/LinearProgress';
import { ErrorView } from 'src/sections/error/error-view';

// ----------------------------------------------------------------------

export function MemberHome({ memberId }) {
  const { t, i18n } = useTranslation('dashboard/client');
  const { userStatistics, userStatisticsLoading, userStatisticsError } =
    getUserStatistics(memberId);

  const rejectedAmount = userStatistics?.statistics?.rejectedLeadAmount;
  const awardedAmount = userStatistics?.statistics?.awardedLeadAmount;
  const leadAmount = userStatistics?.statistics?.totalLeadAmount;
  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' AED'
    );
  };

  const renderClientDetails = (
    <Card>
      <CardHeader title={'clients.labels.client_details'} />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {'clients.labels.active_clients'}</Typography>
          <Label variant="soft" color="success">
            5
          </Label>
        </Stack>

        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.non_active_clients')}</Typography>
          <Label variant="soft" color="error">
            16
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.client_members')}</Typography>
          <Label variant="soft" color="info">
            12
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {t('clients.labels.client_contacts')}</Typography>
          <Label variant="soft" color="warning">
            2
          </Label>
        </Stack>
      </Stack>
    </Card>
  );

  const renderLead = (
    <Card>
      <CardHeader title={t('clients.labels.business_lead_info')} />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {t('clients.labels.lead_count')}</Typography>
          <Label variant="soft" color="info">
            {userStatistics?.statistics?.totalOpenLeads}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.lead_amount')} </Typography>
          <Label variant="soft" color="info">
            {formatCurrency(leadAmount)}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {t('clients.labels.awarded_count')}</Typography>
          <Label variant="soft" color="success">
            {userStatistics?.statistics?.totalAwardedLeads}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.awarded_amount')}</Typography>
          <Label variant="soft" color="success">
            {formatCurrency(awardedAmount)}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {t('clients.labels.rejected_count')}</Typography>
          <Label variant="soft" color="error">
            {userStatistics?.statistics?.totalRejectedLeads}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.rejected_amount')}</Typography>
          <Label variant="soft" color="error">
            {formatCurrency(rejectedAmount)}
          </Label>
        </Stack>
        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography> {t('clients.labels.active_clients')}</Typography>
          <Label variant="soft" color="success">
            {userStatistics?.statistics?.activeClientsCount}
          </Label>
        </Stack>

        <Stack
          spacing={2}
          direction="row"
          sx={{
            wordBreak: 'break-all',
            typography: 'body2',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{t('clients.labels.non_active_clients')}</Typography>
          <Label variant="soft" color="error">
            0
          </Label>
        </Stack>
      </Stack>
    </Card>
  );
  if (userStatisticsLoading)
    return (
      <div>
        <LinearProgress
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2FBBA8',
            },
            backgroundColor: 'rgba(47, 187, 168, 0.2)', // Lighter version of #2FBBA8 for the background
          }}
        />
      </div>
    );
  if (userStatisticsError) {
    return <ErrorView errorCode={userStatisticsError} />;
  }
  const monthlyTargets = userStatistics?.statistics?.monthlyTargets;
  let seriesNameForTargetChart = new Date().getFullYear().toString();
  let targetSalesSeriesData;

  if (monthlyTargets && monthlyTargets.length > 0) {
    if (monthlyTargets[0].month) {
      try {
        const yearFromData = new Date(monthlyTargets[0].month).getFullYear();
        if (!Number.isNaN(yearFromData)) {
          seriesNameForTargetChart = yearFromData.toString();
        }
      } catch (e) {
        console.error('Error parsing year from monthlyTargets: ', e);
      }
    }
    targetSalesSeriesData = [
      {
        name: seriesNameForTargetChart,
        data: [
          {
            name: 'Target',
            data: monthlyTargets.map((item) => item.target || 0),
          },
          {
            name: 'Achieved',
            data: monthlyTargets.map((item) => item.achived || 0),
          },
        ],
      },
    ];
  } else {
    targetSalesSeriesData = [
      {
        name: seriesNameForTargetChart,
        data: [
          { name: 'Target', data: Array(12).fill(0) },
          { name: 'Achieved', data: Array(12).fill(0) },
        ],
      },
    ];
  }
  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={6}>
        <TargetSales
          title={t('clients.labels.overall_target')}
          chartHeight={360}
          // subheader="(+43%) than last year"
          chart={{
            categories: [
              t('clients.categories.jan'),
              t('clients.categories.feb'),
              t('clients.categories.mar'),
              t('clients.categories.apr'),
              t('clients.categories.may'),
              t('clients.categories.jun'),
              t('clients.categories.jul'),
              t('clients.categories.aug'),
              t('clients.categories.sep'),
              t('clients.categories.oct'),
              t('clients.categories.nov'),
              t('clients.categories.dec'),
            ],
            series: targetSalesSeriesData,
          }}
        />
      </Grid>
      {/* <Grid xs={12} md={3}>
        <Stack spacing={3}>{renderClientDetails}</Stack>
      </Grid> */}
      <Grid xs={12} md={3}>
        <Stack spacing={3}>{renderLead}</Stack>
      </Grid>
    </Grid>
  );
}
