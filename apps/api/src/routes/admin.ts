import { Router } from 'express';
import {
  getPendingApprovals,
  approveProject,
  rejectProject,
  requestInfo,
  listUsers,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require JWT + OWNER role
router.use(authenticateToken, requireRole(['OWNER']));

// GET  /api/admin/pending-approvals
router.get('/pending-approvals', getPendingApprovals);

// POST /api/admin/approve-project/:id
router.post('/approve-project/:id', approveProject);

// POST /api/admin/reject-project/:id
router.post('/reject-project/:id', rejectProject);

// POST /api/admin/request-info/:id
router.post('/request-info/:id', requestInfo);

// GET  /api/admin/users
router.get('/users', listUsers);

export default router;
