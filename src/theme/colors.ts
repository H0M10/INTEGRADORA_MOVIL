// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Paleta de Colores
// Sistema de diseño profesional
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Colores primarios - Azul profesional/médico (escala numérica + aliases)
  primary: {
    50: '#E8F0F8',
    100: '#D1E1F1',
    200: '#A3C3E3',
    300: '#75A5D5',
    400: '#4A7AB0',
    500: '#1E3A5F',      // Principal
    600: '#1A3254',
    700: '#142840',
    800: '#0F1E30',
    900: '#0A1420',
    // Aliases para compatibilidad
    main: '#1E3A5F',
    light: '#4A7AB0',
    lighter: '#75A5D5',
    lightest: '#E8F0F8',
    dark: '#142840',
  },

  // Colores secundarios - Verde salud (escala numérica + aliases)
  secondary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',      // Principal
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    // Aliases para compatibilidad
    main: '#10B981',
    light: '#34D399',
    lighter: '#6EE7B7',
    lightest: '#D1FAE5',
    dark: '#059669',
  },

  // Colores de estado/alertas
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    critical: '#DC2626',
  },

  // Colores de fondo
  background: {
    primary: '#F8FAFC',
    secondary: '#FFFFFF',
    tertiary: '#F1F5F9',
    dark: '#1E293B',
  },

  // Colores de texto
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    link: '#2563EB',
    disabled: '#CBD5E1',
  },

  // Bordes
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },

  // UI Elements (para componentes)
  ui: {
    border: '#E2E8F0',
    divider: '#F1F5F9',
    disabled: '#CBD5E1',
    hover: '#F8FAFC',
  },

  // Signos vitales (colores específicos para métricas)
  vitals: {
    heartRate: '#EF4444',       // Rojo para ritmo cardíaco
    oxygen: '#3B82F6',          // Azul para oxígeno
    temperature: '#F59E0B',     // Amarillo para temperatura
    bloodPressure: '#8B5CF6',   // Púrpura para presión
    steps: '#10B981',           // Verde para pasos
    battery: '#22C55E',         // Verde para batería
  },

  // Gradientes (como arrays para LinearGradient)
  gradients: {
    primary: ['#1E3A5F', '#2E5A8F'],
    secondary: ['#10B981', '#34D399'],
    health: ['#1E3A5F', '#10B981'],
    alert: ['#EF4444', '#F87171'],
    warning: ['#F59E0B', '#FBBF24'],
    card: ['#FFFFFF', '#F8FAFC'],
  },

  // Transparencias
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },

  // Colores para el mapa
  map: {
    userLocation: '#3B82F6',
    monitoredLocation: '#10B981',
    geofence: 'rgba(16, 185, 129, 0.2)',
    geofenceBorder: '#10B981',
    route: '#1E3A5F',
  },
};

// Función helper para obtener color de estado de signos vitales
export const getVitalStatusColor = (
  value: number,
  type: 'heartRate' | 'oxygen' | 'temperature'
): string => {
  switch (type) {
    case 'heartRate':
      if (value < 50 || value > 120) return colors.status.critical;
      if (value < 60 || value > 100) return colors.status.warning;
      return colors.status.success;
    
    case 'oxygen':
      if (value < 90) return colors.status.critical;
      if (value < 95) return colors.status.warning;
      return colors.status.success;
    
    case 'temperature':
      if (value < 35 || value > 39) return colors.status.critical;
      if (value < 36 || value > 37.5) return colors.status.warning;
      return colors.status.success;
    
    default:
      return colors.status.info;
  }
};

export default colors;
