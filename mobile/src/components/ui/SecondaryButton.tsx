/**
 * SecondaryButton Component
 * Text button with blue underline on press, minimal design
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../design/theme';

export interface SecondaryButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  showUnderline?: boolean;
}

/**
 * Example Usage:
 * 
 * <SecondaryButton 
 *   title="Skip for now" 
 *   onPress={handleSkip}
 *   showUnderline={false}
 * />
 * 
 * <SecondaryButton 
 *   title="View previous results" 
 *   onPress={handleViewResults}
 *   accessibilityHint="Opens results screen"
 * />
 */
const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  showUnderline = true,
}) => {
  const buttonStyle: ViewStyle = {
    ...styles.container,
    ...style,
  };

  const buttonTextStyle: TextStyle = {
    ...styles.text,
    ...(disabled && styles.textDisabled),
    ...(showUnderline && styles.textUnderlined),
    ...textStyle,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      activeOpacity={0.6}
    >
      <Text style={buttonTextStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.accessibility.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  text: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary.blue,
    lineHeight: theme.typography.lineHeight.normal,
  },
  
  textDisabled: {
    color: theme.colors.neutral.gray[400],
  },
  
  textUnderlined: {
    textDecorationLine: 'underline',
  },
});

export default SecondaryButton;