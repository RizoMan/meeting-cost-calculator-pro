export const theme = {
  colors: {
    background: '#09090B', // Very dark zinc
    surface: '#18181B', // Slightly lighter zinc
    surfaceHighlight: '#27272A',
    primary: '#10B981', // Emerald 500
    primaryGlow: 'rgba(16, 185, 129, 0.3)',
    secondary: '#3B82F6', // Blue 500
    danger: '#EF4444', // Red 500
    warning: '#F59E0B', // Amber 500
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      muted: '#52525B',
    },
    border: '#27272A',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    full: 9999,
  },
  typography: {
    header: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -1,
    },
    subheader: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    mono: {
      fontFamily: 'Courier',
    }
  }
};
