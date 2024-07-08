import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MUIThemeProvider, StyledEngineProvider } from '@mui/material/styles';
// hooks
import useSettings from '../hooks/useSettings';
//
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';
import { colorPresets, } from '../utils/getColorPresets';
// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export default function ThemeProvider({ children }) {
  const { themeMode, themeDirection, themeColorPresets } = useSettings();

  const isLight = themeMode === 'light';

  useEffect(() => {
    // Set color for devextreme;
    const existingColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--themeColorPresets');
    const themeColor = colorPresets.find(d => d.name === themeColorPresets).main;
    // console.log('existingColor', existingColor, 'themeColor', themeColor);
    if (existingColor !== themeColor) {
      document.documentElement.style.setProperty('--themeColorPresets', themeColor);
    }
  }, [themeColorPresets])

  const themeOptions = useMemo(
    () => ({
      palette: isLight ? palette.light : palette.dark,
      typography,
      breakpoints,
      shape: { borderRadius: 8 },
      direction: themeDirection,
      shadows: isLight ? shadows.light : shadows.dark,
      customShadows: isLight ? customShadows.light : customShadows.dark,
    }),
    [isLight, themeDirection]
  );

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
