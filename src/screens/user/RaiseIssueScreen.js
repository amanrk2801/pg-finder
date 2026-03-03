import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { ScreenHeader } from '../../components/common';

export default function RaiseIssueScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addDispute, pgs } = useData();

  const { pgId, bookingId } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const pg = pgs.find((p) => p.id === pgId);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in both title and description.');
      return;
    }
    if (!user?.id || !pgId) {
      Alert.alert('Error', 'Missing booking or PG information.');
      return;
    }

    const success = await addDispute(user.id, pgId, title, description);
    if (success) {
      Alert.alert('Ticket Raised', 'Our Super Admin team will review your issue shortly.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', 'Could not raise ticket. Try again.');
    }
  }, [title, description, user, pgId, addDispute, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader
          title="Raise Issue"
          subtitle={pg ? pg.name : 'Tell us what went wrong'}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <Text style={styles.helperText}>
            This ticket will be visible to the Super Admin only. Use Community for general posts and
            discussions.
          </Text>

          <Text style={styles.label}>Issue Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Refund not received, Cleanliness issue"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Detailed Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please explain in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.9}>
            <Text style={styles.submitText}>Submit Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.communityBtn}
            onPress={() => navigation.navigate(ROUTES.USER.COMMUNITY)}
            activeOpacity={0.8}
          >
            <Text style={styles.communityText}>Go to Community Board</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.black,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.backgroundGray,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textArea: {
    height: 120,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  submitText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHTS.bold,
    fontSize: FONT_SIZES.md,
  },
  communityBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  communityText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

