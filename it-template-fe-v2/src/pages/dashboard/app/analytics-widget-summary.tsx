// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CardProps } from '@mui/material/Card';
// theme
import { bgGradient } from 'src/theme/css';
// theme
import { ColorSchema } from 'src/theme/palette';

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string;
  subTitle?: string;
  total: number;
  icon: React.ReactNode;
  color?: ColorSchema;
}

export default function AnalyticsWidgetSummary({
  title,
  subTitle,
  total,
  icon,
  color = 'primary',
  sx,
  ...other
}: Props) {
  const theme = useTheme();

  return (
    <Stack
      alignItems="center"
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha((theme.palette as any)[color].light, 0.2),
          endColor: alpha((theme.palette as any)[color].main, 0.2),
        }),
        p: 5,
        borderRadius: 2,
        height: { md: 1 },
        textAlign: 'center',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      {icon && <Box sx={{ width: 104, height: 104, mb: 1 }}>{icon}</Box>}

      <Typography variant="h6" sx={{ opacity: 0.64 }}>
        {title}
      </Typography>

      <Typography variant="caption" sx={{ mt: 2, opacity: 0.64 }}>
        {subTitle}
      </Typography>
    </Stack>
  );
}
