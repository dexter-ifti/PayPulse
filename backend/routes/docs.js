const express = require('express');
const { docsController } = require('../controllers');

const router = express.Router();

router.get('/', docsController.getDocsPage);
router.get('/openapi.json', docsController.getOpenApiJson);

module.exports = router;
