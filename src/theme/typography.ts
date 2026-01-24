// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Tipografía
// Sistema de fuentes y tamaños
// ═══════════════════════════════════════════════════════════════════════════

import { TextStyle } from 'react-native';

// Tamaños de fuente
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Pesos de fuente
export const fontWeights = {
  light: '300' as TextStyle['fontWeight'],
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

// Line heights
export const lineHeights = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
  loose: 2,
};

// Estilos de texto predefinidos
export const typography = {
  // Encabezados
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,

  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,

  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,

  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TextStyle,

  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,

  // Cuerpo de texto
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,

  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,

  // Etiquetas y captions
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 0.5,
  } as TextStyle,

  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  } as TextStyle,

  // Botones
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
  } as TextStyle,

  buttonSmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.sm * lineHeights.tight,
  } as TextStyle,

  // Números grandes (para métricas)
  metric: {
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
  } as TextStyle,

  metricSmall: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,

  // Body bold (para componentes)
  bodyBold: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,

  // Links
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    textDecorationLine: 'underline' as TextStyle['textDecorationLine'],
  } as TextStyle,
};

export default typography;
