import { useState, useCallback } from 'react';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { lighten } from '@mui/system';

export function UserTaskChart({ title, subheader, chart, ...other }) {
  const theme = useTheme();
  const storedLang = localStorage.getItem('selectedLang');

  const defaultChartColors = [
    lighten(theme.palette.success.main, 0.3),
    lighten(theme.palette.info.light, 0.3),
    lighten(theme.palette.warning.main, 0.3),
    lighten(theme.palette.primary.main, 0.3),
    lighten(theme.palette.secondary.main, 0.3),
  ];

  const chartColors = chart.colors && chart.colors.length > 0 ? chart.colors : defaultChartColors;

  const chartOptions = useChart({
    chart: { stacked: false },
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    yaxis: {
      labels: {
        formatter: (value) => fNumber(value),
      },
    },
    tooltip: { y: { formatter: (value) => `${fNumber(value)} Tasks` } },
    plotOptions: {
      bar: {
        columnWidth: '40%',
        distributed: true,
        colors: {
          backgroundBarRadius: 5,
        },
      },
    },
    ...chart.options,
  });

  // Series data
  const seriesData = chart.series[0]?.data || [];

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
      />

      <>
        <ChartLegends
          colors={chartOptions?.colors}
          sx={{
            px: 3,
            gap: 3,
          }}
        />
        <Chart
          type="bar"
          series={[{ data: seriesData }]}
          options={chartOptions}
          height={385}
          loadingProps={{ sx: { p: 2.5 } }}
          sx={{
            ...(storedLang === 'ar' ? { pr: 1 } : { pl: 1 }),
            ...(storedLang === 'ar' ? { pl: 2.5 } : { pr: 2.5 }),
          }}
        />
      </>
    </Card>
  );
}
