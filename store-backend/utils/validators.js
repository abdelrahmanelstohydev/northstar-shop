const { ObjectId } = require('../models/mongodbConnection');

function isValidId(id) {
    return typeof id === 'string' && ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id);
}

module.exports = {
    isValidId,
};
