/**
 * LanguageSelector Component
 * Quick toggles for English / हिंदी (Hindi)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../design/theme';
import { Language, useTranslation } from '../../i18n';

export interface LanguageSelectorProps {
  style?: ViewStyle;
  size?: 'small' | 'medium';
  showLabels?: boolean;
  accessible?: boolean;
}

/**
 * Example Usage:
 * 
 * <LanguageSelector 
 *   size="medium"
 *   showLabels={true}
 * />
 * 
 * <LanguageSelector 
 *   size="small"
 *   showLabels={false}
 *   style={styles.headerLanguage}
 * />
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  size = 'medium',
  showLabels = true,
  accessible = true,
}) => {
  const { language, changeLanguage, t } = useTranslation();

  const languages: { code: Language; label: string; nativeLabel: string; flag: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  ];

  const handleLanguagePress = async (languageCode: Language) => {
    if (languageCode !== language) {
      await changeLanguage(languageCode);
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          padding: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
          minHeight: 36,
        };
      case 'medium':
      default:
        return {
          padding: theme.spacing.md,
          fontSize: theme.typography.fontSize.md,
          minHeight: theme.accessibility.minTouchTarget,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  return (
    <View style={[styles.container, style]}>
      {languages.map((lang) => {
        const isSelected = language === lang.code;
        
        return (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageButton,
              {
                paddingHorizontal: sizeStyle.padding,
                paddingVertical: sizeStyle.padding,
                minHeight: sizeStyle.minHeight,
              },
              isSelected && styles.selectedButton,
            ]}
            onPress={() => handleLanguagePress(lang.code)}
            accessible={accessible}
            accessibilityLabel={`Switch to ${lang.label}`}
            accessibilityState={{ selected: isSelected }}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>
              {lang.flag}
            </Text>
            {showLabels && (
              <Text
                style={[
                  styles.languageText,
                  { fontSize: sizeStyle.fontSize },
                  isSelected && styles.selectedText,
                ]}
              >
                {lang.nativeLabel}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.glass.whiteAlpha20,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.glass.whiteAlpha30,
    overflow: 'hidden',
  },

  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  selectedButton: {
    backgroundColor: theme.colors.primary.orange,
  },

  flag: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },

  languageText: {
    fontFamily: theme.typography.fontFamily.primary,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.neutral.dark,
    textAlign: 'center',
  },

  selectedText: {
    color: theme.colors.neutral.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default LanguageSelector;