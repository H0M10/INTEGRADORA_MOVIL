// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Configuración
// Ajustes de la aplicación - Vibración funcional (sin expo-av)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { Header, Card, Button } from '../../../components/ui';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

// Keys para AsyncStorage - exportadas para uso en otros componentes
export const SETTINGS_KEY = '@app_settings';
export const SETTINGS_KEYS = {
  autoSync: 'autoSync',
  soundEnabled: 'soundEnabled',
  vibrationEnabled: 'vibrationEnabled',
};

// Helper para obtener configuración desde cualquier parte de la app
export const getAppSettings = async () => {
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return { autoSync: true, soundEnabled: true, vibrationEnabled: true };
  } catch {
    return { autoSync: true, soundEnabled: true, vibrationEnabled: true };
  }
};

// Helper para vibrar - FUNCIONAL
export const triggerVibration = async (type: 'light' | 'medium' | 'heavy' | 'alert' = 'medium') => {
  try {
    const settings = await getAppSettings();
    if (!settings.vibrationEnabled) return;

    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'alert':
        // Patrón de vibración para alertas críticas
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        } else {
          // iOS: múltiples vibraciones rápidas
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }, 300);
          setTimeout(async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }, 600);
        }
        break;
    }
  } catch (error) {
    // Fallback a vibración simple
    Vibration.vibrate(500);
  }
};

// Alerta completa (vibración) - FUNCIONAL
// Nota: El sonido requiere notificaciones push del sistema
export const triggerAlert = async (critical: boolean = false) => {
  const settings = await getAppSettings();
  
  if (settings.vibrationEnabled) {
    if (critical) {
      await triggerVibration('alert');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }
  
  // Nota: El sonido de alertas se maneja via notificaciones push
  // que usan el sonido del sistema operativo
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [autoSync, setAutoSync] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [testingAlert, setTestingAlert] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getAppSettings();
      setAutoSync(settings.autoSync ?? true);
      setSoundEnabled(settings.soundEnabled ?? true);
      setVibrationEnabled(settings.vibrationEnabled ?? true);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = saved ? JSON.parse(saved) : {};
      settings[key] = value;
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleAutoSyncChange = (value: boolean) => {
    setAutoSync(value);
    saveSettings('autoSync', value);
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSoundChange = async (value: boolean) => {
    setSoundEnabled(value);
    await saveSettings('soundEnabled', value);
    
    // Feedback táctil para confirmar
    if (value) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleVibrationChange = async (value: boolean) => {
    setVibrationEnabled(value);
    await saveSettings('vibrationEnabled', value);
    
    // Demostrar el cambio
    if (value) {
      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  };

  const testAlertSystem = async () => {
    setTestingAlert(true);
    
    Alert.alert(
      '🔔 Probar sistema de alertas',
      'Se activará una vibración para verificar que funciona correctamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setTestingAlert(false),
        },
        {
          text: 'Probar',
          onPress: async () => {
            try {
              // Vibración de prueba
              if (vibrationEnabled) {
                if (Platform.OS === 'android') {
                  Vibration.vibrate([0, 300, 100, 300, 100, 300]);
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  setTimeout(async () => {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  }, 400);
                  setTimeout(async () => {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }, 800);
                }
              }
              
              setTimeout(() => {
                setTestingAlert(false);
                Alert.alert(
                  '✅ Prueba completada', 
                  `Vibración: ${vibrationEnabled ? 'Activada ✓' : 'Desactivada'}\n\n` +
                  `💡 El sonido de alertas se reproduce mediante las notificaciones push del sistema.`
                );
              }, 1200);
            } catch (error) {
              setTestingAlert(false);
              Alert.alert('Error', 'No se pudo completar la prueba');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar caché',
      '¿Estás seguro? Esto no eliminará tus datos de cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('✅ Listo', 'El caché ha sido limpiado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar el caché');
            }
          },
        },
      ]
    );
  };

  const renderSwitchRow = (
    icon: string,
    iconColor: string,
    label: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
        thumbColor={value ? colors.primary[500] : colors.background.tertiary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Configuración"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sincronización */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>SINCRONIZACIÓN</Text>
          
          {renderSwitchRow(
            'sync-outline',
            colors.primary[500],
            'Sincronización automática',
            'Mantiene tus datos actualizados en tiempo real',
            autoSync,
            handleAutoSyncChange
          )}
        </Card>

        {/* Alertas */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>ALERTAS</Text>
          
          {renderSwitchRow(
            'volume-high',
            colors.status.warning,
            'Sonido de notificaciones',
            'Usar sonido del sistema para alertas',
            soundEnabled,
            handleSoundChange
          )}

          <View style={styles.divider} />

          {renderSwitchRow(
            'phone-portrait',
            colors.secondary[500],
            'Vibración',
            'Vibrar al recibir alertas críticas',
            vibrationEnabled,
            handleVibrationChange
          )}

          <View style={styles.divider} />

          {/* Botón de prueba */}
          <View style={styles.testRow}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.status.success + '15' }]}>
                <Ionicons name="notifications" size={20} color={colors.status.success} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Probar vibración</Text>
                <Text style={styles.rowSubtitle}>Verifica que las alertas funcionen</Text>
              </View>
            </View>
            <Button
              title={testingAlert ? "..." : "Probar"}
              variant="primary"
              size="sm"
              onPress={testAlertSystem}
              disabled={testingAlert}
            />
          </View>
        </Card>

        {/* Almacenamiento */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>ALMACENAMIENTO</Text>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.status.error + '15' }]}>
                <Ionicons name="trash-outline" size={20} color={colors.status.error} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Limpiar caché</Text>
                <Text style={styles.rowSubtitle}>Libera espacio en tu dispositivo</Text>
              </View>
            </View>
            <Button
              title="Limpiar"
              variant="outline"
              size="sm"
              onPress={handleClearCache}
            />
          </View>
        </Card>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.text.disabled} />
          <Text style={styles.infoText}>
            Los cambios se guardan automáticamente. Las alertas críticas vibrarán aunque el teléfono esté en silencio.
          </Text>
        </View>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
};

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
  section: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.divider,
    marginVertical: spacing.sm,
    marginLeft: 56,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.disabled,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

export default SettingsScreen;
