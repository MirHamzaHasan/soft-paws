import { createTamagui } from 'tamagui';

import {
  barklogFonts,
  barklogMedia,
  barklogShorthands,
  barklogThemes,
  barklogTokens,
} from './src/theme/tamaguiTheme';

export const tamaguiConfig = createTamagui({
  defaultFont: 'body',
  fonts: barklogFonts,
  media: barklogMedia,
  shorthands: barklogShorthands,
  themes: barklogThemes,
  tokens: barklogTokens,
});

export default tamaguiConfig;

export type BarklogTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends BarklogTamaguiConfig {}
}
