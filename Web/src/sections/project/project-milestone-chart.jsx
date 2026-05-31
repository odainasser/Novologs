import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
// ----------------------------------------------------------------------

export function ProjectMilestoneChart({ title, chart }) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    theme.palette.warning.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    legend: { show: true },
    xaxis: { categories: chart.categories },
  });

  return (
    <Card>
      <CardHeader title={title} sx={{ mb: 3 }} />
      <Chart type="line" series={chart.series} options={chartOptions} height={320} />
    </Card>
  );
}
