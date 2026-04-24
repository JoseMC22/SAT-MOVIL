import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from './Skeleton';
import { useTheme } from '../context/ThemeContext';

export const MessageSkeleton = () => {
    const { isDarkMode } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF' }]}>
            <Skeleton width={48} height={48} borderRadius={24} />
            <View style={styles.content}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={12} />
            </View>
        </View>
    );
};

export const TramiteSkeleton = () => {
    const { isDarkMode } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF' }]}>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Skeleton width={100} height={14} />
                    <Skeleton width={80} height={20} borderRadius={10} />
                </View>
                <Skeleton width="100%" height={12} style={{ marginVertical: 12 }} />
                <Skeleton width="100%" height={8} borderRadius={4} />
            </View>
        </View>
    );
};

export const DebtSkeleton = () => {
    const { isDarkMode } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF', flexDirection: 'column', height: 180 }]}>
            <View style={styles.headerRow}>
                <Skeleton width="40%" height={18} />
                <Skeleton width={24} height={24} borderRadius={12} />
            </View>
            <View style={{ marginTop: 20 }}>
                <View style={styles.dataRow}>
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="40%" height={12} />
                </View>
                <View style={styles.dataRow}>
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="40%" height={12} />
                </View>
                <View style={styles.dataRow}>
                    <Skeleton width="30%" height={12} />
                    <Skeleton width="40%" height={12} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    }
});
