/**
 * VideoRecorder Component
 * Camera preview placeholder with big central circular record button,
 * timer, and guidance overlay
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Animated,
} from 'react-native';
import { theme } from '../../design/theme';
import PrimaryButton from './PrimaryButton';
import ProgressBadge from './ProgressBadge';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface VideoRecorderProps {
  isRecording?: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  duration?: number; // Recording duration in seconds
  maxDuration?: number; // Maximum duration in seconds
  testType?: 'pushup' | 'situp';
  showGuidance?: boolean;
  style?: ViewStyle;
  accessible?: boolean;
}

/**
 * Example Usage:
 * 
 * <VideoRecorder
 *   isRecording={recording}
 *   onStartRecording={handleStart}
 *   onStopRecording={handleStop}
 *   duration={recordingTime}
 *   maxDuration={30}
 *   testType="pushup"
 *   showGuidance={true}
 * />
 */
const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording = false,
  onStartRecording,
  onStopRecording,
  duration = 0,
  maxDuration = 30,
  testType = 'pushup',
  showGuidance = true,
  style,
  accessible = true,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [countdownAnim] = useState(new Animated.Value(0));

  // Pulse animation for recording button
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Progress animation
  useEffect(() => {
    Animated.timing(countdownAnim, {
      toValue: duration / maxDuration,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [duration, maxDuration, countdownAnim]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get guidance text based on test type
  const getGuidanceText = (): string => {
    const baseText = "Place phone 1.5m away • Keep full body in frame";
    const exerciseText = testType === 'pushup' 
      ? " • Side angle view for push-ups"
      : " • Side angle view for sit-ups";
    return baseText + exerciseText;
  };

  // Get silhouette emoji for guidance
  const getSilhouetteIcon = (): string => {
    return testType === 'pushup' ? '🤸‍♂️' : '🧘‍♂️';
  };

  const handleRecordPress = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const progress = duration / maxDuration;
  const isNearLimit = progress > 0.8;
  const isAtLimit = duration >= maxDuration;

  return (
    <View style={[styles.container, style]}>
      {/* Camera Preview Placeholder */}
      <View style={styles.cameraPreview}>
        
        {/* Guidance Overlay */}
        {showGuidance && (
          <View style={styles.guidanceOverlay}>
            <View style={styles.guidanceContent}>
              <Text style={styles.guidanceIcon}>
                {getSilhouetteIcon()}
              </Text>
              <Text style={styles.guidanceText}>
                {getGuidanceText()}
              </Text>
            </View>
          </View>
        )}

        {/* Timer and Progress */}
        {(isRecording || duration > 0) && (
          <View style={styles.timerContainer}>
            <ProgressBadge
              current={duration}
              total={maxDuration}
              variant="fraction"
              color={isNearLimit ? 'warning' : isAtLimit ? 'error' : 'primary'}
              accessibilityLabel={`Recording time: ${formatTime(duration)} of ${formatTime(maxDuration)}`}
            />
            <Text style={styles.timerText}>
              {formatTime(duration)}
            </Text>
          </View>
        )}

        {/* Progress Bar */}
        {(isRecording || duration > 0) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: countdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: isNearLimit 
                      ? theme.colors.semantic.warning 
                      : isAtLimit 
                        ? theme.colors.semantic.error 
                        : theme.colors.primary.orange,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Record Button */}
        <View style={styles.recordButtonContainer}>
          <Animated.View
            style={[
              styles.recordButtonWrapper,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <PrimaryButton
              title={isRecording ? "⏹ Stop" : "⏺ Record"}
              onPress={handleRecordPress}
              size="large"
              variant={isRecording ? 'secondary' : 'primary'}
              style={isRecording ? {...styles.recordButton, ...styles.recordButtonActive} : styles.recordButton}
              accessible={accessible}
              accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
              accessibilityHint={isRecording 
                ? `Recording for ${formatTime(duration)}. Tap to stop.`
                : `Tap to start recording ${testType} exercise`
              }
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.dark,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },

  cameraPreview: {
    flex: 1,
    position: 'relative',
    backgroundColor: theme.colors.neutral.gray[900],
    justifyContent: 'center',
    alignItems: 'center',
  },

  guidanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.glass.darkAlpha70,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 2,
  },

  guidanceContent: {
    alignItems: 'center',
  },

  guidanceIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },

  guidanceText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  timerContainer: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.lg,
    alignItems: 'flex-end',
    zIndex: 3,
  },

  timerText: {
    color: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.mono,
    fontWeight: theme.typography.fontWeight.semibold,
    marginTop: theme.spacing.sm,
    textShadowColor: theme.colors.neutral.dark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  progressContainer: {
    position: 'absolute',
    bottom: 120,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 2,
  },

  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.glass.whiteAlpha20,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },

  recordButtonContainer: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    alignSelf: 'center',
    zIndex: 3,
  },

  recordButtonWrapper: {
    alignItems: 'center',
  },

  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: theme.elevation.high.shadowColor,
    shadowOffset: theme.elevation.high.shadowOffset,
    shadowOpacity: theme.elevation.high.shadowOpacity,
    shadowRadius: theme.elevation.high.shadowRadius,
    elevation: theme.elevation.high.elevation,
  },

  recordButtonActive: {
    backgroundColor: theme.colors.recording.active,
    borderColor: theme.colors.recording.active,
  },
});

export default VideoRecorder;