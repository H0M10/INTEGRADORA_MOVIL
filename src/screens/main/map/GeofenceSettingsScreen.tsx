// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Configuración de Geofences
// Administración de zonas seguras
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, Card, Button, Input, Badge, EmptyState } from '../../../components/ui';
import { config } from '../../../config';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type GeofenceSettingsScreenProps = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'GeofenceSettings'>;
};

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  type: 'home' | 'hospital' | 'work' | 'other';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

const { width, height } = Dimensions.get('window');

export const GeofenceSettingsScreen: React.FC<GeofenceSettingsScreenProps> = ({
  navigation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([
    {
      id: '1',
      name: 'Casa',
      latitude: config.map.defaultLocation.latitude,
      longitude: config.map.defaultLocation.longitude,
      radius: 100,
      isActive: true,
      type: 'home',
    },
    {
      id: '2',
      name: 'Hospital',
      latitude: config.map.defaultLocation.latitude + 0.005,
      longitude: config.map.defaultLocation.longitude + 0.003,
      radius: 200,
      isActive: true,
      type: 'hospital',
    },
  ]);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    radius: 100,
    type: 'other' as Geofence['type'],
  });

  const geofenceTypes: { value: Geofence['type']; label: string; icon: string }[] = [
    { value: 'home', label: 'Casa', icon: 'home' },
    { value: 'hospital', label: 'Hospital', icon: 'medical' },
    { value: 'work', label: 'Trabajo', icon: 'briefcase' },
    { value: 'other', label: 'Otro', icon: 'location' },
  ];

  const getGeofenceIcon = (type: Geofence['type']) => {
    const found = geofenceTypes.find(t => t.value === type);
    return found?.icon || 'location';
  };

  const handleMapPress = (event: any) => {
    if (isAddingNew) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
    }
  };

  const handleAddGeofence = () => {
    if (!selectedLocation) {
      Alert.alert('Ubicación requerida', 'Selecciona un punto en el mapa');
      return;
    }
    if (!newGeofence.name.trim()) {
      Alert.alert('Nombre requerido', 'Ingresa un nombre para la zona segura');
      return;
    }

    const newFence: Geofence = {
      id: Date.now().toString(),
      name: newGeofence.name,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      radius: newGeofence.radius,
      isActive: true,
      type: newGeofence.type,
    };

    setGeofences([...geofences, newFence]);
    setIsAddingNew(false);
    setSelectedLocation(null);
    setNewGeofence({ name: '', radius: 100, type: 'other' });

    Alert.alert('Zona creada', 'La zona segura se ha creado correctamente');
  };

  const handleDeleteGeofence = (id: string) => {
    Alert.alert(
      'Eliminar zona',
      '¿Estás seguro de eliminar esta zona segura?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setGeofences(geofences.filter(g => g.id !== id));
          },
        },
      ]
    );
  };

  const toggleGeofence = (id: string) => {
    setGeofences(geofences.map(g => 
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ));
  };

  const handleCenterOnGeofence = (geofence: Geofence) => {
    mapRef.current?.animateToRegion({
      latitude: geofence.latitude,
      longitude: geofence.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Zonas Seguras"
        showBack
        onBack={() => navigation.goBack()}
        rightActions={[
          {
            icon: isAddingNew ? 'close' : 'add',
            onPress: () => {
              setIsAddingNew(!isAddingNew);
              setSelectedLocation(null);
            },
          },
        ]}
      />

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: config.map.defaultLocation.latitude,
          longitude: config.map.defaultLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Geofences existentes */}
        {geofences.map((fence) => (
          <React.Fragment key={fence.id}>
            <Circle
              center={{
                latitude: fence.latitude,
                longitude: fence.longitude,
              }}
              radius={fence.radius}
              strokeColor={fence.isActive ? colors.secondary[500] : colors.text.disabled}
              fillColor={(fence.isActive ? colors.secondary[500] : colors.text.disabled) + '20'}
              strokeWidth={2}
            />
            <Marker
              coordinate={{
                latitude: fence.latitude,
                longitude: fence.longitude,
              }}
              onPress={() => handleCenterOnGeofence(fence)}
            >
              <View style={[
                styles.geofenceMarker,
                !fence.isActive && styles.geofenceMarkerInactive,
              ]}>
                <Ionicons 
                  name={getGeofenceIcon(fence.type) as any}
                  size={16}
                  color={fence.isActive ? colors.secondary[600] : colors.text.disabled}
                />
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {/* Nueva ubicación seleccionada */}
        {selectedLocation && (
          <React.Fragment>
            <Circle
              center={selectedLocation}
              radius={newGeofence.radius}
              strokeColor={colors.primary[500]}
              fillColor={colors.primary[500] + '20'}
              strokeWidth={2}
              lineDashPattern={[10, 5]}
            />
            <Marker coordinate={selectedLocation}>
              <View style={styles.newMarker}>
                <Ionicons name="add" size={20} color={colors.text.inverse} />
              </View>
            </Marker>
          </React.Fragment>
        )}
      </MapView>

      {/* Instrucciones al agregar */}
      {isAddingNew && !selectedLocation && (
        <View style={styles.instructionBanner}>
          <Ionicons name="finger-print" size={20} color={colors.primary[500]} />
          <Text style={styles.instructionText}>
            Toca en el mapa para seleccionar la ubicación de la zona
          </Text>
        </View>
      )}

      {/* Panel de configuración de nueva zona */}
      {isAddingNew && selectedLocation && (
        <View style={styles.newGeofencePanel}>
          <Card variant="elevated" style={styles.newGeofenceCard}>
            <Text style={styles.panelTitle}>Nueva Zona Segura</Text>
            
            <Input
              label="Nombre"
              placeholder="Ej: Casa, Hospital"
              value={newGeofence.name}
              onChangeText={(text) => setNewGeofence({ ...newGeofence, name: text })}
              leftIcon={<Ionicons name="text" size={20} color={colors.text.tertiary} />}
            />

            <Text style={styles.inputLabel}>Tipo de zona</Text>
            <View style={styles.typeSelector}>
              {geofenceTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    newGeofence.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewGeofence({ ...newGeofence, type: type.value })}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={newGeofence.type === type.value 
                      ? colors.primary[500] 
                      : colors.text.tertiary}
                  />
                  <Text style={[
                    styles.typeButtonText,
                    newGeofence.type === type.value && styles.typeButtonTextActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Radio: {newGeofence.radius}m</Text>
            <View style={styles.radiusSelector}>
              {[50, 100, 200, 500].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    newGeofence.radius === radius && styles.radiusButtonActive,
                  ]}
                  onPress={() => setNewGeofence({ ...newGeofence, radius })}
                >
                  <Text style={[
                    styles.radiusButtonText,
                    newGeofence.radius === radius && styles.radiusButtonTextActive,
                  ]}>
                    {radius}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.panelActions}>
              <Button
                title="Cancelar"
                variant="outline"
                size="md"
                onPress={() => {
                  setIsAddingNew(false);
                  setSelectedLocation(null);
                }}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Crear zona"
                size="md"
                onPress={handleAddGeofence}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      )}

      {/* Lista de geofences */}
      {!isAddingNew && (
        <View style={styles.geofenceList}>
          <Card variant="elevated" style={styles.listCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Mis Zonas Seguras</Text>
              <Badge
                count={geofences.filter(g => g.isActive).length}
                label={`${geofences.filter(g => g.isActive).length} activas`}
                size="sm"
                color="success"
              />
            </View>

            {geofences.length === 0 ? (
              <EmptyState
                type="custom"
                title="Sin zonas configuradas"
                description="Agrega zonas seguras para recibir alertas cuando salgan del perímetro"
                icon="shield-outline"
              />
            ) : (
              <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                {geofences.map((fence, index) => (
                  <TouchableOpacity
                    key={fence.id}
                    style={[
                      styles.geofenceItem,
                      index !== geofences.length - 1 && styles.geofenceItemBorder,
                    ]}
                    onPress={() => handleCenterOnGeofence(fence)}
                  >
                    <View style={[
                      styles.geofenceItemIcon,
                      !fence.isActive && styles.geofenceItemIconInactive,
                    ]}>
                      <Ionicons
                        name={getGeofenceIcon(fence.type) as any}
                        size={20}
                        color={fence.isActive ? colors.secondary[500] : colors.text.disabled}
                      />
                    </View>
                    <View style={styles.geofenceItemContent}>
                      <Text style={[
                        styles.geofenceItemName,
                        !fence.isActive && styles.geofenceItemNameInactive,
                      ]}>
                        {fence.name}
                      </Text>
                      <Text style={styles.geofenceItemRadius}>
                        Radio: {fence.radius}m
                      </Text>
                    </View>
                    <View style={styles.geofenceItemActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleGeofence(fence.id)}
                      >
                        <Ionicons
                          name={fence.isActive ? 'eye' : 'eye-off'}
                          size={20}
                          color={fence.isActive ? colors.secondary[500] : colors.text.disabled}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteGeofence(fence.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={colors.status.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Card>
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
  // Markers
  geofenceMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary[500],
    ...shadows.sm,
  },
  geofenceMarkerInactive: {
    borderColor: colors.text.disabled,
    opacity: 0.7,
  },
  newMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
    ...shadows.md,
  },
  // Instructions
  instructionBanner: {
    position: 'absolute',
    top: 110,
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.primary[700],
    marginLeft: spacing.sm,
    flex: 1,
  },
  // New geofence panel
  newGeofencePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
  },
  newGeofenceCard: {
    padding: spacing.lg,
  },
  panelTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  typeButtonText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  typeButtonTextActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  radiusSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
  },
  radiusButtonActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  radiusButtonText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  radiusButtonTextActive: {
    color: colors.primary[500],
  },
  panelActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  // Geofence list
  geofenceList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.base,
    maxHeight: height * 0.4,
  },
  listCard: {
    padding: spacing.lg,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  listScroll: {
    maxHeight: 200,
  },
  geofenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  geofenceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  geofenceItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  geofenceItemIconInactive: {
    backgroundColor: colors.background.tertiary,
  },
  geofenceItemContent: {
    flex: 1,
  },
  geofenceItemName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  geofenceItemNameInactive: {
    color: colors.text.disabled,
  },
  geofenceItemRadius: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  geofenceItemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});

export default GeofenceSettingsScreen;
