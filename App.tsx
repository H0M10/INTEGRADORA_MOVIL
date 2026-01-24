// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Sistema de Monitoreo Geriátrico IoT
// Archivo principal de la aplicación
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Navegación
import { RootNavigator } from './src/navigation';

// Stores
import { useAuthStore } from './src/stores';

// Tema
import { colors } from './src/theme/colors';

// Ignorar warnings específicos
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Prevenir que el splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Cargar fuentes
        await Font.loadAsync({
          ...Ionicons.font,
        });
        
        // Verificar autenticación guardada
        await checkAuth();
        
        // Pequeño delay para splash
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Error durante la inicialización:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
