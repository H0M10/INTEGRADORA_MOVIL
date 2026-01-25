// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Servicio de Autenticación
// Manejo de login, registro, tokens y sesión
// ═══════════════════════════════════════════════════════════════════════════

import { api } from './api';
import * as SecureStore from 'expo-secure-store';
import { config } from '../config';
import { 
  User, 
  ApiResponse, 
  LoginForm, 
  RegisterForm 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface TokenResponse {
  token: string;
  refreshToken: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICIO DE AUTENTICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginForm): Promise<AuthResponse> => {
    const response = await api.post<any>(
      '/auth/login',
      credentials
    );
    
    console.log('📱 Login response:', JSON.stringify(response.data, null, 2));
    
    // La respuesta viene directamente como { accessToken, refreshToken, user, ... }
    const responseData = response.data;
    
    // Extraer datos - puede venir con wrapper {success, data} o directo
    const data = responseData.data || responseData;
    
    // El token puede venir como 'token' o 'accessToken'
    const token = data.token || data.accessToken;
    const refreshToken = data.refreshToken;
    const user = data.user;
    
    if (!token) {
      console.error('❌ Token no encontrado en respuesta:', data);
      throw new Error('Token no recibido del servidor');
    }
    
    // Guardar tokens de forma segura
    await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, token);
    await SecureStore.setItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    // Retornar en formato esperado por la app
    return {
      user,
      token,
      refreshToken
    };
  },

  /**
   * Registrar nuevo usuario
   */
  register: async (userData: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post<any>(
      '/auth/register',
      userData
    );
    
    // La respuesta viene directamente como { accessToken, refreshToken, user, ... }
    const responseData = response.data;
    const data = responseData.data || responseData;
    
    const token = data.token || data.accessToken;
    const refreshToken = data.refreshToken;
    const user = data.user;
    
    // Guardar tokens de forma segura
    await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, token);
    await SecureStore.setItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    return { user, token, refreshToken };
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    try {
      // Notificar al servidor (opcional, para invalidar token)
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Error al notificar logout:', error);
    } finally {
      // Limpiar almacenamiento local
      await SecureStore.deleteItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(config.STORAGE_KEYS.USER_DATA);
    }
  },

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  /**
   * Resetear contraseña con token
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },

  /**
   * Verificar email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  /**
   * Reenviar email de verificación
   */
  resendVerification: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  /**
   * Refrescar token de acceso
   */
  refreshToken: async (): Promise<TokenResponse> => {
    const refreshToken = await SecureStore.getItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<ApiResponse<TokenResponse>>(
      '/auth/refresh',
      { refreshToken }
    );
    
    const { data } = response.data;
    
    // Actualizar tokens
    await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, data.token);
    await SecureStore.setItemAsync(config.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    
    return data;
  },

  /**
   * Verificar si hay sesión guardada
   */
  checkStoredAuth: async (): Promise<{ user: User; token: string } | null> => {
    try {
      const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
      const userData = await SecureStore.getItemAsync(config.STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        
        // Verificar que el token siga siendo válido
        try {
          const response = await api.get<ApiResponse<User>>('/users/me');
          return { user: response.data.data, token };
        } catch {
          // Token inválido, intentar refrescar
          try {
            await authService.refreshToken();
            const newToken = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
            if (newToken) {
              const meResponse = await api.get<ApiResponse<User>>('/users/me');
              return { user: meResponse.data.data, token: newToken };
            }
          } catch {
            // No se pudo refrescar, limpiar sesión
            await authService.logout();
            return null;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking stored auth:', error);
      return null;
    }
  },

  /**
   * Obtener token actual
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Actualizar perfil de usuario
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/me', userData);
    const updatedUser = response.data.data;
    
    // Actualizar datos guardados localmente
    await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  /**
   * Registrar token de notificaciones push
   */
  registerPushToken: async (pushToken: string): Promise<void> => {
    await api.post('/notifications/push-token', { pushToken });
  },
};

export default authService;
