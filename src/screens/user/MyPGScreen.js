import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, EmptyState } from '../../components/common';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MEAL_ICONS = { breakfast: 'sunny-outline', lunch: 'restaurant-outline', dinner: 'moon-outline' };
const MEAL_TIMES = { breakfast: '8:00 - 9:30 AM', lunch: '12:30 - 2:00 PM', dinner: '7:30 - 9:00 PM' };

function getRentStatus(nextDueDate) {
    if (!nextDueDate) return { label: 'No Due Date', color: COLORS.gray, bg: COLORS.backgroundGray };
    const now = new Date();
    const due = new Date(nextDueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, color: '#D32F2F', bg: '#FFEBEE' };
    if (diffDays <= 5) return { label: `Due in ${diffDays}d`, color: '#F57C00', bg: '#FFF3E0' };
    return { label: `Due in ${diffDays}d`, color: '#2E7D32', bg: '#E8F5E9' };
}

export default function MyPGScreen({ navigation }) {
    const { user } = useAuth();
    const {
        bookings,
        pgs,
        payments,
        getMessMenuForPg,
        addLeaveRequest,
        leaveRequests,
    } = useData();

    const [activeBookings, setActiveBookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    const loadData = useCallback(() => {
        const userId = user?.id;
        if (!userId) return;

        const userBookings = (bookings || []).filter(b => b.userId === userId && b.status === 'active');
        setActiveBookings(userBookings);
        setSelectedBookingId(prev => (
            prev && userBookings.some(b => b.id === prev) ? prev : (userBookings[0]?.id || null)
        ));
    }, [user, bookings]);

    useFocusEffect(
        useCallback(() => { loadData(); }, [loadData]),
    );

    useEffect(() => { loadData(); }, [bookings, loadData]);

    const activeBooking = activeBookings.find(b => b.id === selectedBookingId) || null;
    const pg = activeBooking ? (pgs || []).find(p => p.id === activeBooking.pgId) : null;
    const userPayments = activeBooking
        ? (payments || []).filter(p => p.userId === user?.id && p.bookingId === activeBooking.id)
        : [];

    const messMenu = pg ? getMessMenuForPg(pg.id) : null;

    const todayName = DAYS[new Date().getDay()];
    const todayMenu = messMenu?.weeklyMenu?.[todayName];
    const rentStatus = activeBooking ? getRentStatus(activeBooking.nextDueDate) : null;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    const now = new Date();
    const thisMonthPaid = userPayments.some(
        p => p.status === 'paid' && p.month === now.getMonth() + 1 && p.year === now.getFullYear(),
    );

    const activeLeaveRequest = leaveRequests?.find(
        (r) => r.bookingId === activeBooking?.id,
    );

    const handleLeavePg = () => {
        const existingPending = leaveRequests?.find(
            (r) => r.bookingId === activeBooking.id && r.status === 'pending',
        );
        if (existingPending) {
            Alert.alert('Leave Request Pending', 'Your request to leave this PG is already pending with the admin.');
            return;
        }

        Alert.alert(
            'Leave PG',
            'Are you sure you want to request to leave this PG? Your admin will need to approve this before your booking is closed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        if (!activeBooking) return;
                        const success = await addLeaveRequest({
                            userId: user.id,
                            pgId: pg.id,
                            bookingId: activeBooking.id,
                        });
                        if (success) {
                            Alert.alert(
                                'Request Sent',
                                'Your leave request has been sent to the admin for approval.',
                            );
                        } else {
                            Alert.alert('Error', 'Could not create leave request. Please try again.');
                        }
                    },
                },
            ],
        );
    };

    if (!activeBooking || !pg) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
                <ScreenHeader title="My PG" subtitle="Your living space" />
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon="home-outline"
                        title="No active booking"
                        message="Book a PG from the Explore tab to see your living dashboard here."
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="My PG" subtitle={pg.name} />

            {activeBookings.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.pgSwitcher}
                    contentContainerStyle={styles.pgSwitcherContent}
                >
                    {activeBookings.map(b => {
                        const bPg = (pgs || []).find(p => p.id === b.pgId);
                        const isActive = b.id === selectedBookingId;
                        return (
                            <TouchableOpacity
                                key={b.id}
                                style={[styles.pgChip, isActive && styles.pgChipActive]}
                                onPress={() => setSelectedBookingId(b.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.pgChipText, isActive && styles.pgChipTextActive]} numberOfLines={1}>
                                    {bPg?.name || 'PG'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Rent Status Card */}
                <View style={styles.rentCard}>
                    <View style={styles.rentCardHeader}>
                        <View>
                            <Text style={styles.rentLabel}>Monthly Rent</Text>
                            <Text style={styles.rentAmount}>₹{(activeBooking.monthlyRent || pg.rent).toLocaleString()}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: thisMonthPaid ? '#E8F5E9' : rentStatus.bg }]}>
                            <Text style={[styles.statusText, { color: thisMonthPaid ? '#2E7D32' : rentStatus.color }]}>
                                {thisMonthPaid ? 'Paid' : rentStatus.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rentMeta}>
                        <View style={styles.rentMetaItem}>
                            <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                            <Text style={styles.rentMetaText}>{currentMonth} {currentYear}</Text>
                        </View>
                        {activeBooking.nextDueDate && (
                            <View style={styles.rentMetaItem}>
                                <Ionicons name="time-outline" size={14} color={COLORS.gray} />
                                <Text style={styles.rentMetaText}>
                                    Due: {new Date(activeBooking.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </Text>
                            </View>
                        )}
                    </View>

                    {!thisMonthPaid && (
                        <TouchableOpacity
                            style={styles.payButton}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate(ROUTES.USER.PAYMENT, { pg, booking: activeBooking })}
                        >
                            <Ionicons name="card-outline" size={18} color={COLORS.white} />
                            <Text style={styles.payButtonText}>Pay Rent</Text>
                        </TouchableOpacity>
                    )}

                    {activeLeaveRequest && (
                        <View style={styles.leaveStatusRow}>
                            <Text
                                style={[
                                    styles.leaveStatusText,
                                    activeLeaveRequest.status === 'approved' && styles.leaveApprovedText,
                                    activeLeaveRequest.status === 'rejected' && styles.leaveRejectedText,
                                ]}
                            >
                                {activeLeaveRequest.status === 'pending' && 'Leave request pending approval'}
                                {activeLeaveRequest.status === 'approved' && 'Leave request approved'}
                                {activeLeaveRequest.status === 'rejected' && 'Leave request rejected'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Pay Next Month in Advance */}
                {thisMonthPaid && activeBooking.nextDueDate && (
                    <View style={styles.nextMonthCard}>
                        <View style={styles.nextMonthTop}>
                            <View style={styles.nextMonthIconBox}>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.nextMonthInfo}>
                                <Text style={styles.nextMonthTitle}>
                                    {monthNames[new Date(activeBooking.nextDueDate).getMonth()]} {new Date(activeBooking.nextDueDate).getFullYear()} Rent
                                </Text>
                                <Text style={styles.nextMonthSubtitle}>
                                    Due {new Date(activeBooking.nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · Pay early to skip the reminder
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.nextMonthPayBtn}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate(ROUTES.USER.PAYMENT, { pg, booking: activeBooking })}
                        >
                            <Text style={styles.nextMonthPayBtnText}>Pay Early</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Today's Mess Menu */}
                {messMenu && todayMenu && (
                    <View style={styles.messCard}>
                        <View style={styles.messTitleRow}>
                            <View>
                                <Text style={styles.sectionTitle}>Today's Menu</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {todayName.charAt(0).toUpperCase() + todayName.slice(1)}
                                </Text>
                            </View>
                            {messMenu.todaysSpecial && (
                                <View style={styles.specialBadge}>
                                    <Text style={styles.specialBadgeText}>Special: {messMenu.todaysSpecial}</Text>
                                </View>
                            )}
                        </View>

                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                            <View key={meal} style={styles.mealRow}>
                                <View style={styles.mealIconBox}>
                                    <Ionicons name={MEAL_ICONS[meal]} size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.mealInfo}>
                                    <Text style={styles.mealType}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                                    <Text style={styles.mealItems}>{todayMenu[meal]}</Text>
                                </View>
                                <Text style={styles.mealTime}>{MEAL_TIMES[meal]}</Text>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.viewMenuButton}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate(ROUTES.USER.WEEKLY_MENU, { pgId: pg.id })}
                        >
                            <Text style={styles.viewMenuText}>View Full Week Menu</Text>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Actions */}
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(ROUTES.USER.PAYMENT_HISTORY)}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="receipt-outline" size={24} color="#1976D2" />
                        </View>
                        <Text style={styles.actionLabel}>Payment{'\n'}History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(ROUTES.USER.WEEKLY_MENU, { pgId: pg.id })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="fast-food-outline" size={24} color="#F57C00" />
                        </View>
                        <Text style={styles.actionLabel}>Week{'\n'}Menu</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(ROUTES.USER.PG_DETAILS, { pg })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="home-outline" size={24} color="#2E7D32" />
                        </View>
                        <Text style={styles.actionLabel}>PG{'\n'}Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate(ROUTES.USER.RAISE_ISSUE, { pgId: pg.id, bookingId: activeBooking.id })}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: COLORS.backgroundPink }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={styles.actionLabel}>Raise{'\n'}Issue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        activeOpacity={0.8}
                        onPress={handleLeavePg}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                        </View>
                        <Text style={styles.actionLabel}>Leave{'\n'}PG</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Payments */}
                {userPayments.length > 0 && (
                    <View style={styles.recentPayments}>
                        <Text style={styles.sectionTitle}>Recent Payments</Text>
                        {userPayments.slice(0, 3).map(payment => (
                            <View key={payment.id} style={styles.paymentRow}>
                                <View style={styles.paymentLeft}>
                                    <View style={[styles.paymentDot, { backgroundColor: payment.status === 'paid' ? '#4CAF50' : COLORS.primary }]} />
                                    <View>
                                        <Text style={styles.paymentMonth}>
                                            {monthNames[payment.month - 1]} {payment.year}
                                        </Text>
                                        <Text style={styles.paymentDate}>
                                            {new Date(payment.date || payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentAmount}>₹{payment.amount?.toLocaleString()}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, backgroundColor: COLORS.backgroundGray },
    emptyContainer: { flex: 1, justifyContent: 'center' },

    pgSwitcher: { flexGrow: 0, backgroundColor: COLORS.white, paddingBottom: SPACING.sm, marginTop: 12 },
    pgSwitcherContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, alignItems: 'flex-start' },
    pgChip: {
        alignSelf: 'flex-start', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.backgroundGray, maxWidth: 150,
    },
    pgChipActive: { backgroundColor: COLORS.primary },
    pgChipText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.gray },
    pgChipTextActive: { color: COLORS.white },

    rentCard: {
        backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl, ...SHADOWS.medium,
    },
    rentCardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    rentLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray, fontWeight: FONT_WEIGHTS.medium, marginBottom: 4 },
    rentAmount: { fontSize: 32, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.black },
    statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.md },
    statusText: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
    rentMeta: { flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.xl },
    rentMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    rentMetaText: { fontSize: FONT_SIZES.sm, color: COLORS.gray },
    payButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.lg, ...SHADOWS.primary,
    },
    payButtonText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
    leaveStatusRow: {
        marginTop: SPACING.sm,
    },
    leaveStatusText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    leaveApprovedText: {
        color: '#2E7D32',
        fontWeight: FONT_WEIGHTS.bold,
    },
    leaveRejectedText: {
        color: '#D32F2F',
        fontWeight: FONT_WEIGHTS.bold,
    },

    nextMonthCard: {
        backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.small,
    },
    nextMonthTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    nextMonthIconBox: {
        width: 40, height: 40, borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.backgroundPink, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    nextMonthInfo: { flex: 1 },
    nextMonthTitle: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    nextMonthSubtitle: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
    nextMonthPayBtn: {
        backgroundColor: COLORS.backgroundPink, paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center',
    },
    nextMonthPayBtnText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },

    messCard: {
        backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl, marginBottom: SPACING.lg, ...SHADOWS.medium,
    },
    messTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
    sectionTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    sectionSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.gray, marginTop: 2 },
    specialBadge: {
        backgroundColor: '#FFF3E0', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
    },
    specialBadgeText: { fontSize: FONT_SIZES.xs, color: '#F57C00', fontWeight: FONT_WEIGHTS.bold },

    mealRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.backgroundGray,
    },
    mealIconBox: {
        width: 40, height: 40, borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.backgroundPink, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    mealInfo: { flex: 1 },
    mealType: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, textTransform: 'uppercase', letterSpacing: 0.5 },
    mealItems: { fontSize: FONT_SIZES.md, color: COLORS.gray, marginTop: 2 },
    mealTime: { fontSize: FONT_SIZES.xs, color: COLORS.grayLight },

    viewMenuButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: SPACING.lg, gap: 4,
    },
    viewMenuText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },

    quickActionsTitle: {
        fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    },
    actionsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: SPACING.md,
    },
    actionCard: {
        width: '47%', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg, alignItems: 'center', ...SHADOWS.small,
    },
    actionIcon: {
        width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
    },
    actionLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.black, textAlign: 'center' },

    recentPayments: {
        backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginTop: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, ...SHADOWS.small,
    },
    paymentRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundGray,
    },
    paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    paymentDot: { width: 8, height: 8, borderRadius: 4 },
    paymentMonth: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.black },
    paymentDate: { fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
    paymentAmount: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
});
