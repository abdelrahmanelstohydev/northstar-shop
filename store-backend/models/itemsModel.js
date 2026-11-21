const { getDb, ObjectId } = require('./mongodbConnection');

async function getAll() {
    const db = await getDb();
    return await db.collection('items').find().toArray();
}

async function getByCategory(categoryId) {
    const db = await getDb();
    return await db.collection('items').find({ categoryId: new ObjectId(categoryId) }).toArray();
}

async function getById(id) {
    const db = await getDb();
    return await db.collection('items').findOne({ _id: new ObjectId(id) });
}

async function getByIds(ids) {
    const db = await getDb();
    const objectIds = ids.map((id) => new ObjectId(id));
    return await db.collection('items').find({ _id: { $in: objectIds } }).toArray();
}

async function create(itemData) {
    const db = await getDb();
    return await db.collection('items').insertOne({
        ...itemData,
        categoryId: new ObjectId(itemData.categoryId),
        createdAt: new Date(),
    });
}

async function update(id, itemData) {
    const db = await getDb();
    return await db.collection('items').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...itemData, categoryId: new ObjectId(itemData.categoryId) } }
    );
}

async function remove(id) {
    const db = await getDb();
    return await db.collection('items').deleteOne({ _id: new ObjectId(id) });
}

async function countByCategory(categoryId) {
    const db = await getDb();
    return await db.collection('items').countDocuments({ categoryId: new ObjectId(categoryId) });
}

async function decreaseQuantity(id, amount) {
    const db = await getDb();
    return await db.collection('items').updateOne(
        { _id: new ObjectId(id), quantity: { $gte: amount } },
        { $inc: { quantity: -amount } }
    );
}

async function increaseQuantity(id, amount) {
    const db = await getDb();
    return await db.collection('items').updateOne(
        { _id: new ObjectId(id) },
        { $inc: { quantity: amount } }
    );
}

module.exports = {
    getAll,
    getByCategory,
    getById,
    getByIds,
    create,
    update,
    remove,
    countByCategory,
    decreaseQuantity,
    increaseQuantity,
};
