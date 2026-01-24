// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Perfil
// Información del usuario y opciones de cuenta - FUNCIONAL
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types/navigation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { Card, Avatar, Badge } from '../../../components/ui';
import { useAuthStore, useDeviceStore } from '../../../stores';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
  danger?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { devices } = useDeviceStore();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Menú de cuenta
  const accountMenuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      icon: 'person-outline',
      title: 'Editar perfil',
      subtitle: 'Nombre, teléfono',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'security',
      icon: 'lock-closed-outline',
      title: 'Seguridad',
      subtitle: 'Cambiar contraseña',
      onPress: () => navigation.navigate('Security'),
    },
    {
      id: 'notifications',
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Preferencias de alertas',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
  ];

  // Menú de aplicación
  const appMenuItems: MenuItem[] = [
    {
      id: 'settings',
      icon: 'settings-outline',
      title: 'Configuración',
      subtitle: 'Sincronización, sonidos',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      icon: 'help-circle-outline',
      title: 'Ayuda y soporte',
      subtitle: 'FAQ, contacto',
      onPress: () => navigation.navigate('Help'),
    },
    {
      id: 'about',
      icon: 'information-circle-outline',
      title: 'Acerca de',
      subtitle: 'Versión, términos',
      onPress: () => navigation.navigate('About'),
    },
  ];

  const renderMenuItem = (item: MenuItem, isLast: boolean = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
        <Ionicons
          name={item.icon as any}
          size={22}
          color={item.danger ? colors.status.error : colors.text.secondary}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, item.danger && styles.menuTitleDanger]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <View style={styles.menuRight}>
        {item.showBadge && item.badgeCount ? (
          <Badge count={item.badgeCount} size="sm" color="error" />
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.disabled}
        />
      </View>
    </TouchableOpacity>
  );

  // Estadísticas
  const monitoredCount = devices.length;
  const activeDevices = devices.filter(d => d.status === 'connected').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              size="xl"
              name={user ? `${user.firstName} ${user.lastName}` : undefined}
              imageUrl={user?.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              {user?.phone && (
                <Text style={styles.profilePhone}>{user.phone}</Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{monitoredCount}</Text>
              <Text style={styles.statLabel}>Monitoreados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{activeDevices}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
          </View>
        </Card>

        {/* Account Section */}
        <Card variant="elevated" style={styles.menuCard}>
          <Text style={styles.sectionTitle}>CUENTA</Text>
          {accountMenuItems.map((item, index) => 
            renderMenuItem(item, index === accountMenuItems.length - 1)
          )}
        </Card>

        {/* App Section */}
        <Card variant="elevated" style={styles.menuCard}>
          <Text style={styles.sectionTitle}>APLICACIÓN</Text>
          {appMenuItems.map((item, index) => 
            renderMenuItem(item, index === appMenuItems.length - 1)
          )}
        </Card>

        {/* Logout */}
        <Card variant="outlined" style={styles.menuCard}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={colors.status.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </Card>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>NovaGuardian v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 NovaGuardian</Text>
        </View>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  profileCard: {
    marginHorizontal: spacing.base,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  profileName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  profilePhone: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.ui.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.ui.divider,
  },
  statNumber: {
    ...typography.h4,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  menuCard: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.divider,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconDanger: {
    backgroundColor: colors.status.error + '15',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  menuTitleDanger: {
    color: colors.status.error,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    ...typography.body,
    color: colors.status.error,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  versionText: {
    ...typography.bodySmall,
    color: colors.text.disabled,
  },
  copyrightText: {
    ...typography.caption,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
