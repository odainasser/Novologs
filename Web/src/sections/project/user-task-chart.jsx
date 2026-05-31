import { useState, useCallback } from 'react';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { fNumber } from 'src/utils/format-number';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { lighten } from '@mui/system';

export function UserTaskChart({ title, subheader, chart, ...other }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    '#2B9F57',
    '#B5DE6E',
    '#DF2E2E',
    '#FFB85A',
    '#236EC0',
    '#8EBFCE',
    '#23C0AB',
  ];
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
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

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
          sx={{ pl: 1, pr: 2.5 }}
        />
      </>
    </Card>
  );
}
