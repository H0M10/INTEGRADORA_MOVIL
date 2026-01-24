// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Índice del tema
// Exportación centralizada del sistema de diseño
// ═══════════════════════════════════════════════════════════════════════════

export { colors, getVitalStatusColor } from './colors';
export { typography, fontSizes, fontWeights, lineHeights } from './typography';
export { 
  spacing, 
  borderRadius, 
  shadows, 
  screen, 
  componentSizes,
  breakpoints 
} from './spacing';

// Tema completo
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows, screen, componentSizes } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  screen,
  componentSizes,
};

export default theme;
