import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth, useData } from '../../hooks';
import UploadService from '../../services/UploadService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { CustomInput, CustomButton, ScreenHeader, ImagePickerSection, PillSelector, GenderSelector } from '../../components/common';
import {
    FACILITY_OPTIONS, SAFETY_OPTIONS, DEFAULT_PLACEHOLDER_IMAGES,
    facilitiesMapToArray, safetyMapToArray, validatePGForm,
} from '../../utils/pgFormConfig';

export default function AddPGScreen({ navigation }) {
    const { addPg } = useData();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '', address: '', totalRooms: '', occupiedRooms: '',
        totalBeds: '', vacantBeds: '', rent: '', gender: 'Female',
    });
    const [errors, setErrors] = useState({});
    const [selectedImages, setSelectedImages] = useState([]);
    const [facilities, setFacilities] = useState({});
    const [safetyMeasures, setSafetyMeasures] = useState({});
    const [location, setLocation] = useState(null);
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
        const { isValid, errors: newErrors } = validatePGForm(formData);
        if (!isValid) { setErrors(newErrors); return; }

        if (!location) {
            Alert.alert('Location Required', 'Please capture the property\'s current location before publishing, so it shows accurately on the map.');
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadedImages = await UploadService.uploadLocalImages(selectedImages);

            const pgData = {
                ...formData,
                totalRooms: parseInt(formData.totalRooms),
                occupiedRooms: parseInt(formData.occupiedRooms || 0),
                totalBeds: parseInt(formData.totalBeds || 0),
                vacantBeds: parseInt(formData.vacantBeds || 0),
                rent: parseInt(formData.rent || 0),
                facilities: facilitiesMapToArray(facilities),
                safetyMeasures: safetyMapToArray(safetyMeasures),
                adminId: user.id,
                location,
                images: uploadedImages.length > 0 ? uploadedImages : DEFAULT_PLACEHOLDER_IMAGES,
                rating: 0,
                reviews: 0,
            };

            await addPg(pgData);
            Alert.alert('Success', 'Property added successfully!');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'Could not upload photos or save the property. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="Add Property" onBack={() => navigation.goBack()} centerTitle />

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Property Photos</Text>
                <ImagePickerSection images={selectedImages} onImagesChange={setSelectedImages} />

                <Text style={styles.sectionHeader}>Basic Details</Text>
                <CustomInput
                    label="Property Name *" value={formData.name}
                    onChangeText={(t) => updateField('name', t)}
                    placeholder="e.g. Sunshine Elite PG" error={errors.name}
                />
                <CustomInput
                    label="Full Address *" value={formData.address}
                    onChangeText={(t) => updateField('address', t)}
                    placeholder="Enter complete street address" multiline numberOfLines={3} error={errors.address}
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
                            ? `Location Captured (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
                            : 'Capture Current Location *'}
                    </Text>
                </TouchableOpacity>
                {!location && (
                    <Text style={styles.locationHint}>Stand at the property before tapping — this pins it accurately on the map for users nearby.</Text>
                )}

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Total Rooms *" value={formData.totalRooms}
                            onChangeText={(t) => updateField('totalRooms', t)}
                            placeholder="0" keyboardType="numeric" error={errors.totalRooms}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Occupied Rooms" value={formData.occupiedRooms}
                            onChangeText={(t) => updateField('occupiedRooms', t)}
                            placeholder="0" keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Total Beds" value={formData.totalBeds}
                            onChangeText={(t) => updateField('totalBeds', t)}
                            placeholder="0" keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Vacant Beds" value={formData.vacantBeds}
                            onChangeText={(t) => updateField('vacantBeds', t)}
                            placeholder="0" keyboardType="numeric"
                        />
                    </View>
                </View>

                <CustomInput
                    label="Monthly Rent (₹) *" value={formData.rent}
                    onChangeText={(t) => updateField('rent', t)}
                    placeholder="e.g. 8000" keyboardType="numeric" error={errors.rent}
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
                    title={isSubmitting ? 'Publishing...' : 'Publish Property'}
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
