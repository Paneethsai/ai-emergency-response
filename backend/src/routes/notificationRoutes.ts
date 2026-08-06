import { Router } from 'express';
import { getUserNotifications, markAsRead } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);
router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);

export default router;
