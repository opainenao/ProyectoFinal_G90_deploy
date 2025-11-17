import express from 'express';
import { listKits, getKit } from '../controllers/kitsController.js';
const router = express.Router();

router.get('/', listKits);
router.get('/:id', getKit);

export default router;
