import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, Animated, Dimensions, Pressable, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Search, Mail, MessageCircle, LogOut, Moon, Sun, Clock, AlertCircle, ShieldCheck, ChevronRight, Menu, X, User, HelpCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authService, messageService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useRef } from 'react';
import MenuCard from '../components/MenuCard';
import { AppHeader } from '../components/AppHeader';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

export default function MenuScreen({ navigation }: any) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user, token, logout, isGuest } = useAuth();
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
            <Text style={[styles.drawerItemText, { color: theme.colors.text, fontFamily: theme.fonts.medium }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

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
                        <Text style={[styles.drawerHeaderText, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>Menú Principal</Text>
                    </View>

                    <ScrollView style={styles.drawerContent}>
                        <View style={styles.drawerSection}>
                            {!isGuest && (
                                <>
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
                                </>
                            )}
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
                        <Text style={[styles.footerText, { color: theme.colors.slate, fontFamily: theme.fonts.bold }]}>SAT ICA Móvil</Text>
                        <Text style={[styles.versionText, { color: theme.colors.slate, fontFamily: theme.fonts.regular }]}>Versión 1.3.56</Text>
                    </View>
                </SafeAreaView>
            </Animated.View>

            <AppHeader
                title="Menú Principal"
                showBack={false}
                leftIcon={<Menu color="#FFF" size={28} />}
                onLeftPress={() => toggleMenu(true)}
            />

            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[
                        styles.formCard,
                        {
                            backgroundColor: theme.colors.background,
                            shadowOpacity: isDarkMode ? 0 : 0.05,
                            elevation: isDarkMode ? 0 : 2,
                            borderTopWidth: isDarkMode ? 0 : 1,
                            borderColor: theme.colors.border
                        }
                    ]}>
                        {/* Greeting Section */}
                        <View style={styles.premiumGreeting}>
                            <View style={styles.greetingTextContainer}>
                                <Text style={[styles.welcomeText, { color: theme.colors.slate, fontFamily: theme.fonts.medium }]}>Hola,</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.nameText, { color: theme.colors.primary, fontFamily: theme.fonts.black }]}>
                                        {user?.nombre?.split(' ')[0] || 'CONTRIBUYENTE'}
                                    </Text>
                                    {isGuest && (
                                        <View style={[styles.guestBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                            <Text style={[styles.guestBadgeText, { color: theme.colors.primary, fontFamily: theme.fonts.bold }]}>INVITADO</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.subtitleText, { color: theme.colors.slate, fontFamily: theme.fonts.medium }]}>¿Qué hacemos hoy?</Text>
                            </View>
                            {/* <View style={[styles.avatarCircle, { backgroundColor: isDarkMode ? '#2D3748' : '#E0EEFF' }]}>
                                <User color={theme.colors.primary} size={32} />
                            </View> */}
                        </View>

                        {/* Grid Menu Options (2x2) */}
                        <View style={styles.grid}>
                            <MenuCard
                                title="Consulta Deuda"
                                icon={Search}
                                onPress={() => !isGuest && navigation.navigate('DebtInquiry')}
                                disabled={isGuest}
                                opacity={isGuest ? 0.5 : 1}
                            />
                            <MenuCard
                                title="Papeletas"
                                icon={AlertCircle}
                                onPress={() => navigation.navigate('PapeletaInquiry')}
                            />
                            <MenuCard
                                title="Buzón"
                                icon={Mail}
                                badge={isGuest ? 0 : unreadMessagesMsg}
                                onPress={() => !isGuest && navigation.navigate('Mailbox')}
                                disabled={isGuest}
                                opacity={isGuest ? 0.5 : 1}
                            />
                            <MenuCard
                                title="Trámites"
                                icon={Clock}
                                onPress={() => navigation.navigate('TramiteStatus')}
                            />
                        </View>


                        {/* Institutional Footer */}
                        <View style={styles.footer}>
                            <Image
                                source={require('../../assets/logo_sat_2026-remove.png')}
                                style={styles.footerLogo}
                                resizeMode="contain"
                            />
                            <Text style={[styles.footerSubtitle, { color: theme.colors.slate, fontFamily: theme.fonts.bold }]}>SERVICIO DE ADMINISTRACIÓN TRIBUTARIA</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 15,
    },
    premiumGreeting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 35,
        paddingHorizontal: 4,
    },
    greetingTextContainer: {
        flex: 1,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    subtitleText: {
        fontSize: 14,
        marginTop: 2,
        opacity: 0.8,
    },
    welcomeText: {
        fontSize: 18,
    },
    nameText: {
        fontSize: 28,
        marginTop: 4,
        lineHeight: 34,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerLogo: {
        width: 60,
        height: 50,
        marginBottom: 8,
    },
    footerSubtitle: {
        fontSize: 9,
        opacity: 0.6,
        textAlign: 'center',
        letterSpacing: 1.2,
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
    },
    versionText: {
        fontSize: 10,
        marginTop: 4,
    },
    guestBadge: {
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    guestBadgeText: {
        fontSize: 10,
    },
});

