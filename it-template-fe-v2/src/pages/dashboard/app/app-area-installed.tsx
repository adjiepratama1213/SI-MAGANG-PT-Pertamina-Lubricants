import { ApexOptions } from 'apexcharts';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Card, { CardProps } from '@mui/material/Card';
// components
import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  height?: number;
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[][];
    series: {
      year: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

export default function AppAreaInstalled({ height, title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const {
    colors = [
      [theme.palette.primary.light, theme.palette.primary.main],
      [theme.palette.warning.light, theme.palette.warning.main],
    ],
    categories,
    series,
    options,
  } = chart;

  const popover = usePopover();

  const [seriesData, setSeriesData] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (series && series.length > 0 && !series.some((s) => s.year === seriesData)) {
      const currentYearStr = String(new Date().getFullYear());
      const hasCurrent = series.some((s) => s.year === currentYearStr);
      setSeriesData(hasCurrent ? currentYearStr : series[0].year);
    }
  }, [series, seriesData]);

  const currentIndex = series.findIndex((item) => item.year === seriesData);

  const handlePrevYear = () => {
    if (currentIndex > 0) {
      setSeriesData(series[currentIndex - 1].year);
    }
  };

  const handleNextYear = () => {
    if (currentIndex < series.length - 1 && currentIndex !== -1) {
      setSeriesData(series[currentIndex + 1].year);
    }
  };

  const dynamicSubheader = subheader
    ? (subheader.includes('tahun') ? subheader.replace(/tahun \d+/, `tahun ${seriesData}`) : `${subheader} (${seriesData})`)
    : `Tren kehadiran peserta magang tahun ${seriesData}`;

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[1]),
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        formatter: (val) => Math.floor(val).toString(),
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      offsetY: 10,
      markers: {
        radius: 12,
      } as any,
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue: string) => {
      popover.onClose();
      setSeriesData(newValue);
    },
    [popover]
  );

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={dynamicSubheader}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={handlePrevYear}
                disabled={currentIndex <= 0}
                title="Tahun Sebelumnya"
                sx={{ p: 0.5, borderRadius: 1 }}
              >
                <Iconify icon="eva:chevron-left-fill" width={18} />
              </IconButton>

              <ButtonBase
                onClick={popover.onOpen}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  typography: 'subtitle2',
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {seriesData}

                <Iconify
                  width={16}
                  icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                  sx={{ ml: 0.5 }}
                />
              </ButtonBase>

              <IconButton
                size="small"
                onClick={handleNextYear}
                disabled={currentIndex >= series.length - 1 || currentIndex === -1}
                title="Tahun Berikutnya"
                sx={{ p: 0.5, borderRadius: 1 }}
              >
                <Iconify icon="eva:chevron-right-fill" width={18} />
              </IconButton>
            </Box>
          }
        />

        {series.map((item) => (
          <Box key={item.year} sx={{ mt: 3, mx: 3 }}>
            {item.year === seriesData && (
              <Chart
                dir="ltr"
                type="area"
                series={item.data}
                options={chartOptions}
                height={height ?? 340}
              />
            )}
          </Box>
        ))}
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {series.map((option) => (
          <MenuItem
            key={option.year}
            selected={option.year === seriesData}
            onClick={() => handleChangeSeries(option.year)}
          >
            {option.year}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
