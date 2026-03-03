import { generateId } from '../utils/id';

const USE_REAL_RAZORPAY = process.env.EXPO_PUBLIC_USE_REAL_RAZORPAY === 'true';
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY || '';
const ORDERS_API_BASE_URL = process.env.EXPO_PUBLIC_PAYMENTS_API_BASE_URL || '';

function generateOrderId() {
    return generateId('order');
}

function generateTransactionId() {
    return generateId('pay');
}

function validateAmount(amount) {
    return Number.isFinite(amount) && amount > 0;
}

async function openRealRazorpay(options) {
    try {
        if (!RAZORPAY_KEY || !ORDERS_API_BASE_URL) {
            return { success: false, error: 'Missing payment configuration for real gateway mode.' };
        }
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
                    razorpay_signature: `simulated_signature_${generateId('sig')}`,
                },
            });
        }, 2000);
    });
}

const PaymentService = {
    async createOrder({ amount, currency = 'INR', receipt }) {
        if (!validateAmount(amount)) {
            throw new Error('Invalid payment amount.');
        }

        if (USE_REAL_RAZORPAY) {
            return {
                id: generateOrderId(),
                amount: Math.round(amount * 100),
                currency,
                receipt: receipt || generateId('rcpt'),
                source: 'backend_required',
            };
        }

        return {
            id: generateOrderId(),
            amount: Math.round(amount * 100),
            currency,
            receipt: receipt || generateId('rcpt'),
        };
    },

    async processPayment({ amount, pgName, userName, userEmail, userPhone, orderId, description }) {
        if (!validateAmount(amount)) {
            return { success: false, error: 'Invalid payment amount.' };
        }

        const options = {
            key: RAZORPAY_KEY,
            amount: Math.round(amount * 100),
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
