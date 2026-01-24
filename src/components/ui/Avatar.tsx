// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Avatar
// Avatar para usuarios y personas monitoreadas
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface AvatarProps {
  size?: AvatarSize;
  source?: string | null;
  imageUrl?: string | null;    // Alias para source
  name?: string;
  showBadge?: boolean;
  badgeColor?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE TAMAÑOS
// ═══════════════════════════════════════════════════════════════════════════

const sizeConfig: Record<AvatarSize, {
  container: number;
  fontSize: number;
  iconSize: number;
  badgeSize: number;
  badgeIconSize: number;
}> = {
  xs: { container: 32, fontSize: 12, iconSize: 16, badgeSize: 10, badgeIconSize: 6 },
  sm: { container: 40, fontSize: 14, iconSize: 20, badgeSize: 12, badgeIconSize: 8 },
  md: { container: 56, fontSize: 18, iconSize: 28, badgeSize: 16, badgeIconSize: 10 },
  lg: { container: 72, fontSize: 24, iconSize: 36, badgeSize: 20, badgeIconSize: 12 },
  xl: { container: 96, fontSize: 32, iconSize: 48, badgeSize: 24, badgeIconSize: 14 },
  xxl: { container: 120, fontSize: 40, iconSize: 60, badgeSize: 28, badgeIconSize: 16 },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const stringToColor = (str: string): string => {
  const avatarColors = [
    colors.primary[500],
    colors.secondary[500],
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#6366F1', // Indigo
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  source,
  imageUrl,
  name,
  showBadge = false,
  badgeColor = colors.status.success,
  badgeIcon,
  backgroundColor,
}) => {
  const config = sizeConfig[size];
  const initials = getInitials(name);
  const bgColor = backgroundColor || (name ? stringToColor(name) : colors.ui.divider);
  const effectiveSource = source || imageUrl;

  return (
    <View
      style={[
        styles.container,
        {
          width: config.container,
          height: config.container,
          borderRadius: config.container / 2,
          backgroundColor: source ? colors.ui.divider : bgColor,
        },
      ]}
    >
      {effectiveSource ? (
        <Image
          source={{ uri: effectiveSource }}
          style={[
            styles.image,
            {
              width: config.container,
              height: config.container,
              borderRadius: config.container / 2,
            },
          ]}
        />
      ) : initials ? (
        <Text style={[styles.initials, { fontSize: config.fontSize }]}>
          {initials}
        </Text>
      ) : (
        <Ionicons
          name="person"
          size={config.iconSize}
          color={colors.text.inverse}
        />
      )}

      {/* Badge */}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: config.badgeSize,
              height: config.badgeSize,
              borderRadius: config.badgeSize / 2,
              backgroundColor: badgeColor,
              borderWidth: config.badgeSize > 12 ? 2 : 1.5,
            },
          ]}
        >
          {badgeIcon && (
            <Ionicons
              name={badgeIcon}
              size={config.badgeIconSize}
              color={colors.text.inverse}
            />
          )}
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    ...typography.bodyBold,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
