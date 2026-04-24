import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { ArrowLeft, Calendar, FileText, Info, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';
import { papeletaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Skeleton from '../components/Skeleton'; // We'll use base skeletons or a simplified card one
import { AppHeader } from '../components/AppHeader';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PapeletaResultsScreen({ route, navigation }: any) {
    const { searchCriteria } = route.params;
    const { theme, isDarkMode } = useTheme();
    const { token } = useAuth();

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!token) return;
            try {
                const data = await papeletaService.getPapeletas(searchCriteria, token);
                setResults(data || []);
            } catch (error) {
                console.error('Error fetching papeletas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const totalAmount = results.reduce((sum: number, item: any) => sum + (item.total_deuda || 0), 0);

    const toggleExpand = useCallback((id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('es-PE');
        } catch (e) {
            return dateString;
        }
    };

    const PapeletaCard = ({ item, index }: { item: any; index: number }) => {
        const isExpanded = expandedIds.includes(index);
        return (
            <View style={[styles.card, { backgroundColor: theme.colors.white, borderColor: isExpanded ? theme.colors.primary : theme.colors.border, borderWidth: isExpanded ? 2 : 1 }]}>
                <TouchableOpacity
                    onPress={() => toggleExpand(index)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF4F4' }]}>
                            <AlertCircle color={theme.colors.error} size={24} />
                        </View>
                        <View style={styles.cardHeaderInfo}>
                            <Text style={[styles.cardTitleText, { color: theme.colors.text }]}>{item.tipode1 + ' ' + item.cod_pred}</Text>
                            <Text style={[styles.cardSubtitleText, { color: theme.colors.slate }]}>Placa: {item.cod_pred1}</Text>
                            <Text style={[styles.cardSubtitleText, { color: theme.colors.slate }]}>Conductor: {item.nombre}</Text>
                        </View>
                        <Text style={[styles.cardAmount, { color: theme.colors.text }]}>S/ {(item.total_deuda || 0).toFixed(2)}</Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.cardExpandedArea}>
                        <View style={[styles.detailTable, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Infracción:</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text, flex: 1, textAlign: 'right' }]}>{item.infracc}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Insoluto:</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>S/ {(item.imp_insol || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Descuento:</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.success }]}>S/ {(item.imp_reaj || 0).toFixed(2)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: theme.colors.slate }]}>Total Deuda:</Text>
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>S/ {(item.total_deuda || 0).toFixed(2)}</Text>
                            </View>

                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}
                    onPress={() => toggleExpand(index)}
                >
                    <View style={[styles.tag, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                        <Calendar size={12} color={theme.colors.slate} />
                        <Text style={[styles.tagText, { color: theme.colors.slate }]}>Fecha de Aplicación: {formatDate(item.fecapli)}</Text>
                    </View>
                    <View style={styles.detailLink}>
                        <Text style={[styles.detailLinkText, { color: theme.colors.primary }]}>{isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}</Text>
                        {isExpanded ? (
                            <ChevronUp size={16} color={theme.colors.primary} />
                        ) : (
                            <ChevronDown size={16} color={theme.colors.primary} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Resultado Papeletas" />

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
                        {/* Summary Header outside banner */}
                        <View style={[styles.extraInfo, { paddingHorizontal: 24, marginBottom: 12, marginTop: 24 }]}>
                            <Info color={theme.colors.primary} size={18} />
                            <Text style={[styles.extraInfoText, { color: theme.colors.text, fontWeight: '700', fontSize: 14 }]}>
                                Criterios de Búsqueda
                            </Text>
                        </View>

                        {/* Summary Banner Card */}
                        <View style={[
                            styles.summaryBanner,
                            {
                                backgroundColor: theme.colors.card,
                                borderRadius: 24,
                                marginHorizontal: 20,
                                padding: 0,
                                overflow: 'hidden'
                            }
                        ]}>
                            <View style={[styles.summaryGrid, { backgroundColor: theme.colors.resultCard, paddingVertical: 18 }]}>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>PLACA</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.placa || '--'}</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>DNI</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.dni || '--'}</Text>
                                </View>

                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>NRO.</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.nroPapeleta || '--'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.resultsContainer}>
                            {loading ? (
                                <View style={{ width: '100%', paddingTop: 10 }}>
                                    {[1, 2, 3].map(i => (
                                        <View key={i} style={[styles.card, { backgroundColor: theme.colors.white, height: 100, justifyContent: 'center' }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Skeleton width={48} height={48} borderRadius={16} />
                                                <View style={{ marginLeft: 16, flex: 1 }}>
                                                    <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                                                    <Skeleton width="40%" height={12} />
                                                </View>
                                                <Skeleton width={80} height={20} />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <>
                                    <View style={[styles.totalSection, { backgroundColor: isDarkMode ? '#ffffff1a' : '#F8FAFC' }]}>
                                        <Text style={[styles.totalLabel, { color: theme.colors.slate }]}>Monto Total</Text>
                                        <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>S/ {totalAmount.toFixed(2)}</Text>
                                    </View>

                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Papeletas Encontradas</Text>

                                    {results.length > 0 ? (
                                        results.map((item: any, index: number) => (
                                            <PapeletaCard key={index} item={item} index={index} />
                                        ))
                                    ) : (
                                        <View style={styles.centered}>
                                            <Text style={[styles.emptyText, { color: theme.colors.slate }]}>No se encontraron resultados</Text>
                                        </View>
                                    )}
                                </>
                            )}
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
        paddingBottom: 40,
    },
    formCard: {
        flex: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 10,
        overflow: 'hidden',
    },
    summaryBanner: {
        padding: 20,
        paddingTop: 10,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 10,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        opacity: 0.9,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',

        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 20,
    },
    summaryItem: {
        minWidth: 60,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    resultsContainer: {
        padding: 20,
        margin: 0,
    },
    totalSection: {
        alignItems: 'center',
        marginBottom: 32,
        padding: 24,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: '900',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardHeaderInfo: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitleText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    cardSubtitleText: {
        fontSize: 12,
        marginTop: 2,
    },
    cardAmount: {
        fontSize: 18,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    detailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailLinkText: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardExpandedArea: {
        paddingTop: 8,
        paddingBottom: 20,
        paddingHorizontal: 4,
    },
    detailTable: {
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    centered: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    extraInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    extraInfoText: {
        fontSize: 12,
        flex: 1,
        lineHeight: 16,
    },
});
