// Stripe Hosted Checkout using only Node's built-in fetch and crypto (no SDK).
// Card data never touches this server: the customer pays on Stripe's page.
const crypto = require('crypto');

const API = 'https://api.stripe.com/v1';

function config() {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    return {
        enabled: String(process.env.ENABLE_STRIPE).toLowerCase() === 'true',
        secretKey,
        hasKey: /^sk_(test|live)_/.test(secretKey),
        currency: (process.env.STRIPE_CURRENCY || 'egp').toLowerCase(),
        frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/$/, ''),
        production: process.env.NODE_ENV === 'production',
    };
}

// Without a secret key (development only) a simulated gateway is used so the whole flow can be tried.
function isMock() {
    const c = config();
    return c.enabled && !c.hasKey && !c.production;
}

function isEnabled() {
    const c = config();
    return c.enabled && (c.hasKey || isMock());
}

// Stripe wants form-encoded bodies with square-bracket notation: line_items[0][price_data][currency]=egp
function buildStripeFormBody(data, prefix = '', params = new URLSearchParams()) {
    for (const [key, value] of Object.entries(data)) {
        if (value === undefined || value === null) continue;
        const name = prefix ? prefix + '[' + key + ']' : key;
        if (Array.isArray(value)) {
            value.forEach((entry, index) => {
                if (entry !== null && typeof entry === 'object') {
                    buildStripeFormBody(entry, name + '[' + index + ']', params);
                } else {
                    params.append(name + '[' + index + ']', String(entry));
                }
            });
        } else if (typeof value === 'object') {
            buildStripeFormBody(value, name, params);
        } else {
            params.append(name, String(value));
        }
    }
    return params;
}

async function stripeRequest(method, path, body) {
    const c = config();
    const response = await fetch(API + path, {
        method,
        headers: {
            Authorization: 'Bearer ' + c.secretKey,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body ? buildStripeFormBody(body).toString() : undefined,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error('Stripe: ' + (json.error?.message || 'request failed (' + response.status + ')'));
    }
    return json;
}

// items: [{ name, price, quantity }]  (price in normal units, e.g. 99.99)
async function createCheckoutSession({ orderId, token, items, customerEmail, lang }) {
    const c = config();
    const id = String(orderId);
    const base = c.frontendUrl + '/checkout?orderId=' + id + '&token=' + token;
    const successUrl = base + '&session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = base + '&cancelled=true';

    if (isMock()) {
        const sessionId = 'cs_test_mock_' + id + '_' + Date.now();
        return { id: sessionId, url: successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId) };
    }

    const session = await stripeRequest('POST', '/checkout/sessions', {
        mode: 'payment',
        client_reference_id: id,
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Stripe's minimum is 30 minutes; unpaid orders are released afterwards.
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        locale: lang === 'en' ? 'en' : 'auto',
        metadata: { orderId: id },
        line_items: items.map((item) => ({
            quantity: item.quantity,
            price_data: {
                currency: c.currency,
                unit_amount: Math.round(item.price * 100),
                product_data: { name: item.name },
            },
        })),
    });
    return { id: session.id, url: session.url };
}

// options.assumePaid: only used by the development mock gateway
async function retrieveCheckoutSession(sessionId, options = {}) {
    if (isMock()) {
        return options.assumePaid
            ? { id: sessionId, payment_status: 'paid', status: 'complete', payment_intent: 'pi_test_mock' }
            : { id: sessionId, payment_status: 'unpaid', status: 'expired' };
    }
    return stripeRequest('GET', '/checkout/sessions/' + encodeURIComponent(sessionId));
}

async function expireCheckoutSession(sessionId) {
    if (isMock()) return;
    try {
        await stripeRequest('POST', '/checkout/sessions/' + encodeURIComponent(sessionId) + '/expire', {});
    } catch (error) {
        // already expired or completed - nothing to do
    }
}

// Header looks like: t=1700000000,v1=<hex>,v1=<hex>
function verifyWebhookSignature(rawBody, header, secret, toleranceSeconds = 300) {
    if (!Buffer.isBuffer(rawBody) || typeof header !== 'string' || !secret) return false;

    let timestamp = '';
    const signatures = [];
    for (const part of header.split(',')) {
        const [key, value] = part.split('=');
        if (key === 't') timestamp = value;
        if (key === 'v1' && value) signatures.push(value);
    }
    if (!timestamp || signatures.length === 0) return false;
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;

    const expected = crypto.createHmac('sha256', secret).update(timestamp + '.' + rawBody.toString('utf8')).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    return signatures.some((signature) => {
        const candidate = Buffer.from(signature, 'utf8');
        return candidate.length === expectedBuffer.length && crypto.timingSafeEqual(candidate, expectedBuffer);
    });
}

module.exports = {
    isEnabled,
    isMock,
    config,
    buildStripeFormBody,
    createCheckoutSession,
    retrieveCheckoutSession,
    expireCheckoutSession,
    verifyWebhookSignature,
};
