import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function ProjectTaskTypeChart({ title, chart }) {
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
    chart: { stacked: true },
    colors: chartColors,
    stroke: { width: 0 },
    legend: {
      show: true,
      position: 'right',
      itemMargin: { vertical: 8 },
    },
    xaxis: {
      type: 'category',
      categories: chart.categories,
    },
    plotOptions: { bar: { columnWidth: '36%' } },
  });

  return (
    <Card>
      <CardHeader title={title} sx={{ mb: 3 }} />
      <Chart type="bar" series={chart.series} options={chartOptions} height={320} />
    </Card>
  );
}
