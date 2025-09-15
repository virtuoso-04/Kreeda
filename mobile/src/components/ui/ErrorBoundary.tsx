/**
 * Enhanced Error Boundary Component
 * Provides user-friendly error handling with accessibility and multilingual support
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { theme } from '../../design/theme';
import { useTranslation } from '../../i18n';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  retry: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('Kreeda Error Boundary caught an error:', error, errorInfo);

    // Announce error to screen readers
    AccessibilityInfo.announceForAccessibility(
      'An error occurred. Please use the retry button or restart the app.'
    );
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  retry = () => {
    this.resetError();
    // Force re-render
    this.forceUpdate();
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 * User-friendly error display with multilingual support
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, retry }) => {
  const { t } = useTranslation();

  const handleRetry = () => {
    AccessibilityInfo.announceForAccessibility(t('errors.retrying'));
    retry();
  };

  const handleRestart = () => {
    Alert.alert(
      t('errors.restartTitle'),
      t('errors.restartMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('errors.restartApp'),
          onPress: () => {
            // In a real app, you might use react-native-restart
            resetError();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.errorCard}>
        {/* Kreeda Branding */}
        <View style={styles.brandingContainer}>
          <Text style={styles.appName} accessibilityRole="text">
            {t('branding.appFullName')}
          </Text>
        </View>

        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.errorIcon} accessibilityLabel={t('errors.errorIconDescription')}>
            ⚠️
          </Text>
        </View>

        {/* Error Message */}
        <Text style={styles.errorTitle} accessibilityRole="header">
          {t('errors.unexpectedErrorTitle')}
        </Text>
        
        <Text style={styles.errorMessage}>
          {t('errors.unexpectedError')}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel={t('errors.retryButtonLabel')}
            accessibilityHint={t('errors.retryButtonHint')}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.restartButton]}
            onPress={handleRestart}
            accessibilityRole="button"
            accessibilityLabel={t('errors.restartButtonLabel')}
            accessibilityHint={t('errors.restartButtonHint')}
            activeOpacity={0.8}
          >
            <Text style={styles.restartButtonText}>{t('errors.restartApp')}</Text>
          </TouchableOpacity>
        </View>

        {/* Error Details (for debugging) */}
        {__DEV__ && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>{error.toString()}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.kreeda.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorCard: {
    ...theme.glassPresets.cardLight,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  brandingContainer: {
    marginBottom: theme.spacing.xl,
  },
  appName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.kreeda.primary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.primary,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.primary,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.neutral.gray[600],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
    marginBottom: theme.spacing.xxxl,
    fontFamily: theme.typography.fontFamily.primary,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    minHeight: theme.accessibility.preferredTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.kreeda.accent,
  },
  retryButtonText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
  },
  restartButton: {
    backgroundColor: theme.colors.neutral.white,
    borderWidth: 2,
    borderColor: theme.colors.kreeda.primary,
  },
  restartButtonText: {
    color: theme.colors.kreeda.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
  },
  debugContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.glass.darkAlpha50,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  debugTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.semantic.warning,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.mono,
  },
  debugText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.neutral.gray[400],
    fontFamily: theme.typography.fontFamily.mono,
  },
});

export default ErrorBoundary;
export { DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps };