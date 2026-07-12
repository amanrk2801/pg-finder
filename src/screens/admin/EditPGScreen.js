import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useData } from '../../hooks';
import UploadService from '../../services/UploadService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { CustomInput, CustomButton, ScreenHeader, ImagePickerSection, PillSelector, GenderSelector } from '../../components/common';
import {
    FACILITY_OPTIONS, SAFETY_OPTIONS,
    facilitiesMapToArray, safetyMapToArray,
    facilitiesArrayToMap, safetyArrayToMap, validatePGForm,
} from '../../utils/pgFormConfig';

export default function EditPGScreen({ route, navigation }) {
    const { pg } = route.params || {};
    const { updatePg } = useData();

    if (!pg) {
        return (
            <View style={styles.container}>
                <Text>Property details not found.</Text>
                <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    const [formData, setFormData] = useState({
        name: pg.name || '', 
        address: pg.address || '',
        totalRooms: (pg.totalRooms || 0).toString(), 
        occupiedRooms: (pg.occupiedRooms || 0).toString(),
        totalBeds: (pg.totalBeds || 0).toString(), 
        vacantBeds: (pg.vacantBeds || 0).toString(),
        rent: (pg.rent || 0).toString(), 
        gender: pg.gender || 'unisex',
    });
    const [errors, setErrors] = useState({});
    const [selectedImages, setSelectedImages] = useState(pg.images || []);
    const [facilities, setFacilities] = useState(facilitiesArrayToMap(pg.facilities || []));
    const [safetyMeasures, setSafetyMeasures] = useState(safetyArrayToMap(pg.safetyMeasures || []));
    const [location, setLocation] = useState(
        (pg.location?.latitude != null && pg.location?.longitude != null) ? pg.location : null
    );
    const [isLocating, setIsLocating] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleCaptureLocation = async () => {
        setIsLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow location access so we can pin your PG accurately on the map.');
                return;
            }
            const position = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });

            const [place] = await Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []);
            if (place) {
                const addressParts = [
                    place.name, place.street, place.district, place.city,
                    place.subregion, place.region, place.postalCode,
                ].filter(Boolean);
                const uniqueParts = [...new Set(addressParts)];
                if (uniqueParts.length) {
                    updateField('address', uniqueParts.join(', '));
                }
            }
        } catch (err) {
            Alert.alert('Error', 'Could not fetch your current location. Please try again.');
        } finally {
            setIsLocating(false);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const { isValid, errors: newErrors } = validatePGForm(formData, { requireBeds: true });
        if (!isValid) { setErrors(newErrors); return; }

        setIsSubmitting(true);
        try {
            const uploadedImages = await UploadService.uploadLocalImages(selectedImages);

            // Ensure we send numbers to the backend
            const updatedData = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                totalRooms: parseInt(formData.totalRooms) || 0,
                occupiedRooms: parseInt(formData.occupiedRooms) || 0,
                totalBeds: parseInt(formData.totalBeds) || 0,
                vacantBeds: parseInt(formData.vacantBeds) || 0,
                rent: parseInt(formData.rent) || 0,
                gender: formData.gender.toLowerCase(),
                facilities: facilitiesMapToArray(facilities),
                safetyMeasures: safetyMapToArray(safetyMeasures),
                images: uploadedImages,
                ...(location ? { location } : {}),
            };

            const success = await updatePg(pg.id || pg._id, updatedData);

            if (success) {
                Alert.alert('Success', 'Property updated successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Update Failed', 'Could not save changes to the server.');
            }
        } catch (err) {
            Alert.alert('Error', 'Could not upload photos. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Edit Property" onBack={() => navigation.goBack()} centerTitle />

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Property Photos</Text>
                <ImagePickerSection images={selectedImages} onImagesChange={setSelectedImages} />

                <Text style={styles.sectionHeader}>Basic Details</Text>
                <CustomInput
                    label="Property Name *" value={formData.name}
                    onChangeText={(t) => updateField('name', t)} error={errors.name}
                />
                <CustomInput
                    label="Full Address *" value={formData.address}
                    onChangeText={(t) => updateField('address', t)}
                    multiline numberOfLines={3} error={errors.address}
                />

                <TouchableOpacity
                    style={[styles.locationBtn, location && styles.locationBtnCaptured]}
                    onPress={handleCaptureLocation}
                    disabled={isLocating}
                >
                    {isLocating ? (
                        <ActivityIndicator color={location ? COLORS.secondary : COLORS.primary} />
                    ) : (
                        <Ionicons
                            name={location ? 'checkmark-circle' : 'location-outline'}
                            size={20}
                            color={location ? COLORS.secondary : COLORS.primary}
                        />
                    )}
                    <Text style={[styles.locationBtnText, location && { color: COLORS.secondary }]}>
                        {location
                            ? `Location Set (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
                            : 'Update Current Location'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.locationHint}>Stand at the property before tapping to correct its map pin.</Text>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Total Rooms *" value={formData.totalRooms}
                            onChangeText={(t) => updateField('totalRooms', t)}
                            keyboardType="numeric" error={errors.totalRooms}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Occupied Rooms" value={formData.occupiedRooms}
                            onChangeText={(t) => updateField('occupiedRooms', t)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Total Beds *" value={formData.totalBeds}
                            onChangeText={(t) => updateField('totalBeds', t)}
                            keyboardType="numeric" error={errors.totalBeds}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Vacant Beds *" value={formData.vacantBeds}
                            onChangeText={(t) => updateField('vacantBeds', t)}
                            keyboardType="numeric" error={errors.vacantBeds}
                        />
                    </View>
                </View>

                <CustomInput
                    label="Monthly Rent (₹) *" value={formData.rent}
                    onChangeText={(t) => updateField('rent', t)}
                    keyboardType="numeric" error={errors.rent}
                />

                <Text style={styles.sectionHeader}>Target Audience</Text>
                <GenderSelector selected={formData.gender} onSelect={(g) => updateField('gender', g)} />

                <Text style={styles.sectionHeader}>Facilities Offered</Text>
                <PillSelector
                    options={FACILITY_OPTIONS}
                    selectedKeys={Object.keys(facilities).filter(k => facilities[k])}
                    onToggle={(key) => setFacilities(prev => ({ ...prev, [key]: !prev[key] }))}
                />

                <Text style={styles.sectionHeader}>Safety Measures</Text>
                <PillSelector
                    options={SAFETY_OPTIONS}
                    selectedKeys={Object.keys(safetyMeasures).filter(k => safetyMeasures[k])}
                    onToggle={(key) => setSafetyMeasures(prev => ({ ...prev, [key]: !prev[key] }))}
                />

                <CustomButton
                    title={isSubmitting ? 'Saving...' : 'Save Changes'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ marginTop: SPACING.xl }}
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    form: { padding: SPACING.xxl },
    sectionHeader: { ...TYPOGRAPHY.h4, marginTop: SPACING.lg, marginBottom: SPACING.md },
    row: { flexDirection: 'row', gap: SPACING.md },
    halfInput: { flex: 1 },
    locationBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg, paddingVertical: 14, marginBottom: 4, gap: 8,
    },
    locationBtnCaptured: { borderColor: COLORS.secondary, borderStyle: 'solid', backgroundColor: '#F0FFF4' },
    locationBtnText: { fontWeight: '700', color: COLORS.primary, fontSize: 13 },
    locationHint: { fontSize: 11, color: COLORS.gray, marginBottom: SPACING.md, marginTop: 4 },
});
