// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Seguridad
// Cambio de contraseña - FUNCIONAL
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Header, Card, Input, Button } from '../../../components/ui';
import { authService } from '../../../services';

type SecurityScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Security'>;
};

export const SecurityScreen: React.FC<SecurityScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Ingresa tu contraseña actual';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Ingresa la nueva contraseña';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Mínimo 6 caracteres';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      Alert.alert(
        '✅ Contraseña actualizada',
        'Tu contraseña ha sido cambiada exitosamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'No se pudo cambiar la contraseña';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Seguridad"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icono */}
          <View style={styles.iconSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.primary[500]} />
            </View>
            <Text style={styles.description}>
              Cambia tu contraseña para mantener tu cuenta segura
            </Text>
          </View>

          {/* Formulario */}
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>

            <Input
              label="Contraseña actual"
              value={passwordForm.currentPassword}
              onChangeText={(text) => handleInputChange('currentPassword', text)}
              placeholder="••••••••"
              secureTextEntry={!showCurrentPassword}
              error={errors.currentPassword}
              rightIcon={
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.tertiary}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              }
            />

            <Input
              label="Nueva contraseña"
              value={passwordForm.newPassword}
              onChangeText={(text) => handleInputChange('newPassword', text)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!showNewPassword}
              error={errors.newPassword}
              rightIcon={
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.tertiary}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                />
              }
            />

            <Input
              label="Confirmar nueva contraseña"
              value={passwordForm.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Repite la contraseña"
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              rightIcon={
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.text.tertiary}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
          </Card>

          {/* Botón */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cambiar contraseña"
              onPress={handleChangePassword}
              loading={isLoading}
              fullWidth
            />
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.md,
  },
});

export default SecurityScreen;
