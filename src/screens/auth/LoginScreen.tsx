// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Login
// Inicio de sesión con email y contraseña
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Button, Input, Card } from '../../components/ui';
import { useAuthStore } from '../../stores';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error } = useAuthStore();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validación
  const validateForm = (): boolean => {
    let isValid = true;

    // Validar email
    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // Handler de login
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
      // La navegación se maneja automáticamente por RootNavigator
    } catch (err: any) {
      Alert.alert(
        'Error de inicio de sesión',
        err.message || 'Verifica tus credenciales e intenta de nuevo'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header con gradiente */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        {/* Botón atrás */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text.inverse} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Ionicons name="shield-checkmark" size={36} color={colors.text.inverse} />
          </View>
          <Text style={styles.logoText}>NovaGuardian</Text>
        </View>
      </LinearGradient>

      {/* Formulario */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>
            Ingresa tus credenciales para continuar
          </Text>

          {/* Campo de email */}
          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            error={emailError}
          />

          {/* Campo de contraseña */}
          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            leftIcon="lock-closed-outline"
            error={passwordError}
          />

          {/* Olvidé mi contraseña */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Error general */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón de login */}
          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            fullWidth
            gradient
            style={styles.loginButton}
          />
        </Card>

        {/* Link a registro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoText: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  formCard: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  registerLink: {
    ...typography.bodyBold,
    color: colors.primary[500],
  },
});

export default LoginScreen;
