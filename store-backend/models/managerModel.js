const { getDb } = require('./mongodbConnection');

async function findByUsername(userName) {
    const db = await getDb();
    return await db.collection('manager').findOne({ username: userName });
}

module.exports = {
    findByUsername,
};
