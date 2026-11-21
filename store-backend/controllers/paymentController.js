const ordersModel = require('../models/ordersModel');
const stripe = require('../services/stripeService');
const payments = require('../services/orderPayments');
const { isValidId } = require('../utils/validators');

async function findOrderByToken(id, token) {
    if (!isValidId(id) || typeof token !== 'string') return null;
    const order = await ordersModel.getById(id);
    if (!order || !order.payToken || !payments.sameToken(order.payToken, token)) return null;
    return order;
}

function toStatus(order) {
    return {
        orderId: order._id,
        paymentMethod: order.paymentMethod || 'cod',
        paymentStatus: order.paymentStatus || 'pending',
        total: order.total,
    };
}

// Which payment options the checkout page can show.
function getPaymentMethods(req, res) {
    const methods = ['cod'];
    if (stripe.isEnabled()) methods.push('stripe');
    res.json({ methods, stripeTestMode: stripe.isMock() });
}

// Called by the frontend when the customer comes back from Stripe.
async function getPaymentStatus(req, res) {
    try {
        const order = await findOrderByToken(req.params.id, req.query.token);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const fresh = await payments.syncWithStripe(order, { assumePaid: true });
        res.json(toStatus(fresh));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// The customer pressed "back" on the Stripe page: release the stock and keep their cart.
async function cancelPayment(req, res) {
    try {
        const order = await findOrderByToken(req.params.id, (req.body || {}).token);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // never cancel something that was actually paid
        let fresh = await payments.syncWithStripe(order);
        if (fresh.paymentMethod === 'stripe' && fresh.paymentStatus === 'pending') {
            await stripe.expireCheckoutSession(fresh.stripeDetails?.sessionId);
            await payments.settleFailed(fresh);
            fresh = await ordersModel.getById(order._id.toString());
        }
        res.json(toStatus(fresh));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// Stripe calls this by itself, so the order is fulfilled even if the customer closes the browser.
async function stripeWebhook(req, res) {
    try {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripe.isEnabled() || !secret) {
            return res.status(503).json({ message: 'Webhook is not configured' });
        }
        if (!stripe.verifyWebhookSignature(req.body, req.headers['stripe-signature'], secret)) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        let event;
        try {
            event = JSON.parse(req.body.toString('utf8'));
        } catch {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const session = event.data && event.data.object;
        if (session && isValidId(session.client_reference_id)) {
            const order = await ordersModel.getById(session.client_reference_id);
            if (order && order.stripeDetails && order.stripeDetails.sessionId === session.id) {
                if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
                    if (session.payment_status === 'paid') {
                        const won = await payments.settlePaid(order, session);
                        if (!won && order.paymentStatus === 'failed') {
                            console.log('WARNING: order ' + order._id + ' was paid after it was cancelled - refund or fix it in the Stripe dashboard');
                        }
                    }
                } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
                    await payments.settleFailed(order);
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getPaymentMethods, getPaymentStatus, cancelPayment, stripeWebhook };
