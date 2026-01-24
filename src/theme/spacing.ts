// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Espaciado y dimensiones
// Sistema de medidas consistentes
// ═══════════════════════════════════════════════════════════════════════════

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Espaciado base (4px grid system)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Sombras
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Dimensiones de pantalla
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

// Tamaños de componentes
export const componentSizes = {
  // Botones
  button: {
    sm: { height: 36, paddingHorizontal: 12 },
    md: { height: 44, paddingHorizontal: 16 },
    lg: { height: 52, paddingHorizontal: 24 },
    xl: { height: 60, paddingHorizontal: 32 },
  },
  // Inputs
  input: {
    sm: { height: 40 },
    md: { height: 48 },
    lg: { height: 56 },
  },
  // Iconos
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },
  // Avatares
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
    '2xl': 120,
  },
  // Cards
  card: {
    minHeight: 80,
    maxWidth: SCREEN_WIDTH - spacing.base * 2,
  },
  // Header
  header: {
    height: 56,
  },
  // Header height (alias)
  headerHeight: 56,
  // Tab bar
  tabBar: {
    height: 80,
  },
};

// Breakpoints para responsive design
export const breakpoints = {
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

export default {
  spacing,
  borderRadius,
  shadows,
  screen,
  componentSizes,
  breakpoints,
};
