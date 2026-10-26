import { ApexOptions } from 'apexcharts';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CardHeader from '@mui/material/CardHeader';
import Card, { CardProps } from '@mui/material/Card';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// components
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  height?: number;
  title?: string;
  subheader?: string;
  actionButton?: React.ReactNode;
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

export default function AppAreaInstalled({ height, title, subheader, actionButton, chart, ...other }: Props) {
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

  const [seriesData, setSeriesData] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (series && series.length > 0 && !series.some((s) => s.year === seriesData)) {
      const currentYearStr = String(new Date().getFullYear());
      const hasCurrent = series.some((s) => s.year === currentYearStr);
      setSeriesData(hasCurrent ? currentYearStr : series[0].year);
    }
  }, [series, seriesData]);

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

  const currentSeriesItem = series.find((item) => item.year === seriesData) || {
    year: seriesData,
    data: [
      { name: 'Hadir', data: Array(12).fill(0) },
      { name: 'Izin', data: Array(12).fill(0) },
      { name: 'Alpha', data: Array(12).fill(0) },
    ],
  };

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={dynamicSubheader}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actionButton}

            <DatePicker
              views={['year']}
              value={new Date(Number(seriesData) || new Date().getFullYear(), 0, 1)}
              onChange={(newVal: Date | null) => {
                if (newVal && !Number.isNaN(newVal.getTime())) {
                  setSeriesData(String(newVal.getFullYear()));
                }
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  placeholder: 'Pilih Tahun',
                  sx: {
                    width: { xs: 110, sm: 125 },
                    '& .MuiInputBase-root': {
                      height: 36,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#004F9F',
                        bgcolor: '#FFFFFF',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiInputBase-input': {
                      py: 0.5,
                      px: 1.25,
                      fontWeight: 700,
                      color: '#0F172A',
                    },
                    '& .MuiIconButton-root': {
                      p: 0.5,
                      color: '#004F9F',
                    },
                  },
                },
              }}
            />
          </Box>
        }
      />

      <Box sx={{ mt: 3, mx: 3 }}>
        <Chart
          dir="ltr"
          type="area"
          series={currentSeriesItem.data}
          options={chartOptions}
          height={height ?? 340}
        />
      </Box>
    </Card>
  );
}
