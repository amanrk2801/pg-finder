import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const DEFAULT_REGION = {
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

const PriceMarker = React.memo(({ rent }) => (
    <View style={styles.markerContainer}>
        <Ionicons name="home" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
        <Text style={styles.markerText}>₹{rent.toLocaleString()}</Text>
    </View>
));

export default function MapScreen({ filteredPgs, navigation }) {
    const mapRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const { user } = useAuth();
    const { bookings } = useData();

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const position = await Location.getCurrentPositionAsync({}).catch(() => null);
            if (position) {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            }
        })();
    }, []);

    const validPgs = filteredPgs.filter(pg => pg.location?.latitude && pg.location?.longitude);

    const initialRegion = validPgs.length > 0
        ? {
            latitude: validPgs[0].location.latitude,
            longitude: validPgs[0].location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }
        : userLocation
            ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : DEFAULT_REGION;

    useEffect(() => {
        if (validPgs.length === 0) {
            if (userLocation && mapRef.current) {
                mapRef.current.animateToRegion({ ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 500);
            }
            return;
        }
        if (!mapRef.current) return;

        if (validPgs.length === 1) {
            mapRef.current.animateToRegion({
                latitude: validPgs[0].location.latitude,
                longitude: validPgs[0].location.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            }, 500);
        } else {
            mapRef.current.fitToCoordinates(
                validPgs.map(pg => ({
                    latitude: pg.location.latitude,
                    longitude: pg.location.longitude,
                })),
                { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
            );
        }
    }, [filteredPgs, userLocation]);

    const handleViewDetails = useCallback((pg) => {
        navigation.navigate(ROUTES.USER.PG_DETAILS, { pg });
    }, [navigation]);

    const handleQuickBook = useCallback((pg) => {
        const alreadyBooked = (bookings || []).some(
            b => b.userId === user?.id && (b.pgId === pg.id || b.pgId === pg._id) && b.status === 'active'
        );
        if (alreadyBooked) {
            Alert.alert("Already Booked", "You already have a bed booked at this PG.");
            return;
        }
        if ((pg.vacantBeds || 0) <= 0) {
            Alert.alert("Fully Occupied", "Sorry, no beds are currently available.");
            return;
        }
        navigation.navigate(ROUTES.USER.PAYMENT, { pg });
    }, [navigation, bookings, user]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {validPgs.map((pg) => (
                    <Marker
                        key={pg.id}
                        coordinate={{
                            latitude: pg.location.latitude,
                            longitude: pg.location.longitude,
                        }}
                        tracksViewChanges={false}
                    >
                        <PriceMarker rent={pg.rent} />
                        <Callout tooltip onPress={() => handleViewDetails(pg)}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle} numberOfLines={1}>{pg.name}</Text>
                                <Text style={styles.calloutSub} numberOfLines={1}>{pg.address}</Text>
                                <Text style={styles.calloutRent}>₹{pg.rent.toLocaleString()}/mo</Text>
                                <TouchableOpacity
                                    style={[styles.calloutBookBtn, (pg.vacantBeds || 0) <= 0 && { backgroundColor: COLORS.gray }]}
                                    onPress={() => handleQuickBook(pg)}
                                >
                                    <Text style={styles.calloutBookText}>
                                        {(pg.vacantBeds || 0) > 0 ? 'Book Now' : 'Full'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.round,
        borderWidth: 1.5,
        borderColor: COLORS.black,
        ...SHADOWS.small,
    },
    markerText: {
        fontWeight: FONT_WEIGHTS.extrabold,
        fontSize: FONT_SIZES.sm,
        color: COLORS.black,
    },
    calloutContainer: {
        width: 180,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: 12,
        ...SHADOWS.medium,
    },
    calloutTitle: {
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.sm,
        color: COLORS.black,
    },
    calloutSub: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        marginTop: 2,
    },
    calloutRent: {
        fontWeight: FONT_WEIGHTS.extrabold,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        marginTop: 6,
        marginBottom: 8,
    },
    calloutBookBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 8,
        alignItems: 'center',
    },
    calloutBookText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHTS.bold,
        fontSize: FONT_SIZES.xs,
    },
});
