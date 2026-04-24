import React, { useRef } from 'react';
import { Text, StyleSheet, Animated, Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface MenuCardProps {
    title: string;
    icon: any;
    onPress: () => void;
    badge?: number;
    iconColor?: string;
    disabled?: boolean;
    opacity?: number;
}

const MenuCard: React.FC<MenuCardProps> = ({ title, icon: Icon, onPress, badge, iconColor, disabled, opacity = 1 }) => {
    const { theme, isDarkMode } = useTheme();
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.94,
            useNativeDriver: true,
            friction: 4,
            tension: 50,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    // Dynamic Colors based on Theme
    const cardBgColor = theme.colors.card;
    const itemContentColor = isDarkMode ? '#F8FAFC' : theme.colors.primary;
    const shadowColor = isDarkMode ? '#000' : theme.colors.primary;

    return (
        <Animated.View style={[
            styles.container, 
            { 
                transform: [{ scale: scaleValue }],
                backgroundColor: cardBgColor,
                shadowColor: shadowColor,
                opacity: opacity,
            }
        ]}>
            <Pressable
                onPress={disabled ? undefined : onPress}
                onPressIn={disabled ? undefined : onPressIn}
                onPressOut={disabled ? undefined : onPressOut}
                style={styles.pressable}
            >
                <View style={styles.cardContent}>
                    {/* Subtle border for light mode contrast */}
                    {!isDarkMode && <View style={styles.lightBorder} />}
                    
                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,86,150,0.05)' }]}>
                        <Icon color={iconColor || itemContentColor} size={36} />
                        {badge !== undefined && badge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{badge}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.title, { fontFamily: theme.fonts.bold, color: itemContentColor }]}>
                        {title}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        aspectRatio: 1,
        marginBottom: 16,
        borderRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    pressable: {
        flex: 1,
    },
    cardContent: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    lightBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 24,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        position: 'relative',
    },
    title: {
        fontSize: 15,
        textAlign: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444',
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '900',
    },
});

export default MenuCard;
