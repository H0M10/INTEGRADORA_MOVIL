// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Servicio de Alertas
// Gestión de alertas y notificaciones
// ═══════════════════════════════════════════════════════════════════════════

import { api } from './api';
import { 
  Alert, 
  AlertStats,
  ApiResponse, 
  PaginatedResponse,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface AlertFilters {
  deviceId?: string;
  severity?: 'info' | 'warning' | 'critical';
  isResolved?: boolean;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO DE ALERTAS
// ═══════════════════════════════════════════════════════════════════════════

export const alertService = {
  /**
   * Obtener listado de alertas
   */
  getAlerts: async (filters?: AlertFilters): Promise<{
    alerts: Alert[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    console.log('📋 alertService.getAlerts - Solicitando alertas con filtros:', filters);
    const response = await api.get<ApiResponse<Alert[]>>('/alerts', filters);
    console.log('📋 alertService.getAlerts - Respuesta recibida:', {
      success: response.data.success,
      alertCount: response.data.data?.length || 0,
      firstAlert: response.data.data?.[0]?.title,
    });
    const alerts = response.data.data || [];
    return {
      alerts,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: alerts.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Obtener alertas recientes (últimas 24 horas)
   */
  getRecentAlerts: async (limit: number = 10): Promise<Alert[]> => {
    const response = await api.get<ApiResponse<Alert[]>>('/alerts/recent', { limit });
    return response.data.data;
  },

  /**
   * Obtener detalle de una alerta
   */
  getAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.get<ApiResponse<Alert>>(`/alerts/${alertId}`);
    return response.data.data;
  },

  /**
   * Marcar alerta como atendida
   */
  markAsAttended: async (alertId: string, notes?: string): Promise<Alert> => {
    const response = await api.put<ApiResponse<Alert>>(
      `/alerts/${alertId}/attend`,
      { notes }
    );
    return response.data.data;
  },

  /**
   * Marcar alerta como falsa alarma (usa attend con nota)
   */
  markAsFalseAlarm: async (alertId: string, notes?: string): Promise<Alert> => {
    const response = await api.put<ApiResponse<Alert>>(
      `/alerts/${alertId}/attend`,
      { notes: `FALSA ALARMA: ${notes || 'Marcada como falsa alarma'}` }
    );
    return response.data.data;
  },

  /**
   * Obtener estadísticas de alertas
   */
  getStats: async (params?: {
    deviceId?: string;
    period?: 'day' | 'week' | 'month';
  }): Promise<AlertStats> => {
    const response = await api.get<ApiResponse<AlertStats>>('/alerts/stats', params);
    return response.data.data;
  },

  /**
   * Marcar alerta como leída
   */
  markAsRead: async (alertId: string): Promise<void> => {
    await api.put<ApiResponse<null>>(`/alerts/${alertId}/read`);
  },

  /**
   * Obtener conteo de alertas pendientes (usa unread)
   */
  getPendingCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<Alert[]>>('/alerts/unread');
    return response.data.data?.length || 0;
  },

  /**
   * Obtener conteo de alertas no leídas
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<Alert[]>>('/alerts/unread');
    return response.data.data?.length || 0;
  },

  /**
   * Obtener alertas por dispositivo (usa filtro en /alerts)
   */
  getAlertsByDevice: async (
    deviceId: string,
    params?: {
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Alert[]> => {
    const response = await api.get<ApiResponse<Alert[]>>(
      `/alerts`,
      { ...params, deviceId }
    );
    return response.data.data;
  },

  /**
   * Obtener alertas críticas no atendidas
   */
  getCriticalUnattended: async (): Promise<Alert[]> => {
    const response = await api.get<ApiResponse<Alert[]>>('/alerts/unread');
    // Filtrar solo las críticas en el cliente
    const alerts = response.data.data || [];
    return alerts.filter((a: Alert) => a.severity === 'critical');
  },

  /**
   * Resolver/cerrar una alerta (usa attend)
   */
  resolveAlert: async (alertId: string, notes?: string): Promise<Alert> => {
    const response = await api.put<ApiResponse<Alert>>(
      `/alerts/${alertId}/attend`,
      { notes: notes || 'Alerta resuelta' }
    );
    return response.data.data;
  },
};

export default alertService;
