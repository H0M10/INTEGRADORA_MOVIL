// ═══════════════════════════════════════════════════════════════════════════
// NOVAGUARDIAN - Componente Input
// Campo de entrada reutilizable
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, componentSizes, spacing } from '../../theme/spacing';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap | React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  size = 'md',
  disabled = false,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const showPassword = isPassword && isPasswordVisible;

  const inputHeight = componentSizes.input[size].height;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          { height: inputHeight },
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
      >
        {leftIcon && (
          typeof leftIcon === 'string' ? (
            <Ionicons
              name={leftIcon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={isFocused ? colors.primary.main : colors.text.tertiary}
              style={styles.leftIcon}
            />
          ) : (
            <View style={styles.leftIcon}>{leftIcon}</View>
          )
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
          >
            {typeof rightIcon === 'string' ? (
              <Ionicons
                name={rightIcon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.text.tertiary}
              />
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
  },
  inputFocused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.status.error,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    height: '100%',
  },
  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIconButton: {
    padding: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default Input;
