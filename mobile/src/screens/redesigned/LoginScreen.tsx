/**
 * LoginScreen (Redesigned)
 * Olympic-themed glassmorphism design with i18n support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
// Note: In production, import from actual navigation setup
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '../../../App';

// Temporary types for development
type RootStackParamList = {
  Login: undefined;
  TestSelect: { athleteName: string };
  Record: { athleteName: string; testType: string };
  Results: { jobId?: string; result?: any };
};

type StackNavigationProp<T, K extends keyof T> = {
  navigate: <RouteName extends keyof T>(screen: RouteName, params: T[RouteName]) => void;
  goBack: () => void;
};
import { theme } from '../../design/theme';
import { useTranslation } from '../../i18n';
import {
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  LanguageSelector,
  OfflineBanner,
} from '../../components/ui';
import { db } from '../../services/db';
import uploadService from '../../services/upload';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [athleteName, setAthleteName] = useState('');
  const [backendUrl, setBackendUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadStoredData();
    checkConnection();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedName = await db.getAthleteName();
      const storedUrl = await db.getBackendUrl();
      
      if (storedName) {
        setAthleteName(storedName);
      }
      setBackendUrl(storedUrl);
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const checkConnection = async () => {
    const connected = await uploadService.testConnection();
    setIsOffline(!connected);
  };

  const handleLogin = async () => {
    if (!athleteName.trim()) {
      Alert.alert(t('common.error'), t('login.errorEmptyName'));
      return;
    }

    setIsLoading(true);

    try {
      // Save athlete name
      await db.saveAthleteName(athleteName.trim());

      // Update backend URL if changed
      if (backendUrl.trim()) {
        await uploadService.setBackendUrl(backendUrl.trim());
      }

      // Test backend connection
      const connected = await uploadService.testConnection();
      if (!connected) {
        Alert.alert(
          t('login.connectionWarning'),
          t('login.connectionMessage'),
          [
            {
              text: t('login.continueOffline'),
              onPress: () => proceedToNextScreen(),
            },
            {
              text: t('login.checkSettings'),
              style: 'cancel',
            },
          ],
        );
        setIsLoading(false);
        return;
      }

      proceedToNextScreen();
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('common.error'), t('login.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToNextScreen = () => {
    navigation.navigate('TestSelect', { athleteName: athleteName.trim() });
  };

  const showNetworkHelp = () => {
    Alert.alert(
      t('help.networkTitle'),
      t('help.networkMessage'),
      [{ text: t('common.ok') }],
    );
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      {/* Offline Banner */}
      <OfflineBanner isOffline={isOffline} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.logoEmoji}>🏃‍♂️</Text>
              <GlassCard
                variant="light"
                style={styles.titleCard}
              >
                <Text style={styles.title}>{t('login.title')}</Text>
                <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
              </GlassCard>
              
              {/* Language Selector */}
              <View style={styles.languageContainer}>
                <LanguageSelector size="medium" />
              </View>
            </View>
          </View>

          {/* Main Form */}
          <View style={styles.content}>
            <GlassCard
              title={t('login.athleteNameLabel')}
              variant="light"
              size="large"
              style={styles.formCard}
            >
              <TextInput
                style={styles.input}
                value={athleteName}
                onChangeText={setAthleteName}
                placeholder={t('login.athleteNamePlaceholder')}
                placeholderTextColor={theme.colors.neutral.gray[400]}
                autoCapitalize="words"
                autoComplete="name"
                accessible={true}
                accessibilityLabel={t('login.athleteNameLabel')}
                accessibilityHint="Enter your full name for identification"
              />
            </GlassCard>

            {/* Advanced Settings Toggle */}
            <View style={styles.advancedToggle}>
              <SecondaryButton
                title={showAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings'}
                onPress={toggleAdvanced}
                showUnderline={false}
              />
            </View>

            {/* Advanced Settings */}
            {showAdvanced && (
              <GlassCard
                title={t('login.backendUrlLabel')}
                variant="blue"
                size="large"
                style={styles.formCard}
                rightElement={
                  <IconButton
                    icon="?"
                    onPress={showNetworkHelp}
                    accessibilityLabel={t('accessibility.showHelp')}
                    accessibilityHint={t('accessibility.openHelpDialog')}
                    size="small"
                  />
                }
              >
                <TextInput
                  style={styles.input}
                  value={backendUrl}
                  onChangeText={setBackendUrl}
                  placeholder={t('login.backendUrlPlaceholder')}
                  placeholderTextColor={theme.colors.neutral.gray[400]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessible={true}
                  accessibilityLabel={t('login.backendUrlLabel')}
                  accessibilityHint="Server address for video analysis"
                />
              </GlassCard>
            )}

            {/* Continue Button */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title={isLoading ? t('login.connecting') : t('login.continueButton')}
                onPress={handleLogin}
                disabled={isLoading || !athleteName.trim()}
                loading={isLoading}
                size="large"
                accessible={true}
                accessibilityHint="Proceeds to exercise selection"
              />
            </View>

            {/* Footer */}
            <GlassCard
              variant="blue"
              style={styles.footerCard}
            >
              <Text style={styles.footerText}>
                {t('login.footer')}
              </Text>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },

  keyboardAvoid: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxxl,
  },

  header: {
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xxl,
    alignItems: 'center',
  },

  headerContent: {
    alignItems: 'center',
    width: '100%',
  },

  logoEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.xl,
    textShadowColor: theme.colors.glass.darkAlpha50,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  titleCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    minWidth: '80%',
  },

  title: {
    fontSize: theme.typography.fontSize.huge,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[600],
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  languageContainer: {
    marginTop: theme.spacing.lg,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },

  formCard: {
    width: '100%',
  },

  input: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.dark,
    backgroundColor: theme.colors.glass.whiteAlpha30,
    borderWidth: 1,
    borderColor: theme.colors.glass.whiteAlpha30,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.accessibility.preferredTouchTarget,
    marginTop: theme.spacing.sm,
  },

  advancedToggle: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },

  buttonContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },

  footerCard: {
    alignItems: 'center',
    marginTop: theme.spacing.xxxl,
  },

  footerText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
    opacity: 0.8,
  },
});

export default LoginScreen;