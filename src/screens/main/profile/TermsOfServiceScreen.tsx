// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Términos y Condiciones
// Visualización de términos de servicio y política de privacidad
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Card } from '../../../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════════════════

const SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    content:
      'Al descargar, instalar o utilizar la aplicación NovaGuardian ("la App"), usted acepta estar sujeto a estos Términos y Condiciones de Uso. Si no está de acuerdo con alguno de estos términos, no debe utilizar la App. NovaGuardian se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios a través de la App.',
  },
  {
    title: '2. Descripción del Servicio',
    content:
      'NovaGuardian es una plataforma de monitoreo de salud diseñada para el cuidado de adultos mayores. A través de dispositivos NovaBand, la App recopila y presenta signos vitales (frecuencia cardíaca, oxigenación, temperatura, presión arterial), ubicación GPS y alertas de emergencia. El servicio está destinado exclusivamente a fines informativos y de asistencia, y NO sustituye la atención médica profesional.',
  },
  {
    title: '3. Registro y Cuenta de Usuario',
    content:
      'Para utilizar la App, el usuario debe crear una cuenta proporcionando información veraz y actualizada, incluyendo nombre completo, correo electrónico y número telefónico. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas con su cuenta. Se prohíbe compartir credenciales de acceso con terceros.',
  },
  {
    title: '4. Uso de Datos Personales y de Salud',
    content:
      'NovaGuardian recopila datos personales y de salud para proporcionar el servicio. Todos los datos son tratados conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México. Los datos de salud se cifran en tránsito y en reposo utilizando estándares de la industria (TLS 1.3 / AES-256). NovaGuardian no comparte datos personales con terceros sin el consentimiento explícito del usuario, salvo requerimiento legal.',
  },
  {
    title: '5. Dispositivos NovaBand',
    content:
      'Los dispositivos NovaBand son pulseras inteligentes que recopilan signos vitales y ubicación del usuario monitoreado. El usuario responsable (familiar o cuidador) es quien gestiona la vinculación del dispositivo con la cuenta. Los datos recopilados por el dispositivo se transmiten de forma encriptada al servidor de NovaGuardian. El usuario acepta mantener el dispositivo en buen estado y reportar anomalías de funcionamiento.',
  },
  {
    title: '6. Alertas y Notificaciones',
    content:
      'La App genera alertas automáticas basadas en umbrales predefinidos de signos vitales, detección de caídas y límites geográficos (geofencing). Estas alertas son orientativas y no deben considerarse como diagnóstico médico. NovaGuardian no se hace responsable por alertas no recibidas debido a fallos en la conectividad, batería del dispositivo o configuraciones del teléfono del usuario.',
  },
  {
    title: '7. Limitación de Responsabilidad',
    content:
      'NovaGuardian proporciona la App "tal cual" y no garantiza la ininterrupción, exactitud o completitud de los datos presentados. La App NO es un dispositivo médico certificado y no debe utilizarse para tomar decisiones médicas críticas. En caso de emergencia médica, el usuario debe contactar a los servicios de emergencia locales (911) de inmediato. NovaGuardian no será responsable por daños directos, indirectos, especiales o consecuentes derivados del uso de la App.',
  },
  {
    title: '8. Propiedad Intelectual',
    content:
      'Todo el contenido, diseño, código fuente y marcas registradas de NovaGuardian son propiedad exclusiva de sus creadores. El usuario no adquiere ningún derecho de propiedad intelectual sobre la App. Queda prohibida la reproducción, distribución, modificación o ingeniería inversa de cualquier componente de la App sin autorización expresa.',
  },
  {
    title: '9. Cancelación y Eliminación de Cuenta',
    content:
      'El usuario puede solicitar la eliminación de su cuenta en cualquier momento desde la sección de configuración de la App. Al eliminar la cuenta, todos los datos personales serán eliminados de los servidores de NovaGuardian en un plazo no mayor a 30 días, conforme a la legislación vigente. Los datos anonimizados podrán ser conservados con fines estadísticos.',
  },
  {
    title: '10. Legislación Aplicable',
    content:
      'Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de la Ciudad de México, renunciando las partes a cualquier otro fuero que pudiera corresponderles.',
  },
  {
    title: '11. Contacto',
    content:
      'Para dudas, quejas o sugerencias sobre estos términos o el servicio, puede contactarnos en:\n\n• Email: soporte@novaguardian.com\n• Teléfono: +52 (55) 1234-5678\n• Dirección: Av. Tecnológico #100, Ciudad de México, CP 01000',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const TermsOfServiceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos y Condiciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <Card variant="elevated" style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark" size={40} color={colors.primary[500]} />
          </View>
          <Text style={styles.introTitle}>
            Términos de Servicio de NovaGuardian
          </Text>
          <Text style={styles.introSubtitle}>
            Última actualización: 13 de abril de 2026
          </Text>
          <Text style={styles.introText}>
            Por favor, lee cuidadosamente los siguientes términos y condiciones
            antes de utilizar la aplicación NovaGuardian. El uso continuado de la
            App constituye la aceptación de estos términos.
          </Text>
        </Card>

        {/* Secciones */}
        {SECTIONS.map((section, index) => (
          <Card key={index} variant="outlined" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Card>
        ))}

        {/* Footer legal */}
        <View style={styles.footer}>
          <Ionicons name="document-text-outline" size={20} color={colors.text.disabled} />
          <Text style={styles.footerText}>
            © 2024-2026 NovaGuardian. Todos los derechos reservados.
          </Text>
        </View>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  introCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  introIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  introTitle: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  introSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  introText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.primary[700],
    marginBottom: spacing.sm,
  },
  sectionContent: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.disabled,
  },
});

export default TermsOfServiceScreen;
