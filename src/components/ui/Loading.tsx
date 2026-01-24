// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Loading
// Indicadores de carga y estados de loading
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type LoadingSize = 'sm' | 'md' | 'lg';
type LoadingVariant = 'spinner' | 'dots' | 'pulse';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

const sizeConfig: Record<LoadingSize, {
  spinner: 'small' | 'large';
  dotSize: number;
  containerPadding: number;
}> = {
  sm: { spinner: 'small', dotSize: 6, containerPadding: spacing.md },
  md: { spinner: 'large', dotSize: 10, containerPadding: spacing.lg },
  lg: { spinner: 'large', dotSize: 14, containerPadding: spacing.xl },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE DOTS
// ═══════════════════════════════════════════════════════════════════════════

const LoadingDots: React.FC<{ size: LoadingSize; color: string }> = ({ size, color }) => {
  const config = sizeConfig[size];
  const [dot1] = React.useState(new Animated.Value(0));
  const [dot2] = React.useState(new Animated.Value(0));
  const [dot3] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animate(dot1, 0);
    const anim2 = animate(dot2, 150);
    const anim3 = animate(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const renderDot = (animatedValue: Animated.Value) => (
    <Animated.View
      style={[
        styles.dot,
        {
          width: config.dotSize,
          height: config.dotSize,
          borderRadius: config.dotSize / 2,
          backgroundColor: color,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3],
              }),
            },
          ],
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }),
        },
      ]}
    />
  );

  return (
    <View style={styles.dotsContainer}>
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PULSE
// ═══════════════════════════════════════════════════════════════════════════

const LoadingPulse: React.FC<{ size: LoadingSize; color: string }> = ({ size, color }) => {
  const config = sizeConfig[size];
  const pulseSize = config.dotSize * 4;
  const [scale] = React.useState(new Animated.Value(0));
  const [opacity] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.pulseContainer, { width: pulseSize, height: pulseSize }]}>
      <Animated.View
        style={[
          styles.pulseOuter,
          {
            width: pulseSize,
            height: pulseSize,
            borderRadius: pulseSize / 2,
            borderColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <View
        style={[
          styles.pulseInner,
          {
            width: pulseSize / 2,
            height: pulseSize / 2,
            borderRadius: pulseSize / 4,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = colors.primary[500],
  message,
  fullScreen = false,
  overlay = false,
}) => {
  const config = sizeConfig[size];

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={size} color={color} />;
      case 'pulse':
        return <LoadingPulse size={size} color={color} />;
      default:
        return <ActivityIndicator size={config.spinner} color={color} />;
    }
  };

  const content = (
    <View style={[styles.content, { padding: config.containerPadding }]}>
      {renderLoader()}
      {message && (
        <Text style={[styles.message, size === 'sm' && styles.messageSmall]}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, overlay && styles.overlay]}>
        {content}
      </View>
    );
  }

  return content;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE SKELETON
// ═══════════════════════════════════════════════════════════════════════════

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const [opacity] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: typeof width === 'number' ? width : width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  messageSmall: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    marginHorizontal: spacing.xs,
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseOuter: {
    position: 'absolute',
    borderWidth: 2,
  },
  pulseInner: {},
  skeleton: {
    backgroundColor: colors.ui.divider,
  },
});

export default Loading;
