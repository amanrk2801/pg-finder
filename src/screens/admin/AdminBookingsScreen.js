import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000; // highlight bookings from the last 24h as "new"

export default function AdminBookingsScreen() {
  const { ownerBookings, ownerPayments, loadAllData } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  const findPaymentForBooking = (bookingId) =>
    (ownerPayments || []).find((p) => {
      const pBookingId = p.bookingId?._id || p.bookingId?.id || p.bookingId;
      return pBookingId === bookingId;
    });

  const isNew = (booking) => {
    const created = new Date(booking.createdAt).getTime();
    return !Number.isNaN(created) && Date.now() - created < NEW_WINDOW_MS;
  };

  const newCount = (ownerBookings || []).filter(isNew).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>
          {newCount > 0 ? `${newCount} new booking${newCount > 1 ? 's' : ''} in the last 24h` : 'All bookings across your PGs'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {(ownerBookings || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>When users book your PGs, they will appear here with payment details.</Text>
          </View>
        ) : (
          (ownerBookings || []).map((booking) => {
            const bookingId = booking.id || booking._id;
            const payment = findPaymentForBooking(bookingId);
            const bookingIsNew = isNew(booking);

            return (
              <View key={bookingId} style={[styles.card, bookingIsNew && styles.cardNew]}>
                {bookingIsNew && (
                  <View style={styles.newBadge}>
                    <Ionicons name="notifications" size={11} color={COLORS.white} />
                    <Text style={styles.newBadgeText}>NEW BOOKING</Text>
                  </View>
                )}

                <Text style={styles.pgName}>{booking.pgId?.name || 'Property'}</Text>
                <Text style={styles.userName}>{booking.userId?.name || booking.userId?.email || 'User'}</Text>
                {booking.userId?.phone && <Text style={styles.metaLine}>Contact: {booking.userId.phone}</Text>}

                <View style={styles.divider} />

                <View style={styles.row}>
                  <Text style={styles.metaLabel}>Booked at</Text>
                  <Text style={styles.metaValue}>
                    {new Date(booking.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.metaLabel}>Monthly Rent</Text>
                  <Text style={styles.metaValue}>₹{(booking.monthlyRent || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.metaLabel}>Status</Text>
                  <Text style={[styles.metaValue, { color: booking.status === 'active' ? '#2E7D32' : COLORS.gray }]}>
                    {(booking.status || '').toUpperCase()}
                  </Text>
                </View>

                {payment && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                      <Text style={styles.metaLabel}>Amount Paid</Text>
                      <Text style={styles.metaValue}>₹{(payment.amount || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.metaLabel}>Transaction ID</Text>
                      <Text style={styles.metaValueMono}>{payment.transactionId || 'N/A'}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.metaLabel}>Method</Text>
                      <Text style={styles.metaValue}>{(payment.method || 'N/A').toUpperCase()}</Text>
                    </View>
                  </>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  title: { ...TYPOGRAPHY.h2, color: COLORS.black, marginBottom: 4 },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.gray },
  content: { flex: 1, backgroundColor: COLORS.backgroundGray },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xxl,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  cardNew: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  newBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4, marginBottom: SPACING.sm,
  },
  newBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.5 },
  pgName: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, marginBottom: 2 },
  userName: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.primary },
  metaLine: { fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.backgroundGray, marginVertical: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  metaLabel: { fontSize: FONT_SIZES.xs, color: COLORS.gray },
  metaValue: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.black },
  metaValueMono: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.black },
  emptyState: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
