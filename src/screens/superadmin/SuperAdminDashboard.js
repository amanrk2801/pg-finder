import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function SuperAdminDashboard({ navigation }) {
    const {
        pendingPgs, approvePendingPg, rejectPendingPg,
        pgs, bookings, users, communityPosts, disputes, settings,
        toggleUserStatus, deleteCommunityPost, updateDisputeStatus, updateSettings
    } = useData();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState('pending');
    const [newFee, setNewFee] = useState(settings?.platformFee?.toString() || '5');

    const TABS = [
        { id: 'pending', label: 'Onboarding', icon: 'time-outline' },
        { id: 'analytics', label: 'Analytics', icon: 'stats-chart-outline' },
        { id: 'users', label: 'Users', icon: 'people-outline' },
        { id: 'moderation', label: 'Posts', icon: 'shield-checkmark-outline' },
        { id: 'disputes', label: 'Disputes', icon: 'warning-outline' },
        { id: 'settings', label: 'Settings', icon: 'settings-outline' }
    ];

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    onPress: () => {
                        logout();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleApprove = (id, businessName) => {
        Alert.alert(
            "Approve PG",
            `Are you sure you want to approve ${businessName}? They will be able to list their property immediately.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        const success = await approvePendingPg(id);
                        if (success) Alert.alert("Success", "PG Owner Approved.");
                    }
                }
            ]
        );
    };

    const handleReject = (id, businessName) => {
        Alert.alert(
            "Reject PG",
            `Are you sure you want to reject ${businessName}? This application will be deleted.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        const success = await rejectPendingPg(id);
                        if (success) Alert.alert("Rejected", "PG Application removed.");
                    }
                }
            ]
        );
    };

    const handleSuspend = (id, email, currentStatus) => {
        const isSuspending = currentStatus !== 'suspended';
        Alert.alert(
            isSuspending ? "Suspend User" : "Activate User",
            `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} ${email}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: isSuspending ? "Suspend" : "Activate",
                    style: isSuspending ? "destructive" : "default",
                    onPress: async () => {
                        const success = await toggleUserStatus(id);
                        if (success) Alert.alert("Success", `User ${isSuspending ? 'suspended' : 'activated'}.`);
                    }
                }
            ]
        );
    };

    const handleDeletePost = (id, title) => {
        Alert.alert(
            "Delete Post",
            `Are you sure you want to forcefully delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteCommunityPost(id);
                        Alert.alert("Deleted", "Post has been removed.");
                    }
                }
            ]
        );
    };

    const handleResolveDispute = (id) => {
        Alert.alert(
            "Resolve Ticket",
            "Mark this ticket as Resolved?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Resolve",
                    style: "default",
                    onPress: async () => {
                        await updateDisputeStatus(id, 'Resolved');
                        Alert.alert("Success", "Ticket marked as resolved.");
                    }
                }
            ]
        );
    };

    const handleSaveSettings = async () => {
        const feeNum = parseFloat(newFee);
        if (isNaN(feeNum) || feeNum < 0 || feeNum > 100) {
            Alert.alert("Invalid Fee", "Please enter a valid percentage between 0 and 100.");
            return;
        }
        await updateSettings({ platformFee: feeNum });
        Alert.alert("Settings Updated", `Platform fee is now ${feeNum}%.`);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.businessName}>{item.businessName}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Pending</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.gray} />
                <Text style={styles.infoText}>{item.address}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.gray} />
                <Text style={styles.infoText}>{item.phone}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={16} color={COLORS.gray} />
                <Text style={styles.infoText}>Proposed Rent: ₹{item.rent}</Text>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(item.id, item.businessName)}
                >
                    <Ionicons name="close" size={18} color={COLORS.error} />
                    <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(item.id, item.businessName)}
                >
                    <Ionicons name="checkmark" size={18} color={COLORS.white} />
                    <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Super Admin</Text>
                    <Text style={styles.subGreeting}>Manage PG Onboarding</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Tabs Bar */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabBtn, activeTab === tab.id && styles.activeTabBtn]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name={tab.icon} size={18} color={activeTab === tab.id ? COLORS.white : COLORS.gray} />
                            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {activeTab === 'pending' && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Pending Verifications ({pendingPgs.length})
                        </Text>
                        {pendingPgs.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                                <Text style={styles.emptyText}>There are no pending applications.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={pendingPgs}
                                keyExtractor={(item) => item.id}
                                renderItem={renderItem}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                            />
                        )}
                    </>
                )}

                {activeTab === 'analytics' && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={styles.sectionTitle}>Platform Overview</Text>

                        <View style={styles.statGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="business-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{pgs.length}</Text>
                                <Text style={styles.statLabel}>Active PGs</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{users.length}</Text>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{bookings.length}</Text>
                                <Text style={styles.statLabel}>Total Bookings</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
                                <Text style={styles.statValue}>{communityPosts.length}</Text>
                                <Text style={styles.statLabel}>Community Posts</Text>
                            </View>
                        </View>

                        <View style={styles.revenueCard}>
                            <View style={styles.revenueHeader}>
                                <Ionicons name="trending-up-outline" size={24} color={COLORS.white} />
                                <Text style={styles.revenueTitle}>Est. Platform Revenue</Text>
                            </View>
                            <Text style={styles.revenueAmount}>
                                {/* Mock Revenue Calculation: 5% of all bookings (assuming average 8000 rent per booking for this mock) */}
                                ₹{bookings.length * 8000 * (settings.platformFee / 100)}
                            </Text>
                            <Text style={styles.revenueSub}>Based on {settings.platformFee}% platform fee per booking.</Text>
                        </View>
                    </ScrollView>
                )}

                {activeTab === 'users' && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Platform Users ({users.length})
                        </Text>
                        {users.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                <Text style={styles.emptyText}>No users registered yet.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={users}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.businessName}>{item.email}</Text>
                                            <View style={[styles.badge, item.status === 'suspended' && { backgroundColor: 'rgba(255,0,0,0.1)' }]}>
                                                <Text style={[styles.badgeText, item.status === 'suspended' && { color: COLORS.error }]}>
                                                    {item.type.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.infoText}>Joined: {new Date(item.joinedAt).toLocaleDateString()}</Text>

                                        {/* Don't allow suspending superadmin */}
                                        {item.type !== 'superadmin' && (
                                            <TouchableOpacity
                                                style={[styles.actionBtn, item.status === 'suspended' ? styles.approveBtn : styles.rejectBtn, { marginTop: SPACING.md }]}
                                                onPress={() => handleSuspend(item.id, item.email, item.status)}
                                            >
                                                <Text style={item.status === 'suspended' ? styles.approveText : styles.rejectText}>
                                                    {item.status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}

                {activeTab === 'moderation' && (
                    <>
                        <Text style={styles.sectionTitle}>
                            Community Posts ({communityPosts.length})
                        </Text>
                        {communityPosts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                <Text style={styles.emptyText}>No posts to moderate.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={communityPosts}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                                renderItem={({ item }) => (
                                    <View style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.businessName} numberOfLines={1}>{item.title}</Text>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{item.type}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.infoText} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
                                        <Text style={[styles.infoText, { marginTop: 4, fontSize: 11 }]}>By: {item.contactInfo}</Text>

                                        <TouchableOpacity
                                            style={[styles.actionBtn, styles.rejectBtn, { marginTop: SPACING.md }]}
                                            onPress={() => handleDeletePost(item.id, item.title)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                                            <Text style={styles.rejectText}>Delete Post</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}

                {activeTab === 'disputes' && (
                    <>
                        <Text style={styles.sectionTitle}>
                            User Disputes ({disputes.length})
                        </Text>
                        {disputes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="happy-outline" size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
                                <Text style={styles.emptyText}>No disputes raised. Users are happy!</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={disputes}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContainer}
                                renderItem={({ item }) => (
                                    <View style={[styles.card, item.status === 'Resolved' && { opacity: 0.6 }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.businessName} numberOfLines={1}>{item.title}</Text>
                                            <View style={[styles.badge, item.status === 'Resolved' && { backgroundColor: '#E8F5E9' }]}>
                                                <Text style={[styles.badgeText, item.status === 'Resolved' && { color: '#4CAF50' }]}>{item.status}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.infoText}>Ticket ID: {item.id}</Text>
                                        <Text style={styles.infoText}>User ID: {item.userId}</Text>
                                        <Text style={[styles.infoText, { marginTop: SPACING.sm, color: COLORS.black }]}>{item.description}</Text>

                                        {item.status !== 'Resolved' && (
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.approveBtn, { marginTop: SPACING.md }]}
                                                onPress={() => handleResolveDispute(item.id)}
                                            >
                                                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
                                                <Text style={styles.approveText}>Mark Resolved</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}

                {activeTab === 'settings' && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>Global Platform Settings</Text>
                        <View style={styles.card}>
                            <Text style={styles.businessName}>Platform Fee (%)</Text>
                            <Text style={[styles.infoText, { marginVertical: SPACING.sm }]}>
                                This percentage is applied to mock revenue calculations on the Analytics dashboard.
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={newFee}
                                onChangeText={setNewFee}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.approveBtn, { alignSelf: 'flex-start', marginLeft: 0 }]}
                                onPress={handleSaveSettings}
                            >
                                <Ionicons name="save-outline" size={16} color={COLORS.white} />
                                <Text style={styles.approveText}>Save Settings</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
    },
    headerTitle: {
        ...TYPOGRAPHY.h1,
        color: COLORS.white,
    },
    subGreeting: {
        fontSize: FONT_SIZES.md,
        color: COLORS.white,
        opacity: 0.8,
        marginTop: 4,
    },
    logoutBtn: {
        padding: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: BORDER_RADIUS.round,
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.backgroundGray,
        marginTop: -SPACING.md,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    listContainer: {
        paddingBottom: SPACING.xxl,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    businessName: {
        ...TYPOGRAPHY.h3,
        color: COLORS.black,
        flex: 1,
        marginRight: SPACING.sm,
    },
    badge: {
        backgroundColor: COLORS.backgroundPink,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.bold,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    infoText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingTop: SPACING.md,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginLeft: SPACING.md,
    },
    rejectBtn: {
        backgroundColor: COLORS.backgroundPink,
    },
    rejectText: {
        color: COLORS.error,
        fontWeight: FONT_WEIGHTS.bold,
        marginLeft: 4,
    },
    approveBtn: {
        backgroundColor: COLORS.success,
    },
    approveText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        marginLeft: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.black,
        marginBottom: SPACING.xs,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        paddingHorizontal: SPACING.xl,
        lineHeight: 22,
    },
    tabContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        zIndex: 10
    },
    tabScroll: {
        paddingHorizontal: SPACING.md,
    },
    tabBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.xl,
        marginHorizontal: 4,
        backgroundColor: COLORS.backgroundGray
    },
    activeTabBtn: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.bold,
        marginLeft: 6
    },
    activeTabText: {
        color: COLORS.white,
    },
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
        alignItems: 'center'
    },
    statValue: {
        ...TYPOGRAPHY.h2,
        color: COLORS.black,
        marginTop: 8,
        marginBottom: 2
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.bold,
        textTransform: 'uppercase'
    },
    revenueCard: {
        backgroundColor: COLORS.black,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.large
    },
    revenueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm
    },
    revenueTitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        marginLeft: SPACING.sm
    },
    revenueAmount: {
        fontSize: 36,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.success,
        marginBottom: 8
    },
    revenueSub: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255,255,255,0.7)',
    },
    textInput: {
        backgroundColor: COLORS.backgroundGray,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.black,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight
    }
});
