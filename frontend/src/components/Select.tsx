import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ChevronDown, Check, X } from 'lucide-react-native';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label: string;
    options: Option[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
}

export const Select = ({ label, options, value, onSelect, placeholder }: SelectProps) => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: string) => {
        onSelect(val);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.colors.slate }]}>{label.toUpperCase()}</Text>
            <TouchableOpacity
                style={[styles.selectTrigger, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.valueText,
                    { color: theme.colors.text },
                    !selectedOption && styles.placeholderText
                ]}>
                    {selectedOption ? selectedOption.label : placeholder || 'Seleccione una opción'}
                </Text>
                <ChevronDown color={theme.colors.slate} size={20} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBlur}
                        onPress={() => setVisible(false)}
                    />
                    <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.selectTitle }]}>{label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <X color={theme.colors.slate} size={24} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        { borderBottomColor: theme.colors.border },
                                        item.value === value && { backgroundColor: theme.colors.primary + '10' }
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        { color: theme.colors.selectListItem },
                                        item.value === value && { color: theme.colors.primary, fontWeight: '700' }
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Check color={theme.colors.primary} size={20} />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.listContent}
                        />
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 4,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
        marginLeft: 4,
    },
    // label: {
    //     fontSize: 14,
    //     fontWeight: '700',
    //     marginBottom: 8,
    // },

    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    valueText: {
        fontSize: 16,
        fontWeight: '500',
    },
    placeholderText: {
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalBlur: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    listContent: {
        paddingBottom: 40,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
