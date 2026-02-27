import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const EmptyState = ({
    icon = 'search-outline',
    title = 'Nothing here',
    message = '',
    iconColor = COLORS.primary,
    children,
}) => (
    <View style={styles.container}>
        <View style={styles.iconCircle}>
            <Ionicons name={icon} size={48} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {!!message && <Text style={styles.message}>{message}</Text>}
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.backgroundPink,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.sm,
        color: COLORS.black,
        textAlign: 'center',
    },
    message: {
        fontSize: FONT_SIZES.base,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default EmptyState;
