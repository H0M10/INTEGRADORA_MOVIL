// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Header
// Encabezado de pantallas con navegación
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, shadows, componentSizes } from '../../theme/spacing';
import { Badge } from './Badge';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

interface HeaderAction {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  transparent?: boolean;
  centerTitle?: boolean;
  large?: boolean;
  children?: React.ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftAction,
  rightActions = [],
  transparent = false,
  centerTitle = false,
  large = false,
  children,
}) => {
  const insets = useSafeAreaInsets();
  
  const hasLeftAction = showBack || leftAction;
  const hasRightActions = rightActions.length > 0;

  const renderAction = (action: HeaderAction, index: number, isLeft: boolean = false) => (
    <TouchableOpacity
      key={`${isLeft ? 'left' : 'right'}-${index}`}
      style={[styles.actionButton, action.disabled && styles.actionDisabled]}
      onPress={action.onPress}
      disabled={action.disabled}
    >
      <Ionicons
        name={action.icon}
        size={24}
        color={action.disabled ? colors.text.disabled : colors.text.primary}
      />
      {action.badge !== undefined && action.badge > 0 && (
        <View style={styles.badgeContainer}>
          <Badge count={action.badge} size="sm" color="error" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar
        barStyle={transparent ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View
        style={[
          styles.container,
          transparent && styles.containerTransparent,
          { paddingTop: insets.top },
        ]}
      >
        <View style={[styles.header, large && styles.headerLarge]}>
          {/* Sección izquierda */}
          <View style={styles.leftSection}>
            {showBack && onBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            {leftAction && !showBack && renderAction(leftAction, 0, true)}
          </View>

          {/* Título */}
          {!large && title && (
            <View style={[
              styles.titleContainer,
              centerTitle && styles.titleCentered,
              !hasLeftAction && styles.titleNoLeft,
            ]}>
              <Text
                style={[
                  styles.title,
                  transparent && styles.titleTransparent,
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Sección derecha */}
          <View style={styles.rightSection}>
            {rightActions.map((action, index) => renderAction(action, index))}
          </View>
        </View>

        {/* Título grande */}
        {large && title && (
          <View style={styles.largeTitleContainer}>
            <Text style={styles.largeTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.largeSubtitle}>{subtitle}</Text>
            )}
          </View>
        )}

        {/* Contenido adicional */}
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </View>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    ...shadows.sm,
    zIndex: 100,
  },
  containerTransparent: {
    backgroundColor: 'transparent',
    ...shadows.none,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSizes.headerHeight,
    paddingHorizontal: spacing.base,
  },
  headerLarge: {
    height: componentSizes.headerHeight - 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleCentered: {
    alignItems: 'center',
  },
  titleNoLeft: {
    marginLeft: 0,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  titleTransparent: {
    color: colors.text.inverse,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  largeTitleContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  largeTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  largeSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  childrenContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
});

export default Header;
