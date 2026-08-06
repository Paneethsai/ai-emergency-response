import { Router } from 'express';
import { getAllUsers, updateUserProfile } from '../controllers/userController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, authorize('Admin'), getAllUsers);
router.put('/profile', protect, updateUserProfile);

export default router;
