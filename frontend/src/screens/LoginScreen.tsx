import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus, Moon, Sun } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            //console.log('Attempting login with:', username);
            const data = await authService.login(username, password);
            await login(data.user, data.access_token);
            navigation.replace('Menu');
        } catch (e: any) {
            console.error('Login error detail:', e.response?.data || e.message);
            if (e.response?.status === 401) {
                setError('Usuario o contraseña incorrectos');
            } else {
                setError('Error de conexión con el servidor. Verifique su red.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Dark Mode Toggle */}
                    <View style={styles.topActions}>
                        <TouchableOpacity
                            style={[styles.darkModeButton, { backgroundColor: theme.colors.white }]}
                            onPress={toggleTheme}
                        >
                            {isDarkMode ? (
                                <Sun size={20} color={theme.colors.secondary} />
                            ) : (
                                <Moon size={20} color={theme.colors.text} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Logo Section */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <Text style={[styles.logoTextBlue, { color: '#005696' }]}>SAT</Text>
                            <Text style={[styles.logoTextYellow, { color: '#FBC02D' }]}>ICA</Text>
                        </View>
                        <View style={[styles.logoUnderline, { backgroundColor: theme.colors.primary }]} />
                        <Text style={[styles.subtitle, { color: isDarkMode ? theme.colors.slate : '#64748B' }]}>
                            SERVICIO DE ADMINISTRACIÓN{"\n"}TRIBUTARIA DE ICA
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <Input
                            label="Usuario"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Ingrese su usuario"
                            autoCapitalize="none"
                            autoCorrect={false}
                            leftIcon={<User size={20} color={theme.colors.slate} />}
                        />
                        <View style={styles.passwordContainer}>
                            <Input
                                label="Contraseña"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Ingrese su contraseña"
                                secureTextEntry={!showPassword}
                                leftIcon={<Lock size={20} color={theme.colors.slate} />}
                                rightIcon={
                                    showPassword ?
                                        <EyeOff size={20} color={theme.colors.slate} /> :
                                        <Eye size={20} color={theme.colors.slate} />
                                }
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />
                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>¿Olvidó su contraseña?</Text>
                            </TouchableOpacity>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Button
                            title="Iniciar Sesión"
                            onPress={handleLogin}
                            loading={loading}
                            icon={<LogIn size={20} color="#FFF" />}
                            iconPosition="right"
                        />

                        {/* Divider Section */}
                        <View style={styles.dividerContainer}>
                            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                            <Text style={[styles.dividerText, { color: theme.colors.slate }]}>¿Nuevo por aquí?</Text>
                            <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                        </View>

                        <Button
                            variant="outline"
                            title="No tengo cuenta, registrarme"
                            onPress={() => navigation.navigate('Register')}
                            textColor={theme.colors.secondary}
                            icon={<UserPlus size={20} color={theme.colors.primary} />}
                        />
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.colors.slate }]}>
                            Recaudamos para el progreso de Ica{"\n"}
                            v 2.0.4 • SAT-ICA MOVIL
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 16, // Use values directly if preferred or spacing
        paddingBottom: 32,
    },
    topActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingVertical: 16,
    },
    darkModeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    logoTextBlue: {
        fontSize: 60,
        fontWeight: '900',
        letterSpacing: -2,
    },
    logoTextYellow: {
        fontSize: 60,
        fontWeight: '900',
        letterSpacing: -2,
    },
    logoUnderline: {
        height: 3,
        width: '100%',
        opacity: 0.1,
        borderRadius: 2,
        marginTop: 4,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 12,
        letterSpacing: 2.5,
        lineHeight: 14,
    },
    form: {
        width: '100%',
    },
    passwordContainer: {
        marginBottom: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    forgotPasswordText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#005696',
    },
    errorText: {
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        marginTop: 'auto',
        paddingVertical: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
    },
});
