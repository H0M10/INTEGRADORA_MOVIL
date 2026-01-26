// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Store de Autenticación
// Estado global para manejo de sesión y usuario
// ═══════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { User, LoginForm, RegisterForm } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// INTERFAZ DEL STORE
// ═══════════════════════════════════════════════════════════════════════════

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean; // Nuevo: indica si el usuario necesita onboarding

  // Acciones
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  completeOnboarding: () => Promise<void>; // Nuevo: marcar onboarding como completado
  checkOnboardingStatus: () => Promise<boolean>; // Nuevo: verificar si necesita onboarding
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  needsOnboarding: false,

  // =========================================================================
  // LOGIN - Verifica onboarding basado en BD y AsyncStorage
  // =========================================================================
  login: async (credentials: LoginForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, token } = await authService.login(credentials);
      
      // Primero verificar AsyncStorage local
      let onboardingComplete = await AsyncStorage.getItem(`onboarding_${user.id}`);
      let needsOnboarding = !onboardingComplete;
      
      // Establecer autenticación primero para poder hacer llamadas a API
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        needsOnboarding,
      });
      
      // Si no hay registro local, verificar BD (async, no bloquea UI)
      if (needsOnboarding) {
        setTimeout(async () => {
          try {
            const { api } = await import('../services/api');
            const monitoredResponse = await api.get('/monitored-persons');
            // La estructura es: axios.data = { success, data: [...] }
            const responseData = monitoredResponse.data as { data?: unknown[] } | undefined;
            const hasMonitoredPersons = Array.isArray(responseData?.data) && responseData.data.length > 0;
            
            if (hasMonitoredPersons) {
              await AsyncStorage.setItem(`onboarding_${user.id}`, 'true');
              set({ needsOnboarding: false });
            }
          } catch (e) {
            // Si falla la verificación, mantener needsOnboarding actual
          }
        }, 500);
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al iniciar sesión',
      });
      throw error;
    }
  },

  // =========================================================================
  // REGISTRO - Usuarios nuevos siempre necesitan onboarding
  // =========================================================================
  register: async (userData: RegisterForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, token } = await authService.register(userData);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        needsOnboarding: true, // Usuarios nuevos siempre necesitan onboarding
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al registrarse',
      });
      throw error;
    }
  },

  // =========================================================================
  // LOGOUT
  // =========================================================================
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } catch (error) {
      console.log('Error durante logout:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        needsOnboarding: false,
      });
    }
  },

  // =========================================================================
  // VERIFICAR AUTENTICACIÓN GUARDADA
  // =========================================================================
  checkAuth: async () => {
    set({ isLoading: true });
    
    try {
      const result = await authService.checkStoredAuth();
      
      if (result) {
        // Verificar si necesita onboarding
        const onboardingComplete = await AsyncStorage.getItem(`onboarding_${result.user.id}`);
        const needsOnboarding = !onboardingComplete;
        
        set({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
          needsOnboarding,
        });
      } else {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          needsOnboarding: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        needsOnboarding: false,
      });
    }
  },

  // =========================================================================
  // ACTUALIZAR DATOS DEL USUARIO
  // =========================================================================
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  // =========================================================================
  // ACTUALIZAR PERFIL (async)
  // =========================================================================
  updateProfile: async (userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(userData);
      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      // Si falla el backend, actualizamos localmente
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, ...userData },
          isLoading: false,
        });
      }
      console.error('Error updating profile:', error);
    }
  },

  // =========================================================================
  // LIMPIAR ERROR
  // =========================================================================
  clearError: () => {
    set({ error: null });
  },

  // =========================================================================
  // RECUPERAR CONTRASEÑA
  // =========================================================================
  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await authService.forgotPassword(email);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al enviar email de recuperación',
      });
      throw error;
    }
  },

  // =========================================================================
  // RESETEAR CONTRASEÑA
  // =========================================================================
  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await authService.resetPassword(token, password);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Error al resetear contraseña',
      });
      throw error;
    }
  },

  // =========================================================================
  // COMPLETAR ONBOARDING
  // =========================================================================
  completeOnboarding: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      // Guardar en AsyncStorage que completó el onboarding
      await AsyncStorage.setItem(`onboarding_${user.id}`, 'true');
      set({ needsOnboarding: false });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  // =========================================================================
  // VERIFICAR ESTADO DE ONBOARDING - Verifica BD y AsyncStorage
  // =========================================================================
  checkOnboardingStatus: async (): Promise<boolean> => {
    const user = get().user;
    if (!user) return false;
    
    try {
      // Primero verificar AsyncStorage local
      const onboardingComplete = await AsyncStorage.getItem(`onboarding_${user.id}`);
      
      if (onboardingComplete) {
        set({ needsOnboarding: false });
        return false;
      }
      
      // Si no hay registro local, verificar en la BD si ya tiene datos
      // Esto maneja el caso de reinstalación o cambio de dispositivo
      const { api } = await import('../services/api');
      
      try {
        // Verificar si tiene personas monitoreadas
        const monitoredResponse = await api.get('/monitored-persons');
        // La estructura es: axios.data = { success, data: [...] }
        const responseData = monitoredResponse.data as { data?: unknown[] } | undefined;
        const hasMonitoredPersons = Array.isArray(responseData?.data) && responseData.data.length > 0;
        
        if (hasMonitoredPersons) {
          // Usuario ya tiene datos, marcar onboarding como completado
          await AsyncStorage.setItem(`onboarding_${user.id}`, 'true');
          set({ needsOnboarding: false });
          return false;
        }
      } catch (apiError) {
        console.log('No se pudo verificar personas monitoreadas:', apiError);
      }
      
      // No tiene datos, necesita onboarding
      set({ needsOnboarding: true });
      return true;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
}));

export default useAuthStore;
