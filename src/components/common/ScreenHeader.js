import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

const ScreenHeader = ({
    title,
    subtitle,
    onBack,
    rightComponent,
    centerTitle = false,
    style,
}) => (
    <View style={[styles.container, style]}>
        {onBack && (
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.8}
            >
                <Ionicons name="chevron-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
        )}

        {centerTitle && !onBack && <View style={styles.placeholder} />}

        <View style={[styles.titleBlock, centerTitle && styles.titleBlockCenter]}>
            <Text style={centerTitle ? styles.centerTitle : styles.title} numberOfLines={1}>
                {title}
            </Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.rightSlot}>
            {rightComponent || (centerTitle && <View style={styles.placeholder} />)}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.backgroundGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    titleBlock: {
        flex: 1,
    },
    titleBlockCenter: {
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.black,
        letterSpacing: -0.5,
    },
    centerTitle: {
        fontSize: 20,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginTop: 2,
        fontWeight: FONT_WEIGHTS.medium,
    },
    rightSlot: {
        alignItems: 'flex-end',
    },
    placeholder: {
        width: 42,
    },
});

export default ScreenHeader;
