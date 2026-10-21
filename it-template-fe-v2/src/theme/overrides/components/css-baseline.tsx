import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function cssBaseline(theme: Theme) {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          overflowY: 'scroll',
          scrollbarGutter: 'stable',
        },
        body: {
          margin: 0,
          padding: '0 !important',
          paddingRight: '0 !important',
          width: '100%',
          height: '100%',
        },
        'body[style*="padding-right"]': {
          paddingRight: '0 !important',
        },
        '.MuiAppBar-root, .mui-fixed': {
          paddingRight: '0 !important',
        },
        '#root, #__next': {
          width: '100%',
          height: '100%',
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none',
            },
          },
        },
        img: {
          maxWidth: '100%',
          display: 'inline-block',
          verticalAlign: 'bottom',
        },
      },
    },
  };
}
