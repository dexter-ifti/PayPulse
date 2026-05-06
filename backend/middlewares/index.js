const {authMiddleware} = require('./authMiddleware');

const {turnstileMiddleware} = require('./turnstileMiddleware');

module.exports = {
    authMiddleware,
    turnstileMiddleware
}
