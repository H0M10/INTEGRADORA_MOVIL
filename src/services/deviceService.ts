// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Servicio de Dispositivos
// Gestión de dispositivos IoT y vinculación
// ═══════════════════════════════════════════════════════════════════════════

import { api } from './api';
import { 
  Device, 
  ApiResponse, 
  PaginatedResponse,
  LinkDeviceForm,
  VitalSigns,
  Location,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO DE DISPOSITIVOS
// ═══════════════════════════════════════════════════════════════════════════

export const deviceService = {
  /**
   * Obtener todos los dispositivos del usuario
   */
  getMyDevices: async (): Promise<Device[]> => {
    const response = await api.get<ApiResponse<Device[]>>('/devices');
    return response.data.data;
  },

  /**
   * Obtener detalle de un dispositivo
   */
  getDevice: async (deviceId: string): Promise<Device> => {
    const response = await api.get<ApiResponse<Device>>(`/devices/${deviceId}`);
    return response.data.data;
  },

  /**
   * Vincular dispositivo con código
   */
  linkDevice: async (data: LinkDeviceForm): Promise<Device> => {
    const response = await api.post<ApiResponse<Device>>('/devices/link', data);
    return response.data.data;
  },

  /**
   * Desvincular dispositivo
   */
  unlinkDevice: async (deviceId: string): Promise<void> => {
    await api.post(`/devices/${deviceId}/unlink`);
  },

  /**
   * Obtener estado actual del dispositivo
   */
  getDeviceStatus: async (deviceId: string): Promise<{
    isConnected: boolean;
    batteryLevel: number;
    lastSeen: string | null;
  }> => {
    const response = await api.get<ApiResponse<{
      isConnected: boolean;
      batteryLevel: number;
      lastSeen: string | null;
    }>>(`/devices/${deviceId}/status`);
    return response.data.data;
  },

  /**
   * Obtener signos vitales actuales
   */
  getCurrentVitals: async (deviceId: string): Promise<VitalSigns | null> => {
    console.log('💓 deviceService.getCurrentVitals - Solicitando vitales para dispositivo:', deviceId);
    const response = await api.get<ApiResponse<VitalSigns | null>>(
      `/vital-signs/device/${deviceId}/current`
    );
    console.log('💓 deviceService.getCurrentVitals - Respuesta:', {
      success: response.data.success,
      hasData: !!response.data.data,
      heartRate: response.data.data?.heartRate,
      oxygenLevel: response.data.data?.oxygenLevel,
    });
    return response.data.data;
  },

  /**
   * Obtener historial de signos vitales
   */
  getVitalsHistory: async (
    deviceId: string, 
    params?: {
      period?: 'day' | 'week' | 'month';
      startDate?: string;
      endDate?: string;
      type?: 'heartRate' | 'spo2' | 'temperature' | 'bloodPressure' | 'steps';
    }
  ): Promise<VitalSigns[]> => {
    const response = await api.get<ApiResponse<VitalSigns[]>>(
      `/vital-signs/device/${deviceId}/history`,
      params
    );
    return response.data.data;
  },

  /**
   * Obtener ubicación actual
   */
  getCurrentLocation: async (deviceId: string): Promise<Location | null> => {
    const response = await api.get<ApiResponse<Location | null>>(
      `/locations/device/${deviceId}/current`
    );
    return response.data.data;
  },

  /**
   * Obtener historial de ubicaciones
   */
  getLocationHistory: async (
    deviceId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<Location[]> => {
    const response = await api.get<ApiResponse<Location[]>>(
      `/locations/device/${deviceId}/history`,
      params
    );
    return response.data.data;
  },

  /**
   * Asignar dispositivo a persona monitoreada
   */
  assignToMonitored: async (
    deviceId: string, 
    monitoredId: string
  ): Promise<void> => {
    await api.post(`/devices/${deviceId}/assign`, { monitoredId });
  },

  /**
   * Verificar código de dispositivo
   */
  verifyCode: async (code: string): Promise<{
    valid: boolean;
    device?: {
      serialNumber: string;
      model: string;
    };
  }> => {
    const response = await api.get<ApiResponse<{
      valid: boolean;
      device?: {
        serialNumber: string;
        model: string;
      };
    }>>(`/devices/code/${code}`);
    return response.data.data;
  },
};

export default deviceService;
