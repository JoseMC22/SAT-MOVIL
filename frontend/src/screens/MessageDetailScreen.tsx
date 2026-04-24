import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Mail, Download, FileText, ArrowLeft, Calendar, User } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';

export default function MessageDetailScreen({ route, navigation }: any) {
    const { message } = route.params;
    const { theme, isDarkMode } = useTheme();
    const { token } = useAuth();
    const [downloading, setDownloading] = useState<string | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    const handleDownload = async (attachmentId: string, fileName: string) => {
        setDownloading(attachmentId);
        try {
            const downloadUrl = `${API_URL}/messages/download/${attachmentId}`;

            if (Platform.OS === 'web') {
                const response = await fetch(downloadUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    Alert.alert('Error', 'No se pudo obtener el archivo del servidor');
                }
                return;
            }

            const fileNameSafe = fileName || 'archivo_adjunto';
            const docDir = (FileSystem as any).documentDirectory;

            if (!docDir) {
                Alert.alert('Error', 'No se pudo acceder al sistema de archivos del dispositivo');
                setDownloading(null);
                return;
            }

            const fileUri = `${docDir}${fileNameSafe}`;
            console.log('Downloading from:', downloadUrl);

            const downloadRes = await (FileSystem as any).downloadAsync(
                downloadUrl,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (downloadRes.status === 200) {
                if (!(await Sharing.isAvailableAsync())) {
                    Alert.alert('Error', 'El uso compartido no está disponible en este dispositivo');
                    return;
                }
                await Sharing.shareAsync(downloadRes.uri);
            } else {
                console.error('Download failed with status:', downloadRes.status);
                Alert.alert('Error', 'No se pudo descargar el archivo del servidor');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Ocurrió un error al intentar descargar el archivo');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Detalle del Mensaje" />

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
                        {/* Message Header Info */}
                        <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
                            <Text style={[styles.subject, { color: theme.colors.text }]}>{message.subject}</Text>

                            <View style={styles.metaRow}>
                                <Calendar size={14} color={theme.colors.slate} />
                                <Text style={styles.metaText}>
                                    {format(new Date(message.createdAt), "eeee, d 'de' MMMM 'de' yyyy", { locale: es })}
                                </Text>
                            </View>

                            <View style={styles.metaRow}>
                                <User size={14} color={theme.colors.slate} />
                                <Text style={styles.metaText}>De: SAT ICA (Administración)</Text>
                            </View>
                        </View>

                        {/* Message Body */}
                        <View style={[styles.card, styles.bodyCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
                            <Text style={[styles.bodyText, { color: theme.colors.text }]}>{message.body}</Text>
                        </View>

                        {/* Attachments Section */}
                        {message.attachments && message.attachments.length > 0 && (
                            <View style={[styles.attachmentsSection, styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.colors.border, borderWidth: isDarkMode ? 0 : 1 }]}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Documentos Adjuntos</Text>
                                {message.attachments.map((adj: any) => (
                                    <View key={adj.id} style={[styles.attachmentCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                                        <View style={styles.attachmentInfo}>
                                            <FileText color={theme.colors.primary} size={24} />
                                            <View style={styles.attachmentText}>
                                                <Text style={[styles.attachmentName, { color: theme.colors.text }]} numberOfLines={1}>{adj.fileName}</Text>
                                                <Text style={styles.attachmentType}>Documento PDF</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.downloadButton}
                                            onPress={() => handleDownload(adj.id, adj.fileName)}
                                            disabled={downloading === adj.id}
                                        >
                                            {downloading === adj.id ? (
                                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                            ) : (
                                                <Download color={theme.colors.primary} size={20} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
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
        paddingBottom: 40,
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
    infoCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    subject: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    metaText: {
        fontSize: 13,
        color: lightTheme.colors.slate,
        marginLeft: 8,
    },
    card: {
        borderRadius: 16,
        padding: 20,
    },
    bodyCard: {
        minHeight: 150,
    },
    bodyText: {
        fontSize: 16,
        lineHeight: 24,
    },
    attachmentsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },
    attachmentCard: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
    },
    attachmentInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    attachmentText: {
        marginLeft: 12,
        flex: 1,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: '600',
    },
    attachmentType: {
        fontSize: 12,
        color: lightTheme.colors.slate,
    },
    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
