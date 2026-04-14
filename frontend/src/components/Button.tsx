import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    color?: string;
    textColor?: string;
    style?: any;
}

export const Button = ({
    title,
    onPress,
    loading,
    variant = 'primary',
    icon,
    iconPosition = 'left',
    color,
    textColor,
    style
}: ButtonProps) => {
    const { theme } = useTheme();

    const backgroundColor = variant === 'outline' ? theme.colors.white : (color || (
        variant === 'secondary' ? theme.colors.secondary :
        theme.colors.primary
    ));

    const finalTextColor = textColor || (
        variant === 'outline' ? (color || theme.colors.primary) : 
        '#FFFFFF'
    );

    const borderColor = color || (
        variant === 'outline' ? theme.colors.border : 
        'transparent'
    );

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor },
                variant === 'outline' && { borderColor, borderWidth: 1.5 },
                loading && styles.disabled,
                variant === 'primary' && {
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                },
                style,
            ]}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
                    <Text style={[
                        styles.text,
                        { color: finalTextColor }
                    ]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 8,
        height: 56,
    },
    disabled: {
        opacity: 0.7,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontWeight: '700',
        fontSize: 16,
    },
    iconLeft: {
        marginRight: 10,
    },
    iconRight: {
        marginLeft: 10,
    },
});
