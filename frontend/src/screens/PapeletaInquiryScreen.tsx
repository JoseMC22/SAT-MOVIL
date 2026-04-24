import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ArrowLeft, Search, Info } from 'lucide-react-native';
import { papeletaService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';

const YEAR_OPTIONS = [
    { label: 'Todos los años', value: '' },
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
];

export default function PapeletaInquiryScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { token } = useAuth();
    const [anno, setAnno] = useState('');
    const [placa, setPlaca] = useState('');
    const [dni, setDni] = useState('');
    const [nroPapeleta, setNroPapeleta] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        if (!anno && !placa && !dni && !nroPapeleta) {
            alert('Por favor, ingrese al menos un criterio de búsqueda');
            return;
        }

        setLoading(true);
        // We still use a small timeout to show immediate feedback on the button 
        // before navigating for a smoother transition
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('PapeletaResults', {
                searchCriteria: { anno, placa, dni, nroPapeleta }
            });
        }, 300);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Consulta de Papeletas" />

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
                                label="Placa"
                                value={placa}
                                onChangeText={text => setPlaca(text.toUpperCase())}
                                placeholder="Ej: ABC123"
                                autoCapitalize="characters"
                            />

                            <Input
                                label="DNI / RUC"
                                value={dni}
                                onChangeText={setDni}
                                placeholder="Ingrese DNI"
                                keyboardType="numeric"
                            />

                            <Select
                                label="Año"
                                options={YEAR_OPTIONS}
                                value={anno}
                                onSelect={setAnno}
                            />

                            <Input
                                label="Número de Papeleta"
                                value={nroPapeleta}
                                onChangeText={setNroPapeleta}
                                placeholder="Ej: 123456"
                                keyboardType="numeric"
                            />

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
                                Puede realizar la búsqueda utilizando uno o más criterios. Si no ingresa ningún criterio, se mostrarán los resultados generales.
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
