/**
 * Kreeda Welcome Component
 * Distinctive Olympic-themed welcome screen with brand identity
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { theme } from '../../design/theme';
import { useTranslation } from '../../i18n';

interface KreedaWelcomeProps {
  onComplete: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

const KreedaWelcome: React.FC<KreedaWelcomeProps> = ({
  onComplete,
  duration = 3000,
}) => {
  const { t } = useTranslation();
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Animation values
  const logoScale = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const titleTranslateY = new Animated.Value(50);
  const titleOpacity = new Animated.Value(0);
  const subtitleOpacity = new Animated.Value(0);
  const hindiOpacity = new Animated.Value(0);
  const backgroundGradient = new Animated.Value(0);
  const pulseAnimation = new Animated.Value(1);

  useEffect(() => {
    // Start the welcome animation sequence
    startWelcomeAnimation();
  }, []);

  const startWelcomeAnimation = () => {
    // Phase 1: Background and logo entrance (0-800ms)
    Animated.parallel([
      Animated.timing(backgroundGradient, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimationPhase(1);
      
      // Phase 2: Title and subtitle (800-1600ms)
      Animated.parallel([
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationPhase(2);
        
        // Phase 3: Hindi text and pulsing effect (1600-2400ms)
        Animated.parallel([
          Animated.timing(hindiOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnimation, {
                toValue: 1.05,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnimation, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
        
        // Phase 4: Complete and transition (2400ms+)
        setTimeout(() => {
          setAnimationPhase(3);
          
          // Exit animation
          Animated.parallel([
            Animated.timing(logoOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(titleOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(subtitleOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(hindiOpacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start(onComplete);
        }, duration - 1600);
      });
    });
  };

  const backgroundColorInterpolation = backgroundGradient.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.kreeda.darkBlue, theme.colors.kreeda.primary],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: backgroundColorInterpolation }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.kreeda.primary} />
      
      {/* Background Olympic Rings Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.ring, styles.ring1]} />
        <View style={[styles.ring, styles.ring2]} />
        <View style={[styles.ring, styles.ring3]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { scale: pulseAnimation }],
            }
          ]}
        >
          <Text style={styles.logoEmoji}>
            {theme.kreedaBrand.symbols.logo}
          </Text>
          <Text style={styles.logoText}>
            {theme.kreedaBrand.symbols.sports}
          </Text>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            }
          ]}
        >
          <Text style={styles.title}>
            {t('login.title')}
          </Text>
          
          <Animated.Text 
            style={[styles.subtitle, { opacity: subtitleOpacity }]}
          >
            {t('login.subtitle')}
          </Animated.Text>
        </Animated.View>

        {/* Hindi Branding */}
        <Animated.View
          style={[
            styles.hindiContainer,
            { opacity: hindiOpacity }
          ]}
        >
          <Text style={styles.hindiTitle}>
            क्रीड़ा
          </Text>
          <Text style={styles.hindiTagline}>
            {t('branding.tagline')}
          </Text>
        </Animated.View>

        {/* Made in India Badge */}
        <Animated.View
          style={[
            styles.madeInIndiaContainer,
            { opacity: hindiOpacity }
          ]}
        >
          <Text style={styles.madeInIndia}>
            {t('branding.madeInIndia')}
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Accent */}
      <View style={styles.bottomAccent}>
        <View style={[styles.accentLine, styles.accentLine1]} />
        <View style={[styles.accentLine, styles.accentLine2]} />
        <View style={[styles.accentLine, styles.accentLine3]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  
  ring: {
    position: 'absolute',
    borderWidth: 8,
    borderRadius: 100,
  },
  
  ring1: {
    width: 200,
    height: 200,
    top: height * 0.2,
    left: width * 0.1,
    borderColor: theme.kreedaBrand.olympicRings.blue,
  },
  
  ring2: {
    width: 150,
    height: 150,
    top: height * 0.6,
    right: width * 0.1,
    borderColor: theme.kreedaBrand.olympicRings.yellow,
  },
  
  ring3: {
    width: 120,
    height: 120,
    bottom: height * 0.3,
    left: width * 0.3,
    borderColor: theme.kreedaBrand.olympicRings.green,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },

  logoEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
    textShadowColor: theme.colors.glass.darkAlpha50,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },

  logoText: {
    fontSize: 48,
    textShadowColor: theme.colors.glass.darkAlpha50,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  title: {
    fontSize: theme.typography.fontSize.display,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: 2,
    textShadowColor: theme.colors.glass.darkAlpha50,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.kreeda.skyBlue,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
  },

  hindiContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  hindiTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.kreeda.gold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: theme.colors.glass.darkAlpha50,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  hindiTagline: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.kreeda.lightOrange,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  madeInIndiaContainer: {
    alignItems: 'center',
  },

  madeInIndia: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral.white,
    textAlign: 'center',
  },

  bottomAccent: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  accentLine: {
    height: 4,
    marginVertical: theme.spacing.xs,
    borderRadius: 2,
  },

  accentLine1: {
    width: 80,
    backgroundColor: theme.colors.kreeda.accent,
  },

  accentLine2: {
    width: 120,
    backgroundColor: theme.colors.kreeda.gold,
  },

  accentLine3: {
    width: 60,
    backgroundColor: theme.colors.kreeda.skyBlue,
  },
});

export default KreedaWelcome;