
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../design/theme';

export interface OfflineBannerProps {
  isOffline?: boolean;
  queuedUploads?: number;
  onTapSync?: () => void;
  style?: ViewStyle;
  accessible?: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline = false,
  queuedUploads = 0,
  onTapSync,
  style,
  accessible = true,
}) => {
  if (!isOffline && queuedUploads === 0) {
    return null;
  }

  const getMessage = (): string => {
    if (isOffline && queuedUploads > 0) {
      return `Offline • ${queuedUploads} queued`;
    } else if (isOffline) {
      return 'Offline';
    } else if (queuedUploads > 0) {
      return `${queuedUploads} pending upload${queuedUploads === 1 ? '' : 's'}`;
    }
    return '';
  };

  const getAccessibilityLabel = (): string => {
    if (isOffline && queuedUploads > 0) {
      return `You are offline with ${queuedUploads} videos queued for upload`;
    } else if (isOffline) {
      return 'You are currently offline';
    } else if (queuedUploads > 0) {
      return `${queuedUploads} video${queuedUploads === 1 ? '' : 's'} pending upload`;
    }
    return '';
  };

  const handlePress = () => {
    if (onTapSync && queuedUploads > 0) {
      onTapSync();
    }
  };

  const BannerContent = (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          {isOffline ? '📶' : '📤'}
        </Text>
        <Text style={styles.message}>
          {getMessage()}
        </Text>
        {queuedUploads > 0 && onTapSync && (
          <Text style={styles.actionText}>
            Tap to sync
          </Text>
        )}
      </View>
    </View>
  );

  if (queuedUploads > 0 && onTapSync) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        accessible={accessible}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint="Tap to sync pending uploads"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        {BannerContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessible={accessible}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="text"
    >
      {BannerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.semantic.warningAlpha,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.semantic.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
  },

  message: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.semantic.warning,
    lineHeight: theme.typography.lineHeight.normal,
  },

  actionText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.semantic.warning,
    textDecorationLine: 'underline',
    marginLeft: theme.spacing.sm,
  },
});

export default OfflineBanner;