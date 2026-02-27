import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
        <Text style={styles.markerText}>₹{rent.toLocaleString()}</Text>
    </View>
));

export default function MapScreen({ filteredPgs, navigation }) {
    const mapRef = useRef(null);

    const validPgs = filteredPgs.filter(pg => pg.location?.latitude && pg.location?.longitude);

    const initialRegion = validPgs.length > 0
        ? {
            latitude: validPgs[0].location.latitude,
            longitude: validPgs[0].location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        }
        : DEFAULT_REGION;

    useEffect(() => {
        if (validPgs.length === 0 || !mapRef.current) return;

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
    }, [filteredPgs]);

    const handleMarkerPress = useCallback((pg) => {
        navigation.navigate(ROUTES.USER.PG_DETAILS, { pg });
    }, [navigation]);

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
                        onPress={() => handleMarkerPress(pg)}
                        tracksViewChanges={false}
                    >
                        <PriceMarker rent={pg.rent} />
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
});
