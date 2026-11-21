// One-time (safe to re-run) migration: gives every existing document an { ar, en } value.
//   categories.name, items.name, items.description, orders.items[].name
// Known sample data gets a real Arabic translation. Anything else (items you added
// yourself) gets its current text copied into both languages - edit it in the admin
// panel to add the real Arabic text.
require('dotenv').config();
const { getDb, closeDb } = require('./models/mongodbConnection');
const translations = require('./seedTranslations');

const isLocalized = (value) => value && typeof value === 'object' && typeof value.en === 'string';

function categoryName(value) {
    if (isLocalized(value)) return value;
    const text = String(value ?? '');
    return { ar: translations.categories[text] || text, en: text };
}

function itemName(value) {
    if (isLocalized(value)) return value;
    const text = String(value ?? '');
    return { ar: translations.items[text]?.name || text, en: text };
}

function itemDescription(value, englishName) {
    if (isLocalized(value)) return value;
    const text = String(value ?? '');
    const known = translations.items[englishName];
    // use the built-in Arabic text only if the description is still the original sample text
    return { ar: known && known.descriptionEn === text ? known.description : text, en: text };
}

async function migrate() {
    const db = await getDb();
    let categoriesDone = 0;
    let itemsDone = 0;
    let ordersDone = 0;

    for (const category of await db.collection('categories').find().toArray()) {
        if (isLocalized(category.name)) continue;
        await db.collection('categories').updateOne({ _id: category._id }, { $set: { name: categoryName(category.name) } });
        categoriesDone++;
    }

    for (const item of await db.collection('items').find().toArray()) {
        if (isLocalized(item.name) && isLocalized(item.description)) continue;
        const englishName = isLocalized(item.name) ? item.name.en : String(item.name ?? '');
        await db.collection('items').updateOne(
            { _id: item._id },
            { $set: { name: itemName(item.name), description: itemDescription(item.description, englishName) } }
        );
        itemsDone++;
    }

    for (const order of await db.collection('orders').find().toArray()) {
        const lines = Array.isArray(order.items) ? order.items : [];
        if (lines.every((line) => isLocalized(line.name))) continue;
        const items = lines.map((line) => ({ ...line, name: itemName(line.name) }));
        await db.collection('orders').updateOne({ _id: order._id }, { $set: { items } });
        ordersDone++;
    }

    console.log('Migrated categories: ' + categoriesDone + ', items: ' + itemsDone + ', orders: ' + ordersDone);
}

migrate()
    .catch((error) => console.log('Migration error:', error.message))
    .finally(() => closeDb());
