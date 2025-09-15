/**
 * TestSelectScreen (Redesigned)
 * Olympic-themed grid of test cards with glassmorphism design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
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

// Temporary types (same as LoginScreen)
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

type TestSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TestSelect'
>;

type TestSelectScreenRouteProp = {
  params: { athleteName: string };
};

interface Props {
  navigation: TestSelectScreenNavigationProp;
  route: TestSelectScreenRouteProp;
}

interface Exercise {
  id: string;
  type: 'pushup' | 'situp';
  titleKey: string;
  descriptionKey: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

const exercises: Exercise[] = [
  {
    id: 'pushup',
    type: 'pushup',
    titleKey: 'testSelect.pushupTitle',
    descriptionKey: 'testSelect.pushupDescription',
    icon: '💪',
    difficulty: 'intermediate',
    estimatedTime: '2-3 min',
  },
  {
    id: 'situp',
    type: 'situp',
    titleKey: 'testSelect.situpTitle',
    descriptionKey: 'testSelect.situpDescription',
    icon: '🏃',
    difficulty: 'beginner',
    estimatedTime: '2-3 min',
  },
];

const TestSelectScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { athleteName } = route.params;

  const handleTestSelect = (testType: string) => {
    navigation.navigate('Record', {
      athleteName,
      testType,
    });
  };

  const showTestInfo = (exercise: Exercise) => {
    const helpKey = exercise.type === 'pushup' ? 'help.pushupInstructions' : 'help.situpInstructions';
    const titleKey = exercise.type === 'pushup' ? 'help.pushupTitle' : 'help.situpTitle';
    
    Alert.alert(
      t(titleKey),
      t(helpKey),
      [{ text: t('common.ok') }]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return theme.colors.semantic.success;
      case 'intermediate':
        return theme.colors.semantic.warning;
      case 'advanced':
        return theme.colors.semantic.error;
      default:
        return theme.colors.primary.blue;
    }
  };

  const getDifficultyLabel = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary.blue} />
      
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="←"
            onPress={handleGoBack}
            accessibilityLabel={t('accessibility.goBack')}
            size="medium"
            variant="glass"
          />
          <LanguageSelector size="small" showLabels={false} />
        </View>
        
        <GlassCard
          variant="light"
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>
            {t('testSelect.welcomeTitle', { name: athleteName })}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {t('testSelect.subtitle')}
          </Text>
        </GlassCard>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        <GlassCard
          variant="blue"
          style={styles.instructionsCard}
        >
          <Text style={styles.instructionsText}>
            {t('testSelect.instructions')}
          </Text>
        </GlassCard>

        {/* Exercise Grid */}
        <View style={styles.exerciseGrid}>
          {exercises.map((exercise) => (
            <GlassCard
              key={exercise.id}
              variant="light"
              size="large"
              style={styles.exerciseCard}
            >
              {/* Exercise Header */}
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseIcon}>
                  {exercise.icon}
                </Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseTitle}>
                    {t(exercise.titleKey)}
                  </Text>
                  <View style={styles.exerciseMeta}>
                    <View 
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(exercise.difficulty) }
                        ]}
                      >
                        {getDifficultyLabel(exercise.difficulty)}
                      </Text>
                    </View>
                    <Text style={styles.timeEstimate}>
                      ⏱ {exercise.estimatedTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Exercise Description */}
              <Text style={styles.exerciseDescription}>
                {t(exercise.descriptionKey)}
              </Text>

              {/* Action Buttons */}
              <View style={styles.exerciseActions}>
                <PrimaryButton
                  title="Start Recording"
                  onPress={() => handleTestSelect(exercise.type)}
                  size="medium"
                  style={styles.startButton}
                  accessibilityHint={`Start recording ${t(exercise.titleKey)} exercise`}
                />
                <SecondaryButton
                  title={t('testSelect.recordingTips')}
                  onPress={() => showTestInfo(exercise)}
                  showUnderline={false}
                  accessibilityHint={`Show recording tips for ${t(exercise.titleKey)}`}
                />
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Footer Info */}
        <GlassCard
          variant="blue"
          style={styles.footerCard}
        >
          <Text style={styles.footerText}>
            {t('testSelect.footer')}
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.blue,
  },

  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  welcomeCard: {
    alignItems: 'center',
  },

  welcomeTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[600],
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },

  instructionsCard: {
    alignItems: 'center',
  },

  instructionsText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed,
  },

  exerciseGrid: {
    gap: theme.spacing.xl,
  },

  exerciseCard: {
    width: '100%',
  },

  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },

  exerciseIcon: {
    fontSize: 48,
    marginRight: theme.spacing.lg,
    textAlign: 'center',
  },

  exerciseInfo: {
    flex: 1,
  },

  exerciseTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.dark,
    marginBottom: theme.spacing.sm,
  },

  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },

  difficultyText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },

  timeEstimate: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[500],
  },

  exerciseDescription: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.gray[600],
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing.lg,
  },

  exerciseActions: {
    gap: theme.spacing.md,
    alignItems: 'center',
  },

  startButton: {
    width: '100%',
  },

  footerCard: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
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

export default TestSelectScreen;