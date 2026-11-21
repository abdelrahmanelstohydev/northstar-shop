const { getDb, ObjectId } = require('./mongodbConnection');

async function getAll() {
    const db = await getDb();
    return await db.collection('categories').find().toArray();
}

async function getById(id) {
    const db = await getDb();
    return await db.collection('categories').findOne({ _id: new ObjectId(id) });
}

async function create(name) {
    const db = await getDb();
    return await db.collection('categories').insertOne({ name: name });
}

async function update(id, name) {
    const db = await getDb();
    return await db.collection('categories').updateOne({ _id: new ObjectId(id) }, { $set: { name: name } });
}

async function remove(id) {
    const db = await getDb();
    return await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
