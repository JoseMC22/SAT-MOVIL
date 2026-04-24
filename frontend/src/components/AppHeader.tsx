import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Moon, Sun, Menu } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    leftIcon?: React.ReactNode;
    onLeftPress?: () => void;
    rightComponent?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = true,
    leftIcon,
    onLeftPress,
    rightComponent
}) => {
    const navigation = useNavigation();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else if (showBack) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.outerContainer}>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#005696" 
                translucent={false}
            />
            <LinearGradient
                colors={['#005696', '#0071bc']}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Left Slot */}
                    <View style={styles.leftSlot}>
                        {showBack || leftIcon ? (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleLeftPress}
                            >
                                {leftIcon || <ArrowLeft color="#FFF" size={24} />}
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 40 }} />
                        )}
                    </View>

                    {/* Title Slot */}
                    <View style={styles.titleSlot}>
                        <Text 
                            style={[styles.title, { fontFamily: theme.fonts.bold }]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                    </View>

                    {/* Right Slot (Theme Toggle + optional component) */}
                    <View style={styles.rightSlot}>
                        {rightComponent}
                        <TouchableOpacity
                            style={[
                                styles.themeToggle, 
                                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }
                            ]}
                            onPress={toggleTheme}
                        >
                            {isDarkMode ? (
                                <Sun size={20} color={theme.colors.secondary} />
                            ) : (
                                <Moon size={20} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
    },
    container: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 50, // Added padding for the overlapping content pattern
        paddingHorizontal: 20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
    },
    leftSlot: {
        width: 50,
        alignItems: 'flex-start',
    },
    titleSlot: {
        flex: 1,
        alignItems: 'center',
    },
    rightSlot: {
        width: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    iconButton: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 18,
        color: '#FFF',
        textAlign: 'center',
    },
    themeToggle: {
        padding: 8,
        borderRadius: 12,
    },
});
