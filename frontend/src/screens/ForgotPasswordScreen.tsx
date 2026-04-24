import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StatusBar
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { ArrowLeft, Mail, Key, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';

export default function ForgotPasswordScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequestCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingrese su correo electrónico');
            return;
        }

        setLoading(true);
        try {
            await authService.requestResetCode(email);
            if (Platform.OS === 'web') {
                alert('Se ha enviado un código de verificación a su correo electrónico.');
                setStep(2);
            } else {
                Alert.alert(
                    'Código Enviado',
                    'Se ha enviado un código de verificación a su correo electrónico.',
                    [{ text: 'OK', onPress: () => setStep(2) }]
                );
            }
        } catch (e: any) {
            console.error('Request code error:', e.response?.data || e.message);
            Alert.alert('Error', e.response?.data?.message || 'No se pudo enviar el código. Verifique su correo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor complete todos los campos');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, code, newPassword);
            if (Platform.OS === 'web') {
                alert('Su contraseña ha sido actualizada correctamente.');
                navigation.navigate('Login');
            } else {
                Alert.alert(
                    '¡Éxito!',
                    'Su contraseña ha sido actualizada correctamente.',
                    [{ text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') }]
                );
            }
        } catch (e: any) {
            console.error('Reset password error:', e.response?.data || e.message);
            Alert.alert('Error', e.response?.data?.message || 'Código inválido o expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Recuperar Contraseña" />

            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <ScrollView 
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent} 
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
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]}>
                                <Key color={theme.colors.primary} size={40} />
                            </View>
                        </View>

                        {step === 1 ? (
                            <View style={styles.form}>
                                <Text style={[styles.title, { color: theme.colors.text }]}>¿Olvidaste tu contraseña?</Text>
                                <Text style={[styles.subtitle, { color: theme.colors.slate }]}>
                                    Ingresa tu correo electrónico registrado para recibir un código de recuperación.
                                </Text>

                                <Input
                                    label="Correo Electrónico"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ejemplo@satica.gob.pe"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    leftIcon={<Mail size={20} color={theme.colors.slate} />}
                                />

                                <Button
                                    title="Enviar Código"
                                    onPress={handleRequestCode}
                                    loading={loading}
                                />
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <Text style={[styles.title, { color: theme.colors.text }]}>Verificación</Text>
                                <Text style={[styles.subtitle, { color: theme.colors.slate }]}>
                                    Ingresa el código enviado a {email} y tu nueva contraseña.
                                </Text>

                                <Input
                                    label="Código de 6 dígitos"
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="000000"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    leftIcon={<Key size={20} color={theme.colors.slate} />}
                                />

                                <Input
                                    label="Nueva Contraseña"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Mínimo 6 caracteres"
                                    secureTextEntry={!showPassword}
                                    leftIcon={<Lock size={20} color={theme.colors.slate} />}
                                    rightIcon={
                                        showPassword ?
                                            <EyeOff size={20} color={theme.colors.slate} /> :
                                            <Eye size={20} color={theme.colors.slate} />
                                    }
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                />

                                <Input
                                    label="Confirmar Contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repita su contraseña"
                                    secureTextEntry={!showPassword}
                                    leftIcon={<CheckCircle2 size={20} color={theme.colors.slate} />}
                                />

                                <Button
                                    title="Restablecer Contraseña"
                                    onPress={handleResetPassword}
                                    loading={loading}
                                />

                                <TouchableOpacity
                                    style={styles.resendContainer}
                                    onPress={() => setStep(1)}
                                >
                                    <Text style={styles.resendText}>¿No recibió el código? Reintentar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backToLogin}
                        >
                            <Text style={[styles.backToLoginText, { color: theme.colors.primary }]}>
                                Volver al inicio de sesión
                            </Text>
                        </TouchableOpacity>

                        <View style={[styles.helpSection, { borderTopColor: theme.colors.border }]}>
                            <Text style={[styles.helpText, { color: theme.colors.slate }]}>
                                ¿Necesitas más ayuda?
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
                                <Text style={[styles.contactText, { color: theme.colors.secondary }]}>
                                    Contactar a soporte
                            </Text>
                            </TouchableOpacity>
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
    contentScroll: {
        flex: 1,
        marginTop: -40, // Overlap effect
    },
    scrollContent: {
        flexGrow: 1,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 10,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 10,
    },
    form: {
        width: '100%',
    },
    resendContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
        color: lightTheme.colors.slate,
    },
    backToLogin: {
        alignItems: 'center',
        marginTop: 20,
        padding: 10,
    },
    backToLoginText: {
        fontSize: 15,
        fontWeight: '700',
    },
    helpSection: {
        marginTop: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 24,
    },
    helpText: {
        fontSize: 14,
        marginBottom: 8,
    },
    contactText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
