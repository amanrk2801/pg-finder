import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants/theme';

const GENDER_OPTIONS = [
    { value: 'Female', label: '👩 Female Only' },
    { value: 'Male', label: '👨 Male Only' },
];

const GenderSelector = ({ selected, onSelect, style }) => (
    <View style={[styles.container, style]}>
        {GENDER_OPTIONS.map(({ value, label }) => {
            const isActive = selected === value;
            return (
                <TouchableOpacity
                    key={value}
                    style={[styles.button, isActive && styles.buttonActive]}
                    onPress={() => onSelect(value)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.text, isActive && styles.textActive]}>
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
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    button: {
        flex: 1,
        padding: SPACING.lg,
        backgroundColor: COLORS.backgroundGray,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    buttonActive: {
        backgroundColor: COLORS.backgroundPink,
        borderColor: COLORS.primary,
    },
    text: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.semibold,
    },
    textActive: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.bold,
    },
});

export default GenderSelector;
