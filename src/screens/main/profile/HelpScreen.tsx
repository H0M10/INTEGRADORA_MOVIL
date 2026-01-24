// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Ayuda y Soporte
// Información de contacto real
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius } from '../../../theme/spacing';
import { Header, Card } from '../../../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type HelpScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Help'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// DATOS DE CONTACTO REALES
// ═══════════════════════════════════════════════════════════════════════════

const CONTACT_INFO = {
  whatsapp: '+52 442 830 6799',
  whatsappLink: 'https://wa.me/524428306799',
  email: 'hanniel@novaguardian.online',
  phone: '+52 442 830 6799',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {

  const contactOptions = [
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      title: 'WhatsApp',
      subtitle: 'Respuesta rápida',
      action: () => Linking.openURL(CONTACT_INFO.whatsappLink),
    },
    {
      id: 'email',
      icon: 'mail',
      color: colors.primary[500],
      title: 'Correo',
      subtitle: CONTACT_INFO.email,
      action: () => Linking.openURL(`mailto:${CONTACT_INFO.email}`),
    },
    {
      id: 'phone',
      icon: 'call',
      color: colors.secondary[500],
      title: 'Llamar',
      subtitle: CONTACT_INFO.phone,
      action: () => Linking.openURL(`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`),
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Ayuda y Soporte"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Título principal */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={48} color={colors.primary[500]} />
          </View>
          <Text style={styles.heroTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.heroSubtitle}>
            Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
          </Text>
        </View>

        {/* Opciones de contacto */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactOption}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIcon, { backgroundColor: option.color + '15' }]}>
                  <Ionicons name={option.icon as any} size={28} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle} numberOfLines={1}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Información detallada de contacto */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Información de contacto</Text>
          
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => Linking.openURL(CONTACT_INFO.whatsappLink)}
          >
            <View style={[styles.infoIcon, { backgroundColor: '#25D36615' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>WhatsApp</Text>
              <Text style={styles.infoValue}>{CONTACT_INFO.whatsapp}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => Linking.openURL(`mailto:${CONTACT_INFO.email}`)}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="mail" size={22} color={colors.primary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Correo electrónico</Text>
              <Text style={styles.infoValue}>{CONTACT_INFO.email}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <View style={styles.infoDivider} />

          <TouchableOpacity 
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`)}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="call" size={22} color={colors.secondary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{CONTACT_INFO.phone}</Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Reportar problema - ahora enlaza directamente a WhatsApp */}
        <Card variant="outlined" style={styles.section}>
          <View style={styles.reportHeader}>
            <Ionicons name="bug" size={24} color={colors.status.warning} />
            <Text style={styles.reportTitle}>¿Encontraste un problema?</Text>
          </View>
          <Text style={styles.reportDescription}>
            Ayúdanos a mejorar reportando errores o problemas que encuentres en la aplicación. 
            Escríbenos por WhatsApp o correo con los detalles del problema.
          </Text>
          <View style={styles.reportButtons}>
            <TouchableOpacity 
              style={[styles.reportButton, { backgroundColor: '#25D36615', borderColor: '#25D366' }]}
              onPress={() => Linking.openURL(`${CONTACT_INFO.whatsappLink}?text=Hola, quiero reportar un problema con la app NovaGuardian:`)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={[styles.reportButtonText, { color: '#25D366' }]}>WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reportButton, { backgroundColor: colors.primary[50], borderColor: colors.primary[500] }]}
              onPress={() => Linking.openURL(`mailto:${CONTACT_INFO.email}?subject=Reporte de problema - NovaGuardian`)}
            >
              <Ionicons name="mail" size={20} color={colors.primary[500]} />
              <Text style={[styles.reportButtonText, { color: colors.primary[500] }]}>Correo</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.footerText}>
            Horario de atención: Lun - Vie 9:00 - 18:00
          </Text>
          <Text style={styles.footerSubtext}>
            Las consultas fuera de horario serán atendidas el siguiente día hábil
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
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
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Section
  section: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  // Contact Grid
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  contactTitle: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.ui.divider,
    marginLeft: 60,
    marginVertical: spacing.xs,
  },
  // Report
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  reportDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  reportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  reportButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default HelpScreen;
