// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Home (Dashboard)
// Vista principal con resumen de signos vitales y estado de dispositivos
// ACTUALIZACIÓN EN TIEMPO REAL - Signos vitales cada 30 segundos
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  AppState,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import {
  Card,
  VitalCard,
  AlertCard,
  DeviceStatusCard,
  Avatar,
  Badge,
  Loading,
  EmptyState,
} from '../../../components/ui';
import { useAuthStore, useDeviceStore, useAlertStore } from '../../../stores';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'Home'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

const { width } = Dimensions.get('window');
const VITALS_UPDATE_INTERVAL = 60000; // 60 segundos (1 minuto)
const ALERTS_UPDATE_INTERVAL = 30000; // 30 segundos

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const appState = useRef(AppState.currentState);
  const vitalsInterval = useRef<NodeJS.Timeout | null>(null);
  const alertsInterval = useRef<NodeJS.Timeout | null>(null);

  // Stores
  const { user } = useAuthStore();
  const { devices, currentVitals, isLoading: devicesLoading, fetchDevices, fetchVitals } = useDeviceStore();
  const { alerts, pendingCount, fetchAlerts, fetchPendingCount } = useAlertStore();

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTUALIZACIÓN EN TIEMPO REAL
  // ═══════════════════════════════════════════════════════════════════════════

  // Cargar datos inicial
  useEffect(() => {
    loadData();
    
    // Iniciar actualizaciones automáticas
    startAutoUpdate();
    
    // Manejar cuando la app vuelve al foreground
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      stopAutoUpdate();
      subscription.remove();
    };
  }, []);

  // Cuando cambia el dispositivo seleccionado, cargar sus vitales
  useEffect(() => {
    if (selectedPerson) {
      fetchVitals(selectedPerson);
    }
  }, [selectedPerson]);

  const handleAppStateChange = (nextAppState: string) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App volvió al foreground, recargar datos
      console.log('📱 App activa - recargando datos...');
      loadData();
      startAutoUpdate();
    } else if (nextAppState.match(/inactive|background/)) {
      // App va al background, pausar actualizaciones
      stopAutoUpdate();
    }
    appState.current = nextAppState as any;
  };

  const startAutoUpdate = () => {
    // Actualizar signos vitales cada 30 segundos
    vitalsInterval.current = setInterval(() => {
      if (selectedPerson) {
        console.log('🔄 Actualizando signos vitales...');
        fetchVitals(selectedPerson);
        setLastUpdate(new Date());
      }
    }, VITALS_UPDATE_INTERVAL);

    // Actualizar alertas cada 30 segundos
    alertsInterval.current = setInterval(() => {
      console.log('🔔 Verificando nuevas alertas...');
      fetchAlerts();
      fetchPendingCount();
    }, ALERTS_UPDATE_INTERVAL);
  };

  const stopAutoUpdate = () => {
    if (vitalsInterval.current) {
      clearInterval(vitalsInterval.current);
      vitalsInterval.current = null;
    }
    if (alertsInterval.current) {
      clearInterval(alertsInterval.current);
      alertsInterval.current = null;
    }
  };

  const loadData = async () => {
    try {
      await Promise.all([
        fetchDevices(),
        fetchAlerts(),
        fetchPendingCount(),
      ]);
      
      // Cargar vitales del primer dispositivo
      if (devices.length > 0 && !selectedPerson) {
        setSelectedPerson(devices[0].id);
        fetchVitals(devices[0].id);
      } else if (selectedPerson) {
        fetchVitals(selectedPerson);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Obtener alertas recientes NO LEÍDAS (últimas 3)
  const recentAlerts = alerts.filter(a => !a.isRead).slice(0, 3);

  // Obtener el dispositivo seleccionado
  const selectedDevice = devices.find(d => d.id === selectedPerson);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hola, {user?.firstName || 'Usuario'} 👋
          </Text>
          <Text style={styles.subtitle}>
            {devices.length > 0
              ? `Monitoreando ${devices.length} persona${devices.length > 1 ? 's' : ''}`
              : 'Sin dispositivos vinculados'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.getParent()?.navigate('AlertsTab')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
            {pendingCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {pendingCount > 9 ? '9+' : pendingCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Selector de personas monitoreadas */}
        {devices.length > 0 && (
          <View style={styles.personSelector}>
            <Text style={styles.sectionTitle}>Personas Monitoreadas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.personList}
            >
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.personItem,
                    selectedPerson === device.id && styles.personItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPerson(device.id);
                    fetchVitals(device.id);
                  }}
                >
                  <Avatar
                    size="md"
                    name={device.monitoredPerson?.firstName + ' ' + device.monitoredPerson?.lastName}
                    showBadge
                    badgeColor={device.status === 'connected' ? colors.status.success : colors.status.error}
                  />
                  <Text
                    style={[
                      styles.personName,
                      selectedPerson === device.id && styles.personNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {device.monitoredPerson?.firstName || 'Dispositivo'}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Botón agregar */}
              <TouchableOpacity
                style={styles.addPersonButton}
                onPress={() => navigation.navigate('AddMonitored')}
              >
                <View style={styles.addPersonIcon}>
                  <Ionicons name="add" size={24} color={colors.primary[500]} />
                </View>
                <Text style={styles.addPersonText}>Agregar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Signos vitales */}
        {selectedDevice && currentVitals ? (
          <View style={styles.vitalsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Signos Vitales</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('VitalDetail', {
                  deviceId: selectedDevice.id,
                  vitalType: 'heartRate',
                })}
              >
                <Text style={styles.seeAll}>Ver historial</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.vitalsGrid}>
              <View style={styles.vitalItem}>
                <VitalCard
                  type="heartRate"
                  value={currentVitals.heartRate}
                  unit="bpm"
                  label="Ritmo Cardíaco"
                  onPress={() => navigation.navigate('VitalDetail', {
                    deviceId: selectedDevice.id,
                    vitalType: 'heartRate',
                  })}
                />
              </View>
              <View style={styles.vitalItem}>
                <VitalCard
                  type="oxygen"
                  value={currentVitals.oxygenLevel}
                  unit="%"
                  label="Oxigenación"
                  onPress={() => navigation.navigate('VitalDetail', {
                    deviceId: selectedDevice.id,
                    vitalType: 'oxygen',
                  })}
                />
              </View>
              <View style={styles.vitalItem}>
                <VitalCard
                  type="temperature"
                  value={currentVitals.temperature}
                  unit="°C"
                  label="Temperatura"
                  onPress={() => navigation.navigate('VitalDetail', {
                    deviceId: selectedDevice.id,
                    vitalType: 'temperature',
                  })}
                />
              </View>
              <View style={styles.vitalItem}>
                <VitalCard
                  type="steps"
                  value={currentVitals.steps}
                  unit="pasos"
                  label="Pasos Hoy"
                  showStatus={false}
                />
              </View>
            </View>

            {/* Última actualización con indicador de tiempo real */}
            <View style={styles.updateContainer}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
              <Text style={styles.lastUpdate}>
                Actualizado: {lastUpdate.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ) : devices.length === 0 ? (
          <EmptyState
            type="no-devices"
            actionLabel="Vincular Dispositivo"
            onAction={() => navigation.navigate('AddMonitored')}
          />
        ) : !selectedPerson ? (
          <Card style={styles.selectPersonCard}>
            <View style={styles.selectPersonContent}>
              <Ionicons name="person-circle-outline" size={48} color={colors.primary[400]} />
              <Text style={styles.selectPersonTitle}>Selecciona una persona</Text>
              <Text style={styles.selectPersonText}>
                Toca en una de las personas monitoreadas arriba para ver sus signos vitales
              </Text>
            </View>
          </Card>
        ) : devicesLoading ? (
          <Loading message="Cargando signos vitales..." />
        ) : (
          <Card style={styles.noVitalsCard}>
            <View style={styles.noVitalsContent}>
              <Ionicons name="pulse-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.noVitalsTitle}>Sin datos de signos vitales</Text>
              <Text style={styles.noVitalsText}>
                Esperando datos del dispositivo...
              </Text>
            </View>
          </Card>
        )}

        {/* Estado del dispositivo */}
        {selectedDevice && (
          <View style={styles.deviceSection}>
            <Text style={styles.sectionTitle}>Dispositivo</Text>
            <DeviceStatusCard
              deviceId={selectedDevice.id}
              deviceName={selectedDevice.name}
              monitoredPersonName={`${selectedDevice.monitoredPerson?.firstName} ${selectedDevice.monitoredPerson?.lastName}`}
              status={selectedDevice.status as any}
              batteryLevel={selectedDevice.batteryLevel}
              lastSync={selectedDevice.lastSyncAt ?? undefined}
              onPress={() => navigation.navigate('DeviceDetail', { deviceId: selectedDevice.id })}
            />
          </View>
        )}

        {/* Ubicación rápida */}
        {selectedDevice && (
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => navigation.getParent()?.navigate('MapTab')}
          >
            <View style={styles.locationContent}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={24} color={colors.secondary[500]} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Ver ubicación en tiempo real</Text>
                <Text style={styles.locationSubtitle}>
                  Última ubicación: Casa
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}

        {/* Alertas recientes */}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alertas Recientes</Text>
              <TouchableOpacity
                onPress={() => navigation.getParent()?.navigate('AlertsTab')}
              >
                <Text style={styles.seeAll}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            {recentAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onPress={() => navigation.getParent()?.navigate('AlertsTab', {
                  screen: 'AlertDetail',
                  params: { alertId: alert.id },
                })}
              />
            ))}
          </View>
        )}

        {/* Contactos de Emergencia - Siempre visible si hay dispositivo */}
        {selectedDevice && (
          <View style={styles.contactsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contactos de Emergencia</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MonitoredPerson', {
                  personId: selectedDevice.id,
                })}
              >
                <Text style={styles.seeAll}>Gestionar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contactsScrollContent}
            >
              {/* 911 - Siempre visible primero */}
              <TouchableOpacity
                style={[styles.contactCard, styles.emergencyCard]}
                onPress={() => Linking.openURL('tel:911')}
              >
                <View style={styles.emergencyAvatar}>
                  <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
                </View>
                <Text style={[styles.contactName, styles.emergencyName]}>911</Text>
                <Text style={[styles.contactRelation, styles.emergencyRelation]}>Emergencias</Text>
                <View style={styles.emergencyBadge}>
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                  <Text style={styles.callBadgeText}>SOS</Text>
                </View>
              </TouchableOpacity>

              {/* Contactos del usuario */}
              {selectedDevice.monitoredPerson?.emergencyContacts?.map((contact, index) => (
                <TouchableOpacity
                  key={contact.id || index}
                  style={styles.contactCard}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                >
                  <View style={[
                    styles.contactAvatar,
                    contact.isPrimary && styles.contactAvatarPrimary
                  ]}>
                    <Ionicons 
                      name={contact.isPrimary ? "star" : "person"} 
                      size={24} 
                      color={contact.isPrimary ? colors.status.warning : colors.primary[500]} 
                    />
                  </View>
                  <Text style={styles.contactName} numberOfLines={1}>
                    {contact.name.split(' ')[0]}
                  </Text>
                  <Text style={styles.contactRelation} numberOfLines={1}>
                    {contact.relationship}
                  </Text>
                  <View style={styles.callBadge}>
                    <Ionicons name="call" size={14} color="#FFFFFF" />
                    <Text style={styles.callBadgeText}>Llamar</Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Botón para agregar contacto */}
              <TouchableOpacity
                style={styles.addContactCard}
                onPress={() => navigation.navigate('MonitoredPerson', {
                  personId: selectedDevice.id,
                })}
              >
                <View style={styles.addContactIcon}>
                  <Ionicons name="add" size={28} color={colors.primary[500]} />
                </View>
                <Text style={styles.addContactText}>Agregar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.getParent()?.navigate('MapTab')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary[100] }]}>
                <Ionicons name="map" size={24} color={colors.secondary[600]} />
              </View>
              <Text style={styles.actionText}>Mapa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.getParent()?.navigate('AlertsTab', {
                screen: 'Alerts',
              })}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary[100] }]}>
                <Ionicons name="notifications" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.actionText}>Alertas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('MonitoredPerson', {
                personId: selectedPerson || '',
              })}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="person" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.actionText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
  // Selector de personas
  personSelector: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  personList: {
    paddingRight: spacing.base,
  },
  personItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  personItemSelected: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  personName: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    maxWidth: 70,
    textAlign: 'center',
  },
  personNameSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  addPersonButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  addPersonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  addPersonText: {
    ...typography.caption,
    color: colors.primary[500],
    marginTop: spacing.xs,
  },
  // Signos vitales
  vitalsSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  vitalItem: {
    width: '50%',
    paddingHorizontal: spacing.xs,
  },
  // Actualización en tiempo real
  updateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: spacing.xs,
  },
  liveText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  lastUpdate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Dispositivo
  deviceSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  // Ubicación
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  locationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Alertas
  alertsSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  // Contactos de Emergencia
  contactsSection: {
    marginBottom: spacing.lg,
  },
  contactsScrollContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
  },
  contactCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  contactAvatarPrimary: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: colors.status.warning,
  },
  contactName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  contactRelation: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[500],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  callBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  addContactCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  addContactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addContactText: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '600',
  },
  // Estilos para tarjeta 911
  emergencyCard: {
    backgroundColor: colors.status.error,
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  emergencyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B91C1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emergencyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  emergencyRelation: {
    color: 'rgba(255,255,255,0.8)',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  // Acciones rápidas
  quickActions: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    width: (width - spacing.base * 2) / 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Cards para estados sin datos
  selectPersonCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  selectPersonContent: {
    alignItems: 'center',
  },
  selectPersonTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  selectPersonText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  noVitalsCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  noVitalsContent: {
    alignItems: 'center',
  },
  noVitalsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  noVitalsText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
