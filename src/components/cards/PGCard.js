import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const CompactCard = ({ pg, onPress, isFavorite, onToggleFavorite }) => (
    <TouchableOpacity style={compactStyles.card} onPress={onPress} activeOpacity={0.9}>
        {pg.images && pg.images.length > 0 ? (
            <Image source={{ uri: pg.images[0] }} style={compactStyles.image} resizeMode="cover" />
        ) : (
            <View style={[compactStyles.image, compactStyles.imagePlaceholder]}>
                <Ionicons name="image-outline" size={24} color={COLORS.grayLight} />
            </View>
        )}

        <View style={compactStyles.info}>
            <View style={compactStyles.topRow}>
                <Text style={compactStyles.name} numberOfLines={1}>{pg.name}</Text>
                <View style={compactStyles.ratingBadge}>
                    <Ionicons name="star" size={11} color="#FFD700" />
                    <Text style={compactStyles.ratingText}>{pg.rating || '4.5'}</Text>
                </View>
            </View>

            <View style={compactStyles.addressRow}>
                <Ionicons name="location-outline" size={12} color={COLORS.gray} style={{ marginRight: 3 }} />
                <Text style={compactStyles.address} numberOfLines={1}>{pg.address}</Text>
            </View>

            <View style={compactStyles.bottomRow}>
                <Text style={compactStyles.price}>₹{pg.rent.toLocaleString()}</Text>
                <Text style={compactStyles.period}>/mo</Text>

                <View style={[
                    compactStyles.vacancyChip,
                    { backgroundColor: pg.vacantBeds > 0 ? '#E8F5E9' : '#FFEBEE' },
                ]}>
                    <Text style={[
                        compactStyles.vacancyText,
                        { color: pg.vacantBeds > 0 ? '#4CAF50' : COLORS.primary },
                    ]}>
                        {pg.vacantBeds > 0 ? `${pg.vacantBeds} left` : 'Full'}
                    </Text>
                </View>

                {onToggleFavorite && (
                    <TouchableOpacity onPress={onToggleFavorite} style={compactStyles.heartBtn}>
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={18}
                            color={isFavorite ? COLORS.primary : COLORS.grayLight}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    </TouchableOpacity>
);

const PGCard = ({ pg, onPress, isFavorite, onToggleFavorite, showFavoriteIcon = true, compact = false }) => {
    if (compact) {
        return (
            <CompactCard
                pg={pg}
                onPress={onPress}
                isFavorite={isFavorite}
                onToggleFavorite={showFavoriteIcon ? onToggleFavorite : undefined}
            />
        );
    }

    return (
        <TouchableOpacity
            style={styles.pgCard}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                {pg.images && pg.images.length > 0 ? (
                    <Image source={{ uri: pg.images[0] }} style={styles.pgImage} resizeMode="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={48} color={COLORS.grayLight} />
                    </View>
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.overlayTop}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{pg.gender}</Text>
                        </View>

                        {showFavoriteIcon && (
                            <TouchableOpacity
                                style={styles.favoriteButton}
                                activeOpacity={0.8}
                                onPress={onToggleFavorite}
                            >
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isFavorite ? COLORS.primary : COLORS.gray}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.overlayBottom}>
                        <View
                            style={[
                                styles.vacancyBadge,
                                { backgroundColor: pg.vacantBeds > 0 ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 56, 92, 0.95)' }
                            ]}
                        >
                            <Text style={styles.vacancyText}>
                                {pg.vacantBeds > 0 ? `${pg.vacantBeds} Beds Left` : 'Full'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.pgContent}>
                <View style={styles.pgTitleRow}>
                    <Text style={styles.pgName} numberOfLines={1}>{pg.name}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" style={styles.starIcon} />
                        <Text style={styles.ratingText}>{pg.rating || "4.5"}</Text>
                    </View>
                </View>

                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color={COLORS.gray} style={{ marginRight: 4 }} />
                    <Text style={styles.pgAddress} numberOfLines={1}>{pg.address}</Text>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.priceAmount}>₹{pg.rent.toLocaleString()}</Text>
                    <Text style={styles.pricePeriod}> / month</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pgCard: {
        marginHorizontal: SPACING.xxl,
        marginBottom: SPACING.xxl,
    },
    imageContainer: {
        width: "100%",
        height: 200,
        borderRadius: BORDER_RADIUS.xxl,
        overflow: "hidden",
        backgroundColor: COLORS.backgroundGray,
        marginBottom: SPACING.md,
    },
    pgImage: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    overlayTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    overlayBottom: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.round,
        ...SHADOWS.small,
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.black,
        letterSpacing: 0.5,
    },
    favoriteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: "center",
        alignItems: "center",
        ...SHADOWS.small,
    },
    vacancyBadge: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.medium,
    },
    vacancyText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.white,
    },
    pgContent: { paddingHorizontal: 4 },
    pgTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    pgName: {
        fontSize: FONT_SIZES.xl,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.black,
        flex: 1,
        letterSpacing: -0.5,
    },
    ratingContainer: { flexDirection: "row", alignItems: "center" },
    starIcon: { marginRight: 4 },
    ratingText: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    pgAddress: {
        fontSize: FONT_SIZES.sm + 1,
        color: COLORS.gray,
        fontWeight: '500'
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginTop: SPACING.xs
    },
    priceAmount: {
        fontSize: FONT_SIZES.xl,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.black,
    },
    pricePeriod: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        fontWeight: '500'
    },
});

const compactStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    image: {
        width: 100,
        height: 100,
    },
    imagePlaceholder: {
        backgroundColor: COLORS.backgroundGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
        flex: 1,
        marginRight: SPACING.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    address: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        flex: 1,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.extrabold,
        color: COLORS.black,
    },
    period: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginRight: SPACING.sm,
    },
    vacancyChip: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    vacancyText: {
        fontSize: 10,
        fontWeight: FONT_WEIGHTS.bold,
    },
    heartBtn: {
        marginLeft: 'auto',
        padding: 2,
    },
});

export default PGCard;
