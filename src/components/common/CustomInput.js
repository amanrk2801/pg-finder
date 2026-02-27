import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants/theme';

const CustomInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType = 'default',
    icon,
    style,
    multiline = false,
    numberOfLines = 1,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                {
                    borderColor: error ? COLORS.error : (isFocused ? COLORS.primary : COLORS.borderLight),
                    backgroundColor: COLORS.white,
                    height: multiline ? Math.max(50, numberOfLines * 25) : 56
                }
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={error ? COLORS.error : (isFocused ? COLORS.primary : COLORS.gray)}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.grayLight}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    {...rest}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={COLORS.gray}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: '100%',
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.black,
        marginBottom: 6,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        color: COLORS.black,
        fontSize: FONT_SIZES.base,
    },
    multilineInput: {
        paddingTop: SPACING.sm,
    },
    eyeIcon: {
        padding: SPACING.xs,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONT_SIZES.xs,
        marginTop: 4,
        marginLeft: 4,
    }
});

export default CustomInput;
