import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_WEIGHTS, FONT_SIZES, SHADOWS } from '../../constants/theme';

const CustomButton = ({
    title,
    onPress,
    type = 'primary', // 'primary', 'secondary', 'outline', 'danger'
    size = 'large',   // 'small', 'medium', 'large'
    disabled = false,
    loading = false,
    style,
    textStyle
}) => {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.grayLight;
        switch (type) {
            case 'secondary': return COLORS.secondary;
            case 'outline': return 'transparent';
            case 'danger': return COLORS.error;
            case 'primary':
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.gray;
        switch (type) {
            case 'outline': return COLORS.primary;
            case 'secondary': return COLORS.black;
            case 'danger':
            case 'primary':
            default: return COLORS.white;
        }
    };

    const getBorderColor = () => {
        if (type === 'outline') return disabled ? COLORS.grayLight : COLORS.primary;
        return 'transparent';
    };

    const getPadding = () => {
        switch (size) {
            case 'small': return SPACING.sm;
            case 'medium': return SPACING.md;
            case 'large':
            default: return SPACING.lg;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: type === 'outline' ? 2 : 0,
                    paddingVertical: getPadding(),
                },
                type !== 'outline' && type !== 'secondary' && !disabled ? SHADOWS.medium : null,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[
                    styles.text,
                    { color: getTextColor(), fontSize: size === 'small' ? FONT_SIZES.sm : FONT_SIZES.md },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    text: {
        fontWeight: FONT_WEIGHTS.bold,
    }
});

export default CustomButton;
