// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Onboarding (Primera configuración)
// Guía al usuario nuevo a registrar persona monitoreada y vincular dispositivo
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
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Button, Card } from '../../components/ui';
import { useAuthStore } from '../../stores';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type OnboardingStep = 'welcome' | 'person' | 'device' | 'complete';

interface PersonData {
  name: string;
  age: string;
  relationship: string;
  medicalConditions: string;
  emergencyPhone: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, completeOnboarding } = useAuthStore();
  
  // Estado del flujo
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [createdPersonId, setCreatedPersonId] = useState<string | null>(null);
  
  // Datos de la persona monitoreada
  const [personData, setPersonData] = useState<PersonData>({
    name: '',
    age: '',
    relationship: '',
    medicalConditions: '',
    emergencyPhone: '',
  });

  // Datos del dispositivo
  const [deviceCode, setDeviceCode] = useState('');

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleCreatePerson = async () => {
    // Validaciones
    if (!personData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }
    if (!personData.age.trim() || isNaN(Number(personData.age))) {
      Alert.alert('Error', 'Ingresa una edad válida');
      return;
    }
    const age = parseInt(personData.age);
    if (age < 1 || age > 120) {
      Alert.alert('Error', 'Ingresa una edad entre 1 y 120 años');
      return;
    }
    if (!personData.relationship.trim()) {
      Alert.alert('Error', 'La relación es requerida');
      return;
    }
    // Validar teléfono si se ingresó
    if (personData.emergencyPhone.length > 0 && personData.emergencyPhone.length !== 10) {
      Alert.alert('Error', 'El teléfono de emergencia debe tener exactamente 10 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      // Separar nombre en nombre y apellido
      const nameParts = personData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'N/A';
      
      const response = await api.post('/monitored', {
        firstName: firstName,
        lastName: lastName,
        relationship: personData.relationship.trim(),
        // Calcular fecha de nacimiento aproximada basada en la edad
        birthDate: personData.age ? new Date(new Date().getFullYear() - parseInt(personData.age), 0, 1).toISOString().split('T')[0] : null,
        notes: personData.medicalConditions.trim() || null,
      });

      if (response.data?.data?.id || response.data?.id) {
        const personId = response.data?.data?.id || response.data?.id;
        setCreatedPersonId(personId);
        
        // Si hay teléfono de emergencia, agregarlo como contacto
        if (personData.emergencyPhone.trim() && personData.emergencyPhone.length === 10) {
          try {
            await api.post(`/monitored/${personId}/contacts`, {
              name: 'Contacto de emergencia',
              phone: `+52${personData.emergencyPhone.trim()}`, // Agregar código de país
              relationship: 'emergencia',
              isPrimary: true,
            });
          } catch (contactError) {
            console.log('No se pudo agregar contacto de emergencia:', contactError);
          }
        }
        
        setCurrentStep('device');
      } else {
        throw new Error('No se recibió el ID de la persona');
      }
    } catch (error: any) {
      console.error('Error creating monitored person:', error);
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo registrar la persona. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkDevice = async () => {
    if (!deviceCode.trim()) {
      Alert.alert('Error', 'Ingresa el código del dispositivo');
      return;
    }

    setIsLoading(true);
    try {
      // Vincular dispositivo a la persona creada
      await api.post('/devices/link', {
        device_code: deviceCode.trim().toUpperCase(),
        person_id: createdPersonId,
      });

      setCurrentStep('complete');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'No se pudo vincular el dispositivo'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDevice = () => {
    Alert.alert(
      'Omitir vinculación',
      'Podrás vincular un dispositivo más tarde desde la configuración. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          onPress: () => setCurrentStep('complete')
        },
      ]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Marcar onboarding como completado
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERS POR PASO
  // ═══════════════════════════════════════════════════════════════════════════

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.primary[400], colors.primary[600]]}
          style={styles.iconGradient}
        >
          <Ionicons name="shield-checkmark" size={60} color={colors.text.inverse} />
        </LinearGradient>
      </View>

      <Text style={styles.welcomeTitle}>¡Bienvenido a NovaGuardian!</Text>
      <Text style={styles.welcomeSubtitle}>
        {user?.name ? `Hola ${user.name.split(' ')[0]}, ` : ''}
        vamos a configurar tu cuenta para que puedas comenzar a monitorear a tu ser querido.
      </Text>

      <View style={styles.stepsPreview}>
        <View style={styles.previewStep}>
          <View style={[styles.previewDot, styles.previewDotActive]} />
          <Text style={styles.previewText}>1. Registrar persona a monitorear</Text>
        </View>
        <View style={styles.previewStep}>
          <View style={styles.previewDot} />
          <Text style={styles.previewText}>2. Vincular dispositivo IoT</Text>
        </View>
        <View style={styles.previewStep}>
          <View style={styles.previewDot} />
          <Text style={styles.previewText}>3. ¡Listo para monitorear!</Text>
        </View>
      </View>

      <Button
        title="Comenzar configuración"
        onPress={() => setCurrentStep('person')}
        gradient
        size="lg"
        fullWidth
        icon={<Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />}
      />
    </View>
  );

  const renderPersonForm = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>1</Text>
        </View>
        <Text style={styles.stepTitle}>Registrar persona a monitorear</Text>
      </View>

      <Text style={styles.stepDescription}>
        Ingresa los datos de la persona que usará el dispositivo IoT. Esta información es importante para las alertas de emergencia.
      </Text>

      <Card variant="elevated" style={styles.formCard}>
        {/* Nombre */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre completo *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: María García López"
              value={personData.name}
              onChangeText={(text) => setPersonData(prev => ({ ...prev, name: text }))}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Edad y Relación */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.inputLabel}>Edad *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { textAlign: 'center' }]}
                placeholder="65"
                value={personData.age}
                onChangeText={(text) => setPersonData(prev => ({ ...prev, age: text.replace(/[^0-9]/g, '') }))}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.inputLabel}>Parentesco *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="heart-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Abuela, Padre, Madre"
                value={personData.relationship}
                onChangeText={(text) => setPersonData(prev => ({ ...prev, relationship: text }))}
                autoCapitalize="words"
              />
            </View>
          </View>
        </View>

        {/* Condiciones médicas */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Condiciones médicas (opcional)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Diabetes tipo 2, Hipertensión"
              value={personData.medicalConditions}
              onChangeText={(text) => setPersonData(prev => ({ ...prev, medicalConditions: text }))}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Teléfono de emergencia */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Teléfono de emergencia (opcional, 10 dígitos)</Text>
          <View style={styles.inputContainer}>
            <Text style={{ fontSize: 14, color: colors.text.secondary, marginRight: 4 }}>+52</Text>
            <Ionicons name="call-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 5512345678"
              value={personData.emergencyPhone}
              onChangeText={(text) => setPersonData(prev => ({ ...prev, emergencyPhone: text.replace(/[^0-9]/g, '').slice(0, 10) }))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          {personData.emergencyPhone.length > 0 && personData.emergencyPhone.length < 10 && (
            <Text style={{ color: colors.status.error, fontSize: 12, marginTop: 4 }}>
              El teléfono debe tener 10 dígitos ({personData.emergencyPhone.length}/10)
            </Text>
          )}
        </View>
      </Card>

      <Button
        title="Continuar"
        onPress={handleCreatePerson}
        loading={isLoading}
        disabled={isLoading}
        gradient
        size="lg"
        fullWidth
        style={styles.continueButton}
        icon={<Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />}
      />
    </ScrollView>
  );

  const renderDeviceForm = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepNumber}>2</Text>
        </View>
        <Text style={styles.stepTitle}>Vincular dispositivo IoT</Text>
      </View>

      <Text style={styles.stepDescription}>
        Ingresa el código que aparece en tu dispositivo NovaGuardian o en su caja. El código tiene formato: NG-XXXX-XXXX
      </Text>

      <Card variant="elevated" style={styles.formCard}>
        <View style={styles.deviceIconContainer}>
          <Ionicons name="watch-outline" size={60} color={colors.primary[500]} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Código del dispositivo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="qr-code-outline" size={20} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.deviceCodeInput]}
              placeholder="NG-XXXX-XXXX"
              value={deviceCode}
              onChangeText={(text) => setDeviceCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={12}
            />
          </View>
        </View>

        <View style={styles.helpBox}>
          <Ionicons name="help-circle-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.helpText}>
            ¿No encuentras el código? Revisa la parte trasera del dispositivo o el manual incluido en la caja.
          </Text>
        </View>
      </Card>

      <Button
        title="Vincular dispositivo"
        onPress={handleLinkDevice}
        loading={isLoading}
        disabled={isLoading}
        gradient
        size="lg"
        fullWidth
        style={styles.continueButton}
      />

      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkipDevice}
        disabled={isLoading}
      >
        <Text style={styles.skipText}>Vincular después</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.status.success, '#10B981']}
          style={styles.iconGradient}
        >
          <Ionicons name="checkmark-circle" size={60} color={colors.text.inverse} />
        </LinearGradient>
      </View>

      <Text style={styles.welcomeTitle}>¡Configuración completada!</Text>
      <Text style={styles.welcomeSubtitle}>
        Tu cuenta está lista. Ya puedes comenzar a monitorear la salud y ubicación de tu ser querido.
      </Text>

      <View style={styles.featuresBox}>
        <View style={styles.featureItem}>
          <Ionicons name="heart" size={24} color={colors.status.error} />
          <Text style={styles.featureText}>Monitoreo de signos vitales</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="location" size={24} color={colors.primary[500]} />
          <Text style={styles.featureText}>Ubicación en tiempo real</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="notifications" size={24} color={colors.status.warning} />
          <Text style={styles.featureText}>Alertas instantáneas</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark" size={24} color={colors.status.success} />
          <Text style={styles.featureText}>Botón SOS de emergencia</Text>
        </View>
      </View>

      <Button
        title="Comenzar a usar NovaGuardian"
        onPress={handleComplete}
        loading={isLoading}
        disabled={isLoading}
        gradient
        size="lg"
        fullWidth
        style={styles.continueButton}
      />
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={28} color={colors.text.inverse} />
          <Text style={styles.headerTitle}>NovaGuardian</Text>
        </View>
        
        {/* Progress bar */}
        {currentStep !== 'welcome' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: currentStep === 'person' ? '33%' 
                      : currentStep === 'device' ? '66%' 
                      : '100%' 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep === 'person' ? 'Paso 1 de 3' 
                : currentStep === 'device' ? 'Paso 2 de 3' 
                : 'Completado'}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {currentStep === 'welcome' && renderWelcome()}
        {currentStep === 'person' && renderPersonForm()}
        {currentStep === 'device' && renderDeviceForm()}
        {currentStep === 'complete' && renderComplete()}
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.inverse,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text.inverse,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 50,
  },
  stepContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  stepsPreview: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  previewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border.light,
    marginRight: spacing.md,
  },
  previewDotActive: {
    backgroundColor: colors.primary[500],
  },
  previewText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    ...typography.bodyBold,
    color: colors.text.inverse,
  },
  stepTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
  },
  stepDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  formCard: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  continueButton: {
    marginTop: spacing.lg,
  },
  deviceIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  deviceCodeInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '600',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  helpText: {
    ...typography.bodySmall,
    color: colors.primary[700],
    flex: 1,
    marginLeft: spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  skipText: {
    ...typography.body,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  featuresBox: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
});

export default OnboardingScreen;
