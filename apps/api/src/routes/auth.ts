import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me — requires valid JWT
router.get('/me', authenticateToken, getMe);

export default router;
