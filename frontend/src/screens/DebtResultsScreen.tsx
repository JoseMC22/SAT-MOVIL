import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { ArrowLeft, Calendar, FileText, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { DebtSkeleton } from '../components/SkeletonCards';
import { debtService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DebtResultsScreen({ route, navigation }: any) {
    const { searchCriteria } = route.params;
    const { theme, isDarkMode } = useTheme();
    const { token } = useAuth();

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const consolidatedData = React.useMemo(() => {
        if (searchCriteria.predio !== '' || results.length === 0) return [];

        const groups: any = {};
        results.forEach((item: any) => {
            const key = item.cod_pred || 'N/A';
            if (!groups[key]) {
                groups[key] = {
                    cod_pred: key,
                    ubica: item.ubica,
                    dir: item.dir,
                    concepts: {}
                };
            }

            const conceptKey = item.des_tipo || 'Deuda';
            if (!groups[key].concepts[conceptKey]) {
                groups[key].concepts[conceptKey] = {
                    des_tipo: conceptKey,
                    imp_reaj: 0,
                    mora: 0,
                    dir: item.dir,


                };
            }
            groups[key].concepts[conceptKey].imp_reaj += item.imp_reaj || 0;
            groups[key].concepts[conceptKey].mora += item.mora || 0;
        });


        const finalData = Object.values(groups).map((group: any) => ({
            ...group,
            concepts: Object.values(group.concepts)
        }));
        console.log("DATOS CONSOLIDADOS:", finalData); // <--- Agrégalo aquí
        return finalData;
    }, [results, searchCriteria.predio]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!token) return;
            try {
                const data = await debtService.getDebt(
                    searchCriteria.codigo,
                    searchCriteria.tributo,
                    searchCriteria.predio,
                    token,
                    searchCriteria.anno
                );
                setResults(data || []);
            } catch (error) {
                console.error('Error fetching debt results:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const totalAmount = results.reduce((sum: number, item: any) => sum + (item.imp_reaj + item.mora + item.costo_emis || 0), 0);

    const toggleExpand = useCallback((id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const parts = dateString.split('T')[0].split('-');
            if (parts.length !== 3) return dateString;
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    };

    const DebtCard = ({ item, index }: { item: any; index: number }) => {
        const isExpanded = expandedIds.includes(index);
        let totalitem = item.imp_reaj + item.mora + item.costo_emis - item.descuento;
        return (
            <>
                <View style={[styles.debtCard, { backgroundColor: theme.colors.white, borderColor: isExpanded ? theme.colors.primary : theme.colors.border, borderWidth: isExpanded ? 2 : 1 }]}>
                    <TouchableOpacity
                        onPress={() => toggleExpand(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]}>
                                <FileText color={theme.colors.primary} size={24} />
                            </View>
                            <View style={styles.cardHeaderInfo}>
                                <Text style={[styles.debtName, { color: theme.colors.text }]}>{item.des_tipo || 'Deuda'}</Text>
                                <Text style={[styles.debtPeriod, { color: theme.colors.slate }]}>Periodo: {item.periodo}</Text>
                            </View>
                            <Text style={[styles.debtAmount, { color: theme.colors.text }]}>S/ {(totalitem || 0).toFixed(2)}</Text>
                        </View>
                    </TouchableOpacity>

                    {isExpanded && (
                        <View style={styles.cardExpandedArea}>
                            <View style={[styles.detailTable, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabelValue, { color: theme.colors.slate }]}>Insoluto:</Text>
                                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>S/ {(item.imp_reaj || 0).toFixed(2)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabelValue, { color: theme.colors.slate }]}>Mora / Interés:</Text>
                                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>S/ {(item.mora || 0).toFixed(2)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabelValue, { color: theme.colors.slate }]}>Costo Emisión:</Text>
                                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>S/ {(item.costo_emis || 0).toFixed(2)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabelValue, { color: theme.colors.slate }]}>Cod. Predio:</Text>
                                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>{item.cod_pred || 'N/A'}</Text>
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
                            <Text style={[styles.tagText, { color: theme.colors.slate }]}>Vence: {formatDate(item.fec_venc)}</Text>
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
            </>
        );
    };

    const ConsolidatedDebtCard = ({ item, index }: { item: any; index: number }) => {
        const isExpanded = expandedIds.includes(index);
        const totalPredio = item.concepts.reduce((sum: number, c: any) => sum + c.imp_reaj + c.mora, 0);

        return (
            <>

                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: index === 0 ? 0 : 20 }]}>
                    {item.dir}
                </Text>

                <View style={[styles.debtCard, { backgroundColor: theme.colors.white, borderColor: isExpanded ? theme.colors.primary : theme.colors.border, borderWidth: isExpanded ? 2 : 1 }]}>
                    <TouchableOpacity
                        onPress={() => toggleExpand(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF' }]}>
                                <FileText color={theme.colors.primary} size={24} />
                            </View>
                            <View style={styles.cardHeaderInfo}>
                                <Text style={[styles.debtName, { color: theme.colors.text }]}>Cod. Predio: {item.cod_pred}</Text>
                                {/* <Text style={[styles.debtPeriod, { color: theme.colors.slate }]} numberOfLines={1}>{item.ubica}</Text> */}
                            </View>
                            <Text style={[styles.debtAmount, { color: theme.colors.text }]}>S/ {totalPredio.toFixed(2)}</Text>
                        </View>
                    </TouchableOpacity>

                    {isExpanded && (
                        <View style={styles.cardExpandedArea}>
                            <View style={[styles.consolidatedTable, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
                                    <Text style={[styles.tableHeaderCell, { color: theme.colors.slate, flex: 2.5 }]}>Concepto</Text>
                                    <Text style={[styles.tableHeaderCell, { color: theme.colors.slate, textAlign: 'right' }]}>Ins.</Text>
                                    <Text style={[styles.tableHeaderCell, { color: theme.colors.slate, textAlign: 'right' }]}>Mora</Text>
                                    <Text style={[styles.tableHeaderCell, { color: theme.colors.slate, textAlign: 'right' }]}>Total</Text>
                                </View>
                                {/* Table Body */}
                                {item.concepts.map((concept: any, cIndex: number) => (
                                    <View key={cIndex} style={[styles.tableRow, { borderBottomColor: theme.colors.border, borderBottomWidth: cIndex === item.concepts.length - 1 ? 0 : 0.5 }]}>
                                        <Text style={[styles.tableCell, { color: theme.colors.text, flex: 2.5 }]} numberOfLines={1}>{concept.des_tipo}</Text>
                                        <Text style={[styles.tableCell, { color: theme.colors.text, textAlign: 'right' }]}>{concept.imp_reaj.toFixed(2)}</Text>
                                        <Text style={[styles.tableCell, { color: theme.colors.text, textAlign: 'right' }]}>{concept.mora.toFixed(2)}</Text>
                                        <Text style={[styles.tableCell, { color: theme.colors.text, textAlign: 'right', fontWeight: 'bold' }]}>{(concept.imp_reaj + concept.mora).toFixed(2)}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}
                        onPress={() => toggleExpand(index)}
                    >
                        <View style={[styles.tag, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                            <Info size={12} color={theme.colors.slate} />
                            <Text style={[styles.tagText, { color: theme.colors.slate }]}>Consolidado por Predio</Text>
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
            </>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Resultado de Consulta" />

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
                                Resumen de Búsqueda
                            </Text>
                        </View>

                        {/* Summary Banner Card */}
                        <View style={[
                            styles.summaryBanner,
                            {
                                backgroundColor: theme.colors.card,
                                borderRadius: 24, // Full rounded corners
                                marginHorizontal: 20,
                                padding: 0,
                                overflow: 'hidden'
                            }
                        ]}>
                            <View style={[styles.summaryGrid, { backgroundColor: theme.colors.resultCard, paddingVertical: 18 }]}>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>CÓDIGO</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.codigo}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>TRIBUTO</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.tributo}</Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={[styles.summaryLabel, { color: theme.colors.headerCard }]}>AÑO</Text>
                                    <Text style={[styles.summaryValue, { color: theme.colors.bodyCard }]}>{searchCriteria.anno}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.resultsContainer}>
                            {loading ? (
                                <View style={{ width: '100%', paddingTop: 10 }}>
                                    {[1, 2, 3].map(i => <DebtSkeleton key={i} />)}
                                </View>
                            ) : (
                                <>
                                    <View style={[styles.totalSection, { backgroundColor: isDarkMode ? '#ffffff1a' : '#F8FAFC' }]}>
                                        <Text style={[styles.totalLabel, { color: theme.colors.slate }]}>Deuda Total</Text>
                                        <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>S/ {totalAmount.toFixed(2)}</Text>
                                    </View>

                                    {(results.length > 0 && (searchCriteria.predio !== '' || searchCriteria.tributo === '02.01')) && (
                                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                            {results[0]?.des_cabecera || 'Resultados Encontrados'}
                                        </Text>
                                    )}

                                    {results.length > 0 ? (
                                        (searchCriteria.predio === '' && searchCriteria.tributo !== '02.01') ? (
                                            consolidatedData.map((item: any, index: number) => (
                                                <ConsolidatedDebtCard key={index} item={item} index={index} />
                                            ))
                                        ) : (
                                            results.map((item: any, index: number) => (
                                                <DebtCard key={index} item={item} index={index} />
                                            ))
                                        )
                                    ) : (
                                        <View style={styles.centered}>
                                            <Text style={[styles.emptyText, { color: theme.colors.slate }]}>No se encontraron resultados</Text>
                                        </View>
                                    )}
                                </>
                            )}

                            <View style={styles.extraInfo}>
                                <CheckCircle2 color={theme.colors.success} size={16} />
                                <Text style={[styles.extraInfoText, { color: theme.colors.text }]}>
                                    Valores actualizados al día de hoy. Incluye moras e intereses de ley.
                                </Text>
                            </View>
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
        padding: 16,
        borderRadius: 20,
    },
    summaryItem: {
        flex: 1,
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
        margin: 0
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
    debtCard: {
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
    debtName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    debtPeriod: {
        fontSize: 12,
        marginTop: 2,
    },
    debtAmount: {
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
    },
    detailLabelValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailVal: {
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
    consolidatedTable: {
        borderRadius: 16,
        padding: 12,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
    },
    tableHeader: {
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    tableHeaderCell: {
        fontSize: 10,
        fontWeight: '700',
        flex: 1,
    },
    tableCell: {
        fontSize: 11,
        flex: 1,
    },
});
