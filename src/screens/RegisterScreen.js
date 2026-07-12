import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks';
import { ROUTES } from '../navigation/routes';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '../constants/theme';
import { CustomInput, CustomButton } from '../components/common';

const { height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedType, setSelectedType] = useState('user'); // Default to user
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [ownershipProofRef, setOwnershipProofRef] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();

  const scrollViewRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const businessRegInputRef = useRef(null);
  const ownershipProofInputRef = useRef(null);

  const isValidEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  const handleRegister = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword || !name || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits.');
      return;
    }

    if (selectedType === 'admin' && (!businessRegNumber.trim() || !ownershipProofRef.trim())) {
      Alert.alert('Error', 'Please provide your business registration number and a property ownership proof reference. This helps us verify PG owners before listing goes live.');
      return;
    }

    Keyboard.dismiss();
    setIsRegistering(true);

    try {
      // Pass the selectedType (user or admin)
      const success = await register(normalizedEmail, password, selectedType, name, phone, {
        businessRegNumber: businessRegNumber.trim(),
        ownershipProofRef: ownershipProofRef.trim(),
      });
      if (!success) {
        Alert.alert('Registration failed', 'Unable to create your account. Please try again.');
      }
    } catch (err) {
      const message = /already exists/i.test(err.message)
        ? 'An account with this email already exists. Please sign in instead.'
        : /network/i.test(err.message)
          ? 'Unable to connect. Please check your internet connection and try again.'
          : 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', message);
    } finally {
      setIsRegistering(false);
    }
  }, [email, password, confirmPassword, name, phone, selectedType, businessRegNumber, ownershipProofRef, register]);

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
            <Text style={styles.tagline}>Create your account to get started.</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.welcomeText}>Create Account</Text>
          
          <View style={styles.typeSelector}>
            {[
                { type: 'user', label: 'Tenant', emoji: '👤' },
                { type: 'admin', label: 'Owner', emoji: '👨‍💼' },
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
            label="Full Name"
            placeholder="e.g., Aman Kumar"
            value={name}
            onChangeText={setName}
            icon="person-outline"
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          <CustomInput
            ref={emailInputRef}
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => phoneInputRef.current?.focus()}
          />
          <CustomInput
            ref={phoneInputRef}
            label="Phone Number"
            placeholder="e.g., 9876543210"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
            returnKeyType="next"
            maxLength={10}
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <CustomInput
            ref={passwordInputRef}
            label="Password"
            placeholder="Create a password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
          />
          <CustomInput
            ref={confirmPasswordInputRef}
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="lock-closed-outline"
            secureTextEntry
            returnKeyType={selectedType === 'admin' ? 'next' : 'done'}
            onSubmitEditing={() => (selectedType === 'admin' ? businessRegInputRef.current?.focus() : handleRegister())}
          />

          {selectedType === 'admin' && (
            <>
              <Text style={styles.verificationNote}>
                Owner verification: we need these details to confirm you're authorized to list this property. Your account stays pending until a Super Admin reviews them.
              </Text>
              <CustomInput
                ref={businessRegInputRef}
                label="Business Registration Number"
                placeholder="e.g., GST/Udyam/Trade License No."
                value={businessRegNumber}
                onChangeText={setBusinessRegNumber}
                icon="document-text-outline"
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => ownershipProofInputRef.current?.focus()}
              />
              <CustomInput
                ref={ownershipProofInputRef}
                label="Property Ownership Proof Reference"
                placeholder="e.g., Property tax receipt / rent agreement no."
                value={ownershipProofRef}
                onChangeText={setOwnershipProofRef}
                icon="home-outline"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </>
          )}

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={isRegistering}
            disabled={isRegistering}
            style={{ marginTop: 6, marginBottom: SPACING.lg }}
          />

          <TouchableOpacity
            style={styles.switchAuthRow}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            activeOpacity={0.8}
          >
            <Text style={styles.switchAuthText}>Already have an account?</Text>
            <Text style={styles.switchAuthLink}> Sign in</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By creating an account, you agree to our Terms & Privacy Policy.
          </Text>
          <View style={styles.keyboardSpacer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollView: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: COLORS.white,
  },
  topSection: {
    height: height * 0.32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  headerContent: { alignItems: 'center', zIndex: 2 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...SHADOWS.medium,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 30,
    fontWeight: FONT_WEIGHTS.extrabold,
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: FONT_WEIGHTS.medium,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    marginTop: -30,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  welcomeText: { ...TYPOGRAPHY.h1, color: COLORS.black, marginBottom: SPACING.lg },
  verificationNote: {
    fontSize: 12, color: COLORS.gray, backgroundColor: COLORS.backgroundGray,
    borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.md, lineHeight: 17,
  },
  typeSelector: {
    flexDirection: 'row', marginBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundGray, borderRadius: BORDER_RADIUS.xl, padding: 6,
  },
  typeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: BORDER_RADIUS.lg, backgroundColor: 'transparent',
  },
  typeButtonActive: { backgroundColor: COLORS.white, ...SHADOWS.small },
  typeEmoji: { fontSize: 16, marginRight: 8 },
  typeText: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.gray },
  typeTextActive: { color: COLORS.primary },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  switchAuthText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  switchAuthLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.xl,
  },
  keyboardSpacer: { height: 60 },
});
