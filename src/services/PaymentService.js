/**
 * PaymentService
 *
 * Provides a Razorpay-compatible payment interface.
 * Currently uses simulated checkout since Expo Go doesn't support native Razorpay SDK.
 *
 * To enable real Razorpay:
 * 1. Run: npx expo install react-native-razorpay
 * 2. Switch to expo-dev-client (npx expo run:android / npx expo run:ios)
 * 3. Set USE_REAL_RAZORPAY = true below
 * 4. Replace RAZORPAY_KEY with your live/test key from https://dashboard.razorpay.com
 */

const USE_REAL_RAZORPAY = false;
const RAZORPAY_KEY = 'rzp_test_XXXXXXXXXXXXXX';

function generateOrderId() {
    return 'order_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateTransactionId() {
    return 'pay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

async function openRealRazorpay(options) {
    try {
        const RazorpayCheckout = require('react-native-razorpay').default;
        const result = await RazorpayCheckout.open(options);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error?.description || error?.message || 'Payment failed' };
    }
}

async function openSimulatedCheckout(options) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    razorpay_payment_id: generateTransactionId(),
                    razorpay_order_id: options.order_id || generateOrderId(),
                    razorpay_signature: 'simulated_signature_' + Date.now(),
                },
            });
        }, 2000);
    });
}

const PaymentService = {
    /**
     * Create a Razorpay order (normally done on backend).
     * In production, replace this with an API call to your server.
     */
    async createOrder({ amount, currency = 'INR', receipt }) {
        return {
            id: generateOrderId(),
            amount: amount * 100, // Razorpay uses paise
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
        };
    },

    /**
     * Open checkout and process payment.
     * Returns { success, data?, error? }
     */
    async processPayment({ amount, pgName, userName, userEmail, userPhone, orderId, description }) {
        const options = {
            key: RAZORPAY_KEY,
            amount: amount * 100,
            currency: 'INR',
            name: pgName || 'PG Rent',
            description: description || 'Monthly Rent Payment',
            order_id: orderId,
            prefill: {
                name: userName || '',
                email: userEmail || '',
                contact: userPhone || '',
            },
            theme: { color: '#FF385C' },
        };

        if (USE_REAL_RAZORPAY) {
            return openRealRazorpay(options);
        }
        return openSimulatedCheckout(options);
    },

    isSimulated() {
        return !USE_REAL_RAZORPAY;
    },
};

export default PaymentService;
