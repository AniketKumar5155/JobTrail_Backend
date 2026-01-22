const validateId = (id) => {
    if(!id || isNaN(id) || parseInt(id) <= 0) {
        throw new Error('Invalid ID');
    }
}

module.exports = validateId;