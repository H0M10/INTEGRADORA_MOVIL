// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Pantalla de Bienvenida
// Primera pantalla que ve el usuario al abrir la app
// ═══════════════════════════════════════════════════════════════════════════

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Button } from '../../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════════════════════════════

const { width, height } = Dimensions.get('window');

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'heart',
    title: 'Monitoreo en Tiempo Real',
    description:
      'Supervisa los signos vitales de tus seres queridos las 24 horas del día, incluyendo ritmo cardíaco, oxigenación y temperatura.',
  },
  {
    id: '2',
    icon: 'location',
    title: 'Ubicación GPS',
    description:
      'Conoce la ubicación exacta en todo momento. Recibe alertas si salen de zonas seguras configuradas.',
  },
  {
    id: '3',
    icon: 'notifications',
    title: 'Alertas Inteligentes',
    description:
      'Recibe notificaciones inmediatas ante cualquier emergencia: caídas, signos vitales anormales o pulsación del botón SOS.',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'Tranquilidad Total',
    description:
      'Cuida a quienes más quieres desde cualquier lugar. NovaGuardian te mantiene conectado con su bienestar.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.primary[400], colors.primary[600]]}
          style={styles.iconGradient}
        >
          <Ionicons name={item.icon} size={80} color={colors.text.inverse} />
        </LinearGradient>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { width: dotWidth, opacity },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[600]} />
      
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[700]]}
        style={styles.headerGradient}
      />

      {/* Logo y nombre */}
      <View style={[styles.logoContainer, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.logoWrapper}>
          <Ionicons name="shield-checkmark" size={40} color={colors.text.inverse} />
        </View>
        <Text style={styles.logoText}>NovaGuardian</Text>
        <Text style={styles.logoSubtext}>Cuidando a quienes más quieres</Text>
      </View>

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={32}
        />
        <Pagination />
      </View>

      {/* Botones */}
      <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {currentIndex < slides.length - 1 ? (
          <>
            <Button
              title="Siguiente"
              onPress={scrollToNext}
              size="lg"
              fullWidth
              gradient
            />
            <Button
              title="Omitir"
              onPress={() => navigation.navigate('Login')}
              variant="ghost"
              size="lg"
              fullWidth
              style={styles.skipButton}
            />
          </>
        ) : (
          <>
            <Button
              title="Iniciar Sesión"
              onPress={() => navigation.navigate('Login')}
              size="lg"
              fullWidth
              gradient
            />
            <Button
              title="Crear Cuenta"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              size="lg"
              fullWidth
              style={styles.registerButton}
            />
          </>
        )}
      </View>
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    ...typography.h1,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  logoSubtext: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    width,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  slideDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginHorizontal: spacing.xs,
  },
  buttonsContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  skipButton: {
    marginTop: spacing.sm,
  },
  registerButton: {
    marginTop: spacing.md,
  },
});

export default WelcomeScreen;
