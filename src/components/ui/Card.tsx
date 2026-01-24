// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Card
// Tarjeta contenedora reutilizable
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  pressable?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  style,
  pressable = false,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    style,
  ];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyles}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Variantes
  elevated: {
    backgroundColor: colors.background.secondary,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filled: {
    backgroundColor: colors.background.tertiary,
  },

  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.base,
  },
  padding_lg: {
    padding: spacing.xl,
  },
});

export default Card;
