import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PGCard from '../../components/cards/PGCard';
import { EmptyState } from '../../components/common';

const STAT_CONFIGS = [
    { label: 'Properties', emoji: '🏢', bg: COLORS.backgroundPink, numColor: COLORS.primary, iconBg: COLORS.white },
    { label: 'Total Rooms', emoji: '🚪', bg: '#E3F2FD', numColor: '#2196F3', iconBg: 'rgba(33, 150, 243, 0.15)' },
    { label: 'Vacant Beds', emoji: '🛏️', bg: '#E8F5E9', numColor: '#4CAF50', iconBg: 'rgba(76, 175, 80, 0.15)' },
];

export default function AdminDashboard({ navigation }) {
    const { user } = useAuth();
    const { pgs } = useData();

    const myPgs = (pgs || []).filter((pg) => pg.adminId === user?.id);
    const totalRooms = myPgs.reduce((sum, pg) => sum + (pg.totalRooms || 0), 0);
    const vacantBeds = myPgs.reduce((sum, pg) => sum + (pg.vacantBeds || 0), 0);
    const statValues = [myPgs.length, totalRooms, vacantBeds];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            <View style={styles.header}>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.greeting}>Admin Hub</Text>
                    <Text style={styles.subGreeting}>Manage your properties</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.ADMIN.PROFILE)}
                    style={styles.profileButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    {STAT_CONFIGS.map((cfg, idx) => (
                        <View key={cfg.label} style={[styles.statCard, { backgroundColor: cfg.bg }]}>
                            <View style={[styles.cornerIconWrapper, { backgroundColor: cfg.iconBg }]}>
                                <Text style={styles.cornerIcon}>{cfg.emoji}</Text>
                            </View>
                            <View style={styles.statCenterContent}>
                                <Text style={[styles.centerNumber, { color: cfg.numColor }]}>{statValues[idx]}</Text>
                                <Text style={styles.statLabel}>{cfg.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate(ROUTES.ADMIN.ADD_PG)}
                    activeOpacity={0.8}
                >
                    <View style={styles.addButtonIconContainer}>
                        <Text style={styles.addIcon}>+</Text>
                    </View>
                    <Text style={styles.addButtonText}>Add New Property</Text>
                    <Text style={styles.addButtonArrow}>→</Text>
                </TouchableOpacity>

                {myPgs.length > 0 && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.navigate(ROUTES.ADMIN.MANAGE_MENU, { pgId: myPgs[0].id })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.menuButtonIconContainer}>
                            <Ionicons name="fast-food-outline" size={20} color={COLORS.white} />
                        </View>
                        <Text style={styles.menuButtonText}>Manage Mess Menu</Text>
                        <Text style={styles.addButtonArrow}>→</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>My Properties</Text>
                    <Text style={styles.propertyCount}>{myPgs.length} Total</Text>
                </View>

                {myPgs.length === 0 ? (
                    <EmptyState
                        icon="business-outline"
                        title="No properties yet"
                        message="Add your first property to start managing your portfolio."
                    />
                ) : (
                    myPgs.map((pg) => (
                        <PGCard
                            key={pg.id}
                            pg={pg}
                            onPress={() => navigation.navigate(ROUTES.ADMIN.PG_DETAILS, { pg })}
                            showFavoriteIcon={false}
                        />
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        paddingHorizontal: SPACING.xxl, paddingTop: 20, paddingBottom: SPACING.lg,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white,
    },
    headerTextContainer: { flex: 1 },
    greeting: { ...TYPOGRAPHY.h2, color: COLORS.black, marginBottom: 2 },
    subGreeting: { fontSize: FONT_SIZES.base, color: COLORS.gray },
    profileButton: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.backgroundPink, borderWidth: 1, borderColor: 'rgba(255, 56, 92, 0.2)',
        justifyContent: 'center', alignItems: 'center', ...SHADOWS.small,
    },
    content: { flex: 1, backgroundColor: COLORS.white },
    statsContainer: { flexDirection: 'row', paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.xl, gap: SPACING.md },
    statCard: {
        flex: 1, position: 'relative', borderRadius: BORDER_RADIUS.xl,
        alignItems: 'center', justifyContent: 'center', minHeight: 120, padding: SPACING.sm,
    },
    cornerIconWrapper: {
        position: 'absolute', top: SPACING.md, right: SPACING.md,
        width: 28, height: 28, borderRadius: BORDER_RADIUS.circle, justifyContent: 'center', alignItems: 'center',
    },
    cornerIcon: { fontSize: FONT_SIZES.sm },
    statCenterContent: { alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md },
    centerNumber: { fontSize: 32, fontWeight: FONT_WEIGHTS.extrabold, marginBottom: 4 },
    statLabel: {
        fontSize: 10, color: COLORS.gray, fontWeight: FONT_WEIGHTS.bold,
        textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center',
    },
    addButton: {
        flexDirection: 'row', backgroundColor: COLORS.primary,
        marginHorizontal: SPACING.xxl, padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl, alignItems: 'center', marginBottom: SPACING.xxxl, ...SHADOWS.medium,
    },
    addButtonIconContainer: {
        width: 40, height: 40, borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    addIcon: { fontSize: FONT_SIZES.xl, color: COLORS.white, fontWeight: FONT_WEIGHTS.bold },
    addButtonText: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
    addButtonArrow: { color: COLORS.white, fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, marginRight: SPACING.sm },
    menuButton: {
        flexDirection: 'row', backgroundColor: '#00A699',
        marginHorizontal: SPACING.xxl, padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl, alignItems: 'center', marginBottom: SPACING.xxxl, ...SHADOWS.medium,
    },
    menuButtonIconContainer: {
        width: 40, height: 40, borderRadius: BORDER_RADIUS.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
    },
    menuButtonText: { flex: 1, color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
    listHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        paddingHorizontal: SPACING.xxl, marginBottom: SPACING.md,
    },
    sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.black },
    propertyCount: { fontSize: FONT_SIZES.sm, color: COLORS.gray, fontWeight: FONT_WEIGHTS.semibold, paddingBottom: 2 },
});
