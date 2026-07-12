const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/upload.controller');

const router = express.Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload an image (base64) — returns a served URL
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth(['admin', 'superadmin']), controller.uploadImage);

module.exports = router;
