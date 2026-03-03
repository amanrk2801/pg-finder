import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function LeaveRequestsScreen() {
  const { user } = useAuth();
  const { pgs, leaveRequests, users, bookings, approveLeaveRequest, rejectLeaveRequest } = useData();

  const myPgs = (pgs || []).filter((pg) => pg.adminId === user?.id);
  const myPgIds = new Set(myPgs.map((pg) => pg.id));
  const pendingLeaveRequests = (leaveRequests || []).filter(
    (r) => myPgIds.has(r.pgId) && r.status === 'pending',
  );

  const findUserDisplayName = (userId) => {
    const u = (users || []).find((usr) => usr.id === userId);
    if (!u) return userId;
    return u.name || u.email || userId;
  };

  const buildPgMetaLabel = (pgId, bookingId) => {
    const pg = (pgs || []).find((item) => item.id === pgId);
    const booking = (bookings || []).find((b) => b.id === bookingId);
    const parts = [];
    if (pg?.name) parts.push(pg.name);
    const room = booking?.roomNumber;
    const bed = booking?.bedNumber;
    if (room) parts.push(`Room ${room}`);
    if (bed) parts.push(`Bed ${bed}`);
    return parts.join(' · ') || pgId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Leave Approvals</Text>
        <Text style={styles.subtitle}>Review and approve leave requests from your tenants</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {pendingLeaveRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptyText}>Tenants have not requested to leave any PG yet.</Text>
          </View>
        ) : (
          pendingLeaveRequests.map((req) => (
            <View key={req.id} style={styles.card}>
              <Text style={styles.userName}>{findUserDisplayName(req.userId)}</Text>
              <Text style={styles.pgMeta}>{buildPgMetaLabel(req.pgId, req.bookingId)}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => approveLeaveRequest(req.id)}
                >
                  <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => rejectLeaveRequest(req.id)}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  approveBtn: {
    backgroundColor: '#E8F5E9',
  },
  approveText: {
    color: '#2E7D32',
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.sm,
  },
  rejectBtn: {
    backgroundColor: '#FFEBEE',
  },
  rejectText: {
    color: '#D32F2F',
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.sm,
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

