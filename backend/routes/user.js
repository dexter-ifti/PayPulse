const express = require('express');
const router = express.Router();
const { authMiddleware, turnstileMiddleware, rateLimitPolicy } = require('../middlewares');
const { userController } = require('../controllers');

// User routes
router.post('/signup', rateLimitPolicy('auth'), turnstileMiddleware, userController.signup);
router.post('/signin', rateLimitPolicy('auth'), turnstileMiddleware, userController.signin);
router.post('/logout', authMiddleware, userController.logoutUser);
router.post('/refresh-token', authMiddleware, rateLimitPolicy('tokenRefresh'), userController.refreshAccessToken);
router.get('/current-user', authMiddleware, userController.getCurrentUser);
router.put('/', authMiddleware, userController.updateUser);
router.get('/bulk', authMiddleware, rateLimitPolicy('userSearch'), userController.bulkSearch);

module.exports = router;
