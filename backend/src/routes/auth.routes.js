const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
router.post('/register', controller.register);

/**
 * @swagger
 * /auth/status/{id}:
 *   put:
 *     summary: Toggle user status (Superadmin only)
 *     tags: [Auth]
 */
router.put('/status/:id', auth(['superadmin']), controller.toggleUserStatus);

/**
 * @swagger
 * /auth/approve-admin/{id}:
 *   put:
 *     summary: Approve pending admin (Superadmin only)
 *     tags: [Auth]
 */
router.put('/approve-admin/:id', auth(['superadmin']), controller.approveAdmin);

/**
 * @swagger
 * /auth/pending-admins:
 *   get:
 *     summary: List all pending admin requests (Superadmin only)
 *     tags: [Auth]
 */
router.get('/pending-admins', auth(['superadmin']), controller.listPendingAdmins);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: List all users (Superadmin only)
 *     tags: [Auth]
 */
router.get('/users', auth(['superadmin']), controller.listUsers);

module.exports = router;
