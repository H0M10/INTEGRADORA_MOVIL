// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Badge
// Badges para notificaciones y estados
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type BadgeVariant = 'solid' | 'outline' | 'subtle';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  label?: string;
  count?: number;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  maxCount?: number;
  dot?: boolean;
  style?: ViewStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const colorConfig: Record<BadgeColor, {
  solid: { bg: string; text: string };
  outline: { bg: string; border: string; text: string };
  subtle: { bg: string; text: string };
}> = {
  primary: {
    solid: { bg: colors.primary[500], text: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.primary[500], text: colors.primary[500] },
    subtle: { bg: colors.primary[100], text: colors.primary[700] },
  },
  secondary: {
    solid: { bg: colors.secondary[500], text: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.secondary[500], text: colors.secondary[500] },
    subtle: { bg: colors.secondary[100], text: colors.secondary[700] },
  },
  success: {
    solid: { bg: colors.status.success, text: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.status.success, text: colors.status.success },
    subtle: { bg: '#D1FAE5', text: '#065F46' },
  },
  warning: {
    solid: { bg: colors.status.warning, text: '#1F2937' },
    outline: { bg: 'transparent', border: colors.status.warning, text: '#B45309' },
    subtle: { bg: '#FEF3C7', text: '#B45309' },
  },
  error: {
    solid: { bg: colors.status.error, text: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.status.error, text: colors.status.error },
    subtle: { bg: '#FEE2E2', text: '#991B1B' },
  },
  info: {
    solid: { bg: colors.status.info, text: colors.text.inverse },
    outline: { bg: 'transparent', border: colors.status.info, text: colors.status.info },
    subtle: { bg: '#DBEAFE', text: '#1E40AF' },
  },
};

const sizeConfig: Record<BadgeSize, {
  paddingH: number;
  paddingV: number;
  fontSize: number;
  iconSize: number;
  minWidth: number;
}> = {
  sm: { paddingH: 6, paddingV: 2, fontSize: 10, iconSize: 10, minWidth: 18 },
  md: { paddingH: 8, paddingV: 4, fontSize: 12, iconSize: 12, minWidth: 22 },
  lg: { paddingH: 10, paddingV: 6, fontSize: 14, iconSize: 14, minWidth: 28 },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Badge: React.FC<BadgeProps> = ({
  label,
  count,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  icon,
  maxCount = 99,
  dot = false,
  style,
}) => {
  const colorStyle = colorConfig[color][variant];
  const sizeStyle = sizeConfig[size];

  // Si es dot, renderizar solo un punto
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          {
            backgroundColor: colorConfig[color].solid.bg,
            width: sizeStyle.minWidth / 2,
            height: sizeStyle.minWidth / 2,
          },
          style,
        ]}
      />
    );
  }

  // Determinar contenido
  let displayContent: string | number = '';
  if (count !== undefined) {
    displayContent = count > maxCount ? `${maxCount}+` : count;
  } else if (label) {
    displayContent = label;
  }

  // Si no hay contenido ni icono, no renderizar
  if (!displayContent && !icon) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colorStyle.bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? (colorStyle as any).border : 'transparent',
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          minWidth: displayContent === '' ? undefined : sizeStyle.minWidth,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyle.iconSize}
          color={colorStyle.text}
          style={displayContent ? styles.icon : undefined}
        />
      )}
      {displayContent !== '' && (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyle.fontSize,
              color: colorStyle.text,
            },
          ]}
        >
          {displayContent}
        </Text>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  dot: {
    borderRadius: borderRadius.full,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;
