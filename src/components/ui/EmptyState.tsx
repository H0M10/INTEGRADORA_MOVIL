// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente EmptyState
// Estados vacíos y sin datos
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Button } from './Button';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type EmptyStateType = 
  | 'no-data'
  | 'no-alerts'
  | 'no-devices'
  | 'no-connection'
  | 'error'
  | 'search'
  | 'custom'
  | 'alerts'    // alias para no-alerts
  | 'devices'   // alias para no-devices
  | 'location'; // para ubicaciones

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const typeConfig: Record<EmptyStateType, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}> = {
  'no-data': {
    icon: 'folder-open-outline',
    title: 'Sin datos',
    description: 'No hay información disponible en este momento.',
    color: colors.text.tertiary,
  },
  'no-alerts': {
    icon: 'notifications-off-outline',
    title: 'Sin alertas',
    description: 'Todo está en orden. No hay alertas pendientes.',
    color: colors.secondary[500],
  },
  'no-devices': {
    icon: 'watch-outline',
    title: 'Sin dispositivos',
    description: 'No hay dispositivos vinculados a tu cuenta.',
    color: colors.primary[500],
  },
  'no-connection': {
    icon: 'cloud-offline-outline',
    title: 'Sin conexión',
    description: 'Verifica tu conexión a internet e intenta de nuevo.',
    color: colors.status.warning,
  },
  'error': {
    icon: 'alert-circle-outline',
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Por favor intenta de nuevo.',
    color: colors.status.error,
  },
  'search': {
    icon: 'search-outline',
    title: 'Sin resultados',
    description: 'No encontramos resultados para tu búsqueda.',
    color: colors.text.tertiary,
  },
  'custom': {
    icon: 'information-circle-outline',
    title: '',
    description: '',
    color: colors.text.tertiary,
  },
  'alerts': {
    icon: 'notifications-off-outline',
    title: 'Sin alertas',
    description: 'Todo está en orden. No hay alertas pendientes.',
    color: colors.secondary[500],
  },
  'devices': {
    icon: 'watch-outline',
    title: 'Sin dispositivos',
    description: 'No hay dispositivos vinculados a tu cuenta.',
    color: colors.primary[500],
  },
  'location': {
    icon: 'location-outline',
    title: 'Sin ubicaciones',
    description: 'No hay historial de ubicaciones disponible.',
    color: colors.secondary[500],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  icon,
  imageSource,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}) => {
  const config = typeConfig[type];
  
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Ilustración o Icono */}
      {imageSource ? (
        <Image
          source={{ uri: imageSource }}
          style={[styles.image, compact && styles.imageCompact]}
          resizeMode="contain"
        />
      ) : (
        <View style={[
          styles.iconContainer,
          compact && styles.iconContainerCompact,
          { backgroundColor: `${config.color}15` }
        ]}>
          <Ionicons
            name={displayIcon}
            size={compact ? 40 : 56}
            color={config.color}
          />
        </View>
      )}

      {/* Texto */}
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {displayTitle}
      </Text>
      
      {displayDescription && (
        <Text style={[styles.description, compact && styles.descriptionCompact]}>
          {displayDescription}
        </Text>
      )}

      {/* Acciones */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Button
              title={actionLabel}
              onPress={onAction}
              size={compact ? 'sm' : 'md'}
              style={styles.actionButton}
            />
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="ghost"
              size={compact ? 'sm' : 'md'}
              style={styles.secondaryButton}
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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  containerCompact: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconContainerCompact: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: spacing.lg,
  },
  imageCompact: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  titleCompact: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  descriptionCompact: {
    ...typography.bodySmall,
    maxWidth: 220,
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 160,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;
