// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Detalle de Dispositivo
// Información y configuración del dispositivo
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Card, Header, Loading, Avatar, Badge, Button } from '../../../components/ui';
import { useDeviceStore } from '../../../stores';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type DeviceDetailScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'DeviceDetail'>;
  route: RouteProp<HomeStackParamList, 'DeviceDetail'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const DeviceDetailScreen: React.FC<DeviceDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { deviceId } = route.params;
  const { devices, unlinkDevice, isLoading } = useDeviceStore();
  const [device, setDevice] = useState(devices.find(d => d.id === deviceId));

  useEffect(() => {
    setDevice(devices.find(d => d.id === deviceId));
  }, [devices, deviceId]);

  const handleUnlink = () => {
    Alert.alert(
      'Desvincular dispositivo',
      '¿Estás seguro de que deseas desvincular este dispositivo? Dejarás de recibir alertas y datos de monitoreo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkDevice(deviceId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo desvincular el dispositivo');
            }
          },
        },
      ]
    );
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Header title="Dispositivo" showBack onBack={() => navigation.goBack()} />
        <Loading fullScreen message="Cargando información..." />
      </View>
    );
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return colors.text.tertiary;
    if (level >= 50) return colors.status.success;
    if (level >= 20) return colors.status.warning;
    return colors.status.error;
  };

  const getBatteryIcon = (level?: number): keyof typeof Ionicons.glyphMap => {
    if (!level) return 'battery-half';
    if (level >= 80) return 'battery-full';
    if (level >= 50) return 'battery-half';
    return 'battery-dead';
  };

  return (
    <View style={styles.container}>
      <Header
        title="Detalle del Dispositivo"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información principal */}
        <Card variant="elevated" style={styles.mainCard}>
          <View style={styles.deviceHeader}>
            <View style={styles.deviceIcon}>
              <Ionicons name="watch" size={40} color={colors.primary[500]} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceModel}>{device.model || 'NovaGuardian Band'}</Text>
            </View>
            <Badge
              label={device.status === 'connected' ? 'Conectado' : 'Desconectado'}
              variant="subtle"
              color={device.status === 'connected' ? 'success' : 'error'}
            />
          </View>

          {/* Persona monitoreada */}
          {device.monitoredPerson && (
            <TouchableOpacity
              style={styles.personRow}
              onPress={() => navigation.navigate('MonitoredPerson', {
                personId: device.monitoredPerson?.id || '',
              })}
            >
              <Avatar
                size="sm"
                name={`${device.monitoredPerson.firstName} ${device.monitoredPerson.lastName}`}
              />
              <View style={styles.personInfo}>
                <Text style={styles.personName}>
                  {device.monitoredPerson.firstName} {device.monitoredPerson.lastName}
                </Text>
                <Text style={styles.personLabel}>Persona monitoreada</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </Card>

        {/* Estado del dispositivo */}
        <Card variant="elevated" style={styles.statusCard}>
          <Text style={styles.sectionTitle}>Estado</Text>
          
          <View style={styles.statusGrid}>
            {/* Batería */}
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: `${getBatteryColor(device.batteryLevel)}15` }]}>
                <Ionicons
                  name={getBatteryIcon(device.batteryLevel)}
                  size={24}
                  color={getBatteryColor(device.batteryLevel)}
                />
              </View>
              <Text style={styles.statusValue}>{device.batteryLevel ?? '--'}%</Text>
              <Text style={styles.statusLabel}>Batería</Text>
            </View>

            {/* Señal */}
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: colors.secondary[100] }]}>
                <Ionicons name="cellular" size={24} color={colors.secondary[500]} />
              </View>
              <Text style={styles.statusValue}>Buena</Text>
              <Text style={styles.statusLabel}>Señal</Text>
            </View>

            {/* Firmware */}
            <View style={styles.statusItem}>
              <View style={[styles.statusIcon, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="code-working" size={24} color={colors.primary[500]} />
              </View>
              <Text style={styles.statusValue}>{device.firmwareVersion || '1.0.2'}</Text>
              <Text style={styles.statusLabel}>Firmware</Text>
            </View>
          </View>
        </Card>

        {/* Información del dispositivo */}
        <Card variant="elevated" style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID del dispositivo</Text>
            <Text style={styles.infoValue}>{device.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modelo</Text>
            <Text style={styles.infoValue}>{device.model || 'NG-Band Pro'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número de serie</Text>
            <Text style={styles.infoValue}>{device.serialNumber || 'NG2024001234'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última sincronización</Text>
            <Text style={styles.infoValue}>
              {device.lastSyncAt
                ? new Date(device.lastSyncAt).toLocaleString('es-ES')
                : 'Nunca'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de vinculación</Text>
            <Text style={styles.infoValue}>
              {device.linkedAt
                ? new Date(device.linkedAt).toLocaleDateString('es-ES')
                : '--'}
            </Text>
          </View>
        </Card>

        {/* Opciones */}
        <Card variant="elevated" style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>Opciones</Text>

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary[500]} />
            </View>
            <Text style={styles.optionText}>Configurar alertas</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: colors.secondary[100] }]}>
              <Ionicons name="location-outline" size={20} color={colors.secondary[500]} />
            </View>
            <Text style={styles.optionText}>Zonas seguras</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="sync-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.optionText}>Sincronizar ahora</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: colors.status.info + '15' }]}>
              <Ionicons name="download-outline" size={20} color={colors.status.info} />
            </View>
            <Text style={styles.optionText}>Actualizar firmware</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Botón desvincular */}
        <Button
          title="Desvincular dispositivo"
          variant="outline"
          onPress={handleUnlink}
          loading={isLoading}
          fullWidth
          style={styles.unlinkButton}
          icon={<Ionicons name="unlink" size={20} color={colors.status.error} />}
        />

        {/* Espaciado inferior */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  // Card principal
  mainCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  deviceIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  deviceModel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  personInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  personName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  personLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Status
  statusCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statusValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Info
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  // Options
  optionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  // Unlink
  unlinkButton: {
    borderColor: colors.status.error,
    marginTop: spacing.md,
  },
});

export default DeviceDetailScreen;
