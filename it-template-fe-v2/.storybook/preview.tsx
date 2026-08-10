import type { Preview } from '@storybook/react';
import React from 'react';
import merge from 'lodash/merge';
import { MemoryRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider as MuiThemeProvider, ThemeOptions } from '@mui/material/styles';
import { palette } from 'src/theme/palette';
import { shadows } from 'src/theme/shadows';
import { typography } from 'src/theme/typography';
import { customShadows } from 'src/theme/custom-shadows';
import { componentsOverrides } from 'src/theme/overrides';
import { presets } from 'src/theme/options/presets';
import { darkMode } from 'src/theme/options/dark-mode';
import { contrast } from 'src/theme/options/contrast';
import { direction } from 'src/theme/options/right-to-left';

const baseOption = {
  palette: palette('light'),
  shadows: shadows('light'),
  customShadows: customShadows('light'),
  typography,
  shape: { borderRadius: 8 },
};

const themeOptions = merge(
  baseOption,
  direction('ltr'),
  darkMode('light'),
  presets('default'),
  contrast(false, 'light').theme
);

const theme = createTheme(themeOptions as ThemeOptions);
theme.components = merge(componentsOverrides(theme), contrast(false, 'light').components);

const withRouter = (Story: React.FC) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const withMuiTheme = (Story: React.FC) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <Story />
  </MuiThemeProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f5f5f5' },
        { name: 'dark', value: '#333' },
      ],
    },
  },
  decorators: [withRouter, withMuiTheme],
};

export default preview;
