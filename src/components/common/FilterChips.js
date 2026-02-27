import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants/theme';

const FilterChips = ({
    filters,
    selectedId,
    onSelect,
    showIcons = false,
    style,
}) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, style]}
    >
        {filters.map((filter) => {
            const isActive = selectedId === filter.id;
            return (
                <TouchableOpacity
                    key={filter.id}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => onSelect(filter.id)}
                    activeOpacity={0.8}
                >
                    {showIcons && filter.icon && (
                        <Ionicons
                            name={isActive ? filter.icon : `${filter.icon}-outline`}
                            size={16}
                            color={isActive ? COLORS.primary : COLORS.gray}
                            style={styles.chipIcon}
                        />
                    )}
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.xxl,
        gap: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGray,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: COLORS.backgroundPink,
        borderColor: COLORS.primary,
    },
    chipIcon: {
        marginRight: 6,
    },
    chipText: {
        fontSize: FONT_SIZES.sm + 1,
        color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.semibold,
    },
    chipTextActive: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.extrabold,
    },
});

export default FilterChips;
