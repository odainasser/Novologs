'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';
import { sales_report } from 'src/sections/client/client-mock-data';
import { Divider } from '@mui/material';
import { LinearProgress } from '@mui/material';
import { ErrorView } from 'src/sections/error/error-view';

import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { fDate } from 'src/utils/format-time';
// ----------------------------------------------------------------------

export function SalesReport({
  salesTarget,
  salesTargetLoading,
  salesTargetError,
  salesTargetLength,
  totalAchieved,
  totalTarget,
  remaining,
}) {
  const { t, i18n } = useTranslation('dashboard/client');

  if (salesTargetLoading)
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
  if (salesTargetError) {
    return <ErrorView errorCode={salesTargetError} />;
  }
  const formatCurrency = (amount) => {
    return (
      new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ' AED'
    );
  };
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              cursor: 'pointer',

              mx: 1,
            }}
          >
            <Stack direction="column" sx={{ px: 2.5 }}>
              <Stack spacing={3} sx={{ p: 3 }}>
                <Typography variant="h6">
                  {' '}
                  {t('clients.sales_report.target_report')}
                  {/* {` ${report.year}`} */}
                </Typography>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('clients.sales_report.total_achieved')}
                  </Typography>
                  <Typography color="#003161">{formatCurrency(totalAchieved)}</Typography>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('clients.sales_report.target')}
                      </Typography>
                      <Typography>{formatCurrency(totalTarget)}</Typography>
                    </Box>
                    {remaining > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('clients.sales_report.remaining')}
                        </Typography>
                        <Typography>{formatCurrency(remaining)}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', xl: 'row' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {t('clients.sales_report.total_progress')}
                    </Typography>
                    <Typography variant="body2">
                      <Tooltip title={t('clients.sales_report.total_achieved')} arrow>
                        <Box component="span" sx={{ fontSize: '12px' }} color="grey">
                          {formatCurrency(totalAchieved)}
                        </Box>
                      </Tooltip>
                      {' / '}
                      <Tooltip title={t('clients.sales_report.total_target')} arrow>
                        <Box component="span" sx={{ fontSize: '12px' }} color="grey">
                          {formatCurrency(totalTarget)}
                        </Box>
                      </Tooltip>
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((parseInt(totalAchieved) / parseInt(totalTarget)) * 100, 100)}
                      sx={{
                        height: 8,
                        bgcolor: 'background.neutral',
                        flexGrow: 1,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor:
                            (parseInt(totalAchieved) / parseInt(totalTarget)) * 100 >= 50
                              ? 'primary.main'
                              : (parseInt(totalAchieved) / parseInt(totalTarget)) * 100 <= 25
                                ? 'error.main'
                                : 'warning.main',
                        },
                      }}
                    />

                    <Typography variant="body2" color="text.secondary">
                      {Math.round((parseInt(totalAchieved) / parseInt(totalTarget)) * 100)}%
                    </Typography>
                  </Box>
                </Box>

                {salesTarget?.target.map((monthlyReport, index) => {
                  if (index % 2 === 0) {
                    return (
                      <Box key={monthlyReport.id}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <FollowerItem report={monthlyReport} formatCurrency={formatCurrency} />
                          </Grid>
                          <Grid item xs={6}>
                            <FollowerItem
                              report={salesTarget?.target[index + 1]}
                              formatCurrency={formatCurrency}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  }
                  return null;
                })}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

function FollowerItem({ report, formatCurrency }) {
  const theme = useTheme();

  const totalAchieved = parseInt(report?.achivedValue, 10);
  const target = parseInt(report?.value, 10);

  const percentage = target > 0 ? (totalAchieved / target) * 100 : 0;
  const progressLabel = target === 0 ? 'No target set' : `${Math.round(percentage)}%`;
  const progressColor =
    percentage >= 50
      ? theme.palette.primary.main
      : percentage <= 25
        ? theme.palette.error.main
        : theme.palette.warning.main;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', xl: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1">
          {' '}
          {report?.date ? fDate(report.date, 'MMM') : ''}
        </Typography>

        <Typography variant="body2">
          <Tooltip title={t('clients.sales_report.achieved')} arrow>
            <Box component="span" sx={{ fontSize: '12px' }} color="grey">
              {formatCurrency(totalAchieved)}
            </Box>
          </Tooltip>
          {' / '}
          <Tooltip title={t('clients.sales_report.target')} arrow>
            <Box component="span" sx={{ fontSize: '12px' }} color="grey">
              {formatCurrency(target)}
            </Box>
          </Tooltip>
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            bgcolor: 'background.neutral',
            flexGrow: 1,
            '& .MuiLinearProgress-bar': {
              backgroundColor: progressColor,
            },
          }}
        />
        <Typography variant="body2">{progressLabel}</Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', borderWidth: '1.5px', my: 1 }} />
    </>
  );
}
