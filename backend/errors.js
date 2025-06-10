// backend/errors.js

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400; // HTTP status code for bad requests
    }
}

module.exports = {
    BadRequestError
};
