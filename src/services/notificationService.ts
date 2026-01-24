// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Servicio de Notificaciones
// Gestión de notificaciones push
// ═══════════════════════════════════════════════════════════════════════════

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authService } from './authService';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO DE NOTIFICACIONES
// ═══════════════════════════════════════════════════════════════════════════

export const notificationService = {
  /**
   * Registrar para notificaciones push
   */
  registerForPushNotifications: async (): Promise<string | null> => {
    let token: string | null = null;

    // Solo funciona en dispositivos físicos
    if (!Device.isDevice) {
      console.log('Las notificaciones push requieren un dispositivo físico');
      return null;
    }

    // Verificar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Solicitar permisos si no los tenemos
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se obtuvieron permisos para notificaciones push');
      return null;
    }

    // Obtener token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Reemplazar con tu project ID de Expo
      });
      token = tokenData.data;

      // Registrar token en el servidor
      await authService.registerPushToken(token);
    } catch (error) {
      console.error('Error obteniendo push token:', error);
    }

    // Configuración específica para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Alertas',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF4444',
        sound: 'alert.wav',
      });

      await Notifications.setNotificationChannelAsync('general', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    return token;
  },

  /**
   * Programar notificación local
   */
  scheduleLocalNotification: async (
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> => {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = inmediato
    });
  },

  /**
   * Mostrar notificación de alerta crítica
   */
  showCriticalAlert: async (
    title: string,
    body: string,
    alertId: string
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚨 ${title}`,
        body,
        data: { alertId, type: 'critical' },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'critical_alert',
      },
      trigger: null,
    });
  },

  /**
   * Cancelar todas las notificaciones programadas
   */
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Cancelar notificación específica
   */
  cancelNotification: async (notificationId: string): Promise<void> => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Obtener todas las notificaciones programadas
   */
  getScheduledNotifications: async (): Promise<Notifications.NotificationRequest[]> => {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Limpiar badge (número en el icono de la app)
   */
  clearBadge: async (): Promise<void> => {
    await Notifications.setBadgeCountAsync(0);
  },

  /**
   * Establecer badge
   */
  setBadge: async (count: number): Promise<void> => {
    await Notifications.setBadgeCountAsync(count);
  },

  /**
   * Agregar listener para notificaciones recibidas
   */
  addNotificationReceivedListener: (
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Agregar listener para cuando el usuario interactúa con la notificación
   */
  addNotificationResponseListener: (
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Obtener última notificación que abrió la app
   */
  getLastNotificationResponse: async (): Promise<Notifications.NotificationResponse | null> => {
    return await Notifications.getLastNotificationResponseAsync();
  },
};

export default notificationService;
