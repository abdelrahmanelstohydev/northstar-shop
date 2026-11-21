const { getDb, ObjectId } = require('./mongodbConnection');

async function create(orderData) {
    const db = await getDb();
    return await db.collection('orders').insertOne(orderData);
}

async function getAll(status) {
    const db = await getDb();
    const filter = status ? { status: status } : {};
    return await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
}

async function getById(id) {
    const db = await getDb();
    return await db.collection('orders').findOne({ _id: new ObjectId(id) });
}

async function updateStatus(id, status) {
    const db = await getDb();
    return await db.collection('orders').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: status } }
    );
}

async function addNote(id, note) {
    const db = await getDb();
    const currentNotes = {
        $switch: {
            branches: [
                { case: { $isArray: '$notes' }, then: '$notes' },
                {
                    case: { $and: [{ $eq: [{ $type: '$notes' }, 'string'] }, { $ne: ['$notes', ''] }] },
                    then: [{ text: '$notes', createdAt: '$createdAt' }],
                },
            ],
            default: [],
        },
    };
    return await db.collection('orders').updateOne(
        { _id: new ObjectId(id) },
        [{ $set: { notes: { $concatArrays: [currentNotes, [{ $literal: note }]] } } }]
    );
}

async function setStripeSession(id, sessionId, customerEmail) {
    const db = await getDb();
    return await db.collection('orders').updateOne(
        { _id: new ObjectId(id) },
        { $set: { 'stripeDetails.sessionId': sessionId, 'stripeDetails.customerEmail': customerEmail } }
    );
}

// The pending -> paid / failed switches are atomic: only one caller can win, so
// the redirect check, the webhook and the cleanup job never double-process an order.
async function markPaidIfPending(id, paymentIntentId) {
    const db = await getDb();
    const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(id), paymentStatus: 'pending' },
        { $set: { paymentStatus: 'paid', paidAt: new Date(), 'stripeDetails.paymentIntentId': paymentIntentId || null } }
    );
    return result.modifiedCount === 1;
}

async function markFailedIfPending(id) {
    const db = await getDb();
    const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(id), paymentStatus: 'pending' },
        { $set: { paymentStatus: 'failed' } }
    );
    return result.modifiedCount === 1;
}

async function getStalePendingOnline(olderThan) {
    const db = await getDb();
    return await db.collection('orders')
        .find({ paymentMethod: 'stripe', paymentStatus: 'pending', createdAt: { $lt: olderThan } })
        .toArray();
}

module.exports = {
    setStripeSession,
    markPaidIfPending,
    markFailedIfPending,
    getStalePendingOnline,
    create,
    getAll,
    getById,
    updateStatus,
    addNote,
};
