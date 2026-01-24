// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente DeviceStatusCard
// Tarjeta para mostrar estado del dispositivo
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { Badge } from './Badge';
import { Avatar } from './Avatar';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type DeviceStatus = 'connected' | 'disconnected' | 'low_battery' | 'charging';

interface DeviceStatusCardProps {
  deviceId: string;
  deviceName: string;
  monitoredPersonName: string;
  monitoredPersonAvatar?: string;
  status: DeviceStatus;
  batteryLevel?: number;
  lastSync?: Date | string;
  signalStrength?: 'excellent' | 'good' | 'fair' | 'poor';
  onPress?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const statusConfig: Record<DeviceStatus, {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  connected: {
    label: 'Conectado',
    color: colors.status.success,
    icon: 'wifi',
  },
  disconnected: {
    label: 'Desconectado',
    color: colors.status.error,
    icon: 'wifi-outline',
  },
  low_battery: {
    label: 'Batería baja',
    color: colors.status.warning,
    icon: 'battery-dead',
  },
  charging: {
    label: 'Cargando',
    color: colors.status.info,
    icon: 'battery-charging',
  },
};

const signalConfig: Record<'excellent' | 'good' | 'fair' | 'poor', {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  excellent: { icon: 'cellular', color: colors.status.success },
  good: { icon: 'cellular', color: colors.secondary[500] },
  fair: { icon: 'cellular', color: colors.status.warning },
  poor: { icon: 'cellular', color: colors.status.error },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const formatLastSync = (lastSync?: Date | string): string => {
  if (!lastSync) return 'Sin sincronizar';
  
  const date = typeof lastSync === 'string' ? new Date(lastSync) : lastSync;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getBatteryIcon = (level?: number): keyof typeof Ionicons.glyphMap => {
  if (level === undefined) return 'battery-half';
  if (level >= 80) return 'battery-full';
  if (level >= 50) return 'battery-half';
  if (level >= 20) return 'battery-dead';
  return 'battery-dead';
};

const getBatteryColor = (level?: number): string => {
  if (level === undefined) return colors.text.tertiary;
  if (level >= 50) return colors.status.success;
  if (level >= 20) return colors.status.warning;
  return colors.status.error;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  deviceName,
  monitoredPersonName,
  monitoredPersonAvatar,
  status,
  batteryLevel,
  lastSync,
  signalStrength,
  onPress,
}) => {
  const statusInfo = statusConfig[status];
  const signalInfo = signalStrength ? signalConfig[signalStrength] : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Avatar */}
      <Avatar
        size="lg"
        name={monitoredPersonName}
        source={monitoredPersonAvatar}
        showBadge
        badgeColor={statusInfo.color}
      />

      {/* Información */}
      <View style={styles.content}>
        {/* Nombre de la persona */}
        <Text style={styles.personName} numberOfLines={1}>
          {monitoredPersonName}
        </Text>

        {/* Nombre del dispositivo */}
        <Text style={styles.deviceName} numberOfLines={1}>
          {deviceName}
        </Text>

        {/* Estado y última sincronización */}
        <View style={styles.statusRow}>
          <Badge
            label={statusInfo.label}
            icon={statusInfo.icon}
            variant="subtle"
            color={
              status === 'connected' ? 'success' :
              status === 'disconnected' ? 'error' :
              status === 'low_battery' ? 'warning' : 'info'
            }
            size="sm"
          />
          <Text style={styles.lastSync}>
            {formatLastSync(lastSync)}
          </Text>
        </View>
      </View>

      {/* Indicadores */}
      <View style={styles.indicators}>
        {/* Batería */}
        {batteryLevel !== undefined && (
          <View style={styles.indicator}>
            <Ionicons
              name={getBatteryIcon(batteryLevel)}
              size={18}
              color={getBatteryColor(batteryLevel)}
            />
            <Text style={[styles.indicatorText, { color: getBatteryColor(batteryLevel) }]}>
              {batteryLevel}%
            </Text>
          </View>
        )}

        {/* Señal */}
        {signalInfo && (
          <View style={styles.indicator}>
            <Ionicons
              name={signalInfo.icon}
              size={18}
              color={signalInfo.color}
            />
          </View>
        )}

        {/* Flecha de navegación */}
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
            style={styles.chevron}
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
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  personName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deviceName: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastSync: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  indicators: {
    alignItems: 'flex-end',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  indicatorText: {
    ...typography.caption,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  chevron: {
    marginTop: spacing.sm,
  },
});

export default DeviceStatusCard;
