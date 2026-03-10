import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { sanitizeUser } from '../utils/helpers';

const router = Router();
const prisma = new PrismaClient();

// All user routes require authentication
router.use(authenticateToken);

/**
 * GET /api/users
 * OWNER/MANAGEMENT can list all users; others get 403.
 */
router.get('/', requireRole(['OWNER', 'MANAGEMENT']), async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    include: { clientProfile: true, workerProfile: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users: users.map(sanitizeUser) });
});

/**
 * GET /api/users/workers
 * List available workers (for assignment).
 */
router.get('/workers', requireRole(['OWNER', 'MANAGEMENT']), async (_req, res: Response) => {
  const workers = await prisma.user.findMany({
    where: { role: 'WORKER' },
    include: { workerProfile: true },
  });
  res.json({ workers: workers.map(sanitizeUser) });
});

/**
 * GET /api/users/:id
 * Get user by ID (OWNER only, or the user themselves).
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user!;

  if (role !== 'OWNER' && userId !== id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { clientProfile: true, workerProfile: true, managementProfile: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: sanitizeUser(user) });
});

/**
 * PATCH /api/users/:id
 * Update name or profile (user themselves, or OWNER).
 */
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user!;

  if (role !== 'OWNER' && userId !== id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { name } = req.body as { name?: string };

  const updated = await prisma.user.update({
    where: { id },
    data: { ...(name && { name }) },
  });

  res.json({ user: sanitizeUser(updated) });
});

export default router;
