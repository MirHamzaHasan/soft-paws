import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { barklogColors } from './tokens';

export const barklogLightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: barklogColors.ink,
    background: barklogColors.paper,
    card: barklogColors.paper,
    text: barklogColors.ink,
    border: barklogColors.border,
    notification: barklogColors.warning,
  },
};

export const barklogDarkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: barklogColors.paper,
    background: barklogColors.darkPaper,
    card: barklogColors.darkSurface,
    text: barklogColors.paper,
    border: barklogColors.darkBorder,
    notification: barklogColors.warning,
  },
};

export function getNavigationTheme(
  colorScheme: 'light' | 'dark',
  options?: { forceLight?: boolean },
): Theme {
  if (options?.forceLight) {
    return barklogLightNavigationTheme;
  }

  return colorScheme === 'dark'
    ? barklogDarkNavigationTheme
    : barklogLightNavigationTheme;
}
