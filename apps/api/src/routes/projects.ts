import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectMessages,
  sendProjectMessage,
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

router.get('/:id/messages', getProjectMessages);
router.post('/:id/messages', sendProjectMessage);

export default router;
