/**
 * Design System & Theme Tokens
 * Olympic-themed glassmorphism design for SIH Sports Talent Assessment MVP
 * 
 * Visual Guidelines:
 * - Mobile-first, Android-optimized
 * - Glassmorphism with translucent panels and backdrop blur
 * - Olympic color palette (deep blue + vibrant orange)
 * - Helvetica-inspired typography with high contrast
 * - Large touch targets for rural India accessibility
 */

import { Platform } from 'react-native';

/**
 * COLOR TOKENS
 * Olympic-inspired palette with glassmorphism variants
 */
export const colors = {
  // Primary Palette
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
 * GLASSMORPHISM PRESETS
 * Pre-configured glass styles for common components
 */
export const glassPresets = {
  // Primary glass card (light)
  cardLight: {
    backgroundColor: colors.glass.whiteAlpha90,
    borderWidth: 1,
    borderColor: colors.glass.whiteAlpha30,
    ...elevation.glass,
  },
  
  // Secondary glass card (blue tinted)
  cardBlue: {
    backgroundColor: colors.glass.blueAlpha06,
    borderWidth: 1,
    borderColor: colors.glass.blueAlpha10,
    ...elevation.glass,
  },
  
  // Overlay glass (darker)
  overlay: {
    backgroundColor: colors.glass.darkAlpha70,
    borderWidth: 1,
    borderColor: colors.glass.whiteAlpha10,
  },
  
  // Button glass
  buttonGlass: {
    backgroundColor: colors.glass.whiteAlpha20,
    borderWidth: 1,
    borderColor: colors.glass.whiteAlpha30,
    ...elevation.pressed,
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
 * WCAG AA compliant settings
 */
export const accessibility = {
  // Minimum touch target sizes
  minTouchTarget: 44,
  preferredTouchTarget: 48,
  
  // Text contrast ratios (calculated)
  contrast: {
    normal: 4.5,  // WCAG AA
    large: 3.0,   // WCAG AA Large text
    enhanced: 7.0, // WCAG AAA
  },
  
  // Focus indicators
  focusRing: {
    width: 2,
    color: colors.primary.orange,
    offset: 2,
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
 * THEME OBJECT
 * Complete theme export
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