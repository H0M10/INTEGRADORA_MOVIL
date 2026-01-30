// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Historial de Ubicaciones
// Visualización del historial de movimiento
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MapStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, Card, Loading, EmptyState } from '../../../components/ui';
import { useDeviceStore } from '../../../stores';
import { DeviceLocation } from '../../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type LocationHistoryScreenProps = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'LocationHistory'>;
  route: RouteProp<MapStackParamList, 'LocationHistory'>;
};

type TimeRange = '1h' | '6h' | '24h' | '7d';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

const { width, height } = Dimensions.get('window');

export const LocationHistoryScreen: React.FC<LocationHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { deviceId } = route.params;
  const mapRef = useRef<MapView>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24h');
  const [selectedPoint, setSelectedPoint] = useState<DeviceLocation | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);

  const { devices, locations, fetchLocations } = useDeviceStore();
  const device = devices.find(d => d.id === deviceId);
  const locationHistory = locations[deviceId] || [];

  useEffect(() => {
    loadHistory();
  }, [selectedRange]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      await fetchLocations(deviceId);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar ubicaciones por rango de tiempo
  const getFilteredLocations = (): DeviceLocation[] => {
    const now = new Date();
    let cutoff: Date;

    switch (selectedRange) {
      case '1h':
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Datos simulados para demostración
    const simulatedData: DeviceLocation[] = [];
    const baseLatitude = 19.4326;
    const baseLongitude = -99.1332;

    for (let i = 0; i < 20; i++) {
      const timestampDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      if (timestampDate >= cutoff) {
        const isoTimestamp = timestampDate.toISOString();
        simulatedData.push({
          id: `loc-${i}`,
          deviceId,
          latitude: baseLatitude + (Math.random() - 0.5) * 0.01,
          longitude: baseLongitude + (Math.random() - 0.5) * 0.01,
          accuracy: 10,
          speed: Math.random() * 5,
          timestamp: isoTimestamp,
          recordedAt: isoTimestamp,
        });
      }
    }

    return simulatedData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const filteredLocations = getFilteredLocations();

  // Coordenadas para la línea del recorrido
  const routeCoordinates = filteredLocations.map(loc => ({
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));

  // Centrar mapa en el recorrido
  useEffect(() => {
    if (filteredLocations.length > 0) {
      const padding = { top: 100, right: 50, bottom: 300, left: 50 };
      mapRef.current?.fitToCoordinates(routeCoordinates, {
        edgePadding: padding,
        animated: true,
      });
    }
  }, [filteredLocations]);

  // Calcular estadísticas
  const calculateStats = () => {
    if (filteredLocations.length < 2) {
      return { distance: 0, avgSpeed: 0, maxSpeed: 0 };
    }

    let totalDistance = 0;
    let maxSpeed = 0;
    let speedSum = 0;
    let speedCount = 0;

    for (let i = 1; i < filteredLocations.length; i++) {
      const prev = filteredLocations[i - 1];
      const curr = filteredLocations[i];

      // Calcular distancia usando fórmula haversine simplificada
      const lat1 = prev.latitude * Math.PI / 180;
      const lat2 = curr.latitude * Math.PI / 180;
      const deltaLat = lat2 - lat1;
      const deltaLon = (curr.longitude - prev.longitude) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = 6371000 * c; // Radio de la Tierra en metros

      totalDistance += distance;

      if (curr.speed) {
        maxSpeed = Math.max(maxSpeed, curr.speed * 3.6); // m/s a km/h
        speedSum += curr.speed * 3.6;
        speedCount++;
      }
    }

    return {
      distance: totalDistance / 1000, // km
      avgSpeed: speedCount > 0 ? speedSum / speedCount : 0,
      maxSpeed,
    };
  };

  const stats = calculateStats();

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1h' },
    { value: '6h', label: '6h' },
    { value: '24h', label: '24h' },
    { value: '7d', label: '7 días' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Historial de Ubicación"
        showBack
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: showTimeline ? 'list' : 'list-outline',
            onPress: () => setShowTimeline(!showTimeline),
          },
        ]}
      />

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Ruta */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary[500]}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Marcador inicio */}
        {filteredLocations.length > 0 && (
          <Marker
            coordinate={{
              latitude: filteredLocations[0].latitude,
              longitude: filteredLocations[0].longitude,
            }}
            title="Inicio"
            description={new Date(filteredLocations[0].timestamp).toLocaleString('es-ES')}
          >
            <View style={styles.startMarker}>
              <Ionicons name="flag" size={16} color={colors.text.inverse} />
            </View>
          </Marker>
        )}

        {/* Marcador fin (posición actual) */}
        {filteredLocations.length > 1 && (
          <Marker
            coordinate={{
              latitude: filteredLocations[filteredLocations.length - 1].latitude,
              longitude: filteredLocations[filteredLocations.length - 1].longitude,
            }}
            title="Última posición"
            description={new Date(filteredLocations[filteredLocations.length - 1].timestamp).toLocaleString('es-ES')}
          >
            <View style={styles.endMarker}>
              <View style={styles.endMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Marcadores intermedios */}
        {filteredLocations.slice(1, -1).map((loc, index) => (
          <Marker
            key={loc.id}
            coordinate={{
              latitude: loc.latitude,
              longitude: loc.longitude,
            }}
            onPress={() => setSelectedPoint(loc)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.waypoint,
              selectedPoint?.id === loc.id && styles.waypointSelected,
            ]} />
          </Marker>
        ))}
      </MapView>

      {/* Selector de tiempo */}
      <View style={styles.timeSelector}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.timeButton,
              selectedRange === range.value && styles.timeButtonActive,
            ]}
            onPress={() => setSelectedRange(range.value)}
          >
            <Text style={[
              styles.timeButtonText,
              selectedRange === range.value && styles.timeButtonTextActive,
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Panel de información */}
      <View style={styles.infoPanel}>
        {/* Estadísticas */}
        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.statsTitle}>
            {device?.monitoredPerson?.firstName || 'Dispositivo'} - Resumen
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.distance.toFixed(2)} km
              </Text>
              <Text style={styles.statLabel}>Distancia</Text>
            </View>
            <View style={[styles.statItem, styles.statItemBorder]}>
              <Text style={styles.statValue}>
                {stats.avgSpeed.toFixed(1)} km/h
              </Text>
              <Text style={styles.statLabel}>Velocidad media</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {filteredLocations.length}
              </Text>
              <Text style={styles.statLabel}>Puntos</Text>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        {showTimeline && (
          <Card variant="elevated" style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Recorrido</Text>
            <ScrollView 
              style={styles.timeline}
              showsVerticalScrollIndicator={false}
            >
              {filteredLocations.slice().reverse().slice(0, 10).map((loc, index) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.timelineItem}
                  onPress={() => {
                    setSelectedPoint(loc);
                    mapRef.current?.animateToRegion({
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }, 500);
                  }}
                >
                  <View style={styles.timelineDot}>
                    {index === 0 && (
                      <Ionicons name="location" size={12} color={colors.primary[500]} />
                    )}
                  </View>
                  {index < filteredLocations.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTime}>
                      {new Date(loc.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text style={styles.timelineLocation} numberOfLines={1}>
                      {loc.speed 
                        ? `${Math.round(loc.speed * 3.6)} km/h`
                        : 'Detenido'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}
      </View>

      {/* Punto seleccionado */}
      {selectedPoint && (
        <View style={styles.selectedPointCard}>
          <Card variant="outlined">
            <View style={styles.selectedPointContent}>
              <View>
                <Text style={styles.selectedPointTime}>
                  {new Date(selectedPoint.timestamp).toLocaleString('es-ES')}
                </Text>
                <Text style={styles.selectedPointCoords}>
                  {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loading message="Cargando historial..." />
        </View>
      )}

      {/* Empty state */}
      {!isLoading && filteredLocations.length === 0 && (
        <View style={styles.emptyOverlay}>
          <EmptyState
            type="location"
            title="Sin historial"
            description="No hay ubicaciones registradas en este período"
          />
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
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  map: {
    flex: 1,
  },
  // Time selector
  timeSelector: {
    position: 'absolute',
    top: 110,
    left: spacing.base,
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    ...shadows.sm,
  },
  timeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  timeButtonActive: {
    backgroundColor: colors.primary[500],
  },
  timeButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timeButtonTextActive: {
    color: colors.text.inverse,
  },
  // Markers
  startMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
    ...shadows.sm,
  },
  endMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
    ...shadows.md,
  },
  endMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.primary,
  },
  waypoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[300],
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  waypointSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
  },
  // Info panel
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
  },
  statsCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  statsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.ui.divider,
  },
  statValue: {
    ...typography.h4,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Timeline
  timelineCard: {
    maxHeight: 200,
    padding: spacing.md,
  },
  timelineTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 20,
    width: 2,
    height: 24,
    backgroundColor: colors.primary[200],
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineTime: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  timelineLocation: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  // Selected point
  selectedPointCard: {
    position: 'absolute',
    top: 160,
    left: spacing.base,
    right: spacing.base,
  },
  selectedPointContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  selectedPointTime: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  selectedPointCoords: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  // Overlays
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LocationHistoryScreen;
