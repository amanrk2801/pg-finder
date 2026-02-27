import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
    Image, Dimensions, StatusBar,
} from 'react-native';
import { useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function PGDetailsScreen({ route, navigation }) {
    const { pg } = route.params;
    const { deletePg } = useData();

    const handleDelete = () => {
        Alert.alert(
            'Delete Property',
            'Are you sure you want to remove this property? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => { await deletePg(pg.id); navigation.goBack(); },
                },
            ],
        );
    };

    const images = pg.images?.length > 0 ? pg.images : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageSection}>
                    {images.length > 0 ? (
                        <Image source={{ uri: images[0] }} style={styles.headerImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={{ fontSize: 64 }}>🏠</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.pgName} numberOfLines={2}>{pg.name}</Text>
                        <View style={styles.genderBadge}>
                            <Text style={styles.genderText}>{pg.gender}</Text>
                        </View>
                    </View>

                    <Text style={styles.pgAddress}>📍 {pg.address}</Text>

                    <View style={styles.statsGrid}>
                        {[
                            { label: 'Total Rooms', value: pg.totalRooms, color: COLORS.black },
                            { label: 'Available', value: pg.totalRooms - pg.occupiedRooms, color: COLORS.secondary },
                            { label: 'Vacant Beds', value: pg.vacantBeds, color: COLORS.primary },
                        ].map(({ label, value, color }) => (
                            <View key={label} style={styles.statBox}>
                                <Text style={styles.statLabel}>{label}</Text>
                                <Text style={[styles.statValue, { color }]}>{value}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Monthly Rent</Text>
                        <Text style={styles.priceAmount}>₹{pg.rent.toLocaleString()}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Facilities</Text>
                    <View style={styles.pillContainer}>
                        {pg.facilities.map((facility, index) => (
                            <View key={index} style={styles.pill}>
                                <Text style={styles.pillText}>✓ {facility}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Safety Measures</Text>
                    <View style={styles.pillContainer}>
                        {pg.safetyMeasures.map((measure, index) => (
                            <View key={index} style={[styles.pill, { backgroundColor: COLORS.backgroundPink }]}>
                                <Text style={[styles.pillText, { color: COLORS.primary }]}>🛡️ {measure}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate(ROUTES.ADMIN.EDIT_PG, { pg })}
                >
                    <Text style={styles.buttonText}>✏️ Edit Property</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.buttonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    imageSection: { width, height: 300, position: 'relative' },
    headerImage: { width, height: 300 },
    imagePlaceholder: { width: '100%', height: '100%', backgroundColor: COLORS.backgroundGray, justifyContent: 'center', alignItems: 'center' },
    backButton: {
        position: 'absolute', top: 50, left: SPACING.lg, width: 40, height: 40,
        borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.whiteOverlayLight,
        justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium,
    },
    backIcon: { fontSize: FONT_SIZES.xxxl, color: COLORS.black },
    content: {
        backgroundColor: COLORS.white, marginTop: -20,
        borderTopLeftRadius: BORDER_RADIUS.xxl, borderTopRightRadius: BORDER_RADIUS.xxl,
        padding: SPACING.xxl, ...SHADOWS.large,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    pgName: { flex: 1, ...TYPOGRAPHY.h3, marginRight: SPACING.sm },
    genderBadge: { backgroundColor: COLORS.backgroundGray, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
    genderText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    pgAddress: { fontSize: FONT_SIZES.base, color: COLORS.gray, marginBottom: SPACING.xl },
    statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    statBox: { flex: 1, backgroundColor: COLORS.backgroundGray, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
    statLabel: { fontSize: 11, color: COLORS.gray, fontWeight: FONT_WEIGHTS.medium, marginBottom: 4 },
    statValue: { fontSize: FONT_SIZES.xxxl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black },
    priceContainer: {
        backgroundColor: COLORS.backgroundPink, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl,
    },
    priceLabel: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semibold },
    priceAmount: { fontSize: FONT_SIZES.huge, color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
    sectionTitle: { ...TYPOGRAPHY.h4, marginBottom: SPACING.md, marginTop: SPACING.sm },
    pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
    pill: { backgroundColor: COLORS.backgroundGray, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.round },
    pillText: { fontSize: FONT_SIZES.base, color: COLORS.black, fontWeight: FONT_WEIGHTS.medium },
    footer: {
        position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row',
        padding: SPACING.lg, paddingBottom: SPACING.xxl, backgroundColor: COLORS.white,
        borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.md,
    },
    editButton: { flex: 4, backgroundColor: COLORS.secondary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.secondary },
    deleteButton: { flex: 1, backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', ...SHADOWS.primary },
    buttonText: { color: COLORS.white, fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
});
