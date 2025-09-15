/**
 * Enhanced Error Handling Service
 * Provides comprehensive error management, user-friendly messages, and retry mechanisms
 */

import { Alert, ToastAndroid, Platform } from 'react-native';
import { useTranslation } from '../i18n';

export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  STORAGE = 'storage',
  UPLOAD = 'upload',
  ANALYSIS = 'analysis',
  UNKNOWN = 'unknown',
}

export interface KreedaError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
  context?: string;
  timestamp: Date;
}

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: boolean;
  onRetry?: (attempt: number) => void;
}

class ErrorHandlingService {
  private retryAttempts: Map<string, number> = new Map();

  /**
   * Create a standardized Kreeda error
   */
  createError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: string
  ): KreedaError {
    return {
      type,
      message,
      originalError,
      retryable: this.isRetryable(type),
      context,
      timestamp: new Date(),
    };
  }

  /**
   * Determine if an error type is retryable
   */
  private isRetryable(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
      case ErrorType.UPLOAD:
        return true;
      case ErrorType.VALIDATION:
      case ErrorType.PERMISSION:
      case ErrorType.STORAGE:
        return false;
      default:
        return false;
    }
  }

  /**
   * Get user-friendly error message based on error type
   */
  getUserMessage(error: KreedaError, t: (key: string) => string): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return t('errors.networkError');
      case ErrorType.SERVER:
        return t('errors.serverError');
      case ErrorType.VALIDATION:
        return error.message; // Use specific validation message
      case ErrorType.PERMISSION:
        return error.message.includes('camera') 
          ? t('errors.cameraPermissionDenied')
          : t('errors.storagePermissionDenied');
      case ErrorType.STORAGE:
        return t('errors.storageError');
      case ErrorType.UPLOAD:
        return t('errors.videoUploadFailed');
      case ErrorType.ANALYSIS:
        return t('errors.analysisTimeout');
      default:
        return t('errors.unexpectedError');
    }
  }

  /**
   * Show error to user with appropriate UI
   */
  showError(
    error: KreedaError, 
    t: (key: string) => string,
    options?: {
      showAlert?: boolean;
      showToast?: boolean;
      onRetry?: () => void;
      onDismiss?: () => void;
    }
  ): void {
    const userMessage = this.getUserMessage(error, t);
    const { showAlert = true, showToast = false, onRetry, onDismiss } = options || {};

    // Log error for debugging
    console.error('Kreeda Error:', {
      type: error.type,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
      originalError: error.originalError,
    });

    if (showToast && Platform.OS === 'android') {
      ToastAndroid.show(userMessage, ToastAndroid.LONG);
      return;
    }

    if (showAlert) {
      const buttons = [
        {
          text: t('common.ok'),
          onPress: onDismiss,
        },
      ];

      if (error.retryable && onRetry) {
        buttons.unshift({
          text: t('common.retry'),
          onPress: onRetry,
        });
      }

      Alert.alert(
        this.getErrorTitle(error.type, t),
        userMessage,
        buttons,
        { cancelable: true }
      );
    }
  }

  /**
   * Get appropriate error title based on type
   */
  private getErrorTitle(type: ErrorType, t: (key: string) => string): string {
    switch (type) {
      case ErrorType.NETWORK:
        return t('errors.networkTitle');
      case ErrorType.SERVER:
        return t('errors.serverTitle');
      case ErrorType.PERMISSION:
        return t('errors.permissionTitle');
      case ErrorType.UPLOAD:
        return t('errors.uploadTitle');
      case ErrorType.ANALYSIS:
        return t('errors.analysisTitle');
      default:
        return t('common.error');
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions,
    errorContext?: string
  ): Promise<T> {
    const { maxAttempts, delay, backoff, onRetry } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        
        if (onRetry) {
          onRetry(attempt);
        }

        await this.sleep(waitTime);
      }
    }

    // All attempts failed
    throw this.createError(
      ErrorType.UNKNOWN,
      `Failed after ${maxAttempts} attempts`,
      lastError || new Error('Unknown error'),
      errorContext
    );
  }

  /**
   * Handle specific error types with custom logic
   */
  async handleNetworkError(
    originalFn: () => Promise<any>,
    t: (key: string) => string,
    context?: string
  ): Promise<any> {
    try {
      return await this.withRetry(
        originalFn,
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: true,
          onRetry: (attempt) => {
            this.showError(
              this.createError(ErrorType.NETWORK, `Retry attempt ${attempt}`, undefined, context),
              t,
              { showToast: true, showAlert: false }
            );
          },
        },
        context
      );
    } catch (error) {
      const networkError = this.createError(
        ErrorType.NETWORK,
        'Network operation failed after retries',
        error as Error,
        context
      );
      
      this.showError(networkError, t, {
        onRetry: () => this.handleNetworkError(originalFn, t, context),
      });
      
      throw networkError;
    }
  }

  /**
   * Handle file upload errors with special logic
   */
  async handleUploadError(
    uploadFn: () => Promise<any>,
    t: (key: string) => string,
    filename?: string
  ): Promise<any> {
    try {
      return await uploadFn();
    } catch (error) {
      const uploadError = this.createError(
        ErrorType.UPLOAD,
        'Video upload failed',
        error as Error,
        filename ? `File: ${filename}` : undefined
      );

      this.showError(uploadError, t, {
        onRetry: () => this.handleUploadError(uploadFn, t, filename),
      });

      // Save to local queue for later sync
      await this.saveToUploadQueue(filename, error as Error);
      
      throw uploadError;
    }
  }

  /**
   * Handle permission errors with guidance
   */
  handlePermissionError(
    permissionType: 'camera' | 'storage',
    t: (key: string) => string
  ): void {
    const permissionError = this.createError(
      ErrorType.PERMISSION,
      permissionType === 'camera' 
        ? 'Camera permission required'
        : 'Storage permission required',
      undefined,
      `Permission: ${permissionType}`
    );

    this.showError(permissionError, t, {
      onRetry: () => {
        // Guide user to settings
        Alert.alert(
          t('errors.permissionTitle'),
          t('errors.permissionGuide'),
          [
            { text: t('common.cancel') },
            { 
              text: t('common.settings'),
              onPress: () => {
                // In a real app, open settings
                console.log('Opening app settings...');
              }
            },
          ]
        );
      },
    });
  }

  /**
   * Save failed upload to queue for later retry
   */
  private async saveToUploadQueue(filename?: string, error?: Error): Promise<void> {
    try {
      // Implementation would save to AsyncStorage
      console.log('Saving to upload queue:', { filename, error: error?.message });
    } catch (saveError) {
      console.error('Failed to save to upload queue:', saveError);
    }
  }

  /**
   * Utility function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear retry attempts for a context
   */
  clearRetryAttempts(context: string): void {
    this.retryAttempts.delete(context);
  }

  /**
   * Get current retry count for a context
   */
  getRetryCount(context: string): number {
    return this.retryAttempts.get(context) || 0;
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandlingService();

/**
 * React hook for error handling
 */
export const useErrorHandler = () => {
  const { t } = useTranslation();

  return {
    handleError: (error: KreedaError, options?: any) => 
      errorHandler.showError(error, t, options),
    
    createError: (type: ErrorType, message: string, originalError?: Error, context?: string) =>
      errorHandler.createError(type, message, originalError, context),
    
    withRetry: <T>(fn: () => Promise<T>, options: RetryOptions, context?: string) =>
      errorHandler.withRetry(fn, options, context),
    
    handleNetworkError: (fn: () => Promise<any>, context?: string) =>
      errorHandler.handleNetworkError(fn, t, context),
    
    handleUploadError: (fn: () => Promise<any>, filename?: string) =>
      errorHandler.handleUploadError(fn, t, filename),
    
    handlePermissionError: (type: 'camera' | 'storage') =>
      errorHandler.handlePermissionError(type, t),
  };
};

export default errorHandler;