// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente AlertCard
// Tarjeta para mostrar alertas del sistema
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { Alert as AlertType } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AlertSeverity = 'critical' | 'warning' | 'info';

// Tipos internos del componente para iconos
type InternalAlertType = 
  | 'heart_rate'
  | 'oxygen'
  | 'temperature'
  | 'blood_pressure'
  | 'fall'
  | 'sos'
  | 'geofence'
  | 'battery'
  | 'device'
  | 'system';

interface AlertCardProps {
  // Opción 1: pasar todo en un objeto alert
  alert?: AlertType;
  // Opción 2: pasar props individuales (legacy)
  id?: string;
  type?: string;
  severity?: AlertSeverity;
  title?: string;
  message?: string;
  timestamp?: Date | string;
  isRead?: boolean;
  monitoredPersonName?: string;
  onPress?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const alertConfig: Record<InternalAlertType, {
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  heart_rate: { icon: 'heart' },
  oxygen: { icon: 'water' },
  temperature: { icon: 'thermometer' },
  blood_pressure: { icon: 'fitness' },
  fall: { icon: 'warning' },
  sos: { icon: 'alert-circle' },
  geofence: { icon: 'location' },
  battery: { icon: 'battery-dead' },
  device: { icon: 'wifi' },
  system: { icon: 'information-circle' },
};

// Mapeo de tipos de la BD a tipos internos
const mapAlertType = (dbType: string | undefined): InternalAlertType => {
  if (!dbType) return 'system';
  
  const typeUpper = dbType.toUpperCase();
  
  if (typeUpper.includes('HEART_RATE')) return 'heart_rate';
  if (typeUpper.includes('SPO2') || typeUpper.includes('OXYGEN')) return 'oxygen';
  if (typeUpper.includes('TEMPERATURE')) return 'temperature';
  if (typeUpper.includes('BLOOD_PRESSURE')) return 'blood_pressure';
  if (typeUpper.includes('FALL')) return 'fall';
  if (typeUpper.includes('SOS')) return 'sos';
  if (typeUpper.includes('GEOFENCE')) return 'geofence';
  if (typeUpper.includes('BATTERY')) return 'battery';
  if (typeUpper.includes('DEVICE') || typeUpper.includes('DISCONNECT')) return 'device';
  
  return 'system';
};

const severityColors: Record<AlertSeverity, {
  background: string;
  border: string;
  icon: string;
  text: string;
}> = {
  critical: {
    background: '#FEE2E2',
    border: colors.status.error,
    icon: colors.status.error,
    text: colors.status.error,
  },
  warning: {
    background: '#FEF3C7',
    border: colors.status.warning,
    icon: colors.status.warning,
    text: '#B45309',
  },
  info: {
    background: '#DBEAFE',
    border: colors.status.info,
    icon: colors.status.info,
    text: colors.status.info,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  type: propType,
  severity: propSeverity,
  title: propTitle,
  message: propMessage,
  timestamp: propTimestamp,
  isRead: propIsRead,
  monitoredPersonName: propPersonName,
  onPress,
  onDismiss,
  style,
}) => {
  // Extraer valores del objeto alert o usar props individuales
  // Usar alertType de la BD si existe, si no type
  const rawType = alert?.alertType || alert?.type || propType || 'system';
  const internalType = mapAlertType(rawType);
  const severity = (alert?.severity || propSeverity || 'info') as AlertSeverity;
  const title = alert?.title || propTitle || 'Alerta del sistema';
  const message = alert?.message || propMessage || '';
  const timestamp = alert?.createdAt || alert?.timestamp || propTimestamp || new Date();
  const isRead = alert?.isRead ?? propIsRead ?? false;
  const monitoredPersonName = propPersonName;

  const config = alertConfig[internalType];
  const severityStyle = severityColors[severity];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isRead ? colors.background.secondary : severityStyle.background,
          borderLeftColor: severityStyle.border,
        },
        isRead && styles.containerRead,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Indicador de no leído */}
      {!isRead && <View style={[styles.unreadDot, { backgroundColor: severityStyle.icon }]} />}

      {/* Icono */}
      <View style={[styles.iconContainer, { backgroundColor: `${severityStyle.icon}20` }]}>
        <Ionicons
          name={config.icon}
          size={24}
          color={severityStyle.icon}
        />
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Persona monitoreada */}
        {monitoredPersonName && (
          <Text style={styles.personName}>{monitoredPersonName}</Text>
        )}
        
        {/* Título */}
        <Text style={[styles.title, !isRead && { color: severityStyle.text }]}>
          {title}
        </Text>
        
        {/* Mensaje */}
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        
        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatTimestamp(timestamp)}
        </Text>
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onDismiss();
            }}
          >
            <Ionicons name="close" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  containerRead: {
    borderLeftColor: colors.ui.border,
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  personName: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    padding: spacing.xs,
    marginBottom: spacing.xs,
  },
});

export default AlertCard;
