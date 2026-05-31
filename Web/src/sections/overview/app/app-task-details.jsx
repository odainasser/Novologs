import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';
import { ChartLegendsCount } from 'src/components/chart/chart-legends-count';

// ----------------------------------------------------------------------

export function AppTaskDetails({ title, subheader, chart, ...other }) {
  console.log('this is the chart', chart);
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

  const chartSeries = chart.series.map((item) => item.value);

  console.log('this is the chart', chartSeries);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    tooltip: {
      y: {
        formatter: (value) => fNumber(value),
        title: { formatter: (seriesName) => `${seriesName}` },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            value: { formatter: (value) => fNumber(value) },
            total: {
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return fNumber(sum);
              },
            },
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          '& .MuiCardHeader-subheader': {
            color: 'black',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <ChartLegendsCount
          labels={chartOptions?.labels}
          colors={chartOptions?.colors}
          chartSeries={chartSeries}
          sx={{
            p: 3,
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column', // Stack legends vertically if needed
            ml: { md: 3 }, // Adds spacing between the chart and legends on larger screens
          }}
        />

        <Chart
          type="donut"
          series={chartSeries}
          options={chartOptions}
          width={{ xs: 240, xl: 260 }}
          height={{ xs: 240, xl: 260 }}
          sx={{ mb: 6, mx: 'auto' }}
        />
      </Box>
    </Card>
  );
}
