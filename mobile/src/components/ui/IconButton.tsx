/**
 * IconButton Component
 * Circular glass icon button for small actions (help, language, back)
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../design/theme';

export interface IconButtonProps {
  icon: string; // Emoji or text icon
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'glass' | 'solid';
  style?: ViewStyle;
  accessible?: boolean;
  accessibilityLabel: string; // Required for icon buttons
  accessibilityHint?: string;
}

/**
 * Example Usage:
 * 
 * <IconButton 
 *   icon="←" 
 *   onPress={goBack}
 *   accessibilityLabel="Go back"
 *   size="large"
 * />
 * 
 * <IconButton 
 *   icon="?" 
 *   onPress={showHelp}
 *   accessibilityLabel="Show help"
 *   accessibilityHint="Opens help dialog"
 *   variant="glass"
 * />
 * 
 * <IconButton 
 *   icon="🌐" 
 *   onPress={toggleLanguage}
 *   accessibilityLabel="Change language"
 * />
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = 'medium',
  variant = 'glass',
  style,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: 36,
          height: 36,
          fontSize: 16,
        };
      case 'large':
        return {
          width: 56,
          height: 56,
          fontSize: 24,
        };
      case 'medium':
      default:
        return {
          width: theme.spacing.touchTarget,
          height: theme.spacing.touchTarget,
          fontSize: 20,
        };
    }
  };

  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    if (disabled) {
      return {
        backgroundColor: theme.colors.neutral.gray[200],
        borderColor: theme.colors.neutral.gray[300],
      };
    }

    switch (variant) {
      case 'solid':
        return {
          backgroundColor: theme.colors.primary.orange,
          borderWidth: 0,
        };
      case 'glass':
      default:
        return {
          ...theme.glassPresets.buttonGlass,
        };
    }
  };

  const sizeStyle = getSizeStyle();
  const variantStyle = getVariantStyle();

  const buttonStyle: ViewStyle = {
    ...styles.container,
    width: sizeStyle.width,
    height: sizeStyle.height,
    ...variantStyle,
    ...style,
  };

  const iconColor = disabled 
    ? theme.colors.neutral.gray[500]
    : variant === 'solid' 
      ? theme.colors.neutral.white 
      : theme.colors.neutral.dark;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.icon, 
          { 
            fontSize: sizeStyle.fontSize,
            color: iconColor,
          }
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  
  icon: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: undefined, // Let the system handle emoji line height
  },
});

export default IconButton;