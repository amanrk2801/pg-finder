const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/leave.controller');

const router = express.Router();

/**
 * @swagger
 * /leaves:
 *   post:
 *     summary: Request leave
 *     tags: [Leaves]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), controller.createLeave);

/**
 * @swagger
 * /leaves/me:
 *   get:
 *     summary: Get user leave requests
 *     tags: [Leaves]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), controller.listMyLeaves);

/**
 * @swagger
 * /leaves/pg/{pgId}:
 *   get:
 *     summary: List leave requests for a PG
 *     tags: [Leaves]
 */
router.get('/pg/:pgId', auth(['admin', 'superadmin']), controller.listLeavesByPg);

/**
 * @swagger
 * /leaves/owner:
 *   get:
 *     summary: List leave requests across PGs owned by the logged-in admin (or all, for superadmin)
 *     tags: [Leaves]
 */
router.get('/owner', auth(['admin', 'superadmin']), controller.listOwnerLeaves);

/**
 * @swagger
 * /leaves/{id}:
 *   put:
 *     summary: Update leave status
 *     tags: [Leaves]
 */
router.put('/:id', auth(['admin', 'superadmin']), controller.updateLeaveStatus);

module.exports = router;
