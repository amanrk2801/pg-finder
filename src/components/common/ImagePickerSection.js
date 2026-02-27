import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants/theme';

const MAX_IMAGES = 5;

const ImagePickerSection = ({ images, onImagesChange }) => {
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Gallery access is required to upload photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES,
            quality: 0.7,
        });

        if (!result.canceled) {
            const newUris = result.assets.map((asset) => asset.uri);
            onImagesChange([...images, ...newUris].slice(0, MAX_IMAGES));
        }
    };

    const removeImage = (index) => {
        onImagesChange(images.filter((_, i) => i !== index));
    };

    return (
        <View>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.7}>
                <Text style={styles.uploadIcon}>📸</Text>
                <Text style={styles.uploadText}>Upload from Gallery</Text>
                <Text style={styles.uploadSubText}>(Max {MAX_IMAGES} photos)</Text>
            </TouchableOpacity>

            {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {images.map((uri, index) => (
                        <View key={`${uri}-${index}`} style={styles.thumbnailWrapper}>
                            <Image source={{ uri }} style={styles.thumbnail} />
                            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                                <Text style={styles.removeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    uploadButton: {
        backgroundColor: COLORS.backgroundGray,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    uploadIcon: { fontSize: 32, marginBottom: 8 },
    uploadText: { fontSize: FONT_SIZES.md, color: COLORS.black, fontWeight: FONT_WEIGHTS.bold },
    uploadSubText: { fontSize: FONT_SIZES.sm, color: COLORS.gray, marginTop: 4 },
    imageScroll: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    thumbnailWrapper: {
        position: 'relative',
        marginRight: SPACING.md,
        marginTop: SPACING.sm,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.backgroundGray,
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    removeBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ImagePickerSection;
