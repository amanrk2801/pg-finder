// Theme Constants for PG Finder App
// Consistent colors, spacing, and UI elements across the app

export const COLORS = {
  // Primary Colors (Airbnb-inspired)
  primary: '#FF385C',
  primaryLight: '#FF5A75',
  primaryDark: '#E31C5F',
  
  // Secondary Colors
  secondary: '#00A699',
  secondaryLight: '#00C4B4',
  secondaryDark: '#008F84',
  
  // Neutral Colors
  black: '#222',
  white: '#fff',
  gray: '#717171',
  grayLight: '#B0B0B0',
  grayLighter: '#DDDDDD',
  grayLightest: '#F7F7F7',
  
  // Background Colors
  background: '#fff',
  backgroundGray: '#F7F7F7',
  backgroundPink: '#FFF5F7',
  
  // Border Colors
  border: '#EBEBEB',
  borderLight: '#DDDDDD',
  
  // Status Colors
  success: '#00A699',
  error: '#FF385C',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Text Colors
  textPrimary: '#222',
  textSecondary: '#717171',
  textLight: '#999',
  textWhite: '#fff',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  whiteOverlay: 'rgba(255, 255, 255, 0.9)',
  whiteOverlayLight: 'rgba(255, 255, 255, 0.95)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  massive: 32,
  giant: 36,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 14,
  xxl: 16,
  xxxl: 20,
  round: 50,
  circle: 1000,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primary: {
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    shadowColor: '#00A699',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export const INPUT_STYLES = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundGray,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerFocused: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.medium,
  },
};

export const CARD_STYLES = {
  default: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    ...SHADOWS.medium,
  },
  elevated: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    ...SHADOWS.large,
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: FONT_SIZES.massive,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  h2: {
    fontSize: FONT_SIZES.huge,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h4: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textPrimary,
  },
  bodyBold: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textSecondary,
  },
  small: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textLight,
  },
};

export default {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  BUTTON_STYLES,
  INPUT_STYLES,
  CARD_STYLES,
  TYPOGRAPHY,
};
