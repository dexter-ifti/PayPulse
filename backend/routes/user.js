const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const { userController } = require('../controllers');

// User routes
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.put('/', authMiddleware, userController.updateUser);
router.get('/bulk', userController.bulkSearch);

module.exports = router;