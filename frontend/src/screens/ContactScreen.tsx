import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft, Send, Camera, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react-native';

export default function ContactScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const [form, setForm] = useState({
        asunto: '',
        mensaje: ''
    });

    const [images, setImages] = useState<string[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
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
            setImages([...images, result.assets[0].uri]);
        }
    };

    const takePhoto = async () => {
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
            setImages([...images, result.assets[0].uri]);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
            });

            if (!result.canceled) {
                setDocuments([...documents, result.assets[0]]);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    const handleSend = async () => {
        if (!form.asunto || !form.mensaje) {
            Alert.alert('Campos incompletos', 'Por favor ingrese el asunto y el mensaje.');
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert(
                'Mensaje Enviado',
                'Su sugerencia o queja ha sido enviada con éxito. Le contactaremos pronto.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar el mensaje. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const removeDocument = (index: number) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />

            <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Atención al Contribuyente</Text>
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
                                <View style={styles.introSection}>
                                    <AlertCircle color={theme.colors.primary} size={32} />
                                    <View style={styles.introTextContent}>
                                        <Text style={[styles.mainTitle, { color: theme.colors.primary }]}>Escríbeme</Text>
                                        <Text style={[styles.mainSubtitle, { color: theme.colors.slate }]}>
                                            Envíanos tus sugerencias, quejas o reclamos. Tu opinión es muy importante para nosotros.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Input
                                        label="Asunto *"
                                        value={form.asunto}
                                        onChangeText={(text) => setForm({ ...form, asunto: text })}
                                        placeholder="Ej: Sugerencia de mejora"
                                    />

                                    <Input
                                        label="Mensaje *"
                                        value={form.mensaje}
                                        onChangeText={(text) => setForm({ ...form, mensaje: text })}
                                        placeholder="Escribe aquí tu mensaje detallado..."
                                        multiline
                                        numberOfLines={6}
                                        containerStyle={styles.textAreaContainer}
                                        style={styles.textArea}
                                    />
                                </View>

                                <View style={styles.attachmentSection}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.slate }]}>ADJUNTOS (OPCIONAL)</Text>

                                    <View style={styles.pickerGrid}>
                                        <TouchableOpacity
                                            style={[styles.pickerCard, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                                            onPress={takePhoto}
                                        >
                                            <Camera color={theme.colors.primary} size={24} />
                                            <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>CÁMARA</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.pickerCard, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                                            onPress={pickImage}
                                        >
                                            <ImageIcon color={theme.colors.primary} size={24} />
                                            <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>GALERÍA</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.pickerCard, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                                            onPress={pickDocument}
                                        >
                                            <FileText color={theme.colors.primary} size={24} />
                                            <Text style={[styles.pickerCardText, { color: theme.colors.slate }]}>PDF</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Previews */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                                        {images.map((uri, index) => (
                                            <View key={index} style={styles.previewItem}>
                                                <Image source={{ uri }} style={styles.previewImage} />
                                                <TouchableOpacity style={styles.removeBadge} onPress={() => removeImage(index)}>
                                                    <Text style={styles.removeText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        {documents.map((doc, index) => (
                                            <View key={index} style={[styles.previewItemDoc, { backgroundColor: isDarkMode ? theme.colors.white : '#F1F5F9', borderColor: theme.colors.border }]}>
                                                <FileText color={theme.colors.primary} size={32} />
                                                <Text style={[styles.docName, { color: theme.colors.slate }]} numberOfLines={1}>{doc.name}</Text>
                                                <TouchableOpacity style={styles.removeBadge} onPress={() => removeDocument(index)}>
                                                    <Text style={styles.removeText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.footerActions}>
                                    <Button
                                        title="ENVIAR MENSAJE"
                                        onPress={handleSend}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    contentScroll: {
        flex: 1,
        marginTop: -40, // Overlap effect
    },
    scrollContent: {
        paddingBottom: 40,
        flexGrow: 1,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    formContent: {
        padding: 24,
    },
    introSection: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 16,
        alignItems: 'center',
    },
    introTextContent: {
        flex: 1,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    mainSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    inputGroup: {
        marginBottom: 24,
    },
    textAreaContainer: {
        height: 150,
        width: '100%',
        paddingTop: 12,
    },
    textArea: {
        textAlignVertical: 'top',
        height: '100%',
        width: '100%',
    },
    attachmentSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 16,
    },
    pickerGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    pickerCard: {
        flex: 1,
        height: 80,
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
    },
    previewScroll: {
        flexDirection: 'row',
    },
    previewItem: {
        width: 100,
        height: 100,
        marginRight: 12,
        borderRadius: 12,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    previewItemDoc: {
        width: 100,
        height: 100,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    docName: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 4,
    },
    removeBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    removeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footerActions: {
        marginTop: 8,
        paddingBottom: 40,
    },
});
