// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Configuración de Alertas
// Preferencias y umbrales de notificación
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertsStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, Card, Button } from '../../../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AlertSettingsScreenProps = {
  navigation: NativeStackNavigationProp<AlertsStackParamList, 'AlertSettings'>;
};

interface AlertThreshold {
  id: string;
  name: string;
  icon: string;
  min: number;
  max: number;
  unit: string;
  lowValue: number;
  highValue: number;
  enabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AlertSettingsScreen: React.FC<AlertSettingsScreenProps> = ({
  navigation,
}) => {
  // Estado de alertas generales
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [criticalAlways, setCriticalAlways] = useState(true);

  // Umbrales de signos vitales
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    {
      id: 'heart_rate',
      name: 'Ritmo Cardíaco',
      icon: 'heart',
      min: 40,
      max: 140,
      unit: 'BPM',
      lowValue: 60,
      highValue: 100,
      enabled: true,
    },
    {
      id: 'oxygen',
      name: 'Oxigenación',
      icon: 'water',
      min: 80,
      max: 100,
      unit: '%',
      lowValue: 95,
      highValue: 100,
      enabled: true,
    },
    {
      id: 'temperature',
      name: 'Temperatura',
      icon: 'thermometer',
      min: 35,
      max: 42,
      unit: '°C',
      lowValue: 36,
      highValue: 37.5,
      enabled: true,
    },
  ]);

  // Tipos de alerta
  const [alertTypes, setAlertTypes] = useState([
    { id: 'fall_detected', name: 'Caídas detectadas', icon: 'alert', enabled: true },
    { id: 'geofence_exit', name: 'Salida de zona segura', icon: 'exit', enabled: true },
    { id: 'device_offline', name: 'Dispositivo desconectado', icon: 'cloud-offline', enabled: true },
    { id: 'low_battery', name: 'Batería baja', icon: 'battery-dead', enabled: true },
    { id: 'sos_activated', name: 'Botón SOS activado', icon: 'call', enabled: true },
  ]);

  const STORAGE_KEY = '@alert_settings';

  // Cargar configuración guardada al montar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.alertsEnabled !== undefined) setAlertsEnabled(settings.alertsEnabled);
        if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
        if (settings.vibrationEnabled !== undefined) setVibrationEnabled(settings.vibrationEnabled);
        if (settings.criticalAlways !== undefined) setCriticalAlways(settings.criticalAlways);
        if (settings.thresholds) setThresholds(settings.thresholds);
        if (settings.alertTypes) setAlertTypes(settings.alertTypes);
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
    }
  };

  const updateThreshold = (id: string, field: 'lowValue' | 'highValue' | 'enabled', value: number | boolean) => {
    setThresholds(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const toggleAlertType = (id: string) => {
    setAlertTypes(prev => prev.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleSave = async () => {
    try {
      const settings = {
        alertsEnabled,
        soundEnabled,
        vibrationEnabled,
        criticalAlways,
        thresholds,
        alertTypes,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      Alert.alert(
        'Configuración guardada',
        'Los ajustes de alertas se han actualizado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving alert settings:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Restablecer valores',
      '¿Deseas restablecer todos los valores a su configuración predeterminada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            // Reset logic here
            setThresholds([
              { id: 'heart_rate', name: 'Ritmo Cardíaco', icon: 'heart', min: 40, max: 140, unit: 'BPM', lowValue: 60, highValue: 100, enabled: true },
              { id: 'oxygen', name: 'Oxigenación', icon: 'water', min: 80, max: 100, unit: '%', lowValue: 95, highValue: 100, enabled: true },
              { id: 'temperature', name: 'Temperatura', icon: 'thermometer', min: 35, max: 42, unit: '°C', lowValue: 36, highValue: 37.5, enabled: true },
            ]);
            setAlertTypes(prev => prev.map(t => ({ ...t, enabled: true })));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Configuración de Alertas"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* General Settings */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color={colors.primary[500]} />
              <Text style={styles.settingLabel}>Alertas activadas</Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={setAlertsEnabled}
              trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
              thumbColor={alertsEnabled ? colors.primary[500] : colors.background.tertiary}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high" size={22} color={colors.text.tertiary} />
              <Text style={styles.settingLabel}>Sonido</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
              thumbColor={soundEnabled ? colors.primary[500] : colors.background.tertiary}
              disabled={!alertsEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={22} color={colors.text.tertiary} />
              <Text style={styles.settingLabel}>Vibración</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
              thumbColor={vibrationEnabled ? colors.primary[500] : colors.background.tertiary}
              disabled={!alertsEnabled}
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingInfo}>
              <Ionicons name="warning" size={22} color={colors.status.error} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Alertas críticas siempre</Text>
                <Text style={styles.settingHint}>Ignorar modo silencio</Text>
              </View>
            </View>
            <Switch
              value={criticalAlways}
              onValueChange={setCriticalAlways}
              trackColor={{ false: colors.ui.border, true: colors.status.error + '80' }}
              thumbColor={criticalAlways ? colors.status.error : colors.background.tertiary}
            />
          </View>
        </Card>

        {/* Vital Signs Thresholds */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Umbrales de Signos Vitales</Text>
          <Text style={styles.sectionDescription}>
            Configura los rangos normales para cada signo vital. Recibirás alertas cuando los valores estén fuera de estos rangos.
          </Text>

          {thresholds.map((threshold, index) => (
            <View 
              key={threshold.id}
              style={[
                styles.thresholdContainer,
                index !== thresholds.length - 1 && styles.thresholdBorder,
              ]}
            >
              <View style={styles.thresholdHeader}>
                <View style={styles.thresholdInfo}>
                  <View style={[styles.thresholdIcon, !threshold.enabled && styles.thresholdIconDisabled]}>
                    <Ionicons 
                      name={threshold.icon as any}
                      size={20}
                      color={threshold.enabled ? colors.primary[500] : colors.text.disabled}
                    />
                  </View>
                  <Text style={[
                    styles.thresholdName,
                    !threshold.enabled && styles.thresholdNameDisabled,
                  ]}>
                    {threshold.name}
                  </Text>
                </View>
                <Switch
                  value={threshold.enabled}
                  onValueChange={(value) => updateThreshold(threshold.id, 'enabled', value)}
                  trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
                  thumbColor={threshold.enabled ? colors.primary[500] : colors.background.tertiary}
                />
              </View>

              {threshold.enabled && (
                <View style={styles.thresholdSliders}>
                  {/* Low threshold */}
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.sliderLabel}>Mínimo</Text>
                      <Text style={styles.sliderValue}>
                        {threshold.lowValue} {threshold.unit}
                      </Text>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={threshold.min}
                      maximumValue={threshold.highValue - 1}
                      value={threshold.lowValue}
                      onValueChange={(value) => updateThreshold(threshold.id, 'lowValue', Math.round(value))}
                      minimumTrackTintColor={colors.status.warning}
                      maximumTrackTintColor={colors.secondary[200]}
                      thumbTintColor={colors.status.warning}
                    />
                    <View style={styles.sliderRange}>
                      <Text style={styles.sliderRangeText}>{threshold.min}</Text>
                      <Text style={styles.sliderRangeText}>{threshold.highValue - 1}</Text>
                    </View>
                  </View>

                  {/* High threshold */}
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderHeader}>
                      <Text style={styles.sliderLabel}>Máximo</Text>
                      <Text style={styles.sliderValue}>
                        {threshold.highValue} {threshold.unit}
                      </Text>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={threshold.lowValue + 1}
                      maximumValue={threshold.max}
                      value={threshold.highValue}
                      onValueChange={(value) => updateThreshold(threshold.id, 'highValue', Math.round(value))}
                      minimumTrackTintColor={colors.secondary[400]}
                      maximumTrackTintColor={colors.status.error}
                      thumbTintColor={colors.status.error}
                    />
                    <View style={styles.sliderRange}>
                      <Text style={styles.sliderRangeText}>{threshold.lowValue + 1}</Text>
                      <Text style={styles.sliderRangeText}>{threshold.max}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </Card>

        {/* Alert Types */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Alerta</Text>
          
          {alertTypes.map((type, index) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.alertTypeRow,
                index !== alertTypes.length - 1 && styles.alertTypeRowBorder,
              ]}
              onPress={() => toggleAlertType(type.id)}
            >
              <View style={[
                styles.alertTypeIcon,
                !type.enabled && styles.alertTypeIconDisabled,
              ]}>
                <Ionicons 
                  name={type.icon as any}
                  size={20}
                  color={type.enabled ? colors.secondary[500] : colors.text.disabled}
                />
              </View>
              <Text style={[
                styles.alertTypeName,
                !type.enabled && styles.alertTypeNameDisabled,
              ]}>
                {type.name}
              </Text>
              <Ionicons
                name={type.enabled ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={type.enabled ? colors.secondary[500] : colors.text.disabled}
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Guardar cambios"
            size="lg"
            onPress={handleSave}
          />
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetDefaults}
          >
            <Text style={styles.resetButtonText}>Restablecer valores predeterminados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  // Sections
  section: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  settingHint: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  // Thresholds
  thresholdContainer: {
    paddingVertical: spacing.md,
  },
  thresholdBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  thresholdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thresholdIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  thresholdIconDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  thresholdName: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  thresholdNameDisabled: {
    color: colors.text.disabled,
  },
  thresholdSliders: {
    marginTop: spacing.md,
    paddingLeft: spacing.xl + spacing.md,
  },
  sliderContainer: {
    marginBottom: spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sliderLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  sliderValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  sliderRangeText: {
    ...typography.caption,
    color: colors.text.disabled,
  },
  // Alert types
  alertTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  alertTypeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  alertTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertTypeIconDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  alertTypeName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  alertTypeNameDisabled: {
    color: colors.text.disabled,
  },
  // Actions
  actions: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  resetButtonText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default AlertSettingsScreen;
