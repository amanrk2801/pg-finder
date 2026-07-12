import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PGCard from '../../components/cards/PGCard';
import { EmptyState, ScreenHeader } from '../../components/common';

const STATUS_CONFIG = {
    active: { label: 'Active Stay', bg: '#E8F5E9', color: '#4CAF50', icon: 'checkmark-circle' },
    completed: { label: 'Left', bg: '#F0F2F5', color: COLORS.gray, icon: 'log-out-outline' },
    cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: COLORS.error, icon: 'close-circle' },
};

export default function MyBookingsScreen({ navigation }) {
    const { pgs, bookings, clearBookings } = useData();
    const { user } = useAuth();

    const userBookings = bookings
        .filter(b => b.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const handleClearAll = () => {
        Alert.alert('Clear History', 'Are you sure you want to clear your booking history?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', onPress: () => clearBookings(user.id), style: 'destructive' },
        ]);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const clearButton = userBookings.length > 0 ? (
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
    ) : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="My Bookings" subtitle="Manage your stays" rightComponent={clearButton} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {userBookings.length === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="No bookings yet"
                        message="When you book a bed, it will appear here."
                    >
                        <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.exploreButtonText}>Explore Properties</Text>
                        </TouchableOpacity>
                    </EmptyState>
                ) : (
                    userBookings.map((booking) => {
                        const pg = pgs.find(p => p.id === booking.pgId);
                        const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.active;

                        return (
                            <View key={booking.id} style={statusInfo === STATUS_CONFIG.active ? null : styles.pastBookingWrap}>
                                <View style={styles.bookingHeader}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                                        <Ionicons name={statusInfo.icon} size={12} color={statusInfo.color} style={{ marginRight: 4 }} />
                                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(booking.date || booking.createdAt)}</Text>
                                </View>

                                {pg ? (
                                    <PGCard
                                        pg={pg}
                                        onPress={() => navigation.navigate(ROUTES.USER.PG_DETAILS, { pg })}
                                        showFavoriteIcon={false}
                                    />
                                ) : (
                                    <View style={styles.unknownPgCard}>
                                        <Ionicons name="home-outline" size={20} color={COLORS.gray} />
                                        <Text style={styles.unknownPgText}>Property no longer listed</Text>
                                    </View>
                                )}

                                {pg && (
                                    <TouchableOpacity
                                        style={styles.disputeButton}
                                        onPress={() => navigation.navigate(ROUTES.USER.RAISE_ISSUE, { pgId: pg.id, bookingId: booking.id })}
                                    >
                                        <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                                        <Text style={styles.disputeText}>Raise Issue / Dispute</Text>
                                    </TouchableOpacity>
                                )}
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
    clearButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.backgroundPink, borderRadius: BORDER_RADIUS.md,
    },
    content: { flex: 1, backgroundColor: COLORS.white, paddingTop: SPACING.lg },
    exploreButton: {
        backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginTop: SPACING.xxl,
    },
    exploreButtonText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
    bookingHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: SPACING.xxl, marginBottom: SPACING.sm, marginTop: SPACING.md,
    },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm,
    },
    statusText: { fontSize: 10, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase' },
    dateText: { fontSize: 10, color: COLORS.gray },
    disputeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.backgroundPink, marginHorizontal: SPACING.xxl,
        paddingVertical: 10, borderRadius: BORDER_RADIUS.md, marginTop: 4, marginBottom: SPACING.lg,
    },
    disputeText: { color: COLORS.error, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm, marginLeft: 6 },
    pastBookingWrap: { opacity: 0.7 },
    unknownPgCard: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.backgroundGray, marginHorizontal: SPACING.xxl,
        padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md,
    },
    unknownPgText: { fontSize: FONT_SIZES.sm, color: COLORS.gray },
});
