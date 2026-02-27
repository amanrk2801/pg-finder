import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { CustomInput, CustomButton, ScreenHeader } from '../../components/common';

const POST_CATEGORIES = ['Sale', 'Job', 'Service'];

export default function CreatePostScreen({ navigation }) {
    const { user } = useAuth();
    const { addCommunityPost } = useData();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [category, setCategory] = useState('Sale');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreatePost = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await addCommunityPost({
                userId: user.id,
                authorName: user?.email?.split('@')[0] || 'User',
                title, description, category, contactInfo,
            });
            Alert.alert('Success', 'Your post has been published to the community!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch {
            Alert.alert('Error', 'Could not create post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScreenHeader title="Create Post" onBack={() => navigation.goBack()} centerTitle />

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionLabel}>Select Category</Text>
                    <View style={styles.categoryContainer}>
                        {POST_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                onPress={() => setCategory(cat)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <CustomInput
                        label="Post Title" placeholder="e.g., Bed for Sale, Need a Maid"
                        value={title} onChangeText={(t) => { setTitle(t); clearError('title'); }}
                        error={errors.title}
                    />
                    <CustomInput
                        label="Description" placeholder="Provide details about what you need or are offering..."
                        value={description} onChangeText={(t) => { setDescription(t); clearError('description'); }}
                        error={errors.description} multiline numberOfLines={4}
                    />
                    <CustomInput
                        label="Contact Information" placeholder="Phone number or Email"
                        value={contactInfo} onChangeText={(t) => { setContactInfo(t); clearError('contactInfo'); }}
                        error={errors.contactInfo}
                    />

                    <View style={{ height: 40 }} />
                    <CustomButton title="Publish Post" onPress={handleCreatePost} loading={isLoading} />
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { padding: SPACING.xxl },
    sectionLabel: { ...TYPOGRAPHY.bodyBold, marginBottom: SPACING.sm },
    categoryContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
    categoryChip: {
        flex: 1, paddingVertical: SPACING.md, backgroundColor: COLORS.backgroundGray,
        borderRadius: BORDER_RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
    },
    categoryChipActive: { backgroundColor: COLORS.backgroundPink, borderColor: COLORS.primary },
    categoryText: { fontWeight: '600', color: COLORS.gray },
    categoryTextActive: { color: COLORS.primary, fontWeight: 'bold' },
});
