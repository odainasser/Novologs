import { useMemo } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartSelect, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function TargetSales({ title, subheader, chart, currency, chartHeight, ...other }) {
  const displayCurrency = currency || 'AED';
  const theme = useTheme();
  const storedLang = localStorage.getItem('selectedLang');

  const chartColors = chart.colors ?? [
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.warning.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories: chart.categories },
    ...chart.options,
  });

  // If ChartSelect is not used, directly use the first series provided.
  // Ensure chart.series is an array and has at least one element.
  const currentSeriesData = useMemo(() => {
    return chart.series && chart.series.length > 0 ? chart.series[0]?.data : [];
  }, [chart.series]);

  const legendValues = useMemo(() => {
    if (!currentSeriesData || currentSeriesData.length < 2) {
      return [
        <>
          {fShortenNumber(0)}{' '}
          <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
            ({displayCurrency})
          </Typography>
        </>,
        <>
          {fShortenNumber(0)}{' '}
          <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
            ({displayCurrency})
          </Typography>
        </>,
      ];
    }
    // Assuming currentSeriesData[0] is 'Target' and currentSeriesData[1] is 'Achieved'
    const targetTotal = currentSeriesData[0]?.data?.reduce((sum, val) => sum + (val || 0), 0) || 0;
    const achievedTotal =
      currentSeriesData[1]?.data?.reduce((sum, val) => sum + (val || 0), 0) || 0;
    return [
      <>
        {fShortenNumber(targetTotal)}{' '}
        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
          {displayCurrency}
        </Typography>
      </>,
      <>
        {fShortenNumber(achievedTotal)}{' '}
        <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
          {displayCurrency}
        </Typography>
      </>,
    ];
  }, [currentSeriesData, displayCurrency]);

  const legendLabels =
    chart.series && chart.series.length > 0 && chart.series[0].data
      ? chart.series[0].data.map((item) => item.name)
      : [];

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        // action={
        //   <ChartSelect
        //     options={chart.series.map((item) => item.name)}
        //     value={chart.series && chart.series.length > 0 ? chart.series[0]?.name : ''}
        //     onChange={/* Implement if re-enabled */}
        //   />
        // }
        sx={{ p: 0, pt: 2, ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }) }}
      />

      <ChartLegends
        colors={chartOptions?.colors}
        labels={legendLabels}
        values={legendValues}
        sx={{
          ...(storedLang === 'ar' ? { pr: 2 } : { pl: 2 }),
        }}
      />

      <Chart
        type="area"
        series={currentSeriesData}
        options={chartOptions}
        height={chartHeight}
        loadingProps={{ sx: { p: 2.5 } }}
        // sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
