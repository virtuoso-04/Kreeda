/**
 * Kreeda Accessibility Helper Component
 * Provides enhanced accessibility features for screen readers and inclusive design
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  AccessibilityInfo,
  Platform,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../design/theme';
import { useTranslation } from '../../i18n';

interface AccessibilityHelperProps {
  children: React.ReactNode;
}

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  screenReaderAnnouncement?: string;
}

/**
 * Enhanced Accessibility Context Provider
 * Manages accessibility state and provides helper functions
 */
export const AccessibilityHelper: React.FC<AccessibilityHelperProps> = ({ children }) => {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
  });

  const { t } = useTranslation();

  useEffect(() => {
    // Check initial accessibility settings
    const checkAccessibilitySettings = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        
        setAccessibilityState(prev => ({
          ...prev,
          isScreenReaderEnabled: screenReaderEnabled,
          isReduceMotionEnabled: reduceMotionEnabled,
        }));

        // Announce app launch to screen readers
        if (screenReaderEnabled) {
          AccessibilityInfo.announceForAccessibility(
            t('accessibility.appLaunchAnnouncement')
          );
        }
      } catch (error) {
        console.warn('Failed to check accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for accessibility setting changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled: boolean) => {
        setAccessibilityState(prev => ({
          ...prev,
          isScreenReaderEnabled: enabled,
        }));

        if (enabled) {
          AccessibilityInfo.announceForAccessibility(
            t('accessibility.screenReaderEnabled')
          );
        }
      }
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        setAccessibilityState(prev => ({
          ...prev,
          isReduceMotionEnabled: enabled,
        }));
      }
    );

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, [t]);

  return (
    <AccessibilityContext.Provider value={accessibilityState}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Accessibility Context for sharing state
 */
const AccessibilityContext = React.createContext<AccessibilityState>({
  isScreenReaderEnabled: false,
  isReduceMotionEnabled: false,
  isHighContrastEnabled: false,
});

/**
 * Hook to use accessibility state
 */
export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityHelper');
  }
  return context;
};

/**
 * Enhanced Button Component with Accessibility
 * Provides WCAG AA compliant button with proper touch targets
 */
interface AccessibleButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  icon?: string;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  icon,
  testID,
}) => {
  const { isScreenReaderEnabled, isReduceMotionEnabled } = useAccessibility();
  const { t } = useTranslation();

  const handlePress = () => {
    if (disabled || loading) return;

    // Provide haptic feedback if available
    if (Platform.OS === 'ios') {
      // iOS haptic feedback would go here
    }

    // Announce action to screen readers
    if (isScreenReaderEnabled && accessibilityHint) {
      AccessibilityInfo.announceForAccessibility(accessibilityHint);
    }

    onPress();
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[`button_${size}` as keyof typeof styles] as ViewStyle];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton as ViewStyle);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton as ViewStyle);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton as ViewStyle);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton as ViewStyle);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText, styles[`buttonText_${size}` as keyof typeof styles] as TextStyle];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButtonText as TextStyle);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButtonText as TextStyle);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButtonText as TextStyle);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabledButtonText as TextStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
      activeOpacity={isReduceMotionEnabled ? 1 : 0.8}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <Text style={styles.buttonIcon} accessibilityElementsHidden>
            {icon}
          </Text>
        )}
        <Text style={getTextStyle()}>
          {loading ? t('common.loading') : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Accessible Text Input with Enhanced Labels
 */
interface AccessibleTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  required = false,
  accessibilityHint,
  testID,
}) => {
  const { t } = useTranslation();
  const inputId = React.useId();

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel} nativeID={`${inputId}-label`}>
        {label}
        {required && (
          <Text style={styles.requiredIndicator} accessibilityLabel={t('accessibility.required')}>
            {' *'}
          </Text>
        )}
      </Text>
      
      <TextInput
        style={[styles.textInput, error ? styles.textInputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        testID={testID}
      />
      
      {error && (
        <Text
          style={styles.errorText}
          nativeID={`${inputId}-error`}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  button: {
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.medium,
  },
  button_small: {
    minHeight: theme.accessibility.minTouchTarget,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  button_medium: {
    minHeight: theme.accessibility.preferredTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  button_large: {
    minHeight: theme.accessibility.largeTouchTarget,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.kreeda.accent,
  },
  secondaryButton: {
    backgroundColor: theme.colors.kreeda.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.kreeda.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  buttonIcon: {
    fontSize: theme.typography.fontSize.lg,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  buttonText_small: {
    fontSize: theme.typography.fontSize.sm,
  },
  buttonText_medium: {
    fontSize: theme.typography.fontSize.md,
  },
  buttonText_large: {
    fontSize: theme.typography.fontSize.lg,
  },
  primaryButtonText: {
    color: theme.colors.neutral.white,
  },
  secondaryButtonText: {
    color: theme.colors.neutral.white,
  },
  outlineButtonText: {
    color: theme.colors.kreeda.primary,
  },
  disabledButtonText: {
    color: theme.colors.neutral.gray[500],
  },

  // Input Styles
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral.dark,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.primary,
  },
  requiredIndicator: {
    color: theme.colors.semantic.error,
  },
  textInput: {
    borderWidth: 2,
    borderColor: theme.colors.neutral.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    minHeight: theme.accessibility.preferredTouchTarget,
  },
  textInputError: {
    borderColor: theme.colors.semantic.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.primary,
  },
});

// Update translations for accessibility
export const accessibilityTranslations = {
  en: {
    accessibility: {
      appLaunchAnnouncement: 'Welcome to Kreeda Sports Assessment. Swipe to navigate.',
      screenReaderEnabled: 'Screen reader is now enabled for Kreeda.',
      required: 'Required field',
      goBack: 'Go back to previous screen',
      showHelp: 'Show help information',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
      recordingStarted: 'Recording has started',
      recordingStopped: 'Recording has stopped',
      uploadProgress: 'Upload progress: {percent} percent complete',
      analysisComplete: 'Video analysis is complete',
    },
  },
  hi: {
    accessibility: {
      appLaunchAnnouncement: 'क्रीड़ा खेल मूल्यांकन में आपका स्वागत है। नेविगेट करने के लिए स्वाइप करें।',
      screenReaderEnabled: 'क्रीड़ा के लिए स्क्रीन रीडर अब सक्षम है।',
      required: 'आवश्यक फ़ील्ड',
      goBack: 'पिछली स्क्रीन पर वापस जाएं',
      showHelp: 'सहायता जानकारी दिखाएं',
      openMenu: 'नेविगेशन मेनू खोलें',
      closeMenu: 'नेविगेशन मेनू बंद करें',
      recordingStarted: 'रिकॉर्डिंग शुरू हो गई है',
      recordingStopped: 'रिकॉर्डिंग रुक गई है',
      uploadProgress: 'अपलोड प्रगति: {percent} प्रतिशत पूर्ण',
      analysisComplete: 'वीडियो विश्लेषण पूरा हो गया है',
    },
  },
};

export default AccessibilityHelper;