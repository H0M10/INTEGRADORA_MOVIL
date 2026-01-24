// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Registro
// Creación de cuenta nueva
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
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
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

// Códigos de país más comunes en Latinoamérica
const COUNTRY_CODES = [
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { register, isLoading, error } = useAuthStore();

  // Estado del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // México por defecto
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Actualizar campo
  const updateField = (field: string, value: string) => {
    // Para teléfono, solo permitir números
    if (field === 'phone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Scroll al campo de confirmar contraseña
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Validación
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    // Apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    // Teléfono - exactamente 10 dígitos
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Incluye mayúsculas, minúsculas y números';
    }

    // Confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Términos
    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler de registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    const fullPhone = `${selectedCountry.code}${formData.phone}`;

    try {
      await register({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: fullPhone,
      });
      // La navegación se maneja automáticamente por RootNavigator
    } catch (err: any) {
      // Manejar errores específicos sin perder los datos del formulario
      const errorMessage = err.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
      
      // Detectar errores específicos y mostrar en el campo correspondiente
      if (errorMessage.toLowerCase().includes('teléfono') || errorMessage.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: 'Este número de teléfono ya está registrado' }));
        Alert.alert('Teléfono ya registrado', 'El número de teléfono que ingresaste ya está asociado a otra cuenta. Por favor usa otro número o inicia sesión.');
      } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('correo')) {
        setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
        Alert.alert('Correo ya registrado', 'El correo electrónico ya está asociado a una cuenta. Por favor inicia sesión o usa otro correo.');
      } else {
        Alert.alert('Error de registro', errorMessage);
      }
    }
  };

  // Renderizar item de país
  const renderCountryItem = ({ item }: { item: typeof COUNTRY_CODES[0] }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setShowCountryPicker(false);
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.country}</Text>
      <Text style={styles.countryCode}>{item.code}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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

        <Text style={styles.headerTitle}>Crear Cuenta</Text>
        <Text style={styles.headerSubtitle}>
          Completa tus datos para comenzar
        </Text>
      </LinearGradient>

      {/* Formulario */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.formCard}>
          {/* Nombre y Apellido */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                autoCapitalize="words"
                error={errors.firstName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                autoCapitalize="words"
                error={errors.lastName}
              />
            </View>
          </View>

          {/* Email */}
          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            error={errors.email}
          />

          {/* Teléfono con selector de lada */}
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneLabel}>Teléfono</Text>
            <View style={styles.phoneInputRow}>
              {/* Selector de código de país */}
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryFlagSmall}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCodeSmall}>{selectedCountry.code}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
              {/* Input de teléfono */}
              <View style={styles.phoneInput}>
                <Input
                  placeholder="1234567890"
                  value={formData.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={errors.phone}
                />
              </View>
            </View>
            {formData.phone.length > 0 && (
              <Text style={styles.phoneHint}>
                {formData.phone.length}/10 dígitos
              </Text>
            )}
          </View>

          {/* Contraseña */}
          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
            hint="Mínimo 8 caracteres, mayúsculas, minúsculas y números"
          />

          {/* Confirmar contraseña */}
          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            onFocus={scrollToBottom}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          {/* Términos y condiciones */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
              )}
            </View>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink}>Términos y Condiciones</Text>
              {' '}y la{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.termsError}>{errors.terms}</Text>
          )}

          {/* Error general */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón de registro */}
          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            size="lg"
            fullWidth
            gradient
            style={styles.registerButton}
          />
        </Card>

        {/* Link a login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
        
        {/* Espacio extra para el teclado */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal selector de país */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu país</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowCountryPicker(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              style={styles.countryList}
            />
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    ...typography.h2,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
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
  row: {
    flexDirection: 'row',
    marginHorizontal: -spacing.sm,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  termsLink: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  termsError: {
    ...typography.caption,
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.bodyBold,
    color: colors.primary[500],
  },
  // Estilos del selector de teléfono
  phoneContainer: {
    marginBottom: spacing.md,
  },
  phoneLabel: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md + 4,
    marginRight: spacing.sm,
  },
  countryFlagSmall: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  countryCodeSmall: {
    ...typography.body,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  phoneInput: {
    flex: 1,
  },
  phoneHint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Estilos del modal de países
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  modalClose: {
    padding: spacing.sm,
  },
  countryList: {
    paddingHorizontal: spacing.lg,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  countryName: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  countryCode: {
    ...typography.body,
    color: colors.text.secondary,
  },
});

export default RegisterScreen;
