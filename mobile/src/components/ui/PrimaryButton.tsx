/**
 * PrimaryButton Component
 * Large orange button with Olympic styling, focus states, and accessibility
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../design/theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Example Usage:
 * 
 * // Primary CTA button
 * <PrimaryButton 
 *   title="Start Recording" 
 *   onPress={handleRecord}
 *   size="large"
 * />
 * 
 * // Secondary button with loading
 * <PrimaryButton 
 *   title="Upload Video" 
 *   onPress={handleUpload}
 *   variant="secondary"
 *   loading={isUploading}
 *   disabled={!hasVideo}
 * />
 * 
 * // Glass variant for overlay contexts
 * <PrimaryButton 
 *   title="Continue" 
 *   onPress={handleContinue}
 *   variant="glass"
 *   accessibilityHint="Proceeds to next step"
 * />
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}) => {
  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    if (disabled || loading) {
      return {
        backgroundColor: theme.colors.neutral.gray[400],
        borderColor: theme.colors.neutral.gray[300],
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary.blue,
        };
      case 'glass':
        return {
          ...theme.glassPresets.buttonGlass,
          borderColor: theme.colors.glass.whiteAlpha30,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary.orange,
          borderWidth: 2,
          borderColor: theme.colors.primary.orange,
          // Blue outline on focus (iOS accessibility)
          shadowColor: theme.colors.primary.blue,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 4,
        };
    }
  };

  // Get size styles
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: theme.accessibility.minTouchTarget,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.xxxl,
          paddingVertical: theme.spacing.xl,
          minHeight: theme.accessibility.largeTouchTarget,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: theme.spacing.xxl,
          paddingVertical: theme.spacing.lg,
          minHeight: theme.accessibility.preferredTouchTarget,
        };
    }
  };

  // Get text variant styles
  const getTextVariantStyle = (): TextStyle => {
    if (disabled || loading) {
      return {
        color: theme.colors.neutral.gray[600],
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          color: theme.colors.primary.blue,
        };
      case 'glass':
        return {
          color: theme.colors.neutral.white,
        };
      case 'primary':
      default:
        return {
          color: theme.colors.neutral.white,
        };
    }
  };

  // Get text size styles
  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return {
          fontSize: theme.typography.fontSize.md,
        };
      case 'large':
        return {
          fontSize: theme.typography.fontSize.xxl,
        };
      case 'medium':
      default:
        return {
          fontSize: theme.typography.fontSize.lg,
        };
    }
  };

  // Combine styles
  const buttonStyle: ViewStyle = {
    ...styles.container,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...style,
  };

  const buttonTextStyle: TextStyle = {
    ...styles.text,
    ...getTextVariantStyle(),
    ...getTextSizeStyle(),
    ...textStyle,
  };

  // Handle press with haptic feedback (can be added later)
  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && !loading) {
      onPress(event);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextVariantStyle().color}
          style={styles.loader}
        />
      ) : (
        <Text style={buttonTextStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...theme.elevation.medium,
  },
  
  text: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.tight,
  },
  
  loader: {
    marginRight: theme.spacing.sm,
  },
});

export default PrimaryButton;