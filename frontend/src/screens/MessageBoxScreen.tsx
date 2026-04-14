import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme } from '../theme';
import { messageService } from '../services/api'; // Changed import
import { Mail, ChevronRight, Inbox, ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext'; // Added useAuth

export default function MessageBoxScreen({ navigation }: any) {
    const { theme, isDarkMode } = useTheme();
    const { token } = useAuth(); // Get token
    const [messages, setMessages] = useState<any[]>([]); // Empty initial state
    const [loading, setLoading] = useState(true); // Start loading
    const [refreshing, setRefreshing] = useState(false);

    const fetchMessages = async () => {
        if (!token) return;
        try {
            const data = await messageService.getMyMessages(token);
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMessages();
    };

    const handlePressMessage = async (item: any) => {
        if (!item.isRead && token) {
            try {
                // Background update
                messageService.markAsRead(item.id, token);
                
                // Immediate local UI update
                setMessages(prev => prev.map(msg => 
                    msg.id === item.id ? { ...msg, isRead: true } : msg
                ));
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        }
        navigation.navigate('MessageDetail', { message: item });
    };

    const renderMessageItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.messageCard,
                { backgroundColor: theme.colors.white },
                !item.isRead && { backgroundColor: isDarkMode ? '#334155' : '#F0F7FF', borderLeftColor: lightTheme.colors.primary, borderLeftWidth: 4 }
            ]}
            onPress={() => handlePressMessage(item)}
        >
            <View style={styles.messageIconContainer}>
                <Mail color={item.isRead ? theme.colors.slate : lightTheme.colors.primary} size={24} />
                {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                    <Text style={[styles.subject, !item.isRead && styles.unreadText, { color: theme.colors.headerCard }]} numberOfLines={1}>
                        {item.subject}
                    </Text>
                    <Text style={styles.date}>
                        {format(new Date(item.createdAt), 'dd MMM', { locale: es })}
                    </Text>
                </View>
                <Text style={[styles.preview, { color: theme.colors.bodyCard }]} numberOfLines={2}>
                    {item.body}
                </Text>
            </View>
            <ChevronRight color={theme.colors.border} size={20} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={lightTheme.colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Buzón de Mensajes</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ flex: 1, backgroundColor: theme.colors.white }}>
                <ScrollView
                    style={styles.contentScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.formCard, { backgroundColor: theme.colors.white }]}>
                        {loading ? (
                            <View style={styles.centered}>
                                <ActivityIndicator size="large" color={lightTheme.colors.primary} />
                            </View>
                        ) : messages.length === 0 ? (
                            <View style={styles.centered}>
                                <Inbox color={theme.colors.slate} size={64} opacity={0.3} />
                                <Text style={[styles.emptyText, { color: theme.colors.slate }]}>No tienes mensajes nuevos</Text>
                            </View>
                        ) : (
                            messages.map(item => renderMessageItem(item))
                        )}
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
        paddingHorizontal: lightTheme.spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 60, // Extra space for overlap
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingTop: 24,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
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
    messageCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    messageIconContainer: {
        marginRight: 12,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: lightTheme.colors.error,
        borderWidth: 2,
        borderColor: '#F0F7FF',
    },
    messageContent: {
        flex: 1,
        marginRight: 8,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    subject: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    unreadText: {
        fontWeight: '800',
    },
    date: {
        fontSize: 12,
        color: lightTheme.colors.slate,
    },
    preview: {
        fontSize: 14,
        lineHeight: 20,
    },
});
