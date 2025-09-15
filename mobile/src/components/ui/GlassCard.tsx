/**
 * GlassCard Component
 * Glassmorphism card with translucent background, blur effect, and subtle borders
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { theme } from '../../design/theme';

export interface GlassCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'blue' | 'overlay';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  rightElement?: React.ReactNode;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'none' | 'button' | 'text' | 'header';
  onPress?: () => void;
}

/**
 * Example Usage:
 * 
 * // Basic card
 * <GlassCard title="Exercise Stats">
 *   <Text>Your content here</Text>
 * </GlassCard>
 * 
 * // Blue tinted with right element
 * <GlassCard 
 *   title="Push-ups" 
 *   variant="blue" 
 *   rightElement={<Icon name="chevron-right" />}
 * >
 *   <Text>Ready to start recording?</Text>
 * </GlassCard>
 * 
 * // Overlay variant for modals
 * <GlassCard variant="overlay" size="large">
 *   <Text style={{color: 'white'}}>Modal content</Text>
 * </GlassCard>
 */
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  title,
  subtitle,
  variant = 'light',
  size = 'medium',
  style,
  titleStyle,
  rightElement,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'none',
  onPress,
}) => {
  // Get variant styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'blue':
        return theme.glassPresets.cardBlue;
      case 'overlay':
        return theme.glassPresets.overlay;
      case 'light':
      default:
        return theme.glassPresets.cardLight;
    }
  };

  // Get size styles
  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { padding: theme.spacing.md };
      case 'large':
        return { padding: theme.spacing.xxxl };
      case 'medium':
      default:
        return { padding: theme.spacing.xl };
    }
  };

  // Combine styles
  const cardStyle: ViewStyle = {
    ...styles.container,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...style,
  };

  // Text color based on variant
  const textColor = variant === 'overlay' ? theme.colors.neutral.white : theme.colors.neutral.dark;

  const renderContent = () => (
    <>
      {/* Header with title and right element */}
      {(title || rightElement) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <Text 
                style={[styles.title, { color: textColor }, titleStyle]}
                accessible={false} // Let parent handle accessibility
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text 
                style={[styles.subtitle, { color: textColor }]}
                accessible={false}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {rightElement && (
            <View style={styles.rightElement}>
              {rightElement}
            </View>
          )}
        </View>
      )}

      {/* Content */}
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyle}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    // Blur effect simulation for Android (iOS uses actual blur)
    ...(Platform.OS === 'android' && {
      // Add subtle gradient overlay for Android fallback
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
    }),
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.tight,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.regular,
    fontFamily: theme.typography.fontFamily.primary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
    opacity: 0.8,
  },
  
  rightElement: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: theme.spacing.touchTarget,
    minHeight: theme.spacing.touchTarget,
  },
  
  content: {
    flex: 1,
  },
});

export default GlassCard;