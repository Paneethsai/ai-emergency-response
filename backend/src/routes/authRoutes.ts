import { Router } from 'express';
import { loginOrRegister, devLogin } from '../controllers/authController';

const router = Router();

router.post('/login', loginOrRegister);
router.post('/dev-login', devLogin);

export default router;
