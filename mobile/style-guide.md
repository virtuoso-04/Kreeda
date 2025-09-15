# Frontend Style Guide
## SIH Sports Talent Assessment MVP - Olympic Glassmorphism Design

### 🎨 **Color Palette**

Our design uses an Olympic-inspired color palette with glassmorphism effects:

#### Primary Colors
- **Primary Blue**: `#0B3D91` - Deep, authoritative blue representing trust and excellence
- **Accent Orange**: `#FF6A00` - Vibrant, energetic orange for CTAs and highlights
- **Soft Sky**: `#7FB3FF` - Light accent blue for secondary elements

#### Neutral Colors
- **Neutral White**: `#FFFFFF` - Pure white for backgrounds
- **Neutral Light**: `#F6F7FB` - Soft light gray for subtle backgrounds
- **Neutral Dark**: `#1F2937` - Deep gray for primary text

#### Glass/Translucent Variants
- **White Glass**: `rgba(255, 255, 255, 0.90)` - Primary glass cards
- **Blue Glass**: `rgba(11, 61, 145, 0.06)` - Blue-tinted glass elements
- **Dark Overlay**: `rgba(31, 41, 55, 0.70)` - Modal overlays

#### Semantic Colors
- **Success**: `#10B981` - Green for positive states
- **Warning**: `#F59E0B` - Amber for caution states  
- **Error**: `#EF4444` - Red for error states
- **Recording Active**: `#DC2626` - Red for active recording

---

### 📐 **Spacing System**

Based on 4px grid system for consistent spacing:

- **xs**: 4px - Minimal spacing
- **sm**: 8px - Small spacing
- **md**: 12px - Medium spacing  
- **lg**: 16px - Large spacing
- **xl**: 20px - Extra large spacing
- **xxl**: 24px - Double extra large
- **xxxl**: 32px - Triple extra large
- **huge**: 48px - Huge spacing

#### Touch Targets
- **Minimum**: 44dp (accessibility requirement)
- **Preferred**: 48dp (comfortable touch)
- **Large CTA**: 56dp (primary buttons)

---

### 🔤 **Typography Scale**

Font stack: Helvetica Neue (iOS) / sans-serif (Android) / Inter (web fallback)

#### Font Sizes (optimized for rural India - larger sizes)
- **xs**: 12px - Small labels, metadata
- **sm**: 14px - Body text, secondary content
- **md**: 16px - Default body text
- **lg**: 18px - Large body text, small headings
- **xl**: 20px - Medium headings
- **xxl**: 22px - Large CTAs, prominent text
- **xxxl**: 24px - Large headings
- **huge**: 28px - Extra large headings
- **display**: 32px - Display text, hero content

#### Font Weights
- **Regular**: 400 - Body text, descriptions
- **Semibold**: 600 - Headings, emphasis
- **Bold**: 800 - Major headings, brand text

#### Line Heights
- **Tight**: 1.2 - Headings, compact text
- **Normal**: 1.4 - Default body text
- **Relaxed**: 1.6 - Longer content
- **Loose**: 1.8 - Very readable content

---

### 🪟 **Glassmorphism Components**

#### Glass Card Variants

**Light Glass Card** (Primary)
```tsx
backgroundColor: rgba(255, 255, 255, 0.90)
borderWidth: 1
borderColor: rgba(255, 255, 255, 0.30)
borderRadius: 12px
shadow: soft (0,4) opacity 0.05
```

**Blue Glass Card** (Secondary)
```tsx
backgroundColor: rgba(11, 61, 145, 0.06)
borderWidth: 1  
borderColor: rgba(11, 61, 145, 0.10)
borderRadius: 12px
shadow: soft (0,4) opacity 0.05
```

**Overlay Glass** (Modals)
```tsx
backgroundColor: rgba(31, 41, 55, 0.70)
borderWidth: 1
borderColor: rgba(255, 255, 255, 0.10)
```

---

### 🎛️ **Component Usage Examples**

#### GlassCard
```tsx
// Basic content card
<GlassCard title="Exercise Stats" variant="light">
  <Text>Your content here</Text>
</GlassCard>

// Interactive card with right element
<GlassCard 
  title="Push-ups" 
  variant="blue"
  rightElement={<IconButton icon="?" />}
>
  <Text>Ready to start recording?</Text>
</GlassCard>
```

#### PrimaryButton
```tsx
// Large CTA button
<PrimaryButton 
  title="Start Recording" 
  onPress={handleRecord}
  size="large"
  variant="primary"
/>

// Loading state
<PrimaryButton 
  title="Uploading..." 
  onPress={handleUpload}
  loading={true}
  disabled={true}
/>
```

#### VideoRecorder
```tsx
<VideoRecorder
  isRecording={recording}
  onStartRecording={handleStart}
  onStopRecording={handleStop}
  duration={recordingTime}
  maxDuration={30}
  testType="pushup"
  showGuidance={true}
/>
```

---

### ♿ **Accessibility Guidelines**

#### Touch Targets
- Minimum 44x44dp for all interactive elements
- Preferred 48x48dp for comfortable interaction
- Large CTAs use 56x56dp minimum

#### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Large text meets 3:1 minimum
- Focus indicators use 2px orange outline

#### Screen Reader Support
```tsx
<PrimaryButton
  title="Start Recording"
  accessibilityLabel="Start recording push-ups"
  accessibilityHint="Begins video recording for exercise analysis"
  accessibilityRole="button"
/>
```

#### Text Scaling
- Supports OS-level text scaling
- Uses relative font sizes where possible
- Maintains layout integrity at 150% scale

---

### 🌍 **Internationalization (i18n)**

#### Language Support
- **English**: Primary language, full support
- **हिंदी (Hindi)**: Complete translations for rural India

#### Usage Pattern
```tsx
const { t, language, changeLanguage } = useTranslation();

// Basic translation
<Text>{t('login.title')}</Text>

// With parameters
<Text>{t('welcome.message', { name: athleteName })}</Text>

// Language switcher
<LanguageSelector 
  size="medium"
  showLabels={true}
/>
```

---

### 📱 **Mobile-First Design Principles**

#### Layout
- Single column layout prioritized
- Cards stack vertically with consistent gaps
- Horizontal scrolling only for optional content

#### Performance
- Reduced motion settings for low-end devices
- Efficient rendering with minimal re-renders
- Optimized for 2GB RAM Android devices

#### Network Awareness
- Offline-first design patterns
- Persistent offline indicators
- Queue management for uploads

---

### 🎭 **Animation & Micro-interactions**

#### Duration & Easing
- **Fast**: 150ms - Hover states, focus
- **Normal**: 250ms - Standard transitions
- **Slow**: 400ms - Complex state changes

#### Common Patterns
```tsx
// Button press feedback
activeOpacity={0.8}

// Scale animation for recording button
transform: [{ scale: pulseAnim }]

// Smooth fade transitions
opacity: fadeAnim
```

---

### 🏗️ **Component Architecture**

#### File Structure
```
src/
├── design/
│   └── theme.ts          # Design tokens
├── components/
│   └── ui/               # Reusable UI components
│       ├── GlassCard.tsx
│       ├── PrimaryButton.tsx
│       └── index.ts      # Exports
├── screens/
│   └── redesigned/       # New Olympic-themed screens
├── i18n/
│   └── index.ts          # Translation system
```

#### Import Pattern
```tsx
import { theme } from '../../design/theme';
import { useTranslation } from '../../i18n';
import { GlassCard, PrimaryButton } from '../../components/ui';
```

---

### 📏 **Responsive Breakpoints**

- **Mobile**: 0px+ (Primary target)
- **Tablet**: 768px+ (Two-column layout)
- **Desktop**: 1024px+ (Dashboard view)
- **Wide**: 1440px+ (Large displays)

---

### 🔍 **Testing & Quality**

#### Visual Regression
- Test glassmorphism effects on different backgrounds
- Verify contrast ratios in all states
- Check component layout at various scales

#### Accessibility Testing
- TalkBack/VoiceOver navigation
- Keyboard navigation support
- High contrast mode compatibility

#### Performance Testing
- Smooth 60fps animations on low-end devices
- Memory usage under 100MB for main flow
- App launch time under 3 seconds

---

This style guide ensures consistent, accessible, and beautiful implementation of the Olympic-themed glassmorphism design across the entire SIH Sports Talent Assessment MVP.