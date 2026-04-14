import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ArrowLeft, Search, Info } from 'lucide-react-native';
import { debtService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const YEAR_OPTIONS = [
    { label: '2026', value: '2026' },
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' },
    { label: '2020', value: '2020' },
    { label: '2019', value: '2019' },
    { label: '2018', value: '2018' },
    { label: '2017', value: '2017' },
    { label: '2016', value: '2016' },
    { label: '2015', value: '2015' },
    { label: '2014', value: '2014' },
    { label: '2013', value: '2013' },
    { label: '2012', value: '2012' },
    { label: '2011', value: '2011' },
    { label: '2010', value: '2010' },
    { label: '2009', value: '2009' },
    { label: '2008', value: '2008' },
    { label: '2007', value: '2007' },
    { label: '2006', value: '2006' },
    { label: '2005', value: '2005' },
    { label: '2004', value: '2004' },
    { label: '2003', value: '2003' },
    { label: '2002', value: '2002' },
    { label: '2001', value: '2001' },
    { label: '2000', value: '2000' },
    { label: '1999', value: '1999' },
];

const TRIBUTO_OPTIONS = [
    { label: 'Impuesto Predial', value: '02.01' },
    { label: 'Arbitrios Municipales', value: '11.00' },
    { label: 'Vehicular', value: '00.30' },
    { label: 'Alcabala', value: '00.38' },
];

export default function DebtInquiryScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { user, token } = useAuth();
    const [codigo, setCodigo] = useState(user?.codigo || '');
    const [anno, setAnno] = useState('');
    const [tributo, setTributo] = useState('');
    const [loading, setLoading] = useState(false);
    const [subOptions, setSubOptions] = useState<{ label: string, value: string }[]>([]);
    const [selectedSubOption, setSelectedSubOption] = useState('');
    const [loadingSubOptions, setLoadingSubOptions] = useState(false);

    const showSubOptions = tributo === '11.00' || tributo === '00.30' || tributo === '00.38';

    useEffect(() => {
        const fetchSubOptions = async () => {
            if (codigo && anno && showSubOptions) {
                setLoadingSubOptions(true);
                try {
                    const options = await debtService.getSubOptions(codigo, anno, tributo, token || undefined);
                    setSubOptions(options);
                    setSelectedSubOption('');
                } catch (error) {
                    console.error('Error fetching sub-options:', error);
                    setSubOptions([]);
                } finally {
                    setLoadingSubOptions(false);
                }
            } else {
                setSubOptions([]);
                setSelectedSubOption('');
            }
        };

        fetchSubOptions();
    }, [codigo, anno, tributo, showSubOptions]);

    const handleSearch = async () => {
        if (!codigo) {
            alert('Por favor ingrese su código de contribuyente');
            return;
        }
        if (!anno || !tributo) {
            alert('Por favor seleccione Año y Tributo');
            return;
        }
        setLoading(true);
        try {
            const results = await debtService.getDebt(codigo, anno, tributo, selectedSubOption, token || undefined);

            if (!results || results.length === 0) {
                alert('No se encontraron resultados de deuda para los criterios seleccionados.');
                return;
            }

            navigation.navigate('DebtResults', {
                results: results,
                searchCriteria: { codigo, anno, tributo, predio: selectedSubOption }
            });
        } catch (e: any) {
            alert('Error consultando deuda. ' + (e.response?.data?.message || 'Intente nuevamente.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.primary} />

            {/* Blue Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Consulta de Deuda</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* White Container Overlapping Header */}
                    <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
                        <View style={styles.form}>

                            <Input
                                label="Código del Contribuyente"
                                value={codigo}
                                onChangeText={setCodigo}
                                placeholder="Ej: 0123456"
                                keyboardType="numeric"
                            />

                            <Select
                                label="Año"
                                options={YEAR_OPTIONS}
                                value={anno}
                                onSelect={setAnno}
                            />

                            <Select
                                label="Tributo"
                                options={TRIBUTO_OPTIONS}
                                value={tributo}
                                onSelect={setTributo}
                            />

                            {showSubOptions && (
                                <Select
                                    label={tributo === '00.30' ? "Vehículo" : "Predio / Detalle"}
                                    options={subOptions}
                                    value={selectedSubOption}
                                    onSelect={setSelectedSubOption}
                                    placeholder={loadingSubOptions ? "Cargando..." : "Seleccione una opción"}
                                />
                            )}

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Consultar"
                                    onPress={handleSearch}
                                    loading={loading}
                                    icon={<Search color="#FFF" size={20} />}
                                    iconPosition="right"
                                />
                            </View>
                        </View>

                        {/* Info Banner */}
                        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F7FF', borderColor: theme.colors.border }]}>
                            <Info color={theme.colors.primary} size={20} style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: theme.colors.slate }]}>
                                Asegúrese de ingresar su código correctamente. Puede encontrarlo en su recibo de pago anterior.
                            </Text>
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
        fontWeight: '700',
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
        padding: 24,
        minHeight: 600,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    form: {
        width: '100%',
    },
    buttonContainer: {
        marginTop: 20,
    },
    infoBanner: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        marginTop: 40,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    infoIcon: {
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
});
