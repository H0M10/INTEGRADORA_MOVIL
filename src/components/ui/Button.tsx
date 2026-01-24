// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Button
// Botón reutilizable con múltiples variantes
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, componentSizes, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;        // Alias para leftIcon
  gradient?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  icon,
  gradient = false,
  style,
  textStyle,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const effectiveLeftIcon = leftIcon || icon;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    size === 'sm' && styles.textSmall,
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' 
            ? colors.primary.main 
            : colors.text.inverse
          }
        />
      ) : (
        <>
          {effectiveLeftIcon && <>{effectiveLeftIcon}</>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </>
  );

  if (gradient && variant === 'primary' && !isDisabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        {...props}
      >
        <LinearGradient
          colors={colors.gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            styles[`size_${size}`],
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      activeOpacity={0.8}
      disabled={isDisabled}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },

  // Variantes
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.status.error,
  },

  // Tamaños
  size_sm: {
    height: componentSizes.button.sm.height,
    paddingHorizontal: componentSizes.button.sm.paddingHorizontal,
  },
  size_md: {
    height: componentSizes.button.md.height,
    paddingHorizontal: componentSizes.button.md.paddingHorizontal,
  },
  size_lg: {
    height: componentSizes.button.lg.height,
    paddingHorizontal: componentSizes.button.lg.paddingHorizontal,
  },
  size_xl: {
    height: componentSizes.button.xl.height,
    paddingHorizontal: componentSizes.button.xl.paddingHorizontal,
  },

  // Texto
  text: {
    ...typography.button,
    color: colors.text.inverse,
  },
  text_primary: {
    color: colors.text.inverse,
  },
  text_secondary: {
    color: colors.text.inverse,
  },
  text_outline: {
    color: colors.primary.main,
  },
  text_ghost: {
    color: colors.primary.main,
  },
  text_danger: {
    color: colors.text.inverse,
  },
  textSmall: {
    ...typography.buttonSmall,
  },

  // Estados
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;
