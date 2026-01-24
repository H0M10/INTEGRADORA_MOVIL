// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Store de Alertas
// Estado global para alertas y notificaciones
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { alertService } from '../services/alertService';
import { Alert, AlertStats } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFAZ DEL STORE
// ═══════════════════════════════════════════════════════════════════════════

interface AlertState {
  // Estado
  alerts: Alert[];
  recentAlerts: Alert[];
  selectedAlert: Alert | null;
  stats: AlertStats | null;
  pendingCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Acciones
  fetchAlerts: (page?: number) => Promise<void>;
  fetchRecentAlerts: () => Promise<void>;
  fetchAlertById: (alertId: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAlertStats: () => Promise<void>; // Alias para fetchStats
  fetchPendingCount: () => Promise<void>;
  markAsAttended: (alertId: string, notes?: string) => Promise<void>;
  markAsFalseAlarm: (alertId: string, notes?: string) => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  selectAlert: (alert: Alert | null) => void;
  refreshAlerts: () => Promise<void>;
  clearError: () => void;
  addNewAlert: (alert: Alert) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAlertStore = create<AlertState>((set, get) => ({
  // Estado inicial
  alerts: [],
  recentAlerts: [],
  selectedAlert: null,
  stats: null,
  pendingCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  // =========================================================================
  // OBTENER ALERTAS
  // =========================================================================
  fetchAlerts: async (page: number = 1) => {
    set({ isLoading: page === 1, error: null });
    
    try {
      const { alerts, pagination } = await alertService.getAlerts({
        page,
        limit: 20,
      });
      
      set(state => ({
        alerts: page === 1 ? alerts : [...state.alerts, ...alerts],
        pagination,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al obtener alertas',
      });
    }
  },

  // =========================================================================
  // OBTENER ALERTAS RECIENTES
  // =========================================================================
  fetchRecentAlerts: async () => {
    try {
      const alerts = await alertService.getRecentAlerts(5);
      set({ recentAlerts: alerts });
    } catch (error: any) {
      console.error('Error obteniendo alertas recientes:', error);
    }
  },

  // =========================================================================
  // OBTENER ALERTA POR ID
  // =========================================================================
  fetchAlertById: async (alertId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const alert = await alertService.getAlert(alertId);
      set({ selectedAlert: alert, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al obtener la alerta',
      });
    }
  },

  // =========================================================================
  // OBTENER ESTADÍSTICAS
  // =========================================================================
  fetchStats: async () => {
    try {
      const stats = await alertService.getStats();
      set({ stats });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
    }
  },

  // Alias para fetchStats
  fetchAlertStats: async () => {
    return get().fetchStats();
  },

  // =========================================================================
  // OBTENER CONTEO DE PENDIENTES
  // =========================================================================
  fetchPendingCount: async () => {
    try {
      const count = await alertService.getPendingCount();
      set({ pendingCount: count });
    } catch (error: any) {
      console.error('Error obteniendo conteo de pendientes:', error);
    }
  },

  // =========================================================================
  // MARCAR COMO ATENDIDA
  // =========================================================================
  markAsAttended: async (alertId: string, notes?: string) => {
    try {
      const updatedAlert = await alertService.markAsAttended(alertId, notes);
      
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? updatedAlert : a
        ),
        recentAlerts: state.recentAlerts.map(a => 
          a.id === alertId ? updatedAlert : a
        ),
        selectedAlert: state.selectedAlert?.id === alertId 
          ? updatedAlert 
          : state.selectedAlert,
        pendingCount: Math.max(0, state.pendingCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Error al marcar como atendida' });
      throw error;
    }
  },

  // =========================================================================
  // MARCAR COMO FALSA ALARMA
  // =========================================================================
  markAsFalseAlarm: async (alertId: string, notes?: string) => {
    try {
      const updatedAlert = await alertService.markAsFalseAlarm(alertId, notes);
      
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? updatedAlert : a
        ),
        recentAlerts: state.recentAlerts.map(a => 
          a.id === alertId ? updatedAlert : a
        ),
        selectedAlert: state.selectedAlert?.id === alertId 
          ? updatedAlert 
          : state.selectedAlert,
        pendingCount: Math.max(0, state.pendingCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Error al marcar como falsa alarma' });
      throw error;
    }
  },

  // =========================================================================
  // MARCAR COMO LEÍDA
  // =========================================================================
  markAsRead: async (alertId: string) => {
    try {
      // Verificar si ya está leída para no hacer nada
      const alert = get().alerts.find(a => a.id === alertId);
      if (alert?.isRead) {
        return; // Ya está leída, no hacer nada
      }
      
      // Optimistic update inmediato para UX fluida
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? { ...a, isRead: true } : a
        ),
        recentAlerts: state.recentAlerts.map(a => 
          a.id === alertId ? { ...a, isRead: true } : a
        ),
        selectedAlert: state.selectedAlert?.id === alertId 
          ? { ...state.selectedAlert, isRead: true } 
          : state.selectedAlert,
        pendingCount: Math.max(0, state.pendingCount - 1),
        stats: state.stats ? {
          ...state.stats,
          unread: Math.max(0, state.stats.unread - 1),
        } : null,
      }));
      
      // Llamar al servicio para persistir en BD
      await alertService.markAsRead(alertId);
      
      // Recargar stats para tener datos correctos
      get().fetchStats();
      get().fetchPendingCount();
      
    } catch (error: any) {
      console.error('Error al marcar como leída:', error);
      // Revertir en caso de error - recargar todo
      get().fetchAlerts();
      get().fetchPendingCount();
      get().fetchStats();
    }
  },

  // =========================================================================
  // DESCARTAR ALERTA
  // =========================================================================
  dismissAlert: async (alertId: string) => {
    try {
      // Optimistic update
      set(state => ({
        alerts: state.alerts.map(a => 
          a.id === alertId ? { ...a, isDismissed: true } : a
        ),
        recentAlerts: state.recentAlerts.filter(a => a.id !== alertId),
        pendingCount: Math.max(0, state.pendingCount - 1),
      }));
      
      // En producción, llamar al servicio
      // await alertService.dismissAlert(alertId);
    } catch (error: any) {
      console.error('Error al descartar alerta:', error);
    }
  },

  // =========================================================================
  // SELECCIONAR ALERTA
  // =========================================================================
  selectAlert: (alert: Alert | null) => {
    set({ selectedAlert: alert });
  },

  // =========================================================================
  // REFRESCAR ALERTAS
  // =========================================================================
  refreshAlerts: async () => {
    set({ isRefreshing: true });
    
    try {
      await Promise.all([
        get().fetchAlerts(1),
        get().fetchRecentAlerts(),
        get().fetchPendingCount(),
      ]);
    } finally {
      set({ isRefreshing: false });
    }
  },

  // =========================================================================
  // LIMPIAR ERROR
  // =========================================================================
  clearError: () => {
    set({ error: null });
  },

  // =========================================================================
  // AGREGAR NUEVA ALERTA (para WebSocket/Push)
  // =========================================================================
  addNewAlert: (alert: Alert) => {
    set(state => ({
      alerts: [alert, ...state.alerts],
      recentAlerts: [alert, ...state.recentAlerts.slice(0, 4)],
      pendingCount: state.pendingCount + 1,
    }));
  },
}));

export default useAlertStore;
