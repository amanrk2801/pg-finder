import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, 
    StatusBar, ScrollView, TextInput, RefreshControl, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useData } from '../../hooks';
import ApiClient from '../../services/ApiClient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TABS = [
    { id: 'pending', label: 'PG Requests', icon: 'business' },
    { id: 'admins', label: 'Owners', icon: 'person-add' },
    { id: 'analytics', label: 'Analytics', icon: 'stats-chart' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
];

export default function SuperAdminDashboard() {
    const {
        pendingPgs, approvePendingPg, rejectPendingPg,
        pgs, bookings, users, payments, settings,
        toggleUserStatus, updateSettings,
        approveAdmin, rejectAdmin, loadAllData
    } = useData();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState('pending');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [newFee, setNewFee] = useState(settings?.platformFee?.toString() || '5');

    const fetchPendingAdmins = async () => {
        try {
            const data = await ApiClient.get('/auth/pending-admins');
            setPendingAdmins(data || []);
        } catch (err) {
            setPendingAdmins((users || []).filter(u => u.type === 'pending_admin'));
        }
    };

    useEffect(() => {
        fetchPendingAdmins();
    }, [users]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([loadAllData(), fetchPendingAdmins()]);
        setIsRefreshing(false);
    };

    const handleApproveAdminAcc = (id, email) => {
        Alert.alert("Approve Owner", `Are you sure you want to grant ownership access to ${email}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Approve", onPress: async () => {
                const success = await approveAdmin(id);
                if (success) {
                    Alert.alert("Success", "Owner Approved.");
                    onRefresh();
                }
            }}
        ]);
    };

    const handleApprovePg = (id, name) => {
        Alert.alert("Verify PG", `Verify and publish ${name} to the platform?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Publish Live", onPress: async () => {
                const success = await approvePendingPg(id);
                if (success) {
                    Alert.alert("Success", "Property is now live for users.");
                    onRefresh();
                }
            }}
        ]);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={[COLORS.primary, '#8E2DE2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Platform Admin</Text>
                        <Text style={styles.headerSub}>Control & Monitoring</Text>
                    </View>
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
                            <Ionicons name="refresh" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, styles.logoutBtn]} onPress={logout}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickStats}>
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>{(pendingPgs || []).length + (pendingAdmins || []).length}</Text>
                        <Text style={styles.quickStatLabel}>Pending</Text>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>₹{payments.reduce((s, p) => s + (p.commissionAmount || 0), 0).toFixed(0)}</Text>
                        <Text style={styles.quickStatLabel}>Revenue</Text>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStatItem}>
                        <Text style={styles.quickStatValue}>{(pgs || []).length}</Text>
                        <Text style={styles.quickStatLabel}>Active PGs</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />
            
            {renderHeader()}

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Ionicons 
                                name={tab.icon} 
                                size={18} 
                                color={activeTab === tab.id ? COLORS.white : COLORS.gray} 
                            />
                            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                                {tab.label}
                            </Text>
                            {(tab.id === 'pending' && (pendingPgs || []).length > 0) && (
                                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{(pendingPgs || []).length}</Text></View>
                            )}
                            {(tab.id === 'admins' && (pendingAdmins || []).length > 0) && (
                                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{(pendingAdmins || []).length}</Text></View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.content}>
                <FlatList
                    data={[]}
                    ListHeaderComponent={() => (
                        <View style={{ paddingBottom: 100 }}>
                            {activeTab === 'pending' && (
                                <View>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>Verification Queue</Text>
                                        <Text style={styles.sectionCount}>{(pendingPgs || []).length} properties</Text>
                                    </View>
                                    {(pendingPgs || []).length === 0 ? (
                                        <View style={styles.emptyCard}>
                                            <Ionicons name="checkmark-circle" size={40} color={COLORS.secondary} />
                                            <Text style={styles.emptyText}>All properties verified</Text>
                                        </View>
                                    ) : (
                                        (pendingPgs || []).map(item => (
                                            <View key={item.id || item._id} style={styles.requestCard}>
                                                <View style={styles.requestInfo}>
                                                    <Text style={styles.requestTitle}>{item.name}</Text>
                                                    <Text style={styles.requestSub}>{item.address}</Text>
                                                    <Text style={styles.requestPrice}>Monthly Rent: ₹{item.rent}</Text>
                                                </View>
                                                <TouchableOpacity style={styles.approveAction} onPress={() => handleApprovePg(item.id || item._id, item.name)}>
                                                    <Text style={styles.actionText}>VERIFY</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}

                            {activeTab === 'admins' && (
                                <View>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>New Owner Requests</Text>
                                        <Text style={styles.sectionCount}>{(pendingAdmins || []).length} pending</Text>
                                    </View>
                                    {(pendingAdmins || []).length === 0 ? (
                                        <View style={styles.emptyCard}>
                                            <Ionicons name="people-outline" size={40} color={COLORS.primary} />
                                            <Text style={styles.emptyText}>No new onboarding requests</Text>
                                        </View>
                                    ) : (
                                        (pendingAdmins || []).map(item => (
                                            <View key={item.id || item._id} style={styles.requestCard}>
                                                <View style={styles.requestInfo}>
                                                    <Text style={styles.requestTitle}>{item.email}</Text>
                                                    <Text style={styles.requestSub}>Contact: {item.phone || 'N/A'}</Text>
                                                    <View style={styles.ownerBadge}><Text style={styles.ownerBadgeText}>Role: Admin</Text></View>
                                                </View>
                                                <View style={styles.dualActions}>
                                                    <TouchableOpacity style={styles.rejectSmall} onPress={() => rejectAdmin(item.id || item._id)}>
                                                        <Ionicons name="close" size={20} color={COLORS.error} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.approveSmall} onPress={() => handleApproveAdminAcc(item.id || item._id, item.email)}>
                                                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}

                            {activeTab === 'analytics' && (
                                <View>
                                    <Text style={styles.sectionTitle}>Financial Performance</Text>
                                    <LinearGradient
                                        colors={['#11998e', '#38ef7d']}
                                        style={styles.revenueMainCard}
                                    >
                                        <Text style={styles.revLabel}>Total Platform Earnings</Text>
                                        <Text style={styles.revAmount}>₹{(payments || []).reduce((s, p) => s + (p.commissionAmount || 0), 0).toLocaleString()}</Text>
                                        <View style={styles.revFooter}>
                                            <Text style={styles.revSub}>Current Fee: {settings.platformFee}%</Text>
                                            <Ionicons name="trending-up" size={20} color={COLORS.white} />
                                        </View>
                                    </LinearGradient>

                                    <View style={styles.statsGrid}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statVal}>{(pgs || []).length}</Text>
                                            <Text style={styles.statLabel}>Approved PGs</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statVal}>{(users || []).length}</Text>
                                            <Text style={styles.statLabel}>Registered Users</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {activeTab === 'users' && (
                                <View>
                                    <Text style={styles.sectionTitle}>User Directory</Text>
                                    {(users || []).map(item => (
                                        <View key={item.id || item._id} style={styles.userListItem}>
                                            <View style={styles.userIcon}>
                                                <Text style={styles.userInitials}>{(item.name || item.email || 'U').charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.userName}>{item.email}</Text>
                                                <Text style={styles.userRole}>{item.type.toUpperCase()} · {item.status}</Text>
                                            </View>
                                            <TouchableOpacity 
                                                style={[styles.statusToggle, item.status === 'suspended' && { borderColor: COLORS.secondary }]} 
                                                onPress={() => toggleUserStatus(item.id || item._id)}
                                            >
                                                <Text style={[styles.statusToggleText, item.status === 'suspended' && { color: COLORS.secondary }]}>
                                                    {item.status === 'active' ? 'SUSPEND' : 'ACTIVATE'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {activeTab === 'settings' && (
                                <View>
                                    <Text style={styles.sectionTitle}>System Configuration</Text>
                                    <View style={styles.settingsCard}>
                                        <View style={styles.settingRow}>
                                            <Ionicons name="card-outline" size={24} color={COLORS.primary} />
                                            <View style={{ marginLeft: 15, flex: 1 }}>
                                                <Text style={styles.settingLabel}>Commission Percentage</Text>
                                                <Text style={styles.settingSub}>Fee charged per booking</Text>
                                            </View>
                                            <TextInput
                                                style={styles.settingInput}
                                                value={newFee}
                                                onChangeText={setNewFee}
                                                keyboardType="numeric"
                                            />
                                            <Text style={styles.percentText}>%</Text>
                                        </View>
                                        <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                                            updateSettings({ platformFee: parseFloat(newFee) });
                                            Alert.alert("Success", "Platform fee updated.");
                                        }}>
                                            <Text style={styles.primaryBtnText}>Save Changes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    headerContainer: { backgroundColor: COLORS.white },
    headerGradient: { padding: SPACING.xl, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
    headerIcons: { flexDirection: 'row', gap: 15 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    logoutBtn: { backgroundColor: 'rgba(255,0,0,0.3)' },
    quickStats: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 15 },
    quickStatItem: { alignItems: 'center' },
    quickStatValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
    quickStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, textTransform: 'uppercase' },
    quickStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
    tabContainer: { paddingVertical: 15, backgroundColor: '#F0F2F5' },
    tabScroll: { paddingHorizontal: 15 },
    tabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: COLORS.white, ...SHADOWS.small },
    activeTabItem: { backgroundColor: COLORS.primary },
    tabLabel: { marginLeft: 8, fontSize: 13, color: COLORS.gray, fontWeight: '700' },
    activeTabLabel: { color: COLORS.white },
    tabBadge: { marginLeft: 6, backgroundColor: COLORS.secondary, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    tabBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
    content: { flex: 1, padding: SPACING.lg },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    sectionCount: { fontSize: 12, color: COLORS.gray, fontWeight: '600' },
    requestCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginBottom: 15, alignItems: 'center', ...SHADOWS.small },
    requestInfo: { flex: 1 },
    requestTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
    requestSub: { fontSize: 13, color: COLORS.gray, marginBottom: 6 },
    requestPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
    approveAction: { backgroundColor: '#E8F5E9', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
    actionText: { color: '#2E7D32', fontWeight: '900', fontSize: 11 },
    emptyCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 30, alignItems: 'center', marginTop: 10, ...SHADOWS.small },
    emptyText: { marginTop: 10, color: COLORS.gray, fontWeight: '600' },
    dualActions: { flexDirection: 'row', gap: 10 },
    rejectSmall: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.error, justifyContent: 'center', alignItems: 'center' },
    approveSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    ownerBadge: { alignSelf: 'flex-start', backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 5 },
    ownerBadgeText: { fontSize: 10, color: COLORS.gray, fontWeight: 'bold' },
    revenueMainCard: { borderRadius: 25, padding: 25, marginBottom: 25, ...SHADOWS.medium },
    revLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
    revAmount: { color: COLORS.white, fontSize: 36, fontWeight: '900', marginVertical: 10 },
    revFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    revSub: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
    statsGrid: { flexDirection: 'row', gap: 15 },
    statBox: { flex: 1, backgroundColor: COLORS.white, borderRadius: 20, padding: 20, alignItems: 'center', ...SHADOWS.small },
    statVal: { fontSize: 24, fontWeight: 'bold', color: COLORS.black },
    userListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 18, marginBottom: 12, ...SHADOWS.small },
    userIcon: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    userInitials: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
    userName: { fontSize: 15, fontWeight: '700', color: COLORS.black },
    userRole: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
    statusToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.error },
    statusToggleText: { fontSize: 10, fontWeight: 'bold', color: COLORS.error },
    settingsCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, ...SHADOWS.small },
    settingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    settingLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.black },
    settingSub: { fontSize: 12, color: COLORS.gray },
    settingInput: { width: 60, height: 40, backgroundColor: '#F0F2F5', borderRadius: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
    percentText: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray, marginLeft: 5 },
    primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 15, paddingVertical: 15, alignItems: 'center', ...SHADOWS.primary },
    primaryBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
