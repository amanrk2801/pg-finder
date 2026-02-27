import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, EmptyState } from '../../components/common';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const JS_DAY_MAP = [6, 0, 1, 2, 3, 4, 5]; // JS getDay() -> index in DAYS_ORDER

const MEAL_CONFIG = {
    breakfast: { icon: 'sunny-outline', color: '#F57C00', bg: '#FFF3E0', time: '8:00 - 9:30 AM' },
    lunch:     { icon: 'restaurant-outline', color: '#2E7D32', bg: '#E8F5E9', time: '12:30 - 2:00 PM' },
    dinner:    { icon: 'moon-outline', color: '#5C6BC0', bg: '#E8EAF6', time: '7:30 - 9:00 PM' },
};

export default function WeeklyMenuScreen({ route, navigation }) {
    const { pgId } = route.params;
    const { getMessMenuForPg } = useData();

    const messMenu = useMemo(() => getMessMenuForPg(pgId), [pgId, getMessMenuForPg]);
    const todayIndex = JS_DAY_MAP[new Date().getDay()];
    const [selectedDay, setSelectedDay] = useState(todayIndex);

    const dayName = DAYS_ORDER[selectedDay];
    const dayMenu = messMenu?.weeklyMenu?.[dayName];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Weekly Menu" onBack={() => navigation.goBack()} />

            {!messMenu ? (
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon="fast-food-outline"
                        title="No menu available"
                        message="The PG admin hasn't set up a mess menu yet."
                    />
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Today's Special */}
                    {messMenu.todaysSpecial && (
                        <View style={styles.specialCard}>
                            <View style={styles.specialIconBox}>
                                <Ionicons name="star" size={20} color="#F57C00" />
                            </View>
                            <View style={styles.specialInfo}>
                                <Text style={styles.specialLabel}>Today's Special</Text>
                                <Text style={styles.specialValue}>{messMenu.todaysSpecial}</Text>
                            </View>
                        </View>
                    )}

                    {/* Meal Plan Info */}
                    <View style={styles.planInfo}>
                        <View style={styles.planRow}>
                            <Text style={styles.planLabel}>Meal Plan</Text>
                            <Text style={styles.planPrice}>₹{(messMenu.mealPlanPrice || 0).toLocaleString()}/mo</Text>
                        </View>
                        {messMenu.isVegOnly && (
                            <View style={styles.vegBadge}>
                                <View style={styles.vegDot} />
                                <Text style={styles.vegText}>Pure Veg</Text>
                            </View>
                        )}
                    </View>

                    {/* Day Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
                        {DAYS_ORDER.map((day, idx) => {
                            const isSelected = idx === selectedDay;
                            const isToday = idx === todayIndex;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayTab, isSelected && styles.dayTabActive]}
                                    onPress={() => setSelectedDay(idx)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                                        {DAY_LABELS[day]}
                                    </Text>
                                    {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Day Header */}
                    <View style={styles.dayHeader}>
                        <Text style={styles.dayHeaderTitle}>
                            {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                        </Text>
                        {selectedDay === todayIndex && (
                            <View style={styles.todayBadge}>
                                <Text style={styles.todayBadgeText}>Today</Text>
                            </View>
                        )}
                    </View>

                    {/* Meal Cards */}
                    {dayMenu ? (
                        ['breakfast', 'lunch', 'dinner'].map(meal => {
                            const cfg = MEAL_CONFIG[meal];
                            return (
                                <View key={meal} style={styles.mealCard}>
                                    <View style={[styles.mealIconBox, { backgroundColor: cfg.bg }]}>
                                        <Ionicons name={cfg.icon} size={28} color={cfg.color} />
                                    </View>
                                    <View style={styles.mealContent}>
                                        <View style={styles.mealTypeRow}>
                                            <Text style={styles.mealType}>
                                                {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                            </Text>
                                            <Text style={styles.mealTime}>{cfg.time}</Text>
                                        </View>
                                        <Text style={styles.mealItems}>{dayMenu[meal] || 'Not available'}</Text>
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.noMenuDay}>
                            <Ionicons name="restaurant-outline" size={40} color={COLORS.grayLight} />
                            <Text style={styles.noMenuText}>No menu set for this day</Text>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, backgroundColor: COLORS.backgroundGray },
    emptyContainer: { flex: 1, justifyContent: 'center' },

    specialCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1',
        margin: SPACING.lg, padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1, borderColor: '#FFE082',
    },
    specialIconBox: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF3E0',
        justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    specialInfo: { flex: 1 },
    specialLabel: { fontSize: FONT_SIZES.xs, color: '#F57C00', fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
    specialValue: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, marginTop: 2 },

    planInfo: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, ...SHADOWS.small,
    },
    planRow: { flex: 1 },
    planLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray },
    planPrice: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.black, marginTop: 2 },
    vegBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9',
        paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm, gap: 4,
    },
    vegDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
    vegText: { fontSize: FONT_SIZES.xs, color: '#2E7D32', fontWeight: FONT_WEIGHTS.bold },

    dayTabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
    dayTab: {
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.white, alignItems: 'center', ...SHADOWS.small,
    },
    dayTabActive: { backgroundColor: COLORS.primary },
    dayTabText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.gray },
    dayTabTextActive: { color: COLORS.white },
    todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 4 },
    todayDotActive: { backgroundColor: COLORS.white },

    dayHeader: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm,
    },
    dayHeaderTitle: { fontSize: FONT_SIZES.xxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    todayBadge: {
        backgroundColor: COLORS.backgroundPink, paddingHorizontal: SPACING.sm, paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    todayBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },

    mealCard: {
        flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.small,
    },
    mealIconBox: {
        width: 56, height: 56, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center',
        marginRight: SPACING.lg,
    },
    mealContent: { flex: 1 },
    mealTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    mealType: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    mealTime: { fontSize: FONT_SIZES.xs, color: COLORS.grayLight },
    mealItems: { fontSize: FONT_SIZES.md, color: COLORS.gray, lineHeight: 22 },

    noMenuDay: { alignItems: 'center', paddingVertical: SPACING.huge },
    noMenuText: { fontSize: FONT_SIZES.md, color: COLORS.gray, marginTop: SPACING.md },
});
