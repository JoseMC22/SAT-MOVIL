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
    StatusBar,
    KeyboardAvoidingView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';

export default function ChangePasswordScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { token, logout } = useAuth();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor complete todos los campos');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            if (!token) throw new Error('No hay sesión activa');
            
            await authService.changePassword(currentPassword, newPassword, token);
            
            if (Platform.OS === 'web') {
                alert('Su contraseña ha sido actualizada correctamente. Por seguridad, deberá iniciar sesión nuevamente.');
                await logout();
                navigation.replace('Login');
            } else {
                Alert.alert(
                    '¡Éxito!',
                    'Su contraseña ha sido actualizada correctamente. Por seguridad, deberá iniciar sesión nuevamente.',
                    [{ 
                        text: 'Entendido', 
                        onPress: async () => {
                            await logout();
                            navigation.replace('Login');
                        } 
                    }]
                );
            }
        } catch (e: any) {
            console.error('Change password error:', e.response?.data || e.message);
            const errorMsg = e.response?.data?.message || 'No se pudo actualizar la contraseña. Verifique su contraseña actual.';
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={lightTheme.colors.primary} />

            {/* Blue Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView 
                        style={styles.contentScroll}
                        contentContainerStyle={styles.scrollContent} 
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]}>
                                    <ShieldCheck color={theme.colors.primary} size={40} />
                                </View>
                            </View>

                            <View style={styles.form}>
                                <Text style={[styles.title, { color: theme.colors.text }]}>Actualiza tu seguridad</Text>
                                <Text style={[styles.subtitle, { color: theme.colors.slate }]}>
                                    Por favor ingrese su contraseña actual para validar su identidad antes de establecer una nueva.
                                </Text>

                                <Input
                                    label="Contraseña Actual"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPasswords}
                                    leftIcon={<Lock size={20} color={theme.colors.slate} />}
                                    rightIcon={
                                        showPasswords ?
                                            <EyeOff size={20} color={theme.colors.slate} /> :
                                            <Eye size={20} color={theme.colors.slate} />
                                    }
                                    onRightIconPress={() => setShowPasswords(!showPasswords)}
                                />

                                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                                <Input
                                    label="Nueva Contraseña"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Mínimo 6 caracteres"
                                    secureTextEntry={!showPasswords}
                                    leftIcon={<Lock size={20} color={theme.colors.slate} />}
                                />

                                <Input
                                    label="Confirmar Nueva Contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Repita la nueva contraseña"
                                    secureTextEntry={!showPasswords}
                                    leftIcon={<CheckCircle2 size={20} color={theme.colors.slate} />}
                                />

                                <Button
                                    title="ACTUALIZAR CONTRASEÑA"
                                    onPress={handleChangePassword}
                                    loading={loading}
                                    style={styles.submitButton}
                                />
                            </View>

                            <View style={[styles.helpSection, { borderTopColor: theme.colors.border }]}>
                                <Text style={[styles.helpText, { color: theme.colors.slate }]}>
                                    ¿Olvidaste tu contraseña actual?
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
                                    <Text style={[styles.contactText, { color: theme.colors.secondary }]}>
                                        Contactar a soporte
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 60, // Extra space for overlap
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
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
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 15,
    },
    form: {
        width: '100%',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 16,
        opacity: 0.5,
    },
    submitButton: {
        marginTop: 10,
    },
    helpSection: {
        marginTop: 30,
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 24,
        paddingBottom: 20,
    },
    helpText: {
        fontSize: 13,
        marginBottom: 4,
    },
    contactText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
});
