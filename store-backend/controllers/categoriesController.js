const categoriesModel = require('../models/categoriesModel');
const itemsModel = require('../models/itemsModel');
const { isValidId } = require('../utils/validators');
const { readLocalized, localizeCategory } = require('../utils/i18n');

async function getCategories(req, res) {
    try {
        const categories = await categoriesModel.getAll();
        res.json(categories.map(localizeCategory));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function getCategory(req, res) {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const category = await categoriesModel.getById(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(localizeCategory(category));
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function createCategory(req, res) {
    try {
        const { value: name, error } = readLocalized(req.body, 'name', 'Category name', 60);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const result = await categoriesModel.create(name);

        res.status(201).json({ _id: result.insertedId, name });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const { value: name, error } = readLocalized(req.body, 'name', 'Category name', 60);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const result = await categoriesModel.update(id, name);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Updated' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return res.status(400).json({ message: 'Invalid category id' });
        }

        const itemsCount = await itemsModel.countByCategory(id);
        if (itemsCount > 0) {
            return res.status(400).json({ message: 'Category still has items' });
        }

        const result = await categoriesModel.remove(id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Deleted' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
};
