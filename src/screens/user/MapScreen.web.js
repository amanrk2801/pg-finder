import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

export default function MapScreen({ filteredPgs, navigation }) {
    const validPgs = filteredPgs.filter(pg => pg.location?.latitude && pg.location?.longitude);

    const handlePGPress = (pg) => {
        navigation.navigate(ROUTES.USER.PG_DETAILS, { pg });
    };

    return (
        <View style={styles.container}>
            <View style={styles.webPlaceholder}>
                <Ionicons name="map-outline" size={64} color={COLORS.primary} />
                <Text style={styles.title}>Interactive Map (Native Only)</Text>
                <Text style={styles.subtitle}>
                    The interactive map is optimized for Android and iOS devices.
                    On the web, you can view the list of available properties below.
                </Text>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Properties on Map ({validPgs.length})</Text>
                {validPgs.length === 0 ? (
                    <Text style={styles.emptyText}>No properties found in this area.</Text>
                ) : (
                    <FlatList
                        data={validPgs}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.pgCard} 
                                onPress={() => handlePGPress(item)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.pgInfo}>
                                    <Text style={styles.pgName}>{item.name}</Text>
                                    <Text style={styles.pgAddress} numberOfLines={1}>{item.address}</Text>
                                </View>
                                <View style={styles.priceBadge}>
                                    <Text style={styles.priceText}>₹{item.rent.toLocaleString()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundGray,
    },
    webPlaceholder: {
        height: '40%',
        backgroundColor: COLORS.backgroundPink,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        textAlign: 'center',
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.black,
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 400,
    },
    listSection: {
        flex: 1,
        padding: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.black,
        marginBottom: SPACING.md,
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    pgCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.small,
    },
    pgInfo: {
        flex: 1,
    },
    pgName: {
        fontSize: FONT_SIZES.md,
        fontWeight: FONT_WEIGHTS.bold,
        color: COLORS.black,
        marginBottom: 2,
    },
    pgAddress: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    priceBadge: {
        backgroundColor: COLORS.backgroundPink,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginHorizontal: SPACING.md,
    },
    priceText: {
        color: COLORS.primary,
        fontWeight: FONT_WEIGHTS.extrabold,
        fontSize: FONT_SIZES.sm,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        color: COLORS.gray,
        fontSize: FONT_SIZES.md,
    }
});
