/**
 * Kreeda Design System & Theme Tokens
 * Olympic-themed glassmorphism design for Kreeda Sports Talent Assessment
 * 
 * Brand Guidelines:
 * - Kreeda (क्रीड़ा) - Sports Excellence Brand Identity
 * - Mobile-first, accessible design for rural India
 * - Glassmorphism with translucent panels and backdrop blur
 * - Olympic-inspired colors representing sports excellence
 * - WCAG AA accessibility compliance
 * - Large touch targets (48dp+) for comfortable interaction
 */

import { Platform } from 'react-native';

/**
 * COLOR TOKENS
 * Olympic-inspired palette with glassmorphism variants
 */
export const colors = {
  // Kreeda Brand Palette
  kreeda: {
    primary: '#0B3D91',    // Kreeda Deep Blue (Olympic-inspired)
    accent: '#FF6A00',     // Kreeda Orange (Energy & Excellence)
    skyBlue: '#7FB3FF',    // Kreeda Sky (Aspiration)
    gold: '#FFD700',       // Achievement Gold
    darkBlue: '#062A6B',   // Darker brand variant
    lightOrange: '#FF8A33', // Lighter accent variant
  },
  
  // Primary Palette (maintaining backward compatibility)
  primary: {
    blue: '#0B3D91',      // Primary Blue (deep)
    orange: '#FF6A00',    // Accent Orange (vibrant)
    skyBlue: '#7FB3FF',   // Soft Sky (light accent)
  },
  
  // Neutral Palette
  neutral: {
    white: '#FFFFFF',
    light: '#F6F7FB',     // Neutral Light
    dark: '#1F2937',      // Neutral Dark (text)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6', 
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    }
  },

  // Glass/Translucent Variants
  glass: {
    // White glass overlays
    whiteAlpha10: 'rgba(255, 255, 255, 0.10)',
    whiteAlpha20: 'rgba(255, 255, 255, 0.20)',
    whiteAlpha30: 'rgba(255, 255, 255, 0.30)',
    whiteAlpha90: 'rgba(255, 255, 255, 0.90)',
    
    // Blue tinted glass
    blueAlpha06: 'rgba(11, 61, 145, 0.06)',
    blueAlpha10: 'rgba(11, 61, 145, 0.10)',
    blueAlpha20: 'rgba(11, 61, 145, 0.20)',
    
    // Orange tinted glass
    orangeAlpha10: 'rgba(255, 106, 0, 0.10)',
    orangeAlpha20: 'rgba(255, 106, 0, 0.20)',
    
    // Dark overlays
    darkAlpha50: 'rgba(31, 41, 55, 0.50)',
    darkAlpha70: 'rgba(31, 41, 55, 0.70)',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Amber
    error: '#EF4444',      // Red
    info: '#3B82F6',       // Blue
    
    // Glass variants
    successAlpha: 'rgba(16, 185, 129, 0.15)',
    warningAlpha: 'rgba(245, 158, 11, 0.15)',
    errorAlpha: 'rgba(239, 68, 68, 0.15)',
    infoAlpha: 'rgba(59, 130, 246, 0.15)',
  },

  // Recording States
  recording: {
    active: '#DC2626',     // Red for recording
    inactive: '#6B7280',   // Gray for not recording
    countdown: '#F59E0B',  // Amber for countdown
  }
};

/**
 * SPACING TOKENS
 * 4px grid system for consistent spacing
 */
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px  
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
  huge: 48, // 48px
  
  // Touch targets (minimum 44dp)
  touchTarget: 44,
  touchTargetLarge: 56,
} as const;

/**
 * TYPOGRAPHY TOKENS
 * Helvetica-inspired with fallback to system fonts
 * Optimized for readability on low-end Android devices
 */
export const typography = {
  // Font families
  fontFamily: {
    primary: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      default: 'Inter, system-ui, sans-serif'
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace', 
      default: 'Consolas, monospace'
    })
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '800' as const,
  },

  // Font sizes (optimized for rural India - larger sizes)
  fontSize: {
    xs: 12,   // Small labels
    sm: 14,   // Body text
    md: 16,   // Default body
    lg: 18,   // Large body/small headings
    xl: 20,   // Medium headings
    xxl: 22,  // Large CTAs
    xxxl: 24, // Large headings
    huge: 28, // Extra large headings
    display: 32, // Display text
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  }
};

/**
 * BORDER RADIUS TOKENS
 * Consistent rounded corners for glassmorphism
 */
export const borderRadius = {
  none: 0,
  sm: 4,     // Small radius
  md: 8,     // Default radius
  lg: 12,    // Large radius (cards)
  xl: 16,    // Extra large radius
  xxl: 20,   // Very large radius
  round: 999, // Fully rounded (pills, buttons)
} as const;

/**
 * ELEVATION/SHADOW TOKENS
 * Glassmorphism-compatible shadows
 */
export const elevation = {
  // Subtle glassmorphic shadows
  glass: {
    shadowColor: colors.neutral.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2, // Android
  },
  
  // Medium elevation
  medium: {
    shadowColor: colors.neutral.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  
  // High elevation (modals)
  high: {
    shadowColor: colors.neutral.dark,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  
  // Button press state
  pressed: {
    shadowColor: colors.neutral.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  }
} as const;

/**
 * KREEDA GLASSMORPHISM PRESETS
 * Olympic-themed glass styles for distinctive branding
 */
export const glassPresets = {
  // Kreeda primary card (premium glass)
  cardLight: {
    backgroundColor: colors.glass.whiteAlpha90,
    borderWidth: 2,
    borderColor: colors.kreeda.lightOrange,
    borderStyle: 'solid',
    ...elevation.glass,
    // Add Kreeda brand gradient simulation
    backgroundImage: `linear-gradient(135deg, ${colors.glass.whiteAlpha90}, ${colors.glass.blueAlpha06})`,
  },
  
  // Kreeda excellence card (blue-gold)
  cardBlue: {
    backgroundColor: colors.glass.blueAlpha10,
    borderWidth: 2,
    borderColor: colors.kreeda.gold,
    borderStyle: 'solid',
    ...elevation.glass,
    // Olympic-inspired subtle glow
    shadowColor: colors.kreeda.gold,
    shadowOpacity: 0.1,
  },
  
  // Kreeda achievement overlay (gold accent)
  overlay: {
    backgroundColor: colors.glass.darkAlpha70,
    borderWidth: 1,
    borderColor: colors.kreeda.gold,
    borderStyle: 'solid',
    // Victory glow effect
    shadowColor: colors.kreeda.gold,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  
  // Kreeda action button (sports energy)
  buttonGlass: {
    backgroundColor: colors.glass.whiteAlpha30,
    borderWidth: 2,
    borderColor: colors.kreeda.accent,
    borderStyle: 'solid',
    ...elevation.pressed,
    // Energy glow for interactions
    shadowColor: colors.kreeda.accent,
    shadowOpacity: 0.15,
  },
  
  // Kreeda premium card (sports excellence)
  cardPremium: {
    backgroundColor: colors.glass.whiteAlpha90,
    borderWidth: 3,
    borderColor: colors.kreeda.primary,
    borderStyle: 'solid',
    ...elevation.high,
    // Excellence indicators
    shadowColor: colors.kreeda.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  
  // Kreeda success card (achievement)
  cardSuccess: {
    backgroundColor: colors.semantic.successAlpha,
    borderWidth: 2,
    borderColor: colors.semantic.success,
    borderStyle: 'solid',
    ...elevation.medium,
    // Success glow
    shadowColor: colors.semantic.success,
    shadowOpacity: 0.15,
  }
} as const;

/**
 * ANIMATION TOKENS
 * Micro-animations for smooth interactions
 */
export const animation = {
  // Duration (ms)
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  
  // Easing curves
  easing: {
    default: 'ease-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
} as const;

/**
 * ACCESSIBILITY TOKENS
 * WCAG AA compliant settings for inclusive design
 */
export const accessibility = {
  // Touch target sizes (enhanced for rural India)
  minTouchTarget: 44,        // WCAG minimum
  preferredTouchTarget: 48,  // Recommended comfortable size
  largeTouchTarget: 56,      // For primary actions
  
  // Text contrast ratios (calculated and verified)
  contrast: {
    normal: 4.5,    // WCAG AA normal text
    large: 3.0,     // WCAG AA large text (18pt+ or 14pt+ bold)
    enhanced: 7.0,  // WCAG AAA enhanced
  },
  
  // Focus indicators for keyboard/screen reader navigation
  focusRing: {
    width: 2,
    color: colors.kreeda.accent, // Kreeda orange for high visibility
    offset: 2,
    style: 'solid',
  },
  
  // Screen reader support
  screenReader: {
    announceDelay: 500, // ms delay for state changes
    longPressDelay: 800, // ms for long press recognition
  },
  
  // Reduced motion support
  reducedMotion: {
    animationDuration: 0, // Disable animations for motion sensitivity
    transitionDuration: 0,
  },
  
  // High contrast mode support
  highContrast: {
    backgroundContrast: '#000000',
    foregroundContrast: '#FFFFFF',
    borderContrast: '#FFFFFF',
  }
} as const;

/**
 * BREAKPOINTS
 * Responsive design breakpoints
 */
export const breakpoints = {
  mobile: 0,     // 0px+
  tablet: 768,   // 768px+
  desktop: 1024, // 1024px+
  wide: 1440,    // 1440px+
} as const;

/**
 * KREEDA BRAND ELEMENTS
 * Distinctive visual elements for Olympic sports branding
 */
export const kreedaBrand = {
  // Brand symbols and emojis
  symbols: {
    logo: '🏆',
    sports: '🏃‍♂️',
    excellence: '⭐',
    achievement: '🥇',
    strength: '💪',
    analysis: '🎯',
    india: '🇮🇳',
  },
  
  // Brand gradients (for future implementation)
  gradients: {
    primary: ['#0B3D91', '#7FB3FF'], // Deep blue to sky blue
    accent: ['#FF6A00', '#FF8A33'],  // Orange energy gradient
    success: ['#10B981', '#34D399'], // Achievement green
    premium: ['#FFD700', '#FFA500'], // Gold to orange excellence
  },
  
  // Olympic ring colors (for special occasions)
  olympicRings: {
    blue: '#0085C7',
    yellow: '#F4C300', 
    black: '#000000',
    green: '#009F3F',
    red: '#DF0024',
  },
  
  // Sports energy patterns
  patterns: {
    victory: {
      colors: ['#FFD700', '#FF6A00', '#0B3D91'],
      message: 'Victory achieved!',
    },
    progress: {
      colors: ['#7FB3FF', '#0B3D91'],
      message: 'Keep pushing!',
    },
    excellence: {
      colors: ['#FFD700', '#FFFFFF', '#0B3D91'],
      message: 'Excellence in motion!',
    },
  },
  
  // Motivational elements
  motivation: {
    hindi: [
      'जीत आपका इंतज़ार कर रही है', // Victory awaits you
      'अपनी क्षमता को पहचानें',    // Recognize your potential  
      'हर कदम एक जीत है',         // Every step is a victory
      'खेल में उत्कृष्टता',         // Excellence in sports
    ],
    english: [
      'Unleash Your Potential',
      'Every Rep Counts',  
      'Sports Excellence Awaits',
      'Champion Within',
    ],
  }
} as const;

/**
 * THEME OBJECT
 * Complete Kreeda theme export
 */
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  elevation,
  glassPresets,
  animation,
  accessibility,
  breakpoints,
  kreedaBrand,
} as const;

export default theme;

/**
 * TYPE DEFINITIONS
 * TypeScript types for theme usage
 */
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
export type Elevation = typeof elevation;
export type GlassPresets = typeof glassPresets;