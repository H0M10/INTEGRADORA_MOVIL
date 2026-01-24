// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Store de Dispositivos
// Estado global para dispositivos y signos vitales
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { deviceService } from '../services/deviceService';
import { Device, VitalSigns, Location } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

interface LinkDeviceData {
  deviceCode: string;
  monitoredPerson: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    bloodType?: string;
    phone?: string;
  };
  relationship: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFAZ DEL STORE
// ═══════════════════════════════════════════════════════════════════════════

interface DeviceState {
  // Estado
  devices: Device[];
  selectedDevice: Device | null;
  currentVitals: VitalSigns | null;
  currentLocation: Location | null;
  currentLocations: Record<string, Location>;   // Ubicaciones actuales indexadas por deviceId
  vitalsHistory: VitalSigns[];
  locationHistory: Location[];
  locations: Record<string, Location[]>;        // Historial de ubicaciones indexado por deviceId
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Acciones
  fetchDevices: () => Promise<void>;
  selectDevice: (device: Device | null) => void;
  linkDevice: (data: LinkDeviceData) => Promise<Device>;
  unlinkDevice: (deviceId: string) => Promise<void>;
  fetchVitals: (deviceId?: string) => Promise<void>;
  fetchCurrentVitals: (deviceId: string) => Promise<void>;
  fetchCurrentLocation: (deviceId: string) => Promise<void>;
  fetchLocations: (deviceId?: string) => Promise<void>;
  fetchVitalsHistory: (deviceId: string, period?: 'day' | 'week' | 'month') => Promise<void>;
  fetchLocationHistory: (deviceId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useDeviceStore = create<DeviceState>((set, get) => ({
  // Estado inicial
  devices: [],
  selectedDevice: null,
  currentVitals: null,
  currentLocation: null,
  currentLocations: {},
  vitalsHistory: [],
  locationHistory: [],
  locations: {},
  isLoading: false,
  isRefreshing: false,
  error: null,

  // =========================================================================
  // OBTENER DISPOSITIVOS
  // =========================================================================
  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const devices = await deviceService.getMyDevices();
      
      set({ devices, isLoading: false });
      
      // Si hay dispositivos y ninguno está seleccionado, seleccionar el primero
      const { selectedDevice } = get();
      if (devices.length > 0 && !selectedDevice) {
        set({ selectedDevice: devices[0] });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al obtener dispositivos',
      });
    }
  },

  // =========================================================================
  // SELECCIONAR DISPOSITIVO
  // =========================================================================
  selectDevice: (device: Device | null) => {
    set({ 
      selectedDevice: device,
      currentVitals: null,
      currentLocation: null,
      vitalsHistory: [],
      locationHistory: [],
    });
  },

  // =========================================================================
  // VINCULAR DISPOSITIVO
  // =========================================================================
  linkDevice: async (data: LinkDeviceData) => {
    set({ isLoading: true, error: null });
    
    try {
      const device = await deviceService.linkDevice({ 
        code: data.deviceCode,
        monitoredPerson: data.monitoredPerson,
        relationship: data.relationship,
      });
      
      set(state => ({
        devices: [...state.devices, device],
        selectedDevice: device,
        isLoading: false,
      }));
      
      return device;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al vincular dispositivo',
      });
      throw error;
    }
  },

  // =========================================================================
  // DESVINCULAR DISPOSITIVO
  // =========================================================================
  unlinkDevice: async (deviceId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await deviceService.unlinkDevice(deviceId);
      
      set(state => {
        const devices = state.devices.filter(d => d.id !== deviceId);
        const selectedDevice = state.selectedDevice?.id === deviceId 
          ? (devices[0] || null) 
          : state.selectedDevice;
        
        return {
          devices,
          selectedDevice,
          isLoading: false,
        };
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al desvincular dispositivo',
      });
      throw error;
    }
  },

  // =========================================================================
  // OBTENER SIGNOS VITALES ACTUALES
  // =========================================================================
  fetchCurrentVitals: async (deviceId: string) => {
    try {
      const vitals = await deviceService.getCurrentVitals(deviceId);
      set({ currentVitals: vitals, error: null });
    } catch (error: any) {
      console.error('Error obteniendo signos vitales:', error);
      // Mostrar error real en lugar de datos simulados
      set({ 
        currentVitals: null,
        error: error.message || 'Error al obtener signos vitales del dispositivo. Verifica la conexión.'
      });
    }
  },

  // Alias para fetchCurrentVitals
  fetchVitals: async (deviceId?: string) => {
    const { selectedDevice, fetchCurrentVitals } = get();
    const id = deviceId || selectedDevice?.id;
    if (id) {
      await fetchCurrentVitals(id);
    }
  },

  // =========================================================================
  // OBTENER UBICACIÓN ACTUAL
  // =========================================================================
  fetchCurrentLocation: async (deviceId: string) => {
    try {
      const location = await deviceService.getCurrentLocation(deviceId);
      set({ currentLocation: location, error: null });
    } catch (error: any) {
      console.error('Error obteniendo ubicación:', error);
      // Mostrar error real en lugar de ubicación simulada
      set({ 
        currentLocation: null,
        error: error.message || 'Error al obtener ubicación del dispositivo. Verifica la conexión.'
      });
    }
  },

  // =========================================================================
  // OBTENER HISTORIAL DE SIGNOS VITALES
  // =========================================================================
  fetchVitalsHistory: async (deviceId: string, period: 'day' | 'week' | 'month' = 'day') => {
    try {
      const history = await deviceService.getVitalsHistory(deviceId, { period });
      set({ vitalsHistory: history });
    } catch (error: any) {
      console.error('Error obteniendo historial de vitales:', error);
    }
  },

  // =========================================================================
  // OBTENER HISTORIAL DE UBICACIONES
  // =========================================================================
  fetchLocationHistory: async (deviceId: string) => {
    try {
      const history = await deviceService.getLocationHistory(deviceId);
      set(state => ({ 
        locationHistory: history, 
        locations: { ...state.locations, [deviceId]: history } 
      }));
    } catch (error: any) {
      console.error('Error obteniendo historial de ubicaciones:', error);
    }
  },

  // =========================================================================
  // OBTENER UBICACIONES ACTUALES DE TODOS LOS DISPOSITIVOS
  // =========================================================================
  fetchLocations: async (deviceId?: string) => {
    try {
      const { devices } = get();
      
      if (deviceId) {
        // Obtener ubicación de un solo dispositivo
        const location = await deviceService.getCurrentLocation(deviceId);
        if (location) {
          set(state => ({
            currentLocations: { ...state.currentLocations, [deviceId]: location }
          }));
        }
      } else {
        // Obtener ubicaciones de todos los dispositivos
        const newLocations: Record<string, Location> = {};
        
        for (const device of devices) {
          try {
            const location = await deviceService.getCurrentLocation(device.id);
            if (location) {
              newLocations[device.id] = location;
            }
          } catch (error) {
            // Continuar con el siguiente dispositivo
          }
        }
        
        set({ currentLocations: newLocations });
      }
    } catch (error: any) {
      console.error('Error obteniendo ubicaciones:', error);
    }
  },

  // =========================================================================
  // REFRESCAR TODOS LOS DATOS
  // =========================================================================
  refreshData: async () => {
    const { selectedDevice } = get();
    
    if (!selectedDevice) return;
    
    set({ isRefreshing: true });
    
    try {
      await Promise.all([
        get().fetchCurrentVitals(selectedDevice.id),
        get().fetchCurrentLocation(selectedDevice.id),
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
}));

export default useDeviceStore;
