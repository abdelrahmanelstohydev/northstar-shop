require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getDb, closeDb } = require('./models/mongodbConnection');
const translations = require('./seedTranslations');

const imagesDir = path.join(__dirname, 'seed-images');
const uploadsDir = path.join(__dirname, 'public', 'img', 'uploads');

const categories = ['Shoes', 'Bags', 'Accessories', 'Electronics'];

const items = [
    {
        name: 'Running Shoes',
        category: 'Shoes',
        price: 1250,
        quantity: 25,
        image: 'running-shoes.png',
        description: 'Lightweight running shoes with a cushioned sole and a breathable upper. Comfortable for daily runs and long walks.',
    },
    {
        name: 'Classic Sneakers',
        category: 'Shoes',
        price: 980,
        quantity: 30,
        image: 'classic-sneakers.png',
        description: 'Timeless low-top sneakers in a clean cream finish. Easy to match with any outfit, from jeans to shorts.',
    },
    {
        name: 'Leather Sandals',
        category: 'Shoes',
        price: 450,
        quantity: 40,
        image: 'leather-sandals.png',
        description: 'Soft leather slides with a contoured footbed. Cool and comfortable for hot summer days.',
    },
    {
        name: 'Canvas Backpack',
        category: 'Bags',
        price: 680,
        quantity: 18,
        image: 'canvas-backpack.png',
        description: 'Durable canvas backpack with a roomy main compartment, a front pocket and padded shoulder straps.',
    },
    {
        name: 'Leather Handbag',
        category: 'Bags',
        price: 1450,
        quantity: 12,
        image: 'leather-handbag.png',
        description: 'Elegant handbag with a magnetic flap closure and a sturdy top handle. Fits a phone, wallet and daily essentials.',
    },
    {
        name: 'Travel Duffel Bag',
        category: 'Bags',
        price: 890,
        quantity: 15,
        image: 'travel-duffel.png',
        description: 'Spacious duffel bag for trips and the gym, with a zipped top, an outer pocket and a strong carry handle.',
    },
    {
        name: 'Classic Watch',
        category: 'Accessories',
        price: 1800,
        quantity: 10,
        image: 'classic-watch.png',
        description: 'Analog watch with a gold-tone case, a clean white dial and a dark leather strap.',
    },
    {
        name: 'Sunglasses',
        category: 'Accessories',
        price: 350,
        quantity: 35,
        image: 'sunglasses.png',
        description: 'Stylish sunglasses with dark lenses and a lightweight frame for everyday use.',
    },
    {
        name: 'Leather Wallet',
        category: 'Accessories',
        price: 299,
        quantity: 4,
        image: 'leather-wallet.png',
        description: 'Slim wallet in brown leather with card slots, a bill compartment and a snap closure.',
    },
    {
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 1100,
        quantity: 20,
        image: 'wireless-headphones.png',
        description: 'Over-ear wireless headphones with soft ear cushions, deep sound and long battery life.',
    },
    {
        name: 'Portable Speaker',
        category: 'Electronics',
        price: 760,
        quantity: 14,
        image: 'portable-speaker.png',
        description: 'Compact Bluetooth speaker with clear sound, easy controls and a handy carry loop.',
    },
    {
        name: 'Power Bank 10000mAh',
        category: 'Electronics',
        price: 420,
        quantity: 0,
        image: 'power-bank.png',
        description: 'Slim 10000mAh power bank with a four-light charge indicator. Keeps your phone charged all day.',
    },
];

async function seedData() {
    fs.mkdirSync(uploadsDir, { recursive: true });

    const db = await getDb();
    const categoriesCollection = db.collection('categories');
    const itemsCollection = db.collection('items');

    const categoryIds = {};
    let addedCategories = 0;

    for (const name of categories) {
        let category = await categoriesCollection.findOne({ $or: [{ 'name.en': name }, { name: name }] });
        if (!category) {
            const result = await categoriesCollection.insertOne({ name: { ar: translations.categories[name], en: name } });
            category = { _id: result.insertedId };
            addedCategories++;
        }
        categoryIds[name] = category._id;
    }

    let addedItems = 0;

    for (const item of items) {
        const exists = await itemsCollection.findOne({ $or: [{ 'name.en': item.name }, { name: item.name }] });
        if (exists) {
            continue;
        }

        const fileName = 'seed-' + item.image;
        fs.copyFileSync(path.join(imagesDir, item.image), path.join(uploadsDir, fileName));

        await itemsCollection.insertOne({
            name: { ar: translations.items[item.name].name, en: item.name },
            description: { ar: translations.items[item.name].description, en: item.description },
            price: item.price,
            quantity: item.quantity,
            image: 'img/uploads/' + fileName,
            categoryId: categoryIds[item.category],
            createdAt: new Date(),
        });
        addedItems++;
    }

    console.log('Categories added: ' + addedCategories + ', items added: ' + addedItems);
}

seedData()
    .catch((error) => console.log('Seed error:', error.message))
    .finally(() => closeDb());
