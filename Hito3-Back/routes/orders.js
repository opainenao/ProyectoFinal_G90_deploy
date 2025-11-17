import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createOrder, getOrder } from '../controllers/ordersController.js';
const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/:id', requireAuth, getOrder);

export default router;
