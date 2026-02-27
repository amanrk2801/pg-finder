import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../hooks';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { CustomInput, CustomButton, ScreenHeader, ImagePickerSection, PillSelector, GenderSelector } from '../../components/common';
import {
    FACILITY_OPTIONS, SAFETY_OPTIONS,
    facilitiesMapToArray, safetyMapToArray,
    facilitiesArrayToMap, safetyArrayToMap, validatePGForm,
} from '../../utils/pgFormConfig';

export default function EditPGScreen({ route, navigation }) {
    const { pg } = route.params;
    const { updatePg } = useData();

    const [formData, setFormData] = useState({
        name: pg.name, address: pg.address,
        totalRooms: pg.totalRooms.toString(), occupiedRooms: pg.occupiedRooms.toString(),
        totalBeds: pg.totalBeds.toString(), vacantBeds: pg.vacantBeds.toString(),
        rent: pg.rent.toString(), gender: pg.gender,
    });
    const [errors, setErrors] = useState({});
    const [selectedImages, setSelectedImages] = useState(pg.images || []);
    const [facilities, setFacilities] = useState(facilitiesArrayToMap(pg.facilities));
    const [safetyMeasures, setSafetyMeasures] = useState(safetyArrayToMap(pg.safetyMeasures));

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async () => {
        const { isValid, errors: newErrors } = validatePGForm(formData, { requireBeds: true });
        if (!isValid) { setErrors(newErrors); return; }

        const updatedData = {
            name: formData.name,
            address: formData.address,
            totalRooms: parseInt(formData.totalRooms),
            occupiedRooms: parseInt(formData.occupiedRooms),
            totalBeds: parseInt(formData.totalBeds),
            vacantBeds: parseInt(formData.vacantBeds),
            rent: parseInt(formData.rent),
            gender: formData.gender,
            facilities: facilitiesMapToArray(facilities),
            safetyMeasures: safetyMapToArray(safetyMeasures),
            images: selectedImages,
        };

        await updatePg(pg.id, updatedData);
        Alert.alert('Success', 'Property updated successfully!');
        navigation.goBack();
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

                <CustomButton title="Save Changes" onPress={handleSubmit} style={{ marginTop: SPACING.xl }} />
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
