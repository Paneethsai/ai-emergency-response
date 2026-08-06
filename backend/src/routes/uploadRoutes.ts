import { Router } from 'express';
import { upload } from '../config/cloudinary';
import { uploadFile } from '../controllers/uploadController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', upload.single('file'), uploadFile);

export default router;
