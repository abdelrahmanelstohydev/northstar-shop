const { MongoClient, ObjectId } = require('mongodb');

const mongoConnection = process.env.MONGODB_CONNECTION;
const client = new MongoClient(mongoConnection);

async function getDb() {
    await client.connect();
    return client.db(process.env.DB_NAME);
}

async function closeDb() {
    await client.close();
}

module.exports = {
    getDb,
    closeDb,
    ObjectId,
};
