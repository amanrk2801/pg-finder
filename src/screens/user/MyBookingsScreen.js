import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
    Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import PGCard from '../../components/cards/PGCard';
import { EmptyState, ScreenHeader } from '../../components/common';

export default function MyBookingsScreen({ navigation }) {
    const { pgs, bookings, clearBookings, addDispute } = useData();
    const { user } = useAuth();

    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedPgId, setSelectedPgId] = useState(null);
    const [disputeTitle, setDisputeTitle] = useState('');
    const [disputeDesc, setDisputeDesc] = useState('');

    const userBookings = bookings.filter(b => b.userId === user?.id);

    const handleClearAll = () => {
        Alert.alert('Clear History', 'Are you sure you want to clear your booking history?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', onPress: () => clearBookings(user.id), style: 'destructive' },
        ]);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const openDisputeModal = (pgId) => {
        setSelectedPgId(pgId);
        setDisputeTitle('');
        setDisputeDesc('');
        setShowDisputeModal(true);
    };

    const handleSubmitDispute = async () => {
        if (!disputeTitle.trim() || !disputeDesc.trim()) {
            Alert.alert('Error', 'Please fill in both title and description.');
            return;
        }
        const success = await addDispute(user.id, selectedPgId, disputeTitle, disputeDesc);
        if (success) {
            setShowDisputeModal(false);
            Alert.alert('Ticket Raised', 'Our Super Admin team will review your issue shortly.');
        } else {
            Alert.alert('Error', 'Could not raise ticket. Try again.');
        }
    };

    const clearButton = userBookings.length > 0 ? (
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
    ) : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
            <ScreenHeader title="My Bookings" subtitle="Manage your stays" rightComponent={clearButton} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {userBookings.length === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="No bookings yet"
                        message="When you book a bed, it will appear here."
                    >
                        <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.exploreButtonText}>Explore Properties</Text>
                        </TouchableOpacity>
                    </EmptyState>
                ) : (
                    userBookings.map((booking) => {
                        const pg = pgs.find(p => p.id === booking.pgId);
                        if (!pg) return null;

                        return (
                            <View key={booking.id}>
                                <View style={styles.bookingHeader}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{booking.status}</Text>
                                    </View>
                                    <Text style={styles.dateText}>{formatDate(booking.date)}</Text>
                                </View>
                                <PGCard
                                    pg={pg}
                                    onPress={() => navigation.navigate(ROUTES.USER.PG_DETAILS, { pg })}
                                    showFavoriteIcon={false}
                                />
                                <TouchableOpacity
                                    style={styles.disputeButton}
                                    onPress={() => openDisputeModal(pg.id)}
                                >
                                    <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                                    <Text style={styles.disputeText}>Raise Issue / Dispute</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={showDisputeModal} animationType="slide" transparent>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={styles.modalTitle}>Raise a Ticket</Text>
                            <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.black} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSub}>
                            Describe the issue you faced during your stay or booking process.
                        </Text>
                        <Text style={styles.inputLabel}>Issue Title</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., Refund not received, Cleanliness issue"
                            value={disputeTitle}
                            onChangeText={setDisputeTitle}
                        />
                        <Text style={styles.inputLabel}>Detailed Description</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Please explain in detail..."
                            value={disputeDesc}
                            onChangeText={setDisputeDesc}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitDispute}>
                            <Text style={styles.submitBtnText}>Submit Ticket</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.white },
    clearButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.backgroundPink, borderRadius: BORDER_RADIUS.md,
    },
    content: { flex: 1, backgroundColor: COLORS.white, paddingTop: SPACING.lg },
    exploreButton: {
        backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg, marginTop: SPACING.xxl,
    },
    exploreButtonText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
    bookingHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginHorizontal: SPACING.xxl, marginBottom: SPACING.sm, marginTop: SPACING.md,
    },
    statusBadge: {
        backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm,
    },
    statusText: { color: '#4CAF50', fontSize: 10, fontWeight: FONT_WEIGHTS.bold, textTransform: 'uppercase' },
    dateText: { fontSize: 10, color: COLORS.gray },
    disputeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.backgroundPink, marginHorizontal: SPACING.xxl,
        paddingVertical: 10, borderRadius: BORDER_RADIUS.md, marginTop: 4, marginBottom: SPACING.lg,
    },
    disputeText: { color: COLORS.error, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.sm, marginLeft: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xxl,
    },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalTitle: { ...TYPOGRAPHY.h2, color: COLORS.black },
    modalSub: { fontSize: FONT_SIZES.sm, color: COLORS.gray, marginBottom: SPACING.lg },
    inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold, color: COLORS.black, marginBottom: 6 },
    textInput: {
        backgroundColor: COLORS.backgroundGray, borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.black,
        marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight,
    },
    textArea: { height: 100 },
    submitBtn: {
        backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
    },
    submitBtnText: { color: COLORS.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.md },
});
