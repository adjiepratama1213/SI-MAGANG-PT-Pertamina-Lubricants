import { useEffect, useState } from 'react';
import { Typography, Stack, TypographyProps } from '@mui/material';
import { m, AnimatePresence } from 'framer-motion';

// Helper format
const pad = (num: number) => num.toString().padStart(2, '0');

type Size = 'large' | 'medium' | 'small';

type Props = {
  size?: Size;
};

// Mapping size ke variant MUI dan style tambahan
const sizeMap: Record<Size, { variant: TypographyProps['variant']; minWidth: number; mx: number }> = {
  large: { variant: 'h4', minWidth: 30, mx: 1 },
  medium: { variant: 'h6', minWidth: 25, mx: 0.75 },
  small: { variant: 'body2', minWidth: 10, mx: 0 },
};

function FlipUnit({ value, size }: { value: string; size: Size }) {
  const { variant, minWidth, mx } = sizeMap[size];

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: 90, opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{ perspective: 1000 }}
      >
        <Typography
          variant={variant}
          sx={{
            color: 'primary.main',
            fontWeight: 'bold',
            mx,
            display: 'inline-block',
            minWidth,
            textAlign: 'center',
          }}
        >
          {value}
        </Typography>
      </m.div>
    </AnimatePresence>
  );
}

export default function ClockRunning({ size = 'large' }: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = pad(time.getHours());
  const minutes = pad(time.getMinutes());
  const seconds = pad(time.getSeconds());

  const { variant, minWidth, mx } = sizeMap[size];

  return (
    <Stack direction="row" alignItems="center" justifyContent="center">
      <FlipUnit value={hours} size={size} />
      <Typography
        variant={variant}
        sx={{
          color: 'primary.main',
          fontWeight: 'bold',
          display: 'inline-block',
          minWidth: 10,
          mx,
          textAlign: 'center',
        }}
      >
        :
      </Typography>
      <FlipUnit value={minutes} size={size} />
      <Typography
        variant={variant}
        sx={{
          color: 'primary.main',
          fontWeight: 'bold',
          display: 'inline-block',
          minWidth,
          mx,
          textAlign: 'center',
        }}
      >
        :
      </Typography>
      <FlipUnit value={seconds} size={size} />
    </Stack>
  );
}
