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
import { AppHeader } from '../components/AppHeader';

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
            if (codigo && showSubOptions && token) {
                setLoadingSubOptions(true);
                try {
                    const options = await debtService.getSubOptions(codigo, tributo, token, anno);
                    setSubOptions([{ label: 'Todos', value: '' }, ...options]);
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

    const handleSearch = () => {
        if (!codigo) {
            alert('Por favor ingrese su código de contribuyente');
            return;
        }
        const isVehicular = tributo === '00.30';
        if (!tributo || (!isVehicular && !anno)) {
            alert(!tributo ? 'Por favor seleccione el Tributo' : 'Por favor seleccione el Año');
            return;
        }

        navigation.navigate('DebtResults', {
            searchCriteria: { codigo, anno, tributo, predio: selectedSubOption }
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Consulta de Deuda" />

            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* White Container Overlapping Header */}
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
                        <View style={styles.form}>

                            <Input
                                label="Código del Contribuyente"
                                value={codigo}
                                onChangeText={setCodigo}
                                placeholder="Ej: 0123456"
                                keyboardType="numeric"
                                editable={false}
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
                                    label={tributo === '00.30' ? "Placas" : "Predios"}
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
