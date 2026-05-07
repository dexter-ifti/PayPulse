const express = require('express');
const router = express.Router();
const { authMiddleware, turnstileMiddleware } = require('../middlewares');
const { userController } = require('../controllers');

// User routes
router.post('/signup', turnstileMiddleware, userController.signup);
router.post('/signin', turnstileMiddleware, userController.signin);
router.post('/logout', authMiddleware, userController.logoutUser);
router.post('/refresh-token', authMiddleware, userController.refreshAccessToken);
router.get('/current-user', authMiddleware, userController.getCurrentUser);
router.put('/', authMiddleware, userController.updateUser);
router.get('/bulk', authMiddleware, userController.bulkSearch);

module.exports = router;