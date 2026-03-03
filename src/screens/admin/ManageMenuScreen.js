import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ScreenHeader } from '../../components/common';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };
const MEALS = ['breakfast', 'lunch', 'dinner'];

function buildEmptyWeek() {
    const week = {};
    DAYS_ORDER.forEach(day => { week[day] = { breakfast: '', lunch: '', dinner: '' }; });
    return week;
}

export default function ManageMenuScreen({ route, navigation }) {
    const { pgId: initialPgId } = route.params || {};
    const { user } = useAuth();
    const { pgs, getMessMenuForPg, updateMessMenu } = useData();

    const myPgs = (pgs || []).filter((pg) => pg.adminId === user?.id);

    const [selectedPgId, setSelectedPgId] = useState(initialPgId || myPgs[0]?.id || null);
    const [weeklyMenu, setWeeklyMenu] = useState(buildEmptyWeek());
    const [todaysSpecial, setTodaysSpecial] = useState('');
    const [mealPlanPrice, setMealPlanPrice] = useState('');
    const [isVegOnly, setIsVegOnly] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [saving, setSaving] = useState(false);

    const dayName = DAYS_ORDER[selectedDay];

    useEffect(() => {
        if (!selectedPgId) return;
        const existing = getMessMenuForPg(selectedPgId);
        setWeeklyMenu(existing?.weeklyMenu || buildEmptyWeek());
        setTodaysSpecial(existing?.todaysSpecial || '');
        setMealPlanPrice(String(existing?.mealPlanPrice || ''));
        setIsVegOnly(existing?.isVegOnly ?? true);
    }, [selectedPgId, getMessMenuForPg]);

    const updateMeal = (meal, value) => {
        setWeeklyMenu(prev => ({
            ...prev,
            [dayName]: { ...prev[dayName], [meal]: value },
        }));
    };

    const handleSave = async () => {
        if (!selectedPgId) {
            Alert.alert('Select PG', 'Please select a PG first to manage its mess menu.');
            return;
        }

        setSaving(true);
        const success = await updateMessMenu(selectedPgId, {
            weeklyMenu,
            todaysSpecial: todaysSpecial.trim(),
            mealPlanPrice: parseInt(mealPlanPrice) || 0,
            isVegOnly,
        });
        setSaving(false);

        if (success) {
            Alert.alert('Saved', 'Mess menu updated successfully!');
            navigation.goBack();
        } else {
            Alert.alert('Error', 'Could not save menu. Try again.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Manage Menu" onBack={() => navigation.goBack()} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                    {/* PG Selector */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Select PG</Text>
                        {myPgs.length === 0 ? (
                            <Text style={styles.noPgText}>
                                You do not have any PGs yet. Please add a property first.
                            </Text>
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.pgChipsRow}
                            >
                                {myPgs.map((pg) => {
                                    const isActive = pg.id === selectedPgId;
                                    return (
                                        <TouchableOpacity
                                            key={pg.id}
                                            style={[styles.pgChip, isActive && styles.pgChipActive]}
                                            onPress={() => setSelectedPgId(pg.id)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.pgChipText,
                                                    isActive && styles.pgChipTextActive,
                                                ]}
                                            >
                                                {pg.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {/* General Settings */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>General Settings</Text>

                        <Text style={styles.label}>Today's Special</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Gulab Jamun"
                            value={todaysSpecial}
                            onChangeText={setTodaysSpecial}
                            placeholderTextColor={COLORS.grayLight}
                        />

                        <Text style={styles.label}>Monthly Meal Plan Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 3000"
                            value={mealPlanPrice}
                            onChangeText={setMealPlanPrice}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.grayLight}
                        />

                        <TouchableOpacity
                            style={styles.vegToggle}
                            onPress={() => setIsVegOnly(!isVegOnly)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, isVegOnly && styles.checkboxActive]}>
                                {isVegOnly && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                            </View>
                            <Text style={styles.vegLabel}>Pure Vegetarian Mess</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Day Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
                        {DAYS_ORDER.map((day, idx) => (
                            <TouchableOpacity
                                key={day}
                                style={[styles.dayTab, idx === selectedDay && styles.dayTabActive]}
                                onPress={() => setSelectedDay(idx)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.dayTabText, idx === selectedDay && styles.dayTabTextActive]}>
                                    {DAY_LABELS[day]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Meal Inputs */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                        </Text>
                        {MEALS.map(meal => (
                            <View key={meal}>
                                <Text style={styles.label}>
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.mealInput]}
                                    placeholder={`e.g., Poha, Chai, Toast`}
                                    value={weeklyMenu[dayName]?.[meal] || ''}
                                    onChangeText={(val) => updateMeal(meal, val)}
                                    placeholderTextColor={COLORS.grayLight}
                                    multiline
                                />
                            </View>
                        ))}
                    </View>

                    {/* Copy Day Helper */}
                    <TouchableOpacity
                        style={styles.copyButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            const nextIdx = (selectedDay + 1) % 7;
                            setWeeklyMenu(prev => ({
                                ...prev,
                                [DAYS_ORDER[nextIdx]]: { ...prev[dayName] },
                            }));
                            setSelectedDay(nextIdx);
                            Alert.alert('Copied', `${DAY_LABELS[dayName]}'s menu copied to ${DAY_LABELS[DAYS_ORDER[nextIdx]]}`);
                        }}
                    >
                        <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.copyText}>Copy to Next Day</Text>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.9}
                >
                    <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Menu'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, backgroundColor: COLORS.backgroundGray },

    card: {
        backgroundColor: COLORS.white, margin: SPACING.lg, borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl, ...SHADOWS.small,
    },
    cardTitle: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, marginBottom: SPACING.lg },
    noPgText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    pgChipsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    pgChip: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.backgroundGray,
    },
    pgChipActive: {
        backgroundColor: COLORS.primary,
    },
    pgChipText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontWeight: FONT_WEIGHTS.medium,
    },
    pgChipTextActive: {
        color: COLORS.white,
    },

    label: {
        fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.gray,
        marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.3,
    },
    input: {
        backgroundColor: COLORS.backgroundGray, borderRadius: BORDER_RADIUS.md, padding: SPACING.md,
        fontSize: FONT_SIZES.md, color: COLORS.black, marginBottom: SPACING.lg,
        borderWidth: 1, borderColor: COLORS.border,
    },
    mealInput: { minHeight: 50 },

    vegToggle: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    checkbox: {
        width: 24, height: 24, borderRadius: BORDER_RADIUS.sm, borderWidth: 2,
        borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center',
    },
    checkboxActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
    vegLabel: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.medium, color: COLORS.black },

    dayTabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
    dayTab: {
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
        backgroundColor: COLORS.white, ...SHADOWS.small,
    },
    dayTabActive: { backgroundColor: COLORS.primary },
    dayTabText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.semibold, color: COLORS.gray },
    dayTabTextActive: { color: COLORS.white },

    copyButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
        marginHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1, borderColor: COLORS.primary, ...SHADOWS.small,
    },
    copyText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },

    footer: {
        padding: SPACING.lg, backgroundColor: COLORS.white,
        borderTopWidth: 1, borderTopColor: COLORS.borderLight,
    },
    saveButton: {
        backgroundColor: COLORS.primary, paddingVertical: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.primary,
    },
    saveButtonText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
});
