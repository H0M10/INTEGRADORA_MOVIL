// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Olvidé mi Contraseña
// Recuperación de contraseña por email y restablecimiento
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
  const { forgotPassword, resetPassword } = useAuthStore();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Validación de email
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

  // Validación de código y contraseña
  const validateStep2 = (): boolean => {
    let isValid = true;
    if (!code || code.length !== 6) {
      setCodeError('El código debe tener 6 dígitos');
      isValid = false;
    } else {
      setCodeError('');
    }

    if (!newPassword) {
      setPasswordError('La nueva contraseña es requerida');
      isValid = false;
    } else if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordError('Incluye mayúsculas, minúsculas y números');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // Enviar email
  const handleSendEmail = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const result = await forgotPassword(email.trim().toLowerCase());
      setStep(2);
      setAttempts(0);
      
      // En desarrollo: mostrar el código si el email no se envió 
      if (result?.devCode) {
        setTimeout(() => {
          Alert.alert(
            '🔑 Código de desarrollo',
            `Tu código de recuperación es:\n\n${result.devCode}\n\n(El servidor SMTP no está configurado, se muestra aquí para pruebas)`,
            [{ text: 'OK' }]
          );
        }, 500);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar el correo. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear contraseña
  const handleResetPassword = async () => {
    if (!validateStep2()) return;

    if (attempts >= 3) {
      Alert.alert('Acceso bloqueado', 'Has excedido el número de intentos permitidos.');
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(code, newPassword);
      setStep(3);
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      Alert.alert(
        'Error al restablecer',
        error.message || 'El código es inválido o expiró. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Vista de éxito final
  if (step === 3) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[700]]}
          style={[styles.successContainer, { paddingTop: insets.top }]}
        >
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.text.inverse} />
            </View>
            <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
            <Text style={styles.successMessage}>
              Tu contraseña ha sido restablecida exitosamente.
            </Text>
            
            <Button
              title="Volver al inicio de sesión"
              onPress={() => navigation.navigate('Login')}
              size="lg"
              fullWidth
              style={styles.successButton}
            />
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
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text.inverse} />
        </TouchableOpacity>

        <View style={styles.headerIcon}>
          <Ionicons name={step === 1 ? "key-outline" : "lock-open-outline"} size={48} color={colors.text.inverse} />
        </View>

        <Text style={styles.headerTitle}>
          {step === 1 ? '¿Olvidaste tu contraseña?' : 'Restablecer contraseña'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {step === 1 
            ? 'Te enviaremos un código de recuperación' 
            : `Ingresa el código enviado a ${email}`}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.formCard}>
          {step === 1 ? (
            <>
              <Text style={styles.instructions}>
                Ingresa tu correo electrónico asociado a la cuenta.
              </Text>
              <Input
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={emailError}
              />
              <Button
                title="Enviar código"
                onPress={handleSendEmail}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                fullWidth
                gradient
                style={styles.submitButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.instructions}>
                Ingresa el código de 6 dígitos y tu nueva contraseña. Caduca en 15 minutos.
              </Text>
              <Input
                label="Código de verificación"
                placeholder="000000"
                value={code}
                onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0,6))}
                keyboardType="number-pad"
                leftIcon="keypad-outline"
                error={codeError}
              />
              <Input
                label="Nueva Contraseña"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={passwordError}
                hint="Mínimo 8 caracteres, mayúsculas, minúsculas y números"
              />
              {attempts > 0 && (
                <Text style={styles.attemptsText}>
                  Intentos fallidos: {attempts}/3
                </Text>
              )}
              <Button
                title="Actualizar contraseña"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                fullWidth
                gradient
                style={styles.submitButton}
              />
            </>
          )}
        </Card>

        {step === 1 && (
          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary[500]} />
            <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        )}
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
  attemptsText: {
    ...typography.caption,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: spacing.sm,
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
    marginBottom: spacing.xxl,
  },
  successButton: {
    backgroundColor: colors.text.inverse,
    marginBottom: spacing.lg,
  },
});

export default ForgotPasswordScreen;
