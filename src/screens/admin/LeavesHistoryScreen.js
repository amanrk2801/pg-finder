import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function LeavesHistoryScreen() {
  const { ownerLeaveRequests } = useData();

  const approvedLeaveRequests = (ownerLeaveRequests || []).filter((r) => r && r.status === 'approved');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.title}>Leaves History</Text>
        <Text style={styles.subtitle}>See who has left your properties</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {(approvedLeaveRequests || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No leaves yet</Text>
            <Text style={styles.emptyText}>When tenants leave a PG, they will appear here.</Text>
          </View>
        ) : (
          (approvedLeaveRequests || []).map((req) => (
            <View key={req.id || req._id} style={styles.card}>
              <Text style={styles.pgName}>{req.pgId?.name || 'Property'}</Text>
              <Text style={styles.userName}>{req.userId?.name || req.userId?.email || 'Tenant'}</Text>
              {(req.updatedAt || req.createdAt) && (
                <Text style={styles.dateText}>
                    Left on {new Date(req.updatedAt || req.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
  dateText: {
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
