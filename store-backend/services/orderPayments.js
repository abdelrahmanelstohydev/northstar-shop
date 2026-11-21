// Moves online orders between pending -> paid / failed.
// Used by the return-URL check, the Stripe webhook and the cleanup job.
const crypto = require('crypto');
const ordersModel = require('../models/ordersModel');
const itemsModel = require('../models/itemsModel');
const stripe = require('./stripeService');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');

const STALE_AFTER_MS = 35 * 60 * 1000;

function newPayToken() {
    return crypto.randomBytes(16).toString('hex');
}

function sameToken(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function releaseStock(order) {
    for (const line of order.items || []) {
        await itemsModel.increaseQuantity(line.itemId.toString(), line.quantity);
    }
}

async function settlePaid(order, session) {
    const won = await ordersModel.markPaidIfPending(order._id, session.payment_intent);
    if (won) {
        // online orders get their confirmation email only once the money is in
        sendOrderConfirmationEmail(order.customer.email, { ...order, paymentStatus: 'paid' }, order.lang);
    }
    return won;
}

async function settleFailed(order) {
    const won = await ordersModel.markFailedIfPending(order._id);
    if (won) {
        await releaseStock(order);
    }
    return won;
}

// Asks Stripe what really happened to a pending order and updates it. Returns the fresh order.
async function syncWithStripe(order, options = {}) {
    if (order.paymentMethod !== 'stripe' || order.paymentStatus !== 'pending' || !order.stripeDetails?.sessionId) {
        return order;
    }

    const session = await stripe.retrieveCheckoutSession(order.stripeDetails.sessionId, options);
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        await settlePaid(order, session);
    } else if (session.status === 'expired') {
        await settleFailed(order);
    }
    return await ordersModel.getById(order._id.toString());
}

// Releases the stock of online orders that were never paid (e.g. the customer closed the Stripe page).
async function cleanUpStaleOrders() {
    const stale = await ordersModel.getStalePendingOnline(new Date(Date.now() - STALE_AFTER_MS));
    for (const order of stale) {
        try {
            const fresh = await syncWithStripe(order);
            if (fresh.paymentStatus === 'pending') {
                await stripe.expireCheckoutSession(order.stripeDetails?.sessionId);
                await settleFailed(order);
            }
        } catch (error) {
            console.log('Stale order cleanup failed:', error.message);
        }
    }
}

module.exports = { newPayToken, sameToken, settlePaid, settleFailed, syncWithStripe, cleanUpStaleOrders };
