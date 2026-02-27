import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = 'Search...',
    onSubmit,
    showFilterIcon = false,
    onFilterPress,
    style,
}) => (
    <View style={[styles.container, style]}>
        <View style={styles.searchBox}>
            <Ionicons name="search" size={22} color={COLORS.gray} style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.grayLight}
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                onSubmitEditing={onSubmit}
            />
            {showFilterIcon && (
                <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
                    <Ionicons name="options" size={20} color={COLORS.white} />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.xxl,
        marginBottom: SPACING.lg,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.xxl,
        paddingLeft: SPACING.lg,
        paddingRight: 6,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    icon: {
        marginRight: SPACING.md,
    },
    input: {
        flex: 1,
        fontSize: FONT_SIZES.lg,
        color: COLORS.black,
        fontWeight: '500',
    },
    filterButton: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.circle,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SearchBar;
