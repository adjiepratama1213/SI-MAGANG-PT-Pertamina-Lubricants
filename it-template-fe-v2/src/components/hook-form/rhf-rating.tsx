import { useFormContext, Controller } from 'react-hook-form';
// @mui
import Rating from '@mui/material/Rating';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface RHFRatingProps {
  name: string;
  max?: number;
  helperText?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export function RHFRating({
  name,
  max = 5,
  helperText,
  size = 'medium',
  label,
}: RHFRatingProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {label && (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
          )}

          <Rating
            {...field}
            value={Number(field.value) || 0}
            max={max}
            size={size}
            onChange={(_, value) => field.onChange(value)}
          />

          {(!!error || helperText) && (
            <FormHelperText error={!!error}>
              {error ? error.message : helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
}
