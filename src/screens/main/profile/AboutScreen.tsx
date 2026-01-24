// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla Acerca de
// Información de la aplicación
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing, borderRadius, shadows } from '../../../theme/spacing';
import { Header, Card } from '../../../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type AboutScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'About'>;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const appVersion = '1.0.0';
  const buildNumber = '2024.1.15';

  const legalLinks = [
    {
      id: 'terms',
      icon: 'document-text',
      title: 'Términos de servicio',
      url: 'https://novaguardian.com/terms',
    },
    {
      id: 'privacy',
      icon: 'shield-checkmark',
      title: 'Política de privacidad',
      url: 'https://novaguardian.com/privacy',
    },
    {
      id: 'licenses',
      icon: 'code-slash',
      title: 'Licencias de código abierto',
      url: 'https://novaguardian.com/licenses',
    },
  ];

  const socialLinks = [
    {
      id: 'website',
      icon: 'globe',
      color: colors.primary[500],
      title: 'Sitio web',
      url: 'https://novaguardian.com',
    },
    {
      id: 'facebook',
      icon: 'logo-facebook',
      color: '#1877F2',
      title: 'Facebook',
      url: 'https://facebook.com/novaguardian',
    },
    {
      id: 'instagram',
      icon: 'logo-instagram',
      color: '#E4405F',
      title: 'Instagram',
      url: 'https://instagram.com/novaguardian',
    },
    {
      id: 'twitter',
      icon: 'logo-twitter',
      color: '#1DA1F2',
      title: 'Twitter',
      url: 'https://twitter.com/novaguardian',
    },
  ];

  const teamMembers = [
    { name: 'Equipo NovaGuardian', role: 'Desarrollo' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Acerca de"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo y versión */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={48} color={colors.text.inverse} />
            </View>
          </View>
          <Text style={styles.appName}>NovaGuardian</Text>
          <Text style={styles.tagline}>Cuidando a quienes más amas</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{appVersion}</Text>
          </View>
        </View>

        {/* Descripción */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Nuestra Misión</Text>
          <Text style={styles.description}>
            NovaGuardian es un sistema de monitoreo IoT diseñado para brindar tranquilidad a las familias, 
            permitiendo el seguimiento en tiempo real de la salud y ubicación de adultos mayores y personas 
            que requieren cuidado especial.
          </Text>
          <Text style={[styles.description, { marginTop: spacing.md }]}>
            Mediante tecnología de última generación, nuestra pulsera inteligente se conecta vía WiFi o red celular 
            para monitorear signos vitales, detectar caídas y rastrear ubicación GPS en tiempo real, todo accesible desde tu smartphone.
          </Text>
        </Card>

        {/* Información técnica */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la App</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>{buildNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plataforma</Text>
            <Text style={styles.infoValue}>React Native + Expo</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Última actualización</Text>
            <Text style={styles.infoValue}>Enero 2024</Text>
          </View>
        </Card>

        {/* Legal */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          {legalLinks.map((link, index) => (
            <TouchableOpacity
              key={link.id}
              style={[
                styles.linkRow,
                index !== legalLinks.length - 1 && styles.linkRowBorder,
              ]}
              onPress={() => Linking.openURL(link.url)}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={link.icon as any} size={20} color={colors.text.secondary} />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Ionicons name="open-outline" size={18} color={colors.text.disabled} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Redes sociales */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Síguenos</Text>
          
          <View style={styles.socialGrid}>
            {socialLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={styles.socialButton}
                onPress={() => Linking.openURL(social.url)}
              >
                <View style={[styles.socialIcon, { backgroundColor: social.color + '15' }]}>
                  <Ionicons name={social.icon as any} size={24} color={social.color} />
                </View>
                <Text style={styles.socialTitle}>{social.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Créditos */}
        <Card variant="outlined" style={styles.section}>
          <View style={styles.creditsHeader}>
            <Ionicons name="heart" size={20} color={colors.status.error} />
            <Text style={styles.creditsTitle}>Desarrollado con ❤️</Text>
          </View>
          <Text style={styles.creditsText}>
            Por estudiantes de la Universidad Tecnológica de Xicotepec de Juárez
          </Text>
          <Text style={styles.creditsSubtext}>
            Proyecto Integradora 2 - 2024
          </Text>
        </Card>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="heart" size={20} color={colors.primary[500]} />
            </View>
            <Text style={styles.featureText}>Monitoreo de signos vitales</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary[50] }]}>
              <Ionicons name="location" size={20} color={colors.secondary[500]} />
            </View>
            <Text style={styles.featureText}>GPS en tiempo real</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.status.warning + '20' }]}>
              <Ionicons name="alert-circle" size={20} color={colors.status.warning} />
            </View>
            <Text style={styles.featureText}>Alertas inteligentes</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: colors.status.info + '20' }]}>
              <Ionicons name="shield" size={20} color={colors.status.info} />
            </View>
            <Text style={styles.featureText}>Zonas seguras</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © 2024 NovaGuardian. Todos los derechos reservados.
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
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  appName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  versionBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  versionText: {
    ...typography.bodySmall,
    color: colors.primary[600],
    fontWeight: '600',
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
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  infoLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  // Links
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  linkTitle: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  // Social
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  socialButton: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  socialTitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  // Credits
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  creditsTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  creditsText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  creditsSubtext: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  // Features
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  featureItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  // Copyright
  copyright: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  copyrightText: {
    ...typography.caption,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default AboutScreen;
