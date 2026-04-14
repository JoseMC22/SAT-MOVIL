import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { ArrowLeft, Calendar, FileText, Info, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PapeletaResultsScreen({ route, navigation }: any) {
    const { results, searchCriteria } = route.params;
    const { theme, isDarkMode } = useTheme();
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

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
                <Text style={styles.headerTitle}>Resultado Papeletas</Text>
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
                                <Text style={[styles.summaryTitle, { color: theme.colors.slate }]}>Criterios de Búsqueda</Text>
                            </View>
                            <View style={[styles.summaryGrid, { backgroundColor: theme.colors.resultCard }]}>
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
});
