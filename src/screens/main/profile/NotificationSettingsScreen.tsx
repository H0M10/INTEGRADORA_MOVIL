// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Configuración de Notificaciones
// Preferencias de alertas y notificaciones - FUNCIONAL
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { Header, Card } from '../../../components/ui';

type NotificationSettingsScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'NotificationSettings'>;
};

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    criticalAlerts: true,
    normalAlerts: true,
    deviceStatus: true,
    dailySummary: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const renderSwitchRow = (
    icon: string,
    iconColor: string,
    label: string,
    subtitle: string,
    settingKey: keyof typeof settings
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
        value={settings[settingKey]}
        onValueChange={(value) => updateSetting(settingKey, value)}
        trackColor={{ false: colors.ui.border, true: colors.primary[400] }}
        thumbColor={settings[settingKey] ? colors.primary[500] : colors.background.tertiary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Notificaciones"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          
          {renderSwitchRow(
            'notifications',
            colors.primary[500],
            'Notificaciones push',
            'Recibir notificaciones en tu dispositivo',
            'pushEnabled'
          )}
        </Card>

        {/* Tipos de alerta */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>TIPOS DE ALERTA</Text>
          
          {renderSwitchRow(
            'alert-circle',
            colors.status.error,
            'Alertas críticas',
            'Caídas, SOS, oxígeno bajo',
            'criticalAlerts'
          )}

          <View style={styles.divider} />

          {renderSwitchRow(
            'warning',
            colors.status.warning,
            'Alertas normales',
            'Signos vitales fuera de rango',
            'normalAlerts'
          )}

          <View style={styles.divider} />

          {renderSwitchRow(
            'wifi',
            colors.status.info,
            'Estado del dispositivo',
            'Conexión WiFi/Red, batería baja',
            'deviceStatus'
          )}
        </Card>

        {/* Resúmenes */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>RESÚMENES</Text>
          
          {renderSwitchRow(
            'calendar',
            colors.secondary[500],
            'Resumen diario',
            'Recibe un resumen cada mañana',
            'dailySummary'
          )}
        </Card>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={18} color={colors.text.disabled} />
          <Text style={styles.infoText}>
            Las alertas críticas siempre sonarán aunque tu teléfono esté en silencio
          </Text>
        </View>

        <View style={{ height: spacing.xxl }} />
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

export default NotificationSettingsScreen;
