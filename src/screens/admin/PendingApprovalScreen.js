import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function PendingApprovalScreen({ navigation }) {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundGray} />

            <View style={styles.card}>
                <View style={styles.iconCircle}>
                    <Ionicons name="time-outline" size={60} color={COLORS.primary} />
                </View>

                <Text style={styles.title}>Application Pending</Text>
                <Text style={styles.message}>
                    Hello {user?.name || 'Partner'}, your request to list a new PG is currently under review by our super admin team.
                </Text>
                <Text style={styles.subtext}>
                    We will notify you on {user?.email} once your account is approved. This usually takes 24-48 hours.
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundGray, justifyContent: 'center', padding: SPACING.xl },
    card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', ...SHADOWS.large },
    iconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.backgroundPink,
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl,
    },
    title: { ...TYPOGRAPHY.h2, color: COLORS.black, marginBottom: SPACING.md, textAlign: 'center' },
    message: { fontSize: FONT_SIZES.md, color: COLORS.gray, textAlign: 'center', lineHeight: 24, marginBottom: SPACING.lg },
    subtext: { fontSize: FONT_SIZES.sm, color: COLORS.primary, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xxl, fontWeight: '500' },
    button: {
        backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, width: '100%', ...SHADOWS.small,
    },
    buttonText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md, marginLeft: SPACING.sm },
});
