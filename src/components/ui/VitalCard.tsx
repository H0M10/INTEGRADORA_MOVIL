// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente VitalCard
// Tarjeta para mostrar signos vitales
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, getVitalStatusColor } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type VitalType = 'heartRate' | 'oxygen' | 'temperature' | 'bloodPressure' | 'steps' | 'battery';

interface VitalCardProps {
  type: VitalType;
  value: number | string | null;
  unit: string;
  label: string;
  onPress?: () => void;
  showStatus?: boolean;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ICONOS
// ═══════════════════════════════════════════════════════════════════════════

const vitalConfig: Record<VitalType, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  heartRate: { icon: 'heart', color: colors.vitals.heartRate },
  oxygen: { icon: 'water', color: colors.vitals.oxygen },
  temperature: { icon: 'thermometer', color: colors.vitals.temperature },
  bloodPressure: { icon: 'pulse', color: colors.vitals.bloodPressure },
  steps: { icon: 'footsteps', color: colors.vitals.steps },
  battery: { icon: 'battery-half', color: colors.vitals.battery },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  value,
  unit,
  label,
  onPress,
  showStatus = true,
  compact = false,
}) => {
  const config = vitalConfig[type];
  
  // Determinar color de estado si aplica
  let statusColor = config.color;
  if (showStatus && value !== null && typeof value === 'number') {
    if (type === 'heartRate' || type === 'oxygen' || type === 'temperature') {
      statusColor = getVitalStatusColor(value, type as 'heartRate' | 'oxygen' | 'temperature');
    }
  }

  const displayValue = value !== null ? value : '--';

  const content = (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Icono */}
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={config.icon} size={compact ? 20 : 24} color={config.color} />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[
            styles.value, 
            compact && styles.valueCompact,
            { color: statusColor }
          ]}>
            {displayValue}
          </Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>

      {/* Indicador de estado */}
      {showStatus && value !== null && (
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      )}

      {/* Flecha si es clickeable */}
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, compact && styles.cardCompact]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {content}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    marginBottom: spacing.md,
  },
  cardCompact: {
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  containerCompact: {
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...typography.h3,
    color: colors.text.primary,
  },
  valueCompact: {
    fontSize: 20,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
});

export default VitalCard;
