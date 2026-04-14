import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { ArrowLeft, Calendar, FileText, Info, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DebtResultsScreen({ route, navigation }: any) {
    const { results, searchCriteria } = route.params;
    const { theme, isDarkMode } = useTheme();
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

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
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Resultado de Consulta</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
                        {/* Summary Banner */}
                        <View style={[styles.summaryBanner, { backgroundColor: theme.colors.card }]}>
                            <View style={styles.summaryHeader}>
                                <Info color="#FFF" size={20} />
                                <Text style={[styles.summaryTitle, { color: theme.colors.slate }]}>Resumen de Búsqueda</Text>
                            </View>
                            <View style={[styles.summaryGrid, { backgroundColor: theme.colors.resultCard }]}>
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
                            <View style={[styles.totalSection, { backgroundColor: isDarkMode ? '#ffffff1a' : '#F8FAFC' }]}>
                                <Text style={[styles.totalLabel, { color: theme.colors.slate }]}>Deuda Total</Text>
                                <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>S/ {totalAmount.toFixed(2)}</Text>
                            </View>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{results[0].des_cabecera}</Text>

                            {results.length > 0 ? (
                                results.map((item: any, index: number) => (
                                    <DebtCard key={index} item={item} index={index} />
                                ))
                            ) : (
                                <View style={styles.centered}>
                                    <Text style={[styles.emptyText, { color: theme.colors.slate }]}>No se encontraron resultados</Text>
                                </View>
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
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
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
});
