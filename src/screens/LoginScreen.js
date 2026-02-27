import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, Platform,
    StatusBar, Dimensions, ScrollView, Keyboard, KeyboardAvoidingView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useData } from '../hooks';
import { ROUTES } from '../navigation/routes';
import StorageService from '../services/StorageService';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';
import { CustomInput, CustomButton } from '../components/common';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedType, setSelectedType] = useState('user');
    const { login } = useAuth();
    const { pgs, pendingPgs, addPendingPg } = useData();

    const [showPgForm, setShowPgForm] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [address, setAddress] = useState('');
    const [rent, setRent] = useState('');
    const [phone, setPhone] = useState('');
    const [authData, setAuthData] = useState(null);

    const scrollViewRef = useRef(null);
    const passwordInputRef = useRef(null);

    const handleLogin = useCallback(async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        Keyboard.dismiss();

        if (selectedType === 'admin' && email === 'superadmin@pg.com' && password === 'admin123') {
            const success = await login(email, password, 'superadmin');
            if (success) navigation.replace(ROUTES.SUPER_ADMIN.DASHBOARD);
            return;
        }

        if (selectedType === 'admin') {
            const success = await login(email, password, 'admin');
            if (!success) return;

            const session = await StorageService.getUserSession();
            const userId = session?.userData?.id;

            const existingPg = pgs.find(p => p.adminId === userId);
            const existingPending = pendingPgs.find(p => p.adminId === userId);

            if (existingPg) {
                navigation.replace(ROUTES.ADMIN.DASHBOARD);
            } else if (existingPending) {
                navigation.replace(ROUTES.ADMIN.PENDING_APPROVAL);
            } else {
                setAuthData({ email, password, userId });
                setShowPgForm(true);
            }
        } else {
            const success = await login(email, password, 'user');
            if (success) navigation.replace(ROUTES.USER.TABS);
        }
    }, [email, password, selectedType, login, navigation, pgs, pendingPgs]);

    const handleSubmitPgRequest = async () => {
        if (!businessName || !address || !rent || !phone) {
            Alert.alert('Error', 'Please fill all PG details.');
            return;
        }

        const success = await addPendingPg({
            businessName, address, rent, phone,
            adminId: authData.userId,
        });

        if (success) {
            setShowPgForm(false);
            navigation.replace(ROUTES.ADMIN.PENDING_APPROVAL);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
                <LinearGradient
                    colors={[COLORS.primary, '#E91E63', '#FF9800']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topSection}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🏡</Text>
                        </View>
                        <Text style={styles.appName}>PG Finder</Text>
                        <Text style={styles.tagline}>Discover Premium Stays. Seamlessly.</Text>
                    </View>
                </LinearGradient>

                <View style={styles.card}>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subtitleText}>Sign in to continue</Text>

                    <View style={styles.typeSelector}>
                        {[
                            { type: 'user', label: 'User', emoji: '👤' },
                            { type: 'admin', label: 'Admin', emoji: '👨‍💼' },
                        ].map(({ type, label, emoji }) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
                                onPress={() => setSelectedType(type)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.typeEmoji}>{emoji}</Text>
                                <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <CustomInput
                        label="Email Address" placeholder="Enter your email"
                        value={email} onChangeText={setEmail} icon="mail-outline"
                        keyboardType="email-address" autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                    <CustomInput
                        label="Password" placeholder="Enter your password"
                        value={password} onChangeText={setPassword} icon="lock-closed-outline"
                        secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin}
                    />
                    <CustomButton
                        title={selectedType === 'admin' ? 'Continue as Admin' : 'Sign In'}
                        onPress={handleLogin}
                        style={{ marginTop: 6, marginBottom: SPACING.lg }}
                    />
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                    <View style={styles.keyboardSpacer} />
                </View>
            </ScrollView>

            <Modal visible={showPgForm} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>List Your PG</Text>
                            <Text style={styles.modalSub}>
                                Please provide details so our Super Admin can verify your property.
                            </Text>
                        </View>
                        <CustomInput label="PG Business Name" placeholder="e.g. Skyline Stays" value={businessName} onChangeText={setBusinessName} icon="business-outline" />
                        <CustomInput label="Full Address" placeholder="Enter complete address" value={address} onChangeText={setAddress} icon="location-outline" />
                        <CustomInput label="Monthly Rent (₹)" placeholder="e.g. 5000" value={rent} onChangeText={setRent} icon="cash-outline" keyboardType="numeric" />
                        <CustomInput label="Contact Phone" placeholder="Enter phone number" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
                        <CustomButton title="Submit Application" onPress={handleSubmitPgRequest} style={{ marginTop: SPACING.md }} />
                        <TouchableOpacity onPress={() => setShowPgForm(false)} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    scrollView: { flex: 1, backgroundColor: COLORS.white },
    scrollContent: {
        flexGrow: 1, minHeight: height,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: COLORS.white,
    },
    topSection: {
        height: height * 0.35, justifyContent: 'center', alignItems: 'center', paddingTop: SPACING.xl,
    },
    headerContent: { alignItems: 'center', zIndex: 2 },
    logoContainer: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
        borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.5)', ...SHADOWS.medium,
    },
    logoEmoji: { fontSize: 40 },
    appName: {
        fontSize: 32, fontWeight: FONT_WEIGHTS.extrabold, color: COLORS.white,
        letterSpacing: -0.5, marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
    },
    tagline: { fontSize: FONT_SIZES.md, color: 'rgba(255, 255, 255, 0.95)', fontWeight: FONT_WEIGHTS.medium, letterSpacing: 0.5 },
    card: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 40, borderTopRightRadius: 40,
        paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xxl, paddingBottom: SPACING.xl,
        marginTop: -30, flex: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 20,
    },
    welcomeText: { ...TYPOGRAPHY.h1, color: COLORS.black, marginBottom: 4 },
    subtitleText: { fontSize: FONT_SIZES.md, color: COLORS.gray, marginBottom: SPACING.xxl },
    typeSelector: {
        flexDirection: 'row', marginBottom: SPACING.xxl,
        backgroundColor: COLORS.backgroundGray, borderRadius: BORDER_RADIUS.xl, padding: 6,
    },
    typeButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: BORDER_RADIUS.lg, backgroundColor: 'transparent',
    },
    typeButtonActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
    typeEmoji: { fontSize: 18, marginRight: 8 },
    typeText: { fontSize: FONT_SIZES.md, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray },
    typeTextActive: { color: COLORS.primary },
    footerText: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', lineHeight: 18, paddingHorizontal: SPACING.xl },
    keyboardSpacer: { height: 60 },
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalScroll: { padding: SPACING.xl, paddingBottom: 40 },
    modalHeader: { marginBottom: SPACING.xxl },
    modalTitle: { ...TYPOGRAPHY.h1, color: COLORS.black, marginBottom: 8 },
    modalSub: { fontSize: FONT_SIZES.md, color: COLORS.gray, lineHeight: 22 },
    cancelBtn: { marginTop: SPACING.lg, padding: SPACING.md, alignItems: 'center' },
    cancelText: { color: COLORS.error, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
});
