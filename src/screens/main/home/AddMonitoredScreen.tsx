// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Agregar Persona Monitoreada
// Formulario para vincular nuevo dispositivo y persona
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
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Card, Header, Input, Button } from '../../../components/ui';
import { useDeviceStore } from '../../../stores';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AddMonitoredScreenProps = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'AddMonitored'>;
};

type Step = 'device' | 'person' | 'confirmation';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AddMonitoredScreen: React.FC<AddMonitoredScreenProps> = ({
  navigation,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('device');
  const [isLoading, setIsLoading] = useState(false);

  // Datos del formulario
  const [deviceCode, setDeviceCode] = useState('');
  const [personData, setPersonData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    bloodType: '',
    phone: '',
    relationship: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { linkDevice } = useDeviceStore();

  // Validaciones con regex
  const PHONE_REGEX = /^[0-9]{10}$/;
  const DATE_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const validateDeviceStep = (): boolean => {
    const cleanCode = deviceCode.replace(/[-\s]/g, '').trim();
    if (!cleanCode) {
      setErrors({ deviceCode: 'Ingresa el código del dispositivo' });
      return false;
    }
    if (cleanCode.length < 6) {
      setErrors({ deviceCode: 'El código debe tener al menos 6 caracteres' });
      return false;
    }
    if (cleanCode.length > 20) {
      setErrors({ deviceCode: 'El código no puede tener más de 20 caracteres' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePersonStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nombre: 2-50 caracteres, solo letras y espacios
    if (!personData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (personData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    } else if (personData.firstName.trim().length > 50) {
      newErrors.firstName = 'El nombre no puede exceder 50 caracteres';
    }

    // Apellido: 2-50 caracteres
    if (!personData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (personData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    } else if (personData.lastName.trim().length > 50) {
      newErrors.lastName = 'El apellido no puede exceder 50 caracteres';
    }

    // Fecha de nacimiento: formato DD/MM/AAAA
    if (!personData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    } else if (!DATE_REGEX.test(personData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Formato inválido (DD/MM/AAAA)';
    } else {
      // Validar que la fecha sea válida y la persona tenga entre 1 y 120 años
      const [day, month, year] = personData.dateOfBirth.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'La fecha no puede ser futura';
      } else if (age < 1) {
        newErrors.dateOfBirth = 'La persona debe tener al menos 1 año';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Edad no válida (máximo 120 años)';
      }
    }

    // Relación: requerida, 2-30 caracteres
    if (!personData.relationship.trim()) {
      newErrors.relationship = 'La relación es requerida';
    } else if (personData.relationship.trim().length < 2) {
      newErrors.relationship = 'Debe tener al menos 2 caracteres';
    }

    // Teléfono: opcional pero si se ingresa debe ser válido (10 dígitos)
    if (personData.phone.trim()) {
      const cleanPhone = personData.phone.replace(/\D/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    // Tipo de sangre: opcional pero si se ingresa debe ser válido
    if (personData.bloodType.trim()) {
      const bloodUpper = personData.bloodType.trim().toUpperCase();
      if (!VALID_BLOOD_TYPES.includes(bloodUpper)) {
        newErrors.bloodType = 'Tipo de sangre inválido (ej: A+, O-, AB+)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'device' && validateDeviceStep()) {
      setCurrentStep('person');
    } else if (currentStep === 'person' && validatePersonStep()) {
      setCurrentStep('confirmation');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Limpiar el código de guiones y espacios
      const cleanCode = deviceCode.replace(/[-\s]/g, '').trim().toUpperCase();
      // Limpiar teléfono
      const cleanPhone = personData.phone.replace(/\D/g, '');
      
      await linkDevice({
        deviceCode: cleanCode,
        monitoredPerson: {
          firstName: personData.firstName.trim(),
          lastName: personData.lastName.trim(),
          dateOfBirth: personData.dateOfBirth,
          bloodType: personData.bloodType.toUpperCase() || undefined,
          phone: cleanPhone ? `+52${cleanPhone}` : undefined,
        },
        relationship: personData.relationship.trim(),
      });
      
      Alert.alert(
        '¡Dispositivo vinculado!',
        `El dispositivo ha sido vinculado exitosamente para ${personData.firstName}.`,
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo vincular el dispositivo');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, currentStep === 'device' && styles.stepDotActive]} />
        <View style={[styles.stepLine, currentStep !== 'device' && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep === 'person' && styles.stepDotActive]} />
        <View style={[styles.stepLine, currentStep === 'confirmation' && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep === 'confirmation' && styles.stepDotActive]} />
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 'device' && styles.stepLabelActive]}>
          Dispositivo
        </Text>
        <Text style={[styles.stepLabel, currentStep === 'person' && styles.stepLabelActive]}>
          Persona
        </Text>
        <Text style={[styles.stepLabel, currentStep === 'confirmation' && styles.stepLabelActive]}>
          Confirmar
        </Text>
      </View>
    </View>
  );

  const renderDeviceStep = () => (
    <Card variant="elevated" style={styles.formCard}>
      <View style={styles.stepIcon}>
        <View style={styles.iconCircle}>
          <Ionicons name="watch" size={48} color={colors.primary[500]} />
        </View>
      </View>
      
      <Text style={styles.stepTitle}>Vincular Dispositivo</Text>
      <Text style={styles.stepDescription}>
        Ingresa el código de vinculación que aparece en la parte posterior del dispositivo NovaGuardian o que te proporcionó el administrador.
      </Text>

      <View style={styles.codeExample}>
        <Text style={styles.codeExampleLabel}>Ejemplo de código:</Text>
        <Text style={styles.codeExampleText}>NOVA001  •  NG8F4B2C  •  TESTDEV1</Text>
      </View>

      <Input
        label="Código de vinculación"
        placeholder="Ej: NOVA001"
        value={deviceCode}
        onChangeText={(v) => setDeviceCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))}
        autoCapitalize="characters"
        leftIcon="barcode-outline"
        error={errors.deviceCode}
        maxLength={20}
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
        <Text style={styles.infoText}>
          El código tiene entre 6-20 caracteres (letras y números). Lo encuentras en la caja del dispositivo o en el panel web de administración.
        </Text>
      </View>
    </Card>
  );

  const renderPersonStep = () => (
    <Card variant="elevated" style={styles.formCard}>
      <View style={styles.stepIcon}>
        <View style={styles.iconCircle}>
          <Ionicons name="person" size={48} color={colors.primary[500]} />
        </View>
      </View>
      
      <Text style={styles.stepTitle}>Información de la Persona</Text>
      <Text style={styles.stepDescription}>
        Ingresa los datos de la persona que usará el dispositivo.
      </Text>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Nombre *"
            placeholder="Juan"
            value={personData.firstName}
            onChangeText={(v) => setPersonData({ ...personData, firstName: v.slice(0, 50) })}
            error={errors.firstName}
            maxLength={50}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Apellido *"
            placeholder="Pérez"
            value={personData.lastName}
            onChangeText={(v) => setPersonData({ ...personData, lastName: v.slice(0, 50) })}
            error={errors.lastName}
            maxLength={50}
          />
        </View>
      </View>

      <Input
        label="Fecha de nacimiento *"
        placeholder="DD/MM/AAAA"
        value={personData.dateOfBirth}
        onChangeText={(v) => {
          // Auto-formatear con /
          const cleaned = v.replace(/\D/g, '').slice(0, 8);
          let formatted = cleaned;
          if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
          }
          if (cleaned.length > 4) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4);
          }
          setPersonData({ ...personData, dateOfBirth: formatted });
        }}
        keyboardType="number-pad"
        leftIcon="calendar-outline"
        error={errors.dateOfBirth}
        maxLength={10}
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Tipo de sangre"
            placeholder="O+, A-, AB+"
            value={personData.bloodType}
            onChangeText={(v) => setPersonData({ ...personData, bloodType: v.toUpperCase().slice(0, 3) })}
            autoCapitalize="characters"
            maxLength={3}
            error={errors.bloodType}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Teléfono (10 dígitos)"
            placeholder="5512345678"
            value={personData.phone}
            onChangeText={(v) => setPersonData({ ...personData, phone: v.replace(/\D/g, '').slice(0, 10) })}
            keyboardType="number-pad"
            maxLength={10}
            error={errors.phone}
          />
        </View>
      </View>

      <Input
        label="Tu relación con esta persona *"
        placeholder="Ej: Hijo/a, Nieto/a, Cuidador/a"
        value={personData.relationship}
        onChangeText={(v) => setPersonData({ ...personData, relationship: v.slice(0, 30) })}
        leftIcon="people-outline"
        error={errors.relationship}
        maxLength={30}
      />
    </Card>
  );

  const renderConfirmationStep = () => (
    <Card variant="elevated" style={styles.formCard}>
      <View style={styles.stepIcon}>
        <View style={[styles.iconCircle, { backgroundColor: colors.secondary[100] }]}>
          <Ionicons name="checkmark-circle" size={48} color={colors.secondary[500]} />
        </View>
      </View>
      
      <Text style={styles.stepTitle}>Confirmar Vinculación</Text>
      <Text style={styles.stepDescription}>
        Revisa que la información sea correcta antes de continuar.
      </Text>

      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationLabel}>Dispositivo</Text>
        <View style={styles.confirmationRow}>
          <Ionicons name="watch" size={20} color={colors.text.secondary} />
          <Text style={styles.confirmationValue}>{deviceCode}</Text>
        </View>
      </View>

      <View style={styles.confirmationSection}>
        <Text style={styles.confirmationLabel}>Persona Monitoreada</Text>
        <View style={styles.confirmationRow}>
          <Ionicons name="person" size={20} color={colors.text.secondary} />
          <Text style={styles.confirmationValue}>
            {personData.firstName} {personData.lastName}
          </Text>
        </View>
        <View style={styles.confirmationRow}>
          <Ionicons name="calendar" size={20} color={colors.text.secondary} />
          <Text style={styles.confirmationValue}>{personData.dateOfBirth}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Ionicons name="people" size={20} color={colors.text.secondary} />
          <Text style={styles.confirmationValue}>{personData.relationship}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Agregar Persona"
        showBack
        onBack={() => {
          if (currentStep === 'person') {
            setCurrentStep('device');
          } else if (currentStep === 'confirmation') {
            setCurrentStep('person');
          } else {
            navigation.goBack();
          }
        }}
      />

      {renderStepIndicator()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'device' && renderDeviceStep()}
        {currentStep === 'person' && renderPersonStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}

        {/* Botones */}
        <View style={styles.buttons}>
          {currentStep !== 'confirmation' ? (
            <Button
              title="Continuar"
              onPress={handleNextStep}
              size="lg"
              fullWidth
              gradient
            />
          ) : (
            <Button
              title="Vincular Dispositivo"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
              fullWidth
              gradient
            />
          )}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  // Steps
  stepIndicator: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.ui.divider,
  },
  stepDotActive: {
    backgroundColor: colors.primary[500],
    transform: [{ scale: 1.2 }],
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.ui.divider,
    marginHorizontal: spacing.sm,
    maxWidth: 80,
  },
  stepLineActive: {
    backgroundColor: colors.primary[500],
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  // Form
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  stepIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.sm,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  helpLinkText: {
    ...typography.bodySmall,
    color: colors.primary[500],
    marginLeft: spacing.xs,
  },
  codeExample: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  codeExampleLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  codeExampleText: {
    ...typography.body,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.primary[600],
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.status.info + '15',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  // Confirmation
  confirmationSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  confirmationLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  confirmationValue: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  // Buttons
  buttons: {
    marginTop: spacing.md,
  },
});

export default AddMonitoredScreen;
