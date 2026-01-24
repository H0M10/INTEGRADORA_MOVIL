// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Detalle de Alerta
// Vista detallada de una alerta específica
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AlertsStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, Card, Button, Badge, Avatar, Loading } from '../../../components/ui';
import { useAlertStore, useDeviceStore } from '../../../stores';
import { Alert } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AlertDetailScreenProps = {
  navigation: NativeStackNavigationProp<AlertsStackParamList, 'AlertDetail'>;
  route: RouteProp<AlertsStackParamList, 'AlertDetail'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AlertDetailScreen: React.FC<AlertDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { alertId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);

  const { alerts, dismissAlert, markAsRead } = useAlertStore();
  const { devices } = useDeviceStore();

  const alert = alerts.find(a => a.id === alertId);
  const device = alert ? devices.find(d => d.id === alert.deviceId) : null;

  useEffect(() => {
    if (alert && !alert.isRead) {
      markAsRead(alertId);
    }
    setIsLoading(false);
  }, [alertId]);

  // Datos de severidad
  const getSeverityConfig = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          color: colors.status.error,
          bgColor: colors.status.error + '15',
          icon: 'warning',
          label: 'Crítica',
          description: 'Requiere atención inmediata',
        };
      case 'warning':
        return {
          color: colors.status.warning,
          bgColor: colors.status.warning + '15',
          icon: 'alert-circle',
          label: 'Alerta',
          description: 'Requiere seguimiento',
        };
      case 'info':
        return {
          color: colors.status.info,
          bgColor: colors.status.info + '15',
          icon: 'information-circle',
          label: 'Información',
          description: 'Solo informativo',
        };
      default:
        return {
          color: colors.text.secondary,
          bgColor: colors.background.secondary,
          icon: 'help-circle',
          label: 'Desconocido',
          description: '',
        };
    }
  };

  const getAlertTypeInfo = (type: Alert['type']) => {
    const types: Partial<Record<Alert['type'], { icon: string; title: string }>> = {
      heart_rate_high: { icon: 'heart', title: 'Ritmo cardíaco alto' },
      heart_rate_low: { icon: 'heart-outline', title: 'Ritmo cardíaco bajo' },
      oxygen_low: { icon: 'water', title: 'Oxigenación baja' },
      temperature_high: { icon: 'thermometer', title: 'Temperatura alta' },
      temperature_low: { icon: 'snow', title: 'Temperatura baja' },
      fall_detected: { icon: 'alert', title: 'Caída detectada' },
      geofence_exit: { icon: 'exit', title: 'Salida de zona segura' },
      device_offline: { icon: 'cloud-offline', title: 'Dispositivo desconectado' },
      low_battery: { icon: 'battery-dead', title: 'Batería baja' },
      battery_low: { icon: 'battery-dead', title: 'Batería baja' },
      sos_activated: { icon: 'call', title: 'SOS activado' },
      FALL_DETECTED: { icon: 'alert', title: 'Caída detectada' },
      HIGH_HEART_RATE: { icon: 'heart', title: 'Ritmo cardíaco alto' },
      LOW_HEART_RATE: { icon: 'heart-outline', title: 'Ritmo cardíaco bajo' },
      LOW_SPO2: { icon: 'water', title: 'Oxigenación baja' },
      HIGH_TEMPERATURE: { icon: 'thermometer', title: 'Temperatura alta' },
      LOW_TEMPERATURE: { icon: 'snow', title: 'Temperatura baja' },
      LOW_BATTERY: { icon: 'battery-dead', title: 'Batería baja' },
      DEVICE_DISCONNECTED: { icon: 'cloud-offline', title: 'Dispositivo desconectado' },
      GEOFENCE_EXIT: { icon: 'exit', title: 'Salida de zona segura' },
      SOS_BUTTON: { icon: 'call', title: 'SOS activado' },
    };
    return types[type] || { icon: 'alert-circle', title: String(type) };
  };

  const handleDismiss = async () => {
    RNAlert.alert(
      'Descartar alerta',
      '¿Estás seguro de descartar esta alerta? Se marcará como resuelta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          onPress: async () => {
            setIsDismissing(true);
            try {
              await dismissAlert(alertId);
              navigation.goBack();
            } catch (error) {
              console.error('Error dismissing alert:', error);
              RNAlert.alert('Error', 'No se pudo descartar la alerta');
            } finally {
              setIsDismissing(false);
            }
          },
        },
      ]
    );
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:911');
  };

  const handleCallContact = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return <Loading fullScreen message="Cargando alerta..." />;
  }

  if (!alert) {
    return (
      <View style={styles.container}>
        <Header title="Detalle" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.text.disabled} />
          <Text style={styles.errorText}>Alerta no encontrada</Text>
          <Button
            title="Volver"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const severityConfig = getSeverityConfig(alert.severity);
  const typeInfo = getAlertTypeInfo(alert.type);
  const createdAt = new Date(alert.createdAt);

  return (
    <View style={styles.container}>
      <Header
        title="Detalle de Alerta"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de alerta */}
        <View style={[styles.alertHeader, { backgroundColor: severityConfig.bgColor }]}>
          <View style={[styles.alertIconContainer, { backgroundColor: severityConfig.color }]}>
            <Ionicons
              name={typeInfo.icon as any}
              size={32}
              color={colors.text.inverse}
            />
          </View>
          <Text style={styles.alertTitle}>{typeInfo.title}</Text>
          <Badge
            label={severityConfig.label}
            variant="solid"
            color={alert.severity === 'critical' ? 'error' : 
                   alert.severity === 'warning' ? 'warning' : 'info'}
            size="md"
          />
          <Text style={styles.alertTime}>
            {createdAt.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Información del paciente */}
        {device?.monitoredPerson && (
          <Card variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>Persona Monitoreada</Text>
            <TouchableOpacity style={styles.personRow}>
              <Avatar
                size="md"
                name={`${device.monitoredPerson.firstName} ${device.monitoredPerson.lastName}`}
              />
              <View style={styles.personInfo}>
                <Text style={styles.personName}>
                  {device.monitoredPerson.firstName} {device.monitoredPerson.lastName}
                </Text>
                <Text style={styles.personDetail}>
                  {device.monitoredPerson.relationship} • Dispositivo: {device.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Descripción */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{alert.message}</Text>
          
          {/* Datos adicionales si existen */}
          {alert.data && (
            <View style={styles.dataContainer}>
              {alert.data.value !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Valor registrado:</Text>
                  <Text style={[styles.dataValue, { color: severityConfig.color }]}>
                    {alert.data.value} {alert.data.unit || ''}
                  </Text>
                </View>
              )}
              {alert.data.threshold !== undefined && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Umbral normal:</Text>
                  <Text style={styles.dataValue}>{alert.data.threshold}</Text>
                </View>
              )}
              {alert.data.location && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Ubicación:</Text>
                  <Text style={styles.dataValue}>
                    {alert.data.location.lat?.toFixed(4)}, {alert.data.location.lng?.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Recomendaciones */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Recomendaciones</Text>
          <View style={styles.recommendationsList}>
            {alert.type === 'heart_rate_high' && (
              <>
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Verificar que la persona esté tranquila"
                />
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Evitar actividades físicas intensas"
                />
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Contactar al médico si persiste"
                />
              </>
            )}
            {alert.type === 'fall_detected' && (
              <>
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Verificar estado de la persona inmediatamente"
                />
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="No mover a la persona si hay dolor"
                />
                <RecommendationItem 
                  icon="call"
                  text="Llamar a servicios de emergencia si es necesario"
                />
              </>
            )}
            {alert.type === 'oxygen_low' && (
              <>
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Verificar posición de la persona"
                />
                <RecommendationItem 
                  icon="checkmark-circle"
                  text="Asegurar buena ventilación"
                />
                <RecommendationItem 
                  icon="medical"
                  text="Buscar atención médica urgente"
                />
              </>
            )}
            {/* Recomendación genérica */}
            {!['heart_rate_high', 'fall_detected', 'oxygen_low'].includes(alert.type) && (
              <RecommendationItem 
                icon="checkmark-circle"
                text="Verificar el estado de la persona monitoreada"
              />
            )}
          </View>
        </Card>

        {/* Estado */}
        <Card variant="outlined" style={styles.section}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons
                name={alert.isRead ? 'eye' : 'eye-off'}
                size={20}
                color={alert.isRead ? colors.secondary[500] : colors.text.disabled}
              />
              <Text style={styles.statusText}>
                {alert.isRead ? 'Leída' : 'No leída'}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Ionicons
                name={alert.isDismissed ? 'checkmark-circle' : 'time'}
                size={20}
                color={alert.isDismissed ? colors.secondary[500] : colors.status.warning}
              />
              <Text style={styles.statusText}>
                {alert.isDismissed ? 'Resuelta' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Acciones rápidas */}
        {alert.severity === 'critical' && !alert.isDismissed && (
          <Card variant="elevated" style={StyleSheet.flatten([styles.section, styles.emergencySection])}>
            <Text style={styles.emergencyTitle}>¿Necesitas ayuda?</Text>
            <View style={styles.emergencyActions}>
              <TouchableOpacity
                style={styles.emergencyButton}
                onPress={handleCallEmergency}
              >
                <View style={styles.emergencyButtonIcon}>
                  <Ionicons name="call" size={24} color={colors.text.inverse} />
                </View>
                <Text style={styles.emergencyButtonText}>Llamar 911</Text>
              </TouchableOpacity>
              {device?.monitoredPerson?.emergencyContacts?.[0] && (
                <TouchableOpacity
                  style={styles.emergencyButton}
                  onPress={() => handleCallContact(
                    device.monitoredPerson!.emergencyContacts![0].phone
                  )}
                >
                  <View style={[styles.emergencyButtonIcon, { backgroundColor: colors.primary[500] }]}>
                    <Ionicons name="person" size={24} color={colors.text.inverse} />
                  </View>
                  <Text style={styles.emergencyButtonText}>
                    {device.monitoredPerson.emergencyContacts[0].name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}

        {/* Botón descartar */}
        {!alert.isDismissed && (
          <View style={styles.actions}>
            <Button
              title="Marcar como resuelta"
              variant="outline"
              size="lg"
              onPress={handleDismiss}
              loading={isDismissing}
              leftIcon={<Ionicons name="checkmark" size={20} color={colors.primary[500]} />}
            />
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBCOMPONENTES
// ═══════════════════════════════════════════════════════════════════════════

const RecommendationItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.recommendationItem}>
    <Ionicons name={icon as any} size={20} color={colors.secondary[500]} />
    <Text style={styles.recommendationText}>{text}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginVertical: spacing.lg,
  },
  // Alert header
  alertHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.base,
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  alertTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  alertTime: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
  // Sections
  section: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Person row
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  personName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  personDetail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Description
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  dataContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dataLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  dataValue: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  // Recommendations
  recommendationsList: {
    
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recommendationText: {
    ...typography.body,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 22,
  },
  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.ui.divider,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  // Emergency
  emergencySection: {
    backgroundColor: colors.status.error + '10',
    borderWidth: 1,
    borderColor: colors.status.error + '30',
  },
  emergencyTitle: {
    ...typography.bodyBold,
    color: colors.status.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emergencyActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  emergencyButton: {
    alignItems: 'center',
    marginHorizontal: spacing.lg,
  },
  emergencyButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  emergencyButtonText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Actions
  actions: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default AlertDetailScreen;
