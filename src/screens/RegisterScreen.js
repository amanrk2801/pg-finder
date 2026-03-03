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
const USE_BACKEND = process.env.EXPO_PUBLIC_USE_BACKEND === 'true';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();

  const scrollViewRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  const isValidEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  const handleRegister = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
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

    Keyboard.dismiss();

    if (USE_BACKEND) {
      // In backend mode, registration should hit the API via login/register flow there.
      const success = await login(normalizedEmail, password, 'user');
      if (!success) {
        Alert.alert('Registration failed', 'Unable to create your account. Please try again.');
      }
      return;
    }

    // Local/demo mode: reuse login(type='user') which auto-creates users in AsyncStorage.
    const success = await login(normalizedEmail, password, 'user');
    if (!success) {
      Alert.alert('Registration failed', 'Unable to create your account. Please try again.');
    }
  }, [email, password, confirmPassword, login]);

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
          <Text style={styles.subtitleText}>Sign up as a tenant</Text>

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
            placeholder="e.g., +91 9876543210"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <CustomInput
            ref={passwordInputRef}
            label="Password"
            placeholder="Create a password"
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
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
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
  welcomeText: { ...TYPOGRAPHY.h1, color: COLORS.black, marginBottom: 4 },
  subtitleText: { fontSize: FONT_SIZES.md, color: COLORS.gray, marginBottom: SPACING.xxl },
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

