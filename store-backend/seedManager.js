
require('dotenv').config();
const bcrypt = require('bcrypt');
const { getDb, closeDb } = require('./models/mongodbConnection');

async function seedManager() {
    const [username, password] = process.argv.slice(2);

    if (!username || !password) {
        console.log('Usage: node seedManager.js <username> <password>');
        return;
    }

    const db = await getDb();
    const manager = db.collection('manager');

    const count = await manager.countDocuments();
    if (count > 0) {
        console.log('A manager already exists. Nothing was added.');
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await manager.insertOne({
        username: username,
        password: hashedPassword,
        createdAt: new Date(),
    });

    console.log('Manager created:', username);
}

seedManager()
    .catch((error) => console.log('Seed error:', error.message))
    .finally(() => closeDb());
