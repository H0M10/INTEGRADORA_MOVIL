// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Alertas
// Listado de todas las alertas del sistema con secciones leídas/no leídas
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  SectionList,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertsStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, AlertCard, Badge, Loading, EmptyState } from '../../../components/ui';
import { useAlertStore } from '../../../stores';
import { Alert } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<AlertsStackParamList, 'Alerts'>;
};

type FilterType = 'all' | 'critical' | 'warning' | 'info' | 'unread' | 'read';

const ALERTS_UPDATE_INTERVAL = 30000; // 30 segundos

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const appState = useRef(AppState.currentState);
  const alertsInterval = useRef<NodeJS.Timeout | null>(null);

  const { 
    alerts, 
    stats,
    isLoading, 
    fetchAlerts,
    fetchAlertStats,
    fetchPendingCount,
    markAsRead,
    pendingCount,
  } = useAlertStore();

  useEffect(() => {
    loadAlerts();
    fetchAlertStats();
    
    // Actualización automática cada 30 segundos
    alertsInterval.current = setInterval(() => {
      console.log('🔔 Actualizando alertas...');
      fetchAlerts();
      fetchAlertStats();
      fetchPendingCount();
    }, ALERTS_UPDATE_INTERVAL);
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadAlerts();
      }
      appState.current = nextAppState as any;
    });

    return () => {
      if (alertsInterval.current) clearInterval(alertsInterval.current);
      subscription.remove();
    };
  }, []);

  const loadAlerts = async () => {
    try {
      await Promise.all([fetchAlerts(), fetchAlertStats(), fetchPendingCount()]);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, []);

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'critical':
        return alert.severity === 'critical';
      case 'warning':
        return alert.severity === 'warning';
      case 'info':
        return alert.severity === 'info';
      case 'unread':
        return !alert.isRead;
      case 'read':
        return alert.isRead;
      default:
        return true;
    }
  });

  // Separar en secciones: No leídas y Leídas
  const unreadAlerts = filteredAlerts.filter(a => !a.isRead);
  const readAlerts = filteredAlerts.filter(a => a.isRead);

  const sections = [
    ...(unreadAlerts.length > 0 ? [{ title: `📬 No leídas (${unreadAlerts.length})`, data: unreadAlerts }] : []),
    ...(readAlerts.length > 0 ? [{ title: `📭 Leídas (${readAlerts.length})`, data: readAlerts }] : []),
  ];

  const filters: { value: FilterType; label: string; icon: string; color?: string; count?: number }[] = [
    { value: 'all', label: 'Todas', icon: 'list', count: alerts.length },
    { value: 'unread', label: 'No leídas', icon: 'mail-unread', count: stats?.unread || 0, color: colors.primary[500] },
    { value: 'read', label: 'Leídas', icon: 'mail-open', count: (alerts.length - (stats?.unread || 0)) },
    { value: 'critical', label: 'Críticas', icon: 'warning', color: colors.status.error, count: stats?.critical || 0 },
    { value: 'warning', label: 'Alertas', icon: 'alert-circle', color: colors.status.warning, count: stats?.warning || 0 },
    { value: 'info', label: 'Info', icon: 'information-circle', color: colors.status.info, count: stats?.info || 0 },
  ];

  const handleAlertPress = async (alert: Alert) => {
    if (!alert.isRead) {
      await markAsRead(alert.id);
    }
    navigation.navigate('AlertDetail', { alertId: alert.id });
  };

  const handleMarkAsReadFromList = async (alert: Alert) => {
    if (!alert.isRead) {
      await markAsRead(alert.id);
      // Recargar para actualizar la UI
      await fetchAlertStats();
      await fetchPendingCount();
    }
  };

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={styles.alertWrapper}>
      <AlertCard
        alert={item}
        onPress={() => handleAlertPress(item)}
        style={item.isRead ? styles.alertCardRead : undefined}
      />
      {!item.isRead && (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => handleMarkAsReadFromList(item)}
        >
          <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Alertas</Text>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('AlertSettings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardCritical]}>
          <Ionicons name="warning" size={20} color={colors.status.error} />
          <Text style={styles.statNumber}>{stats?.critical || 0}</Text>
          <Text style={styles.statLabel}>Críticas</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWarning]}>
          <Ionicons name="alert-circle" size={20} color={colors.status.warning} />
          <Text style={styles.statNumber}>{stats?.warning || 0}</Text>
          <Text style={styles.statLabel}>Alertas</Text>
        </View>
        <View style={[styles.statCard, styles.statCardInfo]}>
          <Ionicons name="information-circle" size={20} color={colors.status.info} />
          <Text style={styles.statNumber}>{stats?.info || 0}</Text>
          <Text style={styles.statLabel}>Info</Text>
        </View>
        <View style={[styles.statCard, styles.statCardUnread]}>
          <Ionicons name="mail-unread" size={20} color={colors.primary[500]} />
          <Text style={styles.statNumber}>{stats?.unread || 0}</Text>
          <Text style={styles.statLabel}>Sin leer</Text>
        </View>
      </View>

      {/* Filters - Scrollable horizontalmente */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.filterChip,
                filter === f.value && styles.filterChipActive,
                filter === f.value && f.color && { backgroundColor: f.color },
              ]}
              onPress={() => setFilter(f.value)}
            >
              <Ionicons
                name={f.icon as any}
                size={16}
                color={filter === f.value ? '#FFFFFF' : (f.color || colors.text.secondary)}
              />
              <Text style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}>
                {f.label}
              </Text>
              {f.count !== undefined && f.count > 0 && (
                <View style={[
                  styles.filterCount,
                  filter === f.value && styles.filterCountActive,
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    filter === f.value && styles.filterCountTextActive,
                  ]}>
                    {f.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content con SectionList */}
      {isLoading && !refreshing ? (
        <Loading message="Cargando alertas..." />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          type="alerts"
          title={filter === 'all' ? 'Sin alertas' : 'Sin resultados'}
          description={
            filter === 'all'
              ? 'No hay alertas registradas. ¡Todo está bien!'
              : `No hay alertas ${filter === 'unread' ? 'sin leer' : filter === 'read' ? 'leídas' : filter}`
          }
        />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderAlert}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        />
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  pendingBadge: {
    backgroundColor: colors.status.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  statCardCritical: {
    backgroundColor: colors.status.error + '10',
  },
  statCardWarning: {
    backgroundColor: colors.status.warning + '10',
  },
  statCardInfo: {
    backgroundColor: colors.status.info + '10',
  },
  statCardUnread: {
    backgroundColor: colors.primary[500] + '10',
  },
  statNumber: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  // Filters - Scrollable
  filtersWrapper: {
    height: 56,
    marginBottom: spacing.sm,
  },
  filtersScrollContent: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    height: 56,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  filterCount: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterCountText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 11,
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  // Alert wrapper for mark as read button
  alertWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertCard: {
    flex: 1,
    marginBottom: 0,
  },
  alertCardRead: {
    opacity: 0.7,
  },
  markReadButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  // List
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: spacing.sm,
  },
  sectionSeparator: {
    height: spacing.md,
  },
  // Section
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.primary,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    fontSize: 15,
  },
});

export default AlertsScreen;
