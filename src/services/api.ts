// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Cliente API (Axios)
// Configuración centralizada de peticiones HTTP
// ═══════════════════════════════════════════════════════════════════════════

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// INTERCEPTOR DE REQUEST
// Agrega el token de autenticación a cada petición
// ═══════════════════════════════════════════════════════════════════════════

apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
      
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error obteniendo token:', error);
    }

    // Log para debugging
    if (config.DEBUG) {
      console.log(`🚀 API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }

    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// INTERCEPTOR DE RESPONSE
// Maneja respuestas y errores globalmente
// ═══════════════════════════════════════════════════════════════════════════

apiClient.interceptors.response.use(
  (response) => {
    // Log para debugging
    if (config.DEBUG) {
      console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log del error
    if (config.DEBUG) {
      console.error(`❌ API Error: ${originalRequest?.url} - Status: ${error.response?.status}`);
      console.error('Error data:', error.response?.data);
    }

    // Si es error 401 (no autorizado) intentar refrescar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          // Intentar refrescar el token
          const response = await axios.post(`${config.API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

          // Guardar nuevos tokens
          await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, newToken);
          await SecureStore.setItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          // Reintentar la petición original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y forzar logout
        await SecureStore.deleteItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN);
        
        // Aquí podrías emitir un evento para forzar logout en la app
        // EventEmitter.emit('FORCE_LOGOUT');
      }
    }

    // Formatear error para manejo consistente
    const formattedError = {
      message: getErrorMessage(error),
      status: error.response?.status,
      code: (error.response?.data as any)?.code,
      errors: (error.response?.data as any)?.errors,
    };

    return Promise.reject(formattedError);
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Obtener mensaje de error legible
// ═══════════════════════════════════════════════════════════════════════════

function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }

  if (error.message === 'Network Error') {
    return 'Error de conexión. Verifica tu conexión a internet.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'La conexión tardó demasiado. Intenta de nuevo.';
  }

  switch (error.response?.status) {
    case 400:
      return 'Datos inválidos. Verifica la información ingresada.';
    case 401:
      return 'Sesión expirada. Por favor inicia sesión nuevamente.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 422:
      return 'Los datos enviados no son válidos.';
    case 429:
      return 'Demasiadas solicitudes. Espera un momento.';
    case 500:
      return 'Error del servidor. Intenta más tarde.';
    case 502:
    case 503:
      return 'Servicio no disponible. Intenta más tarde.';
    default:
      return 'Ocurrió un error inesperado.';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MÉTODOS HTTP SIMPLIFICADOS
// ═══════════════════════════════════════════════════════════════════════════

export const api = {
  get: <T>(url: string, params?: object) => 
    apiClient.get<T>(url, { params }),
  
  post: <T>(url: string, data?: object) => 
    apiClient.post<T>(url, data),
  
  put: <T>(url: string, data?: object) => 
    apiClient.put<T>(url, data),
  
  patch: <T>(url: string, data?: object) => 
    apiClient.patch<T>(url, data),
  
  delete: <T>(url: string) => 
    apiClient.delete<T>(url),
};

export default apiClient;
