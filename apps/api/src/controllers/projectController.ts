import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { sanitizeUser } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * GET /api/projects
 * Clients see their own projects; staff/owner see all.
 */
export async function listProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { role, userId } = req.user!;

    const where =
      role === 'CLIENT'
        ? { submittedById: userId }
        : {};

    const projects = await prisma.project.findMany({
      where,
      include: {
        submittedBy: { select: { id: true, name: true, email: true, clientProfile: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        assignedWorker: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

/**
 * GET /api/projects/:id
 * Get a single project. Clients can only see their own.
 */
export async function getProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { id: true, name: true, email: true, clientProfile: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        assignedWorker: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Clients may only access their own projects
    if (role === 'CLIENT' && project.submittedById !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
}

/**
 * POST /api/projects
 * Client submits a new project (starts in SUBMITTED status).
 */
export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.user!;

    const { title, description, category, tier, priority, budget, deadline, deliverables } =
      req.body as {
        title: string;
        description: string;
        category: string;
        tier?: string;
        priority?: string;
        budget?: number;
        deadline?: string;
        deliverables?: string;
      };

    if (!title || !description || !category) {
      res.status(400).json({ error: 'title, description, and category are required' });
      return;
    }

    // Load client profile to check free project eligibility
    const clientProfile = await prisma.clientProfile.findUnique({ where: { userId } });

    const isFree = clientProfile
      ? clientProfile.freeProjectsUsed < clientProfile.freeProjectsLimit ||
        (tier ?? 'STANDARD') === 'SIMPLE'
      : false;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        tier: (tier ?? 'STANDARD') as 'SIMPLE' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE',
        priority: (priority ?? 'NORMAL') as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
        status: 'SUBMITTED',
        isFree,
        submittedAt: new Date(),
        submittedById: userId,
        budget: budget ? Number(budget) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        deliverables,
      },
    });

    // Increment free project counter if applicable
    if (isFree && clientProfile && (tier ?? 'STANDARD') !== 'SIMPLE') {
      await prisma.clientProfile.update({
        where: { userId },
        data: { freeProjectsUsed: { increment: 1 } },
      });
    }

    // Notify owner/management
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['OWNER', 'MANAGEMENT'] } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: staffUsers.map((staff) => ({
        type: 'PROJECT_SUBMITTED' as const,
        title: 'New Project Submitted',
        message: `Project "${title}" has been submitted and is awaiting approval.`,
        userId: staff.id,
        projectId: project.id,
      })),
    });

    res.status(201).json({ message: 'Project submitted successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * PATCH /api/projects/:id
 * Update a project (client can update own DRAFT projects; staff can update any).
 */
export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (role === 'CLIENT') {
      if (existing.submittedById !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      if (existing.status !== 'DRAFT') {
        res.status(400).json({ error: 'Only DRAFT projects can be edited' });
        return;
      }
    }

    const { title, description, category, tier, priority, budget, deadline, deliverables } = req.body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(tier && { tier }),
        ...(priority && { priority }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(deliverables && { deliverables }),
      },
    });

    res.json({ message: 'Project updated', project: updated });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * DELETE /api/projects/:id
 * Only OWNER or the submitting client (on DRAFT) can delete.
 */
export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (
      role !== 'OWNER' &&
      !(role === 'CLIENT' && existing.submittedById === userId && existing.status === 'DRAFT')
    ) {
      res.status(403).json({ error: 'Not allowed to delete this project' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

/**
 * GET /api/projects/:id/messages
 * Get all (non-internal) messages for a project.
 */
export async function getProjectMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, userId } = req.user!;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (role === 'CLIENT' && project.submittedById !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        projectId: id,
        // Clients only see external messages
        ...(role === 'CLIENT' && { isInternal: false }),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

/**
 * POST /api/projects/:id/messages
 * Send a message on a project thread.
 */
export async function sendProjectMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;
    const { content, receiverId, isInternal } = req.body as {
      content: string;
      receiverId: string;
      isInternal?: boolean;
    };

    if (!content || !receiverId) {
      res.status(400).json({ error: 'content and receiverId are required' });
      return;
    }

    // Clients cannot send internal messages
    const internal = role !== 'CLIENT' && Boolean(isInternal);

    const message = await prisma.message.create({
      data: {
        content,
        isInternal: internal,
        senderId: userId,
        receiverId,
        projectId: id,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify the receiver
    await prisma.notification.create({
      data: {
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        message: `You have a new message on project #${id}`,
        userId: receiverId,
        projectId: id,
      },
    });

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

// Re-export for use in routes without name collision
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.user!;
  const users = await prisma.user.findMany({
    where: role === 'OWNER' ? {} : { role: 'CLIENT' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ users });
};
