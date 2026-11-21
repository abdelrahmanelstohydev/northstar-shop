const ordersModel = require('../models/ordersModel');
const itemsModel = require('../models/itemsModel');
const { isValidId } = require('../utils/validators');
const { toLocalized, localizeOrder } = require('../utils/i18n');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');
const stripe = require('../services/stripeService');
const payments = require('../services/orderPayments');

const STATUSES = ['opened', 'closed'];

function readOrderBody(body) {
    const { customer, items, lang, paymentMethod } = body || {};

    const method = paymentMethod === undefined ? 'cod' : paymentMethod;
    if (method !== 'cod' && method !== 'stripe') {
        return { error: 'Payment method must be cod or stripe' };
    }
    if (method === 'stripe' && !stripe.isEnabled()) {
        return { error: 'Online payment is not available' };
    }

    if (!customer || typeof customer !== 'object') {
        return { error: 'Customer details are required' };
    }

    const { name, phone, address, email } = customer;
    if (typeof name !== 'string' || !name.trim()) {
        return { error: 'Customer name is required' };
    }
    if (typeof phone !== 'string' || !/^[0-9+\-\s]{7,20}$/.test(phone.trim())) {
        return { error: 'A valid phone number is required' };
    }
    if (typeof address !== 'string' || !address.trim()) {
        return { error: 'Customer address is required' };
    }
    if (typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return { error: 'A valid email address is required' };
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
        return { error: 'Order must contain between 1 and 50 items' };
    }

    const wanted = new Map();
    for (const line of items) {
        if (!line || !isValidId(line.itemId)) {
            return { error: 'Invalid item id' };
        }
        const quantity = Number(line.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
            return { error: 'Quantity must be a positive whole number' };
        }
        wanted.set(line.itemId, (wanted.get(line.itemId) || 0) + quantity);
    }

    return {
        data: {
            customer: { name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() },
            lang: lang === 'en' ? 'en' : 'ar',
            paymentMethod: method,
            wanted,
        },
    };
}

function withNotesList(rawOrder) {
    const order = localizeOrder(rawOrder);
    if (Array.isArray(order.notes)) {
        return order;
    }
    const notes = typeof order.notes === 'string' && order.notes.trim()
        ? [{ text: order.notes, createdAt: order.createdAt }]
        : [];
    return { ...order, notes };
}

async function rollbackStock(lines) {
    for (const line of lines) {
        await itemsModel.increaseQuantity(line.itemId.toString(), line.quantity);
    }
}

async function createOrder(req, res) {
    const decreased = [];

    try {
        const { data, error } = readOrderBody(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const orderItems = [];
        let total = 0;

        for (const [itemId, quantity] of data.wanted) {
            const item = await itemsModel.getById(itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            if (item.quantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock for ' + toLocalized(item.name).en, itemName: toLocalized(item.name) });
            }

            orderItems.push({ itemId: item._id, name: toLocalized(item.name), price: item.price, quantity, image: item.image || '' });
            total += item.price * quantity;
        }

        for (const line of orderItems) {
            const result = await itemsModel.decreaseQuantity(line.itemId.toString(), line.quantity);
            if (result.matchedCount === 0) {
                await rollbackStock(decreased);
                return res.status(400).json({ message: 'Not enough stock for ' + line.name.en, itemName: line.name });
            }
            decreased.push(line);
        }

        total = Math.round(total * 100) / 100;
        const order = {
            customer: data.customer,
            items: orderItems,
            total: total,
            status: 'opened',
            notes: [],
            lang: data.lang,
            paymentMethod: data.paymentMethod,
            paymentStatus: 'pending',
            createdAt: new Date(),
        };

        if (data.paymentMethod === 'stripe') {
            order.payToken = payments.newPayToken();
            order.stripeDetails = { sessionId: null, paymentIntentId: null, customerEmail: data.customer.email };
        }

        const result = await ordersModel.create(order);
        const saved = { ...order, _id: result.insertedId };

        if (data.paymentMethod === 'stripe') {
            // Stock stays reserved while the customer pays. It is released if the payment fails or is abandoned.
            try {
                const session = await stripe.createCheckoutSession({
                    orderId: saved._id,
                    token: order.payToken,
                    items: orderItems.map((line) => ({ name: line.name[data.lang], price: line.price, quantity: line.quantity })),
                    customerEmail: data.customer.email,
                    lang: data.lang,
                });
                await ordersModel.setStripeSession(saved._id.toString(), session.id, data.customer.email);
                return res.status(201).json({ orderId: saved._id, total, checkoutUrl: session.url, token: order.payToken });
            } catch (stripeError) {
                console.log(stripeError.message);
                await payments.settleFailed(saved);
                return res.status(502).json({ message: 'Could not start the online payment. Please try again or pay on delivery.' });
            }
        }

        // Cash on delivery. Fire and forget: the customer gets the order response immediately.
        sendOrderConfirmationEmail(data.customer.email, saved, data.lang);

        res.status(201).json({ orderId: result.insertedId, total });
    } catch (error) {
        console.log(error.message);
        try {
            await rollbackStock(decreased);
        } catch (rollbackError) {
            console.log('Rollback failed:', rollbackError.message);
        }
        res.status(500).json({ message: 'Server error' });
    }
}

async function getOrders(req, res) {
    try {
        const { status } = req.query;
        if (status && !STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Status must be opened or closed' });
        }

        const orders = await ordersModel.getAll(status);
        res.json(orders.map(withNotesList));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getOrder(req, res) {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }

        const order = await ordersModel.getById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(withNotesList(order));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function setOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Status must be opened or closed' });
        }

        const result = await ordersModel.updateStatus(id, status);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Updated' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function addOrderNote(req, res) {
    try {
        const { id } = req.params;
        const { text } = req.body || {};

        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid order id' });
        }
        if (typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: 'Note text is required' });
        }
        if (text.trim().length > 1000) {
            return res.status(400).json({ message: 'Note must be 1000 characters or less' });
        }

        const note = { text: text.trim(), createdAt: new Date() };
        const result = await ordersModel.addNote(id, note);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(201).json(note);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    setOrderStatus,
    addOrderNote,
};
