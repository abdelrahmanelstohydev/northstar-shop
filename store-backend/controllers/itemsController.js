const fs = require('fs');
const path = require('path');
const itemsModel = require('../models/itemsModel');
const categoriesModel = require('../models/categoriesModel');
const { isValidId } = require('../utils/validators');
const { readLocalized, localizeItem } = require('../utils/i18n');

function toPublic(item) {
    const { quantity, ...publicItem } = localizeItem(item);
    return publicItem;
}

function deleteImageFile(image) {
    if (!image) return;
    fs.unlink(path.join(__dirname, '..', 'public', image), () => {});
}

function readItemData(body) {
    const { price, quantity, categoryId } = body || {};

    const name = readLocalized(body, 'name', 'Item name');
    if (name.error) {
        return { error: name.error };
    }
    const description = readLocalized(body, 'description', 'Item description');
    if (description.error) {
        return { error: description.error };
    }

    const priceNumber = Number(price);
    if (price === undefined || String(price).trim() === '' || !Number.isFinite(priceNumber) || priceNumber < 0) {
        return { error: 'Price must be a number greater than or equal to 0' };
    }

    const quantityNumber = Number(quantity);
    if (quantity === undefined || String(quantity).trim() === '' || !Number.isInteger(quantityNumber) || quantityNumber < 0) {
        return { error: 'Quantity must be a whole number greater than or equal to 0' };
    }

    if (!isValidId(categoryId)) {
        return { error: 'A valid categoryId is required' };
    }

    return {
        data: {
            name: name.value,
            description: description.value,
            price: priceNumber,
            quantity: quantityNumber,
            categoryId: categoryId,
        },
    };
}

async function getPublicItems(req, res) {
    try {
        const { category } = req.query;
        let items;

        if (category) {
            if (!isValidId(category)) {
                return res.status(400).json({ message: 'Invalid category id' });
            }
            items = await itemsModel.getByCategory(category);
        } else {
            items = await itemsModel.getAll();
        }

        res.json(items.map(toPublic));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getPublicItem(req, res) {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid item id' });
        }

        const item = await itemsModel.getById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(toPublic(item));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getPublicItemsByIds(req, res) {
    try {
        const { ids } = req.body || {};

        if (!Array.isArray(ids) || ids.length > 100 || !ids.every(isValidId)) {
            return res.status(400).json({ message: 'ids must be an array of valid item ids' });
        }
        if (ids.length === 0) {
            return res.json([]);
        }

        const items = await itemsModel.getByIds(ids);
        res.json(items.map(toPublic));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getAllItems(req, res) {
    try {
        const { category } = req.query;
        let items;

        if (category) {
            if (!isValidId(category)) {
                return res.status(400).json({ message: 'Invalid category id' });
            }
            items = await itemsModel.getByCategory(category);
        } else {
            items = await itemsModel.getAll();
        }

        res.json(items.map(localizeItem));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function createItem(req, res) {
    const uploadedImage = req.file ? 'img/uploads/' + req.file.filename : '';

    try {
        const { data, error } = readItemData(req.body);
        if (error) {
            deleteImageFile(uploadedImage);
            return res.status(400).json({ message: error });
        }

        const category = await categoriesModel.getById(data.categoryId);
        if (!category) {
            deleteImageFile(uploadedImage);
            return res.status(400).json({ message: 'Category does not exist' });
        }

        data.image = uploadedImage;
        const result = await itemsModel.create(data);

        res.status(201).json({ _id: result.insertedId, ...data });
    } catch (error) {
        deleteImageFile(uploadedImage);
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function updateItem(req, res) {
    const uploadedImage = req.file ? 'img/uploads/' + req.file.filename : '';

    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            deleteImageFile(uploadedImage);
            return res.status(400).json({ message: 'Invalid item id' });
        }

        const { data, error } = readItemData(req.body);
        if (error) {
            deleteImageFile(uploadedImage);
            return res.status(400).json({ message: error });
        }

        const existing = await itemsModel.getById(id);
        if (!existing) {
            deleteImageFile(uploadedImage);
            return res.status(404).json({ message: 'Item not found' });
        }

        const category = await categoriesModel.getById(data.categoryId);
        if (!category) {
            deleteImageFile(uploadedImage);
            return res.status(400).json({ message: 'Category does not exist' });
        }

        if (uploadedImage) {
            data.image = uploadedImage;
        }

        const result = await itemsModel.update(id, data);
        if (result.matchedCount === 0) {
            deleteImageFile(uploadedImage);
            return res.status(404).json({ message: 'Item not found' });
        }

        if (uploadedImage) {
            deleteImageFile(existing.image);
        }

        res.json({ message: 'Updated' });
    } catch (error) {
        deleteImageFile(uploadedImage);
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function deleteItem(req, res) {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid item id' });
        }

        const item = await itemsModel.getById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await itemsModel.remove(id);
        deleteImageFile(item.image);

        res.json({ message: 'Deleted' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getPublicItems,
    getPublicItem,
    getPublicItemsByIds,
    getAllItems,
    createItem,
    updateItem,
    deleteItem,
};
