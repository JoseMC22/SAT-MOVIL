import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { authService } from '../services/api';
import { User, CheckCircle2, FileText, Camera, Image as ImageIcon, ArrowLeft, Send, Contact, ShieldCheck } from 'lucide-react-native';

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

    const pickImage = async (type: 'front' | 'back') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para subir las fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'front') setSelfieFrontImage(result.assets[0].uri);
            else setSelfieBackImage(result.assets[0].uri);
        }
    };

    const takePhoto = async (type: 'front' | 'back') => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'front') setSelfieFrontImage(result.assets[0].uri);
            else setSelfieBackImage(result.assets[0].uri);
        }
    };

    const pickDocument = async () => {
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
        }
    };

    const handleRegister = async () => {
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
            Alert.alert(
                'Registro Exitoso',
                'Su solicitud ha sido enviada con éxito. Un administrador revisará su información.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }]
            );
        } catch (e: any) {
            console.error('Register error:', e.response?.data || e.message);
            Alert.alert('Error', e.response?.data?.message || 'Error al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    const renderImagePicker = (step: string, title: string, image: string | null, onTakePhoto: () => void, onPickImage: () => void) => (
        <View style={styles.imageSection}>
            <View style={styles.stepTitleContainer}>
                <Text style={[styles.stepNumber, { color: theme.colors.text }]}>{step}. </Text>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>

            <View style={styles.pickerGrid}>
                <TouchableOpacity
                    style={[styles.pickerCard, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                    onPress={onTakePhoto}
                >
                    <Camera color={theme.colors.slate} size={28} />
                    <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>CÁMARA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pickerCard, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                    onPress={onPickImage}
                >
                    <ImageIcon color={theme.colors.slate} size={28} />
                    <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>GALERÍA</Text>
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
                <View style={[styles.placeholderBox, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                    <Text style={[styles.placeholderText, { color: theme.colors.slate }]}>Pendiente de adjuntar</Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />

            {/* Header Rediseñado */}
            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solicitud de Registro</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
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
                                                onChangeText={(text) => setForm({ ...form, dni: text })}
                                                placeholder="8 dígitos"
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                label="Código Contribuyente *"
                                                value={form.codigoContribuyente}
                                                onChangeText={(text) => setForm({ ...form, codigoContribuyente: text })}
                                                placeholder="Su código"
                                                keyboardType="numeric"
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
                                        () => pickImage('front')
                                    )}

                                    {renderImagePicker(
                                        "2",
                                        "Foto sosteniendo el DNI mostrando la CARA POSTERIOR *",
                                        selfieBackImage,
                                        () => takePhoto('back'),
                                        () => pickImage('back')
                                    )}

                                    <View style={styles.imageSection}>
                                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>3. Copia de DNI (Imagen o PDF) *</Text>
                                        <TouchableOpacity
                                            style={[styles.documentButton, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                                            onPress={pickDocument}
                                        >
                                            <View style={styles.documentButtonContent}>
                                                <FileText color={theme.colors.primary} size={28} />
                                                <Text style={[styles.documentText, { color: theme.colors.slate }]} numberOfLines={1}>
                                                    {dniCopyName ? dniCopyName : 'Seleccionar archivo'}
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
                                    <Button
                                        title="ENVIAR SOLICITUD"
                                        onPress={handleRegister}
                                        loading={loading}
                                        icon={<Send color="#FFF" size={20} />}
                                        iconPosition="right"
                                    />
                                    <Text style={[styles.disclaimerText, { color: theme.colors.slate }]}>
                                        Al enviar, usted acepta los términos y condiciones del Servicio de Administración Tributaria.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 60, // Extra space for overlap
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
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
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
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
    disclaimerText: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});
