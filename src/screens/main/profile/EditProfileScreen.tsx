// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Editar Perfil
// Formulario de edición de datos personales - FUNCIONAL
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { Header, Card, Input, Button, Avatar } from '../../../components/ui';
import { useAuthStore } from '../../../stores';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
};

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { user, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      Alert.alert(
        '✅ Perfil actualizado',
        'Tus datos se han guardado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Editar Perfil"
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
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar
              size="xl"
              name={`${formData.firstName} ${formData.lastName}`}
            />
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          {/* Formulario */}
          <Card variant="elevated" style={styles.formCard}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <Input
              label="Nombre"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              placeholder="Tu nombre"
              error={errors.firstName}
              autoCapitalize="words"
            />

            <Input
              label="Apellido"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              placeholder="Tu apellido"
              error={errors.lastName}
              autoCapitalize="words"
            />

            <Input
              label="Teléfono (opcional)"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Ej: +521234567890"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </Card>

          {/* Botón guardar */}
          <View style={styles.buttonContainer}>
            <Button
              title="Guardar cambios"
              onPress={handleSave}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emailText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
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

export default EditProfileScreen;
