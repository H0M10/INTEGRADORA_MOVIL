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

  const validateDeviceStep = (): boolean => {
    if (!deviceCode.trim()) {
      setErrors({ deviceCode: 'Ingresa el código del dispositivo' });
      return false;
    }
    if (deviceCode.length < 8) {
      setErrors({ deviceCode: 'El código debe tener al menos 8 caracteres' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validatePersonStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!personData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!personData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    }
    if (!personData.relationship.trim()) {
      newErrors.relationship = 'La relación es requerida';
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
      await linkDevice({
        deviceCode: deviceCode.trim(),
        monitoredPerson: {
          firstName: personData.firstName.trim(),
          lastName: personData.lastName.trim(),
          dateOfBirth: personData.dateOfBirth,
          bloodType: personData.bloodType || undefined,
          phone: personData.phone || undefined,
        },
        relationship: personData.relationship,
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
        Ingresa el código que aparece en la parte posterior del dispositivo NovaGuardian.
      </Text>

      <Input
        label="Código del dispositivo"
        placeholder="NG-XXXXXXXX"
        value={deviceCode}
        onChangeText={setDeviceCode}
        autoCapitalize="characters"
        leftIcon="barcode-outline"
        error={errors.deviceCode}
      />

      <TouchableOpacity style={styles.helpLink}>
        <Ionicons name="help-circle-outline" size={18} color={colors.primary[500]} />
        <Text style={styles.helpLinkText}>¿Dónde encuentro el código?</Text>
      </TouchableOpacity>
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
            label="Nombre"
            placeholder="Juan"
            value={personData.firstName}
            onChangeText={(v) => setPersonData({ ...personData, firstName: v })}
            error={errors.firstName}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Apellido"
            placeholder="Pérez"
            value={personData.lastName}
            onChangeText={(v) => setPersonData({ ...personData, lastName: v })}
            error={errors.lastName}
          />
        </View>
      </View>

      <Input
        label="Fecha de nacimiento"
        placeholder="DD/MM/AAAA"
        value={personData.dateOfBirth}
        onChangeText={(v) => setPersonData({ ...personData, dateOfBirth: v })}
        keyboardType="numbers-and-punctuation"
        leftIcon="calendar-outline"
        error={errors.dateOfBirth}
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Tipo de sangre"
            placeholder="O+"
            value={personData.bloodType}
            onChangeText={(v) => setPersonData({ ...personData, bloodType: v })}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Teléfono"
            placeholder="+52 123..."
            value={personData.phone}
            onChangeText={(v) => setPersonData({ ...personData, phone: v })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <Input
        label="Tu relación con esta persona"
        placeholder="Ej: Hijo/a, Nieto/a, Cuidador/a"
        value={personData.relationship}
        onChangeText={(v) => setPersonData({ ...personData, relationship: v })}
        leftIcon="people-outline"
        error={errors.relationship}
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
