export const lightTheme = {
    colors: {
        primary: '#0071BC',
        secondary: '#FBC02D',
        background: '#F8FAFC',
        slate: '#94A3B8',
        text: '#0F172A',
        white: '#FFFFFF',
        border: '#E2E8F0',
        error: '#EF4444',
        success: '#10B981',
        card: '#FFFFFF',
        selectTitle: '#0071bcff',
        selectListItem: '#0F172A',
        headerCard: '#0071bcff',
        bodyCard: '#0F172A',
        resultCard: '#F8FAFC',
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
        card: '#1E293B',
        slate: '#94A3B8', // Lighter slate for secondary text in dark mode
        selectTitle: '#FFFFFF',
        selectListItem: '#94A3B8',
        headerCard: '#FFFFFF',
        bodyCard: '#FFFFFF',
        resultCard: '#1E293B',
    },
};


export type Theme = typeof lightTheme;
export const theme = lightTheme; // Default for backward compatibility during transition

