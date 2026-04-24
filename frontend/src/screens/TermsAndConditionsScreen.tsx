import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { AppHeader } from '../components/AppHeader';
import { ShieldCheck } from 'lucide-react-native';

export default function TermsAndConditionsScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader title="Términos y Condiciones" />

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
                        <View style={styles.introSection}>
                            <ShieldCheck color={theme.colors.primary} size={40} />
                            <Text style={[styles.mainTitle, { color: theme.colors.primary }]}>
                                Términos de Servicio
                            </Text>
                            <Text style={[styles.dateText, { color: theme.colors.slate }]}>
                                Última actualización: Octubre 2023
                            </Text>
                        </View>

                        <View style={styles.contentSection}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Aceptación de los Términos</Text>
                            <Text style={[styles.paragraph, { color: theme.colors.slate }]}>
                                Al acceder y utilizar la aplicación móvil SAT-MOVIL, usted acepta cumplir y estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestro servicio.
                            </Text>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Uso de la Aplicación</Text>
                            <Text style={[styles.paragraph, { color: theme.colors.slate }]}>
                                La aplicación SAT-MOVIL es una herramienta oficial del Servicio de Administración Tributaria. Se le concede una licencia no exclusiva y no transferible para utilizar la aplicación para fines de consulta y realización de trámites personales.
                            </Text>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Privacidad y Datos Personales</Text>
                            <Text style={[styles.paragraph, { color: theme.colors.slate }]}>
                                Nos tomamos muy en serio la seguridad de sus datos. La información recopilada (como su DNI, selfies, y datos de contacto) será utilizada única y exclusivamente para los fines de validación de identidad y provisión de los servicios requeridos según lo enmarcado en la Ley de Protección de Datos Personales.
                            </Text>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Responsabilidades</Text>
                            <Text style={[styles.paragraph, { color: theme.colors.slate }]}>
                                El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña. El SAT ICA no será responsable frente a accesos no autorizados si el usuario ha descuidado el resguardo de su información de inicio de sesión.
                            </Text>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Modificaciones</Text>
                            <Text style={[styles.paragraph, { color: theme.colors.slate }]}>
                                Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es importante, intentaremos proporcionar un aviso con al menos 30 días de antelación.
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
        marginTop: -40,
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
        shadowRadius: 10,
        padding: 24,
    },
    introSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginTop: 16,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    contentSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 16,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'justify',
    },
});
