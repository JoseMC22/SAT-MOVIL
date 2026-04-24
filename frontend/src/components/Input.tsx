import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    error?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
    containerStyle?: any;
    style?: any;
    editable?: boolean;
}

export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    error,
    autoCapitalize = 'sentences',
    autoCorrect = true,
    leftIcon,
    rightIcon,
    onRightIconPress,
    maxLength,
    multiline,
    numberOfLines,
    containerStyle,
    style,
    editable = true,
}: InputProps) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.label, { color: theme.colors.slate }]}>{label.toUpperCase()}</Text>
            <View style={[
                styles.inputWrapper,
                {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.white,
                },
                isFocused && { borderColor: theme.colors.primary },
                !!error && { borderColor: theme.colors.error },
                multiline && { height: 'auto', minHeight: 120, paddingVertical: 12, alignItems: 'flex-start' }
            ]}>
                {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
                <TextInput
                    style={[styles.input, { color: theme.colors.text }, style]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.slate}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={editable}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.iconContainer}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {!!error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    label: {
        marginBottom: 4,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        paddingVertical: 0,
        fontWeight: '500',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
