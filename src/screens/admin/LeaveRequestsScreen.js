import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function LeaveRequestsScreen() {
  const { ownerLeaveRequests, approveLeaveRequest, rejectLeaveRequest } = useData();

  const pendingLeaveRequests = (ownerLeaveRequests || []).filter((r) => r && r.status === 'pending');

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
          pendingLeaveRequests.map((req) => {
            const reqId = req.id || req._id;
            return (
              <View key={reqId} style={styles.card}>
                <Text style={styles.pgName}>{req.pgId?.name || 'Property'}</Text>
                <Text style={styles.userName}>{req.userId?.name || req.userId?.email || 'Tenant'}</Text>
                {req.userId?.phone && <Text style={styles.metaLine}>Contact: {req.userId.phone}</Text>}
                <Text style={styles.metaLine}>
                  Requested: {new Date(req.createdAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
                {req.checkOutDate && (
                  <Text style={styles.metaLine}>
                    Checkout: {new Date(req.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                )}
                {req.reason && <Text style={styles.reasonText}>"{req.reason}"</Text>}

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => approveLeaveRequest(reqId)}
                  >
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => rejectLeaveRequest(reqId)}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
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
  pgName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 2,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  metaLine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
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
