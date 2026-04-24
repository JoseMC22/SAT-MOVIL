export const lightTheme = {
    colors: {
        primary: '#005696', // Institutional Blue
        secondary: '#FBC02D', // Institutional Yellow
        background: '#FFFFFF', // Pure White background
        slate: '#64748B',
        text: '#0F172A',
        white: '#FFFFFF',
        border: '#E2E8F0',
        error: '#EF4444',
        success: '#10B981',
        card: '#F1F5F9', // 'Dark White' / Light Slate for cards
        selectTitle: '#005696',
        selectListItem: '#0F172A',
        headerCard: '#005696',
        bodyCard: '#0F172A',
        resultCard: '#F8FAFC',
        glass: 'rgba(255, 255, 255, 0.4)',
        glassBorder: 'rgba(255, 255, 255, 0.5)',
    },
    fonts: {
        regular: 'Outfit_400Regular',
        medium: 'Outfit_600SemiBold',
        bold: 'Outfit_700Bold',
        black: 'Outfit_900Black',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
};

export const darkTheme = {
    ...lightTheme,
    colors: {
        ...lightTheme.colors,
        background: '#0F172A', // Deep Navy
        text: '#F8FAFC', // Almost white
        white: '#1E293B', // Dark slate for cards/inputs
        border: '#334155', // Visible border
        card: '#1E293B', // Deep Navy Slate for cards
        slate: '#94A3B8', // Lighter slate for secondary text in dark mode
        selectTitle: '#FFFFFF',
        selectListItem: '#94A3B8',
        headerCard: '#FFFFFF',
        bodyCard: '#FFFFFF',
        resultCard: '#1E293B',
        glass: 'rgba(255, 255, 255, 0.1)',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
    },
};

export type Theme = typeof lightTheme;
export const theme = lightTheme; // Default for backward compatibility

