import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { User, CheckCircle2, FileText, Camera, Image as ImageIcon, ArrowLeft, Send, Contact, ShieldCheck, CheckSquare, Square, HelpCircle, X } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';

export default function RegisterScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const [form, setForm] = useState({
        nombres: '',
        apellidos: '',
        dni: '',
        codigoContribuyente: '',
        email: '',
        celular: ''
    });

    const [selfieFrontImage, setSelfieFrontImage] = useState<string | null>(null);
    const [selfieBackImage, setSelfieBackImage] = useState<string | null>(null);
    const [dniCopyDoc, setDniCopyDoc] = useState<any>(null);
    const [dniCopyName, setDniCopyName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isPicking, setIsPicking] = useState<'front' | 'back' | 'doc' | null>(null);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [helpImage, setHelpImage] = useState<any>(null);
    const [helpTitle, setHelpTitle] = useState('');

    const openHelp = (type: 'front' | 'back') => {
        if (type === 'front') {
            setHelpImage(require('../../assets/dni_example_front.png'));
            setHelpTitle('Ejemplo: Cara Anterior');
        } else {
            setHelpImage(require('../../assets/dni_example_back.png'));
            setHelpTitle('Ejemplo: Cara Posterior');
        }
        setHelpModalVisible(true);
    };

    const pickImage = async (type: 'front' | 'back') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para subir las fotos.');
            return;
        }

        setIsPicking(type);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                if (type === 'front') setSelfieFrontImage(result.assets[0].uri);
                else setSelfieBackImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        } finally {
            setIsPicking(null);
        }
    };

    const takePhoto = async (type: 'front' | 'back') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
            return;
        }

        setIsPicking(type);
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled) {
                if (type === 'front') setSelfieFrontImage(result.assets[0].uri);
                else setSelfieBackImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
        } finally {
            setIsPicking(null);
        }
    };

    const pickDocument = async () => {
        setIsPicking('doc');
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
            });

            if (!result.canceled) {
                setDniCopyDoc(result.assets[0]);
                setDniCopyName(result.assets[0].name);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        } finally {
            setIsPicking(null);
        }
    };

    const handleRegister = async () => {
        if (!termsAccepted) {
            Alert.alert('Términos y condiciones', 'Debe aceptar los términos y condiciones para continuar.');
            return;
        }

        if (!form.nombres || !form.apellidos || !form.dni || !form.codigoContribuyente || !form.celular || !form.email) {
            Alert.alert('Error', 'Por favor complete todos los campos obligatorios (*)');
            return;
        }

        if (!selfieFrontImage || !selfieBackImage || !dniCopyDoc) {
            Alert.alert('Error', 'Debe adjuntar las 3 imágenes solicitadas (2 selfies y la copia de DNI)');
            return;
        }

        setLoading(true);
        try {
            const formData = {
                ...form,
                selfieFrontUri: selfieFrontImage,
                selfieBackUri: selfieBackImage,
                dniCopyUri: dniCopyDoc.uri
            };
            await authService.register(formData as any);
            
            if (Platform.OS === 'web') {
                alert('Su solicitud ha sido enviada con éxito. Un administrador revisará su información.');
                navigation.replace('Login');
            } else {
                Alert.alert(
                    'Registro Exitoso',
                    'Su solicitud ha sido enviada con éxito. Un administrador revisará su información.',
                    [{ text: 'OK', onPress: () => navigation.replace('Login') }]
                );
            }
        } catch (e: any) {
            console.error('Register error:', e.response?.data || e.message);
            Alert.alert('Error', e.response?.data?.message || 'Error al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    const renderImagePicker = (step: string, title: string, image: string | null, onTakePhoto: () => void, onPickImage: () => void, type: 'front' | 'back') => (
        <View style={styles.imageSection}>
            <View style={styles.stepTitleContainer}>
                <Text style={[styles.stepNumber, { color: theme.colors.text }]}>{step}. </Text>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{title}</Text>
                <TouchableOpacity 
                    onPress={() => openHelp(type)}
                    style={styles.helpButton}
                >
                    <HelpCircle color={theme.colors.primary} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.pickerGrid}>
                <TouchableOpacity
                    style={[styles.pickerCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                    onPress={onTakePhoto}
                    disabled={isPicking !== null}
                >
                    {(isPicking === 'front' && step === "1") || (isPicking === 'back' && step === "2") ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <>
                            <Camera color={theme.colors.slate} size={28} />
                            <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>CÁMARA</Text>
                        </>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pickerCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                    onPress={onPickImage}
                    disabled={isPicking !== null}
                >
                    {(isPicking === 'front' && step === "1") || (isPicking === 'back' && step === "2") ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                        <>
                            <ImageIcon color={theme.colors.slate} size={28} />
                            <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>GALERÍA</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {image ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: image }} style={styles.preview} />
                    <View style={styles.successBadge}>
                        <CheckCircle2 color={theme.colors.success} size={18} />
                        <Text style={styles.successText}>Imagen lista</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.placeholderBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <Text style={[styles.placeholderText, { color: theme.colors.slate }]}>Pendiente de adjuntar</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Solicitud de Registro" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
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
                            <View style={styles.formContent}>
                                <Text style={[styles.mainTitle, { color: theme.colors.primary }]}>Crear Cuenta</Text>
                                <Text style={[styles.mainSubtitle, { color: theme.colors.slate }]}>
                                    Complete todos los campos obligatorios (*) para procesar su solicitud de registro tributario.
                                </Text>

                                {/* SECCIÓN INFORMACIÓN PERSONAL */}
                                <View style={[styles.formSection, { borderTopColor: theme.colors.border }]}>
                                    <View style={styles.sectionHeader}>
                                        <User color={theme.colors.primary} size={16} />
                                        <Text style={[styles.sectionTitle, { color: theme.colors.slate }]}>INFORMACIÓN PERSONAL</Text>
                                    </View>

                                    <Input
                                        label="Nombres *"
                                        value={form.nombres}
                                        onChangeText={(text) => setForm({ ...form, nombres: text })}
                                        placeholder="Ingrese sus nombres"
                                    />
                                    <Input
                                        label="Apellidos *"
                                        value={form.apellidos}
                                        onChangeText={(text) => setForm({ ...form, apellidos: text })}
                                        placeholder="Ingrese sus apellidos"
                                    />

                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Input
                                                label="DNI *"
                                                value={form.dni}
                                                onChangeText={(text) => setForm({ ...form, dni: text.replace(/[^0-9]/g, '') })}
                                                placeholder="Máx 12 dígitos"
                                                keyboardType="numeric"
                                                maxLength={12}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                label="Código Contribuyente *"
                                                value={form.codigoContribuyente}
                                                onChangeText={(text) => setForm({ ...form, codigoContribuyente: text.replace(/[^0-9]/g, '') })}
                                                placeholder="Máx 7 dígitos"
                                                keyboardType="numeric"
                                                maxLength={7}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* SECCIÓN CONTACTO */}
                                <View style={[styles.formSection, { borderTopColor: theme.colors.border }]}>
                                    <View style={styles.sectionHeader}>
                                        <Contact color={theme.colors.primary} size={16} />
                                        <Text style={[styles.sectionTitle, { color: theme.colors.slate }]}>CONTACTO</Text>
                                    </View>

                                    <Input
                                        label="Correo Electrónico *"
                                        value={form.email}
                                        onChangeText={(text) => setForm({ ...form, email: text })}
                                        placeholder="usuario@ejemplo.com"
                                        keyboardType="email-address"
                                    />
                                    <Input
                                        label="Celular *"
                                        value={form.celular}
                                        onChangeText={(text) => setForm({ ...form, celular: text })}
                                        placeholder="Su número de celular"
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* SECCIÓN VALIDACIÓN DE IDENTIDAD */}
                                <View style={[styles.formSection, { borderTopColor: theme.colors.border }]}>
                                    <View style={styles.sectionHeader}>
                                        <ShieldCheck color={theme.colors.primary} size={16} />
                                        <Text style={[styles.sectionTitle, { color: theme.colors.slate }]}>VALIDACIÓN DE IDENTIDAD</Text>
                                    </View>

                                    {renderImagePicker(
                                        "1",
                                        "Foto sosteniendo el DNI mostrando la CARA ANTERIOR *",
                                        selfieFrontImage,
                                        () => takePhoto('front'),
                                        () => pickImage('front'),
                                        'front'
                                    )}

                                    {renderImagePicker(
                                        "2",
                                        "Foto sosteniendo el DNI mostrando la CARA POSTERIOR *",
                                        selfieBackImage,
                                        () => takePhoto('back'),
                                        () => pickImage('back'),
                                        'back'
                                    )}

                                    <View style={styles.imageSection}>
                                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>3. Copia de DNI (Imagen o PDF) *</Text>
                                        <TouchableOpacity
                                            style={[styles.documentButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                                            onPress={pickDocument}
                                            disabled={isPicking !== null}
                                        >
                                            <View style={styles.documentButtonContent}>
                                                {isPicking === 'doc' ? (
                                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                                ) : (
                                                    <FileText color={theme.colors.primary} size={28} />
                                                )}
                                                <Text style={[styles.documentText, { color: theme.colors.slate }]} numberOfLines={1}>
                                                    {isPicking === 'doc' ? 'Procesando...' : (dniCopyName ? dniCopyName : 'Seleccionar archivo')}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        {dniCopyDoc && (
                                            <View style={styles.successBadge}>
                                                <CheckCircle2 color={theme.colors.success || '#4CAF50'} size={18} />
                                                <Text style={styles.successText}>Archivo listo</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* BOTÓN ENVÍO */}
                                <View style={styles.footerActions}>
                                    <TouchableOpacity
                                        style={styles.checkboxContainer}
                                        onPress={() => setTermsAccepted(!termsAccepted)}
                                        activeOpacity={0.7}
                                    >
                                        {termsAccepted ? (
                                            <CheckSquare color={theme.colors.primary} size={24} />
                                        ) : (
                                            <Square color={theme.colors.slate} size={24} />
                                        )}
                                        <Text style={[styles.disclaimerText, { color: theme.colors.slate }]}>
                                            Acepto los{' '}
                                            <Text
                                                style={{ color: theme.colors.primary, fontFamily: theme.fonts.bold, textDecorationLine: 'underline' }}
                                                onPress={() => navigation.navigate('TermsAndConditions')}
                                            >
                                                términos y condiciones
                                            </Text>
                                            {' '}del Servicio de Administración Tributaria.
                                        </Text>
                                    </TouchableOpacity>

                                    <Button
                                        title="ENVIAR SOLICITUD"
                                        onPress={handleRegister}
                                        loading={loading}
                                        icon={<Send color="#FFF" size={20} />}
                                        iconPosition="right"
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            {/* Help Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={helpModalVisible}
                onRequestClose={() => setHelpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{helpTitle}</Text>
                            <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                                <X color={theme.colors.text} size={24} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalBody}>
                            <Text style={[styles.modalDescription, { color: theme.colors.slate }]}>
                                Sujete su DNI cerca de su rostro como se muestra en la imagen. Asegúrese de que tanto su cara como los datos del documento sean legibles.
                            </Text>
                            <Image 
                                source={helpImage} 
                                style={styles.helpImagePreview} 
                                resizeMode="contain"
                            />
                        </View>

                        <Button 
                            title="ENTENDIDO" 
                            onPress={() => setHelpModalVisible(false)}
                        />
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
        marginTop: -40, // Overlap effect
    },
    scrollContent: {
        flexGrow: 1,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 10,
    },
    formContent: {
        padding: 24,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
    },
    mainSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 32,
    },
    formSection: {
        marginBottom: 32,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
    },
    imageSection: {
        marginBottom: 28,
    },
    stepTitleContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    stepNumber: {
        fontSize: 15,
        fontWeight: '800',
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
        flex: 1,
    },
    pickerGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    pickerCard: {
        flex: 1,
        height: 86,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    pickerCardText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    previewContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 4,
    },
    preview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
    },
    placeholderBox: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    successText: {
        color: '#10B981',
        fontWeight: '700',
        fontSize: 13,
    },
    documentButton: {
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
    },
    documentButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    documentText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    footerActions: {
        marginTop: 16,
        paddingBottom: 40,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    disclaimerText: {
        fontSize: 12,
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
    helpButton: {
        marginLeft: 8,
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
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
    modalBody: {
        marginBottom: 24,
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    helpImagePreview: {
        width: '100%',
        height: 300,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
    },
});
