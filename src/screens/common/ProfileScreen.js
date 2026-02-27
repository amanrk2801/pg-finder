import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { CustomInput, CustomButton, ScreenHeader } from '../../components/common';

export default function ProfileScreen({ navigation }) {
    const { user, userType, logout, updateUserProfile } = useAuth();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        const success = await updateUserProfile({ name, phone });
        setIsLoading(false);

        if (success) {
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } else {
            Alert.alert('Error', 'Could not update profile. Please try again.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                onPress: () => { logout(); navigation.replace(ROUTES.LOGIN); },
                style: 'destructive',
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScreenHeader
                    title="Profile"
                    subtitle={userType === 'admin' ? 'Administrator' : 'Your account'}
                    onBack={userType === 'admin' ? () => navigation.goBack() : undefined}
                />

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(name || user?.email || 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.roleText}>
                            {userType === 'admin' ? 'Administrator' : 'Tenant'}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Personal Details</Text>
                            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                                <Text style={styles.editButtonText}>
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <CustomInput label="Email Address" value={user?.email || ''} editable={false} icon="mail-outline" />
                        <CustomInput
                            label="Full Name" placeholder="e.g., Aman Kumar"
                            value={name} onChangeText={setName} editable={isEditing} icon="person-outline"
                        />
                        <CustomInput
                            label="Phone Number" placeholder="e.g., +91 9876543210"
                            value={phone} onChangeText={setPhone}
                            keyboardType="phone-pad" editable={isEditing} icon="call-outline"
                        />

                        {isEditing && (
                            <View style={styles.buttonContainer}>
                                <CustomButton title="Save Changes" onPress={handleSaveProfile} loading={isLoading} />
                            </View>
                        )}
                    </View>

                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerTitle}>Security</Text>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    content: { flex: 1, paddingHorizontal: SPACING.xxl },
    avatarContainer: { alignItems: 'center', marginVertical: SPACING.xl },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.sm, ...SHADOWS.medium,
    },
    avatarText: { color: COLORS.white, fontSize: 40, fontWeight: FONT_WEIGHTS.bold },
    roleText: {
        fontSize: FONT_SIZES.sm, color: COLORS.gray, textTransform: 'uppercase',
        letterSpacing: 1, fontWeight: '600',
    },
    formContainer: {
        backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
    },
    sectionTitle: { ...TYPOGRAPHY.h4, color: COLORS.black },
    editButtonText: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm },
    buttonContainer: { marginTop: SPACING.md },
    dangerZone: { backgroundColor: COLORS.backgroundPink, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg },
    dangerTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.error, marginBottom: SPACING.md },
    logoutButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 56, 92, 0.2)',
    },
    logoutText: { color: COLORS.error, fontWeight: FONT_WEIGHTS.bold, marginLeft: SPACING.sm, fontSize: FONT_SIZES.md },
});
