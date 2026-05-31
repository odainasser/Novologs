import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function MemberTaskChart({ chart }) {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chart.chartColors,
    labels: chart.categories,
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <>
      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{
          p: 3,
          justifyContent: 'center',
          height: '-webkit-fill-available',
        }}
      />

      <Chart
        type="pie"
        series={chart.series}
        options={chartOptions}
        width="100%"
        // height={200}
        sx={{
          my: 3,
          mx: 'auto',
        }}
      />
    </>
  );
}
