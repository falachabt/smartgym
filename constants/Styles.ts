/**
 * Style constants for the SmartGym app
 * Based on the app's design system
 */

export const Colors = {
  // Primary colors
  primary: {
    main: '#00FF87', // Bright green accent
    dark: '#1A3A2E', // Dark green background
    darker: '#0D1F19', // Darker green for cards
    light: '#2D5A4A', // Light green for secondary elements
  },
  
  // UI colors
  background: {
    main: '#1A3A2E', // Main dark green background
    card: '#0D1F19', // Card background
    input: '#2B4A3F', // Input/Search background
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF', // White text
    secondary: '#A0ABA8', // Gray text for secondary info
    muted: '#6B7C77', // Muted text
  },
  
  // Accent colors
  accent: {
    green: '#00FF87',
    blue: '#4A90E2',
    red: '#FF6B6B',
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    gray: '#A0ABA8',
    darkGray: '#6B7C77',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Layout = {
  // Screen padding
  screenPadding: Spacing.md,
  
  // Card dimensions
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  
  // Grid
  grid: {
    gap: Spacing.md,
    columns: 2,
  },
  
  // Bottom navigation
  bottomNav: {
    height: 80,
    iconSize: 24,
  },
};

export const Images = {
  // Image aspect ratios
  aspectRatio: {
    square: 1,
    landscape: 16 / 9,
    portrait: 3 / 4,
  },
};

// Common component styles
export const CommonStyles = {
  // Search bar
  searchBar: {
    backgroundColor: Colors.background.input,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  
  // Filter chip
  chip: {
    active: {
      backgroundColor: Colors.primary.main,
      color: Colors.primary.dark,
      fontWeight: Typography.fontWeight.semibold,
    },
    inactive: {
      backgroundColor: Colors.background.input,
      color: Colors.text.secondary,
      fontWeight: Typography.fontWeight.medium,
    },
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  
  // Card
  machineCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden' as const,
    ...Shadows.sm,
  },
  
  // Button
  button: {
    primary: {
      backgroundColor: Colors.primary.main,
      color: Colors.primary.dark,
      fontWeight: Typography.fontWeight.bold,
    },
    secondary: {
      backgroundColor: Colors.background.input,
      color: Colors.text.primary,
      fontWeight: Typography.fontWeight.semibold,
    },
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
};
