import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function AdminBookingsScreen() {
  const { user } = useAuth();
  const { pgs, bookings, users } = useData();

  const myPgs = (pgs || []).filter((pg) => pg && pg.adminId === user?.id);
  const myPgIds = new Set(myPgs.map((pg) => pg.id || pg._id));

  const myBookings = (bookings || []).filter((b) => b && b.pgId && myPgIds.has(b.pgId));

  const findUserDisplayName = (userId) => {
    const u = (users || []).find((usr) => usr && (usr.id === userId || usr._id === userId));
    if (!u) return userId || 'User';
    return u.name || u.email || userId;
  };

  const buildPgMetaLabel = (pgId, booking) => {
    const pg = (pgs || []).find((item) => item && (item.id === pgId || item._id === pgId));
    const parts = [];
    if (pg?.name) parts.push(pg.name);
    const room = booking?.roomNumber;
    const bed = booking?.bedNumber;
    if (room) parts.push(`Room ${room}`);
    if (bed) parts.push(`Bed ${bed}`);
    return parts.join(' · ') || pgId || 'Property Info';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <Text style={styles.subtitle}>All bookings across your PGs</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(myBookings || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>When users book your PGs, they will appear here.</Text>
          </View>
        ) : (
          (myBookings || []).map((booking) => (
            <View key={booking.id || booking._id || Math.random().toString()} style={styles.card}>
              <Text style={styles.userName}>{findUserDisplayName(booking.userId)}</Text>
              <Text style={styles.pgMeta}>{buildPgMetaLabel(booking.pgId, booking)}</Text>
              <Text style={styles.bookingMeta}>
                Status: {booking.status} · Monthly Rent: ₹{(booking.monthlyRent || 0).toLocaleString()}
              </Text>
              {booking.date && (
                <Text style={styles.bookingMeta}>
                    Booked on{' '}
                    {new Date(booking.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    })}
                </Text>
              )}
            </View>
          ))
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
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  pgMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  bookingMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
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
