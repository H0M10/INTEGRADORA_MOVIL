// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Olvidé mi Contraseña
// Recuperación de contraseña por email
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

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { forgotPassword } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validación
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handler de recuperación
  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setIsSuccess(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar el correo. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={[styles.successContainer, { paddingTop: insets.top }]}
        >
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={64} color={colors.text.inverse} />
            </View>
            <Text style={styles.successTitle}>¡Correo enviado!</Text>
            <Text style={styles.successMessage}>
              Hemos enviado un enlace de recuperación a{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </Text>
            
            <Button
              title="Volver al inicio de sesión"
              onPress={() => navigation.navigate('Login')}
              size="lg"
              fullWidth
              style={styles.successButton}
            />
            
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => setIsSuccess(false)}
            >
              <Text style={styles.resendText}>
                ¿No recibiste el correo? Intenta de nuevo
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

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

        {/* Icono */}
        <View style={styles.headerIcon}>
          <Ionicons name="key-outline" size={48} color={colors.text.inverse} />
        </View>

        <Text style={styles.headerTitle}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.headerSubtitle}>
          No te preocupes, te ayudamos a recuperarla
        </Text>
      </LinearGradient>

      {/* Formulario */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.formCard}>
          <Text style={styles.instructions}>
            Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
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

          {/* Botón de enviar */}
          <Button
            title="Enviar enlace de recuperación"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            fullWidth
            gradient
            style={styles.submitButton}
          />
        </Card>

        {/* Ayuda adicional */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
          </Text>
        </View>

        {/* Volver a login */}
        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary[500]} />
          <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
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
  headerIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.inverse,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  instructions: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  helpContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  helpText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  backToLoginText: {
    ...typography.bodyBold,
    color: colors.primary[500],
    marginLeft: spacing.sm,
  },
  // Estilos de éxito
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.h1,
    color: colors.text.inverse,
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successEmail: {
    fontWeight: '700',
  },
  successHint: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  successButton: {
    backgroundColor: colors.text.inverse,
    marginBottom: spacing.lg,
  },
  resendButton: {
    padding: spacing.md,
  },
  resendText: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
