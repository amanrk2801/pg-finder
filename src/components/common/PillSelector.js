import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants/theme';

const PillSelector = ({ options, selectedKeys, onToggle, style }) => (
    <View style={[styles.container, style]}>
        {options.map(({ key, label }) => {
            const isSelected = selectedKeys.includes(key);
            return (
                <TouchableOpacity
                    key={key}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => onToggle(key)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    pill: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.backgroundGray,
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pillText: {
        color: COLORS.gray,
        fontSize: FONT_SIZES.sm,
        fontWeight: FONT_WEIGHTS.medium,
    },
    pillTextActive: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
    },
});

export default PillSelector;
