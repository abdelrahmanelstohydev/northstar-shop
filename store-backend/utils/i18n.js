const LANGUAGES = ['ar', 'en'];

// Turns legacy plain-string values into { ar, en } so old documents keep working.
function toLocalized(value) {
    if (value && typeof value === 'object') {
        const ar = typeof value.ar === 'string' ? value.ar : '';
        const en = typeof value.en === 'string' ? value.en : '';
        return { ar: ar || en, en: en || ar };
    }
    const text = typeof value === 'string' ? value : '';
    return { ar: text, en: text };
}

// Reads a required { ar, en } value. Accepts:
//   - an object:            body.name = { ar: '..', en: '..' }
//   - flat fields:          body.name_ar, body.name_en  (used by multipart forms)
// Returns { value } or { error }.
function readLocalized(body, field, label, maxLength) {
    const source = body || {};
    const value = {};

    for (const lang of LANGUAGES) {
        let text;
        if (source[field] && typeof source[field] === 'object') {
            text = source[field][lang];
        } else {
            text = source[field + '_' + lang];
        }

        if (typeof text !== 'string' || !text.trim()) {
            return { error: label + ' is required in ' + (lang === 'ar' ? 'Arabic' : 'English') };
        }
        if (maxLength && text.trim().length > maxLength) {
            return { error: label + ' must be ' + maxLength + ' characters or less' };
        }
        value[lang] = text.trim();
    }

    return { value };
}

function localizeItem(item) {
    return { ...item, name: toLocalized(item.name), description: toLocalized(item.description) };
}

function localizeCategory(category) {
    return { ...category, name: toLocalized(category.name) };
}

function localizeOrder(order) {
    // payToken is a secret that only the customer's browser knows
    const { payToken, ...safe } = order;
    return {
        ...safe,
        items: (order.items || []).map((line) => ({ ...line, name: toLocalized(line.name) })),
    };
}

module.exports = {
    LANGUAGES,
    toLocalized,
    readLocalized,
    localizeItem,
    localizeCategory,
    localizeOrder,
};
