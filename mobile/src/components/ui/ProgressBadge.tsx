/**
 * ProgressBadge Component
 * Small pill showing count/progress (e.g., "12 / 20")
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../design/theme';

export interface ProgressBadgeProps {
  current: number;
  total?: number;
  variant?: 'count' | 'percentage' | 'fraction';
  size?: 'small' | 'medium';
  color?: 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
}

/**
 * Example Usage:
 * 
 * // Rep counter
 * <ProgressBadge 
 *   current={8} 
 *   total={12} 
 *   variant="fraction"
 *   color="success"
 * />
 * 
 * // Percentage
 * <ProgressBadge 
 *   current={85} 
 *   variant="percentage"
 *   color="primary"
 * />
 * 
 * // Simple count
 * <ProgressBadge 
 *   current={5} 
 *   variant="count"
 *   size="small"
 * />
 */
const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  current,
  total,
  variant = 'count',
  size = 'medium',
  color = 'primary',
  style,
  textStyle,
  accessible = true,
  accessibilityLabel,
}) => {
  // Get display text
  const getDisplayText = (): string => {
    switch (variant) {
      case 'fraction':
        return total ? `${current} / ${total}` : `${current}`;
      case 'percentage':
        return `${current}%`;
      case 'count':
      default:
        return `${current}`;
    }
  };

  // Get accessibility label
  const getAccessibilityLabel = (): string => {
    if (accessibilityLabel) return accessibilityLabel;
    
    switch (variant) {
      case 'fraction':
        return total ? `${current} out of ${total}` : `${current}`;
      case 'percentage':
        return `${current} percent`;
      case 'count':
      default:
        return `Count: ${current}`;
    }
  };

  // Get color styles
  const getColorStyle = (): { backgroundColor: string; color: string } => {
    switch (color) {
      case 'success':
        return {
          backgroundColor: theme.colors.semantic.successAlpha,
          color: theme.colors.semantic.success,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.semantic.warningAlpha,
          color: theme.colors.semantic.warning,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.semantic.errorAlpha,
          color: theme.colors.semantic.error,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.glass.blueAlpha10,
          color: theme.colors.primary.blue,
        };
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          fontSize: theme.typography.fontSize.xs,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
        };
    }
  };

  const colorStyle = getColorStyle();
  const sizeStyle = getSizeStyle();
  const displayText = getDisplayText();

  const badgeStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: colorStyle.backgroundColor,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    paddingVertical: sizeStyle.paddingVertical,
    ...style,
  };

  const badgeTextStyle: TextStyle = {
    ...styles.text,
    color: colorStyle.color,
    fontSize: sizeStyle.fontSize,
    ...textStyle,
  };

  return (
    <View
      style={badgeStyle}
      accessible={accessible}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="text"
    >
      <Text style={badgeTextStyle}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  
  text: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.tight,
  },
});

export default ProgressBadge;