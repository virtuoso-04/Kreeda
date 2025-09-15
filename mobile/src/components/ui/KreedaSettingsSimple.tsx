/**
 * Kreeda Settings Component
 * Simple settings screen with basic functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../../design/theme';
import { useTranslation, i18n } from '../../i18n';
import GlassCard from './GlassCard';

const KreedaSettings: React.FC = () => {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState({
    language: i18n.getCurrentLanguage() || 'en',
    notifications: true,
    soundEffects: true,
    hapticFeedback: true,
  });

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.setLanguage(languageCode as 'en' | 'hi');
      setSettings(prev => ({ ...prev, language: languageCode as 'en' | 'hi' }));
    } catch (error) {
      Alert.alert(
        t('error.title'),
        t('error.generic'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const showLanguagePicker = () => {
    Alert.alert(
      'Select Language',
      undefined,
      [
        {
          text: 'English',
          onPress: () => handleLanguageChange('en'),
        },
        {
          text: 'हिंदी (Hindi)',
          onPress: () => handleLanguageChange('hi'),
        },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Settings {theme.kreedaBrand.symbols.analysis}
        </Text>
        <Text style={styles.subtitle}>
          Customize your Kreeda experience
        </Text>
      </View>

      {/* Language Setting */}
      <GlassCard style={styles.settingCard}>
        <TouchableOpacity
          style={styles.settingContent}
          onPress={showLanguagePicker}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Language: ${settings.language === 'hi' ? 'Hindi' : 'English'}`}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌐</Text>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingSubtitle}>
                {settings.language === 'hi' ? 'हिंदी' : 'English'}
              </Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* Notifications */}
      <GlassCard style={styles.settingCard}>
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Receive app notifications
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={() => toggleSetting('notifications')}
            trackColor={{
              false: theme.colors.glass.whiteAlpha30,
              true: theme.colors.kreeda.accent,
            }}
            thumbColor={
              settings.notifications 
                ? theme.colors.kreeda.gold 
                : theme.colors.neutral.white
            }
          />
        </View>
      </GlassCard>

      {/* Sound Effects */}
      <GlassCard style={styles.settingCard}>
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔊</Text>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingSubtitle}>
                Play sounds for actions
              </Text>
            </View>
          </View>
          <Switch
            value={settings.soundEffects}
            onValueChange={() => toggleSetting('soundEffects')}
            trackColor={{
              false: theme.colors.glass.whiteAlpha30,
              true: theme.colors.kreeda.accent,
            }}
            thumbColor={
              settings.soundEffects 
                ? theme.colors.kreeda.gold 
                : theme.colors.neutral.white
            }
          />
        </View>
      </GlassCard>

      {/* Haptic Feedback */}
      <GlassCard style={styles.settingCard}>
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📳</Text>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingSubtitle}>
                Vibration for interactions
              </Text>
            </View>
          </View>
          <Switch
            value={settings.hapticFeedback}
            onValueChange={() => toggleSetting('hapticFeedback')}
            trackColor={{
              false: theme.colors.glass.whiteAlpha30,
              true: theme.colors.kreeda.accent,
            }}
            thumbColor={
              settings.hapticFeedback 
                ? theme.colors.kreeda.gold 
                : theme.colors.neutral.white
            }
          />
        </View>
      </GlassCard>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made in India 🇮🇳
        </Text>
        <Text style={styles.versionText}>
          Kreeda v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral.light,
  },

  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },

  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.kreeda.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[600],
    textAlign: 'center',
  },

  settingCard: {
    marginBottom: theme.spacing.md,
  },

  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingIcon: {
    fontSize: theme.typography.fontSize.xl,
    marginRight: theme.spacing.md,
  },

  settingText: {
    flex: 1,
  },

  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral.dark,
    marginBottom: theme.spacing.xs,
  },

  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[500],
  },

  settingArrow: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.kreeda.accent,
    fontWeight: theme.typography.fontWeight.bold,
  },

  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glass.whiteAlpha20,
  },

  footerText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.kreeda.primary,
    marginBottom: theme.spacing.sm,
  },

  versionText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[400],
  },
});

export default KreedaSettings;