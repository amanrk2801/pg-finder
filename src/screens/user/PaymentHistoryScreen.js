import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, EmptyState } from '../../components/common';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_CONFIG = {
    paid:    { icon: 'checkmark-circle', color: '#2E7D32', bg: '#E8F5E9', label: 'Paid' },
    pending: { icon: 'time',             color: '#F57C00', bg: '#FFF3E0', label: 'Pending' },
    failed:  { icon: 'close-circle',     color: '#D32F2F', bg: '#FFEBEE', label: 'Failed' },
};

export default function PaymentHistoryScreen({ navigation }) {
    const { user } = useAuth();
    const { payments } = useData();

    const userPayments = useMemo(
        () => payments.filter(p => p.userId === user?.id).sort((a, b) => new Date(b.date) - new Date(a.date)),
        [payments, user],
    );

    const totalPaid = useMemo(
        () => userPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
        [userPayments],
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Payment History" onBack={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {userPayments.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <View>
                                <Text style={styles.summaryLabel}>Total Paid</Text>
                                <Text style={styles.summaryAmount}>₹{totalPaid.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryIconBox}>
                                <Ionicons name="wallet-outline" size={28} color={COLORS.primary} />
                            </View>
                        </View>
                        <View style={styles.summaryMeta}>
                            <Text style={styles.summaryMetaText}>{userPayments.length} transactions</Text>
                        </View>
                    </View>
                )}

                {userPayments.length === 0 ? (
                    <EmptyState
                        icon="receipt-outline"
                        title="No payments yet"
                        message="Your payment history will appear here once you make your first rent payment."
                    />
                ) : (
                    userPayments.map(payment => {
                        const config = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                        return (
                            <View key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <View style={styles.paymentMonthBlock}>
                                        <Text style={styles.paymentMonth}>
                                            {MONTH_NAMES[(payment.month || 1) - 1]} {payment.year}
                                        </Text>
                                        <Text style={styles.paymentDate}>
                                            {new Date(payment.date).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={styles.paymentAmount}>₹{(payment.amount || 0).toLocaleString()}</Text>
                                </View>

                                <View style={styles.paymentFooter}>
                                    <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
                                        <Ionicons name={config.icon} size={14} color={config.color} />
                                        <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                                    </View>
                                    <Text style={styles.methodText}>
                                        {(payment.method || 'UPI').toUpperCase()}
                                    </Text>
                                    {payment.transactionId && (
                                        <Text style={styles.txnText}>#{payment.transactionId.slice(-8)}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, backgroundColor: COLORS.backgroundGray },

    summaryCard: {
        backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl, ...SHADOWS.medium,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray, fontWeight: FONT_WEIGHTS.medium },
    summaryAmount: { fontSize: 32, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.black, marginTop: 4 },
    summaryIconBox: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.backgroundPink,
        justifyContent: 'center', alignItems: 'center',
    },
    summaryMeta: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.backgroundGray },
    summaryMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.gray },

    paymentCard: {
        backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, ...SHADOWS.small,
    },
    paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    paymentMonthBlock: { flex: 1 },
    paymentMonth: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    paymentDate: { fontSize: FONT_SIZES.sm, color: COLORS.gray, marginTop: 2 },
    paymentAmount: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.black },

    paymentFooter: {
        flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md,
        paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.backgroundGray, gap: SPACING.md,
    },
    statusPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm,
    },
    statusLabel: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase' },
    methodText: { fontSize: FONT_SIZES.xs, color: COLORS.gray, fontWeight: FONT_WEIGHTS.semibold },
    txnText: { fontSize: FONT_SIZES.xs, color: COLORS.grayLight, marginLeft: 'auto' },
});
