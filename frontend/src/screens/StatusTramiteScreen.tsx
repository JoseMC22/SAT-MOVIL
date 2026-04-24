import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ArrowLeft, Clock, MapPin, CheckCircle, AlertCircle, ChevronRight, Inbox, Search } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { tramiteService } from '../services/api';
import { TramiteSkeleton } from '../components/SkeletonCards';
import { AppHeader } from '../components/AppHeader';

export default function StatusTramiteScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { token, isGuest } = useAuth();
    const [tramites, setTramites] = useState<any[]>([]);
    const [loading, setLoading] = useState(isGuest ? false : true);
    const [refreshing, setRefreshing] = useState(false);
    const [dniSearch, setDniSearch] = useState('');

    const fetchTramites = async (dni?: string) => {
        if (!token) return;
        if (isGuest && !dni) return;
        
        setLoading(true);
        try {
            const data = await tramiteService.getMyTramites(token, dni);
            setTramites(data || []);
        } catch (error) {
            console.error('Error fetching tramites:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isGuest) {
            fetchTramites();
        }
    }, []);


    const onRefresh = () => {
        setRefreshing(true);
        fetchTramites(isGuest ? dniSearch : undefined);
    };

    const renderProgressBar = (percentage: number, elapsedDays: number, limitDays: number) => {
        let barColor = lightTheme.colors.primary;
        
        if (elapsedDays > limitDays) {
            barColor = lightTheme.colors.error; // Delayed
        } else if (elapsedDays === limitDays) {
            barColor = '#F59E0B'; // Warning (Amber/Orange)
        }

        const displayPercentage = percentage > 100 ? 100 : percentage;

        return (
            <View style={styles.progressContainer}>
                <View style={[styles.progressFill, { width: `${displayPercentage}%`, backgroundColor: barColor }]} />
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Estado de Trámites" />

            <View style={{ flex: 1 }}>
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
                        <View style={[styles.infoSection, { backgroundColor: isDarkMode ? '#1E3A8A' : '#EBF5FF', borderColor: isDarkMode ? '#3B82F6' : '#BFDBFE' }]}>
                            <AlertCircle color={isDarkMode ? '#93C5FD' : lightTheme.colors.primary} size={20} />
                            <Text style={[styles.infoText, { color: isDarkMode ? '#BFDBFE' : lightTheme.colors.primary }]}>
                                {isGuest ? 'Ingrese su DNI para consultar el estado de sus trámites.' : 'El plazo de respuesta varía según el tipo de trámite.'}
                            </Text>
                        </View>

                        {isGuest && (
                            <View style={styles.searchSection}>
                                <Input
                                    label="Consultar por DNI"
                                    value={dniSearch}
                                    onChangeText={setDniSearch}
                                    placeholder="Ingrese DNI"
                                    keyboardType="numeric"
                                    maxLength={8}
                                />
                                <Button
                                    title="Consultar"
                                    onPress={() => fetchTramites(dniSearch)}
                                    icon={<Search color="#FFF" size={20} />}
                                    disabled={dniSearch.length < 8}
                                />
                                <View style={[styles.divider, { backgroundColor: theme.colors.border, marginVertical: 20 }]} />
                            </View>
                        )}


                        {loading ? (
                            <View style={{ width: '100%', paddingTop: 8 }}>
                                {[1, 2, 3].map(i => <TramiteSkeleton key={i} />)}
                            </View>
                        ) : tramites.length === 0 ? (
                            <View style={styles.centered}>
                                <Inbox color={theme.colors.slate} size={64} opacity={0.3} />
                                <Text style={[styles.emptyText, { color: theme.colors.slate }]}>No se encontraron trámites registrados</Text>
                            </View>
                        ) : (
                            tramites.map((tramite) => (
                                <View key={tramite.id} style={[styles.card, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.titleContainer}>
                                            <Text style={[styles.tramiteTitle, { color: theme.colors.text }]}>{tramite.asunto}</Text>
                                            <Text style={[styles.expedienteText, { color: theme.colors.slate }]}>N° Trámite: {tramite.expediente}</Text>
                                        </View>
                                        {tramite.estaFinalizado ? (
                                            <CheckCircle color={lightTheme.colors.success} size={24} />
                                        ) : (
                                            <Clock color={lightTheme.colors.secondary} size={24} />
                                        )}
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                                    <View style={styles.detailRow}>
                                        <MapPin color={theme.colors.slate} size={16} />
                                        <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Oficina:</Text>
                                        <Text style={[styles.detailValue, { color: theme.colors.text }]}>{tramite.oficina}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Clock color={theme.colors.slate} size={16} />
                                        <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Estado:</Text>
                                        <Text style={[styles.detailValue, { color: tramite.estaFinalizado ? lightTheme.colors.success : lightTheme.colors.primary, fontWeight: '700' }]}>
                                            {tramite.etiquetaEstado}
                                        </Text>
                                    </View>

                                    {!tramite.estaFinalizado ? (
                                        <View style={styles.progressSection}>
                                            <View style={styles.progressHeader}>
                                                <Text style={[styles.progressLabel, { color: theme.colors.slate }]}>Progreso del trámite (días hábiles)</Text>
                                                <Text style={[styles.progressDays, { color: tramite.diasTranscurridos > tramite.dias ? theme.colors.error : theme.colors.primary }]}>
                                                    {tramite.diasTranscurridos} / {tramite.dias} días
                                                </Text>
                                            </View>
                                            {renderProgressBar(tramite.porcentajeProgreso, tramite.diasTranscurridos, tramite.dias)}
                                        </View>
                                    ) : (
                                        <View style={[styles.finalizedSection, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4' }]}>
                                            <Text style={[styles.finalizedTitle, { color: isDarkMode ? '#6EE7B7' : '#166534' }]}>
                                                ¡Trámite Finalizado!
                                            </Text>
                                            <Text style={[styles.finalizedDescription, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
                                                Su trámite ha concluido satisfactoriamente. Si se generó una respuesta escrita, podrá visualizarla en su buzón de mensajes o acercase a la oficina correspondiente.
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.buzonButton}
                                                onPress={() => navigation.navigate('Mailbox')}
                                            >
                                                <Text style={styles.buzonButtonText}>Ver en mi buzón</Text>
                                                <ChevronRight color="#FFF" size={16} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
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
        marginTop: -40,
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
    infoSection: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 13,
        fontWeight: '500',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: lightTheme.colors.slate,
        textAlign: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        marginRight: 10,
    },
    tramiteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    expedienteText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        marginLeft: 8,
        width: 60,
    },
    detailValue: {
        fontSize: 13,
        flex: 1,
        fontWeight: '500',
    },
    progressSection: {
        marginTop: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressDays: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    finalizedSection: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
    },
    finalizedTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    finalizedDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    buzonButton: {
        backgroundColor: lightTheme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: 'flex-start',
    },
    buzonButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        marginRight: 4,
    },
    searchSection: {
        marginBottom: 20,
    },
});
