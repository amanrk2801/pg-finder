import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar, ActivityIndicator, Modal, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SHADOWS } from '../../constants/theme';
import { useAuth, useData } from '../../hooks';
import { ROUTES } from '../../navigation/routes';
import PaymentService from '../../services/PaymentService';

const RZ_BLUE = '#0247E6';
const RZ_LIGHT_BLUE = '#F0F5FF';
const RZ_TEXT_MAIN = '#333333';
const RZ_TEXT_MUTED = '#888888';
const RZ_GREEN = '#10B981';

export default function PaymentScreen({ route, navigation }) {
    const { pg, booking } = route.params;
    const { user } = useAuth();
    const { addBooking, addPayment, updateBooking, updatePg, settings } = useData();

    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [paymentState, setPaymentState] = useState('idle');

    const [scaleAnim] = useState(new Animated.Value(0.5));
    const [opacityAnim] = useState(new Animated.Value(0));

    const isRentPayment = !!booking;
    const platformFee = pg.rent * ((settings?.platformFee || 5) / 100);
    const total = isRentPayment ? (booking.monthlyRent || pg.rent) : (pg.rent + platformFee);

    const startSuccessAnimation = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const handlePayment = async () => {
        setPaymentState('processing');

        try {
            const order = await PaymentService.createOrder({
                amount: total,
                receipt: `rent_${pg.id}_${Date.now()}`,
            });

            const result = await PaymentService.processPayment({
                amount: total,
                pgName: pg.name,
                userName: user?.name,
                userEmail: user?.email,
                userPhone: user?.phone,
                orderId: order.id,
                description: isRentPayment ? 'Monthly Rent Payment' : 'PG Booking & First Month Rent',
            });

            if (result.success) {
                const now = new Date();

                if (isRentPayment) {
                    await addPayment({
                        bookingId: booking.id,
                        userId: user.id,
                        pgId: pg.id,
                        amount: total,
                        method: selectedMethod,
                        transactionId: result.data.razorpay_payment_id,
                        status: 'paid',
                        month: now.getMonth() + 1,
                        year: now.getFullYear(),
                    });
                    const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    await updateBooking(booking.id, { nextDueDate: nextDue.toISOString() });
                } else {
                    const bookingSuccess = await addBooking(user.id, pg.id, {
                        monthlyRent: pg.rent,
                        paymentMethod: selectedMethod,
                    });

                    if (bookingSuccess) {
                        const newVacantBeds = pg.vacantBeds > 0 ? pg.vacantBeds - 1 : 0;
                        const newOccupiedRooms = pg.occupiedRooms + (newVacantBeds % 3 === 0 ? 1 : 0);
                        await updatePg(pg.id, { vacantBeds: newVacantBeds, occupiedRooms: newOccupiedRooms });

                        await addPayment({
                            bookingId: 'initial',
                            userId: user.id,
                            pgId: pg.id,
                            amount: total,
                            method: selectedMethod,
                            transactionId: result.data.razorpay_payment_id,
                            status: 'paid',
                            month: now.getMonth() + 1,
                            year: now.getFullYear(),
                        });
                    }
                }

                setPaymentState('success');
                startSuccessAnimation();

                setTimeout(() => {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: ROUTES.USER.TABS, params: { screen: ROUTES.USER.MY_PG } }],
                        }),
                    );
                }, 2000);
            } else {
                setPaymentState('idle');
                Alert.alert('Payment Failed', result.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setPaymentState('idle');
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={RZ_BLUE} />

            <Modal visible={paymentState === 'processing' || paymentState === 'success'} animationType="fade" transparent>
                <View style={paymentState === 'success' ? styles.phonePeSuccessBg : styles.processingBg}>
                    <StatusBar barStyle="light-content" backgroundColor={paymentState === 'success' ? RZ_GREEN : 'rgba(0,0,0,0.6)'} />

                    {paymentState === 'processing' ? (
                        <View style={styles.processingCard}>
                            <ActivityIndicator size="large" color={RZ_BLUE} />
                            <Text style={styles.processingText}>Processing Payment...</Text>
                            <Text style={styles.doNotRefreshText}>Please wait while we securely process your payment</Text>
                            <View style={[styles.secureBottom, { position: 'relative', marginTop: 30, bottom: 0 }]}>
                                <Ionicons name="shield-checkmark" size={14} color={RZ_TEXT_MUTED} />
                                <Text style={styles.securedByText}> 100% Secure Payment</Text>
                            </View>
                        </View>
                    ) : (
                        <Animated.View style={[styles.successContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
                            <View style={styles.phonePeCheckCircle}>
                                <Ionicons name="checkmark" size={60} color={RZ_GREEN} />
                            </View>
                            <Text style={styles.phonePeSuccessText}>Payment Successful!</Text>
                            <Text style={styles.phonePeAmountText}>₹{total.toLocaleString()}</Text>
                            <Text style={styles.phonePePaidToText}>Paid to {pg.name}</Text>
                        </Animated.View>
                    )}
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.rzHeader}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.testModeBadge}>
                        <Text style={styles.testModeText}>
                            {PaymentService.isSimulated() ? 'TEST MODE' : 'LIVE'}
                        </Text>
                    </View>
                </View>

                <View style={styles.merchantDetails}>
                    <View style={styles.merchantAvatar}>
                        <Text style={styles.merchantAvatarText}>{pg.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.merchantInfo}>
                        <Text style={styles.merchantName}>{pg.name}</Text>
                        <Text style={styles.merchantOrder}>
                            {isRentPayment ? 'Monthly Rent' : 'Booking + First Month'}
                        </Text>
                    </View>
                    <Text style={styles.totalAmountHeader}>₹{total.toLocaleString()}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Amount Breakdown */}
                <View style={styles.breakdownCard}>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Base Rent</Text>
                        <Text style={styles.breakdownValue}>₹{pg.rent.toLocaleString()}</Text>
                    </View>
                    {!isRentPayment && (
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Platform Fee ({settings?.platformFee || 5}%)</Text>
                            <Text style={styles.breakdownValue}>₹{platformFee.toLocaleString()}</Text>
                        </View>
                    )}
                    <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                        <Text style={styles.breakdownTotalLabel}>Total</Text>
                        <Text style={styles.breakdownTotalValue}>₹{total.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Contact Banner */}
                <View style={styles.contactBanner}>
                    <Text style={styles.bannerText}>+91 {user?.phone || '9876543210'}</Text>
                    <Text style={styles.bannerDivider}>|</Text>
                    <Text style={styles.bannerText}>{user?.email || 'user@example.com'}</Text>
                </View>

                <Text style={styles.sectionTitle}>PREFERRED PAYMENT METHOD</Text>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardActive]}
                    onPress={() => setSelectedMethod('upi')}
                    activeOpacity={0.8}
                >
                    <View style={styles.methodLeft}>
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="google-circles-extended" size={24} color={RZ_BLUE} />
                        </View>
                        <View>
                            <Text style={styles.methodTitle}>UPI - GPay, PhonePe</Text>
                            <Text style={styles.methodSubtitle}>Google Pay, PhonePe, Paytm & more</Text>
                        </View>
                    </View>
                    <View style={styles.radioOutline}>
                        {selectedMethod === 'upi' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>CARDS, UPI & MORE</Text>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardActive]}
                    onPress={() => setSelectedMethod('card')}
                    activeOpacity={0.8}
                >
                    <View style={styles.methodLeft}>
                        <View style={styles.iconBox}>
                            <Ionicons name="card-outline" size={24} color={RZ_TEXT_MAIN} />
                        </View>
                        <View>
                            <Text style={styles.methodTitle}>Card</Text>
                            <Text style={styles.methodSubtitle}>Visa, MasterCard, RuPay & More</Text>
                        </View>
                    </View>
                    <View style={styles.radioOutline}>
                        {selectedMethod === 'card' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.methodCard, selectedMethod === 'netbanking' && styles.methodCardActive]}
                    onPress={() => setSelectedMethod('netbanking')}
                    activeOpacity={0.8}
                >
                    <View style={styles.methodLeft}>
                        <View style={styles.iconBox}>
                            <Ionicons name="business-outline" size={24} color={RZ_TEXT_MAIN} />
                        </View>
                        <View>
                            <Text style={styles.methodTitle}>Netbanking</Text>
                            <Text style={styles.methodSubtitle}>All Indian banks</Text>
                        </View>
                    </View>
                    <View style={styles.radioOutline}>
                        {selectedMethod === 'netbanking' && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.payFooter}>
                <TouchableOpacity style={styles.payButtonMain} activeOpacity={0.9} onPress={handlePayment}>
                    <Text style={styles.payButtonText}>Pay ₹{total.toLocaleString()}</Text>
                    <Ionicons name="chevron-forward" size={18} color="white" />
                </TouchableOpacity>
                <View style={styles.secureFooterBranding}>
                    <Ionicons name="lock-closed" size={10} color={RZ_TEXT_MUTED} />
                    <Text style={styles.securedByText}> Secured by Razorpay</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FB' },
    rzHeader: { backgroundColor: RZ_BLUE, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    backButton: { padding: 4 },
    testModeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    testModeText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    merchantDetails: { flexDirection: 'row', alignItems: 'center' },
    merchantAvatar: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    merchantAvatarText: { fontSize: 24, fontWeight: 'bold', color: RZ_BLUE },
    merchantInfo: { flex: 1 },
    merchantName: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 4 },
    merchantOrder: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    totalAmountHeader: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    scrollContent: { flex: 1 },

    breakdownCard: { backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16, ...SHADOWS.small },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    breakdownLabel: { fontSize: 14, color: RZ_TEXT_MUTED },
    breakdownValue: { fontSize: 14, color: RZ_TEXT_MAIN, fontWeight: '500' },
    breakdownTotal: { borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 8, paddingTop: 12 },
    breakdownTotalLabel: { fontSize: 16, fontWeight: 'bold', color: RZ_TEXT_MAIN },
    breakdownTotalValue: { fontSize: 16, fontWeight: 'bold', color: RZ_BLUE },

    contactBanner: { backgroundColor: RZ_LIGHT_BLUE, padding: 16, flexDirection: 'row', alignItems: 'center' },
    bannerText: { color: RZ_TEXT_MAIN, fontSize: 13 },
    bannerDivider: { color: RZ_TEXT_MUTED, marginHorizontal: 8 },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: RZ_TEXT_MUTED, marginTop: 24, marginBottom: 12, marginHorizontal: 20, letterSpacing: 0.5 },
    methodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    methodCardActive: { backgroundColor: '#FAFAFA' },
    methodLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EFEFEF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    methodTitle: { fontSize: 15, fontWeight: '600', color: RZ_TEXT_MAIN, marginBottom: 2 },
    methodSubtitle: { fontSize: 12, color: RZ_TEXT_MUTED },
    radioOutline: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: RZ_BLUE },
    payFooter: { padding: 20, paddingBottom: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0', alignItems: 'center' },
    payButtonMain: { backgroundColor: RZ_BLUE, width: '100%', height: 50, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...SHADOWS.medium },
    payButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold', marginRight: 4 },
    secureFooterBranding: { flexDirection: 'row', alignItems: 'center' },
    securedByText: { color: RZ_TEXT_MUTED, fontSize: 12, fontWeight: '500' },
    processingBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    processingCard: { backgroundColor: 'white', padding: 30, borderRadius: 16, alignItems: 'center', width: '100%', ...SHADOWS.large },
    processingText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: RZ_TEXT_MAIN },
    doNotRefreshText: { marginTop: 8, fontSize: 13, color: RZ_TEXT_MUTED, textAlign: 'center' },
    secureBottom: { flexDirection: 'row', alignItems: 'center' },
    phonePeSuccessBg: { flex: 1, backgroundColor: RZ_GREEN, justifyContent: 'center', alignItems: 'center' },
    successContainer: { alignItems: 'center', justifyContent: 'center' },
    phonePeCheckCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 30, ...SHADOWS.large },
    phonePeSuccessText: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    phonePeAmountText: { fontSize: 40, fontWeight: '900', color: 'white', marginBottom: 10, ...SHADOWS.small },
    phonePePaidToText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' },
});
