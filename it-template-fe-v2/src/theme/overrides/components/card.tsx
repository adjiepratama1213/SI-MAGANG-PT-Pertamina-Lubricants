import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function card(theme: Theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          boxShadow: theme.customShadows.card,
          borderRadius: theme.shape.borderRadius * 2.5, // Slightly rounder
          border: `1px solid ${theme.palette.divider}`, // Added subtle border
          zIndex: 0,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 2),
        },
        title: {
          fontWeight: 700,
          color: theme.palette.primary.darker, // Use primary darker for titles
        }
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
        },
      },
    },
  };
}
