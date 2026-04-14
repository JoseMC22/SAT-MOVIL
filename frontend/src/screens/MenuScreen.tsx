import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Animated, Dimensions, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Search, Mail, MessageCircle, LogOut, Moon, Sun, Clock, AlertCircle, ShieldCheck, ChevronRight, Menu, X, User, HelpCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authService, messageService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useRef } from 'react';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export default function MenuScreen({ navigation }: any) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user, token, logout } = useAuth();
    const [unreadMessagesMsg, setUnreadMessagesMsg] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuAnimation = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    const toggleMenu = (open: boolean) => {
        setIsMenuOpen(open);
        Animated.timing(menuAnimation, {
            toValue: open ? 0 : -DRAWER_WIDTH,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleLogout = async () => {
        try {
            if (token) {
                await authService.logout(token);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await logout();
            navigation.replace('Login');
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchUnreadCount = async () => {
                if (token) {
                    try {
                        const data = await messageService.getUnreadCount(token);
                        setUnreadMessagesMsg(data.count);
                    } catch (error) {
                        console.error('Error fetching unread count:', error);
                    }
                }
            };
            fetchUnreadCount();
        }, [token])
    );

    const MenuOption = ({ icon: Icon, title, onPress, color }: any) => (
        <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
            <View style={[styles.drawerIconCircle, { backgroundColor: isDarkMode ? '#2D3748' : '#F0F7FF' }]}>
                <Icon color={color || theme.colors.primary} size={22} />
            </View>
            <Text style={[styles.drawerItemText, { color: theme.colors.text }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />

            {/* Side Menu Drawer */}
            {isMenuOpen && (
                <Pressable 
                    style={styles.drawerOverlay} 
                    onPress={() => toggleMenu(false)}
                >
                    <Animated.View style={{ 
                        flex: 1, 
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        opacity: menuAnimation.interpolate({
                            inputRange: [-DRAWER_WIDTH, 0],
                            outputRange: [0, 1]
                        })
                    }} />
                </Pressable>
            )}

            <Animated.View style={[
                styles.drawerContainer, 
                { 
                    backgroundColor: isDarkMode ? '#1A202C' : '#FFF',
                    transform: [{ translateX: menuAnimation }]
                }
            ]}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.drawerHeader}>
                        <TouchableOpacity onPress={() => toggleMenu(false)} style={styles.closeButton}>
                            <X color={theme.colors.text} size={28} />
                        </TouchableOpacity>
                        <Text style={[styles.drawerHeaderText, { color: theme.colors.text }]}>Menú Principal</Text>
                    </View>

                    <ScrollView style={styles.drawerContent}>
                        <View style={styles.drawerSection}>
                            <MenuOption 
                                icon={User} 
                                title="Mi Perfil" 
                                onPress={() => { toggleMenu(false); navigation.navigate('Profile'); }} 
                            />
                            <MenuOption 
                                icon={ShieldCheck} 
                                title="Cambiar contraseña" 
                                onPress={() => { toggleMenu(false); navigation.navigate('ChangePassword'); }} 
                            />
                            <MenuOption 
                                icon={HelpCircle} 
                                title="Centro de Ayuda" 
                                onPress={() => { toggleMenu(false); navigation.navigate('Contact'); }} 
                            />
                            <View style={[styles.drawerDivider, { backgroundColor: theme.colors.border }]} />
                            <MenuOption 
                                icon={LogOut} 
                                title="Cerrar Sesión" 
                                color={theme.colors.error}
                                onPress={() => { toggleMenu(false); handleLogout(); }} 
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.drawerFooter}>
                        <Text style={[styles.footerText, { color: theme.colors.slate }]}>SAT ICA Móvil</Text>
                        <Text style={[styles.versionText, { color: theme.colors.slate }]}>Versión 1.3.56</Text>
                    </View>
                </SafeAreaView>
            </Animated.View>

            {/* Blue Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => toggleMenu(true)} style={styles.menuIconButton}>
                    <Menu color="#FFF" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Menú Principal</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
                        {/* Greeting Section */}
                        <View style={styles.greetingSection}>
                            <Text style={[styles.welcomeText, { color: theme.colors.slate }]}>Bienvenido,</Text>
                            <Text style={[styles.nameText, { color: theme.colors.primary }]}>{user?.nombre?.toUpperCase() || 'CONTRIBUYENTE'}</Text>
                            <View style={[styles.yellowLine, { backgroundColor: theme.colors.secondary }]} />
                        </View>

                        {/* Grid Menu Options (2x2) */}
                        <View style={styles.grid}>
                            {/* Card 1: Consulta Deuda */}
                            <TouchableOpacity
                                style={[styles.cardSmall, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}
                                onPress={() => navigation.navigate('DebtInquiry')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#F0F7FF' }]}>
                                    <Search color={theme.colors.primary} size={28} />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Consulta Deuda</Text>
                            </TouchableOpacity>

                            {/* Card 1.5: Papeletas */}
                            <TouchableOpacity
                                style={[styles.cardSmall, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}
                                onPress={() => navigation.navigate('PapeletaInquiry')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#FFF4F4' }]}>
                                    <AlertCircle color={theme.colors.error} size={28} />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Papeletas</Text>
                            </TouchableOpacity>

                            {/* Card 2: Buzón de Mensajes */}
                            <TouchableOpacity
                                style={[styles.cardSmall, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}
                                onPress={() => navigation.navigate('Mailbox')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#F0F7FF' }]}>
                                    <Mail color={theme.colors.primary} size={28} />
                                    {unreadMessagesMsg > 0 && (
                                        <View style={styles.badgeContainer}>
                                            <Text style={styles.badgeText}>{unreadMessagesMsg}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Buzón de Mensajes</Text>
                            </TouchableOpacity>

                            {/* Card 3: Estado de Trámites */}
                            <TouchableOpacity
                                style={[styles.cardSmall, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}
                                onPress={() => navigation.navigate('TramiteStatus')}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#F0F7FF' }]}>
                                    <Clock color={theme.colors.primary} size={28} />
                                </View>
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Estado de Trámites</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Dark Mode Toggle */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.darkModeButton, { backgroundColor: isDarkMode ? '#2D3748' : '#F0F7FF' }]}
                                onPress={toggleTheme}
                            >
                                {isDarkMode ? (
                                    <Sun size={24} color={theme.colors.secondary} />
                                ) : (
                                    <Moon size={24} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Institutional Footer */}
                        <View style={styles.footer}>
                            <Text style={[styles.footerBrand, { color: theme.colors.slate }]}>SAT ICA</Text>
                            <Text style={[styles.footerSubtitle, { color: theme.colors.slate }]}>SERVICIO DE ADMINISTRACIÓN TRIBUTARIA</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightTheme.colors.background,
    },
    header: {
        backgroundColor: lightTheme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 60,
    },
    menuIconButton: {
        padding: 5,
        marginLeft: -5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scroll: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    contentScroll: {
        flex: 1,
        marginTop: -40,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    greetingSection: {
        marginTop: 10,
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '500',
    },
    nameText: {
        fontSize: 26,
        fontWeight: '900',
        marginTop: 4,
        lineHeight: 32,
    },
    yellowLine: {
        height: 4,
        width: 50,
        marginTop: 8,
        borderRadius: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    cardSmall: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
    bottomActions: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    darkModeButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerBrand: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
        opacity: 0.6,
    },
    footerSubtitle: {
        fontSize: 9,
        opacity: 0.5,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '600',
    },
    /* Drawer Styles */
    drawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    drawerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: DRAWER_WIDTH,
        height: '100%',
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 20,
    },
    closeButton: {
        padding: 5,
        marginRight: 15,
    },
    drawerHeaderText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    drawerContent: {
        flex: 1,
        paddingHorizontal: 10,
    },
    drawerSection: {
        paddingTop: 10,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    drawerIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    drawerItemText: {
        fontSize: 16,
        fontWeight: '600',
    },
    drawerDivider: {
        height: 1,
        marginVertical: 15,
        marginHorizontal: 10,
    },
    drawerFooter: {
        padding: 20,
        borderTopWidth: 0,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    versionText: {
        fontSize: 10,
        marginTop: 4,
    },
});
