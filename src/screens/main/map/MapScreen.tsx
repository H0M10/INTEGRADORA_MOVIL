// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Mapa
// Visualización de ubicación GPS REAL en tiempo real
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Card, Avatar, Badge, Loading } from '../../../components/ui';
import { useDeviceStore } from '../../../stores';
import { config } from '../../../config';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type MapScreenProps = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'Map'>;
};

interface RealLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
  address?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

const { width, height } = Dimensions.get('window');

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [realLocation, setRealLocation] = useState<RealLocation | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [isFollowing, setIsFollowing] = useState(true);

  const { devices } = useDeviceStore();
  const monitoredPerson = devices[0]?.monitoredPerson;

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISOS Y UBICACIÓN GPS REAL
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    initializeLocation();
    return () => {
      // Limpiar suscripción al desmontar
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  const initializeLocation = async () => {
    try {
      // Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Necesitamos acceso a tu ubicación para mostrar el mapa en tiempo real.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        setIsLoading(false);
        return;
      }

      // Obtener ubicación inicial
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation: RealLocation = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        accuracy: initialLocation.coords.accuracy,
        speed: initialLocation.coords.speed,
        heading: initialLocation.coords.heading,
        timestamp: initialLocation.timestamp,
      };
      
      setRealLocation(newLocation);
      
      // Centrar mapa en ubicación inicial
      mapRef.current?.animateToRegion({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);

      setIsLoading(false);

      // Suscribirse a actualizaciones de ubicación en tiempo real
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000, // Actualizar cada 3 segundos
          distanceInterval: 5, // O cuando se mueva 5 metros
        },
        (location) => {
          const updatedLocation: RealLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };
          
          setRealLocation(updatedLocation);
          
          // Seguir ubicación si está activado
          if (isFollowing) {
            mapRef.current?.animateToRegion({
              latitude: updatedLocation.latitude,
              longitude: updatedLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 300);
          }
        }
      );

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación. Verifica que el GPS esté activado.');
      setIsLoading(false);
    }
  };

  // Buscar hospitales cercanos usando Google Maps
  const searchNearbyHospitals = (lat: number, lng: number) => {
    // Abrir Google Maps con búsqueda de hospitales cercanos
    const url = `https://www.google.com/maps/search/hospital/@${lat},${lng},14z`;
    Linking.openURL(url);
  };

  // Servicios de emergencia (números reales de México)
  const emergencyServices = [
    { id: 'emergency', name: '🚨 Emergencias', phone: '911', description: 'Policía, Bomberos, Ambulancia' },
    { id: 'cruz-roja', name: '🏥 Cruz Roja', phone: '065', description: 'Ambulancias y primeros auxilios' },
    { id: 'proteccion-civil', name: '🛡️ Protección Civil', phone: '56 83 11 42', description: 'Desastres y emergencias' },
  ];

  // Centrar mapa en ubicación actual
  const centerOnLocation = () => {
    if (realLocation) {
      mapRef.current?.animateToRegion({
        latitude: realLocation.latitude,
        longitude: realLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
      setIsFollowing(true);
    }
  };

  // Calcular si está en zona segura (dentro de 100m del geofence)
  const isInSafeZone = () => {
    if (!realLocation) return false;
    const homeGeofence = geofences[0];
    if (!homeGeofence) return false;
    const distance = getDistance(
      realLocation.latitude, realLocation.longitude,
      homeGeofence.latitude, homeGeofence.longitude
    );
    return distance <= homeGeofence.radius;
  };

  // Calcular distancia entre dos puntos (en metros)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Geofences (zonas seguras) - centrados en ubicación actual si existe
  const geofences = realLocation ? [
    {
      id: '1',
      name: 'Casa',
      latitude: realLocation.latitude,
      longitude: realLocation.longitude,
      radius: 100,
    },
  ] : [];

  // Pantalla de error de permisos
  if (permissionStatus === 'denied') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="location-outline" size={64} color={colors.status.error} />
        <Text style={styles.errorTitle}>Ubicación Desactivada</Text>
        <Text style={styles.errorMessage}>
          Necesitamos acceso a tu ubicación para mostrar el mapa en tiempo real.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.retryButtonText}>Abrir Configuración</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mapa con ubicación REAL */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: realLocation?.latitude || config.map.defaultLocation.latitude,
          longitude: realLocation?.longitude || config.map.defaultLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={false} // Lo mostramos manualmente para control total
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
        onPanDrag={() => setIsFollowing(false)} // Desactivar seguimiento si el usuario mueve el mapa
      >
        {/* Marcador de ubicación REAL del teléfono (persona monitoreada) */}
        {realLocation && (
          <Marker
            coordinate={{
              latitude: realLocation.latitude,
              longitude: realLocation.longitude,
            }}
            title={monitoredPerson?.firstName || 'Persona Monitoreada'}
            description={`Precisión: ${realLocation.accuracy?.toFixed(0)}m • ${new Date(realLocation.timestamp).toLocaleTimeString()}`}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerInner, isInSafeZone() ? styles.markerSafe : styles.markerOutside]}>
                <Text style={styles.markerEmoji}>👤</Text>
              </View>
              <View style={[styles.markerArrow, isInSafeZone() ? styles.markerArrowSafe : styles.markerArrowOutside]} />
            </View>
          </Marker>
        )}

        {/* Círculo de precisión GPS */}
        {realLocation && realLocation.accuracy && (
          <Circle
            center={{
              latitude: realLocation.latitude,
              longitude: realLocation.longitude,
            }}
            radius={realLocation.accuracy}
            strokeColor={colors.primary[500] + '50'}
            fillColor={colors.primary[500] + '15'}
            strokeWidth={1}
          />
        )}

        {/* Geofences (zona segura = ubicación actual como "casa") */}
        {showGeofences && geofences.map((fence) => (
          <React.Fragment key={fence.id}>
            <Circle
              center={{
                latitude: fence.latitude,
                longitude: fence.longitude,
              }}
              radius={fence.radius}
              strokeColor={colors.status.success}
              fillColor={colors.status.success + '20'}
              strokeWidth={2}
            />
            <Marker
              coordinate={{
                latitude: fence.latitude,
                longitude: fence.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.geofenceMarker}>
                <Ionicons name="home" size={16} color={colors.status.success} />
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      {/* Header flotante */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.headerTitle}>📍 Ubicación en Vivo</Text>
          <Text style={styles.headerSubtitle}>
            GPS Real • Actualización cada 3s
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              if (realLocation) {
                // Mostrar opciones de emergencia reales
                Alert.alert(
                  '🏥 Servicios de Emergencia',
                  'Selecciona una opción:',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: '🚨 Llamar 911', 
                      onPress: () => Linking.openURL('tel:911'),
                      style: 'destructive'
                    },
                    { 
                      text: '🏥 Cruz Roja (065)', 
                      onPress: () => Linking.openURL('tel:065')
                    },
                    { 
                      text: '🗺️ Buscar Hospitales Cercanos', 
                      onPress: () => searchNearbyHospitals(realLocation.latitude, realLocation.longitude)
                    },
                  ]
                );
              } else {
                Alert.alert('Error', 'No se ha obtenido la ubicación aún');
              }
            }}
          >
            <Ionicons
              name="medical"
              size={24}
              color={colors.status.error}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, showGeofences && styles.headerButtonGeofence]}
            onPress={() => setShowGeofences(!showGeofences)}
          >
            <Ionicons
              name={showGeofences ? 'shield-checkmark' : 'shield-outline'}
              size={24}
              color={showGeofences ? colors.status.success : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de estado en tiempo real */}
      {realLocation && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      )}

      {/* Card de información con datos REALES */}
      {realLocation && (
        <View style={[styles.infoCard, { paddingBottom: insets.bottom + spacing.md }]}>
          <Card variant="elevated" style={styles.infoCardInner}>
            <View style={styles.infoHeader}>
              <Avatar
                size="md"
                name={monitoredPerson?.firstName || 'Usuario'}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoName}>
                  {monitoredPerson?.firstName || 'Persona Monitoreada'}
                </Text>
                <Text style={styles.infoAddress}>
                  📍 Lat: {realLocation.latitude.toFixed(6)}
                </Text>
                <Text style={styles.infoAddress}>
                  📍 Lng: {realLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <Badge
                label={isInSafeZone() ? "En zona" : "Fuera"}
                variant="subtle"
                color={isInSafeZone() ? "success" : "warning"}
                size="sm"
              />
            </View>

            <View style={styles.infoDetails}>
              <View style={styles.infoDetail}>
                <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.infoDetailText}>
                  {new Date(realLocation.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.infoDetail}>
                <Ionicons name="speedometer-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.infoDetailText}>
                  {realLocation.speed && realLocation.speed > 0
                    ? `${Math.round(realLocation.speed * 3.6)} km/h`
                    : 'Detenido'}
                </Text>
              </View>
              <View style={styles.infoDetail}>
                <Ionicons name="radio-outline" size={16} color={colors.text.tertiary} />
                <Text style={styles.infoDetailText}>
                  ±{realLocation.accuracy?.toFixed(0)}m
                </Text>
              </View>
            </View>

            <View style={styles.infoActions}>
              <TouchableOpacity 
                style={styles.infoAction}
                onPress={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${realLocation.latitude},${realLocation.longitude}`;
                  Linking.openURL(url);
                }}
              >
                <Ionicons name="navigate-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.infoActionText}>Cómo llegar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.infoAction}
                onPress={async () => {
                  const personName = monitoredPerson?.firstName || 'la persona monitoreada';
                  try {
                    await Share.share({
                      message: `📍 Ubicación de ${personName}:\nhttps://www.google.com/maps?q=${realLocation.latitude},${realLocation.longitude}\n\n⏰ ${new Date(realLocation.timestamp).toLocaleString()}`,
                      title: `Ubicación de ${personName}`,
                    });
                  } catch (error) {
                    console.error('Error sharing:', error);
                  }
                }}
              >
                <Ionicons name="share-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.infoActionText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.infoAction}
                onPress={() => {
                  Alert.alert(
                    '🆘 Emergencia',
                    '¿Deseas llamar a servicios de emergencia?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Llamar 911', onPress: () => Linking.openURL('tel:911'), style: 'destructive' }
                    ]
                  );
                }}
              >
                <Ionicons name="call-outline" size={20} color={colors.status.error} />
                <Text style={[styles.infoActionText, { color: colors.status.error }]}>Emergencia</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}
      {/* Botón mi ubicación / Centrar */}
      <TouchableOpacity
        style={[
          styles.myLocationButton, 
          { bottom: realLocation ? 280 + insets.bottom : 120 + insets.bottom },
          isFollowing && styles.myLocationButtonActive
        ]}
        onPress={centerOnLocation}
      >
        <Ionicons 
          name={isFollowing ? "locate" : "locate-outline"} 
          size={24} 
          color={isFollowing ? colors.primary[500] : colors.text.secondary} 
        />
      </TouchableOpacity>

      {/* Loading */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loading message="Obteniendo ubicaciones..." />
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.text.inverse,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  headerButtonActive: {
    backgroundColor: colors.status.error + '20',
  },
  headerButtonGeofence: {
    backgroundColor: colors.status.success + '20',
  },
  // Live indicator
  liveIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: spacing.xs,
  },
  liveText: {
    ...typography.caption,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontWeight: '700',
  },
  // Markers
  markerContainer: {
    alignItems: 'center',
  },
  markerInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
    ...shadows.md,
  },
  markerSafe: {
    backgroundColor: colors.status.success,
  },
  markerOutside: {
    backgroundColor: colors.status.warning,
  },
  markerEmoji: {
    fontSize: 22,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  markerArrowSafe: {
    borderTopColor: colors.status.success,
  },
  markerArrowOutside: {
    borderTopColor: colors.status.warning,
  },
  geofenceMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.status.success,
  },
  hospitalMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.md,
  },
  // Info card
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
  },
  infoCardInner: {
    padding: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoAddress: {
    ...typography.caption,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoDetails: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  infoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  infoDetailText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  infoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  infoAction: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  infoActionText: {
    ...typography.caption,
    color: colors.primary[500],
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  // My location button
  myLocationButton: {
    position: 'absolute',
    right: spacing.base,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  myLocationButtonActive: {
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapScreen;
