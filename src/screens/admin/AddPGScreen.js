import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
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

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async () => {
        const { isValid, errors: newErrors } = validatePGForm(formData);
        if (!isValid) { setErrors(newErrors); return; }

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
            location: { latitude: 18.5204, longitude: 73.8567 },
            images: selectedImages.length > 0 ? selectedImages : DEFAULT_PLACEHOLDER_IMAGES,
            rating: 0,
            reviews: 0,
        };

        await addPg(pgData);
        Alert.alert('Success', 'Property added successfully!');
        navigation.goBack();
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

                <CustomButton title="Publish Property" onPress={handleSubmit} style={{ marginTop: SPACING.xl }} />
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
});
