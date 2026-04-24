import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, TextInput, Modal, Alert, ActivityIndicator, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { ArrowLeft, User, Phone, Mail, ChevronRight, Info, Save, X, Bell } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { AppHeader } from '../components/AppHeader';

export default function ProfileScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { user, token, login } = useAuth(); // We might need login to refresh user data in context

    const [loading, setLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editType, setEditType] = useState<'phone' | 'email' | null>(null);
    const [editValue, setEditValue] = useState('');

    // Local states for UI-only toggles (as per requirements)
    const [promoNotifications, setPromoNotifications] = useState(true);

    const maskPhone = (phone: string | number | undefined) => {
        if (!phone) return 'No registrado';
        const s = String(phone);
        if (s.length < 3) return s;
        return '*'.repeat(s.length - 3) + s.slice(-3);
    };

    const maskEmail = (email: string | undefined) => {
        if (!email) return 'No registrado';
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        return name[0] + '*'.repeat(name.length - 1) + '@' + domain;
    };

    const handleEditPress = (type: 'phone' | 'email') => {
        setEditType(type);
        setEditValue(type === 'phone' ? String(user?.celular || '') : user?.correo || '');
        setEditModalVisible(true);
    };

    const handleSave = async () => {
        if (!token || !user) return;

        if (editType === 'email' && !editValue.includes('@')) {
            Alert.alert('Error', 'Por favor ingrese un correo válido');
            return;
        }

        if (editType === 'phone' && (editValue.length < 7 || isNaN(Number(editValue)))) {
            Alert.alert('Error', 'Por favor ingrese un número de celular válido');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                dni: user.dni || '',
                correo: editType === 'email' ? editValue : (user.correo || ''),
                celular: editType === 'phone' ? editValue : String(user.celular || '0'),
            };

            await authService.updateProfile(updateData, token);

            // Note: Ideally we would have a 'refreshProfile' or similar. 
            // For now, let's assume the user object in context needs to be manually updated or re-fetched.
            // Since our AuthContext usually holds the user from the last login result:
            Alert.alert('Éxito', 'Perfil actualizado correctamente. Los cambios se reflejarán al iniciar sesión nuevamente.');
            setEditModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Mi perfil" />

                    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                        <ScrollView
                            style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Tarjeta con curva que se solapa */}
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
                        {/* Personal Data Section */}
                        <SectionHeader title="Datos personales" />

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: theme.colors.slate }]}>Nombre</Text>
                            <View style={[styles.fieldBox, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC', borderColor: theme.colors.border }]}>
                                <Text style={[styles.fieldText, { color: theme.colors.slate }]}>{user?.nombre?.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: theme.colors.slate }]}>Número de celular</Text>
                            <View style={[styles.fieldBox, { borderColor: theme.colors.border }]}>
                                <Text style={[styles.fieldText, { color: theme.colors.text }]}>{maskPhone(user?.celular)}</Text>
                                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary }]} onPress={() => handleEditPress('phone')}>
                                    <Text style={styles.editButtonText}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: theme.colors.slate }]}>Correo</Text>
                            <View style={[styles.fieldBox, { borderColor: theme.colors.border }]}>
                                <Text style={[styles.fieldText, { color: theme.colors.text }]}>{maskEmail(user?.correo)}</Text>
                                <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary }]} onPress={() => handleEditPress('email')}>
                                    <Text style={styles.editButtonText}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Login Settings Section */}
                        {/* <SectionHeader title="Inicio de sesión" />
                    <View style={[styles.settingCard, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#EBF5FF' }]}>
                                <User color={theme.colors.primary} size={20} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>DNI</Text>
                                <Text style={[styles.settingDesc, { color: theme.colors.slate }]}>{user?.dni}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} /> */}

                        {/* Notifications Section */}
                        {/* <SectionHeader title="Notificaciones" />
                        <View style={[styles.settingCard, { backgroundColor: isDarkMode ? '#2D3748' : '#F8FAFC' }]}>
                            <View style={styles.settingInfo}>
                                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1A202C' : '#EBF5FF' }]}>
                                    <Bell color={theme.colors.primary} size={20} />
                                </View>
                                <View style={styles.settingTextContainer}>
                                    <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Notificaciones promocionales</Text>
                                    <Text style={[styles.settingDesc, { color: theme.colors.slate }]}>Recibe novedades y beneficios pensados exclusivamente para ti.</Text>
                                </View>
                                <Switch
                                    value={promoNotifications}
                                    onValueChange={setPromoNotifications}
                                    trackColor={{ false: '#CBD5E1', true: theme.colors.primary }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View> */}

                        {/* Terms Section */}
                        <TouchableOpacity style={styles.termsLink} onPress={() => navigation.navigate('TermsAndConditions')}>
                            <Text style={[styles.termsText, { color: theme.colors.primary }]}>Revisa los Términos y condiciones</Text>
                        </TouchableOpacity>

                        {/* <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#334155' : '#FFFBEB', borderColor: isDarkMode ? '#475569' : '#FEF3C7' }]}>
                            <Info color={isDarkMode ? '#FDE047' : '#D97706'} size={20} />
                            <Text style={[styles.infoBannerText, { color: isDarkMode ? '#F1F5F9' : '#92400E' }]}>
                                Solo puedes desactivar las notificaciones promocionales. Las notificaciones transaccionales siempre se muestran.
                            </Text>
                        </View> */}
                    </View>
                </ScrollView>
            </View>

            {/* Edit Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.white }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                {editType === 'phone' ? 'Editar Celular' : 'Editar Correo'}
                            </Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X color={theme.colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.modalLabel, { color: theme.colors.slate }]}>
                            Ingrese su nuevo {editType === 'phone' ? 'número de celular' : 'correo electrónico'}
                        </Text>

                        <TextInput
                            style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType={editType === 'phone' ? 'phone-pad' : 'email-address'}
                            placeholder={editType === 'phone' ? '999999999' : 'ejemplo@correo.com'}
                            placeholderTextColor={theme.colors.slate}
                            autoFocus
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Save color="#FFF" size={20} />
                                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentScroll: {
        flex: 1,
        marginTop: -30,
        zIndex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    fieldBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    fieldText: {
        fontSize: 15,
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: '#004A81', // Specific blue from image
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 12,
        opacity: 0.5,
    },
    settingCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    termsLink: {
        marginTop: 16,
        marginBottom: 20,
    },
    termsText: {
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    infoBanner: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        marginLeft: 12,
        lineHeight: 18,
    },
    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContainer: {
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalLabel: {
        fontSize: 14,
        marginBottom: 12,
    },
    modalInput: {
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    saveButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
